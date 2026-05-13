// BEYOND.OS V150+ — Beyond Tower / Recovery Upgrade
// RED — Batcomputer Build

const BeyondOS = {
  version: "V150+",
  operator: "RED",
  state: {
    booted: false,
    mode: "IDLE", // IDLE | PATROL | INVESTIGATION | COMBAT | STEALTH | EMERGENCY
    caveMode: "STANDBY", // STANDBY | ACTIVE | COMBAT | LOCKDOWN
  },
  log: [],
};

// DOM refs
const dom = {};

function $(id) {
  return document.getElementById(id);
}

function cacheDom() {
  dom.bootOverlay = $("boot-overlay");
  dom.bootStatus = $("boot-status");
  dom.hudModeLabel = $("hud-mode-label");
  dom.systemModeLabel = $("system-mode-label");

  dom.vitalsBody = $("vitals-body");
  dom.recoveryPanelBody = $("recovery-panel-body");
  dom.threatGridBody = $("threat-grid-body");
  dom.missionFeedBody = $("mission-feed-body");
  dom.suitAlertsBody = $("suit-alerts-body");

  dom.diagnosticsBody = $("diagnostics-body");
  dom.vehicleBayBody = $("vehicle-bay-body");
  dom.evidenceBoardBody = $("evidence-board-body");
  dom.trainingRoomBody = $("training-room-body");

  dom.missionFlowBody = $("mission-flow-body");
  dom.threatModuleBody = $("threat-module-body");
  dom.operatorStatusBody = $("operator-status-body");

  dom.terminalOutput = $("terminal-output");
  dom.terminalInput = $("terminal-input");
  dom.terminalStatus = $("terminal-status");

  dom.aiModulePanel = $("ai-module-panel");
  dom.aiModuleBody = $("ai-module-body");
}

// Utility logging
function log(line, options = {}) {
  const { type = "info" } = options;
  const entry = { ts: new Date(), type, line };
  BeyondOS.log.push(entry);

  if (!dom.terminalOutput) return;

  const div = document.createElement("div");
  div.className = `terminal-line terminal-${type}`;
  div.textContent = line;
  dom.terminalOutput.appendChild(div);
  dom.terminalOutput.scrollTop = dom.terminalOutput.scrollHeight;
}

// Boot sequence
function startBootSequence() {
  let step = 0;
  const steps = [
    "Initializing BEYOND.OS kernel...",
    "Syncing cave environment...",
    "Bringing dual-monitor Batcomputer online...",
    "Linking Suit Core and AI module...",
    "Loading mission, threat, and operator systems...",
    "Calibrating readiness and recovery engine...",
    "All systems nominal. Awaiting operator.",
  ];

  const interval = setInterval(() => {
    if (step < steps.length) {
      dom.bootStatus.textContent = steps[step];
      step++;
    } else {
      clearInterval(interval);
      completeBoot();
    }
  }, 550);
}

function completeBoot() {
  BeyondOS.state.booted = true;
  dom.bootOverlay.style.opacity = "0";
  setTimeout(() => {
    dom.bootOverlay.style.display = "none";
  }, 600);

  log("BEYOND.OS V150+ online.", { type: "system" });
  log("Operator: RED. Cave: synchronized.", { type: "system" });

  initializeSystems();
}

// SUIT / OPERATOR MOCK DATA

const Operator = {
  name: "RED",
  status: "READY",
  focus: "HIGH",
  fatigue: "LOW",
  mode: "IDLE",
  // readiness inputs (simple mock values for now)
  sleepHours: 7.0,   // 0–10
  stress: 35,        // 0–100 (higher = worse)
  fatigueScore: 30,  // 0–100 (higher = worse)
};

const Suit = {
  integrity: 0.97,
  stealthMesh: 0.92,
  flightSystems: 0.95,
  neuralLink: 0.98,
  autoRepair: "STANDBY",
};

const Threats = [
  { id: "T-001", label: "Shift Schedule / Duty Window", level: "MODERATE" },
  { id: "T-002", label: "Sleep / Recovery Debt", level: "HIGH" },
  { id: "T-003", label: "Training Consistency", level: "MODERATE" },
  { id: "T-004", label: "Long-Term Weight Target (160)", level: "LOW" },
];

const Missions = [
  {
    id: "M-101",
    title: "Anchor Meal System — Weekly",
    status: "ACTIVE",
    progress: 0.7,
  },
  {
    id: "M-102",
    title: "BEYOND.OS — Integration Layer",
    status: "ACTIVE",
    progress: 0.85,
  },
  {
    id: "M-103",
    title: "Sleep / Recovery Stabilization",
    status: "PLANNED",
    progress: 0.2,
  },
];

