/* ============================================================
   BEYOND-OS V21.6 PRIME — CORE SYSTEM LAYER
   ============================================================ */

/* -------------------------
   GLOBAL STATE OBJECT
   ------------------------- */

window.state = {
  _v: 4, // schema version for V21.6 PRIME

  // Core health metrics
  calories: 0,
  protein: 0,
  hydration: 0,
  sleep: 0,

  // Readiness + stability
  readiness: 50,
  stability: 70,
  stabilityTier: "NOMINAL",

  // Engine states
  activeScenario: "IDLE",
  missionContext: "NEUTRAL",
  missionDifficulty: "STANDARD",
  threat: 0,
  overdriveState: "OFF",
  overdriveVariant: null,
  overdriveCooldown: 0,

  // Micro-dynamics
  microDynamics: {
    pulseType: "NOMINAL",
    intensity: 10,
    lastChange: Date.now()
  },

  // Emotional Engine (6D scaffold)
  emotion: {
    arousal: 40,
    valence: 50,
    tension: 30,
    focus: 60,
    cognitiveLoad: 20,
    emotionalVolatility: 10,
    state: "NEUTRAL" // derived later
  },

  // Trend Engine scaffold
  trends: {
    calories: [],
    protein: [],
    hydration: [],
    sleep: [],
    readiness: []
  },

  // Targets
  targets: {
    calories: 2000,
    protein: 150,
    hydration: 80,
    sleep: 7,
    readiness: 70
  },

  // System metadata
  lastReset: Date.now(),
  memoryWeight: 0,
  trajectory: null,
  activePlaybook: null
};


/* -------------------------
   STATE PERSISTENCE
   ------------------------- */

function saveState() {
  try {
    localStorage.setItem("beyondState", JSON.stringify(state));
  } catch (e) {
    console.warn("State save failed", e);
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("beyondState"));
    if (saved && saved._v === state._v) {
      Object.assign(state, saved);
    }
  } catch (e) {
    console.warn("State load failed", e);
  }
}

loadState();


/* -------------------------
   EVENT BUS (BOS)
   ------------------------- */

const BOS = {
  events: {},

  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  },

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(h => h(data));
    }
  }
};


/* -------------------------
   UTILITY FUNCTIONS
   ------------------------- */

function clampValue(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function now() {
  return Date.now();
}

/* ============================================================
   BEYOND-OS V21.6 PRIME — CORE SYSTEM LAYER
   ============================================================ */

/* -------------------------
   GLOBAL STATE OBJECT
   ------------------------- */

window.state = {
  _v: 4, // schema version for V21.6 PRIME

  // Core health metrics
  calories: 0,
  protein: 0,
  hydration: 0,
  sleep: 0,

  // Readiness + stability
  readiness: 50,
  stability: 70,
  stabilityTier: "NOMINAL",

  // Engine states
  activeScenario: "IDLE",
  missionContext: "NEUTRAL",
  missionDifficulty: "STANDARD",
  threat: 0,
  overdriveState: "OFF",
  overdriveVariant: null,
  overdriveCooldown: 0,

  // Micro-dynamics
  microDynamics: {
    pulseType: "NOMINAL",
    intensity: 10,
    lastChange: Date.now()
  },

  // Emotional Engine (6D scaffold)
  emotion: {
    arousal: 40,
    valence: 50,
    tension: 30,
    focus: 60,
    cognitiveLoad: 20,
    emotionalVolatility: 10,
    state: "NEUTRAL" // derived later
  },

  // Trend Engine scaffold
  trends: {
    calories: [],
    protein: [],
    hydration: [],
    sleep: [],
    readiness: []
  },

  // Targets
  targets: {
    calories: 2000,
    protein: 150,
    hydration: 80,
    sleep: 7,
    readiness: 70
  },

  // System metadata
  lastReset: Date.now(),
  memoryWeight: 0,
  trajectory: null,
  activePlaybook: null
};


/* -------------------------
   STATE PERSISTENCE
   ------------------------- */

function saveState() {
  try {
    localStorage.setItem("beyondState", JSON.stringify(state));
  } catch (e) {
    console.warn("State save failed", e);
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem("beyondState"));
    if (saved && saved._v === state._v) {
      Object.assign(state, saved);
    }
  } catch (e) {
    console.warn("State load failed", e);
  }
}

loadState();


/* -------------------------
   EVENT BUS (BOS)
   ------------------------- */

const BOS = {
  events: {},

  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  },

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(h => h(data));
    }
  }
};


/* -------------------------
   UTILITY FUNCTIONS
   ------------------------- */

