-- ============================================================================
-- CampusReuse — Fix demo account login (500: Database error querying schema)
-- ----------------------------------------------------------------------------
-- Manually-inserted auth.users rows leave token columns NULL. GoTrue scans
-- them into strings, so NULL triggers a scan error and every login fails.
-- Replace the NULLs with empty strings (the documented remedy).
-- ============================================================================

update auth.users
set confirmation_token         = coalesce(confirmation_token, ''),
    recovery_token             = coalesce(recovery_token, ''),
    email_change_token_new     = coalesce(email_change_token_new, ''),
    email_change               = coalesce(email_change, ''),
    phone_change               = coalesce(phone_change, ''),
    phone_change_token         = coalesce(phone_change_token, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    reauthentication_token     = coalesce(reauthentication_token, ''),
    is_super_admin             = coalesce(is_super_admin, false)
where email = 'demo@campusreuse.app';

-- Confirm the row now has empty strings, not NULLs
select email, confirmation_token, recovery_token, is_super_admin
from auth.users
where email = 'demo@campusreuse.app';