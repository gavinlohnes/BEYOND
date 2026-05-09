console.log("BBOS Tactical HUD Loaded — Wave 5 Active");

/* ============================
   OS STATE
============================ */
const OS = {
  phase: 5,
  status: "Running",
  ticks: 0,
  lastUpdate: null
};

/* ============================
   SYSTEMS MODEL (WAVE 5)
============================ */
const Systems = {
  fatigue: {
    name: "FATIGUE",
    value: 20,
    trend: "stable",
    status: "ok"
  },
  hydration: {
    name: "HYDRATION",
    value: 75,
    trend: "stable",
    status: "ok"
  },
  load: {
    name: "LOAD",
    value: 30,
    trend: "stable",
    status: "ok"
  },
  readiness: {
    name: "READINESS",
    value: 80,
    trend: "stable",
    status: "ok"
  },
  stability: {
    name: "STABILITY",
    value: 80,
    trend: "stable",
    status: "ok"
  }
};

/* Keep last values for trend calculation */
const lastSystemValues = {
  fatigue: Systems.fatigue.value,
  hydration: Systems.hydration.value,
  load: Systems.load.value,
  readiness: Systems.readiness.value,
  stability: Systems.stability.value
};

/* ============================
   PROTOCOL ENGINE (WAVE 4)
============================ */
const Protocols = [
  {
    name: "Baseline Stabilization",
    duration: 30, // seconds
    progress: 0,
    active: false
  },
  {
    name: "Cognitive Prep",
    duration: 45,
    progress: 0,
    active: false
  }
];

let activeProtocol = null;

/* Start a protocol */
function startProtocol() {
  if (activeProtocol) return;

  activeProtocol = Protocols[0]; // default protocol
  activeProtocol.active = true;
  activeProtocol.progress = 0;

  updateProtocolHUD();
}

/* Update protocol progress */
function updateProtocol() {
  if (!activeProtocol) return;

  activeProtocol.progress += 1;

  if (activeProtocol.progress >= activeProtocol.duration) {
    completeProtocol();
  }

  updateProtocolHUD();
}

/* Complete protocol */
function completeProtocol() {
  if (!activeProtocol) return;

  activeProtocol.active = false;
  activeProtocol = null;

  document.getElementById("protocol-name").textContent = "None";
  document.getElementById("protocol-progress").textContent = "Progress: 0%";
}

/* Update HUD for protocol */
function updateProtocolHUD() {
  if (!activeProtocol) return;

  const pct = Math.floor(
    (activeProtocol.progress / activeProtocol.duration) * 100
  );

  document.getElementById("protocol-name").textContent =
    activeProtocol.name;

  document.getElementById("protocol-progress").textContent =
    `Progress: ${pct}%`;
}

/* ============================
   SYSTEMS LOGIC (WAVE 5)
============================ */

/* Demo update: simple deterministic drift to show movement */
function updateRawSystems() {
  // Fatigue: slowly rises with time, capped
  Systems.fatigue.value = clamp(Systems.fatigue.value + 0.3, 0, 100);

  // Hydration: slowly falls with time
  Systems.hydration.value = clamp(Systems.hydration.value - 0.2, 0, 100);

  // Load: small oscillation based on ticks
  const loadBase = 30 + 10 * Math.sin(OS.ticks / 20);
  Systems.load.value = clamp(loadBase, 0, 100);
}

/* Derived: readiness from fatigue, hydration, load */
function computeReadiness() {
  const f = Systems.fatigue.value;
  const h = Systems.hydration.value;
  const l = Systems.load.value;

  let readiness = 100;
  readiness -= f * 0.5;          // fatigue hurts readiness
  readiness -= l * 0.3;          // load hurts readiness
  if (h > 50) {
    readiness += (h - 50) * 0.4; // extra hydration helps
  }

  Systems.readiness.value = clamp(readiness, 0, 100);
}

/* Derived: stability from volatility of core systems */
function computeStability() {
  const df = Math.abs(Systems.fatigue.value - lastSystemValues.fatigue);
  const dh = Math.abs(Systems.hydration.value - lastSystemValues.hydration);
  const dl = Math.abs(Systems.load.value - lastSystemValues.load);

  const volatility = df + dh + dl; // simple measure

  let stability = Systems.stability.value;

  if (volatility < 0.5) {
    stability += 0.5; // very stable
  } else if (volatility < 2) {
    stability += 0.1; // mildly stable
  } else {
    stability -= 0.7; // unstable
  }

  Systems.stability.value = clamp(stability, 0, 100);
}

