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

async function load
