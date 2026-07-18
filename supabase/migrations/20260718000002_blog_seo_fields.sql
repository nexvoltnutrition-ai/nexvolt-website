ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS revisions JSONB DEFAULT '[]'::jsonb;
