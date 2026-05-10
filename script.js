/* ============================================================
   BEYOND OS — V20 STABLE CORE
   Includes: Audio Fix, Threat System, Missions, AI Personality,
   Cross‑Integration, Overdrive, HUD, Boot Sequence
   ============================================================ */

/* -----------------------------
   0. AUDIO SAFETY PATCH
------------------------------ */

let userInteracted = false;

window.addEventListener("click", () => userInteracted = true);
window.addEventListener("keydown", () => userInteracted = true);

function safePlay(audioElement) {
  if (!userInteracted) return;
  if (!audioElement) return;
  audioElement.play().catch(() => {});
}

/* -----------------------------
   1. GLOBAL STATE
------------------------------ */

const state = {
  readiness: 80,
  activeScenario: "IDLE"
};

const missions = {
  Monday: "UPPER BODY TRAINING",
  Tuesday: "MEAL PREP",
  Wednesday: "LOWER BODY TRAINING",
  Thursday: "GROCERY RUN",
  Friday: "UPPER BODY TRAINING",
  Saturday: "ACTIVE RECOVERY",
  Sunday: "REST + RESET"
};

/* -----------------------------
   2. SUIT AI PERSONALITY
------------------------------ */

const suitAI = {
  tone: {
    neutral: [
      "Acknowledged.",
      "Confirmed.",
      "Online.",
      "Standing by.",
      "Processing."
    ],
    warning: [
      "Caution advised.",
      "Threat level rising.",
      "Readiness compromised.",
      "Recommend adjustment."
    ],
    overdrive: [
      "Overdrive strain increasing.",
      "Systems exceeding safe output.",
      "Warning: thermal load rising."
    ],
    humor: [
      "Sarcasm module: online.",
      "Your optimism is noted.",
      "I calculate a 12% chance you’ll listen."
    ]
  },

  speak(type = "neutral") {
    const pool = this.tone[type] || this.tone.neutral;
    const line = pool[Math.floor(Math.random() * pool.length)];
    this.display(line);
    return line;
  },

  display(text) {
    const panel = document.getElementById("suitHint");
    if (panel) panel.textContent = text;
  }
};

/* -----------------------------
   3. AUDIO ROUTER
------------------------------ */

function playVoice(type) {
  const map = {
    overdrive: "voiceOverdrive",
    stabilizing: "voiceStabilize",
    workout: "voiceWorkout",
    meals: "voiceMeals",
    grocery: "voiceGrocery"
  };

  const el = document.getElementById(map[type]);
  safePlay(el);
}

/* -----------------------------
   4. VISUAL EFFECTS
------------------------------ */

function triggerWarningPulse() {
  const app = document.getElementById("app");
  app.classList.add("warning-pulse");
  setTimeout(() => app.classList.remove("warning-pulse"), 800);
}

function flickerPanels() {
  document.querySelectorAll(".panel").forEach(p => {
    p.classList.add("panel-flicker");
    setTimeout(() => p.classList.remove("panel-flicker"), 260);
  });
}

/* -----------------------------
   5. OVERDRIVE MODE
------------------------------ */

function enterOverdrive() {
  document.body.classList.add("overdrive-active");
  playVoice("overdrive");
  triggerWarningPulse();
  flickerPanels();
}

function exitOverdrive() {
  document.body.classList.remove("overdrive-active");
}

/* -----------------------------
   6. READINESS ENGINE
------------------------------ */

function updateReadinessDisplay() {
  const el = document.getElementById("readinessValue");
  if (!el) return;

  el.textContent = state.readiness;

  if (state.readiness > 90) enterOverdrive();
  else exitOverdrive();

  updateThreatPanel();
}

/* -----------------------------
   7. MISSION SYSTEM
------------------------------ */

function getTodayMission() {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return missions[day];
}

function getNextMission() {
  const todayIndex = new Date().getDay();
  const nextIndex = (todayIndex + 1) % 7;
  const nextDay = Object.keys(missions)[nextIndex];
  return missions[nextDay];
}

function loadMissionGrid() {
  const grid = document.getElementById("missionGrid");
  grid.innerHTML = "";
  for (const [day, task] of Object.entries(missions)) {
    const div = document.createElement("div");
    div.className = "mission-card";
    div.innerHTML = `<strong>${day}</strong><br>${task}`;
    grid.appendChild(div);
  }
}

function missionReadinessImpact() {
  const mission = getTodayMission();

  if (mission.includes("UPPER") || mission.includes("LOWER")) return -12;
  if (mission.includes("MEAL PREP")) return -4;
  if (mission.includes("GROCERY")) return -6;
  if (mission.includes("RECOVERY")) return +8;
  if (mission.includes("REST")) return +12;

  return 0;
}

function predictReadiness() {
  const r = state.readiness;
  return Math.max(0, Math.min(100, r + missionReadinessImpact()));
}

/* -----------------------------
   8. THREAT LEVEL SYSTEM
------------------------------ */

