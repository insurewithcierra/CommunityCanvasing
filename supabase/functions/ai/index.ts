// Supabase Edge Function: "ai"
// Server-side proxy for Gemini so the API key never ships in the web app.
// - Requires a signed-in user (JWT verified by Supabase).
// - Enforces a per-user daily limit via the bump_ai_usage() SQL function.
//
// Secrets to set (Supabase → Edge Functions → Secrets, or `supabase secrets set`):
//   GEMINI_KEY    = your Gemini API key
//   GEMINI_MODEL  = gemini-2.5-flash         (optional; this is the default)
//   AI_DAILY_LIMIT = 40                       (optional; per-user calls/day)
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
const DAILY_LIMIT = parseInt(Deno.env.get("AI_DAILY_LIMIT") || "40", 10);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify the caller from their JWT.
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uerr } = await userClient.auth.getUser();
    if (uerr || !user) return json({ error: "Not authenticated" }, 401);

    // Per-user daily rate limit (atomic increment, service role bypasses RLS).
    const admin = createClient(url, service);
    const { data: count, error: rerr } = await admin.rpc("bump_ai_usage", { p_user: user.id });
    if (rerr) return json({ error: "Usage check failed" }, 500);
    if ((count ?? 0) > DAILY_LIMIT) {
      return json({ error: `Daily AI limit reached (${DAILY_LIMIT}). Try again tomorrow.` }, 429);
    }

    const { prompt, maxTokens } = await req.json().catch(() => ({}));
    if (!prompt || typeof prompt !== "string") return json({ error: "Missing prompt" }, 400);

    const key = Deno.env.get("GEMINI_KEY");
    if (!key) return json({ error: "Server missing GEMINI_KEY" }, 500);

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt.slice(0, 6000) }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: Math.min(Number(maxTokens) || 900, 1200),
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );
    const data = await r.json();
    if (!r.ok) return json({ error: data?.error?.message || "AI request failed" }, 502);
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: { text?: string }) => p.text || "").join("").trim();
    return json({ text });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
