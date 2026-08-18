-- ============================================================================
-- CampusReuse — Cleanup: remove demo listings and their images
-- ----------------------------------------------------------------------------
-- Deletes the three seeded demo listings (fixed demo UUIDs). Listing images,
-- favorites and exchange proposals referencing them are removed by FK cascade;
-- conversations keep the listing_id reference but set it to NULL.
-- Already applied to the live project on 2026-08-18.
-- ============================================================================

delete from public.listings
where id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222210'
);

-- Confirm what remains (should show 0 rows)
select l.id, l.title
from public.listings l
where l.id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222210'
);
