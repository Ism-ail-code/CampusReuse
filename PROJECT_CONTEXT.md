# CampusReuse — Project Context

Last updated: 2026-08-18

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
| `cleanup_demo_listings.sql` | One-off (2026-08-18, applied): removed the 3 demo listings + images from live DB |

Migrations were battle-tested through several ordering/constraint bugs — the file order inside `0001` matters (tables before policies/functions referencing them, FKs only to earlier tables, `is_admin` is plpgsql to defer validation).

## Critical lesson learned (do not repeat)

**Never insert `auth.users` rows with NULL token columns.** GoTrue scans `confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change`, `phone_change`, `phone_change_token`, `email_change_token_current`, `reauthentication_token` into strings; NULL → `500 Database error querying schema` on every login. Manual inserts must provide `''` for those and `false` for `is_super_admin` (the seed now does this).

## State of files

```
.
├── index.html                  # OG/social meta tags, theme-color, fonts
├── package.json                # build/typecheck/lint scripts (lint = typecheck)
├── vite.config.ts              # @ alias → src/
├── .env.local                  # LIVE Supabase URL + anon key (gitignored)
├── .env.example                # template; empty = demo mode
├── PROJECT_CONTEXT.md          # this file
├── SESSION_LOG.md              # session decisions log (email confirmations)
├── supabase/
│   ├── config.toml             # local dev; enable_confirmations = true
│   ├── migrations/             # 0001 schema, 0002 policy fix, 0003 cron
│   ├── seed.sql                # institutions + demo user + demo listings
│   └── cleanup_*.sql, fix_*.sql
├── public/
│   ├── favicon.svg
│   └── robots.txt              # Allow all
└── src/
    ├── main.tsx                # entry
    ├── index.css               # Tailwind 4 + theme tokens
    ├── app/                    # App.tsx (routes) + AppContext.tsx (auth/unread/notifs)
    ├── components/
    │   ├── ui/                 # shadcn/ui primitives (button, input, dialog…)
    │   ├── layout/             # AppLayout, Navbar, MobileNav, Footer, Logo
    │   └── shared/             # PageHeader, ListingCard, EmptyState, AuthGuard…
    ├── lib/                    # types, utils, institutions catalog, supabase client
    ├── pages/
    │   ├── home|browse|listingDetail|listings|wanted|messages|exchange|notifications|profile|admin|auth|legal| NotFound
    │   └── legal/              # TermsPage.tsx, PrivacyPage.tsx (contact: campusreuse@gmail.com)
    └── services/               # index.ts (DataService), service.ts, supabaseService.ts, demoService.ts
```

## Git state

- Branch **`main`** (renamed from `master`), identity: `aalikhan <aalikhanpubg@gmail.com>` (user.name local, email global)
- Remote configured: `origin` → https://github.com/Ism-ail-code/CampusReuse.git
- **40 commits total**; local `main` is **10 commits ahead of `origin/main` — NOT pushed yet** (user pushes manually)
- Latest commits (2026-08-18): Terms page, Privacy page, legal routes, footer links, session log, email-confirmation local config, project-context update, demo-listing cleanup script, social meta tags, robots.txt
- `.gitignore` covers `node_modules`, `dist`, `.env*`, `*.tsbuildinfo`
- Working tree clean; `npm run typecheck` and `npm run build` pass

## Verified working

- Demo login via GoTrue API, admin role confirmed, RLS reads OK (profiles, institutions, categories, listings)
- Search, messaging (last_read_at unread logic), exchanges, notifications, admin pages, mobile-first UX (bottom sheets, sticky bars, gallery swipe, page headers) all implemented
- Terms + Privacy pages render at `/terms` and `/privacy`; footer links work
- All 3 demo listings + images deleted from live DB (verified 0 remaining); demo account kept as admin/test account

## Launch decisions (2026-08-18)

- **Email confirmation: ON for launch** (recorded in `SESSION_LOG.md`) — app handles both flows via `needsEmailConfirmation`; local `config.toml` enabled; **live Dashboard toggle + custom SMTP still pending user**
- Privacy contact email: `campusreuse@gmail.com` (placeholder-free)
- Deploy provider: undecided (Vercel or Netlify); **deploy config file (`vercel.json`/`netlify.toml`) still needed for SPA deep-link fallback**

## Next steps (when resuming)

1. **Push**: `git push -u origin main` (10 commits waiting)
2. **Deploy** frontend (Vercel/Netlify) — add `vercel.json` or `netlify.toml` SPA rewrite first
3. **Dashboard**: set auth Site URL + redirect URLs to prod domain (Authentication → URL Configuration — still localhost)
4. **Dashboard**: test custom SMTP (Authentication → Emails → Custom SMTP → "Test SMTP settings"), then toggle "Confirm email" ON
5. **QA pass** against live data (demo@ login → browse, create listing w/ photo upload, message, exchange proposal, admin page)
