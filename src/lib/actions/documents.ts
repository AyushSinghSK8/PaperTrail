"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  DocumentRequirement,
  DocumentRequirementInsert,
  DocumentRequirementUpdate,
  RequirementWithDocument,
  UploadedDocument,
} from "@/types/database";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export async function getRequirementsWithDocuments(
  applicationId: string
): Promise<RequirementWithDocument[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Verify application ownership
  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (!app) {
    return [];
  }

  // Fetch requirements
  const { data: reqs, error: reqsError } = await supabase
    .from("document_requirements")
    .select("*")
    .eq("application_id", applicationId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (reqsError || !reqs) {
    console.error("Error fetching requirements:", reqsError);
    return [];
  }

  // Fetch uploaded documents for this application
  const { data: docs, error: docsError } = await supabase
    .from("uploaded_documents")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", user.id);

  if (docsError) {
    console.error("Error fetching uploaded docs:", docsError);
  }

  const docsByReqId: Record<string, UploadedDocument> = {};
  (docs || []).forEach((d: UploadedDocument) => {
    if (d.requirement_id) {
      docsByReqId[d.requirement_id] = d;
    }
  });

  return reqs.map((req) => ({
    ...req,
    uploaded_document: docsByReqId[req.id] || null,
  }));
}

export async function addRequirement(
  data: DocumentRequirementInsert
): Promise<{ success: boolean; requirement?: DocumentRequirement; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authorized." };
  }

  // Verify application ownership
  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("id", data.application_id)
    .eq("user_id", user.id)
    .single();

  if (!app) {
    return { success: false, error: "Application not found or unauthorized." };
  }

  const { data: newReq, error } = await supabase
    .from("document_requirements")
    .insert({
      application_id: data.application_id,
      name: data.name,
      description: data.description || null,
      is_required: data.is_required !== undefined ? data.is_required : true,
      display_order: data.display_order || 0,
      is_completed: false,
    })
    .select()
    .single();

  if (error || !newReq) {
    return { success: false, error: error?.message || "Failed to add requirement." };
  }

  revalidatePath(`/applications/${data.application_id}`);
  return { success: true, requirement: newReq };
}

export async function updateRequirement(
  id: string,
  applicationId: string,
  data: DocumentRequirementUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authorized." };
  }

  const { error } = await supabase
    .from("document_requirements")
    .update(data)
    .eq("id", id)
    .eq("application_id", applicationId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/applications/${applicationId}`);
  return { success: true };
}

export async function deleteRequirement(
  id: string,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authorized." };
  }

  // Find any uploaded document associated with this requirement
  const { data: doc } = await supabase
    .from("uploaded_documents")
    .select("id, storage_path")
    .eq("requirement_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (doc) {
    await supabase.storage.from("application-documents").remove([doc.storage_path]);
    await supabase.from("uploaded_documents").delete().eq("id", doc.id);
  }

  const { error } = await supabase
    .from("document_requirements")
    .delete()
    .eq("id", id)
    .eq("application_id", applicationId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadDocument(
  formData: FormData
): Promise<{ success: boolean; document?: UploadedDocument; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to upload documents." };
  }

  const file = formData.get("file") as File | null;
  const applicationId = formData.get("applicationId") as string | null;
  const requirementId = formData.get("requirementId") as string | null;

  if (!file || !applicationId) {
    return { success: false, error: "Missing required file or application ID." };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Unsupported file type (${file.type}). Allowed types are PDF, JPEG, and PNG.`,
    };
  }

  // Verify application ownership
  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (!app) {
    return { success: false, error: "Application not found or unauthorized." };
  }

  // Check if an existing document was uploaded for this requirement
  if (requirementId) {
    const { data: existingDoc } = await supabase
      .from("uploaded_documents")
      .select("id, storage_path")
      .eq("requirement_id", requirementId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingDoc) {
      // Remove old file from storage and delete old DB row
      await supabase.storage
        .from("application-documents")
        .remove([existingDoc.storage_path]);
      await supabase
        .from("uploaded_documents")
        .delete()
        .eq("id", existingDoc.id);
    }
  }

  // Generate safe storage path: userId/applicationId/timestamp_filename
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.id}/${applicationId}/${Date.now()}_${cleanFileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("application-documents")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { success: false, error: `Upload failed: ${uploadError.message}` };
  }

  // Insert metadata record in PostgreSQL
  const { data: docRecord, error: dbError } = await supabase
    .from("uploaded_documents")
    .insert({
      application_id: applicationId,
      requirement_id: requirementId || null,
      user_id: user.id,
      original_filename: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbError || !docRecord) {
    console.error("Database insert error after upload:", dbError);
    // Cleanup orphaned storage file
    await supabase.storage.from("application-documents").remove([storagePath]);
    return { success: false, error: "Failed to record document metadata." };
  }

  // Update requirement is_completed flag
  if (requirementId) {
    await supabase
      .from("document_requirements")
      .update({ is_completed: true })
      .eq("id", requirementId)
      .eq("application_id", applicationId);
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");

  return { success: true, document: docRecord };
}

export async function deleteDocument(
  documentId: string,
  applicationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authorized." };
  }

  // Fetch document record
  const { data: doc, error: fetchError } = await supabase
    .from("uploaded_documents")
    .select("id, requirement_id, storage_path, user_id")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !doc) {
    return { success: false, error: "Document not found or unauthorized." };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("application-documents")
    .remove([doc.storage_path]);

  if (storageError) {
    console.warn("Storage removal warning:", storageError);
  }

  // Delete database record
  const { error: dbError } = await supabase
    .from("uploaded_documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  // Reset requirement is_completed flag
  if (doc.requirement_id) {
    await supabase
      .from("document_requirements")
      .update({ is_completed: false })
      .eq("id", doc.requirement_id)
      .eq("application_id", applicationId);
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function getSignedUrl(
  storagePath: string
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authorized." };
  }

  // Security check: ensure path belongs to current user
  if (!storagePath.startsWith(`${user.id}/`)) {
    return { success: false, error: "Unauthorized access to document." };
  }

  const { data, error } = await supabase.storage
    .from("application-documents")
    .createSignedUrl(storagePath, 60); // 60 seconds validity

  if (error || !data?.signedUrl) {
    return { success: false, error: error?.message || "Failed to generate download URL." };
  }

  return { success: true, signedUrl: data.signedUrl };
}
