/* ============================================================
   BEYOND‑OS MAX V5.3 — CORE ENGINE
   Clean, modular, screen loader + nav + system panel
   ============================================================ */

console.log("BEYOND‑OS MAX V5.3 ENGINE ONLINE");

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

function loadScreen(route) {
  const app = document.getElementById("app");
  if (!app) return;

  // Tools screen is built into HTML
  if (route === "tools") {
    const tpl = document.getElementById("screen-tools");
    app.innerHTML = tpl.innerHTML;
    return;
  }

  // Default fallback
  app.innerHTML = `
    <div class="panel" style="margin-top:20px;">
      <div class="hdr-logo glow-faint">SCREEN: ${route.toUpperCase()}</div>
      <div class="sys-status dim">This screen is not built yet.</div>
    </div>
  `;
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