function clampValue(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function now() {
  return Date.now();
}

/* ============================================================
   CORE ENGINES — SCENARIO, THREAT, MISSION, OVERDRIVE,
   MICRODYNAMICS, STABILITY
   ============================================================ */

/* -------------------------
   SCENARIO ENGINE
   ------------------------- */

const ScenarioEngine = (() => {

  function evaluate() {
    const r = state.readiness;
    const s = state.stability;
    const t = state.threat;

    let scenario = "IDLE";

    if (r > 75 && s > 65 && t < 40) {
      scenario = "HIGH_CAPACITY";
    } else if (r < 35 || s < 40) {
      scenario = "LOW_CAPACITY";
    } else if (t > 70) {
      scenario = "ALERT";
    } else if (t > 40 && s > 50) {
      scenario = "STEALTH";
    }

    if (state.overdriveState === "READY") {
      scenario = "OVERDRIVE_READY";
    }

    if (scenario !== state.activeScenario) {
      const prev = state.activeScenario;
      state.activeScenario = scenario;
      applyScenarioBodyClass(scenario);
      BOS.emit("scenario:changed", { previous: prev, current: scenario });
      saveState();
    }
  }

  function applyScenarioBodyClass(scenario) {
    const body = document.body;
    body.classList.remove(
      "scenario-idle",
      "scenario-high",
      "scenario-low",
      "scenario-stealth",
      "scenario-alert",
      "scenario-overdrive-ready"
    );

    switch (scenario) {
      case "HIGH_CAPACITY":
        body.classList.add("scenario-high");
        break;
      case "LOW_CAPACITY":
        body.classList.add("scenario-low");
        break;
      case "STEALTH":
        body.classList.add("scenario-stealth");
        break;
      case "ALERT":
        body.classList.add("scenario-alert");
        break;
      case "OVERDRIVE_READY":
        body.classList.add("scenario-overdrive-ready");
        break;
      default:
        body.classList.add("scenario-idle");
    }
  }

  BOS.on("metric:updated", evaluate);
  BOS.on("stability:changed", evaluate);
  BOS.on("threat:changed", evaluate);
  BOS.on("overdrive:stateChanged", evaluate);

  return {
    update: evaluate,
    getCurrent() {
      return state.activeScenario;
    }
  };
})();


/* -------------------------
   THREAT ENGINE
   ------------------------- */

const ThreatEngine = (() => {

  let lastThreatUpdate = now();

  function computeThreat() {
    const scenario = state.activeScenario;
    const r = state.readiness;
    const s = state.stability;

    let base = 10;

    if (scenario === "ALERT") base = 80;
    else if (scenario === "STEALTH") base = 50;
    else if (scenario === "HIGH_CAPACITY") base = 25;
    else if (scenario === "LOW_CAPACITY") base = 40;

    base += (100 - r) * 0.15;
    base += (60 - s) * 0.1;

    base = clampValue(base, 0, 100);
    state.threat = base;
    lastThreatUpdate = now();

    applyThreatBodyClass(base);
    BOS.emit("threat:changed", { value: base, level: getCurrentLevel() });
    saveState();
  }

  function decayThreat() {
    const elapsed = (now() - lastThreatUpdate) / 1000;
    if (elapsed > 30) {
      state.threat = clampValue(state.threat - 2);
      applyThreatBodyClass(state.threat);
      BOS.emit("threat:changed", { value: state.threat, level: getCurrentLevel() });
      lastThreatUpdate = now();
      saveState();
    }
  }

  function applyThreatBodyClass(value) {
    const body = document.body;
    body.classList.remove(
      "threat-none",
      "threat-low",
      "threat-moderate",
      "threat-high",
      "threat-critical"
    );

    let cls = "threat-none";
    if (value > 80) cls = "threat-critical";
    else if (value > 60) cls = "threat-high";
    else if (value > 40) cls = "threat-moderate";
    else if (value > 20) cls = "threat-low";

    body.classList.add(cls);
  }

  function getCurrentLevel() {
    const v = state.threat;
    if (v > 80) return "CRITICAL";
    if (v > 60) return "HIGH";
    if (v > 40) return "MODERATE";
    if (v > 20) return "LOW";
    return "NONE";
  }

  BOS.on("scenario:changed", computeThreat);
  BOS.on("metric:updated", computeThreat);

  setInterval(decayThreat, 5000);

  return {
    getValue() {
      return state.threat;
    },
    getCurrentLevel,
    report() {
      return {
        value: state.threat,
        level: getCurrentLevel()
      };
    }
  };
})();


/* -------------------------
   MISSION ENGINE
   ------------------------- */

const MissionEngine = (() => {

  function evaluate() {
    const scenario = state.activeScenario;
    const threat = state.threat;
    const readiness = state.readiness;

    let type = "NEUTRAL";
    let difficulty = "STANDARD";

    if (scenario === "HIGH_CAPACITY" && readiness > 70 && threat < 40) {
      type = "POWER";
      difficulty = "ELEVATED";
    } else if (scenario === "LOW_CAPACITY" || readiness < 40) {
      type = "RECOVERY";
      difficulty = "MINIMAL";
    } else if (threat > 60) {
      type = "TACTICAL";
      difficulty = "CRITICAL";
    } else if (scenario === "STEALTH") {
      type = "STEALTH";
      difficulty = "ELEVATED";
    } else {
      type = "CONTROL";
      difficulty = "STANDARD";
    }

    state.missionContext = type;
    state.missionDifficulty = difficulty;

    applyMissionBodyClass(type);
    BOS.emit("mission:changed", { type, difficulty });
    saveState();
  }

  function applyMissionBodyClass(type) {
    const body = document.body;
    body.classList.remove(
      "mission-power",
      "mission-control",
      "mission-recovery",
      "mission-tactical",
      "mission-stealth",
      "mission-neutral"
    );

    switch (type) {
      case "POWER":
        body.classList.add("mission-power");
        break;
      case "CONTROL":
        body.classList.add("mission-control");
        break;
      case "RECOVERY":
        body.classList.add("mission-recovery");
        break;
      case "TACTICAL":
        body.classList.add("mission-tactical");
        break;
      case "STEALTH":
        body.classList.add("mission-stealth");
        break;
      default:
        body.classList.add("mission-neutral");
    }
  }

  BOS.on("scenario:changed", evaluate);
  BOS.on("threat:changed", evaluate);
  BOS.on("metric:updated", evaluate);

  return {
    getCurrent() {
      return {
        type: state.missionContext,
        difficulty: state.missionDifficulty
      };
    },
    report() {
      return {
        type: state.missionContext,
        difficulty: state.missionDifficulty
      };
    }
  };
})();


/* -------------------------
   OVERDRIVE ENGINE
   ------------------------- */

const OverdriveEngine = (() => {

  function canActivate() {
    if (state.overdriveState === "ACTIVE") return false;
    if (state.overdriveCooldown > 0) return false;
    if (state.readiness < 60) return false;
    if (state.stability < 60) return false;
    if (state.threat > 70) return false;
    return true;
  }

  function autoVariant() {
    if (state.missionContext === "POWER") return "PRIME";
    if (state.missionContext === "TACTICAL") return "AGGRESSIVE";
    if (state.missionContext === "STEALTH") return "SILENT";
    if (state.stability < 65) return "RESTRICTED";
    return "PRIME";
  }

  function activate(variant) {
    if (!canActivate()) return false;

    const chosen = variant || autoVariant();

    state.overdriveState = "ACTIVE";
    state.overdriveVariant = chosen;
    state.overdriveCooldown = 100; // abstract cooldown units

    applyOverdriveBodyClass();
    BOS.emit("overdrive:activated", { variant: chosen });
    BOS.emit("overdrive:stateChanged", getState());
    saveState();

    return true;
  }

  function tickCooldown() {
    if (state.overdriveState === "ACTIVE") {
      state.overdriveCooldown = clampValue(state.overdriveCooldown - 1, 0, 100);
      if (state.overdriveCooldown === 0) {
        state.overdriveState = "COOLDOWN";
        BOS.emit("overdrive:stateChanged", getState());
      }
    } else if (state.overdriveState === "COOLDOWN") {
      state.overdriveCooldown = clampValue(state.overdriveCooldown - 1, 0, 100);
      if (state.overdriveCooldown === 0) {
        state.overdriveState = "OFF";
        state.overdriveVariant = null;
        BOS.emit("overdrive:stateChanged", getState());
      }
    }
    applyOverdriveBodyClass();
    saveState();
  }

  function applyOverdriveBodyClass() {
    const body = document.body;
    body.classList.remove(
      "overdrive-active",
      "overdrive-prime",
      "overdrive-aggressive",
      "overdrive-restricted",
      "overdrive-silent",
      "overdrive-cooldown"
    );

    if (state.overdriveState === "ACTIVE") {
      body.classList.add("overdrive-active");
      if (state.overdriveVariant) {
        body.classList.add("overdrive-" + state.overdriveVariant.toLowerCase());
      }
    } else if (state.overdriveState === "COOLDOWN") {
      body.classList.add("overdrive-cooldown");
    }
  }

  function getState() {
    return {
      state: state.overdriveState,
      variant: state.overdriveVariant,
      cooldown: state.overdriveCooldown
    };
  }

  setInterval(tickCooldown, 1000);

  return {
    canActivate,
    activate,
    getState,
    report() {
      return getState();
    }
  };
})();


/* -------------------------
   MICRODYNAMICS ENGINE
   ------------------------- */

const MicroDynamicsEngine = (() => {

  function evaluate() {
    const r = state.readiness;
    const s = state.stability;
    const t = state.threat;

    let pulseType = "NOMINAL";
    let intensity = 10;

    if (t > 70) {
      pulseType = "CRITICAL";
      intensity = 85;
    } else if (t > 50) {
      pulseType = "SURGE";
      intensity = 65;
    } else if (s < 40) {
      pulseType = "DRIFT";
      intensity = 55;
    } else if (state.overdriveState === "ACTIVE") {
      pulseType = "OVERDRIVE";
      intensity = 90;
    } else if (r < 35) {
      pulseType = "FLICKER";
      intensity = 45;
    }

    state.microDynamics.pulseType = pulseType;
    state.microDynamics.intensity = intensity;
    state.microDynamics.lastChange = now();

    applyPulseBodyClass(pulseType);
    BOS.emit("pulse:changed", { pulseType, intensity });
    saveState();
  }

  function applyPulseBodyClass(pulseType) {
    const body = document.body;
    body.classList.remove(
      "pulse-nominal",
      "pulse-flicker",
      "pulse-drift",
      "pulse-surge",
      "pulse-critical",
      "pulse-overdrive",
      "pulse-silent"
    );

    switch (pulseType) {
      case "FLICKER":
        body.classList.add("pulse-flicker");
        break;
      case "DRIFT":
        body.classList.add("pulse-drift");
        break;
      case "SURGE":
        body.classList.add("pulse-surge");
        break;
      case "CRITICAL":
        body.classList.add("pulse-critical");
        break;
      case "OVERDRIVE":
        body.classList.add("pulse-overdrive");
        break;
      case "SILENT":
        body.classList.add("pulse-silent");
        break;
      default:
        body.classList.add("pulse-nominal");
    }
  }

  setInterval(evaluate, 2000);

  return {
    getPulseType() {
      return state.microDynamics.pulseType;
    },
    getIntensity() {
      return state.microDynamics.intensity;
    }
  };
})();


/* -------------------------
   STABILITY ENGINE
   ------------------------- */

const StabilityEngine = (() => {

  function evaluate() {
    const r = state.readiness;
    const t = state.threat;
    const md = state.microDynamics.intensity;
    const sleep = state.sleep || 0;

    let stability = 70;

    stability += (sleep - 7) * 3;
    stability += (r - 50) * 0.4;
    stability -= (t - 30) * 0.3;
    stability -= (md - 30) * 0.3;

    stability = clampValue(stability, 0, 100);
    state.stability = stability;

    const tier = computeTier(stability);
    state.stabilityTier = tier;

    applyStabilityBodyClass(tier);
    BOS.emit("stability:changed", { value: stability, tier });
    saveState();
  }

  function computeTier(v) {
    if (v >= 90) return "LOCKED";
    if (v >= 75) return "STABLE";
    if (v >= 60) return "NOMINAL";
    if (v >= 45) return "DEGRADED";
    if (v >= 30) return "UNSTABLE";
    return "CRITICAL";
  }

  function applyStabilityBodyClass(tier) {
    const body = document.body;
    body.classList.remove(
      "stability-locked",
      "stability-stable",
      "stability-nominal",
      "stability-degraded",
      "stability-unstable",
      "stability-critical"
    );

    switch (tier) {
      case "LOCKED":
        body.classList.add("stability-locked");
        break;
      case "STABLE":
        body.classList.add("stability-stable");
        break;
      case "NOMINAL":
        body.classList.add("stability-nominal");
        break;
      case "DEGRADED":
        body.classList.add("stability-degraded");
        break;
      case "UNSTABLE":
        body.classList.add("stability-unstable");
        break;
      case "CRITICAL":
        body.classList.add("stability-critical");
        break;
    }
  }

  setInterval(evaluate, 3000);

  return {
    getValue() {
      return state.stability;
    },
    getCurrentTier() {
      return state.stabilityTier;
    },
    report() {
      return {
        value: state.stability,
        tier: state.stabilityTier
      };
    }
  };
})();

/* ============================================================
   EMOTIONAL ENGINE (6‑DIMENSION SCAFFOLD)
   ============================================================ */

/*
   This engine is a scaffold only — no real emotional logic yet.
   It provides:
   • 6D emotional vector
   • placeholder compute function
   • BOS event hooks
   • body class mapping
   • future‑proof structure for V22–V24
*/

const EmotionalEngine = (() => {

  function compute() {
    const e = state.emotion;

    // Placeholder logic — future versions will compute these dynamically
    e.arousal = clampValue(e.arousal);
    e.valence = clampValue(e.valence);
    e.tension = clampValue(e.tension);
    e.focus = clampValue(e.focus);
    e.cognitiveLoad = clampValue(e.cognitiveLoad);
    e.emotionalVolatility = clampValue(e.emotionalVolatility);

    // Derive emotional state (placeholder)
    let derived = "NEUTRAL";

    if (e.tension > 70 || e.cognitiveLoad > 70) derived = "OVERLOADED";
    else if (e.arousal > 70 && e.valence > 60) derived = "ENGAGED";
    else if (e.arousal < 30 && e.valence > 50) derived = "CALM";
    else if (e.valence < 40) derived = "NEGATIVE";
    else if (e.emotionalVolatility > 60) derived = "UNSTABLE";

    state.emotion.state = derived;

    applyEmotionBodyClass(derived);
    BOS.emit("emotion:changed", { state: derived, vector: { ...e } });
    saveState();
  }

  function applyEmotionBodyClass(stateName) {
    const body = document.body;

    body.classList.remove(
      "emotion-calm",
      "emotion-engaged",
      "emotion-overloaded",
      "emotion-negative",
      "emotion-unstable",
      "emotion-neutral"
    );

    switch (stateName) {
      case "CALM":
        body.classList.add("emotion-calm");
        break;
      case "ENGAGED":
        body.classList.add("emotion-engaged");
        break;
      case "OVERLOADED":
        body.classList.add("emotion-overloaded");
        break;
      case "NEGATIVE":
        body.classList.add("emotion-negative");
        break;
      case "UNSTABLE":
        body.classList.add("emotion-unstable");
        break;
      default:
        body.classList.add("emotion-neutral");
    }
  }

  // Emotional Engine ticks every 4 seconds (placeholder)
  setInterval(compute, 4000);

  return {
    getState() {
      return { ...state.emotion };
    },
    report() {
      return {
        state: state.emotion.state,
        vector: { ...state.emotion }
      };
    }
  };
})();

/* ============================================================
   HUD DISPLAY + SUIT AI + UI PANELS
   ============================================================ */

/* -------------------------
   HUD DISPLAY
   ------------------------- */

const HUDDisplay = (() => {

  const els = {};

  function cache() {
    els.readiness = document.querySelector("[data-hud='readiness']");
    els.stability = document.querySelector("[data-hud='stability']");
    els.threat = document.querySelector("[data-hud='threat']");
    els.mission = document.querySelector("[data-hud='mission']");
    els.scenario = document.querySelector("[data-hud='scenario']");
    els.overdrive = document.querySelector("[data-hud='overdrive']");
  }

  function render() {
    if (!els.readiness) cache();

    if (els.readiness) els.readiness.textContent = `${Math.round(state.readiness)}%`;
    if (els.stability) els.stability.textContent = `${Math.round(state.stability)}%`;
    if (els.threat) els.threat.textContent = `${Math.round(state.threat)}%`;

    if (els.mission) {
      els.mission.textContent = `${state.missionContext} (${state.missionDifficulty})`;
    }

    if (els.scenario) {
      els.scenario.textContent = state.activeScenario;
    }

    if (els.overdrive) {
      const od = OverdriveEngine.getState();
      els.overdrive.textContent = `${od.state}${od.variant ? " / " + od.variant : ""}`;
    }
  }

  BOS.on("metric:updated", render);
  BOS.on("stability:changed", render);
  BOS.on("threat:changed", render);
  BOS.on("mission:changed", render);
  BOS.on("scenario:changed", render);
  BOS.on("overdrive:stateChanged", render);

  setInterval(render, 2000);

  return {
    render
  };
})();

/* -------------------------
   SUIT AI (VOICE / TEXT CALLOUTS)
   ------------------------- */

const SuitAI = (() => {

  const queue = [];
  let isSpeaking = false;

  function speak(message, level = "INFO") {
    queue.push({ message, level });
    processQueue();
  }

  function processQueue() {
    if (isSpeaking || queue.length === 0) return;

    const next = queue.shift();
    isSpeaking = true;

    const el = document.querySelector("[data-suitai='output']");
    if (el) {
      el.textContent = `[${next.level}] ${next.message}`;
      el.classList.add("suitai-active");
      setTimeout(() => {
        el.classList.remove("suitai-active");
      }, 2500);
    }

    setTimeout(() => {
      isSpeaking = false;
      processQueue();
    }, 2600);
  }

  // Sample hooks
  BOS.on("overdrive:activated", ({ variant }) => {
    speak(`Overdrive ${variant || "PRIME"} engaged. Routing power.`, "SYSTEM");
  });

  BOS.on("stability:changed", ({ tier }) => {
    if (tier === "CRITICAL") {
      speak("Stability critical. Recommend immediate load reduction.", "ALERT");
    } else if (tier === "LOCKED") {
      speak("Stability locked. System performance optimal.", "SYSTEM");
    }
  });

  BOS.on("emotion:changed", ({ state }) => {
    if (state === "OVERLOADED") {
      speak("Cognitive load elevated. Simplifying interface.", "ADVISORY");
    }
  });

  return {
    speak
  };
})();

/* -------------------------
   QUICK-ADD + INPUT HANDLERS
   ------------------------- */

(function setupInputs() {
  const inputs = document.querySelectorAll("[data-input]");
  inputs.forEach(input => {
    input.addEventListener("change", () => {
      const key = input.getAttribute("data-input");
      const value = parseFloat(input.value) || 0;

      if (["calories", "protein", "hydration", "sleep"].includes(key)) {
        state[key] = value;
        BOS.emit("metric:updated", { key, value });
        saveState();
      }
    });
  });

  const quickButtons = document.querySelectorAll("[data-quick-add]");
  quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-quick-add");
      const delta = parseFloat(btn.getAttribute("data-amount")) || 0;

      if (state[key] == null) state[key] = 0;
      state[key] += delta;

      BOS.emit("metric:updated", { key, value: state[key] });
      saveState();
    });
  });
})();

