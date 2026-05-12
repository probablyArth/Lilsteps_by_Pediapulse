-- ─────────────────────────────────────────────────────────────────────────────
-- One-time setup: storage bucket for health-note photos
--
-- Run this once via Supabase Dashboard → SQL Editor → paste + Run.
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- Private bucket. Photos are accessed via signed URLs created server-side
-- (or in the client with the user's session) — never publicly listable.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'health-photos',
  'health-photos',
  false,
  10 * 1024 * 1024,                           -- 10 MB max per upload
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─── RLS policies on storage.objects ──────────────────────────────────────────
-- Path convention: <auth.uid()>/<filename>
--
-- Each parent can only INSERT/SELECT/DELETE objects under their own user-id
-- folder. This keeps health photos compartmentalised by parent account.

DROP POLICY IF EXISTS "health_photos_insert_own" ON storage.objects;
CREATE POLICY "health_photos_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'health-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "health_photos_select_own" ON storage.objects;
CREATE POLICY "health_photos_select_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'health-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "health_photos_delete_own" ON storage.objects;
CREATE POLICY "health_photos_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'health-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
