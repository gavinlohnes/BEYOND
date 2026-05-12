// =========================
// CORE STATE
// =========================

const OSState = {
  tick: 0,
  mode: "REDX V5",
  link: "ONLINE",
  signal: "STABLE",
  mission: "IDLE",
  riskLevel: "LOW",
  predictions: [],
  scenarios: [],
  log: [],
  lastUpdate: null,
  notifications: [],
  apps: {
    diagnostics: { name: "Diagnostics" },
    missions: { name: "Missions" },
    timeline: { name: "Timeline" },
    settings: { name: "Settings" }
  }
};

// Utility: push to log with cap
function pushLog(line) {
  const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
  OSState.log.push(`[${timestamp}] ${line}`);
  if (OSState.log.length > 80) {
    OSState.log.shift();
  }
}

// =========================
// ENGINES (V4 INLINE)
// =========================

function runAutonomousEngine(state) {
  if (state.tick === 0) {
    pushLog("AUTONOMOUS: CORE ONLINE");
  }
  if (state.tick % 20 === 0 && state.tick !== 0) {
    pushLog("AUTONOMOUS: ROUTINE SYSTEM SWEEP COMPLETE");
  }
}

function runSelfCorrectingEngine(state) {
  if (state.signal !== "STABLE") {
    pushLog("SELF-CORRECTING: SIGNAL ANOMALY DETECTED, ADJUSTING…");
    state.signal = "STABLE";
  }
}

function runSelfBalancingEngine(state) {
  if (state.riskLevel === "HIGH") {
    pushLog("SELF-BALANCING: RISK HIGH, DAMPENING LOAD");
    state.riskLevel = "MEDIUM";
  } else if (state.riskLevel === "MEDIUM") {
    state.riskLevel = "LOW";
  }
}

function runPredictionEngine(state) {
  if (state.tick % 15 === 0) {
    const prediction = `Next load spike in ~${30 + state.tick} ticks`;
    state.predictions.push(prediction);
    if (state.predictions.length > 6) state.predictions.shift();
    pushLog("PREDICTION: UPDATED FUTURE LOAD MODEL");
  }
}

function runScenarioEngine(state) {
  if (state.tick % 25 === 0 && state.tick !== 0) {
    const scenario = `Alt path ready @ tick ${state.tick + 10}`;
    state.scenarios.push(scenario);
    if (state.scenarios.length > 6) state.scenarios.shift();
    pushLog("SCENARIO: PREPARED ALTERNATE ROUTE");
  }
}

function runMissionEngine(state) {
  if (state.tick === 5 && state.mission === "IDLE") {
    state.mission = "ARMED";
    pushLog("MISSION: PROFILE REDX ARMED");
    notify("MISSION", "Profile REDX armed.");
  }
  if (state.tick === 30 && state.mission === "ARMED") {
    state.mission = "TRACKING";
    pushLog("MISSION: TRACKING LIVE CONTEXT");
    notify("MISSION", "Tracking live context.");
  }
}

function runFailSafeEngine(state) {
  if (state.tick % 40 === 0 && state.tick !== 0) {
    pushLog("FAIL-SAFE: CHECKPOINT SNAPSHOT TAKEN");
  }
}

function runInsightEngine(state) {
  if (state.tick % 18 === 0 && state.tick !== 0) {
    pushLog("INSIGHT: SYSTEM TREND STABLE, NO ACTION REQUIRED");
  }
}

// =========================
// NOTIFICATION ENGINE
// =========================

function notify(channel, message) {
  const id = Date.now() + Math.random();
  const note = { id, channel, message };
  OSState.notifications.push(note);
  renderNotifications();
  setTimeout(() => {
    OSState.notifications = OSState.notifications.filter(n => n.id !== id);
    renderNotifications();
  }, 4500);
}

function renderNotifications() {
  const stack = document.getElementById("notification-stack");
  if (!stack) return;
  stack.innerHTML = "";
  OSState.notifications.forEach(n => {
    const div = document.createElement("div");
    div.className = "notification";
    div.textContent = `[${n.channel}] ${n.message}`;
    stack.appendChild(div);
  });
}

// =========================
// VISOR 2.0 OVERLAY
// =========================

function renderVisorOverlay() {
  const statusList = document.getElementById("visor-status-list");
  const predList = document.getElementById("visor-predictions-list");
  const scenList = document.getElementById("visor-scenarios-list");
  if (!statusList || !predList || !scenList) return;

  statusList.innerHTML = "";
  predList.innerHTML = "";
  scenList.innerHTML = "";

  const statusItems = [
    `Mode: ${OSState.mode}`,
    `Link: ${OSState.link}`,
    `Signal: ${OSState.signal}`,
    `Mission: ${OSState.mission}`,
    `Risk: ${OSState.riskLevel}`,
    `Tick: ${OSState.tick}`
  ];

  statusItems.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    statusList.appendChild(li);
  });

  OSState.predictions.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    predList.appendChild(li);
  });

  OSState.scenarios.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    scenList.appendChild(li);
  });
}

function toggleVisorOverlay(forceState) {
  const overlay = document.getElementById("visor-overlay");
  if (!overlay) return;
  const hidden = overlay.classList.contains("visor-hidden");
  const shouldShow = forceState === undefined ? hidden : forceState;
  if (shouldShow) {
    renderVisorOverlay();
    overlay.classList.remove("visor-hidden");
  } else {
    overlay.classList.add("visor-hidden");
  }
}