/* -------------------------
   PANEL TOGGLING
   ------------------------- */

(function setupPanels() {
  const toggles = document.querySelectorAll("[data-panel-toggle]");
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const target = toggle.getAttribute("data-panel-toggle");
      const panel = document.querySelector(`[data-panel='${target}']`);
      if (!panel) return;

      const isActive = panel.classList.contains("panel-active");
      document
        .querySelectorAll("[data-panel]")
        .forEach(p => p.classList.remove("panel-active"));

      if (!isActive) {
        panel.classList.add("panel-active");
      }
    });
  });
})();

/* -------------------------
   THEME ENGINE
   ------------------------- */

const ThemeEngine = (() => {

  function applyTheme() {
    const body = document.body;

    body.classList.remove(
      "theme-nominal",
      "theme-alert",
      "theme-recovery",
      "theme-overdrive",
      "theme-stealth"
    );

    if (state.overdriveState === "ACTIVE") {
      body.classList.add("theme-overdrive");
      return;
    }

    if (state.missionContext === "RECOVERY") {
      body.classList.add("theme-recovery");
      return;
    }

    if (state.activeScenario === "STEALTH") {
      body.classList.add("theme-stealth");
      return;
    }

    if (state.threat > 60) {
      body.classList.add("theme-alert");
      return;
    }

    body.classList.add("theme-nominal");
  }

  BOS.on("mission:changed", applyTheme);
  BOS.on("scenario:changed", applyTheme);
  BOS.on("threat:changed", applyTheme);
  BOS.on("overdrive:stateChanged", applyTheme);

  setInterval(applyTheme, 3000);

  return {
    apply: applyTheme
  };
})();

