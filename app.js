// BEYOND‑OS core brain — app.js

// 1. Glyph registry (placeholders for Claude's SVGs)
const GlyphSVG = {
  IDLE: ``,
  ACTIVE: ``,
  COMBAT: ``,
  STEALTH: ``,
  DRIFT: ``,
  ADVISOR: ``,
  BOOT_START: ``,
  BOOT_MID: ``,
  BOOT_END: ``,
  VISOR_COMPRESS: ``,
  VISOR_EXPAND: ``,
  VISOR_LOCK: ``,
  HEARTBEAT_REST: ``,
  HEARTBEAT_MID: ``,
  HEARTBEAT_PEAK: ``,
};

// DOM mount
const GLYPH_ROOT_ID = 'glyph-root';

// current state + timers
let currentState = 'IDLE';
let heartbeatTimer = null;
let driftCleanup = null;

// 2. Render helper
function renderGlyph(key) {
  const root = document.getElementById(GLYPH_ROOT_ID);
  if (!root) return;

  const svg = GlyphSVG[key] || '';
  root.innerHTML = svg;
}

// 3. OS states + metadata
const OS_STATES = {
  IDLE:    { key: 'IDLE',    loopHeartbeat: true  },
  ACTIVE:  { key: 'ACTIVE',  loopHeartbeat: true  },
  COMBAT:  { key: 'COMBAT',  loopHeartbeat: false },
  STEALTH: { key: 'STEALTH', loopHeartbeat: false },
  DRIFT:   { key: 'DRIFT',   loopHeartbeat: false },
  ADVISOR: { key: 'ADVISOR', loopHeartbeat: true  },
};

// 4. Allowed transitions
const OS_TRANSITIONS = {
  BOOT:          { from: null,      to: 'IDLE'    },
  IDLE_ACTIVE:   { from: 'IDLE',    to: 'ACTIVE'  },
  ACTIVE_COMBAT: { from: 'ACTIVE',  to: 'COMBAT'  },
  COMBAT_STEALTH:{ from: 'COMBAT',  to: 'STEALTH' },
  STEALTH_DRIFT: { from: 'STEALTH', to: 'DRIFT'   },
  DRIFT_ADVISOR: { from: 'DRIFT',   to: 'ADVISOR' },
  ADVISOR_ACTIVE:{ from: 'ADVISOR', to: 'ACTIVE'  },
};

  // 5. Timing constants
const TIMING = {
  HEARTBEAT: {
    REST: 250,
    MID: 250,
    PEAK: 250,
  },

  BOOT: {
    START: 300,
    MID: 300,
    END: 400,
  },

  VISOR: {
    COMPRESS: 200,
    EXPAND: 200,
    LOCK: 250,
  },

  DRIFT: {
    TEAR_SHIFT: 80,
    PIP_JITTER: 100,
    GLOW_OSC: 700,
    ENTRY: 300,
    EXIT: 350,
  },

  ADVISOR: {
    DEPLOY: 350,
    LINK_FADE: 200,
    RETRACT: 300,
  },

  STATE: {
    IDLE_ACTIVE: 200,
    ACTIVE_COMBAT: 180,
    COMBAT_STEALTH: 220,
    STEALTH_DRIFT: 260,
    DRIFT_ADVISOR: 320,
    ADVISOR_ACTIVE: 200,
  }
};

  // 6. Easing curves
const EASING = {
  LINEAR: t => t,
  EASE_IN: t => t * t,
  EASE_OUT: t => 1 - Math.pow(1 - t, 2),
  EASE_IN_OUT: t =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  SPIKE: t => (t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7),
  PULSE: t => Math.sin(t * Math.PI),
};

  // 7. Animation sequences (high‑level)
