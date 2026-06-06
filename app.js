/* =========================================================================
   Community Canvassing Tracker
   ========================================================================= */
"use strict";

/* ---------- reference data (from the prospecting plan) ---------- */
const TERRITORY = {
  1: ["Schulenburg", "Weimar"],
  2: ["La Grange", "Flatonia"],
  3: ["Smithville", "Columbus"],
  4: ["Industry & surrounding communities"],
};
const TOWNS = ["Schulenburg","Weimar","La Grange","Flatonia","Smithville","Columbus","Industry","Other"];

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
const ACT_EMOJI = {
  business_visit:"🏬", canvassing:"🚶‍♀️", event:"🎪",
  follow_up_call:"📞", appointment:"📅", admin:"🗂️",
};
const ACT_LABEL = {
  business_visit:"Business visit", canvassing:"Canvassing", event:"Event",
  follow_up_call:"Follow-up call", appointment:"Appointment", admin:"Admin",
};

/* ---------- state ---------- */
let sb = null;
let state = { contacts:[], activities:[], expenses:[], ads:[], settings:null };
let currentView = "dashboard";
let contactFilter = "all";

/* ---------- tiny helpers ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = (s) => (s==null?"":String(s)).replace(/[&<>"']/g, c => (
  {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = (n) => "$" + (Number(n)||0).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2});
const hrs = (min) => { const h=(Number(min)||0)/60; return (Math.round(h*10)/10) + "h"; };
function fmtDate(d){ if(!d) return ""; const x=new Date(d+"T00:00:00"); return x.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }
function todayISO(){ return new Date().toLocaleDateString("en-CA"); } // YYYY-MM-DD local

function weekOfMonth(date=new Date()){ return Math.min(4, Math.ceil(date.getDate()/7)); }
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

  const [c,a,e,ad] = await Promise.all([
    sb.from("contacts").select("*").order("created_at",{ascending:false}),
    sb.from("activities").select("*").order("activity_date",{ascending:false}),
    sb.from("expenses").select("*").order("expense_date",{ascending:false}),
    sb.from("ad_campaigns").select("*").order("created_at",{ascending:false}),
  ]);
  state.contacts = c.data||[]; state.activities=a.data||[]; state.expenses=e.data||[]; state.ads=ad.data||[];

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
  return true;
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
  currentView=v;
  $$(".view").forEach(x=>x.classList.add("hidden"));
  $("#view-"+v).classList.remove("hidden");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.view===v));
  const titles={dashboard:"Dashboard",contacts:"Leads",activity:"Activity",reports:"Weekly Report"};
  $("#top-context").textContent=titles[v];
}
function render(){
  renderDashboard();
  renderContacts();
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

  const goal=(label,val,target,unit="")=>{
    const pct=target>0?Math.min(100,Math.round(val/target*100)):0;
    return `<div class="goal">
      <div class="goal-row"><span>${label}</span><span class="val">${val}${unit} / ${target}${unit}</span></div>
      <div class="bar"><i class="${pct>=100?'done':''}" style="width:${pct}%"></i></div></div>`;
  };

  $("#view-dashboard").innerHTML = `
    <div class="banner">📍 <b>This week (Week ${weekOfMonth()}):</b> ${TERRITORY[weekOfMonth()].map(esc).join(", ")}
      <div class="muted" style="font-size:13px;margin-top:4px">${rangeLabel(wk)}</div></div>

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

    <div class="section-title">Territory rotation</div>
    <div class="card" style="font-size:14px">
      ${Object.entries(TERRITORY).map(([w,t])=>`<div style="padding:4px 0;${+w===weekOfMonth()?'font-weight:700;color:var(--blue-dark)':''}">
        <b>Week ${w}:</b> ${t.map(esc).join(", ")}${+w===weekOfMonth()?" ←":""}</div>`).join("")}
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
      <div class="li-emoji">${c.is_business_owner?"🏢":"👤"}</div>
      <div class="li-main"><div class="li-title">${esc(c.name)}</div>
        ${sub?`<div class="li-sub">${sub}</div>`:""}
        ${c.life_events?`<div class="li-sub">💡 ${esc(c.life_events)}</div>`:""}</div>
      <div class="li-right"><span class="pill ${c.status}">${STATUS_LABELS[c.status]||c.status}</span>
        ${val?`<div style="margin-top:6px;font-weight:700;color:var(--green)">${val}</div>`:""}</div>
    </div>`;
  }).join("") : `<div class="empty"><span class="big">👥</span>No leads yet.<br>Tap ＋ to add your first contact.</div>`;

  $("#view-contacts").innerHTML = `
    <div class="chips">${filters.map(([k,l])=>`<button class="chip ${contactFilter===k?'active':''}" data-filter="${k}">${l}</button>`).join("")}</div>
    ${items}`;
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
        <div class="li-emoji">${ACT_EMOJI[o.type]||"📝"}</div>
        <div class="li-main"><div class="li-title">${esc(o.title||ACT_LABEL[o.type])}</div>
          <div class="li-sub">${esc(ACT_LABEL[o.type])}${sub?" · "+sub:""}</div>
          ${o.notes?`<div class="li-sub">${esc(o.notes)}</div>`:""}</div>
        <div class="li-right">${fmtDate(o.activity_date)}</div></div>`;
    }
    if(f.k==="expense"){
      return `<div class="list-item" data-edit-expense="${o.id}">
        <div class="li-emoji">💵</div>
        <div class="li-main"><div class="li-title">${money(o.amount)} · ${esc(EXPENSE_CATS[o.category]||"Expense")}</div>
          ${o.description?`<div class="li-sub">${esc(o.description)}</div>`:""}</div>
        <div class="li-right">${fmtDate(o.expense_date)}</div></div>`;
    }
    // ad
    return `<div class="list-item" data-edit-ad="${o.id}">
      <div class="li-emoji">📣</div>
      <div class="li-main"><div class="li-title">${esc(o.name||PLATFORMS[o.platform]||"Ad")}</div>
        <div class="li-sub">${esc(PLATFORMS[o.platform]||"")} · reach ${(+o.reach||0).toLocaleString()} · ${(+o.leads_captured||0)} leads · ${money(o.spend)}</div></div>
      <div class="li-right">${fmtDate(o.start_date)||fmtDate(o.created_at.slice(0,10))}</div></div>`;
  };

  $("#view-activity").innerHTML = feed.length
    ? feed.map(row).join("")
    : `<div class="empty"><span class="big">📝</span>No activity logged yet.<br>Tap ＋ to log a visit, event, or expense.</div>`;
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

  $("#view-reports").innerHTML = `
    <div class="card" style="display:flex;justify-content:space-between;align-items:center">
      <button class="btn" id="rep-prev">← Prev</button>
      <b>${reportOffset===0?"This week":reportOffset===-1?"Last week":Math.abs(reportOffset)+" weeks ago"}</b>
      <button class="btn" id="rep-next" ${reportOffset>=0?"disabled style=opacity:.4":""}>Next →</button>
    </div>
    <div class="report-out" id="report-text">${esc(txt)}</div>
    <button class="btn btn-primary btn-block" id="rep-copy" style="margin-top:12px">📋 Copy report</button>
    <button class="btn btn-block" id="rep-settings" style="margin-top:10px">⚙️ Edit weekly goals</button>`;

  $("#report-text").dataset.raw=txt;
}

/* =========================================================================
   MODAL FORMS
   ========================================================================= */
