// === CONFIG ==================================================

const SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxcf9q-Jmbhe_jTKXbAHg7uMNW6g8LR8Jw0l8bM5aT5P9EgxGh1mYN7UY1rxeCSbAxkkg/exec";

// === DOM HOOKS ===============================================

// Boot
const bootScreen = document.getElementById("bootScreen");
const bootBarFill = document.getElementById("bootBarFill");
const bootStatus = document.getElementById("bootStatus");

// Core
const form = document.getElementById("dailyForm");
const syncStatus = document.getElementById("syncStatus");

const scenarioEl = document.getElementById("scenario");
const missionEl = document.getElementById("mission");
const emotionalEl = document.getElementById("emotional");

const signalScenario = document.getElementById("signalScenario");
const signalMission = document.getElementById("signalMission");
const signalEmotional = document.getElementById("signalEmotional");
const signalProfile = document.getElementById("signalProfile");

const last7List = document.getElementById("last7List");

// Weekly dashboard
const wdCalories = document.getElementById("wdCalories");
const wdProtein = document.getElementById("wdProtein");
const wdSleep = document.getElementById("wdSleep");

// Today indicator
const todayIndicator = document.createElement("div");
todayIndicator.className = "today-indicator";
todayIndicator.style.cssText =
  "margin-top:10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#888;";
document.querySelector(".top-bar").appendChild(todayIndicator);

// Training
const trainingForm = document.getElementById("trainingForm");
const trainingList = document.getElementById("trainingList");

// Training quick tags
const trainingTags = [
  "UPPER",
  "LOWER",
  "CONDITIONING",
  "STRENGTH",
  "ENDURANCE",
  "MOBILITY",
];

// Meal creator
const saveMealBtn = document.getElementById("saveMealBtn");
const mealList = document.getElementById("mealList");

// Grocery director
const saveGroceryBtn = document.getElementById("saveGroceryBtn");
const groceryList = document.getElementById("groceryList");

// Drawers
const drawerButtons = document.querySelectorAll("[data-drawer]");
const drawerCloseButtons = document.querySelectorAll("[data-drawer-close]");

// === LOCAL STATE =============================================

let last7Local = [];
let trainingLocal = [];
let mealLocal = [];
let groceryLocal = [];

// === PERSISTENCE =============================================

function saveState() {
  localStorage.setItem("beyond_last7", JSON.stringify(last7Local));
  localStorage.setItem("beyond_training", JSON.stringify(trainingLocal));
  localStorage.setItem("beyond_meals", JSON.stringify(mealLocal));
  localStorage.setItem("beyond_grocery", JSON.stringify(groceryLocal));
}

function loadState() {
  last7Local = JSON.parse(localStorage.getItem("beyond_last7") || "[]");
  trainingLocal = JSON.parse(localStorage.getItem("beyond_training") || "[]");
  mealLocal = JSON.parse(localStorage.getItem("beyond_meals") || "[]");
  groceryLocal = JSON.parse(localStorage.getItem("beyond_grocery") || "[]");
}

// === TODAY INDICATOR =========================================

function updateTodayIndicator() {
  const today = new Date().toISOString().slice(0, 10);
  const logged = last7Local.some((e) => e.date === today);

  todayIndicator.textContent = logged
    ? "TODAY: LOGGED"
    : "TODAY: OPEN";
  todayIndicator.style.color = logged ? "#3ddc84" : "#ffb347";
}

// === HELPERS: STATUS =========================================

function setStatus(text, mode = "idle") {
  syncStatus.textContent = `SHEETS: ${text}`;
  syncStatus.classList.remove("ok", "error");
  if (mode === "ok") syncStatus.classList.add("ok");
  if (mode === "error") syncStatus.classList.add("error");
}

// === HELPERS: DAILY LOG ======================================

function pushLocalLog(entry) {
  last7Local.push(entry);
  if (last7Local.length > 7) last7Local.shift();
  renderLast7();
  updateWeeklyDashboard();
  updateTodayIndicator();
  saveState();
}

