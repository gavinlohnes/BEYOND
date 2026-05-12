/* ============================================================
   BEYOND‑OS V51 — VISOR + INTEGRATION
   ============================================================ */

/* ---------- ELEMENT HOOKS ---------- */

const bootScreen = document.getElementById("bootScreen");
const bootBarFill = document.getElementById("bootBarFill");
const bootStatus = document.getElementById("bootStatus");

const hudOverlay = document.getElementById("hudOverlay");

const syncStatus = document.getElementById("syncStatus");
const patrolToggle = document.getElementById("patrolToggle");

/* Forms */
const dailyForm = document.getElementById("dailyForm");
const trainingForm = document.getElementById("trainingForm");
const targetsForm = document.getElementById("targetsForm");

/* Lists */
const last7List = document.getElementById("last7List");
const trainingList = document.getElementById("trainingList");
const mealList = document.getElementById("mealList");
const groceryList = document.getElementById("groceryList");

/* Meal + Grocery buttons */
const saveMealBtn = document.getElementById("saveMealBtn");
const saveGroceryBtn = document.getElementById("saveGroceryBtn");
const autoGenBtn = document.getElementById("autoGenBtn");

/* Predictive Engine */
const predScenario = document.getElementById("predScenario");
const predMission = document.getElementById("predMission");
const predIntensity = document.getElementById("predIntensity");
const predCalories = document.getElementById("predCalories");

/* Signals */
const signalScenario = document.getElementById("signalScenario");
const signalMission = document.getElementById("signalMission");
const signalIntensity = document.getElementById("signalIntensity");
const signalProfile = document.getElementById("signalProfile");
const signalRecommendation = document.getElementById("signalRecommendation");

/* Weekly Dashboard */
const wdCalories = document.getElementById("wdCalories");
const wdProtein = document.getElementById("wdProtein");
const wdSleep = document.getElementById("wdSleep");

/* Weekly Target Bars */
const barCalories = document.getElementById("barCalories");
const barProtein = document.getElementById("barProtein");
const barTraining = document.getElementById("barTraining");

const valCalories = document.getElementById("valCalories");
const valProtein = document.getElementById("valProtein");
const valTraining = document.getElementById("valTraining");

/* System State */
const sysStress = document.getElementById("sysStress");
const sysRecovery = document.getElementById("sysRecovery");
const sysSleepQuality = document.getElementById("sysSleepQuality");
const sysMood = document.getElementById("sysMood");

/* Autonomous */
const autoMission = document.getElementById("autoMission");
const autoScenario = document.getElementById("autoScenario");
const autoCalories = document.getElementById("autoCalories");
const autoProtein = document.getElementById("autoProtein");
const autoTraining = document.getElementById("autoTraining");

/* Recommendations */
const recTraining = document.getElementById("recTraining");
const recMeals = document.getElementById("recMeals");

/* ============================================================
   UTIL: PULSE
   ============================================================ */

function pulseElement(el) {
  if (!el) return;
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
}

/* ============================================================
   BOOT SEQUENCE
   ============================================================ */

function runBoot() {
  let progress = 0;
  const steps = [
    "WAYNE SYSTEMS PROTOCOL",
    "SUIT LINK ESTABLISHED",
    "NEURAL SYNC ONLINE",
    "AUTONOMOUS ENGINE BOOTING",
    "PREDICTIVE SYSTEMS ACTIVE",
    "MISSION ENGINE READY",
    "VISOR HUD ONLINE"
  ];

  const interval = setInterval(() => {
    progress += 100 / steps.length;
    bootBarFill.style.width = progress + "%";

    bootStatus.innerText =
      steps[Math.floor(progress / (100 / steps.length))] || "READY";

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        bootScreen.style.opacity = "0";
        setTimeout(() => {
          bootScreen.style.display = "none";
        }, 400);
      }, 600);
    }
  }, 500);
}

runBoot();

/* ============================================================
   HUD FLASH
   ============================================================ */

function hudFlash() {
  hudOverlay.classList.add("active");
  setTimeout(() => hudOverlay.classList.remove("active"), 180);
}

/* ============================================================
   SHEETS ENDPOINT
   ============================================================ */

const SHEETS_URL =
  "YOUR_WEB_APP_URL_HERE"; // replace with deployed Apps Script Web App URL

/* ============================================================
   SYNC STATUS HELPER
   ============================================================ */

function setSyncStatus(state, label) {
  syncStatus.classList.remove("ok", "error");
  if (state === "ok") syncStatus.classList.add("ok");
  if (state === "error") syncStatus.classList.add("error");
  syncStatus.innerText = label;
  pulseElement(syncStatus);
}

/* ============================================================
   CORE HUD UPDATE
   ============================================================ */

