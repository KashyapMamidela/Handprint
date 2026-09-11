-- Core schema: enums, profiles, drives, hour_logs, and the new-user profile trigger.

create extension if not exists "pgcrypto";

create type user_role as enum ('volunteer', 'admin');
create type log_status as enum ('pending', 'approved', 'rejected');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role user_role not null default 'volunteer',
  initials text not null,
  created_at timestamptz not null default now()
);

create table drives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org text not null,
  description text not null default '',
  event_date date,
  hours_estimate numeric,
  spots integer,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table hour_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  drive_id uuid not null references drives (id) on delete cascade,
  hours numeric not null check (hours > 0),
  description text,
  proof_path text,
  status log_status not null default 'pending',
  verified_by uuid references profiles (id),
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index hour_logs_student_id_idx on hour_logs (student_id);
create index hour_logs_drive_id_idx on hour_logs (drive_id);
create index hour_logs_status_idx on hour_logs (status);
create index drives_created_by_idx on drives (created_by);

-- Auto-create a profiles row whenever a new auth.users row appears.
-- Expects signup metadata: { "name": "Full Name" }. Falls back to the email
-- local-part if no name was supplied. All new users start as 'volunteer';
-- admin roles are granted later via direct SQL.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  full_name text;
  computed_initials text;
  parts text[];
begin
  full_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1));
  parts := regexp_split_to_array(trim(full_name), '\s+');
  if array_length(parts, 1) >= 2 then
    computed_initials := upper(left(parts[1], 1) || left(parts[array_length(parts, 1)], 1));
  else
    computed_initials := upper(left(full_name, 2));
  end if;

  insert into public.profiles (id, name, initials)
  values (new.id, full_name, computed_initials);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
