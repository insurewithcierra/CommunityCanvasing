# Deploying the `ai` edge function (Gemini proxy)

Do this on your MacBook. It hides the Gemini key server-side and adds a per-user daily limit.

## 1. Run the rate-limit SQL
Supabase → SQL Editor → paste & run `supabase/edge_ai_setup.sql`.

## 2. Install + link the CLI (one time)
```bash
brew install supabase/tap/supabase      # or: npm i -g supabase
supabase login                          # opens browser
cd CommunityCanvasing                   # the cloned repo
supabase link --project-ref wpmhpmcivgynquluhvug
```

## 3. Set the secret(s)
```bash
supabase secrets set GEMINI_KEY=<YOUR_GEMINI_KEY>     # Claude will give you the value
supabase secrets set GEMINI_MODEL=gemini-2.5-flash
# optional: supabase secrets set AI_DAILY_LIMIT=40
```

## 4. Deploy
```bash
supabase functions deploy ai
```

## 5. Tell Claude it's deployed
Then the web app gets switched to call this function and the key is removed from the
public code. (Recommended afterward: rotate/replace the old Gemini key in Google AI
Studio, since it was previously shipped in the client.)

> Prefer no CLI? You can also create the function in the dashboard
> (Edge Functions → Create function → name it `ai` → paste `functions/ai/index.ts`)
> and set the secrets under Edge Functions → Secrets.
