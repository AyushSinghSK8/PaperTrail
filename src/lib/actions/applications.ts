"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Application,
  ApplicationInsert,
  ApplicationUpdate,
  ApplicationWithProgress,
} from "@/types/database";
import { DEFAULT_DOCUMENT_TEMPLATES } from "@/types/database";

export async function getApplications(): Promise<ApplicationWithProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Fetch applications for current user
  const { data: apps, error: appsError } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (appsError || !apps) {
    console.error("Error fetching applications:", appsError);
    return [];
  }

  if (apps.length === 0) {
    return [];
  }

  // Fetch all requirements for these applications to calculate progress
  const appIds = apps.map((a) => a.id);
  const { data: reqs, error: reqsError } = await supabase
    .from("document_requirements")
    .select("application_id, is_required, is_completed")
    .in("application_id", appIds);

  if (reqsError) {
    console.error("Error fetching requirements for progress:", reqsError);
  }

  const reqsByApp: Record<string, Array<{ application_id: string; is_required: boolean; is_completed: boolean }>> = {};
  (reqs || []).forEach((r: { application_id: string; is_required: boolean; is_completed: boolean }) => {
    if (!reqsByApp[r.application_id]) {
      reqsByApp[r.application_id] = [];
    }
    reqsByApp[r.application_id].push(r);
  });

  return apps.map((app) => {
    const appReqs = reqsByApp[app.id] || [];
    const requiredReqs = appReqs.filter((r) => r.is_required);
    const optionalReqs = appReqs.filter((r) => !r.is_required);

    return {
      ...app,
      total_required: requiredReqs.length,
      completed_required: requiredReqs.filter((r) => r.is_completed).length,
      total_optional: optionalReqs.length,
      completed_optional: optionalReqs.filter((r) => r.is_completed).length,
    };
  });
}

export async function getApplication(id: string): Promise<Application | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function createApplication(data: ApplicationInsert): Promise<{ success: boolean; application?: Application; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to create an application." };
  }

  // Insert application
  const { data: newApp, error: appError } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      university_name: data.university_name,
      country: data.country,
      program_name: data.program_name,
      degree_level: data.degree_level,
      intake_semester: data.intake_semester,
      deadline: data.deadline || null,
      status: data.status || "planning",
      notes: data.notes || null,
    })
    .select()
    .single();

  if (appError || !newApp) {
    console.error("Error creating application:", appError);
    return { success: false, error: appError?.message || "Failed to create application." };
  }

  // Pre-populate with default document templates
  const templateRequirements = DEFAULT_DOCUMENT_TEMPLATES.map((tmpl, idx) => ({
    application_id: newApp.id,
    name: tmpl.name,
    description: tmpl.description,
    is_required: tmpl.is_required,
    is_completed: false,
    display_order: idx + 1,
  }));

  const { error: reqsError } = await supabase
    .from("document_requirements")
    .insert(templateRequirements);

  if (reqsError) {
    console.error("Error inserting default requirements:", reqsError);
  }

  revalidatePath("/dashboard");
  return { success: true, application: newApp };
}

export async function updateApplication(
  id: string,
  data: ApplicationUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authorized." };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${id}`);
  return { success: true };
}

export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authorized." };
  }

  // First fetch any uploaded documents to clean up files in storage
  const { data: uploadedDocs } = await supabase
    .from("uploaded_documents")
    .select("storage_path")
    .eq("application_id", id)
    .eq("user_id", user.id);

  if (uploadedDocs && uploadedDocs.length > 0) {
    const paths = uploadedDocs.map((d) => d.storage_path);
    await supabase.storage.from("application-documents").remove(paths);
  }

  // Delete application record (database CASCADE deletes requirements and uploaded_documents)
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