const SEQUENCE = {
  DRIFT_IN: [
    { action: 'render', key: 'DRIFT', delay: 0 },
    { action: 'jitter', duration: TIMING.DRIFT.ENTRY },
  ],

  DRIFT_OUT: [
    { action: 'collapseTears', duration: 150 },
    { action: 'snapPip',       duration: 100 },
    { action: 'stabilizeGlow', duration: 100 },
  ],

  ADVISOR_DEPLOY: [
    { action: 'render', key: 'ADVISOR', delay: 0 },
    { action: 'deployNodes', duration: TIMING.ADVISOR.DEPLOY },
    { action: 'fadeLinks',   duration: TIMING.ADVISOR.LINK_FADE },
  ],
};

                  // 8. Generic sequence runner
function runAnimation(sequence) {
  let totalDelay = 0;

  for (const step of sequence) {
    const delay = step.delay || 0;
    const duration = step.duration || 0;

    setTimeout(() => {
      switch (step.action) {
        case 'render':
          renderGlyph(step.key);
          break;
        case 'jitter':
          // handled by drift effects loop
          break;
        case 'collapseTears':
          Effects.collapseTears();
          break;
        case 'snapPip':
          Effects.snapPip?.();
          break;
        case 'stabilizeGlow':
          Effects.stabilizeGlow?.();
          break;
        case 'deployNodes':
          Effects.deployAdvisorNodes();
          break;
        case 'fadeLinks':
          Effects.fadeAdvisorLinks?.();
          break;
      }
    }, totalDelay + delay);

    totalDelay += delay + duration;
  }
}

                  // 9. Effects layer
const Effects = {
  jitterPip(intensity = 2) {
    const el = document.querySelector('#glyph-root svg');
    if (!el) return;
    const x = (Math.random() - 0.5) * intensity;
    const y = (Math.random() - 0.5) * intensity;
    el.style.transform = `translate(${x}px, ${y}px)`;
  },

  resetTransform() {
    const el = document.querySelector('#glyph-root svg');
    if (el) el.style.transform = '';
  },

  glowPulse(strength = 1) {
    const el = document.querySelector('#glyph-root svg');
    if (!el) return;
    el.style.filter = `drop-shadow(0 0 ${strength * 4}px #ff1a1a)`;
  },

  glowReset() {
    const el = document.querySelector('#glyph-root svg');
    if (el) el.style.filter = '';
  },

  collapseTears() {
    const tears = document.querySelectorAll('.tear-slice');
    tears.forEach(t => {
      t.style.transform = 'translateX(0px)';
      t.style.opacity = '0';
    });
  },

  deployAdvisorNodes() {
    const nodes = document.querySelectorAll('.advisor-node');
    nodes.forEach(n => {
      n.style.opacity = '1';
      n.style.transform = 'scale(1)';
    });
  },

  retractAdvisorNodes() {
    const nodes = document.querySelectorAll('.advisor-node');
    nodes.forEach(n => {
      n.style.opacity = '0';
      n.style.transform = 'scale(0.5)';
    });
  }
};

    // 10. Drift behavior
function runDriftEffects() {
  const jitterInterval = setInterval(() => {
    Effects.jitterPip(2);
  }, TIMING.DRIFT.PIP_JITTER);

  const glowInterval = setInterval(() => {
    Effects.glowPulse(1 + Math.random());
  }, TIMING.DRIFT.GLOW_OSC);

  return () => {
    clearInterval(jitterInterval);
    clearInterval(glowInterval);
    Effects.resetTransform();
    Effects.glowReset();
  };
}

// 11. Advisor behavior
function runAdvisorDeploy() {
  Effects.deployAdvisorNodes();
  setTimeout(() => {
    Effects.glowPulse(0.5);
  }, TIMING.ADVISOR.DEPLOY);
}

function runAdvisorRetract() {
  Effects.retractAdvisorNodes();
  Effects.glowReset();
}

// 12. Stealth behavior
function runStealthCompress() {
  const el = document.querySelector('#glyph-root svg');
  if (!el) return;
  el.style.transform = 'scale(0.85)';
  el.style.opacity = '0.7';
}

function runStealthRelease() {
  const el = document.querySelector('#glyph-root svg');
  if (!el) return;
  el.style.transform = 'scale(1)';
  el.style.opacity = '1';
}

// 13. Combat behavior
function runCombatSpike() {
  Effects.glowPulse(2);
  setTimeout(() => Effects.glowReset(), 150);
  }

    // 14. Transition effects dispatcher
