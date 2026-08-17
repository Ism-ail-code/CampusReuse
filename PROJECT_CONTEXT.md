# CampusReuse — Project Context

Last updated: 2026-08-17

## What this is

CampusReuse is a student academic-materials marketplace (Pakistan-focused): sell, exchange, or give away textbooks/notes, plus wanted-posts, direct messaging, exchange proposals, notifications, admin moderation, and a nationwide verified-institution catalog.

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS 4 (shadcn/ui components)
- Supabase (Postgres + Auth + Storage + Realtime) with a full demo-mode fallback
- App code: `src/` — services abstracted behind `DataService` (`src/services/index.ts`)

## How the backend switch works

- `.env.local` holds `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (gitignored via `.env*`; template in `.env.example`)
- If either is empty → `isDemoMode` = true (`src/lib/supabase.ts`), app uses `DemoService` with localStorage seed
- Currently **connected to live Supabase** (not demo mode)

## Live Supabase project

- Project ref: `tgfqanqmxxwarfdzlmjj` → https://tgfqanqmxxwarfdzlmjj.supabase.co
- Anon key: `sb_publishable_fMLDXbp8X3ArhTGayy0YtQ_1ueQTVPm` (in `.env.local`; also Dashboard → Project Settings → API)
- Demo account: `demo@campusreuse.app` / `DemoPass123!` — single account, **role = admin** (so every page is testable)

## Supabase SQL files (in `supabase/`)

All applied to the live project via Dashboard → SQL Editor, in this order:

| File | Purpose |
|---|---|
| `migrations/0001_initial_schema.sql` | Full schema: tables, RLS policies, triggers, RPCs (`start_conversation`, `respond_to_wanted`, `propose_exchange`, `update_exchange_proposal`, `is_admin`, `make_admin`, `is_participant`, `expire_stale_items`), storage buckets + policies |
| `migrations/0002_fix_conversation_policies.sql` | Patch: replaced recursive RLS policies with the `is_participant` security-definer helper |
| `migrations/0003_cron.sql` | Optional hourly `expire_stale_items` cron via `pg_cron` |
| `seed.sql` | Idempotent: ~90 institutions, ONE demo user (demo@, admin), 3 demo listings + images |
| `fix_demo_auth.sql` | One-off live-DB fix: NULL→'' auth token columns + make demo@ admin |
| `cleanup_demo_users.sql` | One-off: removed all other seeded users (cascades their data) |

Migrations were battle-tested through several ordering/constraint bugs — the file order inside `0001` matters (tables before policies/functions referencing them, FKs only to earlier tables, `is_admin` is plpgsql to defer validation).

## Critical lesson learned (do not repeat)

**Never insert `auth.users` rows with NULL token columns.** GoTrue scans `confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change`, `phone_change`, `phone_change_token`, `email_change_token_current`, `reauthentication_token` into strings; NULL → `500 Database error querying schema` on every login. Manual inserts must provide `''` for those and `false` for `is_super_admin` (the seed now does this).

## Git state

- Branch `master`, identity: `aalikhan <aalikhanpubg@gmail.com>` (user.name local, email global)
- ~30 small commits; working tree clean at last check. No remote configured yet.
- `.gitignore` covers `node_modules`, `dist`, `.env*`, `*.tsbuildinfo`

## Verified working (last session)

- Demo login via GoTrue API, admin role confirmed, RLS reads OK (profiles, institutions, categories, listings)
- `npm run typecheck` clean, `npm run build` passes
- Search, messaging (last_read_at unread logic), exchanges, notifications, admin pages, mobile-first UX (bottom sheets, sticky bars, gallery swipe, page headers) all implemented

## Next steps (when resuming)

1. Deploy frontend (Vercel/Netlify) → `npm run build`, set auth Site URL + redirect URLs in Dashboard → Authentication → URL Configuration
2. Decide email confirmations (currently OFF-ish: seed sets `email_confirmed_at`; new signups need confirmations enabled deliberately — `mailer_autoconfirm: false`)
3. Git: add a remote and push history
4. QA pass in the browser against live data (demo@ login → browse, create listing w/ photo upload, message, exchange proposal, admin page)