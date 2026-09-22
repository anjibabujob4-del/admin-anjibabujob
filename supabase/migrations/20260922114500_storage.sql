-- Insert the 'documents' storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents', 
    'documents', 
    false, 
    5242880, -- 5MB limit
    '{"application/pdf","image/jpeg","image/png"}'
) ON CONFLICT (id) DO UPDATE
SET public = false, file_size_limit = 5242880, allowed_mime_types = '{"application/pdf","image/jpeg","image/png"}';

-- Create Storage RLS Policies
-- Users can insert their own documents
CREATE POLICY "Users can upload their own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'documents' AND 
    auth.uid() = owner
);

-- Users can select their own documents
CREATE POLICY "Users can read their own documents" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'documents' AND 
    auth.uid() = owner
);

-- Admins can read all documents
CREATE POLICY "Admins can read all documents" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'documents' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER')
    )
);
