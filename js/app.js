/* BEYOND-OS MAX V5.2 — app.js */
const KEY = "BEYOND_OS_V5_2";

let state = JSON.parse(localStorage.getItem(KEY) || "{}");

state.workouts ??= [];
state.meals ??= [];
state.grocery ??= [];
state.sessionNotes ??= {};
state.nutritionLog ??= [];
state.loadout ??= { showPlan: true, showReview: true };
state.lastRoute ??= "hud";
state.lastSessionRoute ??= null;
state.settings ??= { sounds: false, themeAlt: false };

let dom = {
  app: null,
  title: null,
  clock: null,
  greeting: null,
  uptime: null,
  systemPanel: null,
  modalBackdrop: null,
  modals: {}
};

let bootTime = Date.now();
let hudTimer = null;
let uptimeTimer = null;

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function card(title, content) {
  return `
    <div class="card">
      <div class="h2">${title}</div>
      <div class="p">${content || "No data available"}</div>
    </div>
  `;
}

function emptyState(message = "NO DATA") {
  return `<div class="empty mono">${message}</div>`;
}

function mount(html) {
  if (dom.app) {
    dom.app.innerHTML = html || emptyState("SYSTEM READY");
  }
}

function updateTitle(txt) {
  if (dom.title) dom.title.textContent = txt;
}

/* HUD + TIME + GREETING + UPTIME */
function startHUDLoop() {
  if (!dom.clock || !dom.greeting) return;

  if (hudTimer) clearInterval(hudTimer);
  hudTimer = setInterval(updateHUD, 1000);
  updateHUD();

  if (dom.uptime) {
    if (uptimeTimer) clearInterval(uptimeTimer);
    uptimeTimer = setInterval(updateUptime, 1000);
    updateUptime();
  }
}

function updateHUD() {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, "0");
  const h12 = ((hours + 11) % 12 + 1);
  const ampm = hours >= 12 ? "PM" : "AM";

  dom.clock.textContent = `\( {h12}: \){mins} ${ampm}`;

  let greeting = "SYSTEM READY";
  if (hours < 5) greeting = "LATE NIGHT, GAVIN.";
  else if (hours < 12) greeting = "MORNING, GAVIN.";
  else if (hours < 18) greeting = "AFTERNOON, GAVIN.";
  else greeting = "EVENING, GAVIN.";

  dom.greeting.textContent = greeting;
}

function updateUptime() {
  const diff = Math.floor((Date.now() - bootTime) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, "0");
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  dom.uptime.textContent = `\( {h}: \){m}:${s}`;
}

/* NAVIGATION */
function navigate(route) {
  state.lastRoute = route;
  save();

  document.querySelectorAll('.nav-button').forEach(b => {
    b.classList.toggle('active', b.dataset.route === route);
  });

  const titleMap = {
    nutrition: 'FUEL',
    prep: 'PREP'
  };
  updateTitle(titleMap[route] || route.toUpperCase());

  const handlers = {
    hud: renderHUD,
    today: renderToday,
    nutrition: renderNutrition,
    meals: renderMeals,
    prep: renderPrep,
    aldi: () => renderStore("Aldi"),
    walmart: () => renderStore("Walmart"),
    costco: () => renderStore("Costco"),
    cycle: renderCycle,
    loadout: renderLoadout
  };

  (handlers[route] || renderHUD)();
}

/* RENDERS */
function renderHUD() {
  const last = state.lastSessionRoute && state.lastSessionRoute !== "hud"
    ? `<button class="chip" onclick="resumeLastSession()">RESUME: ${state.lastSessionRoute.toUpperCase()}</button>`
    : "";

  const stats = `
    <div class="mono" style="font-size:11px;display:flex;gap:10px;flex-wrap:wrap;">
      <span>CAL: <span style="color:var(--red2);">--</span></span>
      <span>PRO: <span style="color:var(--red2);">--g</span></span>
      <span>CYCLE: <span style="color:var(--red2);">ACTIVE</span></span>
    </div>
  `;

  const body = `
    ${stats}
    <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
      <button class="chip primary" onclick="openModal('meal')">ADD MEAL</button>
      <button class="chip primary" onclick="openModal('grocery')">ADD GROCERY</button>
      <button class="chip primary" onclick="openModal('workout')">ADD WORKOUT</button>
      ${last}
    </div>
  `;

  mount(card("SYSTEM STATUS", `BEYOND-OS MAX V5.2<br>Core Online`) + card("TACTICAL HUD", body));
}

function renderToday() {
  const list = state.workouts.slice().reverse().map(w =>
    `<div class="mono" style="font-size:11px;margin-bottom:4px;">• ${w.movement} — ${w.notes}</div>`
  ).join("") || emptyState("NO WORKOUTS LOGGED YET");

  mount(card("TODAY", "Session log ready.") + card("WORKOUT LOG", list));
}