/* -------------------------
   INITIAL RENDER
   ------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  HUDDisplay.render();
  ThemeEngine.apply();
});

/* -------------------------
   INITIAL RENDER
   ------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  HUDDisplay.render();
  ThemeEngine.apply();
});

/* -------------------------
   INITIAL RENDER
   ------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  HUDDisplay.render();
  ThemeEngine.apply();
});

/* ============================================================
   DIAGNOSTICS CONSOLE + SYSTEM GLUE LAYER
   ============================================================ */

/* -------------------------
   DIAGNOSTICS PANEL
   ------------------------- */

const Diagnostics = (() => {

  const el = document.querySelector("[data-diagnostics='output']");

  function render() {
    if (!el) return;

    const od = OverdriveEngine.getState();
    const mission = MissionEngine.getCurrent();
    const threat = ThreatEngine.report();
    const stability = StabilityEngine.report();
    const emotion = EmotionalEngine.report();
    const trends = TrendEngine.report();

    el.textContent = JSON.stringify(
      {
        readiness: state.readiness,
        stability,
        threat,
        mission,
        scenario: state.activeScenario,
        overdrive: od,
        emotion,
        microDynamics: state.microDynamics,
        trends
      },
      null,
      2
    );
  }

  // Update diagnostics on all major events
  BOS.on("metric:updated", render);
  BOS.on("stability:changed", render);
  BOS.on("threat:changed", render);
  BOS.on("mission:changed", render);
  BOS.on("scenario:changed", render);
  BOS.on("overdrive:stateChanged", render);
  BOS.on("emotion:changed", render);
  BOS.on("pulse:changed", render);
  BOS.on("trend:updated", render);

  setInterval(render, 3000);

  return { render };
})();

