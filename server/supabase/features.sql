-- Run in Supabase SQL Editor (after schema.sql + profiles-storage.sql)

-- Owners can edit/delete their articles
drop policy if exists "Authors update own articles" on public.articles;
create policy "Authors update own articles"
  on public.articles for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Authors delete own articles" on public.articles;
create policy "Authors delete own articles"
  on public.articles for delete
  using (auth.uid() = author_id);

-- Newsletter subscribers
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on public.subscribers;
create policy "Anyone can subscribe"
  on public.subscribers for insert
  with check (true);

-- Increment read count (public, safe)
create or replace function public.increment_article_read(article_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.articles
  set most_read = coalesce(most_read, 0) + 1,
      updated_at = now()
  where id = article_id;
end;
$$;

grant execute on function public.increment_article_read(uuid) to anon, authenticated;

-- Storage upsert for profile avatars
drop policy if exists "Users update own makala files" on storage.objects;
create policy "Users update own makala files"
  on storage.objects for update
  using (
    bucket_id = 'makala'
    and (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'makala'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