function renderNutrition() {
  const list = state.meals.slice().reverse().map(m =>
    `<div class="mono" style="font-size:11px;margin-bottom:4px;">• ${m.name} — ${m.cal} kcal / ${m.protein}g</div>`
  ).join("") || emptyState("NO MEALS LOGGED YET");

  mount(card("FUEL LOG", list));
}

function renderMeals() {
  const list = state.meals.map(m =>
    `<div class="mono" style="font-size:11px;margin-bottom:4px;">• ${m.name} — ${m.cal} kcal / ${m.protein}g</div>`
  ).join("") || emptyState("MEAL DATABASE EMPTY");

  mount(card("MEALS", list));
}

function renderPrep() {
  const list = state.grocery.slice().reverse().map(g =>
    `<div class="mono" style="font-size:11px;margin-bottom:4px;">• ${g.item} ${g.store ? `@ ${g.store}` : ""}</div>`
  ).join("") || emptyState("GROCERY LIST EMPTY");

  mount(card("PREP LIST", list));
}

function renderCycle() {
  mount(card("TRAINING CYCLE", "Current cycle overview coming soon.") + emptyState("CYCLE MODULE PLACEHOLDER"));
}

function renderLoadout() {
  mount(card("LOADOUT", "Plan & Review settings placeholder."));
}

function renderStore(name) {
  const list = state.grocery
    .filter(g => g.store && g.store.toLowerCase() === name.toLowerCase())
    .map(g => `<div class="mono" style="font-size:11px;margin-bottom:4px;">• ${g.item}</div>`)
    .join("") || emptyState(`NO ITEMS TAGGED FOR ${name.toUpperCase()}`);

  mount(card(name.toUpperCase(), list));
}

/* SYSTEM PANEL */
function toggleSystemPanel(open) {
  if (!dom.systemPanel) return;
  if (open) dom.systemPanel.classList.add("open");
  else dom.systemPanel.classList.remove("open");
}

function toggleTheme() {
  state.settings.themeAlt = !state.settings.themeAlt;
  save();
  if (state.settings.themeAlt) {
    document.body.classList.add("alt-theme");
  } else {
    document.body.classList.remove("alt-theme");
  }
}

function toggleSounds() {
  state.settings.sounds = !state.settings.sounds;
  save();
}

function resetOS() {
  if (!confirm("Reset BEYOND-OS state?")) return;
  localStorage.removeItem(KEY);
  location.reload();
}

/* MODALS + DATA ENTRY */
function openModal(type) {
  if (!dom.modalBackdrop) return;
  dom.modalBackdrop.classList.add("open");

  Object.values(dom.modals).forEach(m => m.classList.remove("open"));
  const modal = dom.modals[type];
  if (modal) modal.classList.add("open");
}

function closeModal() {
  if (!dom.modalBackdrop) return;
  dom.modalBackdrop.classList.remove("open");
  Object.values(dom.modals).forEach(m => m.classList.remove("open"));
}

function saveMeal() {
  const name = document.getElementById("meal-name").value.trim();
  const cal = parseInt(document.getElementById("meal-cal").value || "0", 10);
  const protein = parseInt(document.getElementById("meal-protein").value || "0", 10);
  if (!name) { closeModal(); return; }

  state.meals.push({ name, cal, protein, ts: Date.now() });
  save();
  closeModal();
  navigate("nutrition");
}

function saveGrocery() {
  const item = document.getElementById("grocery-item").value.trim();
  const store = document.getElementById("grocery-store").value.trim();
  if (!item) { closeModal(); return; }

  state.grocery.push({ item, store, ts: Date.now() });
  save();
  closeModal();
  navigate("prep");
}

function saveWorkout() {
  const movement = document.getElementById("workout-move").value.trim();
  const notes = document.getElementById("workout-notes").value.trim();
  if (!movement) { closeModal(); return; }

  state.workouts.push({ movement, notes, ts: Date.now() });
  save();
  closeModal();
  navigate("today");
}

/* SESSION RESUME */
function resumeLastSession() {
  if (state.lastSessionRoute && state.lastSessionRoute !== "hud") {
    navigate(state.lastSessionRoute);
  }
}

/* BOOT */
window.addEventListener("load", () => {
  dom.app = document.getElementById("app");
  dom.title = document.getElementById("app-title");
  dom.clock = document.getElementById("hud-clock");
  dom.greeting = document.getElementById("hud-greeting");
  dom.uptime = document.getElementById("uptime-readout");
  dom.systemPanel = document.getElementById("system-panel");
  dom.modalBackdrop = document.getElementById("modal-backdrop");
  dom.modals = {
    meal: document.getElementById("modal-meal"),
    grocery: document.getElementById("modal-grocery"),
    workout: document.getElementById("modal-workout")
  };

  if (state.settings.themeAlt) {
    document.body.classList.add("alt-theme");
  }

  state.lastSessionRoute = state.lastRoute || "hud";
  state.lastRoute = "hud";
  save();

  startHUDLoop();

  setTimeout(() => {
    navigate("hud");
  }, 80);
});
