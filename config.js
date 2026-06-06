// Supabase connection — these are safe to expose publicly (the anon key only
// works through Row Level Security, which restricts every query to the
// signed-in user's own rows).
window.CONFIG = {
  SUPABASE_URL: "https://wpmhpmcivgynquluhvug.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_jST2WBfyquG-Y2Y1i0d3Xg_jtZPn1kx",
};
