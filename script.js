/* ============================================================
   BEYOND‑OS V41 — AUTONOMOUS ENGINE + BATMAN BEYOND UI SYNC
   Fully compatible with V41 HTML + CSS
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

    bootStatus.innerText = steps[Math.floor(progress / (100 / steps.length))] || "READY";

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
  "https://script.google.com/macros/s/AKfycbxcf9q-Jmbhe_jTKXbAHg7uMNW6g8LR8Jw0l8bM5aT5P9EgxGh1mYN7UY1rxeCSbAxkkg/exec";

/* ============================================================
   DAILY LOG SUBMIT
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
    syncStatus.innerText = "SHEETS: SYNCING…";

    await fetch(SHEETS_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    syncStatus.innerText = "SHEETS: OK";
  } catch (err) {
    syncStatus.innerText = "SHEETS: ERROR";
  }
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
}

runPredictiveEngine();
