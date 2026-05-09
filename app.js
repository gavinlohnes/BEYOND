console.log("BEYOND Tactical HUD Loaded — Wave 7 Active");

/* ============================
   OS STATE
============================ */
const OS = {
  phase: 7,
  status: "Running",
  ticks: 0,
  lastUpdate: null
};

/* ============================
   SUIT STATE (WAVE 6)
============================ */
const Suit = {
  mode: "standard",
  alerts: [],
  parallax: { x: 0, y: 0 },
  geometryPulse: 0,
  geometryPulseDir: 1,
  shake: 0
};

/* ============================
   SYSTEMS MODEL (WAVE 5)
============================ */
const Systems = {
  fatigue: { name: "FATIGUE", value: 20, trend: "stable", status: "ok" },
  hydration: { name: "HYDRATION", value: 75, trend: "stable", status: "ok" },
  load: { name: "LOAD", value: 30, trend: "stable", status: "ok" },
  readiness: { name: "READINESS", value: 80, trend: "stable", status: "ok" },
  stability: { name: "STABILITY", value: 80, trend: "stable", status: "ok" }
};

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
    duration: 30,
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

function startProtocol() {
  if (activeProtocol) return;

  activeProtocol = Protocols[0];
  activeProtocol.active = true;
  activeProtocol.progress = 0;

  updateProtocolHUD();
  pushSuitAlert("PROTOCOL STARTED");
}

function updateProtocol() {
  if (!activeProtocol) return;

  activeProtocol.progress += 1;

  if (activeProtocol.progress >= activeProtocol.duration) {
    completeProtocol();
  }

  updateProtocolHUD();
}

function completeProtocol() {
  if (!activeProtocol) return;

  activeProtocol.active = false;
  activeProtocol = null;

  document.getElementById("protocol-name").textContent = "None";
  document.getElementById("protocol-progress").textContent = "Progress: 0%";

  pushSuitAlert("PROTOCOL COMPLETE");
}

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
function updateRawSystems() {
  Systems.fatigue.value = clamp(Systems.fatigue.value + 0.3, 0, 100);
  Systems.hydration.value = clamp(Systems.hydration.value - 0.2, 0, 100);

  const loadBase = 30 + 10 * Math.sin(OS.ticks / 20);
  Systems.load.value = clamp(loadBase, 0, 100);
}

function computeReadiness() {
  const f = Systems.fatigue.value;
  const h = Systems.hydration.value;
  const l = Systems.load.value;

  let readiness = 100;
  readiness -= f * 0.5;
  readiness -= l * 0.3;
  if (h > 50) {
    readiness += (h - 50) * 0.4;
  }

  Systems.readiness.value = clamp(readiness, 0, 100);
}

function computeStability() {
  const df = Math.abs(Systems.fatigue.value - lastSystemValues.fatigue);
  const dh = Math.abs(Systems.hydration.value - lastSystemValues.hydration);
  const dl = Math.abs(Systems.load.value - lastSystemValues.load);

  const volatility = df + dh + dl;

  let stability = Systems.stability.value;

  if (volatility < 0.5) {
    stability += 0.5;
  } else if (volatility < 2) {
    stability += 0.1;
  } else {
    stability -= 0.7;
  }

  Systems.stability.value = clamp(stability, 0, 100);
}

