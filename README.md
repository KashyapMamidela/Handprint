# Handprint

A volunteer hours tracker: volunteers log service hours, admins post drives and verify submissions, and everyone shows up on a live leaderboard.

There are two separate logins: `/login` for volunteers (signup included) and `/admin/login` for admins (no signup — see below).

Stack: React + Vite + Tailwind, Supabase (Postgres + Auth + Realtime + Storage), Recharts. Deployed on Vercel.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then grab the **Project URL** and **anon public key** from Project Settings → API.

## 2. Run the migrations

The schema lives in `supabase/migrations/`, run in order:

1. `0001_init.sql` — enums, `profiles`/`drives`/`hour_logs` tables, the new-user trigger that creates a `profiles` row (role defaults to `volunteer`) on signup.
2. `0002_rls.sql` — Row Level Security policies for all three tables.
3. `0003_leaderboard_view.sql` — the `leaderboard` view (sum of approved hours per volunteer, recomputed on read).
4. `0004_storage.sql` — the private `proof` Storage bucket for optional hour-log attachments.
5. `0005_stats.sql` — `get_stats()`, an RPC the Landing page calls for its hero numbers.

Run them with the [Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase db push`, after `supabase link`) or paste each file's contents into the SQL Editor in the Supabase dashboard, in order.

**Email confirmation**: Supabase projects default to requiring email confirmation on signup, and free-tier projects have a very low email-sending rate limit (a handful per hour) — easy to exhaust while testing signups. For a smoother demo, turn confirmation off under Authentication → Sign In / Providers → Email → "Confirm email". Login.jsx handles either setting (shows a "check your email" message if it's left on).

**Google OAuth**: enabled as a "Continue with Google" option on `/login`, sitting alongside email/password. To turn it on:

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an OAuth 2.0 Client ID (Web application). Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
2. In Supabase: Authentication → Sign In / Providers → Google → paste the Client ID and Client Secret, enable it.
3. Add your deployed URL (e.g. `https://your-app.vercel.app`) to Authentication → URL Configuration → Redirect URLs, so Supabase allows redirecting back there after sign-in.

Until this is configured, the button will show an error when clicked — email/password still works independently either way.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from step 1.

## 4. Run locally

```bash
npm install
npm run dev
```

## 5. Promoting a user to admin

There's no signup flow for admins — every signup at `/login` creates a `volunteer` account. To make one an admin, in the Supabase SQL Editor:

```sql
update profiles set role = 'admin' where id = '<user-uuid>';
```

(Find the uuid under Authentication → Users, or `select id, email from auth.users;`.) That account can then sign in at `/admin/login` to post drives (`/admin/drives`) and verify submissions (`/admin`).

## 6. Deploy to Vercel

Connect the GitHub repo in Vercel (Vercel auto-detects Vite — no `vercel.json` needed), then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the project's Settings → Environment Variables. Every push to the connected branch redeploys automatically.

## Notes on scope

- **Roles** are just `volunteer` and `admin` — a single shared admin team that can post/edit any drive and verify any submission (no per-admin ownership of drives).
- **Auth** is email/password plus Google OAuth via Supabase Auth (volunteers only — `/admin/login` stays email/password-only since admin accounts are manually promoted, not self-service).
- **Realtime** is Supabase Realtime: Dashboard subscribes to its own `hour_logs` rows, AdminQueue and Leaderboard subscribe to all `hour_logs` changes, refetching on any insert/update.
- **Proof uploads** go to the private `proof` Storage bucket at `{volunteer-id}/...`; RLS on `storage.objects` limits reads to the uploader or an admin.
- **Leaderboard** is computed on read from approved `hour_logs` via the `leaderboard` view — no denormalized column.
- **`server/`** (a Node/Express + MySQL + Socket.IO API) is left in the repo from an earlier local-only XAMPP demo. The live app no longer uses it — everything above talks to Supabase directly from the client.
