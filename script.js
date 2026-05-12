// === CONFIG ==================================================

const SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxcf9q-Jmbhe_jTKXbAHg7uMNW6g8LR8Jw0l8bM5aT5P9EgxGh1mYN7UY1rxeCSbAxkkg/exec";

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

// Predictive Engine UI
const predScenario = document.getElementById("predScenario");
const predMission = document.getElementById("predMission");
const predIntensity = document.getElementById("predIntensity");
const predCalories = document.getElementById("predCalories");

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

// V37–V40 state
let weekPlan = []; // 7-day array of {date, scenario, mission, calorieTarget, training, meals, session}
let autonomousMode = true;

// === PERSISTENCE =============================================

function saveState() {
  localStorage.setItem("beyond_last7", JSON.stringify(last7Local));
  localStorage.setItem("beyond_training", JSON.stringify(trainingLocal));
  localStorage.setItem("beyond_meals", JSON.stringify(mealLocal));
  localStorage.setItem("beyond_grocery", JSON.stringify(groceryLocal));
  localStorage.setItem("beyond_targets", JSON.stringify(targets));
  localStorage.setItem("beyond_patrol", patrolMode ? "1" : "0");
  localStorage.setItem("beyond_weekPlan", JSON.stringify(weekPlan));
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
  weekPlan = JSON.parse(localStorage.getItem("beyond_weekPlan") || "[]");
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
  updatePredictiveEngine();
  runAutonomousCycle();
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
  updatePredictiveEngine();
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

// === V36 PREDICTIVE ENGINE ===================================

function computeV36Averages() {
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

function computeV36TrainingLoad() {
  if (!trainingLocal.length) return 0;
  let total = 0;
  trainingLocal.forEach((t) => {
    total += (t.duration || 0) * (t.rpe || 1);
  });
  return total;
}

function updatePredictiveEngine() {
  const { avgCalories, avgProtein, avgSleep } = computeV36Averages();
  const load = computeV36TrainingLoad();
  const emotional = emotionalEl.value;

  let pScenario = "IDLE";
  let pMission = "NEUTRAL";
  let pIntensity = "LOW";
  let pCalories = Math.round(avgCalories || 2200);

  if (avgSleep < 6) {
    pScenario = "RECOVERY";
    pMission = "NEUTRAL";
    pIntensity = "LOW";
    pCalories = Math.max(2000, avgCalories);
  }

  if (load > 1500) {
    pScenario = "OVERWATCH";
    pMission = "ENGAGED";
    pIntensity = "MODERATE";
    pCalories = Math.max(2400, avgCalories);
  }

  if (emotional === "WIRED") {
    pMission = "AGGRESSIVE";
    pIntensity = "HIGH";
  }

  if (emotional === "DRAINED") {
    pScenario = "RECOVERY";
    pIntensity = "LOW";
  }

  if (avgProtein < 120) {
    pScenario = "RECOVERY";
    pIntensity = "LOW";
  }

  // If autonomous mode and we have a plan for tomorrow, bias to that
  const tomorrowPlan = getTomorrowPlan();
  if (autonomousMode && tomorrowPlan) {
    if (tomorrowPlan.scenario) pScenario = tomorrowPlan.scenario;
    if (tomorrowPlan.mission) pMission = tomorrowPlan.mission;
    if (tomorrowPlan.calorieTarget)
      pCalories = tomorrowPlan.calorieTarget;
  }

  predScenario.textContent = pScenario;
  predMission.textContent = pMission;
  predIntensity.textContent = pIntensity;
  predCalories.textContent = pCalories + " kcal";
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
  updatePredictiveEngine();
  runAutonomousCycle();
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

  // Render suggested sessions from weekPlan (non-persistent)
  const suggested = getTodayPlan();
  if (autonomousMode && suggested && suggested.session) {
    const li = document.createElement("li");
    li.className = "log-item";
    li.innerHTML = `
      <span class="key">SUGGESTED</span>
      <span>${suggested.session.type} • ${suggested.session.duration}m • RPE ${suggested.session.rpe}</span>
    `;
    trainingList.insertBefore(li, trainingList.firstChild);
  }
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

  // Render suggested meals for today (non-persistent)
  const plan = getTodayPlan();
  if (autonomousMode && plan && plan.meals && plan.meals.length) {
    const li = document.createElement("li");
    li.className = "log-item";
    li.innerHTML = `
      <span class="key">SUGGESTED</span>
      <span>${plan.meals.map((m) => m.name + " x" + m.servings).join(" • ")}</span>
    `;
    mealList.insertBefore(li, mealList.firstChild);
  }
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

  // Render suggested grocery from week plan (non-persistent)
  if (autonomousMode) {
    const agg = buildAggregatedGroceryFromWeekPlan();
    if (agg.length) {
      const li = document.createElement("li");
      li.className = "log-item";
      li.innerHTML = `
        <span class="key">AUTO-GEN</span>
        <span>${agg.map((i) => `${i.item} x${i.qty}`).join(" • ")}</span>
      `;
      groceryList.insertBefore(li, groceryList.firstChild);
    }
  }
}

function autoGenerateGroceryFromMeals() {
  const map = new Map();
  mealLocal.forEach((m) => {
    const key = m.name || "";
    if (!key) return;
    const base =
      map.get(key) || {
        item: key,
        qty: 0,
        unit: "x",
        category: "MEAL",
        notes: "",
      };
    base.qty += 1;
    map.set(key, base);
  });

  map.forEach((entry) => pushGrocery(entry));
  flashHUD();
}

// === V37 MISSION PLANNER =====================================

function buildMissionPlan() {
  const today = new Date();
  const { avgCalories, avgProtein, avgSleep } = computeV36Averages();
  const load = computeV36TrainingLoad();

  const baseCalories =
    targets.calories && targets.calories > 0
      ? targets.calories / 7
      : avgCalories || 2200;

  const plan = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);

    let scenario = "ACTIVE";
    let mission = "ENGAGED";
    let calorieTarget = Math.round(baseCalories);
    let training = true;

    // Simple weekly structure: 2 rest days
    if (i === 3 || i === 6) {
      scenario = "RECOVERY";
      mission = "NEUTRAL";
      training = false;
      calorieTarget = Math.round(baseCalories * 0.9);
    }

    // If sleep has been low or load high, bias more recovery
    if (avgSleep < 6 || load > 1500) {
      if (i === 1 || i === 4) {
        scenario = "RECOVERY";
        mission = "NEUTRAL";
        training = false;
      }
    }

    plan.push({
      date: dateStr,
      scenario,
      mission,
      calorieTarget,
      training,
      meals: [],
      session: null,
    });
  }

  weekPlan = plan;
}

