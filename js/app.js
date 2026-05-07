/* ============================================================
   BEYOND‑OS MAX V5.3 — CORE ENGINE
   Modular screen loader + nav + system panel + boot transition
   ============================================================ */

console.log("BEYOND‑OS MAX V5.3 ENGINE ONLINE");

/* ============================================================
   ROUTE MAP
   ============================================================ */

const ROUTES = {
  hud:      () => import("./routes/hud.js"),
  today:    () => import("./routes/today.js"),
  nutrition:() => import("./routes/nutrition.js"),
  meals:    () => import("./routes/meals.js"),
  prep:     () => import("./routes/prep.js"),
};

/* ============================================================
   BOOT → SHELL TRANSITION
   ============================================================ */

window.addEventListener("load", () => {
  setTimeout(() => {
    const boot = document.getElementById("boot-screen");
    if (boot) boot.style.display = "none";

    const shell = document.getElementById("app-shell");
    if (shell) {
      shell.style.display = "flex";
      shell.style.opacity = "1";
    }

    navigate("hud");
  }, 900);
});

/* ============================================================
   NAVIGATION
   ============================================================ */

function navigate(route) {
  const tabs = document.querySelectorAll(".chart-tab");
  tabs.forEach(t => t.classList.remove("on"));

  const active = document.querySelector(`.chart-tab[data-route="${route}"]`);
  if (active) active.classList.add("on");

  loadScreen(route);
}

/* ============================================================
   SCREEN LOADER
   ============================================================ */

async function loadScreen(route) {
  const app = document.getElementById("app");
  if (!app) return;

  // Tools screen is built into HTML
  if (route === "tools") {
    const tpl = document.getElementById("screen-tools");
    app.innerHTML = tpl.innerHTML;
    return;
  }

  // Load route module
  const loader = ROUTES[route];
  if (!loader) {
    app.innerHTML = `<div class="panel"><div class="sys-status">Unknown route: ${route}</div></div>`;
    return;
  }

  const module = await loader();

  // ⭐ FIXED — HUD now loads correctly
  app.innerHTML = module.default();
}

/* ============================================================
   SYSTEM PANEL
   ============================================================ */

function toggleSystemPanel(show) {
  const panel = document.getElementById("system-panel");
  if (!panel) return;
  panel.style.display = show ? "block" : "none";
}

/* ============================================================
   MODALS
   ============================================================ */

function closeModal() {
  document.getElementById("modal-backdrop").classList.remove("on");
  document.querySelectorAll(".plate-modal").forEach(m => m.style.display = "none");
}

/* ============================================================
   UPTIME CLOCK
   ============================================================ */

let uptimeSeconds = 0;
setInterval(() => {
  uptimeSeconds++;
  const hrs = String(Math.floor(uptimeSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((uptimeSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(uptimeSeconds % 60).padStart(2, "0");
  const el = document.getElementById("uptime-readout");
  if (el) el.textContent = `${hrs}:${mins}:${secs}`;
}, 1000);

/* ============================================================
   HUD CLOCK
   ============================================================ */

setInterval(() => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const el = document.getElementById("hud-clock");
  if (el) el.textContent = `${hh}:${mm}`;
}, 1000);
