-- WeatherWear v2 — Supabase setup
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → Run).
-- Safe to re-run: everything uses IF NOT EXISTS / idempotent guards.

-- ─── Wardrobe table ──────────────────────────────────────────────────────────
create table if not exists public.wardrobe (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  category    text not null,
  color       text,
  color_hex   text,
  season      text,
  material    text,
  brand       text,
  model       text,
  formality   text,
  image_url   text,
  source      text,
  created_at  bigint not null            -- client epoch ms (matches ClothingItem.createdAt)
);

create index if not exists wardrobe_user_created_idx
  on public.wardrobe (user_id, created_at desc);

-- ─── Row Level Security — each user sees only their own rows ──────────────────
alter table public.wardrobe enable row level security;

drop policy if exists "wardrobe_select_own" on public.wardrobe;
create policy "wardrobe_select_own" on public.wardrobe
  for select using (auth.uid() = user_id);

drop policy if exists "wardrobe_insert_own" on public.wardrobe;
create policy "wardrobe_insert_own" on public.wardrobe
  for insert with check (auth.uid() = user_id);

drop policy if exists "wardrobe_update_own" on public.wardrobe;
create policy "wardrobe_update_own" on public.wardrobe
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wardrobe_delete_own" on public.wardrobe;
create policy "wardrobe_delete_own" on public.wardrobe
  for delete using (auth.uid() = user_id);

-- ─── Storage bucket for item images ───────────────────────────────────────────
-- Public read (URLs are unguessable: wardrobe/<uid>/<itemId>.jpg); writes are owner-only.
insert into storage.buckets (id, name, public)
values ('wardrobe', 'wardrobe', true)
on conflict (id) do update set public = true;

drop policy if exists "wardrobe_obj_read" on storage.objects;
create policy "wardrobe_obj_read" on storage.objects
  for select using (bucket_id = 'wardrobe');

drop policy if exists "wardrobe_obj_insert_own" on storage.objects;
create policy "wardrobe_obj_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wardrobe_obj_update_own" on storage.objects;
create policy "wardrobe_obj_update_own" on storage.objects
  for update using (
    bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wardrobe_obj_delete_own" on storage.objects;
create policy "wardrobe_obj_delete_own" on storage.objects
  for delete using (
    bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text
  );
