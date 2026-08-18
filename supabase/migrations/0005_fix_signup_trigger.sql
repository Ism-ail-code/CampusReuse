-- ============================================================================
-- 0005: Bulletproof the signup trigger
-- "Database error saving new user" was reaching users because handle_new_user
-- can throw for metadata it can't trust:
--   * institution_id pointing at a missing institution -> FK violation (500)
--   * a username racing another signup -> unique violation
-- Now the trigger only attaches institutions that exist (otherwise NULL),
-- retries once with a random suffix on username collision, and never fails.
-- Rollback: apply the version of handle_new_user from 0001.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_display  text;
  v_type     public.account_type;
  v_inst_id  uuid;
begin
  v_username := nullif(new.raw_user_meta_data ->> 'username', '')::text;
  if v_username is null then
    v_username := lower(split_part(new.email, '@', 1));
    v_username := regexp_replace(v_username, '[^a-z0-9_]', '', 'g');
    v_username := left(v_username, 12) || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  while exists (select 1 from public.profiles where username = v_username) loop
    v_username := v_username || substr(md5(random()::text), 1, 4);
  end loop;

  v_display := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1));
  v_type := case when lower(coalesce(new.raw_user_meta_data ->> 'account_type', 'student')) = 'teacher'
                 then 'teacher'::public.account_type else 'student'::public.account_type end;

  -- Only attach an institution that actually exists. A stale or invalid id
  -- must never block account creation.
  v_inst_id := nullif(new.raw_user_meta_data ->> 'institution_id', '')::uuid;
  if v_inst_id is not null
     and not exists (select 1 from public.institutions where id = v_inst_id and is_active) then
    v_inst_id := null;
  end if;

  if not exists (select 1 from public.profiles where id = new.id) then
    begin
      insert into public.profiles (id, display_name, username, account_type, education_level,
                                   program, institution_id, email_verified)
      values (
        new.id,
        left(v_display, 80),
        v_username,
        v_type,
        left(new.raw_user_meta_data ->> 'education_level', 200),
        left(new.raw_user_meta_data ->> 'program', 200),
        v_inst_id,
        new.email_confirmed_at is not null
      );
    exception
      when unique_violation then
        -- Username raced with another signup; retry with a random suffix.
        v_username := v_username || substr(md5(random()::text), 1, 4);
        while exists (select 1 from public.profiles where username = v_username) loop
          v_username := v_username || substr(md5(random()::text), 1, 4);
        end loop;
        insert into public.profiles (id, display_name, username, account_type, education_level,
                                     program, institution_id, email_verified)
        values (
          new.id,
          left(v_display, 80),
          v_username,
          v_type,
          left(new.raw_user_meta_data ->> 'education_level', 200),
          left(new.raw_user_meta_data ->> 'program', 200),
          v_inst_id,
          new.email_confirmed_at is not null
        );
        update public.profiles
           set username = v_username
         where id = new.id;
    end;
  end if;

  return new;
end;
$$;
