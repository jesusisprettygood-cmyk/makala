-- Run this in Supabase SQL Editor

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  subtitle text not null default '',
  excerpt text not null default '',
  body jsonb not null default '[]'::jsonb,
  author text not null default 'Ndomi',
  image text not null default '',
  most_read integer,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_created_at_idx on public.articles (created_at desc);

alter table public.articles enable row level security;

create policy "Public read articles"
  on public.articles for select
  using (true);

create policy "Authors insert own articles"
  on public.articles for insert
  with check (auth.uid() = author_id);
