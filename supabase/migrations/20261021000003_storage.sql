-- ============================================================================
-- 3. Storage Setup and Policies
-- Migration: 20261021000003_storage.sql
-- Specification: superbase.md (Make My Marriage Database Specification - Section 9)
-- ============================================================================

-- Create private bucket for wedding files if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wedding-files',
    'wedding-files',
    FALSE,
    10485760, -- 10 MB per file limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = 10485760;

-- ----------------------------------------------------------------------------
-- Storage Policies on storage.objects
-- Path format: <wedding_id>/<folder>/<filename>
-- ----------------------------------------------------------------------------

-- Allow wedding members to read files belonging to their wedding
DROP POLICY IF EXISTS "wedding_files_select_members" ON storage.objects;
CREATE POLICY "wedding_files_select_members" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'wedding-files'
    AND public.is_wedding_member((storage.foldername(name))[1]::uuid)
);

-- Allow owner, admin, or member to upload files to their wedding folder
DROP POLICY IF EXISTS "wedding_files_insert_members" ON storage.objects;
CREATE POLICY "wedding_files_insert_members" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'wedding-files'
    AND public.has_wedding_role((storage.foldername(name))[1]::uuid, ARRAY['owner', 'admin', 'member'])
);

-- Allow owner or admin to delete files from their wedding folder
DROP POLICY IF EXISTS "wedding_files_delete_admin" ON storage.objects;
CREATE POLICY "wedding_files_delete_admin" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'wedding-files'
    AND public.has_wedding_role((storage.foldername(name))[1]::uuid, ARRAY['owner', 'admin'])
);
