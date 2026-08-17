-- ============================================================================
-- CampusReuse — Cleanup: keep only the single demo account
-- ----------------------------------------------------------------------------
-- Removes all seeded demo users except demo@campusreuse.app, plus the
-- throwaway test signup. FK cascades automatically delete their profiles,
-- listings, listing images, wanted posts, notifications, etc.
-- ============================================================================

delete from auth.users
where (email like '%campusreuse.app' and email <> 'demo@campusreuse.app')
   or email = 'newuser01@gmail.com';

-- Confirm what remains (should list demo@campusreuse.app only)
select email from auth.users order by email;