const Diagnostics = {
  cavePower: "STABLE",
  network: "ELGA — SECURE",
  latency: "LOW",
  errorCount: 0,
};

const VehicleBay = {
  batmobile: "STANDBY",
  flightRig: "READY",
  stealthCycle: "OFFLINE",
};

const TrainingRoom = {
  status: "IDLE",
  lastSession: "Stealth / Focus Drill",
  readiness: "READY",
};

// Recovery / Readiness state

const Recovery = {
  score: 0,              // 0–100
  lastUpdate: null,      // ISO string
  modeLabel: "STANDARD LOAD",
  message: "Baseline training load.",
};

// RECOVERY LOGIC

function computeRecoveryScore() {
  const sleepHours = Operator.sleepHours || 0;
  const stress = Operator.stress || 0;
  const fatigue = Operator.fatigueScore || 0;

  const sleepNorm = Math.min(100, (sleepHours / 9) * 100);
  const stressNorm = Math.max(0, 100 - stress);
  const fatigueNorm = Math.max(0, 100 - fatigue);

  const score = (sleepNorm * 0.4) + (stressNorm * 0.3) + (fatigueNorm * 0.3);
  return Math.round(Math.max(0, Math.min(100, score)));
}

function getTrainingSuggestionFromRecovery(score) {
  const s = typeof score === "number" ? score : Recovery.score;

  if (s >= 85) {
    return {
      label: "HIGH OUTPUT",
      message: "Excellent recovery — time to push.",
    };
  }
  if (s >= 65) {
    return {
      label: "STANDARD LOAD",
      message: "Solid recovery — good training day.",
    };
  }
  if (s >= 45) {
    return {
      label: "REDUCED VOLUME",
      message: "Dial it back and keep it controlled.",
    };
  }
  return {
    label: "RECOVERY PRIORITY",
    message: "Prioritize rest and low-intensity work.",
  };
}

function updateRecoveryState() {
  const score = computeRecoveryScore();
  const suggestion = getTrainingSuggestionFromRecovery(score);

  Recovery.score = score;
  Recovery.lastUpdate = new Date().toISOString();
  Recovery.modeLabel = suggestion.label;
  Recovery.message = suggestion.message;

  renderRecoveryPanel();

  return score;
}

// RENDER FUNCTIONS

function renderVitals() {
  dom.vitalsBody.innerHTML = `
    <div>Operator: <span class="text-dim">${Operator.name}</span></div>
    <div>Status: <span class="text-dim">${Operator.status}</span></div>
    <div>Focus: <span class="text-dim">${Operator.focus}</span></div>
    <div>Fatigue: <span class="text-dim">${Operator.fatigue}</span></div>
    <div class="text-dim" style="margin-top:0.4rem;">Suit Integrity: ${(Suit.integrity * 100).toFixed(0)}%</div>
    <div class="text-dim">Stealth Mesh: ${(Suit.stealthMesh * 100).toFixed(0)}%</div>
    <div class="text-dim">Neural Link: ${(Suit.neuralLink * 100).toFixed(0)}%</div>
  `;
}

function renderRecoveryPanel() {
  if (!dom.recoveryPanelBody) return;

  const score = Recovery.score;
  const label = Recovery.modeLabel;
  const message = Recovery.message;

  dom.recoveryPanelBody.innerHTML = `
    <div class="recovery-score-block">
      <div class="recovery-score-circle">
        <div>${score}</div>
        <span>RECOVERY</span>
      </div>
      <div class="recovery-meta">
        <div class="recovery-meta-label">TRAINING MODE</div>
        <div class="recovery-meta-mode">${label}</div>
        <div class="recovery-meta-message">${message}</div>
      </div>
    </div>
  `;
}

function renderThreatGrid() {
  dom.threatGridBody.innerHTML = Threats.map((t) => {
    const cls = threatClass(t.level);
    return `
      <div>
        <span class="badge ${cls}">${t.level}</span>
        <span style="margin-left:0.4rem;">${t.label}</span>
      </div>
    `;
  }).join("");
}

function threatClass(level) {
  switch (level) {
    case "LOW":
      return "threat-low";
    case "MODERATE":
      return "threat-moderate";
    case "HIGH":
      return "threat-high";
    case "CRITICAL":
      return "threat-critical";
    default:
      return "";
  }
}

