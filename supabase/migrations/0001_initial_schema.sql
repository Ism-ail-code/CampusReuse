-- ============================================================================
-- CampusReuse — Initial schema
-- Student academic materials marketplace
-- Applies to a fresh Supabase project (free tier).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

-- True if the given uid belongs to an admin profile.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- Enums (as text + check constraints to stay portable & easy to extend)
-- ----------------------------------------------------------------------------
do $$
begin
  create type public.user_role as enum ('user', 'admin', 'moderator');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.account_type as enum ('student', 'teacher');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.institution_type as enum ('school', 'college', 'university', 'institute', 'other');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.condition_type as enum ('new', 'like_new', 'good', 'used');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.transaction_type as enum ('sell', 'exchange', 'give_away');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.listing_status as enum ('available', 'reserved', 'sold', 'given_away', 'expired');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.wanted_status as enum ('active', 'fulfilled', 'expired');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.proposal_status as enum ('pending', 'accepted', 'declined', 'cancelled', 'completed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_status as enum ('open', 'reviewed', 'dismissed', 'action_taken');
exception when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- Institutions
-- ----------------------------------------------------------------------------
create table public.institutions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        public.institution_type not null default 'other',
  city        text not null default '',
  is_verified boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create unique index institutions_name_lower_idx on public.institutions (lower(name));

alter table public.institutions enable row level security;

create policy "Anyone can read institutions"
  on public.institutions for select
  using (is_active = true);

create policy "Admins manage institutions"
  on public.institutions for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- Institution requests (users propose new institutions; admins approve)
-- ----------------------------------------------------------------------------
create table public.institution_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  type         public.institution_type not null default 'other',
  city         text not null default '',
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'duplicate')),
  admin_note   text,
  created_at   timestamptz not null default now(),
  reviewed_at  timestamptz
);

alter table public.institution_requests enable row level security;

create policy "User creates own institution requests"
  on public.institution_requests for insert
  with check (auth.uid() = user_id);

create policy "User reads own institution requests"
  on public.institution_requests for select
  using (auth.uid() = user_id);

create policy "Admins manage institution requests"
  on public.institution_requests for update
  using (public.is_admin(auth.uid()));

create policy "Admins read institution requests"
  on public.institution_requests for select
  using (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- Profiles (public data)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  display_name        text not null default '',
  username            text not null,
  account_type        public.account_type not null default 'student',
  education_level     text,
  program             text,
  institution_id      uuid references public.institutions(id) on delete set null,
  bio                 text,
  avatar_url          text,
  role                public.user_role not null default 'user',
  email_verified      boolean not null default false,
  institution_verified boolean not null default false,
  created_at          timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,30}$'),
  constraint unique_username unique (username)
);

create index profiles_institution_idx on public.profiles(institution_id);

alter table public.profiles enable row level security;

create policy "Anyone can read public profiles"
  on public.profiles for select
  using (true);

create policy "User updates own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "User inserts own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins manage profiles"
  on public.profiles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- Private user details (never exposed publicly)
-- ----------------------------------------------------------------------------
create table public.private_details (
  user_id   uuid primary key references public.profiles(id) on delete cascade,
  phone     text,
  gender    text,
  age       integer,
  updated_at timestamptz not null default now()
);

alter table public.private_details enable row level security;

create policy "Owner reads private details"
  on public.private_details for select
  using (auth.uid() = user_id);

create policy "Owner updates private details"
  on public.private_details for update
  using (auth.uid() = user_id);

create policy "Owner inserts private details"
  on public.private_details for insert
  with check (auth.uid() = user_id);

create policy "Admins manage private details"
  on public.private_details for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- Categories (core data)
-- ----------------------------------------------------------------------------
create table public.categories (
  id         smallint primary key,
  slug       text not null unique,
  name       text not null,
  sort_order smallint not null default 0
);

alter table public.categories enable row level security;

create policy "Anyone can read categories"
  on public.categories for select
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

insert into public.categories (id, slug, name, sort_order) values
  (1, 'textbook',     'Textbook',               1),
  (2, 'notes',        'Notes',                  2),
  (3, 'guide',        'Guide',                  3),
  (4, 'calculator',   'Calculator',             4),
  (5, 'notebook',     'Notebook',               5),
  (6, 'other',        'Other academic material',6)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Listings
