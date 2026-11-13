-- PaperTrail Database Migration
-- Run this SQL in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ===========================================================================
-- This script is idempotent: safely repeatable on fresh or existing databases
-- without failing, duplicating data, or weakening security.

-- ------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create/sync profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> ''
      THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS policies (Idempotent)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ------------------------------------------------------------------------
-- 2. APPLICATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  university_name   TEXT NOT NULL,
  country           TEXT NOT NULL DEFAULT '',
  program_name      TEXT NOT NULL,
  degree_level      TEXT NOT NULL DEFAULT 'undergraduate'
                      CHECK (degree_level IN ('undergraduate','postgraduate','doctorate','diploma','certificate','other')),
  intake_semester   TEXT NOT NULL DEFAULT '',
  deadline          DATE,
  status            TEXT NOT NULL DEFAULT 'planning'
                      CHECK (status IN ('planning','preparing_documents','ready_to_apply','submitted','under_review','accepted','rejected')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications RLS policies (Idempotent)
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own applications" ON public.applications;
CREATE POLICY "Users can create their own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
CREATE POLICY "Users can update their own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own applications" ON public.applications;
CREATE POLICY "Users can delete their own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------
-- 3. DOCUMENT REQUIREMENTS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_requirements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  is_required     BOOLEAN NOT NULL DEFAULT TRUE,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_reqs_application_id
  ON public.document_requirements(application_id);

ALTER TABLE public.document_requirements ENABLE ROW LEVEL SECURITY;

-- Enforce that application_id is immutable once a requirement is created.
-- This guarantees that existing uploaded_documents cannot be decoupled or
-- cross-linked to another application if a requirement is edited.
CREATE OR REPLACE FUNCTION public.prevent_document_requirement_app_transfer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.application_id IS DISTINCT FROM OLD.application_id THEN
    RAISE EXCEPTION 'application_id on document_requirements is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_doc_req_app_transfer ON public.document_requirements;
CREATE TRIGGER trg_prevent_doc_req_app_transfer
  BEFORE UPDATE ON public.document_requirements
  FOR EACH ROW EXECUTE FUNCTION public.prevent_document_requirement_app_transfer();

-- Document Requirements RLS policies (Idempotent)
DROP POLICY IF EXISTS "Users can view requirements for their applications" ON public.document_requirements;
CREATE POLICY "Users can view requirements for their applications"
  ON public.document_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = document_requirements.application_id
        AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create requirements for their applications" ON public.document_requirements;
CREATE POLICY "Users can create requirements for their applications"
  ON public.document_requirements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = document_requirements.application_id
        AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update requirements for their applications" ON public.document_requirements;
CREATE POLICY "Users can update requirements for their applications"
  ON public.document_requirements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = document_requirements.application_id
        AND applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = document_requirements.application_id
        AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete requirements for their applications" ON public.document_requirements;
CREATE POLICY "Users can delete requirements for their applications"
  ON public.document_requirements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = document_requirements.application_id
        AND applications.user_id = auth.uid()
    )
  );


-- ------------------------------------------------------------------------
-- 4. UPLOADED DOCUMENTS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  requirement_id    UUID REFERENCES public.document_requirements(id) ON DELETE SET NULL,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  storage_path      TEXT NOT NULL,
  mime_type         TEXT NOT NULL,
  file_size         BIGINT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uploaded_docs_application_id
  ON public.uploaded_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_docs_requirement_id
  ON public.uploaded_documents(requirement_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_docs_user_id
  ON public.uploaded_documents(user_id);

-- Enforce cross-application integrity: requirement_id must belong to the same application_id
-- and application_id cannot be transferred across applications.
-- This trigger safely validates that when requirement_id is set, it matches application_id,
-- while allowing ON DELETE SET NULL on requirement_id without affecting NOT NULL application_id.
CREATE OR REPLACE FUNCTION public.validate_uploaded_document_requirement()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.application_id IS DISTINCT FROM OLD.application_id THEN
    RAISE EXCEPTION 'application_id on uploaded_documents is immutable';
  END IF;

  IF NEW.requirement_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.document_requirements
      WHERE id = NEW.requirement_id AND application_id = NEW.application_id
    ) THEN
      RAISE EXCEPTION 'Requirement % does not belong to application %',
        NEW.requirement_id, NEW.application_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_uploaded_doc_req ON public.uploaded_documents;
CREATE TRIGGER trg_validate_uploaded_doc_req
  BEFORE INSERT OR UPDATE ON public.uploaded_documents
  FOR EACH ROW EXECUTE FUNCTION public.validate_uploaded_document_requirement();

ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- Uploaded Documents RLS policies (Idempotent and strictly validated)
DROP POLICY IF EXISTS "Users can view their own uploaded documents" ON public.uploaded_documents;
CREATE POLICY "Users can view their own uploaded documents"
  ON public.uploaded_documents FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = uploaded_documents.application_id
        AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can upload documents to their own applications" ON public.uploaded_documents;
CREATE POLICY "Users can upload documents to their own applications"
  ON public.uploaded_documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = uploaded_documents.application_id
        AND applications.user_id = auth.uid()
    )
    AND (
      uploaded_documents.requirement_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.document_requirements
        WHERE document_requirements.id = uploaded_documents.requirement_id
          AND document_requirements.application_id = uploaded_documents.application_id
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own uploaded documents" ON public.uploaded_documents;
CREATE POLICY "Users can update their own uploaded documents"
  ON public.uploaded_documents FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = uploaded_documents.application_id
        AND applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = uploaded_documents.application_id
        AND applications.user_id = auth.uid()
    )
    AND (
      uploaded_documents.requirement_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.document_requirements
        WHERE document_requirements.id = uploaded_documents.requirement_id
          AND document_requirements.application_id = uploaded_documents.application_id
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete their own uploaded documents" ON public.uploaded_documents;
CREATE POLICY "Users can delete their own uploaded documents"
  ON public.uploaded_documents FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = uploaded_documents.application_id
        AND applications.user_id = auth.uid()
    )
  );


-- ------------------------------------------------------------------------
-- 5. AUTO-UPDATE updated_at TRIGGER
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ------------------------------------------------------------------------
-- 6. STORAGE BUCKET + POLICIES
-- ------------------------------------------------------------------------
-- Ensure the private bucket exists with strict size and format constraints
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents',
  'application-documents',
  FALSE,
  10485760,  -- 10 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- Storage path format: {user_id}/{application_id}/{filename}
-- Ownership-aware storage policies: validates BOTH user ownership AND application ownership.

DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'application-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id::text = (storage.foldername(name))[2]
        AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'application-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id::text = (storage.foldername(name))[2]
        AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'application-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id::text = (storage.foldername(name))[2]
        AND applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'application-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id::text = (storage.foldername(name))[2]
        AND applications.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'application-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id::text = (storage.foldername(name))[2]
        AND applications.user_id = auth.uid()
    )
  );
