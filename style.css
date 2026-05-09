body {
    margin:0;
    font-family:Arial, sans-serif;
    background:#000;
    color:#fff;
}

/* =========================
   SCREEN SYSTEM
========================= */
.screen {
    display:none;
    padding:20px;
}

.screen-active {
    display:block;
}

/* =========================
   NAV
========================= */
.nav-drawer {
    position:fixed;
    top:10px;
    right:10px;
    z-index:1000;
}

.nav-toggle-btn {
    background:#111;
    color:#fff;
    border:1px solid #ff1a1a;
    padding:6px 10px;
    cursor:pointer;
}

.nav-drawer-inner {
    margin-top:8px;
    background:#111;
    border:1px solid #ff1a1a;
    padding:8px;
    display:flex;
    flex-direction:column;
    gap:6px;
    transform:translateY(-10px);
    opacity:0;
    pointer-events:none;
    transition:transform .2s ease, opacity .2s ease;
}

.nav-drawer--open .nav-drawer-inner {
    transform:translateY(0);
    opacity:1;
    pointer-events:auto;
}

.nav-item {
    background:#000;
    color:#fff;
    border:1px solid #ff1a1a;
    padding:6px 10px;
    cursor:pointer;
    text-align:left;
}

/* =========================
   THEMES
========================= */
:root {
    --accent:#ff1a1a;
}

body[data-theme="default"] { --accent:#ff1a1a; }
body[data-theme="stealth"] { --accent:#666; }
body[data-theme="alert"] { --accent:#ff2a2a; }
body[data-theme="overdrive"] { --accent:#ff0000; filter:brightness(1.1); }

/* =========================
   TODAY
========================= */
h1 {
    margin-top:0;
    letter-spacing:3px;
}

.today-actions {
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    margin-bottom:16px;
}

.primary-btn,
.secondary-btn {
    background:#111;
    color:#fff;
    border:1px solid var(--accent);
    padding:8px 12px;
    cursor:pointer;
    font-size:12px;
}

.secondary-btn {
    border-style:dashed;
}

/* HUD density */
#todayScreen[data-density="compact"] {
    font-size:12px;
}

#todayScreen[data-density="standard"] {
    font-size:14px;
}

#todayScreen[data-density="expanded"] {
    font-size:16px;
}

/* =========================
   PANELS
========================= */
.panel {
    border:1px solid var(--accent);
    padding:10px;
    margin-top:10px;
    background:#050505;
}

.panel-title {
    font-size:12px;
    letter-spacing:2px;
    margin-bottom:6px;
}

/* READINESS */
.readiness-score {
    font-size:24px;
    margin-bottom:6px;
}

.readiness-bar {
    width:100%;
    height:8px;
    background:#222;
    border:1px solid #400000;
    overflow:hidden;
}

.readiness-bar-fill {
    height:100%;
    width:0%;
    background:var(--accent);
    transition:width .25s ease;
}

/* RECOMMENDATIONS */
.rec-list div {
    font-size:12px;
    margin:4px 0;
}

/* =========================
   QUICK ADD
========================= */
.quick-overlay {
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.6);
    opacity:0;
    pointer-events:none;
    transition:opacity .2s ease;
    z-index:900;
}

.quick-panel {
    position:fixed;
    left:0;
    right:0;
    bottom:0;
    background:#111;
    border-top:2px solid var(--accent);
    transform:translateY(100%);
    transition:transform .25s ease;
    z-index:901;
    padding:12px;
}

.quick-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:10px;
}

.quick-close {
    background:none;
    border:none;
    color:#fff;
    font-size:18px;
    cursor:pointer;
}

.quick-grid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:8px;
}

.quick-btn {
    background:#000;
    color:#fff;
    border:1px solid var(--accent);
    padding:10px;
    cursor:pointer;
    font-size:12px;
}

/* Active states */
.quick-overlay.active {
    opacity:1;
    pointer-events:auto;
}

.quick-panel.active {
    transform:translateY(0);
}

/* =========================
   TOPBAR / SETTINGS / WEEKLY
========================= */
.topbar {
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:16px;
}

.topbar-back {
    background:#111;
    color:#fff;
    border:1px solid var(--accent);
    padding:6px 10px;
    cursor:pointer;
}

.settings-grid {
    display:grid;
    grid-template-columns:1fr;
    gap:10px;
}

.settings-card {
    border:1px solid var(--accent);
    padding:10px;
    background:#050505;
}

.settings-label {
    font-size:12px;
    margin-bottom:6px;
}

.settings-btn {
    display:block;
    margin-top:6px;
    background:#111;
    color:#fff;
    border:1px solid var(--accent);
    padding:6px 10px;
    cursor:pointer;
    font-size:12px;
}

.settings-btn-danger {
    border-color:#ff2a2a;
    color:#ff2a2a;
}

/* WEEKLY */
.weekly-grid {
    margin-top:10px;
}

.weekly-grid div {
    margin:6px 0;
}

/* =========================
   ANIMATION TOGGLE
========================= */
body[data-animations="off"] * {
    transition:none !important;
}
