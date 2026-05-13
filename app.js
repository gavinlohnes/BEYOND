// BEYOND.OS core brain — app.js

// 1. Glyph registry (SVGs will plug in later)
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

const GLYPH_ROOT_ID = 'glyph-root';

// 2. State + timers + engine internals
let currentState = 'IDLE';
let heartbeatTimer = null;
let inactivityTimer = null;
let lastInteractionTs = Date.now();
let visorLocked = false;
let visorPrevState = 'IDLE';
let transitionCooldown = false;
let lastTransitionTs = 0;

// 3. System memory (session‑level)
const SystemMemory = {
  lastCommand: null,
  commandHistory: [],
  maxHistory: 32,
  lastAppOpened: null,
  lastStateBeforeVisor: null,
  usageCounters: {
    commands: 0,
    visorOpens: 0,
    appOpens: 0,
  },
  settings: {
    inactivityTimeoutMs: 30_000,
    heartbeatBaseMs: 600,
  },
};

const TRANSITION_COOLDOWN_MS = 600;

// 4. OS states
const OS_STATES = {
  IDLE:   { key: 'IDLE',   loopHeartbeat: true,  label: 'IDLE' },
  ACTIVE: { key: 'ACTIVE', loopHeartbeat: true,  label: 'ACTIVE' },
  COMBAT: { key: 'COMBAT', loopHeartbeat: false, label: 'COMBAT' },
  STEALTH:{ key: 'STEALTH',loopHeartbeat: false, label: 'STEALTH' },
  DRIFT:  { key: 'DRIFT',  loopHeartbeat: false, label: 'DRIFT' },
  ADVISOR:{ key: 'ADVISOR',loopHeartbeat: true,  label: 'ADVISOR' },
};

// 5. Log system (with levels + timestamps)
function formatTimestamp() {
  const d = new Date();
  return d.toLocaleTimeString();
}

