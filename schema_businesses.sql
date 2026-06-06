-- ============================================================================
-- Businesses (target canvassing list) — run in the Supabase SQL Editor.
-- Idempotent + RLS-protected like the rest of the schema.
-- ============================================================================
create table if not exists public.businesses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  name             text not null,
  town             text,
  category         text,                 -- search category label (Restaurants, Hardware stores, …)
  address          text,
  phone            text,
  google_place_id  text,                 -- de-dupes auto-added Google results
  status           text not null default 'to_visit', -- to_visit | visited | not_interested | converted
  contact_id       uuid references public.contacts(id) on delete set null,
  notes            text
);

alter table public.businesses enable row level security;

drop policy if exists "owner_all_businesses" on public.businesses;
create policy "owner_all_businesses" on public.businesses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists idx_businesses_user on public.businesses(user_id, status);
-- prevents adding the same Google place twice for one user (enables upsert)
create unique index if not exists uq_businesses_place
  on public.businesses(user_id, google_place_id) where google_place_id is not null;
