-- Row Level Security for profiles, drives, hour_logs.

alter table profiles enable row level security;
alter table drives enable row level security;
alter table hour_logs enable row level security;

-- Helper functions (security definer so they can read profiles without
-- re-triggering the RLS policy that's calling them).

create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create function public.current_profile_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Prevent a user from granting themselves admin via a client update.
create function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on profiles
  for each row execute function prevent_role_self_escalation();

-- profiles: names/initials/roles are not sensitive and are needed to render
-- the leaderboard, admin queue, and dashboard avatar for any signed-in user.
create policy "profiles are readable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

-- drives: publicly readable (Landing and Drives are browsable pre-login).
-- Any admin can create/edit any drive -- a single shared admin team, not
-- per-drive ownership, so there's no "owns this drive" check here.
create policy "drives are publicly readable"
  on drives for select
  to anon, authenticated
  using (true);

create policy "admins can create drives"
  on drives for insert
  to authenticated
  with check (is_admin());

create policy "admins can edit any drive"
  on drives for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- hour_logs: volunteers insert/read their own; admins read/update everything.
create policy "volunteers can log their own hours"
  on hour_logs for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and status = 'pending'
    and verified_by is null
  );

create policy "volunteers and admins can read logs"
  on hour_logs for select
  to authenticated
  using (
    student_id = auth.uid()
    or is_admin()
  );

create policy "admins can verify logs"
  on hour_logs for update
  to authenticated
  using (is_admin())
  with check (
    is_admin()
    and (verified_by is null or verified_by = auth.uid())
  );