function logLine(text, level = 'INFO') {
  const logPanel = document.getElementById('log-panel');
  if (!logPanel) return;

  const line = document.createElement('div');
  line.className = `log-line log-${level.toLowerCase()}`;
  line.textContent = `[${formatTimestamp()}] [${level}] ${text}`;
  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function logInfo(msg) { logLine(msg, 'INFO'); }
function logWarn(msg) { logLine(msg, 'WARN'); }
function logError(msg) { logLine(msg, 'ERROR'); }

// 6. Notifications
function pushNotification(message, timeout = 3500) {
  const stack = document.getElementById('notification-stack');
  if (!stack) return;

  const note = document.createElement('div');
  note.className = 'notification';
  note.textContent = message;
  stack.appendChild(note);

  setTimeout(() => {
    note.style.opacity = '0';
    setTimeout(() => {
      if (note.parentNode) note.parentNode.removeChild(note);
    }, 250);
  }, timeout);
}

// 7. Render helper
function renderGlyph(key) {
  const root = document.getElementById(GLYPH_ROOT_ID);
  if (!root) return;
  const svg = GlyphSVG[key] || '';
  root.innerHTML = svg;
}

// 8. Heartbeat loop (adaptive)
function getHeartbeatInterval() {
  const base = SystemMemory.settings.heartbeatBaseMs;
  const cmdUse = SystemMemory.usageCounters.commands;
  if (cmdUse > 50) return Math.max(250, base - 250);
  if (cmdUse > 20) return Math.max(350, base - 150);
  return base;
}

function startHeartbeat() {
  stopHeartbeat();
  const root = document.getElementById(GLYPH_ROOT_ID);
  if (!root) return;

  const frames = ['.', '·', '•', '·'];
  let idx = 0;
  const interval = getHeartbeatInterval();

  heartbeatTimer = setInterval(() => {
    root.textContent = `[HEARTBEAT ${frames[idx]}]`;
    idx = (idx + 1) % frames.length;
  }, interval);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// 9. Transition engine core
function markInteraction(source = 'unknown') {
  lastInteractionTs = Date.now();
  resetInactivityTimer();
}

function canTransition() {
  const now = Date.now();
  if (transitionCooldown && now - lastTransitionTs < TRANSITION_COOLDOWN_MS) {
    return false;
  }
  return true;
}

function setTransitionCooldown() {
  transitionCooldown = true;
  lastTransitionTs = Date.now();
  setTimeout(() => {
    transitionCooldown = false;
  }, TRANSITION_COOLDOWN_MS);
}

function applyStateInternal(stateKey, reason = '') {
  const meta = OS_STATES[stateKey];
  if (!meta) return;

  currentState = stateKey;

  const statusEl = document.getElementById('os-status');
  if (statusEl) statusEl.textContent = meta.label;

  renderGlyph(meta.key);

  if (meta.loopHeartbeat) {
    startHeartbeat();
  } else {
    stopHeartbeat();
  }

  logInfo(`STATE → ${meta.label}${reason ? ` (${reason})` : ''}`);
}

function transitionTo(stateKey, reason = '') {
  if (!OS_STATES[stateKey]) return;
  if (visorLocked) {
    logWarn(`STATE transition blocked (visor lock) → ${stateKey}`);
    return;
  }
  if (!canTransition()) {
    logWarn(`STATE transition throttled → ${stateKey}`);
    return;
  }

  setTransitionCooldown();
  applyStateInternal(stateKey, reason);
}

// 10. Inactivity handling (adaptive)
function getInactivityTimeout() {
  const base = SystemMemory.settings.inactivityTimeoutMs;
  const cmdUse = SystemMemory.usageCounters.commands;
  if (cmdUse > 50) return base * 0.5;
  if (cmdUse > 20) return base * 0.75;
  return base;
}

function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  const timeout = getInactivityTimeout();
  inactivityTimer = setTimeout(() => {
    if (currentState === 'ACTIVE') {
      transitionTo('IDLE', 'Inactivity');
      pushNotification('SYSTEM → IDLE (inactivity)');
    }
  }, timeout);
}

// 11. Visor overlay controls
function openVisor() {
  const overlay = document.getElementById('visor-overlay');
  if (!overlay) return;

  if (!visorLocked) {
    visorPrevState = currentState;
    SystemMemory.lastStateBeforeVisor = currentState;
    visorLocked = true;
  }

  overlay.classList.remove('visor-hidden');
  logInfo('VISOR overlay opened.');
  pushNotification('VISOR ONLINE');
  SystemMemory.usageCounters.visorOpens += 1;
  markInteraction('visor-open');
}

function closeVisor() {
  const overlay = document.getElementById('visor-overlay');
  if (!overlay) return;

  overlay.classList.add('visor-hidden');
  logInfo('VISOR overlay closed.');

  if (visorLocked) {
    visorLocked = false;
    const restore = visorPrevState || 'ACTIVE';
    transitionTo(restore, 'Visor close restore');
  }

  markInteraction('visor-close');
}

// 12. CMD handling (CMD 2.0)
function addToCommandHistory(cmd) {
  SystemMemory.lastCommand = cmd;
  SystemMemory.commandHistory.push(cmd);
  if (SystemMemory.commandHistory.length > SystemMemory.maxHistory) {
    SystemMemory.commandHistory.shift();
  }
}

function dumpSystemMemory() {
  logInfo('SYSTEM MEMORY DUMP BEGIN');
  logInfo(`Last command: ${SystemMemory.lastCommand || 'none'}`);
  logInfo(`Last app opened: ${SystemMemory.lastAppOpened || 'none'}`);
  logInfo(`Last state before visor: ${SystemMemory.lastStateBeforeVisor || 'none'}`);
  logInfo(`Usage: CMD=${SystemMemory.usageCounters.commands}, VISOR=${SystemMemory.usageCounters.visorOpens}, APPS=${SystemMemory.usageCounters.appOpens}`);
  logInfo('SYSTEM MEMORY DUMP END');
}

function clearLogPanel() {
  const logPanel = document.getElementById('log-panel');
  if (!logPanel) return;
  logPanel.innerHTML = '';
  logInfo('LOG CLEARED');
}

function handleCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) return;

  logInfo(`CMD> ${cmd}`);
  markInteraction('cmd');
  addToCommandHistory(cmd);
  SystemMemory.usageCounters.commands += 1;

  const lower = cmd.toLowerCase();

  if (lower === 'help') {
    logInfo('Available: help, ping, state idle|active|drift|advisor|stealth|combat, visor open|close, clear, history, inspect');
    pushNotification('HELP: See system log.');
    return;
  }

  if (lower === 'ping') {
    logInfo('PONG');
    pushNotification('PONG');
    transitionTo('ACTIVE', 'Ping');
    return;
  }

  if (lower === 'clear') {
    clearLogPanel();
    return;
  }

  if (lower === 'history') {
    if (!SystemMemory.commandHistory.length) {
      logInfo('No command history.');
      return;
    }
    logInfo('COMMAND HISTORY BEGIN');
    SystemMemory.commandHistory.forEach((c, i) => {
      logInfo(`#${i + 1}: ${c}`);
    });
    logInfo('COMMAND HISTORY END');
    return;
  }

  if (lower === 'inspect') {
    dumpSystemMemory();
    return;
  }

  if (lower.startsWith('state ')) {
    const target = lower.split(' ')[1]?.toUpperCase();
    if (OS_STATES[target]) {
      transitionTo(target, 'CMD');
      pushNotification(`STATE → ${target}`);
    } else {
      logWarn(`Unknown state: ${target}`);
    }
    return;
  }

  if (lower === 'visor open') {
    openVisor();
    return;
  }

  if (lower === 'visor close') {
    closeVisor();
    return;
  }

  logWarn('Unknown command. Type "help".');
}