-- ----------------------------------------------------------------------------
create table public.listings (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  category_id      smallint not null references public.categories(id),
  subject          text,
  education_level  text,
  condition        public.condition_type not null default 'good',
  description      text not null default '',
  transaction_type public.transaction_type not null,
  price            integer,
  exchange_want    text,
  status           public.listing_status not null default 'available',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  expires_at       timestamptz not null default (now() + interval '30 days'),
  constraint price_required_for_sell check (
    (transaction_type = 'sell' and price is not null and price >= 0) or
    (transaction_type <> 'sell' and price is null)
  ),
  constraint exchange_want_required_for_exchange check (
    (transaction_type = 'exchange' and exchange_want is not null and length(btrim(exchange_want)) > 0) or
    (transaction_type <> 'exchange')
  ),
  constraint no_price_for_give_away check (
    transaction_type <> 'give_away' or price is null
  )
);

create index listings_seller_idx on public.listings(seller_id);
create index listings_status_idx on public.listings(status);
create index listings_category_idx on public.listings(category_id);
create index listings_created_idx on public.listings(created_at desc);
create index listings_expires_idx on public.listings(expires_at);
create index listings_title_trgm on public.listings using gin (title gin_trgm_ops);
create index listings_subject_trgm on public.listings using gin (coalesce(subject, '') gin_trgm_ops);

alter table public.listings enable row level security;

create policy "Anyone can read listings"
  on public.listings for select
  using (true);

create policy "User creates own listings"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "User updates own listings"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "User deletes own listings"
  on public.listings for delete
  using (auth.uid() = seller_id);

create policy "Admins manage listings"
  on public.listings for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- Listing images
-- ----------------------------------------------------------------------------
create table public.listing_images (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings(id) on delete cascade,
  url          text,
  storage_path text,
  position     smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index listing_images_listing_idx on public.listing_images(listing_id);

alter table public.listing_images enable row level security;

create policy "Anyone can read listing images"
  on public.listing_images for select
  using (true);

create policy "Owner manages listing images"
  on public.listing_images for all
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.seller_id = auth.uid()
  ));

-- ----------------------------------------------------------------------------
-- Favorites / saved listings
-- ----------------------------------------------------------------------------
create table public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "User manages own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Wanted posts
-- ----------------------------------------------------------------------------
create table public.wanted_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  category_id     smallint not null references public.categories(id),
  subject         text,
  education_level text,
  condition_pref  public.condition_type,
  budget          integer,
  description     text not null default '',
  status          public.wanted_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '30 days')
);

create index wanted_posts_status_idx on public.wanted_posts(status);
create index wanted_posts_created_idx on public.wanted_posts(created_at desc);
create index wanted_posts_title_trgm on public.wanted_posts using gin (title gin_trgm_ops);

alter table public.wanted_posts enable row level security;

create policy "Anyone can read active wanted posts"
  on public.wanted_posts for select
  using (true);

create policy "User creates own wanted posts"
  on public.wanted_posts for insert
  with check (auth.uid() = user_id);

create policy "User updates own wanted posts"
  on public.wanted_posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "User deletes own wanted posts"
  on public.wanted_posts for delete
  using (auth.uid() = user_id);

create policy "Admins manage wanted posts"
  on public.wanted_posts for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- Wanted responses (record that someone responded; drives conversations)
-- ----------------------------------------------------------------------------
create table public.wanted_responses (
  id           uuid primary key default gen_random_uuid(),
  wanted_id    uuid not null references public.wanted_posts(id) on delete cascade,
  responder_id uuid not null references public.profiles(id) on delete cascade,
  message      text not null default '',
  created_at   timestamptz not null default now()
);

create index wanted_responses_wanted_idx on public.wanted_responses(wanted_id);

alter table public.wanted_responses enable row level security;

create policy "Participants read wanted responses"
  on public.wanted_responses for select
  using (
    auth.uid() = responder_id
    or exists (
      select 1 from public.wanted_posts w
      where w.id = wanted_id and w.user_id = auth.uid()
    )
  );