function openModal(title, html){
  $("#modal-title").textContent=title;
  $("#modal-body").innerHTML=html;
  $("#modal-overlay").classList.remove("hidden");
}
function closeModal(){ $("#modal-overlay").classList.add("hidden"); $("#modal-body").innerHTML=""; }

function selOpts(map, sel){ return Object.entries(map).map(([k,v])=>`<option value="${k}" ${k===sel?"selected":""}>${esc(v)}</option>`).join(""); }
function townOpts(sel){ return TOWNS.map(t=>`<option ${t===sel?"selected":""}>${esc(t)}</option>`).join(""); }
function contactOpts(sel){ return `<option value="">— none —</option>`+state.contacts.map(c=>`<option value="${c.id}" ${c.id===sel?"selected":""}>${esc(c.name)}${c.town?" ("+esc(c.town)+")":""}</option>`).join(""); }

/* ---- CONTACT form ---- */
function contactForm(rec={}){
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
      <button type="submit" class="btn btn-primary btn-block">${r.id?"Save changes":"Add lead"}</button>
      ${r.id?`<button type="button" class="btn btn-danger btn-block" id="del" style="margin-top:10px">Delete</button>`:""}
    </form>`);

  $("#ibo").onchange=e=>$("#biz").classList.toggle("hidden",!e.target.checked);
  $("#st").onchange=e=>$("#closed").classList.toggle("hidden",e.target.value!=="closed_won");
  bindForm("contacts", r.id, (fd)=>({
    name:fd.name.trim(), phone:fd.phone||null, email:fd.email||null, town:fd.town||null,
    source:fd.source, is_business_owner:!!fd.is_business_owner,
    business_name:fd.is_business_owner?(fd.business_name||null):null,
    business_type:fd.is_business_owner?fd.business_type:null,
    life_events:fd.life_events||null, permission_followup:!!fd.permission_followup,
    notes:fd.notes||null, status:fd.status,
    policy_type:fd.status==="closed_won"?fd.policy_type:null,
    annual_premium:fd.status==="closed_won"?num(fd.annual_premium):null,
    coverage_amount:fd.status==="closed_won"?num(fd.coverage_amount):null,
    commission:fd.status==="closed_won"?num(fd.commission):null,
    closed_at:fd.status==="closed_won"?(fd.closed_at||todayISO()):null,
  }));
}

/* ---- ACTIVITY form ---- */
function activityForm(type, rec={}){
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
        <div class="field"><label>Town</label><select name="town">${townOpts(r.town)}</select></div>
      </div>
      ${showCat?`<div class="field"><label>Location type</label><select name="category">${selOpts(CATEGORIES,r.category||(t==='event'?'county_fair':'feed_farm_store'))}</select></div>`:`<input type="hidden" name="category" value="${esc(r.category)}">`}
      ${showDur?`<div class="field"><label>Time spent (minutes)</label><input name="duration_minutes" type="number" min="0" step="5" value="${r.duration_minutes??(t==='canvassing'?120:'')}"></div>`:`<input type="hidden" name="duration_minutes" value="${r.duration_minutes||0}">`}
      ${showContact?`<div class="field"><label>Linked lead</label><select name="contact_id">${contactOpts(r.contact_id)}</select></div>`:`<input type="hidden" name="contact_id" value="${r.contact_id||''}">`}
      <div class="field"><label>Notes</label><textarea name="notes">${esc(r.notes)}</textarea></div>
      <button type="submit" class="btn btn-primary btn-block">${r.id?"Save":"Log it"}</button>
      ${r.id?`<button type="button" class="btn btn-danger btn-block" id="del" style="margin-top:10px">Delete</button>`:""}
    </form>`);
  bindForm("activities", r.id, (fd)=>({
    type:fd.type, title:fd.title||null, activity_date:fd.activity_date||todayISO(),
    town:fd.town||null, category:fd.category||null,
    duration_minutes:parseInt(fd.duration_minutes)||0,
    contact_id:fd.contact_id||null, notes:fd.notes||null,
  }));
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
function bindForm(table, id, build){
  const form=$("#f");
  form.onsubmit=async(e)=>{
    e.preventDefault();
    const btn=form.querySelector('button[type="submit"]'); btn.disabled=true; btn.textContent="Saving…";
    const ok=await save(table, build(formData(form)), id);
    btn.disabled=false;
    if(ok){ closeModal(); await loadAll(); toast(id?"Saved":"Added"); }
    else { btn.textContent="Try again"; }
  };
  const del=$("#del");
  if(del) del.onclick=async()=>{
    if(!confirm("Delete this permanently?")) return;
    if(await remove(table,id)){ closeModal(); await loadAll(); toast("Deleted"); }
  };
}

/* =========================================================================
   EVENT WIRING
   ========================================================================= */
function wire(){
  $("#login-form").addEventListener("submit", doLogin);
  $("#signout-btn").onclick=async()=>{ await sb.auth.signOut(); state={contacts:[],activities:[],expenses:[],ads:[],settings:null}; showLogin(); };

  $$(".nav-btn").forEach(b=>b.onclick=()=>setView(b.dataset.view));

  $("#fab").onclick=()=>$("#sheet-overlay").classList.remove("hidden");
  $("#sheet-cancel").onclick=()=>$("#sheet-overlay").classList.add("hidden");
  $("#sheet-overlay").onclick=(e)=>{ if(e.target.id==="sheet-overlay") e.currentTarget.classList.add("hidden"); };
  $$(".sheet-btn").forEach(b=>b.onclick=()=>{
    $("#sheet-overlay").classList.add("hidden");
    const a=b.dataset.add;
    if(a==="contact") contactForm();
    else if(a==="expense") expenseForm();
    else if(a==="ad") adForm();
    else activityForm(a);
  });

  $("#modal-close").onclick=closeModal;
  $("#modal-overlay").onclick=(e)=>{ if(e.target.id==="modal-overlay") closeModal(); };

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
  wire();
  checkSession();
}
