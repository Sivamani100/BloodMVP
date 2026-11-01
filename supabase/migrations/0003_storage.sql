-- ============================================================================
-- Blood MVP | 0003_storage.sql   (SUPABASE ONLY)
-- Two PRIVATE buckets. File path rule:  <user_id>/<random-filename>
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('slips',      'slips',      false, 2097152, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('donor-docs', 'donor-docs', false, 2097152, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "slips insert own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'slips' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "slips read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'slips' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

create policy "donor-docs insert own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'donor-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "donor-docs read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'donor-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "donor-docs delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'donor-docs' and (storage.foldername(name))[1] = auth.uid()::text);
