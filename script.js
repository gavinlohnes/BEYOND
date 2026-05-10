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

/* Suit AI personality */

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

/* Audio */

function playVoice(type) {
  const map = {
    overdrive: "voiceOverdrive",
    stabilizing: "voiceStabilize",
    workout: "voiceWorkout",
    meals: "voiceMeals",
    grocery: "voiceGrocery"
  };
  const el = document.getElementById(map[type]);
  if (el) el.play();
}

/* Scenario + theme stubs */

function setScenario(s) {
  state.activeScenario = s;
  triggerWarningPulse();
  updateThreatPanel();
}

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

/* Overdrive */

function enterOverdrive() {
  document.body.classList.add("overdrive-active");
  playVoice("overdrive");
  triggerWarningPulse();
  flickerPanels();
}

function exitOverdrive() {
  document.body.classList.remove("overdrive-active");
  playVoice("stabilizing");
}

/* Readiness */

function updateReadinessDisplay() {
  const el = document.getElementById("readinessValue");
  if (!el) return;
  el.textContent = state.readiness;

  if (state.readiness > 90) enterOverdrive();
  else if (state.readiness < 40) playVoice("stabilizing");
  else exitOverdrive();

  updateThreatPanel();
}

/* Missions */

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

  if (mission.includes("UPPER") || mission.includes("LOWER"))
    return -12;
  if (mission.includes("MEAL PREP"))
    return -4;
  if (mission.includes("GROCERY"))
    return -6;
  if (mission.includes("RECOVERY"))
    return +8;
  if (mission.includes("REST"))
    return +12;

  return 0;
}

function predictReadiness() {
  const r = state.readiness;
  return Math.max(0, Math.min(100, r + missionReadinessImpact()));
}

/* Threat level */

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
  if (!el) return;
  el.textContent = level;
  applyThreatColor(level);
}

/* Workout generator */

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

/* Meals */

function generateMealIntel() {
  const a = document.getElementById("mealAView").textContent;
  const b = document.getElementById("mealBView").textContent;

  const base = [
    `Primary Fuel: ${a}`,
    `Secondary Fuel: ${b}`,
    "Protein Target: 160g",
    "Carb Target: 240g",
    "Fat Target: 60g"
  ];

  return base;
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

/* Grocery */

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

/* Cross‑integration */

function completeWorkout() {
  state.readiness = Math.max(0, state.readiness - 15);
  updateReadinessDisplay();
  document.getElementById("meal-intel").textContent =
    "Fuel Required: Increase protein + carbs.";
  playVoice("meals");
  suitAI.speak("warning");
}

function syncMealsToGrocery() {
  const list = generateGroceryList();
  document.getElementById("groc-list").textContent = list.join("\n");
  document.getElementById("grocStatus").textContent = "UPDATED";
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

function missionMealAdjustment() {
  const mission = getTodayMission();

  if (mission.includes("TRAINING"))
    return "Increase carbs + hydration.";
  if (mission.includes("RECOVERY"))
    return "Increase protein + electrolytes.";
  if (mission.includes("REST"))
    return "Maintain baseline intake.";

  return "Standard fueling protocol.";
}

function missionReadinessWarning() {
  const r = state.readiness;
  const mission = getTodayMission();

  if (r < 40 && mission.includes("TRAINING"))
    return "⚠ Suit recommends postponing training.";
  if (r < 20)
    return "⚠ Critical readiness. Switch to recovery.";

  return "Mission acceptable.";
}

function overdriveIntegration() {
  if (!document.body.classList.contains("overdrive-active")) return;

  document.getElementById("meal-intel").textContent =
    "⚠ OVERDRIVE: Increase caloric intake by 20%.";
  document.getElementById("grocStatus").textContent = "OVERDRIVE PRIORITY";
  document.getElementById("wk-intensity").textContent = "MAXIMUM";
  updateThreatPanel();
}

/* Suit AI contextual */

function suitContextualResponse() {
  const threat = classifyThreat(calculateThreatLevel());
  const r = state.readiness;
  const s = state.activeScenario;

  if (document.body.classList.contains("overdrive-active"))
    return suitAI.speak("overdrive");

  if (threat.includes("RED"))
    return suitAI.speak("warning");

  if (r < 30)
    return suitAI.speak("warning");

  if (s === "HIGH_CAPACITY")
    return suitAI.speak("neutral");

  if (Math.random() < 0.05)
    return suitAI.speak("humor");

  return suitAI.speak("neutral");
}

/* HUD helpers */

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

/* Nav init */

function initNavButtons() {
  document.querySelectorAll(".nav-button[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;

      if (target === "workout") {
        setScenario("HIGH_CAPACITY");
        openSubscreen("screenWorkout");
        activateSubHUD("hudWorkout");
        suitAI.display("Training parameters optimal.");
        playVoice("workout");
      }

      if (target === "meals") {
        setScenario("IDLE");
        openSubscreen("screenMeals");
        activateSubHUD("hudMeals");
        suitAI.display("Standard fueling protocol active.");
        playVoice("meals");
      }

      if (target === "grocery") {
        setScenario("LOW_CAPACITY");
        openSubscreen("screenGrocery");
        activateSubHUD("hudGrocery");
        suitAI.display("Procurement recommended.");
        playVoice("grocery");
      }

      if (target === "missions") {
        openSubscreen("screenMissions");
        loadMissionGrid();
      }
    });
  });
}