function calculateThreatLevel() {
  const r = state.readiness;
  const s = state.activeScenario;
  const missionImpact = missionReadinessImpact();
  const overdrive = document.body.classList.contains("overdrive-active");

  let score = 0;

  if (r > 80) score += 0;
  else if (r > 60) score += 1;
  else if (r > 40) score += 2;
  else if (r > 20) score += 3;
  else score += 4;

  if (s === "HIGH_CAPACITY") score += 2;
  if (s === "LOW_CAPACITY") score += 1;

  if (missionImpact < 0) score += 1;
  if (missionImpact < -10) score += 2;

  if (overdrive) score += 3;

  const h = new Date().getHours();
  if (h < 6 || h > 22) score += 1;

  return score;
}

function classifyThreat(score) {
  if (score <= 1) return "GREEN — NOMINAL";
  if (score <= 3) return "YELLOW — ELEVATED";
  if (score <= 5) return "ORANGE — HIGH";
  if (score <= 7) return "RED — CRITICAL";
  return "BLACK — OVERDRIVE HAZARD";
}

function applyThreatColor(level) {
  const el = document.getElementById("threatValue");
  el.className = "metric-value";

  if (level.includes("GREEN")) el.classList.add("threat-green");
  else if (level.includes("YELLOW")) el.classList.add("threat-yellow");
  else if (level.includes("ORANGE")) el.classList.add("threat-orange");
  else if (level.includes("RED")) el.classList.add("threat-red");
  else el.classList.add("threat-black");
}

function updateThreatPanel() {
  const score = calculateThreatLevel();
  const level = classifyThreat(score);
  const el = document.getElementById("threatValue");
  el.textContent = level;
  applyThreatColor(level);
}

/* -----------------------------
   9. WORKOUT SYSTEM
------------------------------ */

function getAdaptiveIntensity() {
  const threat = classifyThreat(calculateThreatLevel());

  if (threat.includes("BLACK")) return "DISABLED";
  if (threat.includes("RED")) return "LOW";
  if (threat.includes("ORANGE")) return "MODERATE";
  if (threat.includes("YELLOW")) return "HIGH";
  return "MAXIMUM";
}

function generateWorkoutPlan() {
  const today = document.getElementById("wk-today").textContent;
  const readiness = state.readiness;

  let plan = [];

  if (today.includes("UPPER")) {
    plan = [
      "Bench Press — 4x6",
      "Pull‑Ups — 3x8",
      "Shoulder Press — 3x10",
      "Chest Fly — 3x12",
      "Tricep Dips — 3x12"
    ];
  }

  if (today.includes("LOWER")) {
    plan = [
      "Squats — 4x6",
      "Deadlift — 3x5",
      "Lunges — 3x10",
      "Leg Press — 3x12",
      "Calf Raises — 3x15"
    ];
  }

  if (readiness > 90) {
    plan.push("⚠ OVERDRIVE BONUS: SPRINTS — 6x40m");
  }

  return plan;
}

function completeWorkout() {
  state.readiness = Math.max(0, state.readiness - 15);
  updateReadinessDisplay();
  suitAI.speak("warning");
}

/* -----------------------------
   10. MEAL SYSTEM
------------------------------ */

function generateMealIntel() {
  const a = document.getElementById("mealAView").textContent;
  const b = document.getElementById("mealBView").textContent;

  return [
    `Primary Fuel: ${a}`,
    `Secondary Fuel: ${b}`,
    "Protein Target: 160g",
    "Carb Target: 240g",
    "Fat Target: 60g"
  ];
}

function rotateAnchorMeals() {
  const meals = [
    "BEEF + RICE",
    "CHICKEN + PASTA",
    "TOFU + NOODLES",
    "TURKEY + POTATO",
    "SALMON + RICE",
    "PORK + VEGGIES",
    "SHRIMP + UDON"
  ];

  const a = meals[Math.floor(Math.random() * meals.length)];
  const b = meals[Math.floor(Math.random() * meals.length)];

  document.getElementById("mealAView").textContent = a;
  document.getElementById("mealBView").textContent = b;
}

/* -----------------------------
   11. GROCERY SYSTEM
------------------------------ */

function generateGroceryList() {
  const a = document.getElementById("mealAView").textContent;
  const b = document.getElementById("mealBView").textContent;

  const list = [];

  if (a.includes("BEEF")) list.push("Ground Beef — 3 lbs");
  if (a.includes("RICE")) list.push("White Rice — 5 lbs");

  if (b.includes("CHICKEN")) list.push("Chicken Breast — 3 lbs");
  if (b.includes("PASTA")) list.push("Pasta — 2 boxes");

  list.push("Vegetables — 7 servings");
  list.push("Fruit — 7 servings");

  return list;
}

