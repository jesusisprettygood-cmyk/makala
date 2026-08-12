-- Run in Supabase SQL Editor (after schema.sql)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public read profiles"
  on public.profiles for select
  using (true);

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket (also create "makala" bucket in Dashboard if this fails)
insert into storage.buckets (id, name, public)
values ('makala', 'makala', true)
on conflict (id) do update set public = true;

create policy "Public read makala bucket"
  on storage.objects for select
  using (bucket_id = 'makala');

create policy "Users upload own makala files"
  on storage.objects for insert
  with check (
    bucket_id = 'makala'
    and (storage.foldername(name))[1] in ('articles', 'profiles')
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Users update own makala files"
  on storage.objects for update
  using (
    bucket_id = 'makala'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "Users delete own makala files"
  on storage.objects for delete
  using (
    bucket_id = 'makala'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