function updateSystemStatusAndTrends() {
  for (const key of Object.keys(Systems)) {
    const sys = Systems[key];
    const last = lastSystemValues[key];

    if (sys.value > last + 0.3) {
      sys.trend = "up";
    } else if (sys.value < last - 0.3) {
      sys.trend = "down";
    } else {
      sys.trend = "stable";
    }

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

    lastSystemValues[key] = sys.value;
  }

  if (Systems.hydration.status === "critical") {
    pushSuitAlert("LOW HYDRATION");
  }
  if (Systems.fatigue.status === "critical") {
    pushSuitAlert("HIGH FATIGUE");
  }
  if (Systems.stability.status === "critical") {
    pushSuitAlert("STABILITY DROP");
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

/* ============================
   MISSION GRAPH ENGINE (WAVE 7)
============================ */
const Missions = [
  {
    id: "anchor_meal_prep",
    name: "Anchor Meal Prep",
    intensity: "medium",
    duration: 45,
    tags: ["nutrition", "prep"],
    requirements: {
      minReadiness: 50,
      maxFatigue: 70
    }
  },
  {
    id: "light_recovery",
    name: "Light Recovery Block",
    intensity: "low",
    duration: 20,
    tags: ["recovery"],
    requirements: {
      minReadiness: 20,
      maxFatigue: 90
    }
  },
  {
    id: "admin_sweep",
    name: "Admin Sweep",
    intensity: "low",
    duration: 25,
    tags: ["admin"],
    requirements: {
      minReadiness: 30,
      maxFatigue: 80
    }
  },
  {
    id: "training_block",
    name: "Training Block",
    intensity: "high",
    duration: 40,
    tags: ["training"],
    requirements: {
      minReadiness: 70,
      maxFatigue: 60
    }
  }
];

let activeMission = null;

function getAvailableMissions() {
  const r = Systems.readiness.value;
  const f = Systems.fatigue.value;

  return Missions.filter(m => {
    return r >= m.requirements.minReadiness &&
           f <= m.requirements.maxFatigue;
  });
}

function renderMissionBar() {
  const suggestionsContainer = document.getElementById("mission-suggestions");
  const currentTitle = document.getElementById("mission-current-title");
  const currentMeta = document.getElementById("mission-current-meta");

  suggestionsContainer.innerHTML = "";

  if (activeMission) {
    currentTitle.textContent = activeMission.name.toUpperCase();
    currentMeta.textContent =
      `Duration: ${activeMission.duration} min | Intensity: ${activeMission.intensity.toUpperCase()}`;
  } else {
    currentTitle.textContent = "NO MISSION ACTIVE";
    currentMeta.textContent = "Select a mission from suggestions.";
  }

  const available = getAvailableMissions().slice(0, 3);

  available.forEach(m => {
    const btn = document.createElement("div");
    btn.className = "mission-suggestion";

    const nameSpan = document.createElement("span");
    nameSpan.className = "mission-name";
    nameSpan.textContent = m.name;

    const metaSpan = document.createElement("span");
    metaSpan.className = "mission-meta";
    metaSpan.textContent =
      `${m.duration} min | ${m.intensity.toUpperCase()}`;

    btn.appendChild(nameSpan);
    btn.appendChild(metaSpan);

    btn.addEventListener("click", () => {
      startMission(m);
    });

    suggestionsContainer.appendChild(btn);
  });

  if (available.length === 0) {
    const none = document.createElement("div");
    none.className = "mission-suggestion";
    none.textContent = "NO SUITABLE MISSIONS";
    suggestionsContainer.appendChild(none);
  }
}

function startMission(mission) {
  activeMission = {
    ...mission,
    startedAtTick: OS.ticks
  };
  pushSuitAlert("MISSION STARTED");
  renderMissionBar();
}

function updateMissionProgress() {
  if (!activeMission) return;

  const elapsedTicks = OS.ticks - activeMission.startedAtTick;
  const elapsedMinutes = elapsedTicks; // 1 tick = 1 "minute" in sim

  if (elapsedMinutes >= activeMission.duration) {
    pushSuitAlert("MISSION COMPLETE");
    activeMission = null;
    renderMissionBar();
  }
}

/* ============================
   SUIT VISOR LOGIC (WAVE 6)
============================ */
function updateSuitModeLabel() {
  const label = document.getElementById("suit-mode-label");
  let text = "MODE: STANDARD";

  if (Suit.mode === "combat") text = "MODE: COMBAT";
  else if (Suit.mode === "stealth") text = "MODE: STEALTH";
  else if (Suit.mode === "diagnostic") text = "MODE: DIAGNOSTIC";

  label.textContent = text;
}

function pushSuitAlert(message) {
  if (Suit.alerts.length && Suit.alerts[Suit.alerts.length - 1] === message) {
    return;
  }
  Suit.alerts.push(message);
  renderSuitAlerts();
}

function renderSuitAlerts() {
  const container = document.getElementById("suit-alerts");
  container.innerHTML = "";

  const recent = Suit.alerts.slice(-3);

  recent.forEach((msg, idx) => {
    const alertEl = document.createElement("div");
    alertEl.className = "suit-alert";
    alertEl.textContent = msg;

    container.appendChild(alertEl);

    requestAnimationFrame(() => {
      alertEl.classList.add("show");
    });

    setTimeout(() => {
      alertEl.classList.remove("show");
    }, 1500 + idx * 100);
  });
}

function updateSuitParallax() {
  const parallaxLayer = document.getElementById("suit-geometry-parallax");
  const shakeX = Suit.mode === "combat" ? Suit.shake : 0;
  const shakeY = Suit.mode === "combat" ? -Suit.shake : 0;

  parallaxLayer.style.transform =
    `translate(${Suit.parallax.x + shakeX}px, ${Suit.parallax.y + shakeY}px)`;
}

document.addEventListener("mousemove", (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  Suit.parallax.x = clamp(dx * 3, -3, 3);
  Suit.parallax.y = clamp(dy * 3, -3, 3);
});

function updateSuitShake() {
  if (Suit.mode !== "combat") {
    Suit.shake = 0;
    return;
  }
  Suit.shake = OS.ticks % 4 === 0 ? 1 : 0;
}

/* ============================
   HEARTBEAT LOOP
============================ */
function heartbeat() {
  OS.ticks++;
  OS.lastUpdate = new Date().toLocaleTimeString();

  updateOSStatus();
  updateProtocol();

  updateRawSystems();
  computeReadiness();
  computeStability();
  updateSystemStatusAndTrends();
  renderSystems();

  updateMissionProgress();
  renderMissionBar();

  updateSuitShake();
  updateSuitParallax();
  updateSuitModeLabel();
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
   UTILS
============================ */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
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
    message: "Wave 7 operational. BEYOND visor + mission engine online."
  };

  output.textContent = JSON.stringify(result, null, 2);
});

document.getElementById("startProtocolBtn").addEventListener("click", () => {
  startProtocol();
});