function optimizeBudget(list, budget) {
  const prices = {
    "Ground Beef — 3 lbs": 14,
    "White Rice — 5 lbs": 6,
    "Chicken Breast — 3 lbs": 12,
    "Pasta — 2 boxes": 4,
    "Vegetables — 7 servings": 10,
    "Fruit — 7 servings": 10
  };

  let total = list.reduce((sum, item) => sum + (prices[item] || 0), 0);

  while (total > budget && list.length > 0) {
    list.pop();
    total = list.reduce((sum, item) => sum + (prices[item] || 0), 0);
  }

  return list;
}

function groceryImpact() {
  const status = document.getElementById("grocStatus").textContent;

  if (status.includes("PRIORITY")) {
    state.readiness = Math.max(0, state.readiness - 5);
  }

  if (status.includes("UPDATED")) {
    state.readiness = Math.min(100, state.readiness + 3);
  }

  updateReadinessDisplay();
}

/* -----------------------------
   12. SUBSYSTEM HUD
------------------------------ */

function openSubscreen(id) {
  document.querySelectorAll(".subscreen").forEach(s => s.classList.remove("subscreen-active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("subscreen-active");
    flickerPanels();
    triggerWarningPulse();
  }
}

function activateSubHUD(id) {
  document.querySelectorAll(".sub-hud").forEach(h => h.classList.remove("sub-hud-active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("sub-hud-active");
}

/* -----------------------------
   13. NAVIGATION
------------------------------ */

function initNavButtons() {
  document.querySelectorAll(".nav-button[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;

      if (target === "workout") {
        openSubscreen("screenWorkout");
        activateSubHUD("hudWorkout");
        suitAI.display("Training parameters optimal.");
      }

      if (target === "meals") {
        openSubscreen("screenMeals");
        activateSubHUD("hudMeals");
        suitAI.display("Standard fueling protocol active.");
      }

      if (target === "grocery") {
        openSubscreen("screenGrocery");
        activateSubHUD("hudGrocery");
        suitAI.display("Procurement recommended.");
      }

      if (target === "missions") {
        openSubscreen("screenMissions");
        loadMissionGrid();
      }
    });
  });
}

/* -----------------------------
   14. ESC CLOSE
------------------------------ */

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".subscreen").forEach(s => s.classList.remove("subscreen-active"));
    activateSubHUD(null);
  }
});

/* -----------------------------
   15. BRIEFING
------------------------------ */

function generateBriefing() {
  return `
TODAY: ${getTodayMission()}
NEXT: ${getNextMission()}
READINESS: ${state.readiness}%
FORECAST: ${predictReadiness()}%
MISSION IMPACT: ${missionReadinessImpact()}
SCENARIO: ${state.activeScenario}
  `;
}

function showBriefing() {
  const b = document.getElementById("briefing");
  b.textContent = generateBriefing();
  b.classList.add("briefing-active");
}

/* -----------------------------
   16. BOOT SEQUENCE
------------------------------ */

function bootSequence() {
  setTimeout(() => suitAI.display("Systems online."), 800);
  setTimeout(() => suitAI.display("Initializing tactical subsystems."), 1600);
  setTimeout(() => suitAI.display("Awaiting mission parameters."), 2400);
}

/* -----------------------------
   17. INITIALIZATION
------------------------------ */

window.addEventListener("load", () => {
  document.getElementById("missionToday").textContent = getTodayMission();
  document.getElementById("missionNext").textContent =
    "NEXT: " + getNextMission();

  updateReadinessDisplay();
  updateThreatPanel();
  showBriefing();
  initNavButtons();
  bootSequence();

  /* Workout */
  document.getElementById("wk-start").addEventListener("click", () => {
    const plan = generateWorkoutPlan().join("\n");
    document.getElementById("wk-plan").textContent = plan;
    document.getElementById("wk-intensity").textContent = getAdaptiveIntensity();
    suitAI.speak("neutral");
  });

  document.getElementById("wk-start").addEventListener("dblclick", completeWorkout);

  /* Meals */
  document.getElementById("meal-edit").addEventListener("click", () => {
    const intel = generateMealIntel();
    document.getElementById("meal-intel").textContent =
      intel.join("\n");
  });

  document.getElementById("meal-rotate").addEventListener("click", () => {
    rotateAnchorMeals();
    const list = generateGroceryList();
    document.getElementById("groc-list").textContent = list.join("\n");
    document.getElementById("grocStatus").textContent = "UPDATED";
  });

  /* Grocery */
  document.getElementById("groc-generate").addEventListener("click", () => {
    let list = generateGroceryList();
    const budget = parseInt(document.getElementById("grocBudget").textContent.replace("$",""));
    list = optimizeBudget(list, budget);
    document.getElementById("groc-list").textContent = list.join("\n");
    document.getElementById("grocStatus").textContent = "UPDATED";
    groceryImpact();
  });

  /* Periodic Systems */
  setInterval(updateThreatPanel, 5000);
  setInterval(() => suitAI.speak("neutral"), 12000);
});
