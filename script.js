/* ============================================================
   BEYOND‑OS V41 — AUTONOMOUS ENGINE + WEEKLY ENGINE 2.0
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
const signalEmotional = document.getElementById("signalEmotional");
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
  "https://script.google.com/macros/s/AKfycbzc4HGOrrRAM4isV85CABdBEWQdr46Y2JPKWI0p9vbZgkzAQKVMFV5A7GfEmpz9YaAmQA/exec";

/* ============================================================
   SYNC STATUS HELPER
   ============================================================ */

function setSyncStatus(state, label) {
  syncStatus.classList.remove("ok", "error");
  if (state === "ok") syncStatus.classList.add("ok");
  if (state === "error") syncStatus.classList.add("error");
  syncStatus.innerText = label;
}

/* ============================================================
   DAILY LOG SUBMIT  (POST → Sheets + refresh weekly)
   ============================================================ */

dailyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hudFlash();

  const payload = {
    calories: document.getElementById("calories").value,
    protein: document.getElementById("protein").value,
    hydration: document.getElementById("hydration").value,
    sleep: document.getElementById("sleep").value,
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

    if (!res.ok) {
      setSyncStatus("error", "SHEETS: ERROR");
      return;
    }

    setSyncStatus("ok", "SHEETS: OK");

    // Refresh weekly data after a successful log
    await fetchWeeklyData();
  } catch (err) {
    setSyncStatus("error", "SHEETS: ERROR");
    console.error("POST error:", err);
  }
});

/* ============================================================
   WEEKLY ENGINE 2.0  (GET → Sheets, update dashboard)
   ============================================================ */

async function fetchWeeklyData() {
  try {
    const res = await fetch(SHEETS_URL);
    const data = await res.json();

    if (data.status !== "OK") {
      setSyncStatus("error", "SHEETS: ERROR");
      console.error("Sheets error:", data.message);
      return;
    }

    setSyncStatus("ok", "SHEETS: OK");

    const rows = data.rows || [];
    updateWeeklyDashboard(rows);
    updateLast7List(rows);
  } catch (err) {
    setSyncStatus("error", "SHEETS: ERROR");
    console.error("GET error:", err);
  }
}

function updateWeeklyDashboard(rows) {
  if (!rows || rows.length === 0) {
    wdCalories.innerText = "—";
    wdProtein.innerText = "—";
    wdSleep.innerText = "—";
    return;
  }

  const avg = (key) => {
    const nums = rows
      .map((r) => Number(r[key]) || 0)
      .filter((n) => !isNaN(n) && n > 0);
    if (!nums.length) return "—";
    const val =
      nums.reduce((a, b) => a + b, 0) / nums.length;
    return Math.round(val * 10) / 10;
  };

  wdCalories.innerText = avg("calories");
  wdProtein.innerText = avg("protein");
  wdSleep.innerText = avg("sleep");
}

function updateLast7List(rows) {
  last7List.innerHTML = "";
  if (!rows || rows.length === 0) return;

  const sorted = [...rows].sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return db - da;
  });

  const recent = sorted.slice(0, 7);

  recent.forEach((r) => {
    const li = document.createElement("li");
    li.className = "log-item";
    li.innerHTML = `
      <span class="key">${r.date || "—"}</span>
      <span>${r.calories || "0"} cal / ${r.protein || "0"} g</span>
    `;
    last7List.appendChild(li);
  });
}

/* ============================================================
   WEEKLY TARGETS (local only, visual engine)
   ============================================================ */

targetsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hudFlash();

  const tCalories = Number(document.getElementById("targetCalories").value) || 0;
  const tProtein = Number(document.getElementById("targetProtein").value) || 0;
  const tTraining = Number(document.getElementById("targetTraining").value) || 0;

  // Use current weekly dashboard values as "actuals"
  const aCalories = Number(wdCalories.innerText) || 0;
  const aProtein = Number(wdProtein.innerText) || 0;
  const aTraining = 0; // no training aggregation yet

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

/* AUTO‑GEN FROM MEALS */
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
   PREDICTIVE ENGINE (STATIC DEMO FOR NOW)
   ============================================================ */

function runPredictiveEngine() {
  predScenario.innerText = "ACTIVE";
  predMission.innerText = "ENGAGED";
  predIntensity.innerText = "MODERATE";
  predCalories.innerText = "2450";

  // Mirror into signals for now
  signalScenario.innerText = "ACTIVE";
  signalMission.innerText = "ENGAGED";
  signalEmotional.innerText = "STABLE";
  signalProfile.innerText = "CUT PHASE";
  signalRecommendation.innerText = "MAINTAIN CURRENT MISSION";
}

runPredictiveEngine();

/* ============================================================
   BOOT-TIME WEEKLY SYNC
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  fetchWeeklyData();
});
