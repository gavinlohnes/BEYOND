const osState = {
  metrics: {
    protein: { current: 0, target: 160 },
    calories: { current: 0, target: 2200 },
    sleep: { current: 0, target: 7.5 },
    hydration: { current: 0, target: 3 },
    steps: { current: 0, target: 8000 }
  },
  mission: {
    state: "BASELINE",
    pressureSynth: 0
  },
  load: 0,
  recoverySynth: 0,
  behaviorSynth: 50,
  threatSynth: 0,
  integritySynth: 100,
  chronoSynth: 50,
  crashSynth: 0,
  overloadSynth: false,
  autonomy: false,
  consciousnessState: "AWARE",
  directiveSynth: "MAINTAIN COURSE.",
  directiveFinal: "MAINTAIN COURSE."
};

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function readInputs() {
  osState.metrics.protein.current = Number(document.getElementById("input-protein").value) || 0;
  osState.metrics.calories.current = Number(document.getElementById("input-calories").value) || 0;
  osState.metrics.sleep.current = Number(document.getElementById("input-sleep").value) || 0;
  osState.metrics.hydration.current = Number(document.getElementById("input-hydration").value) || 0;
  osState.metrics.steps.current = Number(document.getElementById("input-steps").value) || 0;

  osState.mission.state = document.getElementById("mission-select").value;
}

// =========================
// ENGINE GROUPS
// =========================

function computeLoadSynthesis() {}
function computeRecoverySynthesis() {}
function computeBehaviorSynthesis() {}
function computeThreatSynthesis() {}
function computeIntegritySynthesis() {}
function computeCrashSynthesis() {}
function computeChronoSynthesis() {}

function computeDirectiveSynthesis() {}
function applyToneToDirective() {}

function computeConsciousnessTier1() {}
function computeConsciousnessTier2() {}
function computeConsciousnessTier3() {}
function computeConsciousnessTier4() {}
function computeConsciousnessTier5() {}

// =========================
// REDX SYNC
// =========================

async function syncRedx() {
  console.log("REDX sync triggered (placeholder).");
}

// =========================
// HUD
// =========================

function updatePriorityHUD() {
  document.getElementById("visor-priority").textContent = `PRIORITY: TBD`;
}

function updateDirectiveHUD() {
  document.getElementById("visor-directive").textContent = osState.directiveFinal;
}

function updateSuitStateHUD() {
  document.getElementById("visor-suit-state").textContent = `${osState.consciousnessState}`;
}

function updateTimelineSynthesis() {
  document.getElementById("visor-timeline-fill").style.width =
    `${clamp(osState.chronoSynth, 0, 100)}%`;
}

function updateVisorSynthesis() {
  document.getElementById("visor-overlay").style.filter =
    `brightness(${1 + osState.load / 300}) saturate(${1 + osState.threatSynth / 200})`;
}

function updateGlyphsSynthesis() {
  document.getElementById("visor-glyphs").style.opacity =
    osState.threatSynth > 60 ? 0.4 : 0.1;
}

function updateDebug() {
  document.getElementById("debug-output").textContent =
    JSON.stringify(osState, null, 2);
}

function renderAll() {
  updatePriorityHUD();
  updateDirectiveHUD();
  updateSuitStateHUD();
  updateTimelineSynthesis();
  updateVisorSynthesis();
  updateGlyphsSynthesis();
  updateDebug();
}

// =========================
// MAIN LOOP
// =========================

function tick() {
  readInputs();

  computeLoadSynthesis();
  computeRecoverySynthesis();
  computeBehaviorSynthesis();
  computeThreatSynthesis();
  computeIntegritySynthesis();
  computeCrashSynthesis();
  computeChronoSynthesis();

  computeDirectiveSynthesis();
  applyToneToDirective();

  computeConsciousnessTier1();
  computeConsciousnessTier2();
  computeConsciousnessTier3();
  computeConsciousnessTier4();
  computeConsciousnessTier5();

  renderAll();
}

setInterval(tick, 5000);

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-sync").addEventListener("click", syncRedx);
  document.getElementById("btn-force-tick").addEventListener("click", tick);

  const toggle = document.getElementById("toggle-animations");
  const body = document.body;

  toggle.addEventListener("change", () => {
    if (toggle.checked) body.classList.add("animations-on");
    else body.classList.remove("animations-on");
  });

  body.classList.add("animations-on");
});