/* -------------------------
   READINESS CALCULATION
   ------------------------- */

function computeReadiness() {
  const c = state.calories;
  const p = state.protein;
  const h = state.hydration;
  const s = state.sleep;

  const tC = state.targets.calories;
  const tP = state.targets.protein;
  const tH = state.targets.hydration;
  const tS = state.targets.sleep;

  let readiness = 50;

  readiness += ((c / tC) - 1) * 20;
  readiness += ((p / tP) - 1) * 25;
  readiness += ((h / tH) - 1) * 15;
  readiness += ((s / tS) - 1) * 25;

  readiness -= state.threat * 0.1;
  readiness -= state.microDynamics.intensity * 0.05;

  readiness = clampValue(readiness, 0, 100);
  state.readiness = readiness;

  BOS.emit("readiness:changed", { value: readiness });
  saveState();
}

setInterval(computeReadiness, 4000);

/* -------------------------
   GLOBAL METRIC UPDATE HOOK
   ------------------------- */

BOS.on("metric:updated", ({ key, value }) => {
  if (["calories", "protein", "hydration", "sleep"].includes(key)) {
    computeReadiness();
  }
});

/* -------------------------
   SYSTEM RESET HANDLER
   ------------------------- */

function resetSystem() {
  state.calories = 0;
  state.protein = 0;
  state.hydration = 0;
  state.sleep = 0;

  state.readiness = 50;
  state.stability = 70;
  state.threat = 0;

  state.microDynamics = {
    pulseType: "NOMINAL",
    intensity: 10,
    lastChange: now()
  };

  state.emotion = {
    arousal: 40,
    valence: 50,
    tension: 30,
    focus: 60,
    cognitiveLoad: 20,
    emotionalVolatility: 10,
    state: "NEUTRAL"
  };

  state.trends = {
    calories: [],
    protein: [],
    hydration: [],
    sleep: [],
    readiness: []
  };

  state.overdriveState = "OFF";
  state.overdriveVariant = null;
  state.overdriveCooldown = 0;

  state.activeScenario = "IDLE";
  state.missionContext = "NEUTRAL";
  state.missionDifficulty = "STANDARD";

  BOS.emit("system:reset");
  saveState();
}

