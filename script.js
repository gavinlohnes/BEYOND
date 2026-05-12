:root {
  --bg: #050509;
  --bg-panel: #101018;
  --accent: #ff1b2d;
  --accent-soft: #ff4b5f33;
  --text: #f5f5f5;
  --muted: #888;
  --border: #262636;
  --success: #3ddc84;
  --warning: #ffb347;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
}

body {
  background: radial-gradient(circle at top, #1a1a2a 0, #050509 55%);
  color: var(--text);
  min-height: 100vh;
}

/* BOOT SCREEN */

#bootScreen {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, #2a0b12 0, #020206 60%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: opacity 0.6s ease;
}

#bootScreen.hidden {
  opacity: 0;
  pointer-events: none;
}

.boot-inner {
  max-width: 420px;
  width: 90%;
  text-align: center;
}

.boot-logo {
  font-size: 26px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.boot-sub {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 18px;
}

.boot-bar {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: #1a1a24;
  overflow: hidden;
  margin-bottom: 10px;
}

.boot-bar-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(90deg, #ff1b2d, #ff4b5f);
  transition: width 0.8s ease;
}

.boot-status {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

/* APP LAYOUT */

#app {
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 16px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.brand {
  font-size: 20px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand .tag {
  margin-left: 8px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(--accent);
  color: var(--accent);
}

.status-pill {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  color: var(--muted);
}

.status-pill.ok {
  border-color: var(--success);
  color: var(--success);
}

.status-pill.error {
  border-color: var(--accent);
  color: var(--accent);
}

.grid {
  display: grid;
  grid-template-columns: 1.1fr 1.1fr 0.9fr;
  gap: 20px;
}

.panel {
  background: linear-gradient(145deg, #0b0b12, #151522);
  border-radius: 14px;
  border: 1px solid var(--border);
  padding: 18px 18px 20px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
}

.panel h2 {
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin-bottom: 14px;
  color: var(--muted);
}

.panel h3 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin: 18px 0 8px;
  color: var(--muted);
}

.subheading {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin: 12px 0 6px;
  color: var(--muted);
}

.field-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.field-row label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-bottom: 4px;
}

.field-row input,
.field-row select {
  background: #090910;
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 6px 8px;
  color: var(--text);
  font-size: 13px;
}

.field-row input:focus,
.field-row select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-soft);
}

.primary-btn {
  margin-top: 8px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #ff1b2d, #ff4b5f);
  color: #fff;
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.primary-btn:active {
  transform: translateY(1px);
  filter: brightness(0.9);
}

.secondary-btn {
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #090910;
  color: var(--text);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.secondary-btn:active {
  transform: translateY(1px);
  filter: brightness(0.95);
}

.signal-block {
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 10px 10px 8px;
  background: radial-gradient(circle at top left, #26101855, #090910 55%);
}

.signal-line {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.signal-line .label {
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 10px;
}

.signal-line .value {
  font-weight: 500;
}

.log-list {
  list-style: none;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
}

.log-item {
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
}

.log-item span.key {
  color: var(--text);
}

/* DRAWERS */

.drawer-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.drawer {
  margin-top: 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #090910;
  max-height: 420px;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.drawer.collapsed {
  max-height: 0;
  opacity: 0;
  border-width: 0;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.drawer-body {
  padding: 10px 10px 12px;
}

.drawer-close {
  cursor: pointer;
  font-size: 14px;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
