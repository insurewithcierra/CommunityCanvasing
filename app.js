/* =========================================================================
   Community Canvassing Tracker
   ========================================================================= */
"use strict";

/* ---------- reference data (from the prospecting plan) ---------- */
// Towns offered when logging leads and activity (no fixed rotation — pick any)
const TOWNS = ["La Grange","Smithville","Columbus","Weimar","Schulenburg","Flatonia","Hallettsville","Shiner","Yoakum","Other"];

const SOURCE_LABELS = {
  canvassing:"Canvassing", event:"Event", goodie_basket:"Goodie-basket drawing",
  meta_ad:"Meta ad", organic_social:"Organic social", swag_qr:"Swag QR code",
  referral:"Referral", other:"Other",
};
const BIZ_TYPES = {
  restaurant:"Restaurant", contractor:"Contractor", farm_ranch:"Farm / Ranch",
  retail:"Retail shop", trucking:"Trucking", other:"Other business",
};
const CATEGORIES = {
  coffee_shop:"Coffee shop", feed_farm_store:"Feed / farm supply", hardware:"Hardware store",
  boutique:"Boutique", farmers_market:"Farmers market", livestock_show:"Livestock show",
  county_fair:"County fair", chamber_event:"Chamber event", school_sports:"School sporting event",
  festival:"Community festival", church_event:"Church bazaar / fundraiser",
  restaurant:"Restaurant (lunch)", other:"Other",
};
const STATUS_LABELS = {
  new:"New", contacted:"Contacted", appointment_set:"Appt set",
  closed_won:"Closed ✓", closed_lost:"Closed (lost)", not_interested:"Not interested",
};
const POLICY_TYPES = {
  term:"Term", whole:"Whole life", universal:"Universal", iul:"Indexed UL (IUL)",
  final_expense:"Final expense", other:"Other",
};
const EXPENSE_CATS = {
  gas:"Gas / mileage", swag:"Branded swag", tent:"Pop-up tent / signage",
  prize_basket:"Prize basket", materials:"Materials", food:"Food / lunch",
  sponsorship:"Sponsorship", other:"Other",
};
const PLATFORMS = {
  meta_facebook:"Facebook ad", meta_instagram:"Instagram ad",
  organic:"Organic social", other:"Other",
};
const ACT_ICON = {
  business_visit:"building", canvassing:"map-pin", event:"flag",
  follow_up_call:"phone", appointment:"calendar", admin:"folder",
};
const ACT_LABEL = {
  business_visit:"Business visit", canvassing:"Canvassing", event:"Event",
  follow_up_call:"Follow-up call", appointment:"Appointment", admin:"Admin",
};

/* ---------- icon set (lightweight inline SVG, Lucide-style) ---------- */
const ICONS = {
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  store:'<path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7"/><path d="M4 11v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9"/><path d="M2 7h20"/><path d="M9 21v-6h6v6"/>',
  building:'<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/><path d="M10 22v-4h4v4"/>',
  clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>',
  chart:'<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  chevronLeft:'<path d="m15 18-6-6 6-6"/>',
  chevronRight:'<path d="m9 18 6-6-6-6"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  swipe:'<path d="M9 6 4 11l5 5"/><path d="M15 6l5 5-5 5"/><path d="M4 11h16"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  lightbulb:'<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  message:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  calendarPlus:'<path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7"/><path d="M16 2v4M8 2v4M3 10h18M19 16v6M16 19h6"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  checkCircle:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  userPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  ban:'<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  pencil:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  dollar:'<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  megaphone:'<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  mapPin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  folder:'<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  sparkles:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/>',
};
function ic(name, cls){ return `<svg class="ic ${cls||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||""}</svg>`; }

// Search categories for "Find businesses on Google".
// q = the Google text query; type = the lead business_type used if converted.
const BIZ_SEARCH = [
  {label:"Restaurants",          q:"restaurants",                  type:"restaurant"},
  {label:"Coffee shops",         q:"coffee shops",                 type:"retail"},
  {label:"Feed & farm supply",   q:"feed and farm supply stores",  type:"farm_ranch"},
  {label:"Hardware stores",      q:"hardware stores",              type:"retail"},
  {label:"Boutiques / retail",   q:"boutique clothing stores",     type:"retail"},
  {label:"Contractors",          q:"general contractors",          type:"contractor"},
  {label:"Auto repair",          q:"auto repair shops",            type:"other"},
  {label:"Trucking companies",   q:"trucking companies",           type:"trucking"},
  {label:"Farm & ranch",         q:"farms and ranches",            type:"farm_ranch"},
  {label:"Other",                q:"local businesses",             type:"other"},
];
const BUS_STATUS = {
  to_visit:"To visit", visited:"Visited", not_interested:"Not interested", converted:"Lead created",
};
function bizTypeForCategory(label){ const m=BIZ_SEARCH.find(x=>x.label===label); return m?m.type:"other"; }

/* ---------- state ---------- */
let sb = null;
let state = { contacts:[], activities:[], expenses:[], ads:[], businesses:[], settings:null };
let busFilter = "all";
const VIEWS = ["dashboard","contacts","businesses","activity","reports"];
let currentView = (()=>{ try{ const v=localStorage.getItem("cc_view"); return VIEWS.includes(v)?v:"dashboard"; }catch(e){ return "dashboard"; } })();
let contactFilter = "all";

/* ---------- tiny helpers ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = (s) => (s==null?"":String(s)).replace(/[&<>"']/g, c => (
  {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = (n) => "$" + (Number(n)||0).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2});
const hrs = (min) => { const h=(Number(min)||0)/60; return (Math.round(h*10)/10) + "h"; };
function fmtDate(d){ if(!d) return ""; const x=new Date(d+"T00:00:00"); return x.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function fmtTime(t){ if(!t) return ""; const [h,m]=String(t).split(":"); const hh=((+h+11)%12)+1; return hh+":"+m+(+h<12?" AM":" PM"); }
function todayISO(){ return new Date().toLocaleDateString("en-CA"); } // YYYY-MM-DD local

function weekRange(date=new Date()){
  const d = new Date(date); const day = (d.getDay()+6)%7; // Mon=0
  const start = new Date(d); start.setDate(d.getDate()-day); start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999);
  return {start, end};
}
function monthRange(date=new Date()){
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth()+1, 0, 23,59,59,999);
  return {start, end};
}
function inRange(iso, {start,end}){ if(!iso) return false; const t=new Date(iso).getTime(); return t>=start.getTime() && t<=end.getTime(); }
function rangeLabel({start,end}){
  const o={month:"short",day:"numeric"};
  return start.toLocaleDateString("en-US",o)+" – "+end.toLocaleDateString("en-US",o)+", "+end.getFullYear();
}

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.remove("hidden");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.add("hidden"),2200);
}

/* ---------- theme (light / dark) ---------- */
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content", t==="dark" ? "#11171f" : "#ffffff");
  const btn=$("#theme-btn"); if(btn) btn.innerHTML=ic(t==="dark" ? "sun" : "moon");
}
function initTheme(){
  let t; try{ t=localStorage.getItem("cc_theme"); }catch(e){}
  if(t!=="dark" && t!=="light"){
    t = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  applyTheme(t);
}
function toggleTheme(){
  const next = document.documentElement.getAttribute("data-theme")==="dark" ? "light" : "dark";
  try{ localStorage.setItem("cc_theme", next); }catch(e){}
  applyTheme(next);
}

/* =========================================================================
   AUTH
   ========================================================================= */
function initClient(){
  if(!window.CONFIG || CONFIG.SUPABASE_URL.startsWith("__")){
    document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;text-align:center">'+
      '<h2>⚙️ Not configured yet</h2><p>Supabase credentials still need to be added to config.js.</p></div>';
    return false;
  }
  sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return true;
}

async function checkSession(){
  const { data } = await sb.auth.getSession();
  if(data.session){ showApp(); } else { showLogin(); }
}

function showLogin(){ $("#login-view").classList.remove("hidden"); $("#app-view").classList.add("hidden"); }
function showApp(){ $("#login-view").classList.add("hidden"); $("#app-view").classList.remove("hidden"); loadAll(); }

async function doLogin(e){
  e.preventDefault();
  const btn=$("#login-btn"); const err=$("#login-error"); err.textContent="";
  btn.disabled=true; btn.textContent="Signing in…";
  const email=$("#login-email").value.trim(); const password=$("#login-password").value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled=false; btn.textContent="Sign in";
  if(error){ err.textContent=error.message; return; }
  showApp();
}

/* =========================================================================
   DATA
   ========================================================================= */
async function loadAll(){
  $("#main").querySelectorAll(".view").forEach(v=>{});
  setView(currentView);
  $("#view-"+currentView).innerHTML = '<div class="spinner">Loading…</div>';

  const [c,a,e,ad,b] = await Promise.all([
    sb.from("contacts").select("*").order("created_at",{ascending:false}),
    sb.from("activities").select("*").order("activity_date",{ascending:false}),
    sb.from("expenses").select("*").order("expense_date",{ascending:false}),
    sb.from("ad_campaigns").select("*").order("created_at",{ascending:false}),
    sb.from("businesses").select("*").order("created_at",{ascending:false}),
  ]);
  state.contacts = c.data||[]; state.activities=a.data||[]; state.expenses=e.data||[];
  state.ads=ad.data||[]; state.businesses=b.data||[];

  // settings (create defaults if missing)
  let { data:s } = await sb.from("settings").select("*").maybeSingle();
  if(!s){
    const { data:ins } = await sb.from("settings").insert({}).select().maybeSingle();
    s = ins || { weekly_goal_businesses:2, weekly_goal_hours:2, weekly_goal_contacts:10, weekly_goal_appointments:3 };
  }
  state.settings = s;
  render();
}

async function save(table, row, id){
  let res;
  if(id){ res = await sb.from(table).update(row).eq("id",id).select(); }
  else  { res = await sb.from(table).insert(row).select(); }
  if(res.error){ toast("Error: "+res.error.message); return false; }
  return (res.data && res.data[0]) || true;   // saved row (truthy), or true
}
async function remove(table, id){
  const { error } = await sb.from(table).delete().eq("id",id);
  if(error){ toast("Error: "+error.message); return false; }
  return true;
}

/* =========================================================================
   NAV / RENDER
   ========================================================================= */
function setView(v){
  if(!VIEWS.includes(v)) v="dashboard";
  currentView=v;
  try{ localStorage.setItem("cc_view", v); }catch(e){}
  $$(".view").forEach(x=>x.classList.add("hidden"));
  $("#view-"+v).classList.remove("hidden");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.view===v));
  const titles={dashboard:"Dashboard",contacts:"Leads",businesses:"Businesses",activity:"Activity",reports:"Weekly Report"};
  $("#top-context").textContent=titles[v];
  if(v==="businesses") setTimeout(peekFirstSwipe, 120);
}
function render(){
  renderDashboard();
  renderContacts();
  renderBusinesses();
  renderActivity();
  renderReports();
}