// =========================
// APP GRID + MODULE LOADER
// =========================

function renderAppOutput(text) {
  const out = document.getElementById("app-grid-output");
  if (!out) return;
  out.textContent = text;
}

function loadApp(appId) {
  switch (appId) {
    case "diagnostics":
      renderAppOutput(
        `Diagnostics: signal=${OSState.signal}, risk=${OSState.riskLevel}, tick=${OSState.tick}`
      );
      break;
    case "missions":
      renderAppOutput(`Missions: current mission state = ${OSState.mission}`);
      break;
    case "timeline":
      renderAppOutput("Timeline: latest events:\n" + OSState.log.slice(-5).join(" | "));
      break;
    case "settings":
      renderAppOutput("Settings: mode=" + OSState.mode + " | link=" + OSState.link);
      break;
    default:
      renderAppOutput("Unknown app: " + appId);
  }
  pushLog(`APP: Loaded ${appId}`);
}

// =========================
// RENDERING (PANELS)
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
  logPanel.scrollTop = logPanel.scrollHeight;
}

function renderVisorPanel() {
  const linkEl = document.getElementById("visor-link");
  const modeEl = document.getElementById("visor-mode");
  const signalEl = document.getElementById("visor-signal");
  const missionEl = document.getElementById("visor-mission");
  if (linkEl) linkEl.textContent = `• LINK: ${OSState.link}`;
  if (modeEl) modeEl.textContent = `• MODE: ${OSState.mode}`;
  if (signalEl) signalEl.textContent = `• SIGNAL: ${OSState.signal}`;
  if (missionEl) missionEl.textContent = `• MISSION: ${OSState.mission}`;
}

function renderTodayPanel() {
  const coreEl = document.getElementById("today-core");
  const enginesEl = document.getElementById("today-engines");
  const focusEl = document.getElementById("today-focus");

  if (coreEl) coreEl.textContent = "/// CORE KERNEL ACTIVE";
  if (enginesEl) enginesEl.textContent = "/// ENGINES ONLINE";
  if (focusEl) focusEl.textContent = `/// FOCUS: ${OSState.mission}`;
}

// =========================
// COMMAND ENGINE
// =========================

function handleCommand(raw) {
  const input = raw.trim();
  if (!input) return;

  pushLog(`CMD> ${input}`);

  const lower = input.toLowerCase();

  if (lower === "help") {
    notify("CMD", "Commands: help, visor, apps, notify <msg>, mission arm, mission status");
    return;
  }

  if (lower === "visor") {
    toggleVisorOverlay(true);
    notify("VISOR", "VISOR 2.0 overlay opened.");
    return;
  }

  if (lower === "apps") {
    document.getElementById("app-grid-output") &&
      renderAppOutput("Apps ready. Tap a tile to load a module.");
    notify("APPS", "App grid primed.");
    return;
  }

  if (lower.startsWith("notify ")) {
    const msg = input.slice(7).trim();
    if (msg) notify("CMD", msg);
    return;
  }

  if (lower === "mission arm") {
    OSState.mission = "ARMED";
    pushLog("MISSION: MANUAL ARM VIA COMMAND");
    notify("MISSION", "Manually armed via command.");
    return;
  }

  if (lower === "mission status") {
    notify("MISSION", `Current mission state: ${OSState.mission}`);
    return;
  }

  notify("CMD", "Unknown command. Type 'help' for options.");
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
  renderVisorPanel();
  renderTodayPanel();
  renderLogPanel();
  renderVisorOverlay();
}

// =========================
// BOOT SEQUENCE
// =========================

function bootSequence() {
  pushLog("/// BOOTSTRAP: CORE ONLINE");
  pushLog("/// VISOR: LINKED");
  pushLog("/// REDX V5 PROFILE: LOADED");
  pushLog("/// ENGINES: STANDING BY");

  renderVisorPanel();
  renderTodayPanel();
  renderLogPanel();

  setInterval(tick, 1500);

  setTimeout(() => {
    const splash = document.getElementById("os-splash");
    if (splash) splash.remove();
  }, 1600);
}

// =========================
// WIRING
// =========================

window.addEventListener("load", () => {
  bootSequence();

  const visorToggle = document.getElementById("visor-toggle-btn");
  const visorClose = document.getElementById("visor-close-btn");
  const appsToggle = document.getElementById("apps-toggle-btn");
  const cmdInput = document.getElementById("command-input");
  const appTiles = document.querySelectorAll(".app-tile");

  visorToggle &&
    visorToggle.addEventListener("click", () => {
      toggleVisorOverlay();
      notify("VISOR", "VISOR 2.0 toggled.");
    });

  visorClose &&
    visorClose.addEventListener("click", () => {
      toggleVisorOverlay(false);
    });

  appsToggle &&
    appsToggle.addEventListener("click", () => {
      renderAppOutput("Apps ready. Tap a tile to load a module.");
      notify("APPS", "App grid primed.");
    });

  cmdInput &&
    cmdInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        handleCommand(cmdInput.value);
        cmdInput.value = "";
      }
    });

  appTiles.forEach(tile => {
    tile.addEventListener("click", () => {
      const appId = tile.getAttribute("data-app");
      if (appId) loadApp(appId);
    });
  });
});