function renderMissionFeed() {
  dom.missionFeedBody.innerHTML = Missions.map((m) => {
    const pct = (m.progress * 100).toFixed(0);
    return `
      <div style="margin-bottom:0.25rem;">
        <div>${m.id} — ${m.title}</div>
        <div class="text-dim">${m.status} — ${pct}%</div>
      </div>
    `;
  }).join("");
}

function renderSuitAlerts() {
  const alerts = [];

  if (Suit.stealthMesh < 0.9) {
    alerts.push("Stealth mesh integrity below optimal threshold.");
  }
  if (Suit.autoRepair !== "ACTIVE" && Suit.integrity < 0.95) {
    alerts.push("Auto-repair recommended. Suit integrity trending downward.");
  }

  if (!alerts.length) {
    dom.suitAlertsBody.innerHTML = `<span class="text-dim">No active alerts. Suit Core nominal.</span>`;
    return;
  }

  dom.suitAlertsBody.innerHTML = alerts
    .map((a) => `<div>• ${a}</div>`)
    .join("");
}

function renderDiagnostics() {
  dom.diagnosticsBody.innerHTML = `
    <div>Cave Power: <span class="text-dim">${Diagnostics.cavePower}</span></div>
    <div>Network: <span class="text-dim">${Diagnostics.network}</span></div>
    <div>Latency: <span class="text-dim">${Diagnostics.latency}</span></div>
    <div>Errors: <span class="text-dim">${Diagnostics.errorCount}</span></div>
  `;
}

function renderVehicleBay() {
  dom.vehicleBayBody.innerHTML = `
    <div>Batmobile: <span class="text-dim">${VehicleBay.batmobile}</span></div>
    <div>Flight Rig: <span class="text-dim">${VehicleBay.flightRig}</span></div>
    <div>Stealth Cycle: <span class="text-dim">${VehicleBay.stealthCycle}</span></div>
  `;
}

function renderEvidenceBoard() {
  dom.evidenceBoardBody.innerHTML = `
    <div class="text-dim">Evidence board online.</div>
    <div class="text-dim">Awaiting mission-specific data.</div>
  `;
}

function renderTrainingRoom() {
  dom.trainingRoomBody.innerHTML = `
    <div>Status: <span class="text-dim">${TrainingRoom.status}</span></div>
    <div>Last Session: <span class="text-dim">${TrainingRoom.lastSession}</span></div>
    <div>Readiness: <span class="text-dim">${TrainingRoom.readiness}</span></div>
  `;
}

function renderMissionFlow() {
  dom.missionFlowBody.innerHTML = Missions.map((m) => {
    const pct = (m.progress * 100).toFixed(0);
    return `
      <div style="margin-bottom:0.25rem;">
        <span>${m.id}</span> — <span>${m.title}</span>
        <div class="text-dim">${m.status} — ${pct}%</div>
      </div>
    `;
  }).join("");
}

function renderThreatModule() {
  dom.threatModuleBody.innerHTML = Threats.map((t) => {
    const cls = threatClass(t.level);
    return `
      <div style="margin-bottom:0.25rem;">
        <span class="badge ${cls}">${t.level}</span>
        <span style="margin-left:0.4rem;">${t.label}</span>
      </div>
    `;
  }).join("");
}

function renderOperatorStatus() {
  dom.operatorStatusBody.innerHTML = `
    <div>Mode: <span class="text-dim">${Operator.mode}</span></div>
    <div>Focus: <span class="text-dim">${Operator.focus}</span></div>
    <div>Fatigue: <span class="text-dim">${Operator.fatigue}</span></div>
    <div>Status: <span class="text-dim">${Operator.status}</span></div>
  `;
}

// TERMINAL

