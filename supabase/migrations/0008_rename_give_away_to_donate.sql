-- Migration: Rename give_away to donate, remove listing_context
-- This migration:
-- 1. Renames 'give_away' to 'donate' in transaction_type enum
-- 2. Renames 'given_away' to 'donated' in listing_status enum
-- 3. Migrates existing data
-- 4. Drops listing_context column and listing_context_type enum

-- Step 1: Add new enum values
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'donate';
ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'donated';

-- Step 2: Migrate data from give_away to donate
UPDATE listings SET transaction_type = 'donate' WHERE transaction_type = 'give_away';
UPDATE listings SET status = 'donated' WHERE status = 'given_away';

-- Step 3: Update listing status constraint if needed
-- (The enum already has 'donated' so this is just for clarity)

-- Step 4: Drop listing_context column
ALTER TABLE listings DROP COLUMN IF EXISTS listing_context;

-- Step 5: Drop listing_context_type enum
DROP TYPE IF EXISTS listing_context_type;

-- Step 6: Update support_requests table if needed
-- (support_requests table is kept as-is, it doesn't depend on listing_context)

-- Step 7: Recreate indexes if needed
-- (Indexes on transaction_type are already in place)

-- Verify migration
DO $$
BEGIN
  -- Check that no give_away values remain
  IF EXISTS (SELECT 1 FROM listings WHERE transaction_type = 'give_away') THEN
    RAISE EXCEPTION 'Migration failed: give_away values still exist';
  END IF;
  
  -- Check that no given_away values remain
  IF EXISTS (SELECT 1 FROM listings WHERE status = 'given_away') THEN
    RAISE EXCEPTION 'Migration failed: given_away values still exist';
  END IF;
  
  -- Check that listing_context column is gone
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'listing_context') THEN
    RAISE EXCEPTION 'Migration failed: listing_context column still exists';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully';
END $$;