/* ---------------- DASHBOARD ---------------- */
function renderDashboard(){
  const wk=weekRange(), mo=monthRange();
  const g=state.settings;
  const acts=state.activities;

  const wkVisits = acts.filter(a=>a.type==="business_visit" && inRange(a.activity_date,wk)).length;
  const wkHoursMin = acts.filter(a=>["canvassing","event"].includes(a.type) && inRange(a.activity_date,wk))
                         .reduce((s,a)=>s+(a.duration_minutes||0),0);
  const wkContacts = state.contacts.filter(c=>inRange(c.created_at,wk)).length;
  const wkAppts = acts.filter(a=>a.type==="appointment" && inRange(a.activity_date,wk)).length;

  const openLeads = state.contacts.filter(c=>["new","contacted","appointment_set"].includes(c.status)).length;
  const won = state.contacts.filter(c=>c.status==="closed_won");
  const sumPrem = won.reduce((s,c)=>s+(+c.annual_premium||0),0);
  const sumCov  = won.reduce((s,c)=>s+(+c.coverage_amount||0),0);
  const sumComm = won.reduce((s,c)=>s+(+c.commission||0),0);

  const moExp = state.expenses.filter(x=>inRange(x.expense_date,mo)).reduce((s,x)=>s+(+x.amount||0),0);
  const moAds = state.ads.filter(x=>inRange(x.start_date||x.created_at,mo)).reduce((s,x)=>s+(+x.spend||0),0);
  const moTimeMin = acts.filter(a=>inRange(a.activity_date,mo)).reduce((s,a)=>s+(a.duration_minutes||0),0);

  // Today & due
  const today=todayISO();
  const apptsToday = acts.filter(a=>a.type==="appointment" && a.activity_date===today)
    .sort((a,b)=>String(a.start_time||"").localeCompare(String(b.start_time||"")));
  const followsDue = state.contacts.filter(c=> c.follow_up_date && c.follow_up_date<=today &&
      !["closed_won","closed_lost","not_interested"].includes(c.status))
    .sort((a,b)=>String(a.follow_up_date).localeCompare(String(b.follow_up_date)));
  const todayItems = [
    ...apptsToday.map(a=>`<div class="list-item" data-edit-activity="${a.id}">
      <div class="li-ic">${ic('calendar')}</div>
      <div class="li-main"><div class="li-title">${esc(a.title||"Appointment")}</div>
        <div class="li-sub">Appointment${a.town?" · "+esc(a.town):""}</div></div>
      <div class="li-right">${a.start_time?fmtTime(a.start_time):"today"}</div></div>`),
    ...followsDue.map(c=>{ const overdue=c.follow_up_date<today;
      return `<div class="list-item" data-edit-contact="${c.id}">
      <div class="li-ic ${overdue?'flag-red':''}">${ic('phone')}</div>
      <div class="li-main"><div class="li-title">${esc(c.name)}</div>
        <div class="li-sub">Follow up${c.town?" · "+esc(c.town):""}${c.phone?" · "+esc(c.phone):""}</div></div>
      <div class="li-right">${overdue?`<span style="color:var(--red)">${fmtDate(c.follow_up_date)}</span>`:"due"}</div></div>`;
    })
  ].join("");
  const todayCard = todayItems ? `<div class="section-title">Today &amp; due</div>${todayItems}` : "";

  const goal=(label,val,target,unit="")=>{
    const pct=target>0?Math.min(100,Math.round(val/target*100)):0;
    return `<div class="goal">
      <div class="goal-row"><span>${label}</span><span class="val">${val}${unit} / ${target}${unit}</span></div>
      <div class="bar"><i class="${pct>=100?'done':''}" style="width:${pct}%"></i></div></div>`;
  };

  $("#view-dashboard").innerHTML = `
    <div class="banner">${ic('calendar')}<b>This week:</b> <span class="muted">${rangeLabel(wk)}</span></div>

    ${todayCard}

    <div class="section-title">Weekly goals</div>
    <div class="card">
      ${goal("Businesses visited", wkVisits, g.weekly_goal_businesses)}
      ${goal("Hours canvassing", Math.round(wkHoursMin/60*10)/10, g.weekly_goal_hours, "h")}
      ${goal("New contacts", wkContacts, g.weekly_goal_contacts)}
      ${goal("Appointments set", wkAppts, g.weekly_goal_appointments)}
    </div>

    <div class="section-title">Pipeline</div>
    <div class="stat-grid">
      <div class="stat"><div class="num">${openLeads}</div><div class="lbl">Open leads</div></div>
      <div class="stat"><div class="num">${won.length}</div><div class="lbl">Policies closed</div></div>
      <div class="stat money"><div class="num">${money(sumPrem)}</div><div class="lbl">Annual premium (closed)</div></div>
      <div class="stat money"><div class="num">${money(sumComm)}</div><div class="lbl">Commission (closed)</div></div>
    </div>
    <div class="stat-grid" style="margin-top:10px">
      <div class="stat"><div class="num">${money(sumCov)}</div><div class="lbl">Coverage placed</div></div>
      <div class="stat"><div class="num">${state.contacts.length}</div><div class="lbl">Total contacts</div></div>
    </div>

    <div class="section-title">This month</div>
    <div class="stat-grid">
      <div class="stat money"><div class="num">${money(moExp+moAds)}</div><div class="lbl">Money invested</div></div>
      <div class="stat"><div class="num">${hrs(moTimeMin)}</div><div class="lbl">Time in the field</div></div>
    </div>
  `;
}

/* ---------------- CONTACTS ---------------- */
function renderContacts(){
  const filters=[["all","All"],["new","New"],["contacted","Contacted"],
    ["appointment_set","Appt set"],["closed_won","Closed ✓"]];
  let list=state.contacts.slice();
  if(contactFilter!=="all") list=list.filter(c=>c.status===contactFilter);

  const items = list.length ? list.map(c=>{
    const sub=[c.business_name||"", c.town||"", c.phone||""].filter(Boolean).map(esc).join(" · ");
    const val = c.status==="closed_won" && c.annual_premium ? money(c.annual_premium)+"/yr" : "";
    return `<div class="list-item" data-edit-contact="${c.id}">
      <div class="li-ic">${ic(c.is_business_owner?'building':'user')}</div>
      <div class="li-main"><div class="li-title">${esc(c.name)}</div>
        ${sub?`<div class="li-sub">${sub}</div>`:""}
        ${c.life_events?`<div class="li-sub hook">${ic('lightbulb','ic-sm')} ${esc(c.life_events)}</div>`:""}</div>
      <div class="li-right"><span class="pill ${c.status}">${STATUS_LABELS[c.status]||c.status}</span>
        ${val?`<div style="margin-top:6px;font-weight:700;color:var(--green)">${val}</div>`:""}</div>
    </div>`;
  }).join("") : `<div class="empty">${ic('users','ic-xl')}<p>No leads yet.<br>Tap + to add your first contact.</p></div>`;

  $("#view-contacts").innerHTML = `
    <div class="chips">${filters.map(([k,l])=>`<button class="chip ${contactFilter===k?'active':''}" data-filter="${k}">${l}</button>`).join("")}</div>
    ${items}`;
}

/* ---------------- BUSINESSES ---------------- */
const BUS_PILL = { to_visit:"new", visited:"contacted", converted:"closed_won", not_interested:"not_interested" };
let bizResults = { places:[], town:"", cat:"" };

