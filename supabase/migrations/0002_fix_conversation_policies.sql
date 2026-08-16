-- ============================================================================
-- CampusReuse — Patch: replace recursive conversation policies
-- ----------------------------------------------------------------------------
-- The original 0001 migration defined RLS policies on conversation_participants
-- and conversations that query conversation_participants directly, causing
-- "infinite recursion detected in policy for relation
-- conversation_participants" (42P17).
--
-- This patch introduces a security-definer membership helper and rewrites the
-- affected policies to use it. Safe to run on projects that already applied
-- the original 0001 (and idempotent for fresh runs).
-- ============================================================================

create or replace function public.is_participant(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation_id and user_id = auth.uid()
  );
$$;

drop policy if exists "Participants read members" on public.conversation_participants;
drop policy if exists "Participants manage membership" on public.conversation_participants;
drop policy if exists "Participants read conversation" on public.conversations;
drop policy if exists "Participants update conversation" on public.conversations;

create policy "Participants read members"
  on public.conversation_participants for select
  using (public.is_participant(conversation_id));

create policy "Participants manage membership"
  on public.conversation_participants for all
  using (auth.uid() = user_id)
  with check (public.is_participant(conversation_id));

create policy "Participants read conversation"
  on public.conversations for select
  using (public.is_participant(id));

create policy "Participants update conversation"
  on public.conversations for update
  using (public.is_participant(id))
  with check (public.is_participant(id));
