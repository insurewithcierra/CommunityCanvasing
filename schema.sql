-- ============================================================================
-- Community Canvassing Tracker — database schema
-- Safe to run in the Supabase SQL Editor (idempotent).
-- Every table is locked down with Row Level Security so a signed-in user can
-- only ever see and edit their own rows.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CONTACTS / LEADS
-- The core of the pipeline. One row per person met while canvassing.
-- ----------------------------------------------------------------------------
create table if not exists public.contacts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at          timestamptz not null default now(),

  name                text not null,
  phone               text,
  email               text,
  town                text,                 -- where they were met (Schulenburg, etc.)

  -- where this lead came from
  source              text default 'canvassing',  -- canvassing | event | goodie_basket | meta_ad | organic_social | swag_qr | referral | other

  -- business-owner focus
  is_business_owner   boolean not null default false,
  business_name       text,
  business_type       text,                 -- restaurant | contractor | farm_ranch | retail | trucking | other

  life_events         text,                 -- free text: "new baby", "bought home", "married", "hiring employees"
  permission_followup boolean not null default false,
  notes               text,

  -- pipeline status
  status              text not null default 'new',  -- new | contacted | appointment_set | closed_won | closed_lost | not_interested

  -- closed-deal details (filled in when status = closed_won)
  policy_type         text,                 -- term | whole | universal | iul | final_expense | other
  annual_premium      numeric(12,2),
  coverage_amount     numeric(14,2),
  commission          numeric(12,2),
  closed_at           date
);

-- ----------------------------------------------------------------------------
-- ACTIVITIES
-- Every business visit, canvassing session, event, follow-up call, and
-- appointment. Drives the weekly report (visits, events, time spent, etc.).
-- ----------------------------------------------------------------------------
create table if not exists public.activities (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),

  activity_date    date not null default current_date,
  start_time       time,                    -- optional time-of-day (for appointments / calendar)
  type             text not null,           -- business_visit | canvassing | event | follow_up_call | appointment | admin
  title            text,                    -- "Schulenburg Feed & Supply", "Fayette County Fair"
  town             text,
  category         text,                    -- coffee_shop | feed_farm_store | hardware | boutique | farmers_market |
                                            -- livestock_show | county_fair | chamber_event | school_sports | festival |
                                            -- church_event | restaurant | other
  duration_minutes integer default 0,       -- time spent
  contact_id       uuid references public.contacts(id) on delete set null,
  notes            text
);

-- ----------------------------------------------------------------------------
-- EXPENSES
-- Money spent: gas, swag, tent, prize basket, food, sponsorships, etc.
-- (Paid ad spend lives in ad_campaigns to avoid double counting.)
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),

  expense_date  date not null default current_date,
  amount        numeric(12,2) not null default 0,
  category      text,                        -- gas | swag | tent | prize_basket | materials | food | sponsorship | other
  description   text,
  activity_id   uuid references public.activities(id) on delete set null
);

-- ----------------------------------------------------------------------------
-- AD CAMPAIGNS
-- Passive strategy: Meta ads + organic social. Tracks spend and results.
-- ----------------------------------------------------------------------------
create table if not exists public.ad_campaigns (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),

  platform        text default 'meta_facebook', -- meta_facebook | meta_instagram | organic | other
  name            text,
  start_date      date,
  end_date        date,
  spend           numeric(12,2) not null default 0,
  reach           integer default 0,
  impressions     integer default 0,
  leads_captured  integer default 0,
  notes           text
);

-- ----------------------------------------------------------------------------
-- SETTINGS
-- One row per user. Weekly goal targets (defaults match the prospecting plan).
-- ----------------------------------------------------------------------------
create table if not exists public.settings (
  user_id                   uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  weekly_goal_businesses    integer not null default 2,
  weekly_goal_hours         numeric(5,1) not null default 2,
  weekly_goal_contacts      integer not null default 10,
  weekly_goal_appointments  integer not null default 3,
  updated_at                timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Row Level Security — each user only sees their own data
-- ----------------------------------------------------------------------------
alter table public.contacts     enable row level security;
alter table public.activities   enable row level security;
alter table public.expenses     enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.settings     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['contacts','activities','expenses','ad_campaigns','settings']
  loop
    execute format('drop policy if exists "owner_all_%1$s" on public.%1$s;', t);
    execute format($f$
      create policy "owner_all_%1$s" on public.%1$s
        for all
        using (user_id = auth.uid())
        with check (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Helpful indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_contacts_user        on public.contacts(user_id);
create index if not exists idx_contacts_status       on public.contacts(user_id, status);
create index if not exists idx_activities_user_date  on public.activities(user_id, activity_date);
create index if not exists idx_expenses_user_date    on public.expenses(user_id, expense_date);
create index if not exists idx_adcampaigns_user      on public.ad_campaigns(user_id);
