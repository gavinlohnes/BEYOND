// =========================
// CORE STATE
// =========================

const OSState = {
  tick: 0,
  mode: "REDX",
  link: "ONLINE",
  signal: "STABLE",
  mission: "IDLE",
  riskLevel: "LOW",
  predictions: [],
  scenarios: [],
  log: [],
  lastUpdate: null
};

// Utility: push to log with cap
function pushLog(line) {
  const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
  OSState.log.push(`[${timestamp}] ${line}`);
  if (OSState.log.length > 40) {
    OSState.log.shift();
  }
}

// =========================
// ENGINES (INLINE)
// =========================

// Autonomous Engine
function runAutonomousEngine(state) {
  if (state.tick === 0) {
    pushLog("AUTONOMOUS: CORE ONLINE");
  }
  if (state.tick % 20 === 0 && state.tick !== 0) {
    pushLog("AUTONOMOUS: ROUTINE SYSTEM SWEEP COMPLETE");
  }
}

// Self-Correcting Engine
function runSelfCorrectingEngine(state) {
  if (state.signal !== "STABLE") {
    pushLog("SELF-CORRECTING: SIGNAL ANOMALY DETECTED, ADJUSTING…");
    state.signal = "STABLE";
  }
}

// Self-Balancing Engine
function runSelfBalancingEngine(state) {
  if (state.riskLevel === "HIGH") {
    pushLog("SELF-BALANCING: RISK HIGH, DAMPENING LOAD");
    state.riskLevel = "MEDIUM";
  } else if (state.riskLevel === "MEDIUM") {
    state.riskLevel = "LOW";
  }
}

// Prediction Engine
function runPredictionEngine(state) {
  if (state.tick % 15 === 0) {
    const prediction = `PREDICTION: NEXT LOAD SPIKE IN ~${30 + state.tick} TICKS`;
    state.predictions.push(prediction);
    if (state.predictions.length > 5) state.predictions.shift();
    pushLog("PREDICTION: UPDATED FUTURE LOAD MODEL");
  }
}

// Scenario Smoothing Engine
function runScenarioEngine(state) {
  if (state.tick % 25 === 0 && state.tick !== 0) {
    const scenario = `SCENARIO: ALT PATH READY @ TICK ${state.tick + 10}`;
    state.scenarios.push(scenario);
    if (state.scenarios.length > 5) state.scenarios.shift();
    pushLog("SCENARIO: PREPARED ALTERNATE ROUTE");
  }
}

// Mission Orchestration Engine
function runMissionEngine(state) {
  if (state.tick === 5 && state.mission === "IDLE") {
    state.mission = "ARMED";
    pushLog("MISSION: PROFILE REDX ARMED");
  }
  if (state.tick === 30 && state.mission === "ARMED") {
    state.mission = "TRACKING";
    pushLog("MISSION: TRACKING LIVE CONTEXT");
  }
}

// Adaptive Fail-Safe Engine
function runFailSafeEngine(state) {
  if (state.tick % 40 === 0 && state.tick !== 0) {
    pushLog("FAIL-SAFE: CHECKPOINT SNAPSHOT TAKEN");
  }
}

// Insight Timing Engine
function runInsightEngine(state) {
  if (state.tick % 18 === 0 && state.tick !== 0) {
    pushLog("INSIGHT: SYSTEM TREND STABLE, NO ACTION REQUIRED");
  }
}

// =========================
// RENDERING
// =========================

function renderLogPanel() {
  const logPanel = document.getElementById("log-panel");
  if (!logPanel) return;
  logPanel.innerHTML = "";
  OSState.log.forEach(line => {
    const row = document.createElement("p");
    row.textContent = line;
    row.style.marginBottom = "0.2rem";
    logPanel.appendChild(row);
  });
}

function renderVisor() {
  const linkEl = document.getElementById("visor-link");
  const modeEl = document.getElementById("visor-mode");
  const signalEl = document.getElementById("visor-signal");
  if (linkEl) linkEl.textContent = `• LINK: ${OSState.link}`;
  if (modeEl) modeEl.textContent = `• MODE: ${OSState.mode}`;
  if (signalEl) signalEl.textContent = `• SIGNAL: ${OSState.signal}`;
}

function renderToday() {
  const coreEl = document.getElementById("today-core");
  const panelsEl = document.getElementById("today-panels");
  const missionEl = document.getElementById("today-mission");

  if (coreEl) coreEl.textContent = "/// CORE SHELL ACTIVE";
  if (panelsEl) panelsEl.textContent = "/// ENGINES ONLINE";
  if (missionEl) missionEl.textContent = `/// MISSION: ${OSState.mission}`;
}

// =========================
// UPDATE LOOP
// =========================

function runEngines() {
  runAutonomousEngine(OSState);
  runSelfCorrectingEngine(OSState);
  runSelfBalancingEngine(OSState);
  runPredictionEngine(OSState);
  runScenarioEngine(OSState);
  runMissionEngine(OSState);
  runFailSafeEngine(OSState);
  runInsightEngine(OSState);
}

function tick() {
  OSState.tick += 1;
  OSState.lastUpdate = Date.now();

  runEngines();
  renderVisor();
  renderToday();
  renderLogPanel();
}

// =========================
// BOOT SEQUENCE
// =========================

function bootSequence() {
  // Initial boot log
  pushLog("/// BOOTSTRAP: CORE ONLINE");
  pushLog("/// VISOR: LINKED");
  pushLog("/// REDX PROFILE: LOADED");
  pushLog("/// ENGINES: STANDING BY");

  renderVisor();
  renderToday();
  renderLogPanel();

  // Start engine loop
  setInterval(tick, 1500);

  // Remove splash after boot timing
  setTimeout(() => {
    const splash = document.getElementById("os-splash");
    if (splash) splash.remove();
  }, 1600);
}

window.addEventListener("load", bootSequence);