function renderBusinesses(){
  const key = window.CONFIG.GOOGLE_PLACES_KEY || "";
  const hasKey = key && !key.startsWith("__");
  const filters=[["all","All"],["to_visit","To visit"],["visited","Visited"],["converted","Lead created"],["green","🟢 Green"],["red","🔴 Red"]];
  let list=state.businesses.slice();
  if(busFilter==="green"||busFilter==="red") list=list.filter(b=>b.flag===busFilter);
  else if(busFilter!=="all") list=list.filter(b=>b.status===busFilter);

  const items = list.length ? list.map(b=>{
    const sub=[b.category,b.address,b.phone].filter(Boolean).map(esc).join(" · ");
    return `<div class="swipe" data-id="${b.id}">
      <div class="swipe-bg left">
        <button class="swact appt">${ic('calendar')}<span>Appt</span></button>
        <button class="swact visit">${ic('clipboard')}<span>Visit</span></button>
      </div>
      <div class="swipe-bg right"><button class="swact del">${ic('trash')}<span>Delete</span></button></div>
      <div class="swipe-fg list-item">
        <div class="li-ic ${b.flag?('flag-'+b.flag):''}">${ic('store')}</div>
        <div class="li-main"><div class="li-title">${b.flag?`<span class="fdot ${b.flag}"></span>`:""}${esc(b.name)}</div>
          <div class="li-sub">${esc(b.town||"")}${sub?(b.town?" · ":"")+sub:""}</div></div>
        <div class="li-right"><span class="pill ${BUS_PILL[b.status]||'new'}">${BUS_STATUS[b.status]||b.status}</span></div>
      </div>
    </div>`;
  }).join("") : `<div class="empty">${ic('store','ic-xl')}<p>No businesses yet.<br>${hasKey?'Search above, or tap + to add one.':'Tap + to add a business.'}</p></div>`;

  const find = `
    <div class="card">
      <div class="section-title" style="margin:0 0 8px">Find businesses on Google</div>
      ${hasKey?`
      <div class="field"><label>Search by name or keyword</label>
        <input id="biz-q" type="search" enterkeyhint="search" placeholder="e.g. Joe's Welding, barber shop, coffee"></div>
      <div class="field-row">
        <div class="field"><label>Town</label><select id="biz-town">${townOpts()}</select></div>
        <div class="field"><label>Type</label><select id="biz-cat">${BIZ_SEARCH.map(s=>`<option>${esc(s.label)}</option>`).join("")}</select></div>
      </div>
      <button class="btn btn-primary btn-block" id="biz-find">${ic('search')} Find</button>
      <div class="muted" style="font-size:12px;margin-top:8px">Type a name/keyword, or just pick a town &amp; type.</div>
      <div id="biz-results"></div>`
      :`<div class="muted" style="font-size:14px">Google search isn't enabled yet — add businesses manually with the + button, or ask to turn on Google auto-search (pull businesses by town &amp; type).</div>`}
    </div>`;

  let hintOff=false; try{ hintOff=!!localStorage.getItem("cc_hint_biz"); }catch(e){}
  const hint = (list.length && !hintOff)
    ? `<div class="hint" id="biz-hint">${ic('swipe','ic-sm')}<span>Swipe a row <b>left</b> to delete, or <b>right</b> for quick actions.</span><button class="hint-x" data-hint="biz" aria-label="Dismiss">${ic('x','ic-sm')}</button></div>`
    : "";

  $("#view-businesses").innerHTML = `
    ${find}
    <div class="chips">${filters.map(([k,l])=>`<button class="chip ${busFilter===k?'active':''}" data-bizfilter="${k}">${l}</button>`).join("")}</div>
    ${hint}
    ${items}`;
  attachBizSwipe();
  const qEl=$("#biz-q");
  if(qEl) qEl.addEventListener("keydown",(e)=>{ if(e.key==="Enter"){ e.preventDefault(); findBusinesses(); } });
}

// One-time nudge so the swipe affordance is discoverable.
function peekFirstSwipe(){
  if(currentView!=="businesses") return;
  try{ if(localStorage.getItem("cc_peek_biz")) return; }catch(e){}
  const row=$("#view-businesses .swipe"); if(!row) return;
  const fg=row.querySelector(".swipe-fg");
  const rightW=(row.querySelector(".swipe-bg.right")||{}).offsetWidth||74;
  try{ localStorage.setItem("cc_peek_biz","1"); }catch(e){}
  fg.style.transition="transform .35s ease";
  setTimeout(()=>{ fg.style.transform=`translateX(${-rightW}px)`;
    setTimeout(()=>{ fg.style.transform="translateX(0)"; }, 700); }, 450);
}

/* iOS-style swipe actions on business rows: left=appt/visit, right=delete */
function attachBizSwipe(){
  $$("#view-businesses .swipe").forEach(row=>{
    const fg=row.querySelector(".swipe-fg");
    const biz=()=>state.businesses.find(b=>b.id===row.dataset.id);
    let startX=0,startY=0,dx=0,openX=0,leftW=0,rightW=0,dragging=false,moved=false;
    const setX=(x)=>{ fg.style.transform=`translateX(${x}px)`; };
    fg.addEventListener("touchstart",(e)=>{
      const t=e.touches[0]; startX=t.clientX; startY=t.clientY; dragging=true; moved=false;
      leftW=row.querySelector(".swipe-bg.left").offsetWidth;
      rightW=row.querySelector(".swipe-bg.right").offsetWidth;
      fg.style.transition="none";
    },{passive:true});
    fg.addEventListener("touchmove",(e)=>{
      if(!dragging) return; const t=e.touches[0];
      const ddx=t.clientX-startX, ddy=t.clientY-startY;
      if(!moved && Math.abs(ddx)<Math.abs(ddy)){ dragging=false; return; } // vertical scroll
      if(!moved && Math.abs(ddx)<6) return;                                 // wait for intent
      moved=true;
      if(e.cancelable) e.preventDefault();                                  // claim horizontal gesture
      dx=Math.max(-rightW, Math.min(leftW, openX+ddx));
      setX(dx);
    },{passive:false});
    fg.addEventListener("touchend",()=>{
      if(!dragging) return; dragging=false; fg.style.transition="";
      openX = dx>leftW*0.45 ? leftW : dx<-rightW*0.45 ? -rightW : 0;
      setX(openX);
    });
    fg.addEventListener("click",()=>{
      if(moved){ moved=false; return; }
      if(openX!==0){ openX=0; setX(0); return; }
      businessActions(biz());
    });
    row.querySelector(".swact.appt").onclick=(e)=>{ e.stopPropagation(); const b=biz(); activityForm("appointment",{title:b.name,town:b.town,contact_id:b.contact_id||""}); };
    row.querySelector(".swact.visit").onclick=(e)=>{ e.stopPropagation(); logVisitForBusiness(biz()); };
    row.querySelector(".swact.del").onclick=async(e)=>{ e.stopPropagation(); const b=biz();
      if(confirm(`Delete ${b.name}?`)){ if(await remove("businesses",b.id)){ await loadAll(); toast("Deleted"); } } };
  });
}

async function findBusinesses(){
  const key=window.CONFIG.GOOGLE_PLACES_KEY;
  const qEl=$("#biz-q"); const freeText=qEl?qEl.value.trim():"";
  const town=$("#biz-town").value, cat=$("#biz-cat").value;
  let query;
  if(freeText){
    query=freeText;
    if(town && town!=="Other" && !new RegExp(town.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i").test(freeText)) query+=" in "+town;
    if(!/\b(tx|texas)\b/i.test(query)) query+=", TX";
  } else {
    const entry=BIZ_SEARCH.find(s=>s.label===cat)||BIZ_SEARCH[0];
    query=`${entry.q}${town&&town!=="Other"?" in "+town:""}, TX`;
  }
  const btn=$("#biz-find"); btn.disabled=true; btn.textContent="Searching…";
  const out=$("#biz-results"); out.innerHTML='<div class="spinner">Searching Google…</div>';
  try{
    const r=await fetch("https://places.googleapis.com/v1/places:searchText",{
      method:"POST",
      headers:{ "Content-Type":"application/json", "X-Goog-Api-Key":key,
        "X-Goog-FieldMask":"places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber" },
      body:JSON.stringify({ textQuery:query, regionCode:"US", maxResultCount:20 })
    });
    const data=await r.json();
    if(!r.ok){ out.innerHTML=`<div class="empty" style="padding:18px">${esc((data.error&&data.error.message)||"Search failed")}</div>`; }
    else { bizResults={places:data.places||[], town, cat}; renderBizResults(); }
  }catch(err){ out.innerHTML=`<div class="empty" style="padding:18px">Network error: ${esc(err.message)}</div>`; }
  btn.disabled=false; btn.innerHTML=ic('search')+" Find";
}

function renderBizResults(){
  const out=$("#biz-results");
  const have=new Set(state.businesses.map(b=>b.google_place_id).filter(Boolean));
  const ps=bizResults.places;
  if(!ps.length){ out.innerHTML='<div class="empty" style="padding:18px">No results — try a different type or town.</div>'; return; }
  out.innerHTML = `
    <div style="margin:14px 0 8px"><b>${ps.length} found</b>
      <span class="muted" style="font-size:13px"> — swipe a row right to add</span></div>
    ${ps.map((p,i)=>{
      const exists=have.has(p.id);
      const name=(p.displayName&&p.displayName.text)||"(unnamed)";
      const meta=[p.formattedAddress,p.nationalPhoneNumber].filter(Boolean).map(esc).join(" · ");
      if(exists){
        return `<div class="list-item" style="opacity:.6"><div class="li-ic ok">${ic('check')}</div>
          <div class="li-main"><div class="li-title">${esc(name)}</div>${meta?`<div class="li-sub">${meta}</div>`:""}
          <div class="li-sub" style="color:var(--green)">Already in your list</div></div></div>`;
      }
      return `<div class="swipe" data-resi="${i}">
        <div class="swipe-bg left"><button class="swact addone">${ic('plus')}<span>Add</span></button></div>
        <div class="swipe-fg list-item"><div class="li-ic">${ic('store')}</div>
          <div class="li-main"><div class="li-title">${esc(name)}</div>${meta?`<div class="li-sub">${meta}</div>`:""}</div></div>
      </div>`;
    }).join("")}`;
  attachResultSwipe();
}

function attachResultSwipe(){
  $$("#biz-results .swipe").forEach(row=>{
    const fg=row.querySelector(".swipe-fg");
    let startX=0,startY=0,dx=0,openX=0,leftW=0,dragging=false,moved=false;
    const setX=(x)=>{ fg.style.transform=`translateX(${x}px)`; };
    const idx=()=>+row.dataset.resi;
    fg.addEventListener("touchstart",(e)=>{ const t=e.touches[0]; startX=t.clientX; startY=t.clientY;
      dragging=true; moved=false; leftW=row.querySelector(".swipe-bg.left").offsetWidth; fg.style.transition="none"; },{passive:true});
    fg.addEventListener("touchmove",(e)=>{ if(!dragging) return; const t=e.touches[0];
      const ddx=t.clientX-startX, ddy=t.clientY-startY;
      if(!moved && Math.abs(ddx)<Math.abs(ddy)){ dragging=false; return; }
      if(!moved && Math.abs(ddx)<6) return;
      moved=true; if(e.cancelable) e.preventDefault();
      dx=Math.max(0, Math.min(leftW, openX+ddx)); setX(dx); },{passive:false});
    fg.addEventListener("touchend",()=>{ if(!dragging) return; dragging=false; fg.style.transition="";
      if(dx>leftW*0.85){ addOneBusiness(idx()); return; }   // full swipe = add immediately
      openX = dx>leftW*0.45 ? leftW : 0; setX(openX); });
    fg.addEventListener("click",()=>{ if(moved){ moved=false; return; } if(openX!==0){ openX=0; setX(0); } });
    row.querySelector(".swact.addone").onclick=(e)=>{ e.stopPropagation(); addOneBusiness(idx()); };
  });
}

async function addOneBusiness(i){
  const p=bizResults.places[i]; if(!p) return;
  if(p.id && state.businesses.some(b=>b.google_place_id===p.id)){ renderBizResults(); return; }
  const { data:{user} } = await sb.auth.getUser();
  const row={ user_id:user.id, name:(p.displayName&&p.displayName.text)||"(unnamed)",
    town:bizResults.town, category:bizResults.cat, address:p.formattedAddress||null,
    phone:p.nationalPhoneNumber||null, google_place_id:p.id||null, status:"to_visit" };
  const { data, error } = await sb.from("businesses").insert(row).select();
  if(error){ toast("Error: "+error.message); return; }
  if(data&&data[0]) state.businesses.unshift(data[0]);
  renderBizResults();                       // refresh results to show it as added
  toast("Added "+row.name);
}

function businessActions(biz){
  openModal(biz.name, `
    <div class="muted" style="margin-bottom:12px">${esc([BUS_STATUS[biz.status],biz.category,biz.town,biz.address,biz.phone].filter(Boolean).join(" · "))}</div>
    <div class="flag-row">
      <button class="flag-btn green ${biz.flag==='green'?'on':''}" data-ba="flag-green">🟢 Good</button>
      <button class="flag-btn red ${biz.flag==='red'?'on':''}" data-ba="flag-red">🔴 Caution</button>
      <button class="flag-btn ${!biz.flag?'on':''}" data-ba="flag-clear">None</button>
    </div>
    ${biz.phone?`<a class="btn btn-block" href="tel:${esc(biz.phone)}">${ic('phone')} Call ${esc(biz.phone)}</a>`:""}
    <button class="btn btn-block" data-ba="ice" style="margin-top:8px">${ic('message')} Ice breaker</button>
    <button class="btn btn-block" data-ba="appt" style="margin-top:8px">${ic('calendar')} Schedule appointment</button>
    <button class="btn btn-block" data-ba="visit" style="margin-top:8px">${ic('clipboard')} Log a visit</button>
    <button class="btn btn-block" data-ba="visited" style="margin-top:8px">${ic('checkCircle')} Mark visited</button>
    <button class="btn btn-primary btn-block" data-ba="lead" style="margin-top:8px">${ic('userPlus')} Convert to lead</button>
    <button class="btn btn-block" data-ba="not" style="margin-top:8px">${ic('ban')} Not interested</button>
    <button class="btn btn-block" data-ba="edit" style="margin-top:8px">${ic('pencil')} Edit details</button>
    <button class="btn btn-danger btn-block" data-ba="del" style="margin-top:8px">${ic('trash')} Delete</button>`);
  const body=$("#modal-body");
  body.querySelector('[data-ba="flag-green"]').onclick=()=>setBusinessFlag(biz.id,"green");
  body.querySelector('[data-ba="flag-red"]').onclick=()=>setBusinessFlag(biz.id,"red");
  body.querySelector('[data-ba="flag-clear"]').onclick=()=>setBusinessFlag(biz.id,null);
  body.querySelector('[data-ba="ice"]').onclick=()=>openIceBreaker(biz);
  body.querySelector('[data-ba="appt"]').onclick=()=>activityForm("appointment", { title:biz.name, town:biz.town, contact_id:biz.contact_id||"" });
  body.querySelector('[data-ba="visit"]').onclick=()=>logVisitForBusiness(biz);
  body.querySelector('[data-ba="visited"]').onclick=()=>setBusinessStatus(biz.id,"visited");
  body.querySelector('[data-ba="lead"]').onclick=()=>convertBusinessToLead(biz);
  body.querySelector('[data-ba="not"]').onclick=()=>setBusinessStatus(biz.id,"not_interested");
  body.querySelector('[data-ba="edit"]').onclick=()=>businessForm(biz);
  body.querySelector('[data-ba="del"]').onclick=async()=>{
    if(confirm("Delete this business?")){ if(await remove("businesses",biz.id)){ closeModal(); await loadAll(); toast("Deleted"); } }
  };
}

async function setBusinessStatus(id,status){
  const { error } = await sb.from("businesses").update({status}).eq("id",id);
  if(error){ toast(error.message); return; }
  closeModal(); await loadAll(); toast("Updated");
}
async function setBusinessFlag(id,flag){
  const { error } = await sb.from("businesses").update({flag}).eq("id",id);
  if(error){ toast(error.message); return; }
  closeModal(); await loadAll(); toast(flag==="green"?"Flagged green":flag==="red"?"Flagged red":"Flag cleared");
}
function logVisitForBusiness(biz){
  activityForm("business_visit", { title:biz.name, town:biz.town }, async()=>{
    await sb.from("businesses").update({status:"visited"}).eq("id",biz.id);
  });
}
function convertBusinessToLead(biz){
  contactForm({
    name:"", phone:biz.phone||"", town:biz.town||"", is_business_owner:true,
    business_name:biz.name, business_type:bizTypeForCategory(biz.category),
    source:"canvassing", status:"contacted",
  }, async (saved)=>{
    await sb.from("businesses").update({ status:"converted", contact_id:saved.id }).eq("id",biz.id);
  });
}
function businessForm(rec={}, onSaved){
  const r=rec;
  openModal(r.id?"Edit business":"Add business", `
    <form id="f">
      <div class="field"><label>Name *</label><input name="name" required value="${esc(r.name)}"></div>
      <div class="field-row">
        <div class="field"><label>Town</label><select name="town">${townOpts(r.town)}</select></div>
        <div class="field"><label>Type</label><select name="category">${BIZ_SEARCH.map(s=>`<option ${s.label===r.category?"selected":""}>${esc(s.label)}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label>Address</label><input name="address" value="${esc(r.address)}"></div>
      <div class="field"><label>Phone</label><input name="phone" type="tel" value="${esc(r.phone)}"></div>
      <div class="field-row">
        <div class="field"><label>Status</label><select name="status">${selOpts(BUS_STATUS, r.status||"to_visit")}</select></div>
        <div class="field"><label>Relationship</label><select name="flag">
          <option value="">— none —</option>
          <option value="green" ${r.flag==='green'?'selected':''}>🟢 Good</option>
          <option value="red" ${r.flag==='red'?'selected':''}>🔴 Lost / strained</option>
        </select></div>
      </div>
      <div class="field"><label>Notes</label><textarea name="notes">${esc(r.notes)}</textarea></div>
      <button type="submit" class="btn btn-primary btn-block">${r.id?"Save":"Add business"}</button>
      ${r.id?`<button type="button" class="btn btn-danger btn-block" id="del" style="margin-top:10px">Delete</button>`:""}
    </form>`);
  bindForm("businesses", r.id, (fd)=>({
    name:fd.name.trim(), town:fd.town||null, category:fd.category||null,
    address:fd.address||null, phone:fd.phone||null, status:fd.status||"to_visit",
    flag:fd.flag||null, notes:fd.notes||null,
  }), onSaved);
}

/* ---- ICE BREAKER (Gemini) ---- */
function openIceBreaker(biz){
  openModal("Ice breaker — "+biz.name, `
    <div class="muted" style="margin-bottom:12px;font-size:13px">${esc([biz.category,biz.town].filter(Boolean).join(" · "))}</div>
    <div class="field"><label>Add context to steer it (optional)</label>
      <textarea id="ib-ctx" placeholder="e.g. owner just had a baby · sponsors the school team · busy family lunch spot · I know the owner's brother">${esc(biz._ibctx||"")}</textarea></div>
    <button class="btn btn-primary btn-block" id="ib-gen">${ic('sparkles')} Generate</button>
    <div id="ib-out" style="margin-top:14px"></div>
    <button class="btn btn-block" id="ib-copy" style="margin-top:10px">${ic('copy')} Copy all</button>`);
  $("#ib-gen").onclick=()=>generateIceBreaker(biz);
  $("#ib-copy").onclick=()=>{ const t=$("#ib-out").dataset.raw||""; if(t) navigator.clipboard.writeText(t).then(()=>toast("Copied!"),()=>toast("Copy failed")); else toast("Nothing to copy yet"); };
  generateIceBreaker(biz);
}

async function generateIceBreaker(biz){
  const out=$("#ib-out"); out.className="spinner"; out.textContent="Thinking…"; out.dataset.raw="";
  const ctxEl=$("#ib-ctx"); const context=ctxEl?ctxEl.value.trim():""; if(biz) biz._ibctx=context;
  const key=window.CONFIG.GEMINI_KEY;
  if(!key || key.startsWith("__")){ out.className=""; out.innerHTML='<div class="empty" style="padding:18px">Gemini isn\'t set up yet.</div>'; return; }
  const model=window.CONFIG.GEMINI_MODEL||"gemini-2.0-flash";
  const prompt=`You are helping Cierra, a friendly local Texas Farm Bureau insurance agent, prospect in person. She does low-pressure, relationship-first prospecting — she does NOT pitch on the spot; she builds familiarity, listens for life events (new baby, new home, marriage, a business with employees), and asks permission to follow up later.

Business: ${biz.name}
Type: ${biz.category||"local business"}
Town: ${biz.town||""}, Texas
${context?"Extra context from Cierra: "+context:""}
${biz.flag==='red'?"IMPORTANT: There is a prior strained or lost-business relationship here. Be especially warm, humble, and low-key — focus on rebuilding goodwill, keep it brief, and do NOT bring up past issues or the lost business.":""}

Write two short sections in EXACTLY this format:

OPENERS
1. <warm, natural opener to introduce herself when she walks in>
2. ...
3. ...

BRIDGING INTO INSURANCE
1. <a line that ACTUALLY transitions from the small talk toward the insurance topic: tie a life event or the business itself to the idea of protecting their family/income/employees with life insurance or financial protection, AND/OR politely ask permission to follow up later. It must genuinely move toward insurance — not just compliment them>
2. ...
3. ...

Each line 1-2 sentences, warm and small-town Texas friendly, low-pressure (no hard pitch, no prices). At least two of the bridging lines should mention life insurance / financial protection or asking to follow up. Weave in the extra context if provided. Output only the two sections.`;
  try{
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:"POST", headers:{"Content-Type":"application/json","x-goog-api-key":key},
      body:JSON.stringify({ contents:[{parts:[{text:prompt}]}],
        generationConfig:{temperature:0.95, maxOutputTokens:900, thinkingConfig:{thinkingBudget:0}} })
    });
    const data=await r.json();
    if(!r.ok){ out.className=""; out.innerHTML=`<div class="empty" style="padding:18px">${esc((data.error&&data.error.message)||"Request failed")}</div>`; return; }
    const cand=(data.candidates||[])[0]||{};
    const text=((cand.content&&cand.content.parts)||[]).map(p=>p.text||"").join("").trim();
    if(text){ out.className="report-out"; out.textContent=text; out.dataset.raw=text; }
    else { out.className=""; out.innerHTML='<div class="empty" style="padding:18px">No openers came back — tap Regenerate.</div>'; }
  }catch(err){ out.className=""; out.innerHTML=`<div class="empty" style="padding:18px">Network error: ${esc(err.message)}</div>`; }
}

