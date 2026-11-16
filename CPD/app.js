'use strict';

const ENDORSEMENTS = ['Clinical neuropsychology', 'Clinical psychology', 'Community psychology', 'Counselling psychology', 'Educational and developmental psychology', 'Forensic psychology', 'Health psychology', 'Organisational psychology', 'Sport and exercise psychology'];
const TARGET = { total: 30, peer: 10, active: 10 };
const TYPES = [
  { value: 'Active', label: 'Active', field: 'active' },
  { value: 'Peer / Active', label: 'Peer consultation', field: 'peer' },
  { value: 'Other', label: 'Other', field: 'other' }
];
const FORMATS = ['Workshop', 'Webinar', 'Conference', 'Online course', 'Peer consultation group', 'Individual supervision', 'Reading / journal article', 'Research or writing', 'Teaching or presenting'];
const PAGES = [
  { id: 'summary', label: 'Summary', icon: 'home' },
  { id: 'log', label: 'Log CPD', icon: 'plus' },
  { id: 'activities', label: 'Activity log', icon: 'list' },
  { id: 'plan', label: 'Learning plan', icon: 'target' },
  { id: 'report', label: 'Report', icon: 'file' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  alert: '<path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/>',
  sheet: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M4 15h16M10 4v16"/>',
  download: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
  print: '<path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M7 14h10v6H7z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>'
};

const state = { profile: emptyProfile(), planReviewed: false, plans: [], activities: [] };
let userId = null;
let page = 'summary';
let cycle = cycleOf(todayISO());   // a cycle is named by the year it ends in (1 Dec – 30 Nov)
let draft = null;                  // activity being edited or duplicated on the Log page
let logFilter = { q: '', type: '' };
let loadError = '';

const $ = s => document.querySelector(s);
const app = $('#app');
const db = () => window.AppAuth.client;

// ---- Helpers ----

function emptyProfile() { return { title: 'Dr', firstName: '', lastName: '', memberNumber: '', grade: 'Member', registration: 'General registration', reduced: false, endorsements: [] }; }
function esc(s) { return String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`; }
function todayISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function cycleOf(iso) { const y = +iso.slice(0, 4); return +iso.slice(5, 7) === 12 ? y + 1 : y; }
function cycleLabel(c) { return `1 Dec ${c - 1} – 30 Nov ${c}`; }
function cycleShort(c) { return `${c - 1}–${String(c).slice(2)}`; }
function fmt(n) { const mins = Math.round((+n || 0) * 60), h = Math.floor(mins / 60), m = mins % 60; return !m ? `${h}h` : h ? `${h}h ${m}m` : `${m}m`; }
function dateFmt(iso) { return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso + 'T00:00:00')); }
function hoursOf(a) { return (+a.peer || 0) + (+a.active || 0) + (+a.other || 0); }
function typeClass(t) { return t.includes('Peer') ? 'peer' : t === 'Active' ? 'active' : 'other'; }
function typeLabel(t) { return (TYPES.find(x => x.value === t) || { label: t }).label; }
function fullName() { return `${state.profile.firstName} ${state.profile.lastName}`.trim(); }
function cycleActivities() { return state.activities.filter(a => cycleOf(a.date) === cycle).sort((a, b) => b.date.localeCompare(a.date)); }
function totals(list) { return list.reduce((t, a) => ({ peer: t.peer + (+a.peer || 0), active: t.active + (+a.active || 0), other: t.other + (+a.other || 0), total: t.total + hoursOf(a) }), { peer: 0, active: 0, other: 0, total: 0 }); }
function daysLeft() { const end = new Date(cycle, 10, 30), now = new Date(todayISO() + 'T00:00:00'); return Math.round((end - now) / 864e5); }

let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600); }

// ---- Supabase persistence ----

function profileFromRow(r) { return { title: r.title, firstName: r.first_name, lastName: r.last_name, memberNumber: r.member_number, grade: r.grade, registration: r.registration, reduced: r.reduced, endorsements: r.endorsements || [] }; }
function activityFromRow(r) { return { id: r.id, name: r.name, date: r.date, type: r.type, activity: r.activity, details: r.details, peer: +r.peer || 0, active: +r.active || 0, other: +r.other || 0, colleagues: r.colleagues || '', reflection: r.reflection }; }
function planFromRow(r) { return { id: r.id, need: r.need, activities: r.activities, dates: r.dates, outcomes: r.outcomes }; }

async function loadState() {
  const [profile, plans, activities] = await Promise.all([
    db().from('cpd_profile').select('*').eq('user_id', userId).maybeSingle(),
    db().from('cpd_plans').select('*').eq('user_id', userId).order('created_at'),
    db().from('cpd_activities').select('*').eq('user_id', userId).order('date', { ascending: false })
  ]);
  if (profile.error || plans.error || activities.error) loadError = 'Your saved CPD record could not be loaded. Check your connection and reload before adding entries.';
  state.profile = profile.data ? profileFromRow(profile.data) : emptyProfile();
  state.planReviewed = profile.data ? !!profile.data.plan_reviewed : false;
  state.plans = (plans.data || []).map(planFromRow);
  state.activities = (activities.data || []).map(activityFromRow);
}

async function saveProfile() {
  const p = state.profile;
  const { error } = await db().from('cpd_profile').update({
    title: p.title, first_name: p.firstName, last_name: p.lastName, member_number: p.memberNumber,
    grade: p.grade, registration: p.registration, reduced: !!p.reduced, endorsements: p.endorsements,
    plan_reviewed: state.planReviewed, updated_at: new Date().toISOString()
  }).eq('user_id', userId);
  if (error) { toast('Could not save profile'); return false; }
  updateChrome(); queueSheetSync();
  return true;
}

async function savePlan(plan, id) {
  const q = id
    ? db().from('cpd_plans').update(plan).eq('id', id).eq('user_id', userId).select().single()
    : db().from('cpd_plans').insert({ ...plan, user_id: userId }).select().single();
  const { data, error } = await q;
  if (error) { toast('Could not save learning goal'); return false; }
  const row = planFromRow(data);
  state.plans = id ? state.plans.map(p => p.id === id ? row : p) : [...state.plans, row];
  queueSheetSync();
  return true;
}

async function deletePlan(id) {
  const { error } = await db().from('cpd_plans').delete().eq('id', id).eq('user_id', userId);
  if (error) { toast('Could not remove learning goal'); return false; }
  state.plans = state.plans.filter(p => p.id !== id);
  queueSheetSync();
  return true;
}

async function saveActivity(activity, id) {
  const q = id
    ? db().from('cpd_activities').update(activity).eq('id', id).eq('user_id', userId).select().single()
    : db().from('cpd_activities').insert({ ...activity, user_id: userId }).select().single();
  const { data, error } = await q;
  if (error) { toast('Could not save CPD activity'); return false; }
  const row = activityFromRow(data);
  state.activities = id ? state.activities.map(a => a.id === id ? row : a) : [...state.activities, row];
  updateChrome(); queueSheetSync();
  return true;
}

async function deleteActivity(id) {
  const { error } = await db().from('cpd_activities').delete().eq('id', id).eq('user_id', userId);
  if (error) { toast('Could not remove activity'); return false; }
  state.activities = state.activities.filter(a => a.id !== id);
  updateChrome(); queueSheetSync();
  return true;
}

// ---- Google Sheets sync ----
// The connection (web app URL + shared token) is kept in this browser only.
// Every change re-sends the full record, so the sheet is always a complete mirror.

const SHEET_URL_RE = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;
const sheetKey = () => `cpd.sheet.${userId}`;
function sheetConfig() { try { return JSON.parse(localStorage.getItem(sheetKey())) || {}; } catch { return {}; } }
function setSheetConfig(patch) { const c = { ...sheetConfig(), ...patch }; try { localStorage.setItem(sheetKey(), JSON.stringify(c)); } catch { /* storage unavailable */ } return c; }
function sheetToken() {
  let { token } = sheetConfig();
  if (!token) { token = [...crypto.getRandomValues(new Uint8Array(24))].map(b => b.toString(16).padStart(2, '0')).join(''); setSheetConfig({ token }); }
  return token;
}

function sheetTabs() {
  const acts = [...state.activities].sort((a, b) => a.date.localeCompare(b.date));
  const cycles = [...new Set(acts.map(a => cycleOf(a.date)))].sort();
  return [
    {
      name: 'CPD activities', dateCols: [0],
      headers: ['Date', 'Cycle', 'Activity', 'Type', 'Format', 'Details', 'Peer hours', 'Active hours', 'Other hours', 'Total hours', 'Colleagues', 'Reflection', 'ID'],
      rows: acts.map(a => [a.date, cycleShort(cycleOf(a.date)), a.name, typeLabel(a.type), a.activity, a.details, a.peer, a.active, a.other, hoursOf(a), a.colleagues, a.reflection, a.id])
    },
    {
      name: 'Learning plan',
      headers: ['Learning need', 'Proposed activities', 'Proposed dates', 'Anticipated outcomes', 'ID'],
      rows: state.plans.map(p => [p.need, p.activities, p.dates, p.outcomes, p.id])
    },
    {
      name: 'Cycle summary',
      headers: ['Cycle', 'Activities', 'Total hours', 'Peer hours', 'Active hours', 'Other hours', 'Practitioner', 'Last synced'],
      rows: cycles.map(c => { const list = acts.filter(a => cycleOf(a.date) === c), t = totals(list); return [cycleLabel(c), list.length, t.total, t.peer, t.active, t.other, fullName(), new Date().toLocaleString('en-AU')]; })
    }
  ];
}

let syncing = false, syncAgain = false, syncTimer;
function queueSheetSync() { if (!sheetConfig().url) return; setSheetConfig({ pending: true }); clearTimeout(syncTimer); syncTimer = setTimeout(syncSheet, 700); }

async function syncSheet() {
  const cfg = sheetConfig();
  if (!cfg.url || !cfg.token) return false;
  if (syncing) { syncAgain = true; return false; }
  syncing = true; renderSyncChip();
  let ok = false;
  try {
    const res = await fetch(cfg.url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ token: cfg.token, tabs: sheetTabs() }) });
    const out = await res.json().catch(() => { throw new Error('The web app did not respond as expected. Check it is deployed with access set to “Anyone”.'); });
    if (!out.ok) throw new Error(out.error === 'Invalid token' ? 'The script in your sheet has a different token. Copy the script again and redeploy.' : (out.error || 'The sheet rejected the update.'));
    setSheetConfig({ pending: false, lastSync: new Date().toISOString(), lastError: '', sheetUrl: /^https:\/\/docs\.google\.com\//.test(out.url || '') ? out.url : cfg.sheetUrl || '' });
    ok = true;
  } catch (err) {
    setSheetConfig({ lastError: err.message === 'Failed to fetch' ? 'Could not reach Google. Check the web app URL and your connection.' : err.message });
  }
  syncing = false; renderSyncChip();
  if (page === 'settings' && !document.activeElement?.closest('#app form')) renderSettings();
  if (syncAgain) { syncAgain = false; queueSheetSync(); }
  return ok;
}

function renderSyncChip() {
  const chip = $('#syncChip'), cfg = sheetConfig();
  chip.hidden = false;
  const [cls, text] = !cfg.url ? ['', 'Connect Google Sheet']
    : syncing ? ['busy', 'Syncing to sheet…']
    : cfg.lastError ? ['error', 'Sheet sync failed']
    : cfg.pending ? ['busy', 'Sheet sync pending']
    : ['ok', `Sheet synced ${new Date(cfg.lastSync).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}`];
  chip.className = `sync-chip ${cls}`;
  chip.innerHTML = `${icon('sheet')}<span>${text}</span>`;
}

// ---- Chrome (sidebar, top bar) ----

function renderNav() {
  $('#nav').innerHTML = PAGES.map(p => `<a class="nav-item" href="#${p.id}" data-nav="${p.id}">${icon(p.icon)}<span>${p.label}</span></a>`).join('');
}

function updateChrome() {
  const current = cycleOf(todayISO());
  const years = new Set([current, cycle, ...state.activities.map(a => cycleOf(a.date))]);
  $('#cycleSelect').innerHTML = [...years].sort((a, b) => b - a).map(c => `<option value="${c}" ${c === cycle ? 'selected' : ''}>${cycleLabel(c)}${c === current ? ' (current)' : ''}</option>`).join('');
  const t = totals(cycleActivities()), left = daysLeft();
  $('#cycleNote').textContent = `${fmt(t.total)} of ${TARGET.total}h · ${left < 0 ? 'ended' : left === 0 ? 'ends today' : `${left} day${left === 1 ? '' : 's'} left`}`;
  $('#avatar').textContent = ((state.profile.firstName[0] || '') + (state.profile.lastName[0] || '')).toUpperCase() || '·';
  renderSyncChip();
}

// ---- Pages ----

function head(title, desc, actions = '') {
  const i = PAGES.findIndex(p => p.id === page);
  return `<div class="page-head"><div><span class="mono">0${i + 1} / ${PAGES[i].label}</span><h1>${title}</h1><p>${desc}</p></div><div class="page-actions">${actions}</div></div>`;
}
/** Large display figure for hours: 6h 30m with the units set small. */
function figure(n) { const mins = Math.round((+n || 0) * 60), h = Math.floor(mins / 60), m = mins % 60; return (h || !m ? `${h}<small>h</small>` : '') + (m ? `${m}<small>m</small>` : ''); }
function banner() { return loadError ? `<div class="alert error">${icon('alert')}<span>${esc(loadError)}</span></div>` : ''; }

function metric(title, value, target, kind, note) {
  const pct = Math.min(100, value / target * 100), done = value >= target;
  return `<article class="metric glass"><div class="metric-top"><span class="mono">${title}</span><span class="pill ${done ? 'ok' : kind === 'recommended' ? '' : 'warn'}">${done ? 'Target met' : kind === 'recommended' ? 'Recommended' : `${fmt(target - value)} to go`}</span></div><div class="figure" aria-label="${fmt(value)}">${figure(value)}</div><span class="mono">of ${target} hours</span><div class="track"><i style="width:${pct}%"></i></div><p>${note}</p></article>`;
}

function activityItem(a) {
  return `<li><button class="activity-row" data-action="edit" data-id="${a.id}"><span class="type-dot ${typeClass(a.type)}"></span><span class="activity-main"><strong>${esc(a.name)}</strong><small>${dateFmt(a.date)} · ${typeLabel(a.type)}</small></span><span class="num">${fmt(hoursOf(a))}</span></button></li>`;
}
function checkItem(ok, text, hint) { return `<li class="${ok ? 'done' : ''}"><span class="check">${icon(ok ? 'check' : 'alert')}</span><span><strong>${text}</strong><small>${ok ? 'Complete' : hint}</small></span></li>`; }

function renderSummary() {
  const list = cycleActivities(), t = totals(list), left = daysLeft(), hour = new Date().getHours();
  const greeting = `Good ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}${state.profile.firstName ? ', ' + esc(state.profile.firstName) : ''}.`;
  const status = left < 0 ? 'This cycle has ended.' : t.total >= TARGET.total && t.peer >= TARGET.peer ? 'Your hour requirements for this cycle are met.' : `${left} day${left === 1 ? '' : 's'} left in this cycle.`;
  app.innerHTML = banner() + head('Your learning, <i>clearly accounted for.</i>', `${greeting} ${status}`, `<a class="btn" href="#report">${icon('file')}View report</a><a class="btn primary" href="#log">${icon('plus')}Log CPD</a>`) + `
    <div class="metrics">
      ${metric('Total CPD', t.total, TARGET.total, 'required', 'Minimum 30 hours each cycle')}
      ${metric('Peer consultation', t.peer, TARGET.peer, 'required', 'Mandatory 10 hours within the 30')}
      ${metric('Active CPD', t.active, TARGET.active, 'recommended', 'Recommended 10 hours')}
    </div>
    <div class="two-col">
      <section class="panel"><div class="panel-head"><h2>Recent activity</h2><a class="link" href="#activities">View all ${list.length}</a></div>
        ${list.length ? `<ul class="activity-list">${list.slice(0, 6).map(activityItem).join('')}</ul>` : `<div class="empty"><p>No CPD logged in this cycle yet.</p><a class="btn primary" href="#log">${icon('plus')}Log your first activity</a></div>`}
      </section>
      <section class="panel"><div class="panel-head"><h2>Cycle checklist</h2></div>
        <ul class="checklist">
          ${checkItem(state.plans.length > 0, 'Learning plan developed', 'Add at least one learning goal')}
          ${checkItem(state.planReviewed, 'Learning plan reviewed', 'Review near the end of the cycle')}
          ${checkItem(t.total >= TARGET.total, '30 CPD hours logged', `${fmt(Math.max(0, TARGET.total - t.total))} to go`)}
          ${checkItem(t.peer >= TARGET.peer, '10 peer consultation hours', `${fmt(Math.max(0, TARGET.peer - t.peer))} to go`)}
          ${checkItem(list.length > 0 && list.every(a => a.reflection?.trim()), 'Reflection for each activity', list.length ? 'Some entries have no reflection' : 'No activities yet')}
        </ul>
      </section>
    </div>`;
}

function renderLog() {
  const editing = draft && draft.id;
  const a = draft || { date: todayISO(), type: 'Active', name: '', activity: '', details: '', peer: 0, active: 1, other: 0, colleagues: '', reflection: '' };
  const formats = [...new Set([...state.activities.map(x => x.activity), ...FORMATS])];
  app.innerHTML = banner() + head(editing ? 'Edit CPD <i>activity</i>' : 'Log CPD <i>activity</i>', editing ? 'Update the record, then save.' : 'Record what you did, how long it took and what you took from it.') + `
    <form id="activityForm" class="panel form" novalidate>
      <fieldset><legend>Activity</legend>
        <div class="form-grid">
          <div class="field"><label for="f-date">Completion date</label><input id="f-date" type="date" name="date" required value="${esc(a.date)}"></div>
          <div class="field"><span class="label" id="type-label">Type of CPD</span><div class="segmented" role="radiogroup" aria-labelledby="type-label">${TYPES.map(t => `<label><input type="radio" name="type" value="${t.value}" ${a.type === t.value ? 'checked' : ''}><span>${t.label}</span></label>`).join('')}</div></div>
          <div class="field wide"><label for="f-name">Activity name</label><input id="f-name" name="name" required maxlength="200" value="${esc(a.name)}" placeholder="A clear, recognisable title"></div>
          <div class="field wide"><label for="f-format">Format</label><input id="f-format" name="activity" required list="formats" value="${esc(a.activity)}" placeholder="e.g. Workshop, webinar, reading"><datalist id="formats">${formats.map(f => `<option value="${esc(f)}">`).join('')}</datalist></div>
          <div class="field wide"><label for="f-details">Details</label><textarea id="f-details" name="details" required rows="3" placeholder="What it covered and how it relates to your practice.">${esc(a.details)}</textarea></div>
        </div>
      </fieldset>
      <fieldset><legend>Hours</legend>
        <p class="hint">Only time focused on your own practice counts as peer consultation. Peer consultation can also count as active CPD.</p>
        <div class="form-grid three">
          ${[['peer', 'Peer consultation'], ['active', 'Active CPD'], ['other', 'Other CPD']].map(([k, l]) => `<div class="field"><label for="f-${k}">${l}</label><input id="f-${k}" type="number" name="${k}" min="0" max="200" step="0.25" inputmode="decimal" value="${+a[k] || 0}"></div>`).join('')}
        </div>
        <div class="quick"><span>Quick add</span>${[0.5, 1, 1.5, 2, 3, 6].map(h => `<button type="button" class="chip" data-action="add-hours" data-hours="${h}">+${fmt(h)}</button>`).join('')}<button type="button" class="chip" data-action="clear-hours">Clear</button><strong class="num" id="hoursTotal"></strong></div>
        <div class="field" id="colleagueField"><label for="f-colleagues">Colleague(s) involved</label><input id="f-colleagues" name="colleagues" value="${esc(a.colleagues)}" placeholder="Names of consultation colleagues"></div>
      </fieldset>
      <fieldset><legend>Reflection</legend>
        <div class="field"><label for="f-reflection">Journal entry</label><textarea id="f-reflection" name="reflection" required minlength="20" rows="5" placeholder="I learned… This is relevant to my goal because… In my practice I will…">${esc(a.reflection)}</textarea><small>Required for every activity: what you learned, how it connects to a goal, and what you will do differently.</small></div>
      </fieldset>
      <p class="form-error" id="formError" role="alert" hidden></p>
      <div class="form-actions">
        <a class="btn" href="#${editing ? 'activities' : 'summary'}">Cancel</a>
        ${editing ? '' : '<button class="btn" name="then" value="another">Save and log another</button>'}
        <button class="btn primary" name="then" value="done">${editing ? 'Save changes' : 'Save activity'}</button>
      </div>
    </form>`;
  refreshHours();
  if (!editing) $('#f-name').focus({ preventScroll: true });
}

function primaryField() { const type = $('#activityForm').elements.type.value; return TYPES.find(t => t.value === type).field; }
function refreshHours() {
  const f = $('#activityForm').elements, total = ['peer', 'active', 'other'].reduce((s, k) => s + (+f[k].value || 0), 0);
  $('#hoursTotal').textContent = `Total ${fmt(total)}`;
  $('#colleagueField').hidden = !(+f.peer.value > 0 || f.type.value.includes('Peer'));
}
/** When the type changes and all the time sits in one field, move it to the field that matches the new type. */
function retargetHours() {
  const f = $('#activityForm').elements, filled = ['peer', 'active', 'other'].filter(k => +f[k].value > 0), to = primaryField();
  if (filled.length === 1 && filled[0] !== to) { f[to].value = f[filled[0]].value; f[filled[0]].value = 0; }
  refreshHours();
}

async function submitActivity(form, submitter) {
  const error = $('#formError'), d = Object.fromEntries(new FormData(form));
  delete d.then;
  ['peer', 'active', 'other'].forEach(k => d[k] = Math.max(0, +d[k] || 0));
  ['name', 'activity', 'details', 'colleagues', 'reflection'].forEach(k => d[k] = (d[k] || '').trim());
  const problem = !form.checkValidity() ? (d.reflection.length < 20 && d.name && d.activity && d.details && d.date ? 'Write a reflection of at least 20 characters.' : 'Fill in every field in Activity and Reflection.')
    : d.peer + d.active + d.other <= 0 ? 'Add the time spent in at least one hours field.' : '';
  error.hidden = !problem; error.textContent = problem;
  if (problem) { form.querySelector(':invalid')?.focus(); return; }
  const id = draft && draft.id, another = submitter?.value === 'another';
  form.querySelectorAll('button').forEach(b => b.disabled = true);
  if (!await saveActivity(d, id)) { form.querySelectorAll('button').forEach(b => b.disabled = false); return; }
  if (cycleOf(d.date) !== cycle) { cycle = cycleOf(d.date); updateChrome(); }
  toast(id ? 'Changes saved' : 'CPD activity logged');
  draft = null;
  if (another) { renderLog(); window.scrollTo({ top: 0 }); } else go('activities');
}

function filteredActivities() {
  const q = logFilter.q.trim().toLowerCase();
  return cycleActivities().filter(a => (!logFilter.type || a.type === logFilter.type) && (!q || [a.name, a.activity, a.details, a.colleagues, a.reflection].some(v => (v || '').toLowerCase().includes(q))));
}
function activitiesTable() {
  const rows = filteredActivities(), t = totals(rows);
  if (!rows.length) return `<div class="empty"><p>${cycleActivities().length ? 'No activities match your search.' : 'No CPD logged in this cycle yet.'}</p></div>`;
  return `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Activity</th><th>Type</th><th class="num">Peer</th><th class="num">Active</th><th class="num">Other</th><th class="num">Total</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${rows.map(a => `<tr>
    <td class="nowrap">${dateFmt(a.date)}</td>
    <td><strong>${esc(a.name)}</strong><small>${esc(a.activity)}</small></td>
    <td><span class="tag ${typeClass(a.type)}">${typeLabel(a.type)}</span></td>
    <td class="num">${a.peer ? fmt(a.peer) : '–'}</td><td class="num">${a.active ? fmt(a.active) : '–'}</td><td class="num">${a.other ? fmt(a.other) : '–'}</td><td class="num"><strong>${fmt(hoursOf(a))}</strong></td>
    <td class="row-actions"><button class="icon-btn" data-action="edit" data-id="${a.id}" title="Edit" aria-label="Edit ${esc(a.name)}">${icon('edit')}</button><button class="icon-btn" data-action="duplicate" data-id="${a.id}" title="Duplicate" aria-label="Duplicate ${esc(a.name)}">${icon('copy')}</button><button class="icon-btn danger" data-action="delete-activity" data-id="${a.id}" title="Delete" aria-label="Delete ${esc(a.name)}">${icon('trash')}</button></td>
  </tr>`).join('')}</tbody><tfoot><tr><td colspan="3">${rows.length} activit${rows.length === 1 ? 'y' : 'ies'}</td><td class="num">${fmt(t.peer)}</td><td class="num">${fmt(t.active)}</td><td class="num">${fmt(t.other)}</td><td class="num"><strong>${fmt(t.total)}</strong></td><td></td></tr></tfoot></table></div>`;
}
function renderActivities() {
  const list = cycleActivities();
  app.innerHTML = banner() + head('Activity <i>log</i>', `${list.length} activit${list.length === 1 ? 'y' : 'ies'} · ${fmt(totals(list).total)} recorded in ${cycleLabel(cycle)}`, `<button class="btn" data-action="export-csv">${icon('download')}Export CSV</button><a class="btn primary" href="#log">${icon('plus')}Log CPD</a>`) + `
    <section class="panel flush">
      <div class="table-tools"><input id="search" class="search" type="search" placeholder="Search name, details or reflection" aria-label="Search activities" value="${esc(logFilter.q)}">
        <select id="typeFilter" aria-label="Filter by type"><option value="">All types</option>${TYPES.map(t => `<option value="${t.value}" ${logFilter.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}</select></div>
      <div id="tableSlot">${activitiesTable()}</div>
    </section>`;
}

function csvCell(v) { let s = String(v ?? ''); if (/^[=+\-@]/.test(s) && typeof v !== 'number') s = "'" + s; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function exportCSV() {
  const rows = filteredActivities().sort((a, b) => a.date.localeCompare(b.date));
  if (!rows.length) return toast('Nothing to export');
  const lines = [['Date', 'Activity', 'Type', 'Format', 'Details', 'Peer hours', 'Active hours', 'Other hours', 'Total hours', 'Colleagues', 'Reflection'], ...rows.map(a => [a.date, a.name, typeLabel(a.type), a.activity, a.details, a.peer, a.active, a.other, hoursOf(a), a.colleagues, a.reflection])];
  const url = URL.createObjectURL(new Blob(['﻿' + lines.map(l => l.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `cpd-log-${cycleShort(cycle)}.csv` });
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderPlan() {
  app.innerHTML = banner() + head('Learning <i>plan</i>', 'Identify your learning needs, the activities that will meet them and the outcomes you expect.', `<button class="btn primary" data-action="plan-form">${icon('plus')}Add learning goal</button>`) + `
    ${state.plans.length ? `<div class="plan-list">${state.plans.map((p, i) => `<article class="panel plan-item"><header><span class="plan-no">${i + 1}</span><h2>${esc(p.need)}</h2><div class="row-actions"><button class="icon-btn" data-action="plan-form" data-id="${p.id}" title="Edit" aria-label="Edit goal ${i + 1}">${icon('edit')}</button><button class="icon-btn danger" data-action="delete-plan" data-id="${p.id}" title="Delete" aria-label="Delete goal ${i + 1}">${icon('trash')}</button></div></header><dl><div><dt>Proposed activities</dt><dd>${esc(p.activities)}</dd></div><div><dt>Proposed dates</dt><dd>${esc(p.dates)}</dd></div><div><dt>Anticipated outcome</dt><dd>${esc(p.outcomes)}</dd></div></dl></article>`).join('')}</div>`
      : `<section class="panel"><div class="empty"><p>No learning goals yet. Your plan should be based on a self-assessment of your learning needs.</p><button class="btn primary" data-action="plan-form">${icon('plus')}Add your first goal</button></div></section>`}
    <section class="panel review"><div><h2>End-of-cycle review</h2><p>Assess progress against your learning needs, evaluate completed CPD and reflect on future goals, ideally in peer consultation.</p></div><label class="switch"><input id="reviewed" type="checkbox" ${state.planReviewed ? 'checked' : ''}><span>Plan reviewed</span></label></section>
    <dialog id="planDialog"></dialog>`;
}
function openPlanForm(id) {
  const p = state.plans.find(x => x.id === id) || { need: '', activities: '', dates: '', outcomes: '' }, dlg = $('#planDialog');
  dlg.innerHTML = `<form id="planForm" class="form" data-id="${id || ''}"><h2>${id ? 'Edit learning goal' : 'Add a learning goal'}</h2>
    <div class="field"><label for="p-need">Learning need identified</label><input id="p-need" name="need" required value="${esc(p.need)}" placeholder="e.g. Trauma-informed assessment"></div>
    <div class="field"><label for="p-acts">Activities proposed to meet the need</label><input id="p-acts" name="activities" required value="${esc(p.activities)}" placeholder="e.g. Workshop, reading and consultation"></div>
    <div class="field"><label for="p-dates">Proposed dates</label><input id="p-dates" name="dates" required value="${esc(p.dates)}" placeholder="e.g. August–October ${cycle}"></div>
    <div class="field"><label for="p-out">Anticipated outcomes</label><textarea id="p-out" name="outcomes" required rows="3" placeholder="What capability or change do you expect?">${esc(p.outcomes)}</textarea></div>
    <div class="form-actions"><button type="button" class="btn" data-action="close-dialog">Cancel</button><button class="btn primary">Save goal</button></div></form>`;
  dlg.showModal();
}

function reportRows(items) { return items.map(([a, b]) => `<div class="report-row"><strong>${a}</strong><span>${b}</span></div>`).join(''); }
function renderReport() {
  const list = cycleActivities().reverse(), t = totals(list), p = state.profile, name = esc(`${p.title} ${fullName()}`.trim());
  const generated = new Intl.DateTimeFormat('en-AU', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const tick = ok => ok ? '✓' : '✕';
  app.innerHTML = banner() + head('CPD <i>report</i>', `Audit-ready record for ${cycleLabel(cycle)}. Print it or save it as a PDF.`, `<button class="btn primary" data-action="print">${icon('print')}Print / Save PDF</button>`) + `
    <div class="report-preview"><article class="paper">
      <div class="report-brand"><span class="brand-mark"><i></i><i></i><i></i></span><div>Practice <strong>Ledger</strong><br><small>Continuing professional development</small></div></div>
      <h1>CPD logging report</h1>
      <div class="report-table">${reportRows([['Report generated', generated], ['CPD cycle', cycleLabel(cycle).replace('Dec', 'December').replace('Nov', 'November')], ['Name', name], ['Disclaimer', 'This report contains the information entered into the CPD logging system. Its accuracy is the practitioner’s responsibility. Supporting evidence of participation may also be required if audited.']])}</div>
      <h2>CPD profile</h2>
      <div class="report-table">${reportRows([['Name', name], ['Member grade &amp; number', esc([p.grade, p.memberNumber].filter(Boolean).join(', '))], ['PsyBA registration', esc(p.registration)], ['Reduced hours for this cycle?', p.reduced ? 'Yes' : 'No'], ['Endorsements', esc(p.endorsements.join(', ')) || 'None recorded']])}</div>
      <h2>CPD summary</h2>
      <div class="report-table">${reportRows([['Learning plan', `${tick(state.plans.length)} ${state.plans.length ? 'Developed' : 'Not developed'}`], ['Plan review', `${tick(state.planReviewed)} ${state.planReviewed ? 'Reviewed' : 'Not yet reviewed'}`], ['Base minimum CPD', `${tick(t.total >= TARGET.total)} Logged ${fmt(t.total)} / Required ${TARGET.total}h`], ['Peer consultation', `${tick(t.peer >= TARGET.peer)} Logged ${fmt(t.peer)} / Required ${TARGET.peer}h`], ['Active CPD', `Logged ${fmt(t.active)} / Recommended ${TARGET.active}h`], ['Journal entries', list.length && list.every(a => a.reflection?.trim()) ? '✓ Documented for each activity' : list.length ? '✕ Missing entries' : 'No activities logged']])}</div>
      <h2>CPD learning plan</h2>
      ${state.plans.length ? `<div class="report-table">${state.plans.map((g, i) => reportRows([[`${i + 1}. Learning need`, esc(g.need)], ['Proposed activity', esc(g.activities)], ['Proposed date', esc(g.dates)], ['Anticipated outcome', esc(g.outcomes)]])).join('')}</div>` : '<p>No learning goals recorded.</p>'}
      <h2>Summary of all CPD activities</h2>
      <div class="report-table">${list.map((a, i) => reportRows([[`${i + 1}. ${esc(a.name)}`, `${dateFmt(a.date)} · ${typeLabel(a.type)}`], ['Hours', `Peer ${fmt(a.peer)} · Active ${fmt(a.active)} · Other ${fmt(a.other)}`]])).join('')}${reportRows([['Grand total', fmt(t.total)]])}</div>
      <h2>Details of CPD activities</h2>
      ${list.map((a, i) => `<section class="activity-detail"><h3>${i + 1}. ${esc(a.name)}</h3><div class="report-table">${reportRows([['Type of CPD', typeLabel(a.type)], ['Completion date', dateFmt(a.date)], ['CPD activity', esc(a.activity)], ['Activity details', esc(a.details)], ...(a.colleagues ? [['Colleague(s) involved', esc(a.colleagues)]] : []), ['Peer / Active / Other', `${fmt(a.peer)} / ${fmt(a.active)} / ${fmt(a.other)}`], ['Journal entry', esc(a.reflection)]])}</div></section>`).join('') || '<p>No activities logged in this cycle.</p>'}
      <footer class="report-footer"><span>Generated ${generated}</span><span>Practice Ledger CPD report</span></footer>
    </article></div>`;
}

function sheetPanel() {
  const cfg = sheetConfig();
  if (cfg.url) {
    const status = syncing ? `<span class="pill">Syncing…</span>` : cfg.lastError ? `<span class="pill warn">Sync failed</span>` : cfg.pending ? `<span class="pill">Sync pending</span>` : `<span class="pill ok">Connected</span>`;
    return `<section class="panel" id="sheet"><div class="panel-head"><h2>Google Sheet</h2>${status}</div>
      ${cfg.lastError ? `<div class="alert error">${icon('alert')}<span>${esc(cfg.lastError)}</span></div>` : ''}
      <p class="hint">Every activity, learning goal and cycle total is copied to your sheet whenever you save a change. The sheet is a mirror: make edits here, not in the sheet.</p>
      <dl class="facts"><div><dt>Last synced</dt><dd>${cfg.lastSync ? new Date(cfg.lastSync).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not yet'}</dd></div><div><dt>Tabs written</dt><dd>CPD activities · Learning plan · Cycle summary</dd></div></dl>
      <div class="form-actions start"><button class="btn primary" data-action="sync-now" ${syncing ? 'disabled' : ''}>${icon('refresh')}Sync now</button>${cfg.sheetUrl ? `<a class="btn" href="${esc(cfg.sheetUrl)}" target="_blank" rel="noopener">${icon('sheet')}Open sheet</a>` : ''}<button class="btn" data-action="sheet-disconnect">Disconnect</button></div>
    </section>`;
  }
  return `<section class="panel" id="sheet"><div class="panel-head"><h2>Google Sheet</h2><span class="pill">Not connected</span></div>
    <p class="hint">Keep a live copy of your CPD log in a Google Sheet you own. Setup takes about three minutes and is done once per browser.</p>
    <ol class="steps">
      <li><strong>Create the sheet.</strong> Open a new Google Sheet, then choose <em>Extensions → Apps Script</em>.</li>
      <li><strong>Add the script.</strong> Delete the sample code, paste the script below and save.<div class="form-actions start"><button class="btn" data-action="copy-script">${icon('copy')}Copy script</button></div><textarea id="scriptBox" class="code" readonly rows="6" hidden aria-label="Apps Script code"></textarea></li>
      <li><strong>Deploy it.</strong> Choose <em>Deploy → New deployment → Web app</em>, set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>, then authorise it when Google asks.</li>
      <li><strong>Connect.</strong> Paste the web app URL here.
        <form id="sheetForm" class="inline-form"><input name="url" type="url" required placeholder="https://script.google.com/macros/s/…/exec" aria-label="Web app URL"><button class="btn primary">Connect and sync</button></form>
        <p class="form-error" id="sheetError" role="alert" hidden></p></li>
    </ol>
    <p class="hint">The script carries a private token generated for you, so only this app can write to the sheet. Anyone holding both the URL and token could write to it, so don’t share the script.</p>
  </section>`;
}

function renderSettings() {
  const p = state.profile;
  app.innerHTML = banner() + head('Profile <i>and settings</i>', 'Your profile appears on the CPD report. The Google Sheet connection keeps an external copy of your log.') + `
    <div class="two-col even">
      <form id="profileForm" class="panel form">
        <fieldset><legend>Profile</legend>
          <div class="form-grid">
            <div class="field"><label for="s-title">Title</label><select id="s-title" name="title">${['Dr', 'Mr', 'Ms', 'Mrs', 'Mx', 'Prof'].map(x => `<option ${p.title === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div></div>
            <div class="field"><label for="s-first">First name</label><input id="s-first" name="firstName" value="${esc(p.firstName)}" required autocomplete="given-name"></div>
            <div class="field"><label for="s-last">Last name</label><input id="s-last" name="lastName" value="${esc(p.lastName)}" required autocomplete="family-name"></div>
            <div class="field"><label for="s-grade">Member grade</label><input id="s-grade" name="grade" value="${esc(p.grade)}"></div>
            <div class="field"><label for="s-number">Member number</label><input id="s-number" name="memberNumber" value="${esc(p.memberNumber)}"></div>
            <div class="field wide"><label for="s-reg">PsyBA registration</label><select id="s-reg" name="registration">${['General registration', 'Provisional registration', 'Not registered with PsyBA'].map(x => `<option ${p.registration === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
            <label class="checkbox wide"><input type="checkbox" name="reduced" ${p.reduced ? 'checked' : ''}><span>Approved reduced CPD hours for this cycle</span></label>
          </div>
        </fieldset>
        <fieldset><legend>Areas of practice endorsement</legend>
          <p class="hint">One endorsement requires 16 of the 30 hours in that area. Two require 15 hours each; three or more are divided equally.</p>
          <div class="check-grid">${ENDORSEMENTS.map(e => `<label class="checkbox"><input type="checkbox" name="endorsements" value="${e}" ${p.endorsements.includes(e) ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>
        </fieldset>
        <div class="form-actions"><button class="btn primary">Save profile</button></div>
      </form>
      ${sheetPanel()}
    </div>`;
}

async function loadScript() {
  const res = await fetch('google-apps-script.gs');
  if (!res.ok) throw new Error('missing');
  return (await res.text()).replace('__TOKEN__', sheetToken());
}

// ---- Routing and events ----

const RENDER = { summary: renderSummary, plan: renderPlan, log: renderLog, activities: renderActivities, report: renderReport, settings: renderSettings };

function render() {
  if (page !== 'log') draft = null;
  document.querySelectorAll('[data-nav]').forEach(n => { const on = n.dataset.nav === page; n.classList.toggle('active', on); on ? n.setAttribute('aria-current', 'page') : n.removeAttribute('aria-current'); });
  RENDER[page]();
}
function go(to) { if (location.hash.slice(1) === to) { route(); } else location.hash = to; }
function route() {
  const to = location.hash.slice(1);
  page = RENDER[to] ? to : to === 'profile' ? 'settings' : 'summary';
  render();
  window.scrollTo({ top: 0 });
}

const ACTIONS = {
  edit(id) { const a = state.activities.find(x => x.id === id); if (!a) return; draft = { ...a }; page = 'log'; history.pushState(null, '', '#log'); render(); window.scrollTo({ top: 0 }); },
  duplicate(id) { const a = state.activities.find(x => x.id === id); if (!a) return; draft = { ...a, id: null, date: todayISO(), reflection: '' }; page = 'log'; history.pushState(null, '', '#log'); render(); window.scrollTo({ top: 0 }); toast('Copied — set the date and write a new reflection'); },
  async 'delete-activity'(id) { const a = state.activities.find(x => x.id === id); if (a && confirm(`Delete “${a.name}”? This cannot be undone.`) && await deleteActivity(id)) { renderActivities(); toast('Activity deleted'); } },
  'add-hours'(_, el) { const input = $('#activityForm').elements[primaryField()]; input.value = (+input.value || 0) + +el.dataset.hours; refreshHours(); },
  'clear-hours'() { const f = $('#activityForm').elements; ['peer', 'active', 'other'].forEach(k => f[k].value = 0); refreshHours(); },
  'export-csv': exportCSV,
  'plan-form': id => openPlanForm(id),
  'close-dialog'() { $('#planDialog').close(); },
  async 'delete-plan'(id) { if (confirm('Delete this learning goal?') && await deletePlan(id)) { renderPlan(); toast('Learning goal deleted'); } },
  print() { window.print(); },
  async 'copy-script'() {
    try {
      const code = await loadScript(), box = $('#scriptBox');
      box.value = code; box.hidden = false;
      try { await navigator.clipboard.writeText(code); toast('Script copied to clipboard'); } catch { box.select(); toast('Select and copy the script shown below'); }
    } catch { toast('Could not load the script'); }
  },
  async 'sync-now'() { renderSettings(); toast(await syncSheet() ? 'Google Sheet updated' : 'Sync failed'); },
  'sheet-disconnect'() { if (confirm('Stop syncing to this Google Sheet? The sheet itself is not changed.')) { const { token } = sheetConfig(); try { localStorage.setItem(sheetKey(), JSON.stringify({ token })); } catch { /* ignore */ } renderSyncChip(); renderSettings(); } }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el.dataset.id || undefined, el);
});

app.addEventListener('input', e => {
  if (e.target.id === 'search') { logFilter.q = e.target.value; $('#tableSlot').innerHTML = activitiesTable(); }
  if (e.target.closest('#activityForm') && ['peer', 'active', 'other'].includes(e.target.name)) refreshHours();
});
app.addEventListener('change', async e => {
  if (e.target.id === 'typeFilter') { logFilter.type = e.target.value; $('#tableSlot').innerHTML = activitiesTable(); }
  if (e.target.name === 'type' && e.target.closest('#activityForm')) retargetHours();
  if (e.target.id === 'reviewed') { state.planReviewed = e.target.checked; if (await saveProfile()) toast(state.planReviewed ? 'Plan marked as reviewed' : 'Plan review cleared'); else { state.planReviewed = !e.target.checked; e.target.checked = state.planReviewed; } }
});
app.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  if (form.id === 'activityForm') return submitActivity(form, e.submitter);
  if (form.id === 'planForm') {
    const d = Object.fromEntries(new FormData(form));
    if (await savePlan(d, form.dataset.id || undefined)) { renderPlan(); toast('Learning goal saved'); }
  }
  if (form.id === 'profileForm') {
    const fd = new FormData(form), d = Object.fromEntries(fd), previous = state.profile;
    d.endorsements = fd.getAll('endorsements'); d.reduced = fd.has('reduced');
    state.profile = d;
    if (await saveProfile()) toast('Profile saved'); else state.profile = previous;
  }
  if (form.id === 'sheetForm') {
    const url = form.elements.url.value.trim(), error = $('#sheetError'), button = form.querySelector('button');
    if (!SHEET_URL_RE.test(url)) { error.hidden = false; error.textContent = 'That doesn’t look like a web app URL. It should start with https://script.google.com/macros/s/ and end with /exec.'; return; }
    button.disabled = true; button.textContent = 'Connecting…';
    setSheetConfig({ url, token: sheetToken(), lastError: '' });
    if (await syncSheet()) { toast('Google Sheet connected'); renderSettings(); }
    else { const { lastError, token } = sheetConfig(); try { localStorage.setItem(sheetKey(), JSON.stringify({ token })); } catch { /* ignore */ } renderSyncChip(); renderSettings(); $('#sheetError').hidden = false; $('#sheetError').textContent = lastError; $('#sheetForm').elements.url.value = url; }
  }
});

$('#cycleSelect').addEventListener('change', e => { cycle = +e.target.value; updateChrome(); render(); });
window.addEventListener('hashchange', route);

(async () => {
  renderNav();
  const session = await window.AppAuth.ready;
  userId = session.user.id;
  try { await loadState(); } catch { loadError = 'Your saved CPD record could not be loaded. Check your connection and reload before adding entries.'; }
  updateChrome();
  route();
  if (sheetConfig().pending && !loadError) syncSheet();
})();
