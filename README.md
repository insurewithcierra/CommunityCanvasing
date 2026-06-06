# 🌾 Community Canvassing Tracker

A mobile-first web app for tracking community canvassing and the life-insurance
prospecting pipeline — built from Cierra's prospecting plan.

**Live site:** https://insurewithcierra.github.io/CommunityCanvasing/

## What it tracks

- **Leads / contacts** — name, phone, town, source, business-owner details, life-event
  hooks, follow-up permission, and pipeline status.
- **Businesses** — a to-visit list of target businesses. Auto-find by town & type via
  Google Places, or add manually. Mark visited / not interested, tap-to-call, and
  one-tap convert into a lead.
- **Closed deals** — policy type, annual premium, coverage amount, and commission.
- **Activity** — business visits, canvassing sessions, events, follow-up calls, and
  appointments, each with time spent.
- **Money** — expenses (gas, swag, tent, prize baskets, sponsorships) and paid ad spend.
- **Advertising / social** — Meta ad and organic results: spend, reach, leads captured.
- **Weekly goals** — 2 businesses, 2 hours canvassing, 10 contacts, 3 appointments
  (editable), with progress bars.
- **Weekly report** — one-tap, copy-to-clipboard report matching what the plan promises
  to report to Marcus & Darick.
- **Towns** — La Grange, Smithville, Columbus, Weimar, Schulenburg, Flatonia,
  Hallettsville, Shiner, and Yoakum are all selectable when logging leads and activity
  (no fixed rotation — go anywhere any week).

## Tech

- Static front-end (HTML/CSS/vanilla JS) hosted on **GitHub Pages**.
- **Supabase** for auth + Postgres database, locked down with Row Level Security so
  only the signed-in user can see their data.

## Setup

1. Run `schema.sql` (and `schema_businesses.sql`) in the Supabase SQL Editor.
2. Put your Supabase URL + anon key into `config.js`.
3. Create a login user under Supabase → Authentication.
4. (Optional) Add a Google Places API key to `config.js` to enable the
   "Find businesses on Google" search. Restrict the key by HTTP referrer to the
   GitHub Pages domain and to "Places API (New)".