// === V38 MEAL SYSTEM 2.0 =====================================

function buildMealWeekFromTargets() {
  if (!weekPlan.length || !mealLocal.length) return;

  const dailyProteinTarget =
    targets.protein && targets.protein > 0
      ? targets.protein / 7
      : 130; // default

  weekPlan.forEach((day) => {
    const meals = [];
    let remainingProtein = dailyProteinTarget;

    // Greedy: pick highest-protein meals first
    const sortedMeals = mealLocal
      .slice()
      .sort((a, b) => b.protein - a.protein);

    for (let i = 0; i < sortedMeals.length && remainingProtein > 0; i++) {
      const m = sortedMeals[i];
      if (m.protein <= 0) continue;
      const servings = Math.max(1, Math.round(remainingProtein / m.protein));
      meals.push({
        name: m.name,
        servings,
      });
      remainingProtein -= m.protein * servings;
      if (meals.length >= 3) break;
    }

    day.meals = meals;
  });
}

function buildAggregatedGroceryFromWeekPlan() {
  const map = new Map();
  weekPlan.forEach((day) => {
    (day.meals || []).forEach((m) => {
      const key = m.name;
      if (!key) return;
      const base = map.get(key) || { item: key, qty: 0 };
      base.qty += m.servings || 1;
      map.set(key, base);
    });
  });
  return Array.from(map.values());
}

// === V39 ADAPTIVE TRAINING ENGINE ============================

function buildAdaptiveSessions() {
  if (!weekPlan.length) return;

  const { avgSleep } = computeV36Averages();
  const load = computeV36TrainingLoad();
  const emotional = emotionalEl.value;

  weekPlan.forEach((day, idx) => {
    if (!day.training) {
      day.session = null;
      return;
    }

    let type = "STRENGTH";
    let duration = 45;
    let rpe = 7;

    if (avgSleep < 6 || emotional === "DRAINED") {
      type = "RECOVERY / WALK";
      duration = 25;
      rpe = 4;
    } else if (load > 1500 && idx >= 2) {
      type = "LIGHT CONDITIONING";
      duration = 30;
      rpe = 5;
    } else if (emotional === "WIRED") {
      type = "POWER / SPEED";
      duration = 35;
      rpe = 8;
    }

    day.session = { type, duration, rpe };
  });
}

// === V40 AUTONOMOUS MODE =====================================

function getTodayPlan() {
  if (!weekPlan.length) return null;
  const todayStr = new Date().toISOString().slice(0, 10);
  return weekPlan.find((d) => d.date === todayStr) || null;
}

function getTomorrowPlan() {
  if (!weekPlan.length) return null;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tStr = tomorrow.toISOString().slice(0, 10);
  return weekPlan.find((d) => d.date === tStr) || null;
}

function runAutonomousCycle() {
  if (!autonomousMode) return;

  buildMissionPlan();
  buildMealWeekFromTargets();
  buildAdaptiveSessions();

  const todayPlan = getTodayPlan();
  if (todayPlan) {
    scenarioEl.value = todayPlan.scenario || scenarioEl.value;
    missionEl.value = todayPlan.mission || missionEl.value;
  }

  updateSignals();
  updatePredictiveEngine();
  saveState();
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
emotionalEl.addEventListener("change", () => {
  updateSignals();
  runAutonomousCycle();
});

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
  runAutonomousCycle();
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
  runAutonomousCycle();
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
    bootStatus.textContent = "BEYOND‑OS AUTONOMOUS";
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
runAutonomousCycle();
updatePredictiveEngine();
setStatus("READY");
runBoot();
