// Supabase connection — these are safe to expose publicly (the anon key only
// works through Row Level Security, which restricts every query to the
// signed-in user's own rows).
window.CONFIG = {
  SUPABASE_URL: "https://wpmhpmcivgynquluhvug.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_jST2WBfyquG-Y2Y1i0d3Xg_jtZPn1kx",
  // Google Places API key (New). Restrict it by HTTP referrer + to "Places API
  // (New)" in Google Cloud. Used only for the "Find businesses" search.
  GOOGLE_PLACES_KEY: "AIzaSyDzXD35_CwFW1XgvD5ZsoJExaR2wVYXPdM",
  // Gemini now runs server-side via the "ai" Supabase Edge Function — no key here.
};
