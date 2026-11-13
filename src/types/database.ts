// PaperTrail — Database type definitions
// These types mirror the Supabase PostgreSQL schema.

export type ApplicationStatus =
  | "planning"
  | "preparing_documents"
  | "ready_to_apply"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected";

export type DegreeLevel =
  | "undergraduate"
  | "postgraduate"
  | "doctorate"
  | "diploma"
  | "certificate"
  | "other";

// ── Profiles ──────────────────────────────────────────────
export interface Profile {
  id: string; // references auth.users.id
  full_name: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

// ── Applications ──────────────────────────────────────────
export interface Application {
  id: string;
  user_id: string;
  university_name: string;
  country: string;
  program_name: string;
  degree_level: DegreeLevel;
  intake_semester: string;
  deadline: string | null;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationInsert {
  university_name: string;
  country: string;
  program_name: string;
  degree_level: DegreeLevel;
  intake_semester: string;
  deadline?: string | null;
  status?: ApplicationStatus;
  notes?: string | null;
}

export interface ApplicationUpdate {
  university_name?: string;
  country?: string;
  program_name?: string;
  degree_level?: DegreeLevel;
  intake_semester?: string;
  deadline?: string | null;
  status?: ApplicationStatus;
  notes?: string | null;
}

// ── Document Requirements ─────────────────────────────────
export interface DocumentRequirement {
  id: string;
  application_id: string;
  name: string;
  description: string | null;
  is_required: boolean;
  is_completed: boolean;
  display_order: number;
  created_at: string;
}

export interface DocumentRequirementInsert {
  application_id: string;
  name: string;
  description?: string | null;
  is_required?: boolean;
  display_order?: number;
}

export interface DocumentRequirementUpdate {
  name?: string;
  description?: string | null;
  is_required?: boolean;
  is_completed?: boolean;
  display_order?: number;
}

// ── Uploaded Documents ────────────────────────────────────
export interface UploadedDocument {
  id: string;
  application_id: string;
  requirement_id: string | null;
  user_id: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface UploadedDocumentInsert {
  application_id: string;
  requirement_id?: string | null;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
}

// ── Application with computed progress ────────────────────
export interface ApplicationWithProgress extends Application {
  total_required: number;
  completed_required: number;
  total_optional: number;
  completed_optional: number;
}

// ── Document requirement with uploaded document ───────────
export interface RequirementWithDocument extends DocumentRequirement {
  uploaded_document: UploadedDocument | null;
}

// ── Template for default document sets ────────────────────
export interface DocumentTemplate {
  name: string;
  description: string;
  is_required: boolean;
}

export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    name: "Passport",
    description: "Valid international passport bio-data page (PDF or image).",
    is_required: true,
  },
  {
    name: "Academic Transcript",
    description:
      "Official consolidated transcript from your most recent institution.",
    is_required: true,
  },
  {
    name: "Marksheet / Grade Sheet",
    description: "Final statement of marks issued by your examination board.",
    is_required: true,
  },
  {
    name: "English Proficiency Certificate",
    description:
      "IELTS, TOEFL, or equivalent test report showing overall and band scores.",
    is_required: true,
  },
  {
    name: "Statement of Purpose",
    description:
      "Personal essay explaining your academic goals and reasons for applying.",
    is_required: true,
  },
  {
    name: "Letters of Recommendation",
    description:
      "Academic or professional recommendation letters (usually 2–3 required).",
    is_required: true,
  },
  {
    name: "CV / Resume",
    description:
      "Current curriculum vitae summarizing education, experience and achievements.",
    is_required: false,
  },
  {
    name: "Passport-size Photograph",
    description:
      "Recent color passport-format portrait with a solid neutral background.",
    is_required: false,
  },
  {
    name: "Financial Documents",
    description:
      "Bank statements or sponsorship letters proving financial capability.",
    is_required: false,
  },
];