/* ---- AI follow-up message (Gemini) ---- */
async function callGemini(prompt, maxTokens){
  const key=window.CONFIG.GEMINI_KEY;
  if(!key || key.startsWith("__")) throw new Error("Gemini isn't set up yet.");
  const model=window.CONFIG.GEMINI_MODEL||"gemini-2.0-flash";
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
    method:"POST", headers:{"Content-Type":"application/json","x-goog-api-key":key},
    body:JSON.stringify({ contents:[{parts:[{text:prompt}]}],
      generationConfig:{temperature:0.9, maxOutputTokens:maxTokens||900, thinkingConfig:{thinkingBudget:0}} })
  });
  const data=await r.json();
  if(!r.ok) throw new Error((data.error&&data.error.message)||"Request failed");
  const cand=(data.candidates||[])[0]||{};
  return ((cand.content&&cand.content.parts)||[]).map(p=>p.text||"").join("").trim();
}

function openFollowupMsg(c){
  openModal("Follow-up — "+c.name, `
    <div class="muted" style="margin-bottom:12px;font-size:13px">${esc([c.business_name,c.town].filter(Boolean).join(" · "))}</div>
    <div class="field"><label>Context to steer it (optional)</label>
      <textarea id="fm-ctx" placeholder="e.g. met at the county fair · interested in coverage for the kids · asked me to check back next week">${esc(c._fmctx||"")}</textarea></div>
    <button class="btn btn-primary btn-block" id="fm-gen">${ic('sparkles')} Generate</button>
    <div id="fm-out" style="margin-top:14px"></div>
    <button class="btn btn-block" id="fm-copy" style="margin-top:10px">${ic('copy')} Copy all</button>`);
  $("#fm-gen").onclick=()=>genFollowup(c);
  $("#fm-copy").onclick=()=>{ const t=$("#fm-out").dataset.raw||""; if(t) navigator.clipboard.writeText(t).then(()=>toast("Copied!"),()=>toast("Copy failed")); else toast("Nothing to copy yet"); };
  genFollowup(c);
}
async function genFollowup(c){
  const out=$("#fm-out"); out.className="spinner"; out.textContent="Thinking…"; out.dataset.raw="";
  const ctxEl=$("#fm-ctx"); const context=ctxEl?ctxEl.value.trim():""; c._fmctx=context;
  const prompt=`You are helping Cierra, a friendly local Texas Farm Bureau insurance agent, write a follow-up message after meeting someone while canvassing. Low-pressure, relationship-first; offer a no-obligation review; never pushy; no prices.

Person: ${c.name}
${c.business_name?"Business: "+c.business_name:""}
Town: ${c.town||""}, Texas
${c.life_events?"Life events / hooks: "+c.life_events:""}
${context?"Extra context: "+context:""}

Write two options in EXACTLY this format:

TEXT MESSAGE
<a warm, brief text she can send, 2-3 sentences, ending with a soft ask to connect>

EMAIL
Subject: <short subject line>
<a short friendly email, 3-5 sentences, ending with a soft invite to a quick no-obligation review>

Conversational and small-town Texas friendly. Output only those two sections.`;
  try{
    const text=await callGemini(prompt, 900);
    if(text){ out.className="report-out"; out.textContent=text; out.dataset.raw=text; }
    else { out.className=""; out.innerHTML='<div class="empty" style="padding:18px">Nothing came back — tap Generate.</div>'; }
  }catch(err){ out.className=""; out.innerHTML=`<div class="empty" style="padding:18px">${esc(err.message)}</div>`; }
}

