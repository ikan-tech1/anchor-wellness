-- Journal media storage bucket (private, user-scoped via RLS)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('journal-media', 'journal-media', false, 10485760)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own journal media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'journal-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own journal media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'journal-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own journal media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'journal-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
