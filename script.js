// === CONFIG ==================================================

const SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxcf9q-Jmbhe_jTKXbAHg7uMNW6g8LR8Jw0l8bM5aT5P9EgxGh1mYN7UY1rxeCSbAxkkg/exec";

// Training sync is prepared but backend not yet updated.
// Leave this false until Apps Script is extended.
const TRAINING_SYNC_ENABLED = false;

// === DOM HOOKS ===============================================

// Boot
const bootScreen = document.getElementById("bootScreen");
const bootBarFill = document.getElementById("bootBarFill");
const bootStatus = document.getElementById("bootStatus");

// HUD
const hudOverlay = document.getElementById("hudOverlay");

// Core
const form = document.getElementById("dailyForm");
const syncStatus = document.getElementById("syncStatus");
const patrolToggle = document.getElementById("patrolToggle");

const scenarioEl = document.getElementById("scenario");
const missionEl = document.getElementById("mission");
const emotionalEl = document.getElementById("emotional");

const signalScenario = document.getElementById("signalScenario");
const signalMission = document.getElementById("signalMission");
const signalEmotional = document.getElementById("signalEmotional");
const signalProfile = document.getElementById("signalProfile");
const signalRecommendation = document.getElementById("signalRecommendation");

const last7List = document.getElementById("last7List");

// Weekly dashboard
const wdCalories = document.getElementById("wdCalories");
const wdProtein = document.getElementById("wdProtein");
const wdSleep = document.getElementById("wdSleep");

// Weekly targets
const targetsForm = document.getElementById("targetsForm");
const targetCaloriesEl = document.getElementById("targetCalories");
const targetProteinEl = document.getElementById("targetProtein");
const targetTrainingEl = document.getElementById("targetTraining");

const barCalories = document.getElementById("barCalories");
const barProtein = document.getElementById("barProtein");
const barTraining = document.getElementById("barTraining");
const valCalories = document.getElementById("valCalories");
const valProtein = document.getElementById("valProtein");
const valTraining = document.getElementById("valTraining");

// Today indicator
const todayIndicator = document.createElement("div");
todayIndicator.className = "today-indicator";
todayIndicator.style.cssText =
  "margin-top:10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#888;";
document.querySelector(".top-bar").appendChild(todayIndicator);

// Training
const trainingForm = document.getElementById("trainingForm");
const trainingList = document.getElementById("trainingList");

// Meal creator
const saveMealBtn = document.getElementById("saveMealBtn");
const mealList = document.getElementById("mealList");

// Grocery director
const saveGroceryBtn = document.getElementById("saveGroceryBtn");
const autoGenBtn = document.getElementById("autoGenBtn");
const groceryList = document.getElementById("groceryList");

// === LOCAL STATE =============================================

let last7Local = [];
let trainingLocal = [];
let mealLocal = [];
let groceryLocal = [];
let targets = {
  calories: 0,
  protein: 0,
  training: 0,
};
let patrolMode = false;

// === PERSISTENCE =============================================

function saveState() {
  localStorage.setItem("beyond_last7", JSON.stringify(last7Local));
  localStorage.setItem("beyond_training", JSON.stringify(trainingLocal));
  localStorage.setItem("beyond_meals", JSON.stringify(mealLocal));
  localStorage.setItem("beyond_grocery", JSON.stringify(groceryLocal));
  localStorage.setItem("beyond_targets", JSON.stringify(targets));
  localStorage.setItem("beyond_patrol", patrolMode ? "1" : "0");
}

function loadState() {
  last7Local = JSON.parse(localStorage.getItem("beyond_last7") || "[]");
  trainingLocal = JSON.parse(localStorage.getItem("beyond_training") || "[]");
  mealLocal = JSON.parse(localStorage.getItem("beyond_meals") || "[]");
  groceryLocal = JSON.parse(localStorage.getItem("beyond_grocery") || "[]");
  targets = JSON.parse(
    localStorage.getItem("beyond_targets") ||
      '{"calories":0,"protein":0,"training":0}'
  );
  patrolMode = localStorage.getItem("beyond_patrol") === "1";
}

// === TODAY INDICATOR =========================================

function updateTodayIndicator() {
  const today = new Date().toISOString().slice(0, 10);
  const logged = last7Local.some((e) => e.date === today);

  todayIndicator.textContent = logged ? "TODAY: LOGGED" : "TODAY: OPEN";
  todayIndicator.style.color = logged ? "#3ddc84" : "#ffb347";
}

// === STATUS / HUD ============================================

function setStatus(text, mode = "idle") {
  syncStatus.textContent = `SHEETS: ${text}`;
  syncStatus.classList.remove("ok", "error");
  if (mode === "ok") syncStatus.classList.add("ok");
  if (mode === "error") syncStatus.classList.add("error");
}

function flashHUD() {
  hudOverlay.classList.add("active");
  setTimeout(() => hudOverlay.classList.remove("active"), 200);
}

// === DAILY LOG ===============================================