// 13. App tile behavior (with chained transitions)
function wireAppTiles() {
  const tiles = document.querySelectorAll('.app-tile');
  const output = document.getElementById('app-grid-output');
  if (!tiles.length || !output) return;

  tiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
      const title = tile.querySelector('.app-title')?.textContent || `App ${index + 1}`;
      const subtitle = tile.querySelector('.app-subtitle')?.textContent || '';
      output.textContent = `${title} — ${subtitle || 'Activated'}`;
      logInfo(`APP opened: ${title}`);
      SystemMemory.lastAppOpened = title;
      SystemMemory.usageCounters.appOpens += 1;
      markInteraction(`app-${title.toLowerCase()}`);

      switch (title.toLowerCase()) {
        case 'diagnostics':
          transitionTo('ACTIVE', 'Diagnostics');
          break;
        case 'network':
          transitionTo('ADVISOR', 'Network');
          break;
        case 'memory':
          transitionTo('DRIFT', 'Memory');
          setTimeout(() => {
            if (currentState === 'DRIFT') {
              transitionTo('ADVISOR', 'Drift resolve');
            }
          }, 5000);
          break;
        case 'pulse':
          transitionTo('IDLE', 'Pulse');
          break;
        default:
          break;
      }

      pushNotification(`${title.toUpperCase()} ONLINE`);
    });
  });
}

// 14. Visor button wiring
function wireVisorButton() {
  const btn = document.getElementById('visor-btn');
  const closeBtn = document.getElementById('visor-close-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      openVisor();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeVisor();
    });
  }
}

// 15. CMD input wiring
function wireCommandInput() {
  const input = document.getElementById('command-input');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleCommand(input.value);
      input.value = '';
    }
  });

  input.addEventListener('input', () => {
    markInteraction('cmd-typing');
    if (currentState === 'IDLE') {
      transitionTo('ACTIVE', 'CMD typing');
    }
  });
}

