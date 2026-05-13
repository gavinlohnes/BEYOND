// BEYOND.OS core brain — app.js

// 1. Glyph registry (placeholders for future SVGs)
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

// 2. Render helper
function renderGlyph(key) {
  const root = document.getElementById(GLYPH_ROOT_ID);
  if (!root) return;

  const svg = GlyphSVG[key] || '';
  root.innerHTML = svg;
}

// 3. OS states + metadata
const OS_STATES = {
  IDLE:   { key: 'IDLE',   loopHeartbeat: true,  label: 'IDLE' },
  ACTIVE: { key: 'ACTIVE', loopHeartbeat: true,  label: 'ACTIVE' },
  COMBAT: { key: 'COMBAT', loopHeartbeat: false, label: 'COMBAT' },
  STEALTH:{ key: 'STEALTH',loopHeartbeat: false, label: 'STEALTH' },
  DRIFT:  { key: 'DRIFT',  loopHeartbeat: false, label: 'DRIFT' },
  ADVISOR:{ key: 'ADVISOR',loopHeartbeat: true,  label: 'ADVISOR' },
};

// 4. Heartbeat loop (placeholder visuals for now)
function startHeartbeat() {
  stopHeartbeat();
  const root = document.getElementById(GLYPH_ROOT_ID);
  if (!root) return;

  const frames = ['.', '·', '•', '·'];
  let idx = 0;

  heartbeatTimer = setInterval(() => {
    root.textContent = `[HEARTBEAT ${frames[idx]}]`;
    idx = (idx + 1) % frames.length;
  }, 600);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// 5. State application
function applyState(stateKey, reason = '') {
  const meta = OS_STATES[stateKey];
  if (!meta) return;

  currentState = stateKey;

  // header status
  const statusEl = document.getElementById('os-status');
  if (statusEl) statusEl.textContent = meta.label;

  // glyph render (placeholder)
  renderGlyph(meta.key);

  // heartbeat
  if (meta.loopHeartbeat) {
    startHeartbeat();
  } else {
    stopHeartbeat();
  }

  // log
  logLine(`[STATE] → ${meta.label}${reason ? ` (${reason})` : ''}`);
}

// 6. Logging
function logLine(text) {
  const logPanel = document.getElementById('log-panel');
  if (!logPanel) return;

  const line = document.createElement('div');
  line.textContent = text;
  logPanel.appendChild(line);
  logPanel.scrollTop = logPanel.scrollHeight;
}

// 7. Notifications
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

// 8. Visor overlay controls
function openVisor() {
  const overlay = document.getElementById('visor-overlay');
  if (!overlay) return;
  overlay.classList.remove('visor-hidden');
  logLine('[VISOR] Overlay opened.');
  pushNotification('VISOR ONLINE');
}

function closeVisor() {
  const overlay = document.getElementById('visor-overlay');
  if (!overlay) return;
  overlay.classList.add('visor-hidden');
  logLine('[VISOR] Overlay closed.');
}

// 9. CMD handling
function handleCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) return;

  logLine(`CMD> ${cmd}`);

  const lower = cmd.toLowerCase();

  if (lower === 'help') {
    logLine('Available: help, state idle|active|drift|advisor|stealth|combat, visor open|close, ping');
    pushNotification('HELP: See system log.');
    return;
  }

  if (lower === 'ping') {
    logLine('PONG');
    pushNotification('PONG');
    return;
  }

  if (lower.startsWith('state ')) {
    const target = lower.split(' ')[1]?.toUpperCase();
    if (OS_STATES[target]) {
      applyState(target, 'CMD');
      pushNotification(`STATE → ${target}`);
    } else {
      logLine(`Unknown state: ${target}`);
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

  logLine('Unknown command. Type "help".');
}

// 10. App tile behavior
function wireAppTiles() {
  const tiles = document.querySelectorAll('.app-tile');
  const output = document.getElementById('app-grid-output');
  if (!tiles.length || !output) return;

  tiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
      const title = tile.querySelector('.app-title')?.textContent || `App ${index + 1}`;
      const subtitle = tile.querySelector('.app-subtitle')?.textContent || '';
      output.textContent = `${title} — ${subtitle || 'Activated'}`;
      logLine(`[APP] ${title} opened.`);

      // simple mapping to states for fun
      switch (title.toLowerCase()) {
        case 'diagnostics':
          applyState('ACTIVE', 'Diagnostics');
          break;
        case 'network':
          applyState('ADVISOR', 'Network');
          break;
        case 'memory':
          applyState('DRIFT', 'Memory');
          break;
        case 'pulse':
          applyState('IDLE', 'Pulse');
          break;
        default:
          break;
      }

      pushNotification(`${title.toUpperCase()} ONLINE`);
    });
  });
}

// 11. Visor button wiring
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

// 12. CMD input wiring
function wireCommandInput() {
  const input = document.getElementById('command-input');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleCommand(input.value);
      input.value = '';
    }
  });
}

// 13. Today + visor feed placeholders
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

// 14. Boot sequence
function bootSequence() {
  logLine('[BOOT] BEYOND.OS initializing...');
  applyState('IDLE', 'Boot');

  setTimeout(() => {
    logLine('[BOOT] Core systems online.');
  }, 600);

  setTimeout(() => {
    applyState('ACTIVE', 'Post-boot');
    logLine('[BOOT] Handing control to operator.');
    pushNotification('BEYOND.OS ONLINE');
  }, 1600);
}

// 15. Init
function initBeyondOS() {
  logLine('[SYSTEM] BEYOND.OS core loaded.');
  initPanels();
  wireVisorButton();
  wireCommandInput();
  wireAppTiles();
  bootSequence();
}

// 16. DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBeyondOS);
} else {
  initBeyondOS();
}
`