create policy "Admins read wanted responses"
  on public.wanted_responses for select
  using (public.is_admin(auth.uid()));

-- Inserts happen through respond_to_wanted() (security definer).

-- ----------------------------------------------------------------------------
-- Conversations
-- ----------------------------------------------------------------------------
create table public.conversations (
  id                 uuid primary key default gen_random_uuid(),
  listing_id         uuid references public.listings(id) on delete set null,
  wanted_id          uuid references public.wanted_posts(id) on delete set null,
  last_message_at    timestamptz not null default now(),
  last_message_preview text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index conversations_last_message_idx on public.conversations(last_message_at desc);

alter table public.conversations enable row level security;

create policy "Participants read conversation"
  on public.conversations for select
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = id and cp.user_id = auth.uid()
  ));

create policy "Participants update conversation"
  on public.conversations for update
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = id and cp.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = id and cp.user_id = auth.uid()
  ));

-- ----------------------------------------------------------------------------
-- Conversation participants
-- ----------------------------------------------------------------------------
create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  last_read_at    timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;

create policy "Participants read members"
  on public.conversation_participants for select
  using (exists (
    select 1 from public.conversation_participants me
    where me.conversation_id = conversation_id and me.user_id = auth.uid()
  ));

create policy "Participants manage membership"
  on public.conversation_participants for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Messages
-- ----------------------------------------------------------------------------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on public.messages(conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants read messages"
  on public.messages for select
  using (exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
  ));

create policy "Participant sends messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Exchange proposals
-- ----------------------------------------------------------------------------
create table public.exchange_proposals (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null references public.listings(id) on delete cascade,
  proposer_id     uuid not null references public.profiles(id) on delete cascade,
  offer_listing_id uuid references public.listings(id) on delete set null,
  message         text,
  status          public.proposal_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index exchange_proposals_listing_idx on public.exchange_proposals(listing_id);
create index exchange_proposals_proposer_idx on public.exchange_proposals(proposer_id);

alter table public.exchange_proposals enable row level security;

create policy "Participants read exchange proposals"
  on public.exchange_proposals for select
  using (
    auth.uid() = proposer_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

create policy "Admins read exchange proposals"
  on public.exchange_proposals for select
  using (public.is_admin(auth.uid()));

-- Inserts / status transitions go through RPCs (see below) for safety.

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null default '',
  link       text not null default '',
  ref_id     uuid,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "User reads own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "User updates own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Reports
-- ----------------------------------------------------------------------------
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'user', 'message', 'wanted')),
  target_id   uuid not null,
  reason      text not null,
  details     text,
  status      public.report_status not null default 'open',
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

create index reports_status_idx on public.reports(status);

alter table public.reports enable row level security;

create policy "User creates reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "User reads own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Admins manage reports"
  on public.reports for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- Blocks