function pushLocalLog(entry) {
  last7Local.push(entry);
  if (last7Local.length > 7) last7Local.shift();
  renderLast7();
  updateWeeklyDashboard();
  updateTodayIndicator();
  updateTargetsProgress();
  updateScenarioEngine();
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

// === SIGNALS + SCENARIO ENGINE 3.0 ===========================

function updateSignals() {
  signalScenario.textContent = scenarioEl.value;
  signalMission.textContent = missionEl.value;
  signalEmotional.textContent = emotionalEl.value;
  updateScenarioEngine();
}

function computeAverages() {
  if (!last7Local.length) {
    return { avgCalories: 0, avgProtein: 0, avgSleep: 0 };
  }
  let c = 0,
    p = 0,
    s = 0;
  last7Local.forEach((e) => {
    c += e.calories || 0;
    p += e.protein || 0;
    s += e.sleep || 0;
  });
  const d = last7Local.length;
  return {
    avgCalories: c / d,
    avgProtein: p / d,
    avgSleep: s / d,
  };
}

function computeTrainingLoad() {
  if (!trainingLocal.length) return 0;
  let total = 0;
  trainingLocal.forEach((t) => {
    total += (t.duration || 0) * (t.rpe || 1);
  });
  return total;
}

function updateScenarioEngine() {
  const { avgCalories, avgProtein, avgSleep } = computeAverages();
  const load = computeTrainingLoad();
  const emotional = emotionalEl.value;

  let profile = "STABLE / LOW THREAT";
  let recommendation = "MAINTAIN CURRENT PLAN";

  // Basic logic
  if (avgSleep < 6 || emotional === "DRAINED") {
    profile = "RECOVERY PRIORITY / NERVOUS SYSTEM LOW";
    recommendation = "SHIFT TO RECOVERY SCENARIO, LOWER INTENSITY";
  }

  if (load > 1500) {
    profile = "HIGH LOAD / WATCH FOR FATIGUE";
    recommendation = "CONSIDER LIGHTER SESSION OR RECOVERY DAY";
  }

  if (avgCalories < 1800 && avgProtein < 120) {
    recommendation = "INCREASE CALORIES / PROTEIN TO SUPPORT TRAINING";
  }

  if (emotional === "WIRED") {
    profile += " / NERVOUS SYSTEM HOT";
  }

  signalProfile.textContent = profile;
  signalRecommendation.textContent = recommendation;
}

// === WEEKLY DASHBOARD ========================================

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

// === WEEKLY TARGETS ENGINE ===================================

function updateTargetsProgress() {
  const weekCalories = last7Local.reduce(
    (sum, e) => sum + (e.calories || 0),
    0
  );
  const weekProtein = last7Local.reduce(
    (sum, e) => sum + (e.protein || 0),
    0
  );
  const weekTraining = trainingLocal.reduce(
    (sum, t) => sum + (t.duration || 0),
    0
  );

  const cPct = targets.calories
    ? Math.min(100, (weekCalories / targets.calories) * 100)
    : 0;
  const pPct = targets.protein
    ? Math.min(100, (weekProtein / targets.protein) * 100)
    : 0;
  const tPct = targets.training
    ? Math.min(100, (weekTraining / targets.training) * 100)
    : 0;

  barCalories.style.width = cPct + "%";
  barProtein.style.width = pPct + "%";
  barTraining.style.width = tPct + "%";

  valCalories.textContent = targets.calories
    ? `${weekCalories}/${targets.calories}`
    : "—";
  valProtein.textContent = targets.protein
    ? `${weekProtein}/${targets.protein}`
    : "—";
  valTraining.textContent = targets.training
    ? `${weekTraining}/${targets.training}`
    : "—";
}

// === TRAINING LOG ============================================

function pushTraining(entry) {
  trainingLocal.push(entry);
  if (trainingLocal.length > 50) trainingLocal.shift();
  renderTraining();
  updateTargetsProgress();
  updateScenarioEngine();
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

// === MEAL CREATOR ============================================

function pushMeal(entry) {
  mealLocal.push(entry);
  if (mealLocal.length > 100) mealLocal.shift();
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

// === GROCERY DIRECTOR ========================================

function pushGrocery(entry) {
  groceryLocal.push(entry);
  if (groceryLocal.length > 200) groceryLocal.shift();
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

// Simple auto‑gen: sum ingredients by name from meals with default 1 serving
function autoGenerateGroceryFromMeals() {
  const map = new Map();
  mealLocal.forEach((m) => {
    const key = m.name || "";
    if (!key) return;
    const base = map.get(key) || { item: key, qty: 0, unit: "x", category: "MEAL", notes: "" };
    base.qty += 1;
    map.set(key, base);
  });

  map.forEach((entry) => pushGrocery(entry));
  flashHUD();
}

// === PATROL MODE =============================================

function applyPatrolMode() {
  if (patrolMode) {
    document.body.classList.add("patrol");
    patrolToggle.classList.add("active");
    patrolToggle.textContent = "PATROL: ON";
  } else {
    document.body.classList.remove("patrol");
    patrolToggle.classList.remove("active");
    patrolToggle.textContent = "PATROL: OFF";
  }
  saveState();
}

// === EVENTS ==================================================

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
    flashHUD();

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

trainingForm.addEventListener("submit", async (e) => {
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
  flashHUD();

  if (!TRAINING_SYNC_ENABLED) return;

  try {
    await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "training", ...entry }),
    });
  } catch (err) {
    console.error("Training sync error", err);
  }
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
  flashHUD();
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
  flashHUD();
});

autoGenBtn.addEventListener("click", autoGenerateGroceryFromMeals);

targetsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  targets.calories = Number(targetCaloriesEl.value) || 0;
  targets.protein = Number(targetProteinEl.value) || 0;
  targets.training = Number(targetTrainingEl.value) || 0;
  updateTargetsProgress();
  saveState();
});

patrolToggle.addEventListener("click", () => {
  patrolMode = !patrolMode;
  applyPatrolMode();
  flashHUD();
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
updateSignals();
updateWeeklyDashboard();
updateTargetsProgress();
updateTodayIndicator();
applyPatrolMode();
setStatus("READY");
runBoot();
