-- Add UNIQUE constraint to the slug column of the blogs table
-- This prevents duplicate blogs from being created.
ALTER TABLE public.blogs ADD CONSTRAINT blogs_slug_key UNIQUE (slug);