-- ----------------------------------------------------------------------------
create table public.blocks (
  id         uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;

create policy "User manages own blocks"
  on public.blocks for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

create policy "Admins read blocks"
  on public.blocks for select
  using (public.is_admin(auth.uid()));

-- ============================================================================
-- Triggers & functions
-- ============================================================================

-- Update updated_at on any row change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listings_set_updated_at before update on public.listings
  for each row execute function public.set_updated_at();
create trigger wanted_posts_set_updated_at before update on public.wanted_posts
  for each row execute function public.set_updated_at();
create trigger exchange_proposals_set_updated_at before update on public.exchange_proposals
  for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();
create trigger private_details_set_updated_at before update on public.private_details
  for each row execute function public.set_updated_at();

-- Create a profile automatically when a new auth user signs up.
-- Onboarding metadata is passed through raw_user_meta_data.
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
begin
  v_username := nullif(new.raw_user_meta_data ->> 'username', '')::text;
  if v_username is null then
    v_username := lower(split_part(new.email, '@', 1));
    v_username := regexp_replace(v_username, '[^a-z0-9_]', '', 'g');
    v_username := left(v_username, 12) || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  -- ensure uniqueness
  while exists (select 1 from public.profiles where username = v_username) loop
    v_username := v_username || substr(md5(random()::text), 1, 4);
  end loop;

  v_display := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1));
  v_type := case when lower(coalesce(new.raw_user_meta_data ->> 'account_type', 'student')) = 'teacher'
                 then 'teacher'::public.account_type else 'student'::public.account_type end;

  insert into public.profiles (id, display_name, username, account_type, education_level,
                               program, institution_id, email_verified)
  values (
    new.id,
    left(v_display, 80),
    v_username,
    v_type,
    new.raw_user_meta_data ->> 'education_level',
    new.raw_user_meta_data ->> 'program',
    nullif(new.raw_user_meta_data ->> 'institution_id', '')::uuid,
    new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep email_verified in sync when the user confirms their email.
create or replace function public.sync_email_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set email_verified = new.email_confirmed_at is not null
   where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_confirmed
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.sync_email_verified();

-- Centralized, safe notification insert (server-side only).
create or replace function public.notify_user(
  p_user_id uuid,
  p_type    text,
  p_title   text,
  p_body    text default '',
  p_link    text default '',
  p_ref_id  uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link, ref_id)
  values (p_user_id, p_type, left(p_title, 200), left(p_body, 500), left(p_link, 400), p_ref_id);
end;
$$;

-- Notify a conversation's other participant when a message arrives.
create or replace function public.notify_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other uuid;
  v_link  text;
begin
  select cp.user_id into v_other
    from public.conversation_participants cp
   where cp.conversation_id = new.conversation_id and cp.user_id <> new.sender_id
   limit 1;

  if v_other is not null then
    select '/messages/' || c.id::text into v_link from public.conversations c where c.id = new.conversation_id;
    perform public.notify_user(v_other, 'message', 'New message', left(new.body, 200), v_link, new.conversation_id);
  end if;
  return new;
end;
$$;

create trigger on_message_inserted
  after insert on public.messages
  for each row execute function public.notify_on_message();

-- ============================================================================
-- RPCs
-- ============================================================================

-- Start (or return) a conversation between the current user and a listing seller.
create or replace function public.start_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller  uuid;
  v_conv_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select l.seller_id into v_seller
    from public.listings l
   where l.id = p_listing_id;

  if v_seller is null then
    raise exception 'Listing not found';
  end if;
  if v_seller = auth.uid() then
    raise exception 'You cannot message yourself';
  end if;
  if exists (select 1 from public.blocks b where (b.blocker_id = auth.uid() and b.blocked_id = v_seller)
                                               or (b.blocker_id = v_seller and b.blocked_id = auth.uid())) then
    raise exception 'Messaging is not available with this user';
  end if;

  select c.id into v_conv_id
    from public.conversations c
    join public.conversation_participants cp1 on cp1.conversation_id = c.id and cp1.user_id = auth.uid()
    join public.conversation_participants cp2 on cp2.conversation_id = c.id and cp2.user_id = v_seller
   where c.listing_id = p_listing_id
   order by c.created_at desc
   limit 1;

  if v_conv_id is null then
    insert into public.conversations (listing_id)
    values (p_listing_id)
    returning id into v_conv_id;

    insert into public.conversation_participants (conversation_id, user_id) values
      (v_conv_id, auth.uid()),
      (v_conv_id, v_seller);
  end if;

  return v_conv_id;
end;
$$;

-- Start a conversation about a wanted post (used by "Respond").
create or replace function public.respond_to_wanted(p_wanted_id uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
  v_conv_id uuid;
  v_resp_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select w.user_id into v_author
    from public.wanted_posts w
   where w.id = p_wanted_id and w.status = 'active';

  if v_author is null then
    raise exception 'Wanted post not found or no longer active';
  end if;
  if v_author = auth.uid() then
    raise exception 'You cannot respond to your own post';
  end if;
  if exists (select 1 from public.blocks b where (b.blocker_id = auth.uid() and b.blocked_id = v_author)
                                               or (b.blocker_id = v_author and b.blocked_id = auth.uid())) then
    raise exception 'Messaging is not available with this user';
  end if;

  insert into public.wanted_responses (wanted_id, responder_id, message)
  values (p_wanted_id, auth.uid(), coalesce(p_message, ''))
  returning id into v_resp_id;

  insert into public.conversations (wanted_id)
  values (p_wanted_id)
  returning id into v_conv_id;

  insert into public.conversation_participants (conversation_id, user_id) values
    (v_conv_id, auth.uid()),
    (v_conv_id, v_author);

  insert into public.messages (conversation_id, sender_id, body)
  values (v_conv_id, auth.uid(), coalesce(nullif(p_message, ''), 'Hi! I saw your wanted post.'));

  perform public.notify_user(v_author, 'wanted_response', 'Response to your wanted post',
    left(coalesce(p_message, 'Someone responded to your wanted post.'), 200),
    '/messages/' || v_conv_id::text, p_wanted_id);

  return v_conv_id;
end;
$$;

-- Propose an exchange: current user offers one of their own listings for the target listing.
create or replace function public.propose_exchange(
  p_listing_id uuid,
  p_offer_listing_id uuid,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_prop_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select l.seller_id into v_owner
    from public.listings l
   where l.id = p_listing_id and l.transaction_type = 'exchange' and l.status in ('available', 'reserved');

  if v_owner is null then
    raise exception 'Listing not found, is not an exchange, or is no longer available';
  end if;
  if v_owner = auth.uid() then
    raise exception 'You cannot propose an exchange on your own listing';
  end if;
  if p_offer_listing_id is null then
    raise exception 'Please choose one of your listings to offer';
  end if;
  if not exists (
    select 1 from public.listings l
    where l.id = p_offer_listing_id and l.seller_id = auth.uid() and l.status = 'available'
  ) then
    raise exception 'Offered listing must be one of your available listings';
  end if;
  if exists (
    select 1 from public.exchange_proposals ep
    where ep.listing_id = p_listing_id and ep.proposer_id = auth.uid() and ep.status in ('pending', 'accepted')
  ) then
    raise exception 'You already have an active proposal for this listing';
  end if;
  if exists (select 1 from public.blocks b where (b.blocker_id = auth.uid() and b.blocked_id = v_owner)
                                               or (b.blocker_id = v_owner and b.blocked_id = auth.uid())) then
    raise exception 'Exchanges are not available with this user';
  end if;

  insert into public.exchange_proposals (listing_id, proposer_id, offer_listing_id, message)
  values (p_listing_id, auth.uid(), p_offer_listing_id, p_message)
  returning id into v_prop_id;

  perform public.notify_user(v_owner, 'exchange_proposal', 'New exchange proposal',
    'Someone wants to exchange one of their items for your listing.',
    '/listings/' || p_listing_id::text, p_listing_id);

  return v_prop_id;
end;
$$;

-- Transition an exchange proposal to a new status by an authorized participant.
create or replace function public.update_exchange_proposal(p_proposal_id uuid, p_new_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing_owner uuid;
  v_proposer uuid;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select l.seller_id, ep.proposer_id, ep.status::text
    into v_listing_owner, v_proposer, v_status
    from public.exchange_proposals ep
    join public.listings l on l.id = ep.listing_id
   where ep.id = p_proposal_id;

  if v_listing_owner is null then
    raise exception 'Proposal not found';
  end if;

  if p_new_status = 'accepted' or p_new_status = 'declined' then
    if auth.uid() <> v_listing_owner then
      raise exception 'Only the listing owner can accept or decline';
    end if;
    if v_status <> 'pending' then
      raise exception 'Proposal is no longer pending';
    end if;
  elsif p_new_status = 'cancelled' then
    if auth.uid() <> v_proposer then
      raise exception 'Only the proposer can cancel';
    end if;
    if v_status not in ('pending', 'accepted') then
      raise exception 'Proposal cannot be cancelled in its current state';
    end if;
  elsif p_new_status = 'completed' then
    if auth.uid() not in (v_listing_owner, v_proposer) then
      raise exception 'Only participants can complete an exchange';
    end if;
    if v_status <> 'accepted' then
      raise exception 'Only accepted proposals can be completed';
    end if;
  else
    raise exception 'Invalid status';
  end if;

  update public.exchange_proposals set status = p_new_status::public.proposal_status
   where id = p_proposal_id;

  if p_new_status = 'accepted' then
    perform public.notify_user(v_proposer, 'exchange_accepted', 'Exchange accepted',
      'The owner accepted your exchange proposal. Arrange the exchange and mark it complete.',
      '/exchanges', p_proposal_id);
  elsif p_new_status = 'declined' then
    perform public.notify_user(v_proposer, 'exchange_declined', 'Exchange declined',
      'The owner declined your exchange proposal.',
      '/exchanges', p_proposal_id);
  end if;
end;
$$;

-- Mark stale listings/wanted posts as expired and send expiration reminders.
create or replace function public.expire_stale_items()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  -- Expire listings
  for r in
    select l.id, l.seller_id, l.title, l.expires_at
    from public.listings l
    where l.status in ('available', 'reserved') and l.expires_at < now()
  loop
    update public.listings set status = 'expired' where id = r.id;
    if not exists (
      select 1 from public.notifications n
      where n.user_id = r.seller_id and n.ref_id = r.id and n.type = 'listing_expired'
    ) then
      perform public.notify_user(r.seller_id, 'listing_expired', 'Your listing expired',
        'Your listing "' || r.title || '" expired. Renew it if it is still available.',
        '/my-listings', r.id);
    end if;
  end loop;

  -- Expire wanted posts
  for r in
    select w.id, w.user_id, w.title, w.expires_at
    from public.wanted_posts w
    where w.status = 'active' and w.expires_at < now()
  loop
    update public.wanted_posts set status = 'expired' where id = r.id;
    if not exists (
      select 1 from public.notifications n
      where n.user_id = r.user_id and n.ref_id = r.id and n.type = 'wanted_expired'
    ) then
      perform public.notify_user(r.user_id, 'wanted_expired', 'Your wanted post expired',
        'Your wanted post "' || r.title || '" expired. Renew it if you are still looking.',
        '/wanted', r.id);
    end if;
  end loop;

  -- Expiring-soon reminders (3 days out), sent once per item.
  for r in
    select l.id, l.seller_id, l.title
    from public.listings l
    where l.status = 'available'
      and l.expires_at > now() and l.expires_at < now() + interval '3 days'
  loop
    if not exists (
      select 1 from public.notifications n
      where n.user_id = r.seller_id and n.ref_id = r.id and n.type = 'listing_expiring_soon'
    ) then
      perform public.notify_user(r.seller_id, 'listing_expiring_soon', 'Your listing expires soon',
        'Your listing "' || r.title || '" expires in a few days. Renew it if it is still available.',
        '/my-listings', r.id);
    end if;
  end loop;

  for r in
    select w.id, w.user_id, w.title
    from public.wanted_posts w
    where w.status = 'active'
      and w.expires_at > now() and w.expires_at < now() + interval '3 days'
  loop
    if not exists (
      select 1 from public.notifications n
      where n.user_id = r.user_id and n.ref_id = r.id and n.type = 'wanted_expiring_soon'
    ) then
      perform public.notify_user(r.user_id, 'wanted_expiring_soon', 'Your wanted post expires soon',
        'Your wanted post "' || r.title || '" expires in a few days. Renew it if you are still looking.',
        '/wanted', r.id);
    end if;
  end loop;
end;
$$;

-- Simple deterministic helper for admin demo bootstrap.
create or replace function public.make_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
     set role = 'admin'
    from auth.users u
   where u.id = p.id and u.email = p_email;
end;
$$;

-- ============================================================================
-- Realtime
-- ============================================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.conversation_participants;
alter publication supabase_realtime add table public.notifications;

-- ============================================================================
-- Storage
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true),
       ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read for both buckets
create policy "Public read listing-images" on storage.objects
  for select using (bucket_id = 'listing-images');
create policy "Public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

-- Authenticated users upload/overwrite only files under their own user folder.
create policy "Upload listing-images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Manage own avatars" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text))
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- Note: pg_cron scheduled jobs (daily expire_stale_items) are configured in
-- 0002_cron.sql so they only run where the extension is available.