/* Status + trend classification */
function updateSystemStatusAndTrends() {
  for (const key of Object.keys(Systems)) {
    const sys = Systems[key];
    const last = lastSystemValues[key];

    // Trend
    if (sys.value > last + 0.3) {
      sys.trend = "up";
    } else if (sys.value < last - 0.3) {
      sys.trend = "down";
    } else {
      sys.trend = "stable";
    }

    // Status thresholds
    if (key === "fatigue") {
      if (sys.value < 40) sys.status = "ok";
      else if (sys.value < 70) sys.status = "warning";
      else sys.status = "critical";
    } else if (key === "hydration") {
      if (sys.value >= 60) sys.status = "ok";
      else if (sys.value >= 40) sys.status = "warning";
      else sys.status = "critical";
    } else if (key === "load") {
      if (sys.value <= 60) sys.status = "ok";
      else if (sys.value <= 80) sys.status = "warning";
      else sys.status = "critical";
    } else if (key === "readiness" || key === "stability") {
      if (sys.value >= 60) sys.status = "ok";
      else if (sys.value >= 40) sys.status = "warning";
      else sys.status = "critical";
    }

    // Save last value
    lastSystemValues[key] = sys.value;
  }
}

/* ============================
   SYSTEMS RENDERING
============================ */
function renderSystems() {
  const container = document.getElementById("systems-container");
  container.innerHTML = "";

  for (const key of Object.keys(Systems)) {
    const sys = Systems[key];

    const card = document.createElement("div");
    card.className = "system-card";

    const header = document.createElement("div");
    header.className = "system-header";

    const nameEl = document.createElement("div");
    nameEl.className = "system-name";
    nameEl.textContent = sys.name;

    const valueEl = document.createElement("div");
    valueEl.className = "system-value";
    valueEl.textContent = `${sys.value.toFixed(0)}%`;

    header.appendChild(nameEl);
    header.appendChild(valueEl);

    const barOuter = document.createElement("div");
    barOuter.className = "system-bar-outer";

    const barInner = document.createElement("div");
    barInner.className = "system-bar-inner";

    barInner.style.width = `${sys.value.toFixed(0)}%`;

    if (sys.status === "ok") {
      barInner.style.background = "#4dff4d";
    } else if (sys.status === "warning") {
      barInner.style.background = "#ffcc33";
    } else {
      barInner.style.background = "#ff4d4d";
    }

    barOuter.appendChild(barInner);

    const footer = document.createElement("div");
    footer.className = "system-footer";

    const statusEl = document.createElement("div");
    if (sys.status === "ok") {
      statusEl.className = "system-status-ok";
      statusEl.textContent = "OK";
    } else if (sys.status === "warning") {
      statusEl.className = "system-status-warning";
      statusEl.textContent = "WARNING";
    } else {
      statusEl.className = "system-status-critical";
      statusEl.textContent = "CRITICAL";
    }

    const trendEl = document.createElement("div");
    trendEl.className = "system-trend";
    if (sys.trend === "up") trendEl.textContent = "↑";
    else if (sys.trend === "down") trendEl.textContent = "↓";
    else trendEl.textContent = "→";

    footer.appendChild(statusEl);
    footer.appendChild(trendEl);

    card.appendChild(header);
    card.appendChild(barOuter);
    card.appendChild(footer);

    container.appendChild(card);
  }
}

/* Utility */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* ============================
   HEARTBEAT LOOP
============================ */
function heartbeat() {
  OS.ticks++;
  OS.lastUpdate = new Date().toLocaleTimeString();

  updateOSStatus();
  updateProtocol();

  // Wave 5 systems pipeline
  updateRawSystems();
  computeReadiness();
  computeStability();
  updateSystemStatusAndTrends();
  renderSystems();
}

setInterval(heartbeat, 1000);

/* ============================
   UPDATE HUD STATUS
============================ */
function updateOSStatus() {
  const statusEl = document.getElementById("os-status");

  statusEl.textContent =
    `OS Status: Running | Phase: ${OS.phase} | Ticks: ${OS.ticks} | Last Update: ${OS.lastUpdate}`;
}

/* ============================
   BUTTONS
============================ */
document.getElementById("testBtn").addEventListener("click", () => {
  const output = document.getElementById("output");

  const result = {
    status: "System Check Complete",
    phase: OS.phase,
    ticks: OS.ticks,
    timestamp: new Date().toLocaleTimeString(),
    message: "Wave 5 operational. Systems dashboard online."
  };

  output.textContent = JSON.stringify(result, null, 2);
});

document.getElementById("startProtocolBtn").addEventListener("click", () => {
  startProtocol();
});
