-- ============================================================================
-- 0004: Auto-approve institution requests
-- Users who can't find their institution get it created immediately (trusting
-- the name they typed), marked verified, attached to their profile, and
-- recorded as an 'approved' request for admin visibility. No moderation step.
-- Rollback: drop function public.request_institution(text, text, text);
-- ============================================================================

create or replace function public.request_institution(
  p_name text,
  p_type text default 'other',
  p_city text default ''
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_inst uuid;
  v_type public.institution_type;
begin
  if v_user is null then
    raise exception 'Not authenticated.';
  end if;

  if btrim(p_name) = '' then
    raise exception 'Institution name is required.';
  end if;

  v_type := p_type::public.institution_type;
  if v_type is null then
    v_type := 'other';
  end if;

  -- If the institution already exists, just attach the user to it.
  select id into v_inst
    from public.institutions
   where lower(name) = lower(btrim(p_name))
   limit 1;

  if v_inst is null then
    insert into public.institutions (name, type, city, is_verified)
    values (btrim(p_name), v_type, btrim(coalesce(p_city, '')), true)
    returning id into v_inst;
  end if;

  update public.profiles
     set institution_id = v_inst,
         institution_verified = true
   where id = v_user;

  insert into public.institution_requests (user_id, name, type, city, status, admin_note, reviewed_at)
  values (v_user, btrim(p_name), v_type, btrim(coalesce(p_city, '')), 'approved', 'auto-approved', now());

  return v_inst;
exception
  when unique_violation then
    -- Two users requested the same name at once; attach to the winner.
    select id into v_inst
      from public.institutions
     where lower(name) = lower(btrim(p_name))
     limit 1;
    update public.profiles
       set institution_id = v_inst,
           institution_verified = true
     where id = v_user;
    insert into public.institution_requests (user_id, name, type, city, status, admin_note, reviewed_at)
    values (v_user, btrim(p_name), v_type, btrim(coalesce(p_city, '')), 'approved', 'auto-approved', now());
    return v_inst;
end;
$$;

revoke all on function public.request_institution(text, text, text) from public;
grant execute on function public.request_institution(text, text, text) to authenticated;
