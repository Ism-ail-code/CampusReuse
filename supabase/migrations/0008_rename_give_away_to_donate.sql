-- Migration: Rename give_away to donate, remove listing_context
-- This migration:
-- 1. Renames 'give_away' to 'donate' in transaction_type enum
-- 2. Renames 'given_away' to 'donated' in listing_status enum
-- 3. Drops listing_context column and listing_context_type enum

-- Step 1: Rename enum values (no data migration needed - renames in place)
ALTER TYPE transaction_type RENAME VALUE 'give_away' TO 'donate';
ALTER TYPE listing_status RENAME VALUE 'given_away' TO 'donated';

-- Step 2: Drop listing_context column
ALTER TABLE listings DROP COLUMN IF EXISTS listing_context;

-- Step 3: Drop listing_context_type enum
DROP TYPE IF EXISTS listing_context_type;

-- Verify migration
DO $$
BEGIN
  -- Check that listing_context column is gone
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'listing_context') THEN
    RAISE EXCEPTION 'Migration failed: listing_context column still exists';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully';
END $$;