document.querySelectorAll("[data-reset]").forEach(btn => {
  btn.addEventListener("click", resetSystem);
});


/* -------------------------
   EVENT WIRING — BOS GLUE
   ------------------------- */

BOS.on("readiness:changed", () => {
  ScenarioEngine.update();
  MissionEngine.report();
});

BOS.on("stability:changed", () => {
  ScenarioEngine.update();
  MissionEngine.report();
});

BOS.on("threat:changed", () => {
  ScenarioEngine.update();
  MissionEngine.report();
});

BOS.on("emotion:changed", () => {
  // Emotional state may influence UI or future engines
});

/* -------------------------
   SYSTEM HEARTBEAT
   ------------------------- */

setInterval(() => {
  BOS.emit("system:heartbeat", { ts: now() });
}, 5000);

/* ============================================================
   V6 DECISION ENGINE — REAL‑TIME EXECUTION LOOP
   ============================================================ */

/* -------------------------
   SIGNAL POOL COLLECTOR
   ------------------------- */

const SignalPool = {
  collect() {
    return {
      readiness: state.readiness,
      threat: state.threat,
      stability: state.stability,

      // Emotional Engine (6D)
      emotion: state.emotion.state,

      scenario: state.activeScenario,
      mission: state.missionContext,
      overdrive: state.overdriveState,

      recovery: state.sleep, // proxy for recovery reserve
      volatility: state.microDynamics?.intensity || 0,

      playbook: state.activePlaybook || null,
      trajectory: state.trajectory || null,
      memory: state.memoryWeight || 0
    };
  }
};


