-- Migration 0007: Get Support feature
-- Adds listing_context to separate marketplace from donation/support listings
-- and adds support_requests table for student support requests

-- 1. Create listing_context enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_context_type') THEN
    CREATE TYPE public.listing_context_type AS ENUM ('marketplace', 'get_support');
  END IF;
END $$;

-- 2. Add listing_context column to listings table (default: marketplace for backward compat)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'listings' AND column_name = 'listing_context'
  ) THEN
    ALTER TABLE public.listings ADD COLUMN listing_context public.listing_context_type NOT NULL DEFAULT 'marketplace';
  END IF;
END $$;

-- 3. Add index for listing_context to speed up filtered queries
CREATE INDEX IF NOT EXISTS idx_listings_listing_context ON public.listings(listing_context);

-- 4. Add composite index for marketplace queries (context + status + created_at)
CREATE INDEX IF NOT EXISTS idx_listings_marketplace_active
  ON public.listings(status, created_at DESC)
  WHERE listing_context = 'marketplace';

-- 5. Add composite index for get_support queries (context + status + created_at)
CREATE INDEX IF NOT EXISTS idx_listings_support_active
  ON public.listings(status, created_at DESC)
  WHERE listing_context = 'get_support';

-- 6. Create support_requests table for student support/donation requests
CREATE TABLE IF NOT EXISTS public.support_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text NOT NULL DEFAULT '',
  category_id      smallint REFERENCES public.categories(id),
  subject          text,
  education_level  text,
  institution_id   uuid REFERENCES public.institutions(id),
  location         text,
  condition_pref   public.condition_type,
  image_url        text,
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired', 'cancelled')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  expires_at       timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

-- 7. RLS for support_requests
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can read active support requests
CREATE POLICY "Anyone can read active support requests"
  ON public.support_requests FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

-- Users can create their own support requests
CREATE POLICY "Users can create own support requests"
  ON public.support_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own support requests
CREATE POLICY "Users can update own support requests"
  ON public.support_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own support requests
CREATE POLICY "Users can delete own support requests"
  ON public.support_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all support requests
CREATE POLICY "Admins can manage support requests"
  ON public.support_requests FOR ALL
  USING (public.is_admin(auth.uid()));

-- 8. Add indexes for support_requests
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON public.support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_category ON public.support_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON public.support_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_expires_at ON public.support_requests(expires_at);

-- 9. Update RLS policies for listings to be context-aware
-- (The existing policies already allow public read, so donation listings are visible
--  within Get Support. Marketplace queries will filter by listing_context at the app level.)

-- 10. Update the conversations table policy to also work for support-based conversations
-- (The existing conversations table has nullable listing_id and wanted_id, which is sufficient)