function renderLast7() {
  last7List.innerHTML = "";
  last7Local
    .slice()
    .reverse()
    .forEach((e) => {
      const li = document.createElement("li");
      li.className = "log-item";
      li.innerHTML = `
        <span class="key">${e.date}</span>
        <span>${e.calories} kcal • ${e.protein}g • ${e.sleep}h</span>
      `;
      last7List.appendChild(li);
    });
}

// === HELPERS: SIGNALS + SCENARIO ENGINE ======================

function updateSignals() {
  signalScenario.textContent = scenarioEl.value;
  signalMission.textContent = missionEl.value;
  signalEmotional.textContent = emotionalEl.value;
  updateScenarioEngine();
}

function updateScenarioEngine() {
  const scenario = scenarioEl.value;
  const mission = missionEl.value;
  const emotional = emotionalEl.value;

  let profile = "STABLE / LOW THREAT";

  if (scenario === "ACTIVE" && mission === "AGGRESSIVE") {
    profile = "HIGH OUTPUT / ELEVATED THREAT";
  } else if (scenario === "OVERWATCH") {
    profile = "SURVEILLANCE / MODERATE LOAD";
  } else if (scenario === "RECOVERY") {
    profile = "RECOVERY PRIORITY / REDUCED LOAD";
  }

  if (emotional === "DRAINED") profile += " / ENERGY LOW";
  if (emotional === "WIRED") profile += " / NERVOUS SYSTEM HOT";

  signalProfile.textContent = profile;
}

// === HELPERS: WEEKLY DASHBOARD ===============================

function updateWeeklyDashboard() {
  const data = last7Local;
  if (!data.length) {
    wdCalories.textContent = "—";
    wdProtein.textContent = "—";
    wdSleep.textContent = "—";
    return;
  }

  let totalCalories = 0;
  let totalProtein = 0;
  let totalSleep = 0;

  data.forEach((e) => {
    totalCalories += e.calories || 0;
    totalProtein += e.protein || 0;
    totalSleep += e.sleep || 0;
  });

  const days = data.length;

  wdCalories.textContent = Math.round(totalCalories / days) + " kcal";
  wdProtein.textContent = Math.round(totalProtein / days) + " g";
  wdSleep.textContent = (totalSleep / days).toFixed(1) + " h";
}

// === HELPERS: TRAINING LOG ===================================

function pushTraining(entry) {
  trainingLocal.push(entry);
  if (trainingLocal.length > 20) trainingLocal.shift();
  renderTraining();
  saveState();
}

function renderTraining() {
  trainingList.innerHTML = "";
  trainingLocal
    .slice()
    .reverse()
    .forEach((e) => {
      const li = document.createElement("li");
      li.className = "log-item";
      li.innerHTML = `
        <span class="key">${e.date}</span>
        <span>${e.session} • ${e.duration}m • RPE ${e.rpe}</span>
      `;
      trainingList.appendChild(li);
    });
}

// === TRAINING QUICK TAGS =====================================

function injectTrainingTags() {
  const container = document.createElement("div");
  container.style.cssText = "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;";

  trainingTags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.textContent = tag;
    btn.className = "secondary-btn";
    btn.style.fontSize = "10px";
    btn.addEventListener("click", () => {
      document.getElementById("tSession").value = tag;
      document.getElementById("tFocus").value = tag;
    });
    container.appendChild(btn);
  });

  trainingForm.prepend(container);
}

// === HELPERS: MEAL CREATOR ===================================

function pushMeal(entry) {
  mealLocal.push(entry);
  if (mealLocal.length > 50) mealLocal.shift();
  renderMeals();
  saveState();
}

function renderMeals() {
  mealList.innerHTML = "";
  mealLocal
    .slice()
    .reverse()
    .forEach((m) => {
      const li = document.createElement("li");
      li.className = "log-item";
      li.innerHTML = `
        <span class="key">${m.name}</span>
        <span>${m.protein}P / ${m.carbs}C / ${m.fat}F • ${m.calories} kcal</span>
      `;
      mealList.appendChild(li);
    });
}

// === HELPERS: GROCERY DIRECTOR ===============================

function pushGrocery(entry) {
  groceryLocal.push(entry);
  if (groceryLocal.length > 100) groceryLocal.shift();
  renderGroceries();
  saveState();
}