/* -------------------------
   NORMALIZATION LAYER
   ------------------------- */

function normalizeSignals(s) {
  return {
    ...s,
    readiness: clampValue(s.readiness),
    threat: clampValue(s.threat),
    stability: clampValue(s.stability),
    volatility: clampValue(s.volatility),
    recovery: clampValue(s.recovery)
  };
}


/* -------------------------
   OVERRIDE HIERARCHY (STRICT)
   ------------------------- */

function applyOverrides(s) {

  // 1. STABILITY OVERRIDE
  if (s.stability < 30) {
    return {
      ...s,
      forcedState: "STABILIZE",
      restrictionLevel: "MAX"
    };
  }

  // 2. THREAT OVERRIDE
  if (s.threat > 70) {
    return {
      ...s,
      forcedState: "DEFENSIVE",
      restrictionLevel: "HIGH"
    };
  }

  // 3. RECOVERY OVERRIDE
  if (s.recovery < 30) {
    return {
      ...s,
      forcedState: "RECOVERY",
      restrictionLevel: "MODERATE"
    };
  }

  // 4. EMOTION CONSTRAINT
  if (s.emotion === "OVERLOADED") {
    return {
      ...s,
      forcedState: "SIMPLIFY",
      restrictionLevel: "HIGH"
    };
  }

  // 5. FLOW CONDITION
  if (s.readiness > 75 && s.stability > 70) {
    return {
      ...s,
      forcedState: "FLOW",
      restrictionLevel: "LOW"
    };
  }

  return s;
}


