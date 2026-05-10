/* ============================================================
   BEYOND OS — Final Clean Running Version
   ============================================================ */

const state = {
  readiness: 100,
  activeScenario: "IDLE",
  activeTheme: "redline"
};

/* Persistence */
function saveState() {
  try { localStorage.setItem("beyondState", JSON.stringify(state)); } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem("beyondState");
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.readiness && typeof saved.readiness === "object") {
      saved.readiness = saved.readiness.current || 100;
    }
    Object.assign(state, saved);
  } catch(e) {}
}

/* Theme Engine */
const themeEngine = {
  apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    state.activeTheme = t;
    saveState();
    soundEngine.auto();
  },
  auto() {
    const h = new Date().getHours();
    if (h < 6 || h > 22) return this.apply("nightops");
    if (state.readiness >= 80 || state.activeScenario === "HIGH_CAPACITY") return this.apply("redline");
    if (state.readiness < 40 || state.activeScenario === "LOW_CAPACITY") return this.apply("stealth");
    return this.apply("overclock");
  }
};

/* Sound Engine */
const soundEngine = {
  current: null,
  play(id) {
    if (this.current === id) return;
    document.querySelectorAll('audio[id^="snd"]').forEach(el => el.pause());
    const el = document.getElementById(id);
    if (!el) return;
    el.currentTime = 0;
    el.volume = 0.18;
    el.play().catch(() => {});
    this.current = id;
  },
  auto() {
    const map = {
      nightops: "sndNightOps",
      redline: "sndRedline",
      stealth: "sndStealth",
      overclock: "sndOverclock"
    };
    this.play(map[state.activeTheme]);
  }
};

/* Tone Helpers */
function toneUp() {
  const a = document.getElementById("sndToneUp");
  if (a) { a.currentTime = 0;
              a.play().catch(() => {});
  }
}

function toneDown() {
  const a = document.getElementById("sndToneDown");
  if (a) {
    a.currentTime = 0;
    a.play().catch(() => {});
  }
}

function playScenarioStinger() {
  const a = document.getElementById("sndScenario");
  if (a) {
    a.currentTime = 0;
    a.play().catch(() => {});
  }
}

/* Readiness */
function computeReadiness() {
  state.readiness = Math.max(10, Math.min(100, state.readiness));
  const el = document.getElementById("readinessValue");
  if (el) el.textContent = state.readiness;
}

/* Scenario */
function setScenario(s) {
  state.activeScenario = s;
  const el = document.getElementById("scenarioValue");
  if (el) el.textContent = s;
  playScenarioStinger();
  themeEngine.auto();
  saveState();
}

/* Particles */
function spawnParticles() {
  const c = document.getElementById("hudParticles");
  if (!c) return;
  for (let i = 0; i < 40; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random() * 100 + "vw";
    p.style.top = Math.random() * 100 + "vh";
    p.style.animationDuration = (8 + Math.random() * 12) + "s";
    p.style.animationDelay = Math.random() * 8 + "s";
    c.appendChild(p);
  }
}

/* HUD Objects */
function spawnHUDObjects() {
  const c = document.getElementById("hudObjects");
  if (!c) return;
  for (let i = 0; i < 4; i++) {
    const o = document.createElement("div");
    o.className = "hud-object";
    o.style.left = Math.random() * 100 + "vw";
    o.style.top = Math.random() * 100 + "vh";
    o.style.animationDuration = (15 + Math.random() * 25) + "s";
    o.style.animationDelay = Math.random() * 10 + "s";
    c.appendChild(o);
  }
}

/* Hover */
function initHover() {
  document.querySelectorAll(".panel").forEach(p => {
    let timer;
    p.addEventListener("mouseenter", () => {
      timer = setTimeout(() => p.classList.add("panel-hover-activated"), 400);
    });
    p.addEventListener("mouseleave", () => {
      clearTimeout(timer);
      p.classList.remove("panel-hover-activated");
    });
  });
}

/* Gestures */
function initGestures() {
  let lastX = 0, lastY = 0, lastTime = Date.now();

  document.addEventListener("mousemove", e => {
    const now = Date.now();
    const dt = Math.max(now - lastTime, 1);
    const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt;

    document.body.dataset.speed = speed > 1.5 ? "fast" : "slow";

    document.querySelectorAll(".panel").forEach(p => {
      const r = p.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

      p.dataset.prox = dist < 130 ? "near" : "far";

      const dx = (e.clientX - cx) * 0.012;
      const dy = (e.clientY - cy) * 0.012;
      p.style.transform = `translate(${dx}px, ${dy}px)`;

      p.style.setProperty("--px", ((e.clientX - r.left) / r.width) * 100 + "%");
      p.style.setProperty("--py", ((e.clientY - r.top) / r.height) * 100 + "%");
    });

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  });
}

/* Theme Switcher */
function initThemeSwitcher() {
  document.querySelectorAll("#themeSwitcher [data-theme]").forEach(btn => {
    btn.addEventListener("click", () => {
      themeEngine.apply(btn.dataset.theme);
      toneUp();
    });
  });
}

/* Nav Buttons */
function initNavButtons() {
  document.querySelectorAll(".nav-button[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.nav;
      if (target === "workout") setScenario("HIGH_CAPACITY");
      if (target === "meals")   setScenario("IDLE");
      if (target === "grocery") setScenario("LOW_CAPACITY");
      toneUp();
    });
  });
}

/* Boot */
function bootSequence() {
  const boot = document.getElementById("bootScreen");
  if (!boot) return;
  setTimeout(() => {
    boot.style.opacity = "0";
    setTimeout(() => boot.style.display = "none", 700);
  }, 1400);
}

/* Entry */
window.addEventListener("load", () => {
  loadState();
  spawnParticles();
  spawnHUDObjects();
  initHover();
  initGestures();
  initThemeSwitcher();
  initNavButtons();
  computeReadiness();
  themeEngine.auto();
  bootSequence();
});

