-- Storage bucket for optional proof-of-service uploads attached to hour_logs.
-- Files are stored at {student_id}/{filename}; private bucket, read access is
-- limited to the uploader and admins (who may need to review proof).

insert into storage.buckets (id, name, public)
values ('proof', 'proof', false)
on conflict (id) do nothing;

create policy "users can upload their own proof files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'proof'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners and admins can read proof files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'proof'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or current_profile_role() = 'admin'
    )
  );