// 16. Panels init
function initPanels() {
  const today = document.getElementById('today-panel');
  const visorFeed = document.getElementById('visor-feed');

  if (today) {
    const now = new Date();
    today.innerHTML = '';
    const line = document.createElement('div');
    line.className = 'today-line';
    line.textContent = `System date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    today.appendChild(line);
  }

  if (visorFeed) {
    visorFeed.innerHTML = '';
    const line = document.createElement('div');
    line.className = 'visor-line';
    line.textContent = 'VISOR CHANNEL: STANDBY';
    visorFeed.appendChild(line);
  }
}

// 17. Boot sequence
function bootSequence() {
  logInfo('BEYOND.OS initializing...');
  applyStateInternal('IDLE', 'Boot');
  resetInactivityTimer();

  setTimeout(() => {
    logInfo('Core systems online.');
  }, 600);

  setTimeout(() => {
    transitionTo('ACTIVE', 'Post-boot');
    logInfo('Handing control to operator.');
    pushNotification('BEYOND.OS ONLINE');
  }, 1600);
}

// ===============================
//  HUD OVERLAY SYSTEM
// ===============================

// Creates HUD container dynamically so no HTML edits are needed
function createHUDOverlay() {
  const hud = document.createElement('div');
  hud.id = 'hud-overlay';
  hud.style.position = 'fixed';
  hud.style.top = '0';
  hud.style.left = '0';
  hud.style.width = '100%';
  hud.style.height = '48px';
  hud.style.display = 'flex';
  hud.style.alignItems = 'center';
  hud.style.justifyContent = 'space-between';
  hud.style.padding = '0 16px';
  hud.style.background = 'rgba(0,0,0,0.55)';
  hud.style.backdropFilter = 'blur(6px)';
  hud.style.borderBottom = '1px solid #ff1744';
  hud.style.zIndex = '9999';
  hud.style.fontFamily = 'monospace';
  hud.style.color = '#ff1744';
  hud.style.userSelect = 'none';

  hud.innerHTML = `
    <div id="hud-left" style="display:flex;gap:16px;align-items:center;">
      <div id="hud-state" style="font-size:14px;">STATE: IDLE</div>
      <div id="hud-heartbeat" style="font-size:14px;">HB: ●</div>
    </div>

    <div id="hud-center" style="font-size:14px;opacity:0.8;">
      BEYOND.OS HUD ONLINE
    </div>

    <div id="hud-right" style="display:flex;gap:16px;align-items:center;">
      <div id="hud-visor" style="font-size:14px;">VISOR: OFF</div>
      <div id="hud-time" style="font-size:14px;"></div>
    </div>
  `;

  document.body.appendChild(hud);
}

// Updates HUD every 250ms
function startHUDLoop() {
  setInterval(() => {
    const stateEl = document.getElementById('hud-state');
    const hbEl = document.getElementById('hud-heartbeat');
    const visorEl = document.getElementById('hud-visor');
    const timeEl = document.getElementById('hud-time');

    if (!stateEl) return;

    // State
    stateEl.textContent = `STATE: ${currentState}`;

    // Heartbeat indicator
    const hbFrames = ['●', '•', '·', '•'];
    const hbIndex = Math.floor((Date.now() / 200) % hbFrames.length);
    hbEl.textContent = `HB: ${hbFrames[hbIndex]}`;

    // Visor status
    visorEl.textContent = visorLocked ? 'VISOR: LOCKED' : 'VISOR: OFF';

    // Time
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString();
  }, 250);
}

// Hook HUD into boot sequence
const originalBoot = bootSequence;
bootSequence = function() {
  originalBoot();
  setTimeout(() => {
    createHUDOverlay();
    startHUDLoop();
    logInfo('HUD OVERLAY ONLINE');
  }, 1200);
};

// 18. Init
function initBeyondOS() {
  logInfo('BEYOND.OS core loaded.');
  initPanels();
  wireVisorButton();
  wireCommandInput();
  wireAppTiles();
  bootSequence();
}

// 19. DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBeyondOS);
} else {
  initBeyondOS();
    }