function renderGroceries() {
  groceryList.innerHTML = "";
  groceryLocal
    .slice()
    .reverse()
    .forEach((g) => {
      const li = document.createElement("li");
      li.className = "log-item";
      li.innerHTML = `
        <span class="key">${g.item}</span>
        <span>${g.qty} ${g.unit} • ${g.category}</span>
      `;
      groceryList.appendChild(li);
    });
}

// === DRAWERS =================================================

function openDrawer(id) {
  document.getElementById(id).classList.remove("collapsed");
}

function closeDrawer(id) {
  document.getElementById(id).classList.add("collapsed");
}

// === EVENT WIRING ============================================

scenarioEl.addEventListener("change", updateSignals);
missionEl.addEventListener("change", updateSignals);
emotionalEl.addEventListener("change", updateSignals);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    calories: Number(document.getElementById("calories").value),
    protein: Number(document.getElementById("protein").value),
    hydration: Number(document.getElementById("hydration").value),
    sleep: Number(document.getElementById("sleep").value),
    readiness: document.getElementById("readiness").value || "",
    threat: document.getElementById("threat").value || "",
    stability: document.getElementById("stability").value || "",
    scenario: scenarioEl.value,
    mission: missionEl.value,
    emotional: emotionalEl.value,
  };

  setStatus("SENDING…");

  try {
    const res = await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    setStatus("OK", "ok");

    const today = new Date().toISOString().slice(0, 10);
    pushLocalLog({
      date: today,
      calories: payload.calories,
      protein: payload.protein,
      sleep: payload.sleep,
    });
  } catch (err) {
    console.error(err);
    setStatus("ERROR", "error");
  }
});

trainingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    date: new Date().toISOString().slice(0, 10),
    session: document.getElementById("tSession").value || "",
    focus: document.getElementById("tFocus").value || "",
    duration: Number(document.getElementById("tDuration").value) || 0,
    rpe: Number(document.getElementById("tRPE").value) || 0,
    notes: document.getElementById("tNotes").value || "",
  };

  pushTraining(entry);
});

saveMealBtn.addEventListener("click", () => {
  const entry = {
    name: document.getElementById("mealName").value || "",
    protein: Number(document.getElementById("mealProtein").value) || 0,
    carbs: Number(document.getElementById("mealCarbs").value) || 0,
    fat: Number(document.getElementById("mealFat").value) || 0,
    calories: Number(document.getElementById("mealCalories").value) || 0,
    notes: document.getElementById("mealNotes").value || "",
  };
  if (!entry.name) return;
  pushMeal(entry);
});

saveGroceryBtn.addEventListener("click", () => {
  const entry = {
    item: document.getElementById("gItem").value || "",
    category: document.getElementById("gCategory").value || "",
    unit: document.getElementById("gUnit").value || "",
    qty: Number(document.getElementById("gQty").value) || 0,
    notes: document.getElementById("gNotes").value || "",
  };
  if (!entry.item) return;
  pushGrocery(entry);
});

drawerButtons.forEach((btn) => {
  btn.addEventListener("click", () => openDrawer(btn.dataset.drawer));
});

drawerCloseButtons.forEach((btn) => {
  btn.addEventListener("click", () => closeDrawer(btn.dataset.drawerClose));
});

// === BOOT SEQUENCE ===========================================

function runBoot() {
  bootBarFill.style.width = "35%";
  bootStatus.textContent = "SCANNING SYSTEMS…";

  setTimeout(() => {
    bootBarFill.style.width = "72%";
    bootStatus.textContent = "LINKING SHEETS BACKEND…";
  }, 600);

  setTimeout(() => {
    bootBarFill.style.width = "100%";
    bootStatus.textContent = "BEYOND‑OS ONLINE";
  }, 1200);

  setTimeout(() => {
    bootScreen.classList.add("hidden");
  }, 1800);
}

// === INIT ====================================================

loadState();
renderLast7();
renderTraining();
renderMeals();
renderGroceries();
injectTrainingTags();
updateSignals();
updateWeeklyDashboard();
updateTodayIndicator();
setStatus("READY");
runBoot();