/* -------------------------
   FINAL CONVERGENCE LAYER (FCL)
   ------------------------- */

const FCL = {
  reduce(s) {

    let primaryState = "IDLE";
    let focus = "MAINTAIN";
    let restrictions = "NONE";
    let rationale = [];
    let nextAction = "NO_ACTION";

    if (s.forcedState === "STABILIZE") {
      primaryState = "STABILITY_LOCK";
      focus = "RECOVERY_ONLY";
      restrictions = "ALL_OPTIMIZATION_DISABLED";
      rationale.push("System stability below threshold");
      nextAction = "reduce load immediately";
    }

    else if (s.forcedState === "DEFENSIVE") {
      primaryState = "DEFENSIVE_MODE";
      focus = "RISK_REDUCTION";
      restrictions = "OVERDRIVE_DISABLED";
      rationale.push("Threat level elevated");
      nextAction = "minimize exposure tasks";
    }

    else if (s.forcedState === "RECOVERY") {
      primaryState = "RECOVERY_MODE";
      focus = "RESTORE_CAPACITY";
      restrictions = "NO_INTENSIVE_TASKS";
      rationale.push("Recovery deficit detected");
      nextAction = "prioritize recovery actions";
    }

    else if (s.forcedState === "SIMPLIFY") {
      primaryState = "SIMPLIFIED_OPERATION";
      focus = "REDUCE_COMPLEXITY";
      restrictions = "LIMITED_EXECUTION";
      rationale.push("Emotional overload detected");
      nextAction = "reduce system complexity";
    }

    else if (s.forcedState === "FLOW") {
      primaryState = "HIGH_PERFORMANCE";
      focus = "EXECUTION";
      restrictions = "NONE";
      rationale.push("Optimal readiness and stability");
      nextAction = "execute high-value tasks";
    }

    else {
      primaryState = "BASELINE";
      focus = "NORMAL_OPERATION";
      restrictions = "STANDARD";
      rationale.push("No override conditions met");
      nextAction = "continue normal operation";
    }

    return {
      primaryState,
      focus,
      restrictions,
      rationale,
      nextAction
    };
  }
};

/* -------------------------
   EXECUTION LOOP
   ------------------------- */

function executionLoop() {

  // 1. Collect signals
  const rawSignals = SignalPool.collect();

  // 2. Normalize
  const normalized = normalizeSignals(rawSignals);

  // 3. Apply overrides
  const overridden = applyOverrides(normalized);

  // 4. Final decision
  const decision = FCL.reduce(overridden);

  // 5. Output schema (MANDATED FORMAT)
  window.lastDecision = {
    primaryState: decision.primaryState,
    focus: decision.focus,
    restrictions: decision.restrictions,
    rationale: decision.rationale,
    nextAction: decision.nextAction
  };

  BOS.emit("decision:updated", window.lastDecision);

  return window.lastDecision;
}

/* -------------------------
   SYSTEM TICK SCHEDULERS
   ------------------------- */

// V6 Decision Engine tick
setInterval(() => {
  executionLoop();
}, 300);

// Scenario Engine tick (backup)
setInterval(() => {
  ScenarioEngine.update();
}, 2500);

// Mission Engine tick (backup)
setInterval(() => {
  MissionEngine.report();
}, 3500);

// Emotional Engine tick already defined in Segment 3
// MicroDynamics tick already defined in Segment 2
// Stability tick already defined in Segment 2
// Overdrive cooldown tick already defined in Segment 2

// Heartbeat already defined in Segment 5