function updateHUDFromSystems(systems) {
  if (!systems) return;

  // Weekly
  if (systems.weekly) {
    wdCalories.innerText = systems.weekly.avgCalories ?? "—";
    wdProtein.innerText = systems.weekly.avgProtein ?? "—";
    wdSleep.innerText = systems.weekly.avgSleep ?? "—";

    pulseElement(wdCalories);
    pulseElement(wdProtein);
    pulseElement(wdSleep);
  }

  // Mission / Scenario / Profile
  if (systems.mission) {
    signalMission.innerText = systems.mission.missionState || "—";
    signalIntensity.innerText = systems.mission.missionIntensity || "—";
    signalRecommendation.innerText = systems.mission.missionReason || "—";
    pulseElement(signalMission);
  }

  if (systems.scenario) {
    signalScenario.innerText = systems.scenario.scenarioState || "—";
    pulseElement(signalScenario);
  }

  if (systems.profile) {
    signalProfile.innerText = systems.profile.profileState || "—";
  }

  // Predictive
  if (systems.predictions) {
    predScenario.innerText = systems.predictions.predictedScenario || "—";
    predMission.innerText = systems.predictions.predictedMission || "—";
    predIntensity.innerText = systems.predictions.predictedIntensity || "—";
    predCalories.innerText = systems.predictions.predictedCalories || "—";
    pulseElement(predCalories);
  }

  // System State
  if (systems.stress) {
    sysStress.innerText = `${systems.stress.stressLevel} (${systems.stress.stressScore})`;
  }
  if (systems.recovery) {
    sysRecovery.innerText = `${systems.recovery.recoveryLevel} (${systems.recovery.recoveryScore})`;
  }
  if (systems.sleepQuality) {
    sysSleepQuality.innerText = `${systems.sleepQuality.sleepQuality} (${systems.sleepQuality.avgSleep}h)`;
  }
  if (systems.mood) {
    sysMood.innerText = `${systems.mood.moodState} (${systems.mood.moodScore})`;
  }

  // Autonomous
  if (systems.autonomous) {
    autoMission.innerText = systems.autonomous.mission || "—";
    autoScenario.innerText = systems.autonomous.scenario || "—";
    autoCalories.innerText = systems.autonomous.calorieTarget || "—";
    autoProtein.innerText = systems.autonomous.proteinTarget || "—";
    autoTraining.innerText = `${systems.autonomous.trainingTargetMinutes || "—"} min`;
  }

  // Recommendations
  if (systems.trainingRecommendation) {
    recTraining.innerText =
      `${systems.trainingRecommendation.recommendedFocus} / ` +
      `${systems.trainingRecommendation.recommendedDuration} min / ` +
      `${systems.trainingRecommendation.recommendedIntensity}`;
  }

  if (systems.mealRecommendation) {
    const meals = systems.mealRecommendation.recommendedMeals || [];
    if (meals.length) {
      recMeals.innerText = meals.map(m => m.name).join(", ");
    } else {
      recMeals.innerText = "—";
    }
  }
}

/* ============================================================
   DAILY LOG SUBMIT  (POST → backend + refresh)
   ============================================================ */

dailyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hudFlash();

  const payload = {
    calories: Number(document.getElementById("calories").value) || 0,
    protein: Number(document.getElementById("protein").value) || 0,
    hydration: Number(document.getElementById("hydration").value) || 0,
    sleep: Number(document.getElementById("sleep").value) || 0,
    readiness: document.getElementById("readiness").value,
    threat: document.getElementById("threat").value,
    stability: document.getElementById("stability").value,
    scenario: document.getElementById("scenario").value,
    mission: document.getElementById("mission").value,
    emotional: document.getElementById("emotional").value
  };

  try {
    setSyncStatus("", "SHEETS: SYNCING…");

    const res = await fetch(SHEETS_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || data.status !== "OK") {
      setSyncStatus("error", "SHEETS: ERROR");
      console.error("POST error:", data);
      return;
    }

    setSyncStatus("ok", "SHEETS: OK");

    if (data.systems) {
      updateHUDFromSystems(data.systems);
    }
    if (data.rows) {
      updateLast7List(data.rows);
    } else {
      await fetchWeeklyData();
    }
  } catch (err) {
    setSyncStatus("error", "SHEETS: ERROR");
    console.error("POST error:", err);
  }
});

/* ============================================================
   WEEKLY ENGINE 2.0  (GET → backend, update HUD)
   ============================================================ */