function runTransitionEffects(from, to) {
  // DRIFT → ADVISOR
  if (from === 'DRIFT' && to === 'ADVISOR') {
    if (driftCleanup) {
      driftCleanup();
      driftCleanup = null;
    }
    Effects.collapseTears();
    runAdvisorDeploy();
    return;
  }

  // STEALTH → DRIFT
  if (from === 'STEALTH' && to === 'DRIFT') {
    runStealthRelease();
    driftCleanup = runDriftEffects();
    return;
  }

  // ACTIVE → COMBAT
  if (from === 'ACTIVE' && to === 'COMBAT') {
    runCombatSpike();
    return;
  }

  // COMBAT → STEALTH
  if (from === 'COMBAT' && to === 'STEALTH') {
    runStealthCompress();
    return;
  }

  // ADVISOR → ACTIVE
  if (from === 'ADVISOR' && to === 'ACTIVE') {
    runAdvisorRetract();
    return;
  }
    }

  // 15. Heartbeat loop
function startHeartbeat() {
  if (heartbeatTimer) return;
  let phase = 0;
  heartbeatTimer = setInterval(() => {
    if (phase === 0) renderGlyph('HEARTBEAT_REST');
    if (phase === 1) renderGlyph('HEARTBEAT_MID');
    if (phase === 2) renderGlyph('HEARTBEAT_PEAK');
    phase = (phase + 1) % 3;
  }, TIMING.HEARTBEAT.REST);
}

function stopHeartbeat() {
  if (!heartbeatTimer) return;
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

// 16. Apply state core
function applyState(stateKey) {
  currentState = stateKey;
  renderGlyph(stateKey);

  const meta = OS_STATES[stateKey];
  if (meta && meta.loopHeartbeat) {
    startHeartbeat();
  } else {
    stopHeartbeat();
  }
}

      // 17. High‑level state setter
function setOSState(next) {
  const prev = currentState;
  if (prev === next) return;

  runTransitionEffects(prev, next);
  applyState(next);
}

// 18. Transition executor by name
function runTransition(name) {
  const t = OS_TRANSITIONS[name];
  if (!t) {
    console.warn('Unknown transition:', name);
    return;
  }
  if (t.from && t.from !== currentState) {
    console.warn('Invalid transition from', currentState, 'via', name);
    return;
  }

  switch (name) {
    case 'BOOT':
      playBootSequence(() => applyState(t.to));
      break;
    case 'IDLE_ACTIVE':
    case 'ACTIVE_COMBAT':
    case 'COMBAT_STEALTH':
    case 'STEALTH_DRIFT':
    case 'DRIFT_ADVISOR':
    case 'ADVISOR_ACTIVE':
      setOSState(t.to);
      break;
    default:
      setOSState(t.to);
  }
}

// 19. Boot + visor helpers
function playBootSequence(done) {
  renderGlyph('BOOT_START');
  setTimeout(() => renderGlyph('BOOT_MID'), TIMING.BOOT.START);
  setTimeout(() => {
    renderGlyph('BOOT_END');
    if (done) done();
  }, TIMING.BOOT.START + TIMING.BOOT.MID);
}

function playVisorActivation(done) {
  renderGlyph('VISOR_COMPRESS');
  setTimeout(() => renderGlyph('VISOR_EXPAND'), TIMING.VISOR.COMPRESS);
  setTimeout(() => {
    renderGlyph('VISOR_LOCK');
    if (done) done();
  }, TIMING.VISOR.COMPRESS + TIMING.VISOR.EXPAND);
}

      // 20. Initialization
window.addEventListener('load', () => {
  // Boot into IDLE
  runTransition('BOOT');

  // Example: visor activation hook (optional)
  const root = document.getElementById(GLYPH_ROOT_ID);
  if (root) {
    root.addEventListener('click', () => {
      playVisorActivation(() => {
        // after visor lock, go ACTIVE if idle
        if (currentState === 'IDLE') {
          runTransition('IDLE_ACTIVE');
        }
      });
    });
  }
});