/* ---------------- ACTIVITY ---------------- */
function renderActivity(){
  // merge activities + expenses + ads into one reverse-chron feed
  const feed=[];
  state.activities.forEach(a=>feed.push({k:"activity",date:a.activity_date,o:a}));
  state.expenses.forEach(x=>feed.push({k:"expense",date:x.expense_date,o:x}));
  state.ads.forEach(x=>feed.push({k:"ad",date:x.start_date||x.created_at.slice(0,10),o:x}));
  feed.sort((a,b)=>(b.date||"").localeCompare(a.date||""));

  const row=(f)=>{
    const o=f.o;
    if(f.k==="activity"){
      const sub=[o.town,o.category?CATEGORIES[o.category]:"", o.duration_minutes?hrs(o.duration_minutes):""]
        .filter(Boolean).map(esc).join(" · ");
      return `<div class="list-item" data-edit-activity="${o.id}">
        <div class="li-ic">${ic(ACT_ICON[o.type]||'clipboard')}</div>
        <div class="li-main"><div class="li-title">${esc(o.title||ACT_LABEL[o.type])}</div>
          <div class="li-sub">${esc(ACT_LABEL[o.type])}${sub?" · "+sub:""}</div>
          ${o.notes?`<div class="li-sub">${esc(o.notes)}</div>`:""}</div>
        <div class="li-right">${fmtDate(o.activity_date)}${o.start_time?`<div style="font-weight:700;color:var(--blue-dark)">${fmtTime(o.start_time)}</div>`:""}</div></div>`;
    }
    if(f.k==="expense"){
      return `<div class="list-item" data-edit-expense="${o.id}">
        <div class="li-ic">${ic('dollar')}</div>
        <div class="li-main"><div class="li-title">${money(o.amount)} · ${esc(EXPENSE_CATS[o.category]||"Expense")}</div>
          ${o.description?`<div class="li-sub">${esc(o.description)}</div>`:""}</div>
        <div class="li-right">${fmtDate(o.expense_date)}</div></div>`;
    }
    // ad
    return `<div class="list-item" data-edit-ad="${o.id}">
      <div class="li-ic">${ic('megaphone')}</div>
      <div class="li-main"><div class="li-title">${esc(o.name||PLATFORMS[o.platform]||"Ad")}</div>
        <div class="li-sub">${esc(PLATFORMS[o.platform]||"")} · reach ${(+o.reach||0).toLocaleString()} · ${(+o.leads_captured||0)} leads · ${money(o.spend)}</div></div>
      <div class="li-right">${fmtDate(o.start_date)||fmtDate(o.created_at.slice(0,10))}</div></div>`;
  };

  $("#view-activity").innerHTML = feed.length
    ? feed.map(row).join("")
    : `<div class="empty">${ic('clipboard','ic-xl')}<p>No activity logged yet.<br>Tap + to log a visit, event, or expense.</p></div>`;
}