async function fetchWeeklyData() {
  try {
    const res = await fetch(SHEETS_URL);
    const data = await res.json();

    if (!res.ok || data.status !== "OK") {
      setSyncStatus("error", "SHEETS: ERROR");
      console.error("GET error:", data);
      return;
    }

    setSyncStatus("ok", "SHEETS: OK");

    const rows = data.rows || [];
    updateWeeklyDashboard(data.weekly || {});
    updateLast7List(rows);
    updateHUDFromSystems(data.systems || {});
  } catch (err) {
    setSyncStatus("error", "SHEETS: ERROR");
    console.error("GET error:", err);
  }
}

function updateWeeklyDashboard(weekly) {
  if (!weekly || Object.keys(weekly).length === 0) {
    wdCalories.innerText = "—";
    wdProtein.innerText = "—";
    wdSleep.innerText = "—";
    return;
  }

  wdCalories.innerText = weekly.avgCalories ?? "—";
  wdProtein.innerText = weekly.avgProtein ?? "—";
  wdSleep.innerText = weekly.avgSleep ?? "—";

  pulseElement(wdCalories);
  pulseElement(wdProtein);
  pulseElement(wdSleep);
}

function updateLast7List(rows) {
  last7List.innerHTML = "";
  if (!rows || rows.length === 0) return;

  const recent = [...rows];

  recent.forEach((r) => {
    const li = document.createElement("li");
    li.className = "log-item";
    const date = r.date ? new Date(r.date).toISOString().split("T")[0] : "—";
    li.innerHTML = `
      <span class="key">${date}</span>
      <span>${r.calories || "0"} cal / ${r.protein || "0"} g</span>
    `;
    last7List.appendChild(li);
  });
}

/* ============================================================
   WEEKLY TARGETS (local visual)
   ============================================================ */

targetsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hudFlash();

  const tCalories = Number(document.getElementById("targetCalories").value) || 0;
  const tProtein = Number(document.getElementById("targetProtein").value) || 0;
  const tTraining = Number(document.getElementById("targetTraining").value) || 0;

  const aCalories = Number(wdCalories.innerText) || 0;
  const aProtein = Number(wdProtein.innerText) || 0;
  const aTraining = 0;

  const pct = (actual, target) => {
    if (!target || target <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((actual / target) * 100)));
  };

  const cPct = pct(aCalories, tCalories);
  const pPct = pct(aProtein, tProtein);
  const trPct = pct(aTraining, tTraining);

  barCalories.style.width = cPct + "%";
  barProtein.style.width = pPct + "%";
  barTraining.style.width = trPct + "%";

  valCalories.innerText = `${aCalories} / ${tCalories || "—"}`;
  valProtein.innerText = `${aProtein} / ${tProtein || "—"}`;
  valTraining.innerText = `${aTraining} / ${tTraining || "—"}`;
});

/* ============================================================
   TRAINING LOG
   ============================================================ */

trainingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hudFlash();

  const item = document.createElement("li");
  item.className = "log-item";
  item.innerHTML = `
    <span class="key">${document.getElementById("tSession").value}</span>
    <span>${document.getElementById("tDuration").value} min</span>
  `;

  trainingList.appendChild(item);
});

/* ============================================================
   MEAL CREATOR
   ============================================================ */

saveMealBtn.addEventListener("click", () => {
  hudFlash();

  const item = document.createElement("li");
  item.className = "log-item";
  item.innerHTML = `
    <span class="key">${document.getElementById("mealName").value}</span>
    <span>${document.getElementById("mealCalories").value} cal</span>
  `;

  mealList.appendChild(item);
});

/* ============================================================
   GROCERY DIRECTOR
   ============================================================ */

saveGroceryBtn.addEventListener("click", () => {
  hudFlash();

  const item = document.createElement("li");
  item.className = "log-item";
  item.innerHTML = `
    <span class="key">${document.getElementById("gItem").value}</span>
    <span>${document.getElementById("gQty").value} ${document.getElementById("gUnit").value}</span>
  `;

  groceryList.appendChild(item);
});

/* AUTO‑GEN FROM MEALS (frontend-only demo) */
autoGenBtn.addEventListener("click", () => {
  hudFlash();

  const items = [
    "Chicken Breast",
    "Rice",
    "Eggs",
    "Spinach",
    "Greek Yogurt"
  ];

  items.forEach((i) => {
    const li = document.createElement("li");
    li.className = "log-item";
    li.innerHTML = `<span class="key">${i}</span><span>1 unit</span>`;
    groceryList.appendChild(li);
  });
});

/* ============================================================
   PATROL MODE
   ============================================================ */

patrolToggle.addEventListener("click", () => {
  hudFlash();

  patrolToggle.classList.toggle("active");

  if (patrolToggle.classList.contains("active")) {
    patrolToggle.innerText = "PATROL: ON";
  } else {
    patrolToggle.innerText = "PATROL: OFF";
  }
});

/* ============================================================
   BOOT-TIME SYNC
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  fetchWeeklyData();
});
