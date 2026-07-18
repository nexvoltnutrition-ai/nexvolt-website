-- Allow authenticated users to manage blogs
CREATE POLICY "Allow authenticated full access to blogs" ON public.blogs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