/* ESC to exit subscreen */

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".subscreen").forEach(s => s.classList.remove("subscreen-active"));
    activateSubHUD(null);
  }
});

/* Briefing */

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

/* Boot personality */

function bootSequence() {
  setTimeout(() => {
    suitAI.display("Systems online.");
  }, 800);

  setTimeout(() => {
    suitAI.display("Initializing tactical subsystems.");
  }, 1600);

  setTimeout(() => {
    suitAI.display("Awaiting mission parameters.");
  }, 2400);
}

/* Init */

window.addEventListener("load", () => {
  document.getElementById("missionToday").textContent = getTodayMission();
  document.getElementById("missionNext").textContent =
    "NEXT: " + getNextMission() + "\n" + missionReadinessWarning();

  document.getElementById("wk-intensity").textContent = getAdaptiveIntensity();
  updateReadinessDisplay();
  updateThreatPanel();
  showBriefing();
  initNavButtons();
  bootSequence();

  /* Workout button behavior */
  document.getElementById("wk-start").addEventListener("click", () => {
    const plan = generateWorkoutPlan().join("\n");
    document.getElementById("wk-plan").textContent = plan;
    document.getElementById("wk-intensity").textContent = getAdaptiveIntensity();
    playVoice("workout");
    suitAI.speak("neutral");
  });

  document.getElementById("wk-start").addEventListener("dblclick", completeWorkout);

  /* Meals */
  document.getElementById("meal-edit").addEventListener("click", () => {
    const intel = generateMealIntel();
    document.getElementById("meal-intel").textContent =
      intel.join("\n") + "\n\nMISSION ADJUSTMENT: " + missionMealAdjustment();
    playVoice("meals");
  });

  document.getElementById("meal-rotate").addEventListener("click", () => {
    rotateAnchorMeals();
    syncMealsToGrocery();
    playVoice("meals");
  });

  /* Grocery */
  document.getElementById("groc-generate").addEventListener("click", () => {
    let list = generateGroceryList();
    const budget = parseInt(document.getElementById("grocBudget").textContent.replace("$",""));
    list = optimizeBudget(list, budget);
    document.getElementById("groc-list").textContent = list.join("\n");
    document.getElementById("grocStatus").textContent = "UPDATED";
    playVoice("grocery");
    groceryImpact();
  });

  /* Periodic systems */
  setInterval(updateThreatPanel, 5000);
  setInterval(suitContextualResponse, 12000);
  setInterval(overdriveIntegration, 3000);
});
