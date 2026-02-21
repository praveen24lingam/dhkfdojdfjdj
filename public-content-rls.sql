-- ===================================
-- PUBLIC CONTENT TABLES & RLS
-- Run in Supabase SQL Editor so anon users can read tourist places/listings without login.
-- ===================================

-- Optional: create tourist_places if you use fetchTouristPlaces()
CREATE TABLE IF NOT EXISTS public.tourist_places (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    location TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tourist_places_created_at_idx ON public.tourist_places(created_at DESC);

ALTER TABLE public.tourist_places ENABLE ROW LEVEL SECURITY;

-- Public read access: anon and authenticated can read without login
CREATE POLICY "Public read access"
    ON public.tourist_places
    FOR SELECT
    USING (true);

-- Only service role / authenticated insert/update/delete (add your own policies as needed).

-- ===================================
-- For "places" table (fetchPublicPlaces): run in SQL Editor if table exists:
--   ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "Public read access" ON public.places FOR SELECT USING (true);
-- ===================================
-- For "listings" table (fetchPublicListings): run if table exists:
--   ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "Public read access" ON public.listings FOR SELECT USING (true);
-- ===================================
