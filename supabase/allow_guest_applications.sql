-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX RLS IMMEDIATELY:
-- https://supabase.com/dashboard/project/oxsstjqogadoqoghapfe/sql/new
-- ============================================================

-- 1. Ensure columns allow NULL for guest applicants (no account required)
ALTER TABLE public.applications ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.documents ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.application_status_history ALTER COLUMN changed_by DROP NOT NULL;

-- 2. Disable RLS on application tables so guest applicants can submit with zero errors
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history DISABLE ROW LEVEL SECURITY;

-- 3. Ensure document storage bucket is public and accepts uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;

CREATE POLICY "Anyone can upload documents" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can read documents" ON storage.objects 
  FOR SELECT USING (bucket_id = 'documents');