const commands = {
  help() {
    log("Available commands:", { type: "system" });
    log("  mode [idle|patrol|investigation|combat|stealth|emergency]", { type: "info" });
    log("  cave [standby|active|combat|lockdown]", { type: "info" });
    log("  ai [show|hide]", { type: "info" });
    log("  packet", { type: "info" });
    log("  recovery", { type: "info" });
    log("  clear", { type: "info" });
  },

  clear() {
    dom.terminalOutput.innerHTML = "";
  },

  mode(args) {
    const target = (args[0] || "").toUpperCase();
    const valid = ["IDLE", "PATROL", "INVESTIGATION", "COMBAT", "STEALTH", "EMERGENCY"];
    if (!valid.includes(target)) {
      log("Invalid mode. Valid: idle, patrol, investigation, combat, stealth, emergency.", { type: "error" });
      return;
    }
    BeyondOS.state.mode = target;
    Operator.mode = target;
    dom.hudModeLabel.textContent = `MODE: ${target}`;
    renderOperatorStatus();
    log(`Operator mode set to ${target}.`, { type: "system" });
  },

  cave(args) {
    const target = (args[0] || "").toUpperCase();
    const valid = ["STANDBY", "ACTIVE", "COMBAT", "LOCKDOWN"];
    if (!valid.includes(target)) {
      log("Invalid cave mode. Valid: standby, active, combat, lockdown.", { type: "error" });
      return;
    }
    BeyondOS.state.caveMode = target;
    dom.systemModeLabel.textContent = `CAVE: ${target}`;
    log(`Cave mode set to ${target}.`, { type: "system" });
  },

  ai(args) {
    const sub = (args[0] || "").toLowerCase();
    if (sub === "show") {
      dom.aiModulePanel.classList.remove("hidden");
      log("Batcomputer AI module panel revealed.", { type: "system" });
    } else if (sub === "hide") {
      dom.aiModulePanel.classList.add("hidden");
      log("Batcomputer AI module panel hidden.", { type: "system" });
    } else {
      log("Usage: ai [show|hide]", { type: "error" });
    }
  },

  packet() {
    const packet = batAI.generateStatePacket();
    log("State packet generated. Copy from below:", { type: "system" });
    log(JSON.stringify(packet, null, 2), { type: "info" });
  },

  recovery() {
    const score = updateRecoveryState();
    const suggestion = getTrainingSuggestionFromRecovery(score);

    log(`Recovery Score: ${score}/100`, { type: "system" });
    log(`Training Mode: ${suggestion.label}`, { type: "info" });
    log(suggestion.message, { type: "info" });
  },
};

function handleTerminalInput(e) {
  if (e.key === "Enter") {
    const value = dom.terminalInput.value.trim();
    if (!value) return;
    log(`RED> ${value}`, { type: "input" });
    dom.terminalInput.value = "";

    const [cmd, ...args] = value.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) {
      fn(args);
    } else {
      log(`Unknown command: ${cmd}. Type 'help' for options.`, { type: "error" });
    }
  }
}

// BATCOMPUTER AI MODULE (SHELL)

const batAI = {
  core: {
    name: "Batcomputer AI",
    version: "1.0",
    persona: "Analytical, clipped, cave-bound.",
  },
  memory: {
    osVersion: BeyondOS.version,
    operator: BeyondOS.operator,
    modes: ["IDLE", "PATROL", "INVESTIGATION", "COMBAT", "STEALTH", "EMERGENCY"],
    caveModes: ["STANDBY", "ACTIVE", "COMBAT", "LOCKDOWN"],
  },
  modules: {
    missions: Missions,
    threats: Threats,
    diagnostics: Diagnostics,
    suit: Suit,
    operator: Operator,
    recovery: Recovery,
  },

  generateStatePacket() {
    return {
      meta: {
        label: "BEYOND.OS_STATE_PACKET",
        version: BeyondOS.version,
        timestamp: new Date().toISOString(),
      },
      state: {
        mode: BeyondOS.state.mode,
        caveMode: BeyondOS.state.caveMode,
      },
      operator: { ...Operator },
      suit: { ...Suit },
      missions: Missions.map((m) => ({ ...m })),
      threats: Threats.map((t) => ({ ...t })),
      diagnostics: { ...Diagnostics },
      vehicleBay: { ...VehicleBay },
      trainingRoom: { ...TrainingRoom },
      recovery: { ...Recovery },
    };
  },

  absorbUpdate(update) {
    log("AI module ready to absorb external update payload.", { type: "system" });
    if (!update) return;
    // Future: merge updated missions/threats/recovery/etc.
  },
};

// INITIALIZATION

function initializeSystems() {
  updateRecoveryState(); // compute initial score

  renderVitals();
  renderRecoveryPanel();
  renderThreatGrid();
  renderMissionFeed();
  renderSuitAlerts();

  renderDiagnostics();
  renderVehicleBay();
  renderEvidenceBoard();
  renderTrainingRoom();

  renderMissionFlow();
  renderThreatModule();
  renderOperatorStatus();

  dom.terminalInput.addEventListener("keydown", handleTerminalInput);
  dom.terminalInput.focus();
}

window.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  startBootSequence();
});
