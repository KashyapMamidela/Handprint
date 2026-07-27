# Handprint

A volunteer hours tracker: students log service hours, organizers/admins verify them, and everyone shows up on a live leaderboard.

Stack: React + Vite + Tailwind, Supabase (Postgres + Auth + RLS + Realtime + Storage), Recharts, deployed on Vercel.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then grab the **Project URL** and **anon public key** from Project Settings → API.

## 2. Run the migrations

The schema lives in `supabase/migrations/`, run in order:

1. `0001_init.sql` — enums, `profiles`/`drives`/`hour_logs` tables, the new-user trigger that creates a `profiles` row (role defaults to `student`) on signup.
2. `0002_rls.sql` — Row Level Security policies for all three tables.
3. `0003_leaderboard_view.sql` — the `leaderboard` view (sum of approved hours per student, recomputed on read).
4. `0004_storage.sql` — the private `proof` Storage bucket for optional hour-log attachments.

Run them with the [Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase db push`, after `supabase link`) or paste each file's contents into the SQL Editor in the Supabase dashboard, in order.

**Promoting a user to organizer or admin** is manual for now — there's no UI for it. In the SQL Editor:

```sql
update profiles set role = 'organizer' where id = '<user-uuid>';
```

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

## 5. Deploy to Vercel

Connect the GitHub repo in Vercel, then set the same two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel project's Settings → Environment Variables. Every push to the connected branch redeploys automatically — no other build configuration is needed (Vercel auto-detects Vite).

## Notes on scope

- **Auth** is email/password only for now. The Login screen renders "Continue with Google Workspace" / "campus SSO" buttons to match the design, but they're disabled — wiring up real Google OAuth is a config change in Supabase Auth providers plus enabling the buttons in `src/pages/Login.jsx`.
- **Roles**: every signup is `student`; `organizer`/`admin` are granted by editing the `profiles` table directly (see step 2).
- **No Edge Functions**: leaderboard aggregation is a Postgres view, and hour-log verification is a direct RLS-gated update from the client with Realtime broadcasting the change — both examples the brief called out for possible Edge Function use turned out not to need one.