/* ---------------- REPORTS ---------------- */
let reportOffset=0; // 0 = this week, -1 = last week ...
function renderReports(){
  const base=new Date(); base.setDate(base.getDate()+reportOffset*7);
  const wk=weekRange(base);
  const acts=state.activities.filter(a=>inRange(a.activity_date,wk));
  const visits=acts.filter(a=>a.type==="business_visit").length;
  const events=acts.filter(a=>a.type==="event").length;
  const calls=acts.filter(a=>a.type==="follow_up_call").length;
  const appts=acts.filter(a=>a.type==="appointment").length;
  const hoursMin=acts.filter(a=>["canvassing","event"].includes(a.type)).reduce((s,a)=>s+(a.duration_minutes||0),0);
  const newContacts=state.contacts.filter(c=>inRange(c.created_at,wk)).length;
  const exp=state.expenses.filter(x=>inRange(x.expense_date,wk)).reduce((s,x)=>s+(+x.amount||0),0);
  const wkAds=state.ads.filter(x=>inRange(x.start_date||x.created_at,wk));
  const adSpend=wkAds.reduce((s,x)=>s+(+x.spend||0),0);
  const adReach=wkAds.reduce((s,x)=>s+(+x.reach||0),0);
  const adLeads=wkAds.reduce((s,x)=>s+(+x.leads_captured||0),0);
  const wonWk=state.contacts.filter(c=>c.status==="closed_won" && c.closed_at && inRange(c.closed_at,wk));
  const prem=wonWk.reduce((s,c)=>s+(+c.annual_premium||0),0);
  const comm=wonWk.reduce((s,c)=>s+(+c.commission||0),0);
  const g=state.settings;

  const txt =
`Weekly Prospecting Report
${rangeLabel(wk)}

ACTIVITY
• Businesses visited: ${visits} (goal ${g.weekly_goal_businesses})
• Events attended: ${events}
• Hours canvassing: ${Math.round(hoursMin/60*10)/10} (goal ${g.weekly_goal_hours})
• New contacts collected: ${newContacts} (goal ${g.weekly_goal_contacts})
• Follow-up calls made: ${calls}
• Appointments set: ${appts} (goal ${g.weekly_goal_appointments})

ADVERTISING / SOCIAL
• Ad spend: ${money(adSpend)}
• Reach: ${adReach.toLocaleString()}
• Leads captured: ${adLeads}

INVESTMENT
• Money invested (expenses + ads): ${money(exp+adSpend)}

RESULTS
• Policies closed this week: ${wonWk.length}
• Annual premium written: ${money(prem)}
• Commission: ${money(comm)}`;

  // ---- Source performance + trend (all-time) ----
  const leadsAll=state.contacts;
  const wonAll=leadsAll.filter(c=>c.status==="closed_won");
  const invested=state.expenses.reduce((s,x)=>s+(+x.amount||0),0)+state.ads.reduce((s,x)=>s+(+x.spend||0),0);
  const premAll=wonAll.reduce((s,c)=>s+(+c.annual_premium||0),0);
  const cpl=leadsAll.length?invested/leadsAll.length:0;
  const cpp=wonAll.length?invested/wonAll.length:0;
  const srcRows=Object.keys(SOURCE_LABELS).map(k=>{
    const ls=leadsAll.filter(c=>(c.source||"other")===k); if(!ls.length) return "";
    const won=ls.filter(c=>c.status==="closed_won");
    const prem=won.reduce((s,c)=>s+(+c.annual_premium||0),0);
    const conv=ls.length?Math.round(won.length/ls.length*100):0;
    return `<tr><td>${esc(SOURCE_LABELS[k])}</td><td>${ls.length}</td><td>${won.length}</td><td>${conv}%</td><td>${money(prem)}</td></tr>`;
  }).join("");
  const weeks=[]; for(let i=7;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i*7); weeks.push(weekRange(d)); }
  const counts=weeks.map(w=>leadsAll.filter(c=>inRange(c.created_at,w)).length);
  const maxC=Math.max(1,...counts);
  const bars=counts.map(n=>`<div class="tcol"><div class="tbar" style="height:${Math.round(n/maxC*100)}%"></div><div class="tlbl">${n}</div></div>`).join("");
  const perf=`
    <div class="section-title">Pipeline & sources (all-time)</div>
    <div class="stat-grid">
      <div class="stat money"><div class="num">${money(invested)}</div><div class="lbl">Invested</div></div>
      <div class="stat money"><div class="num">${money(premAll)}</div><div class="lbl">Annual premium</div></div>
      <div class="stat"><div class="num">${money(cpl)}</div><div class="lbl">Cost / lead</div></div>
      <div class="stat"><div class="num">${money(cpp)}</div><div class="lbl">Cost / policy</div></div>
    </div>
    ${srcRows?`<div class="card" style="margin-top:12px;overflow-x:auto">
      <table class="perf"><thead><tr><th>Source</th><th>Leads</th><th>Won</th><th>Conv</th><th>Premium</th></tr></thead>
      <tbody>${srcRows}</tbody></table></div>`:`<div class="muted" style="margin:10px 4px;font-size:14px">Add some leads to see source performance.</div>`}
    <div class="section-title">New contacts — last 8 weeks</div>
    <div class="card"><div class="trend">${bars}</div></div>`;

  $("#view-reports").innerHTML = `
    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <button class="btn" id="rep-prev">${ic('chevronLeft')} Prev</button>
      <b>${reportOffset===0?"This week":reportOffset===-1?"Last week":Math.abs(reportOffset)+" weeks ago"}</b>
      <button class="btn" id="rep-next" ${reportOffset>=0?"disabled style=opacity:.4":""}>Next ${ic('chevronRight')}</button>
    </div>
    <div class="report-out" id="report-text">${esc(txt)}</div>
    <button class="btn btn-primary btn-block" id="rep-copy" style="margin-top:12px">${ic('copy')} Copy report</button>
    <button class="btn btn-block" id="rep-settings" style="margin-top:10px">${ic('settings')} Edit weekly goals</button>
    ${perf}`;

  $("#report-text").dataset.raw=txt;
}

/* =========================================================================
   MODAL FORMS
   ========================================================================= */
// Overlay (modal + quick-add sheet) navigation: pushing a history entry when an
// overlay opens lets the phone's Back button/gesture close it instead of leaving.
let overlayPushed=false;
function pushOverlay(){ if(!overlayPushed){ history.pushState({ov:1},""); overlayPushed=true; } }
function hideOverlaysUI(){ $("#modal-overlay").classList.add("hidden"); $("#modal-body").innerHTML=""; $("#sheet-overlay").classList.add("hidden"); }
function closeOverlay(){ if(overlayPushed){ history.back(); } else { hideOverlaysUI(); } } // back -> popstate hides UI

function openModal(title, html){
  $("#modal-title").textContent=title;
  $("#modal-body").innerHTML=html;
  $("#modal-overlay").classList.remove("hidden");
  pushOverlay();
}
function closeModal(){ closeOverlay(); }

function selOpts(map, sel){ return Object.entries(map).map(([k,v])=>`<option value="${k}" ${k===sel?"selected":""}>${esc(v)}</option>`).join(""); }
function townOpts(sel){ return TOWNS.map(t=>`<option ${t===sel?"selected":""}>${esc(t)}</option>`).join(""); }
function contactOpts(sel){ return `<option value="">— none —</option>`+state.contacts.map(c=>`<option value="${c.id}" ${c.id===sel?"selected":""}>${esc(c.name)}${c.town?" ("+esc(c.town)+")":""}</option>`).join(""); }

