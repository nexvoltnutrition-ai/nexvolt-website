-- Allow public read access
CREATE POLICY "Public read access for hero_slides"
ON hero_slides FOR SELECT
USING ( true );

-- Allow admins to insert
CREATE POLICY "Admins can insert hero_slides"
ON hero_slides FOR INSERT
WITH CHECK ( public.is_admin() );

-- Allow admins to update
CREATE POLICY "Admins can update hero_slides"
ON hero_slides FOR UPDATE
USING ( public.is_admin() );

-- Allow admins to delete
CREATE POLICY "Admins can delete hero_slides"
ON hero_slides FOR DELETE
USING ( public.is_admin() );
