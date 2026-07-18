-- 1. Remove duplicate blogs, keeping the most recently updated one
DELETE FROM public.blogs a
USING public.blogs b
WHERE a.slug = b.slug
  AND (a.updated_at < b.updated_at OR (a.updated_at = b.updated_at AND a.id < b.id));

-- 2. Add a UNIQUE constraint on the slug column
ALTER TABLE public.blogs ADD CONSTRAINT blogs_slug_key UNIQUE (slug);
