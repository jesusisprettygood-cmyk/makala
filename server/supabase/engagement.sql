-- Run in Supabase SQL Editor (after schema.sql + features.sql)

alter table public.articles
  add column if not exists like_count integer not null default 0,
  add column if not exists share_count integer not null default 0;

create table if not exists public.article_likes (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  viewer_key text,
  created_at timestamptz not null default now(),
  constraint article_likes_viewer_required check (user_id is not null or viewer_key is not null)
);

create unique index if not exists article_likes_user_idx
  on public.article_likes (article_id, user_id)
  where user_id is not null;

create unique index if not exists article_likes_viewer_idx
  on public.article_likes (article_id, viewer_key)
  where user_id is null and viewer_key is not null;

alter table public.article_likes enable row level security;

drop policy if exists "Public read article likes" on public.article_likes;
create policy "Public read article likes"
  on public.article_likes for select
  using (true);

create or replace function public.increment_article_read(article_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.articles
  set most_read = coalesce(most_read, 0) + 1,
      updated_at = now()
  where id = article_id
  returning most_read into new_count;

  return coalesce(new_count, 0);
end;
$$;

create or replace function public.toggle_article_like(article_id uuid, viewer_key text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  liked boolean := false;
  new_count integer := 0;
begin
  if uid is not null then
    if exists (
      select 1 from public.article_likes
      where article_likes.article_id = toggle_article_like.article_id
        and user_id = uid
    ) then
      delete from public.article_likes
      where article_likes.article_id = toggle_article_like.article_id
        and user_id = uid;

      update public.articles
      set like_count = greatest(0, coalesce(like_count, 0) - 1),
          updated_at = now()
      where id = toggle_article_like.article_id;
    else
      insert into public.article_likes (article_id, user_id)
      values (toggle_article_like.article_id, uid);

      update public.articles
      set like_count = coalesce(like_count, 0) + 1,
          updated_at = now()
      where id = toggle_article_like.article_id;

      liked := true;
    end if;
  elsif viewer_key is not null and btrim(viewer_key) <> '' then
    if exists (
      select 1 from public.article_likes
      where article_likes.article_id = toggle_article_like.article_id
        and user_id is null
        and article_likes.viewer_key = toggle_article_like.viewer_key
    ) then
      delete from public.article_likes
      where article_likes.article_id = toggle_article_like.article_id
        and user_id is null
        and article_likes.viewer_key = toggle_article_like.viewer_key;

      update public.articles
      set like_count = greatest(0, coalesce(like_count, 0) - 1),
          updated_at = now()
      where id = toggle_article_like.article_id;
    else
      insert into public.article_likes (article_id, viewer_key)
      values (toggle_article_like.article_id, btrim(viewer_key));

      update public.articles
      set like_count = coalesce(like_count, 0) + 1,
          updated_at = now()
      where id = toggle_article_like.article_id;

      liked := true;
    end if;
  end if;

  select coalesce(like_count, 0)
  into new_count
  from public.articles
  where id = toggle_article_like.article_id;

  return json_build_object(
    'liked', liked,
    'likeCount', coalesce(new_count, 0)
  );
end;
$$;

create or replace function public.increment_article_share(article_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.articles
  set share_count = coalesce(share_count, 0) + 1,
      updated_at = now()
  where id = article_id
  returning share_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

grant execute on function public.increment_article_read(uuid) to anon, authenticated;
grant execute on function public.toggle_article_like(uuid, text) to anon, authenticated;
grant execute on function public.increment_article_share(uuid) to anon, authenticated;