/* ---- CONTACT form ---- */
function contactForm(rec={}, onSaved){
  const r=rec;
  openModal(r.id?"Edit lead":"New lead", `
    <form id="f">
      <div class="field"><label>Name *</label><input name="name" required value="${esc(r.name)}"></div>
      <div class="field-row">
        <div class="field"><label>Phone</label><input name="phone" type="tel" value="${esc(r.phone)}"></div>
        <div class="field"><label>Email</label><input name="email" type="email" value="${esc(r.email)}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Town</label><select name="town">${townOpts(r.town)}</select></div>
        <div class="field"><label>Source</label><select name="source">${selOpts(SOURCE_LABELS,r.source||"canvassing")}</select></div>
      </div>
      <div class="field check"><input type="checkbox" name="is_business_owner" id="ibo" ${r.is_business_owner?"checked":""}><label for="ibo">Business owner</label></div>
      <div id="biz" class="${r.is_business_owner?"":"hidden"}">
        <div class="field-row">
          <div class="field"><label>Business name</label><input name="business_name" value="${esc(r.business_name)}"></div>
          <div class="field"><label>Type</label><select name="business_type">${selOpts(BIZ_TYPES,r.business_type||"restaurant")}</select></div>
        </div>
      </div>
      <div class="field"><label>Life events / hooks</label><input name="life_events" placeholder="new baby, bought a home, hiring…" value="${esc(r.life_events)}"></div>
      <div class="field check"><input type="checkbox" name="permission_followup" id="pf" ${r.permission_followup?"checked":""}><label for="pf">Has permission to follow up</label></div>
      <div class="field"><label>Follow-up date</label><input name="follow_up_date" type="date" value="${r.follow_up_date||''}"></div>
      <div class="field"><label>Status</label><select name="status" id="st">${selOpts(STATUS_LABELS,r.status||"new")}</select></div>
      <div id="closed" class="closed-fields ${r.status==="closed_won"?"":"hidden"}">
        <div class="field"><label>Policy type</label><select name="policy_type">${selOpts(POLICY_TYPES,r.policy_type||"term")}</select></div>
        <div class="field-row">
          <div class="field"><label>Annual premium $</label><input name="annual_premium" type="number" step="0.01" value="${r.annual_premium??""}"></div>
          <div class="field"><label>Coverage $</label><input name="coverage_amount" type="number" step="0.01" value="${r.coverage_amount??""}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Commission $</label><input name="commission" type="number" step="0.01" value="${r.commission??""}"></div>
          <div class="field"><label>Closed date</label><input name="closed_at" type="date" value="${r.closed_at||todayISO()}"></div>
        </div>
      </div>
      <div class="field"><label>Notes</label><textarea name="notes">${esc(r.notes)}</textarea></div>
      ${r.id?`<button type="button" class="btn btn-block" id="fmsg-btn" style="margin-bottom:10px">${ic('message')} Draft follow-up message</button>`:""}
      <button type="submit" class="btn btn-primary btn-block">${r.id?"Save changes":"Add lead"}</button>
      ${r.id?`<button type="button" class="btn btn-danger btn-block" id="del" style="margin-top:10px">Delete</button>`:""}
    </form>`);

  if($("#fmsg-btn")) $("#fmsg-btn").onclick=()=>openFollowupMsg(r);
  $("#ibo").onchange=e=>$("#biz").classList.toggle("hidden",!e.target.checked);
  $("#st").onchange=e=>$("#closed").classList.toggle("hidden",e.target.value!=="closed_won");
  bindForm("contacts", r.id, (fd)=>({
    name:fd.name.trim(), phone:fd.phone||null, email:fd.email||null, town:fd.town||null,
    source:fd.source, is_business_owner:!!fd.is_business_owner,
    business_name:fd.is_business_owner?(fd.business_name||null):null,
    business_type:fd.is_business_owner?fd.business_type:null,
    life_events:fd.life_events||null, permission_followup:!!fd.permission_followup,
    follow_up_date:fd.follow_up_date||null,
    notes:fd.notes||null, status:fd.status,
    policy_type:fd.status==="closed_won"?fd.policy_type:null,
    annual_premium:fd.status==="closed_won"?num(fd.annual_premium):null,
    coverage_amount:fd.status==="closed_won"?num(fd.coverage_amount):null,
    commission:fd.status==="closed_won"?num(fd.commission):null,
    closed_at:fd.status==="closed_won"?(fd.closed_at||todayISO()):null,
  }), onSaved);
}

/* ---- ACTIVITY form ---- */
function activityForm(type, rec={}, onSaved){
  const r=rec; const t=r.type||type;
  const showCat=["business_visit","canvassing","event"].includes(t);
  const showDur=["canvassing","event","business_visit","appointment"].includes(t);
  const showContact=["follow_up_call","appointment","business_visit"].includes(t);
  openModal((r.id?"Edit ":"Log ")+ACT_LABEL[t], `
    <form id="f">
      <input type="hidden" name="type" value="${t}">
      <div class="field"><label>Title / place</label><input name="title" placeholder="${t==='event'?'Fayette County Fair':'Schulenburg Feed & Supply'}" value="${esc(r.title)}"></div>
      <div class="field-row">
        <div class="field"><label>Date</label><input name="activity_date" type="date" value="${r.activity_date||todayISO()}"></div>
        <div class="field"><label>Time</label><input name="start_time" type="time" value="${r.start_time?String(r.start_time).slice(0,5):''}"></div>
      </div>
      <div class="field"><label>Town</label><select name="town">${townOpts(r.town)}</select></div>
      ${showCat?`<div class="field"><label>Location type</label><select name="category">${selOpts(CATEGORIES,r.category||(t==='event'?'county_fair':'feed_farm_store'))}</select></div>`:`<input type="hidden" name="category" value="${esc(r.category)}">`}
      ${showDur?`<div class="field"><label>Time spent (minutes)</label><input name="duration_minutes" type="number" min="0" step="5" value="${r.duration_minutes??(t==='canvassing'?120:'')}"></div>`:`<input type="hidden" name="duration_minutes" value="${r.duration_minutes||0}">`}
      ${showContact?`<div class="field"><label>Linked lead</label><select name="contact_id">${contactOpts(r.contact_id)}</select></div>`:`<input type="hidden" name="contact_id" value="${r.contact_id||''}">`}
      <div class="field"><label>Notes</label><textarea name="notes">${esc(r.notes)}</textarea></div>
      <button type="button" class="btn btn-block" id="ics-btn" style="margin-bottom:10px">${ic('calendarPlus')} Add to Calendar</button>
      <button type="submit" class="btn btn-primary btn-block">${r.id?"Save":"Log it"}</button>
      ${r.id?`<button type="button" class="btn btn-danger btn-block" id="del" style="margin-top:10px">Delete</button>`:""}
    </form>`);
  $("#ics-btn").onclick=()=>{
    const fd=formData($("#f"));
    downloadICS({ title:fd.title||ACT_LABEL[t], date:fd.activity_date||todayISO(),
      time:fd.start_time||"", minutes:parseInt(fd.duration_minutes)||0,
      town:fd.town||"", notes:fd.notes||"", contact_id:fd.contact_id||"" });
  };
  bindForm("activities", r.id, (fd)=>({
    type:fd.type, title:fd.title||null, activity_date:fd.activity_date||todayISO(),
    start_time:fd.start_time||null, town:fd.town||null, category:fd.category||null,
    duration_minutes:parseInt(fd.duration_minutes)||0,
    contact_id:fd.contact_id||null, notes:fd.notes||null,
  }), onSaved);
}

/* ---- EXPENSE form ---- */
function expenseForm(rec={}){
  const r=rec;
  openModal(r.id?"Edit expense":"Log expense",`
    <form id="f">
      <div class="field-row">
        <div class="field"><label>Amount $ *</label><input name="amount" type="number" step="0.01" required value="${r.amount??""}"></div>
        <div class="field"><label>Date</label><input name="expense_date" type="date" value="${r.expense_date||todayISO()}"></div>
      </div>
      <div class="field"><label>Category</label><select name="category">${selOpts(EXPENSE_CATS,r.category||"gas")}</select></div>
      <div class="field"><label>Description</label><input name="description" value="${esc(r.description)}"></div>
      <button type="submit" class="btn btn-primary btn-block">${r.id?"Save":"Log it"}</button>
      ${r.id?`<button type="button" class="btn btn-danger btn-block" id="del" style="margin-top:10px">Delete</button>`:""}
    </form>`);
  bindForm("expenses", r.id, (fd)=>({
    amount:num(fd.amount)||0, expense_date:fd.expense_date||todayISO(),
    category:fd.category, description:fd.description||null,
  }));
}

/* ---- AD form ---- */
function adForm(rec={}){
  const r=rec;
  openModal(r.id?"Edit ad / social":"Log ad / social",`
    <form id="f">
      <div class="field-row">
        <div class="field"><label>Platform</label><select name="platform">${selOpts(PLATFORMS,r.platform||"meta_facebook")}</select></div>
        <div class="field"><label>Spend $</label><input name="spend" type="number" step="0.01" value="${r.spend??0}"></div>
      </div>
      <div class="field"><label>Campaign / post name</label><input name="name" value="${esc(r.name)}"></div>
      <div class="field-row">
        <div class="field"><label>Start</label><input name="start_date" type="date" value="${r.start_date||todayISO()}"></div>
        <div class="field"><label>End</label><input name="end_date" type="date" value="${r.end_date||""}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Reach</label><input name="reach" type="number" value="${r.reach??0}"></div>
        <div class="field"><label>Leads</label><input name="leads_captured" type="number" value="${r.leads_captured??0}"></div>
      </div>
      <div class="field"><label>Notes</label><textarea name="notes">${esc(r.notes)}</textarea></div>
      <button type="submit" class="btn btn-primary btn-block">${r.id?"Save":"Log it"}</button>
      ${r.id?`<button type="button" class="btn btn-danger btn-block" id="del" style="margin-top:10px">Delete</button>`:""}
    </form>`);
  bindForm("ad_campaigns", r.id, (fd)=>({
    platform:fd.platform, name:fd.name||null, spend:num(fd.spend)||0,
    start_date:fd.start_date||null, end_date:fd.end_date||null,
    reach:parseInt(fd.reach)||0, leads_captured:parseInt(fd.leads_captured)||0, notes:fd.notes||null,
  }));
}

