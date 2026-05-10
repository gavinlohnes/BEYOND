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
