-- ============================================================================
-- 0006: Open institution creation (no login required)
-- The signup page lets users add their institution before they have an
-- account. This RPC creates (or finds) an institution without attaching it
-- to a profile — the signup trigger attaches it once the account exists.
-- Trust-based: institutions are created verified and active immediately.
-- Rollback: drop function public.create_institution(text, text, text);
-- ============================================================================

create or replace function public.create_institution(
  p_name text,
  p_type text default 'other',
  p_city text default ''
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inst uuid;
  v_type public.institution_type;
begin
  if btrim(p_name) = '' then
    raise exception 'Institution name is required.';
  end if;

  v_type := p_type::public.institution_type;
  if v_type is null then
    v_type := 'other';
  end if;

  -- If the institution already exists, return it as-is.
  select id into v_inst
    from public.institutions
   where lower(name) = lower(btrim(p_name))
   limit 1;

  if v_inst is null then
    insert into public.institutions (name, type, city, is_verified)
    values (btrim(p_name), v_type, btrim(coalesce(p_city, '')), true)
    returning id into v_inst;
  end if;

  return v_inst;
exception
  when unique_violation then
    -- Two requests raced; return the winner.
    select id into v_inst
      from public.institutions
     where lower(name) = lower(btrim(p_name))
     limit 1;
    return v_inst;
end;
$$;

revoke all on function public.create_institution(text, text, text) from public;
grant execute on function public.create_institution(text, text, text) to anon, authenticated;
