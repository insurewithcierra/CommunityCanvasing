// Supabase connection — these are safe to expose publicly (the anon key only
// works through Row Level Security, which restricts every query to the
// signed-in user's own rows).
window.CONFIG = {
  SUPABASE_URL: "https://wpmhpmcivgynquluhvug.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_jST2WBfyquG-Y2Y1i0d3Xg_jtZPn1kx",
  // Google Places API key (New). Restrict it by HTTP referrer + to "Places API
  // (New)" in Google Cloud. Used only for the "Find businesses" search.
  GOOGLE_PLACES_KEY: "AIzaSyDzXD35_CwFW1XgvD5ZsoJExaR2wVYXPdM",
  // Gemini (Generative Language API) key for the ice-breaker generator.
  // Same key works once "Generative Language API" is enabled and added to the
  // key's API restrictions in Google Cloud.
  GEMINI_KEY: "AIzaSyDzXD35_CwFW1XgvD5ZsoJExaR2wVYXPdM",
  GEMINI_MODEL: "gemini-2.0-flash",
};
