-- Create homepage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('homepage', 'homepage', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to homepage bucket
CREATE POLICY "Public read access for homepage bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'homepage' );

-- Allow authenticated admins to upload to homepage bucket
CREATE POLICY "Admins can upload to homepage bucket"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'homepage' AND public.is_admin() );

-- Allow admins to update and delete
CREATE POLICY "Admins can update homepage bucket"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'homepage' AND public.is_admin() );

CREATE POLICY "Admins can delete from homepage bucket"
ON storage.objects FOR DELETE
USING ( bucket_id = 'homepage' AND public.is_admin() );
