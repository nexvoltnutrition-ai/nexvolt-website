-- Enable RLS for blogs table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published blogs
CREATE POLICY "Allow anonymous SELECT on published blogs" ON public.blogs
FOR SELECT
TO public, anon
USING (published = true AND status = 'published');
