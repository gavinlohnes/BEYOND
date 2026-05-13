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
  const fatigue = Operator.fatigueScore ||
