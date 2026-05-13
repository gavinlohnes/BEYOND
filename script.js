// BEYOND.OS V150+ — Core Kernel + Recovery + Protocol Engine + Fusion Layer
// Gavin / RED — Batcomputer Build

const BeyondOS = {
  version: "V150+",
  operator: "RED",
  state: {
    booted: false,
    mode: "IDLE",      // IDLE | PATROL | INVESTIGATION | COMBAT | STEALTH | EMERGENCY
    caveMode: "STANDBY" // STANDBY | ACTIVE | COMBAT | LOCKDOWN
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
  dom.recoveryPanelBody = $("recovery-panel-body");      // may be null if panel not in HTML
  dom.protocolsPanelBody = $("protocols-panel-body");    // may be null if panel not in HTML
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
    "Calibrating readiness, protocols, and fusion layer...",
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

// SUIT / OPERATOR DATA

const Operator = {
  name: "RED",
  status: "READY",
  focus: "HIGH",
  fatigue: "LOW",
  mode: "IDLE",
  // readiness inputs (mock for now)
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

// Missions will be overwritten by FusionLayer, but keep defaults
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
  weeklyPlan: null, // will be filled by FusionLayer
};

// Recovery / Readiness state

const Recovery = {
  score: 0,              // 0–100
  lastUpdate: null,      // ISO string
  modeLabel: "STANDARD LOAD",
  message: "Baseline training load.",
};

// === FUSION LAYER INPUT SNAPSHOTS (FROM GPT / GROK / GEMINI) ===

const FusionGPT = {
  missions: [
    {
      id: "M-201",
      title: "Integrate Recovery Score Into Readiness Pipeline",
      status: "ACTIVE",
      priority: 5,
      nextAction: "Bind recoveryScore calculations into the central readiness reducer."
    },
    {
      id: "M-202",
      title: "Deploy Training Suggestion Engine",
      status: "ACTIVE",
      priority: 4,
      nextAction: "Connect recoveryScore thresholds to workout recommendation outputs."
    },
    {
      id: "M-203",
      title: "Update Tactical HUD Recovery Panels",
      status: "IN_PROGRESS",
      priority: 3,
      nextAction: "Render recovery and training suggestion tiles in the HUD layer."
    },
    {
      id: "M-204",
      title: "Stabilize State Persistence",
      status: "PENDING",
      priority: 4,
      nextAction: "Add recoveryScore persistence to local state storage."
    },
    {
      id: "M-205",
      title: "Validate Recovery Decision Logic",
      status: "PENDING",
      priority: 2,
      nextAction: "Run threshold tests against low, medium, and high recovery conditions."
    }
  ]
};

const FusionGrok = {
  missionUpdates: [],
  threatUpdates: [],
  protocolSuggestion: "No state packet received yet.",
  notes: "Awaiting JSON state packet containing operator, suit, missions, threats, recovery, and protocols data for analysis. Provide the full packet to generate tactical adjustments, risk detection, and suggestions."
};

const FusionGemini = {
  weeklyPlan: [
    {
      day: "D1",
      mode: "HIGH OUTPUT",
      actions: [
        "Execute primary Push heavy sets",
        "Calibrate metabolic baseline"
      ]
    },
    {
      day: "D2",
      mode: "STANDARD LOAD",
      actions: [
        "Execute primary Pull sequence",
        "Monitor HRV post-exertion"
      ]
    },
    {
      day: "D3",
      mode: "RECOVERY PRIORITY",
      actions: [
        "Active mobility flow",
        "Force hydration and micronutrient intake"
      ]
    },
    {
      day: "D4",
      mode: "HIGH OUTPUT",
      actions: [
        "Execute Upper Body hypertrophy focus",
        "Assess neuromuscular fatigue levels"
      ]
    },
    {
      day: "D5",
      mode: "REDUCED VOLUME",
      actions: [
        "Technical skill refinement",
        "Strict adherence to fasting window"
      ]
    },
    {
      day: "D6",
      mode: "STANDARD LOAD",
      actions: [
        "Compound movement maintenance",
        "Update recovery score metrics"
      ]
    },
    {
      day: "D7",
      mode: "RECOVERY PRIORITY",
      actions: [
        "Full systemic rest",
        "Finalize weekly vitals report"
      ]
    }
  ]
};

// === RECOVERY LOGIC ===

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

// === ADAPTIVE PROTOCOL ENGINE ===

const ProtocolEngine = {
  active: "STANDARD LOAD",
  reason: "Baseline recovery.",
  effects: [],

  apply(score) {
    this.effects = [];

    if (score >= 85) {
      this.active = "HIGH OUTPUT";
      this.reason = "Recovery optimal.";
      BeyondOS.state.mode = "PATROL";
      BeyondOS.state.caveMode = "ACTIVE";
      this.effects.push("Mode → PATROL");
      this.effects.push("Cave → ACTIVE");
    } else if (score >= 65) {
      this.active = "STANDARD LOAD";
      this.reason = "Recovery solid.";
      BeyondOS.state.mode = "IDLE";
      BeyondOS.state.caveMode = "STANDBY";
      this.effects.push("Mode → IDLE");
      this.effects.push("Cave → STANDBY");
    } else if (score >= 45) {
      this.active = "REDUCED VOLUME";
      this.reason = "Recovery trending downward.";
      BeyondOS.state.mode = "STEALTH";
      BeyondOS.state.caveMode = "ACTIVE";
      this.effects.push("Mode → STEALTH");
      this.effects.push("Cave → ACTIVE");
      this.effects.push("Threats elevated");
    } else {
      this.active = "RECOVERY PRIORITY";
      this.reason = "Recovery critically low.";
      BeyondOS.state.mode = "EMERGENCY";
      BeyondOS.state.caveMode = "LOCKDOWN";
      this.effects.push("Mode → EMERGENCY");
      this.effects.push("Cave → LOCKDOWN");
      this.effects.push("Missions paused");
    }

    renderProtocolsPanel();
    if (dom.hudModeLabel) dom.hudModeLabel.textContent = `MODE: ${BeyondOS.state.mode}`;
    if (dom.systemModeLabel) dom.systemModeLabel.textContent = `CAVE: ${BeyondOS.state.caveMode}`;
    renderOperatorStatus();
  }
};

// === FUSION LAYER CORE ===

const FusionLayer = {
  applied: false,
  summary: {
    missions: 0,
    protocolNote: "",
    weeklyModes: [],
  },

  applyMissionsFromGPT() {
    if (!FusionGPT || !Array.isArray(FusionGPT.missions)) return;
    Missions.length = 0;
    FusionGPT.missions.forEach(m => Missions.push({ ...m }));
    this.summary.missions = Missions.length;
  },

  applyProtocolsFromGrok() {
    if (!FusionGrok) return;
    this.summary.protocolNote = FusionGrok.protocolSuggestion || "";
    // Optional: could feed into ProtocolEngine.reason if desired
    // ProtocolEngine.reason = FusionGrok.protocolSuggestion || ProtocolEngine.reason;
  },

  applyWeeklyPlanFromGemini() {
    if (!FusionGemini || !Array.isArray(FusionGemini.weeklyPlan)) return;
    this.summary.weeklyModes = FusionGemini.weeklyPlan.map(d => d.mode);
    TrainingRoom.weeklyPlan = FusionGemini.weeklyPlan.map(d => ({ ...d }));
  },

  applyAll() {
    this.applyMissionsFromGPT();
    this.applyProtocolsFromGrok();
    this.applyWeeklyPlanFromGemini();
    this.applied = true;

    renderMissionFeed();
    renderMissionFlow();
    renderTrainingRoom();
  }
};

// === RECOVERY STATE UPDATE ===

function updateRecoveryState() {
  const score = computeRecoveryScore();
  const suggestion = getTrainingSuggestionFromRecovery(score);

  Recovery.score = score;
  Recovery.lastUpdate = new Date().toISOString();
  Recovery.modeLabel = suggestion.label;
  Recovery.message = suggestion.message;

  renderRecoveryPanel();
  ProtocolEngine.apply(score);

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

function renderProtocolsPanel() {
  if (!dom.protocolsPanelBody) return;

  dom.protocolsPanelBody.innerHTML = `
    <div class="protocol-block">
      <div class="protocol-label">${ProtocolEngine.active}</div>
      <div class="protocol-reason">${ProtocolEngine.reason}</div>
      <div class="protocol-effects">
        ${ProtocolEngine.effects.map(e => `• ${e}`).join("<br>")}
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
    const pct = m.progress != null ? (m.progress * 100).toFixed(0) : "";
    const progressLine = pct ? `${m.status} — ${pct}%` : `${m.status}`;
    return `
      <div style="margin-bottom:0.25rem;">
        <div>${m.id} — ${m.title}</div>
        <div class="text-dim">${progressLine}</div>
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
  const plan = TrainingRoom.weeklyPlan || [];
  const modesLine = plan.length
    ? plan.map(d => d.mode[0]).join(" / ")
    : "N/A";

  dom.trainingRoomBody.innerHTML = `
    <div>Status: <span class="text-dim">${TrainingRoom.status}</span></div>
    <div>Last Session: <span class="text-dim">${TrainingRoom.lastSession}</span></div>
    <div>Readiness: <span class="text-dim">${TrainingRoom.readiness}</span></div>
    <div class="text-dim" style="margin-top:0.35rem;">Weekly Modes: ${modesLine}</div>
  `;
}

function renderMissionFlow() {
  dom.missionFlowBody.innerHTML = Missions.map((m) => {
    const pct = m.progress != null ? (m.progress * 100).toFixed(0) : "";
    const progressLine = pct ? `${m.status} — ${pct}%` : `${m.status}`;
    return `
      <div style="margin-bottom:0.25rem;">
        <span>${m.id}</span> — <span>${m.title}</span>
        <div class="text-dim">${progressLine}</div>
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
    log("  protocols", { type: "info" });
    log("  fusion [status|apply]", { type: "info" });
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
    if (dom.hudModeLabel) dom.hudModeLabel.textContent = `MODE: ${target}`;
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
    if (dom.systemModeLabel) dom.systemModeLabel.textContent = `CAVE: ${target}`;
    log(`Cave mode set to ${target}.`, { type: "system" });
  },

  ai(args) {
    const sub = (args[0] || "").toLowerCase();
    if (sub === "show") {
      if (dom.aiModulePanel) dom.aiModulePanel.classList.remove("hidden");
      log("Batcomputer AI module panel revealed.", { type: "system" });
    } else if (sub === "hide") {
      if (dom.aiModulePanel) dom.aiModulePanel.classList.add("hidden");
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

  protocols() {
    log(`Active Protocol: ${ProtocolEngine.active}`, { type: "system" });
    log(`Reason: ${ProtocolEngine.reason}`, { type: "info" });
    ProtocolEngine.effects.forEach(e => log(`• ${e}`, { type: "info" }));
  },

  fusion(args) {
    const sub = (args[0] || "").toLowerCase();

    if (!sub || sub === "status") {
      log("Fusion Layer: status", { type: "system" });
      log(`Applied: ${FusionLayer.applied ? "YES" : "NO"}`, { type: "info" });
      log(`Missions in system: ${Missions.length}`, { type: "info" });
      if (FusionLayer.summary.protocolNote) {
        log(`Protocol note: ${FusionLayer.summary.protocolNote}`, { type: "info" });
      }
      if (FusionLayer.summary.weeklyModes.length) {
        log(
          `Weekly modes: ${FusionLayer.summary.weeklyModes.join(", ")}`,
          { type: "info" }
        );
      }
      return;
    }

    if (sub === "apply") {
      FusionLayer.applyAll();
      log("Fusion Layer applied: missions, protocols note, weekly training plan.", { type: "system" });
      return;
    }

    log("Usage: fusion [status|apply]", { type: "error" });
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
    protocols: ProtocolEngine,
    fusion: FusionLayer,
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
      protocols: {
        active: ProtocolEngine.active,
        reason: ProtocolEngine.reason,
        effects: [...ProtocolEngine.effects],
      },
      fusionSummary: { ...FusionLayer.summary, applied: FusionLayer.applied },
    };
  },

  absorbUpdate(update) {
    log("AI module ready to absorb external update payload.", { type: "system" });
    if (!update) return;
    // Future: merge updated missions/threats/recovery/etc.
  },
};

// INIT

function initializeSystems() {
  // Core state
  const score = updateRecoveryState(); // compute initial score + protocols
  log(`Initial Recovery Score: ${score}/100`, { type: "system" });

  // Apply Fusion Layer once on boot
  FusionLayer.applyAll();

  renderVitals();
  renderRecoveryPanel();
  renderProtocolsPanel();
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