/* ---- goals/settings form ---- */
function settingsForm(){
  const g=state.settings;
  openModal("Weekly goals",`
    <form id="f">
      <div class="field"><label>Businesses to visit / week</label><input name="weekly_goal_businesses" type="number" value="${g.weekly_goal_businesses}"></div>
      <div class="field"><label>Hours canvassing / week</label><input name="weekly_goal_hours" type="number" step="0.5" value="${g.weekly_goal_hours}"></div>
      <div class="field"><label>New contacts / week</label><input name="weekly_goal_contacts" type="number" value="${g.weekly_goal_contacts}"></div>
      <div class="field"><label>Appointments / week</label><input name="weekly_goal_appointments" type="number" value="${g.weekly_goal_appointments}"></div>
      <button type="submit" class="btn btn-primary btn-block">Save goals</button>
    </form>`);
  $("#f").onsubmit=async(e)=>{
    e.preventDefault(); const fd=formData($("#f"));
    const row={ weekly_goal_businesses:parseInt(fd.weekly_goal_businesses)||0,
      weekly_goal_hours:num(fd.weekly_goal_hours)||0,
      weekly_goal_contacts:parseInt(fd.weekly_goal_contacts)||0,
      weekly_goal_appointments:parseInt(fd.weekly_goal_appointments)||0,
      updated_at:new Date().toISOString() };
    const { data:{user} } = await sb.auth.getUser();
    const { error } = await sb.from("settings").update(row).eq("user_id",user.id);
    if(error){ toast(error.message); return; }
    closeModal(); await loadAll(); toast("Goals updated");
  };
}

/* ---- form plumbing ---- */
function num(v){ return v===""||v==null?null:Number(v); }
function formData(form){
  const o={};
  $$("input,select,textarea",form).forEach(el=>{
    if(!el.name) return;
    o[el.name]= el.type==="checkbox" ? el.checked : el.value.trim ? el.value.trim() : el.value;
  });
  return o;
}
function bindForm(table, id, build, onSaved){
  const form=$("#f");
  form.onsubmit=async(e)=>{
    e.preventDefault();
    const btn=form.querySelector('button[type="submit"]'); btn.disabled=true; btn.textContent="Saving…";
    const saved=await save(table, build(formData(form)), id);
    btn.disabled=false;
    if(saved){ closeModal(); if(onSaved) await onSaved(saved); await loadAll(); toast(id?"Saved":"Added"); }
    else { btn.textContent="Try again"; }
  };
  const del=$("#del");
  if(del) del.onclick=async()=>{
    if(!confirm("Delete this permanently?")) return;
    if(await remove(table,id)){ closeModal(); await loadAll(); toast("Deleted"); }
  };
}

/* =========================================================================
   ADD TO CALENDAR (.ics for Apple/iPhone Calendar)
   ========================================================================= */
function pad2(n){ return String(n).padStart(2,"0"); }
function icsStamp(d){ return d.getUTCFullYear()+pad2(d.getUTCMonth()+1)+pad2(d.getUTCDate())+"T"+
  pad2(d.getUTCHours())+pad2(d.getUTCMinutes())+pad2(d.getUTCSeconds())+"Z"; }
function icsEsc(s){ return String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n"); }
function localStamp(d){ return d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate())+"T"+
  pad2(d.getHours())+pad2(d.getMinutes())+"00"; }

function downloadICS(o){
  let dtStart, dtEnd;
  if(o.time){                                   // timed event
    const [hh,mm]=o.time.split(":");
    const sd=new Date(`${o.date}T${pad2(hh)}:${pad2(mm)}:00`);
    const ed=new Date(sd.getTime()+(o.minutes>0?o.minutes:60)*60000);
    dtStart="DTSTART:"+localStamp(sd);
    dtEnd  ="DTEND:"+localStamp(ed);
  } else {                                       // all-day event
    const sd=new Date(`${o.date}T00:00:00`);
    const nd=new Date(sd.getTime()+86400000);
    dtStart="DTSTART;VALUE=DATE:"+o.date.replace(/-/g,"");
    dtEnd  ="DTEND;VALUE=DATE:"+(nd.getFullYear()+pad2(nd.getMonth()+1)+pad2(nd.getDate()));
  }
  let desc=o.notes||"";
  if(o.contact_id){ const c=state.contacts.find(x=>x.id===o.contact_id);
    if(c) desc=(desc?desc+"\n":"")+"Lead: "+c.name+(c.phone?" "+c.phone:""); }

  const lines=[
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Canvassing Tracker//EN","CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:"+Math.round(performance.now())+"@canvassing",
    "DTSTAMP:"+icsStamp(new Date()),
    dtStart, dtEnd,
    "SUMMARY:"+icsEsc(o.title),
    o.town?"LOCATION:"+icsEsc(o.town):"",
    desc?"DESCRIPTION:"+icsEsc(desc):"",
    "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:Reminder","TRIGGER:-PT30M","END:VALARM",
    "END:VEVENT","END:VCALENDAR"
  ].filter(Boolean);

  const blob=new Blob([lines.join("\r\n")],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download=((o.title||"event").replace(/[^a-z0-9]+/gi,"_").slice(0,40)||"event")+".ics";
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1500);
  toast("Calendar file ready — tap it to add");
}

/* =========================================================================
   EVENT WIRING
   ========================================================================= */
function wire(){
  $("#login-form").addEventListener("submit", doLogin);
  $("#theme-btn").onclick=toggleTheme;
  $("#signout-btn").onclick=async()=>{ await sb.auth.signOut(); state={contacts:[],activities:[],expenses:[],ads:[],businesses:[],settings:null}; showLogin(); };

  $$(".nav-btn").forEach(b=>b.onclick=()=>setView(b.dataset.view));

  $("#fab").onclick=()=>{ $("#sheet-overlay").classList.remove("hidden"); pushOverlay(); };
  $("#sheet-cancel").onclick=closeOverlay;
  $("#sheet-overlay").onclick=(e)=>{ if(e.target.id==="sheet-overlay") closeOverlay(); };
  $$(".sheet-btn").forEach(b=>b.onclick=()=>{
    $("#sheet-overlay").classList.add("hidden");   // keep the pushed history entry; modal reuses it
    const a=b.dataset.add;
    if(a==="contact") contactForm();
    else if(a==="business") businessForm();
    else if(a==="expense") expenseForm();
    else if(a==="ad") adForm();
    else activityForm(a);
  });

  $("#modal-close").onclick=closeModal;
  $("#modal-overlay").onclick=(e)=>{ if(e.target.id==="modal-overlay") closeModal(); };

  // phone/browser Back closes an open overlay instead of leaving the app
  window.addEventListener("popstate", ()=>{ if(overlayPushed){ overlayPushed=false; hideOverlaysUI(); } });

  // delegated clicks for lists & report controls
  $("#main").addEventListener("click",(e)=>{
    const f=e.target.closest("[data-filter]");
    if(f){ contactFilter=f.dataset.filter; renderContacts(); return; }
    const ec=e.target.closest("[data-edit-contact]");
    if(ec){ contactForm(state.contacts.find(x=>x.id===ec.dataset.editContact)); return; }
    const ea=e.target.closest("[data-edit-activity]");
    if(ea){ const a=state.activities.find(x=>x.id===ea.dataset.editActivity); activityForm(a.type,a); return; }
    const ex=e.target.closest("[data-edit-expense]");
    if(ex){ expenseForm(state.expenses.find(x=>x.id===ex.dataset.editExpense)); return; }
    const ed=e.target.closest("[data-edit-ad]");
    if(ed){ adForm(state.ads.find(x=>x.id===ed.dataset.editAd)); return; }

    // businesses
    if(e.target.closest("#biz-find")){ findBusinesses(); return; }
    const hx=e.target.closest("[data-hint]");
    if(hx){ try{ localStorage.setItem("cc_hint_"+hx.dataset.hint,"1"); }catch(e){} const el=$("#biz-hint"); if(el) el.remove(); return; }
    const bff=e.target.closest("[data-bizfilter]");
    if(bff){ busFilter=bff.dataset.bizfilter; renderBusinesses(); return; }

    if(e.target.id==="rep-prev"){ reportOffset--; renderReports(); }
    if(e.target.id==="rep-next" && reportOffset<0){ reportOffset++; renderReports(); }
    if(e.target.id==="rep-settings"){ settingsForm(); }
    if(e.target.id==="rep-copy"){
      const raw=$("#report-text").dataset.raw;
      navigator.clipboard.writeText(raw).then(()=>toast("Report copied!"),()=>toast("Copy failed"));
    }
  });
}

/* ---------- boot ---------- */
if(initClient()){
  initTheme();
  wire();
  checkSession();
}
