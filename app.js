/* =========================
   BEYOND OS V5 CORE STATE
========================= */

let state = {
    calories:0,
    protein:0,
    hydration:0,
    sleep:6,
    training:false,

    settings:{
        theme:"default",
        hudDensity:"standard",
        animations:true,
        soundFX:false
    },

    weeklySummary:{},
    recommendations:[],
    readiness:{ current:0 }
};

/* =========================
   LOCAL STORAGE
========================= */

function saveState(){
    localStorage.setItem("beyondOS", JSON.stringify(state));
}

function loadState(){
    const s = localStorage.getItem("beyondOS");
    if(!s) return;
    try{
        const parsed = JSON.parse(s);

        // Shallow merge to keep compatibility
        state = Object.assign({}, state, parsed);
        state.settings = Object.assign({}, state.settings, parsed.settings || {});
        state.weeklySummary = parsed.weeklySummary || {};
        state.recommendations = parsed.recommendations || [];
        state.readiness = Object.assign({}, state.readiness, parsed.readiness || {});
    } catch(e){
        console.warn("Failed to parse saved state", e);
    }
}

loadState();

/* =========================
   SOUND FX (V5)
========================= */

function playClick(){
    if(!state.settings.soundFX) return;
    // Placeholder: simple beep using Web Audio would go here.
    // Kept as a no-op to stay deterministic and silent by default.
}

/* =========================
   QUICK ADD SYSTEM
========================= */

function updateCalories(v){
    state.calories += v;
    saveState();
    renderHUD();
    playClick();
}

function updateProtein(v){
    state.protein += v;
    saveState();
    renderHUD();
    playClick();
}

function updateHydration(v){
    state.hydration += v;
    saveState();
    renderHUD();
    playClick();
}

function toggleTrainingSession(){
    state.training = !state.training;
    saveState();
    renderHUD();
    playClick();
}

/* =========================
   NAVIGATION
========================= */

function switchScreen(id){
    document.querySelectorAll(".screen")
        .forEach(s => s.classList.remove("screen-active"));

    const target = document.getElementById(id);
    if(target) target.classList.add("screen-active");
}

function initNavigation(){
    const navDrawer = document.getElementById("navDrawer");
    const navToggleBtn = document.getElementById("navToggleBtn");

    navToggleBtn?.addEventListener("click", () => {
        navDrawer.classList.toggle("nav-drawer--open");
        navDrawer.classList.toggle("nav-drawer--hidden");
        playClick();
    });

    document.getElementById("navTodayBtn")
        ?.addEventListener("click", () => {
            switchScreen("todayScreen");
            playClick();
        });

    document.getElementById("navSettingsBtn")
        ?.addEventListener("click", () => {
            syncSettingsUI();
            switchScreen("settingsScreen");
            playClick();
        });

    document.getElementById("navWeeklyBtn")
        ?.addEventListener("click", () => {
            renderWeekly();
            switchScreen("weeklySummaryScreen");
            playClick();
        });

    document.getElementById("settingsBackBtn")
        ?.addEventListener("click", () => {
            switchScreen("todayScreen");
            playClick();
        });

    document.getElementById("weeklyBackBtn")
        ?.addEventListener("click", () => {
            switchScreen("todayScreen");
            playClick();
        });
}

/* =========================
   THEME + SETTINGS ENGINE
========================= */

function applyTheme(){
    document.body.dataset.theme = state.settings.theme || "default";
}

function applyAnimations(){
    document.body.dataset.animations = state.settings.animations ? "on" : "off";
}

function applyHudDensity(){
    const today = document.getElementById("todayScreen");
    if(!today) return;
    today.dataset.density = state.settings.hudDensity || "standard";
}

function syncSettingsUI(){
    const themeSel = document.getElementById("themeSelector");
    const densitySel = document.getElementById("hudDensitySelector");

    if(themeSel) themeSel.value = state.settings.theme || "default";
    if(densitySel) densitySel.value = state.settings.hudDensity || "standard";
}

function initSettingsEngine(){
    const themeSel = document.getElementById("themeSelector");
    const densitySel = document.getElementById("hudDensitySelector");
    const animToggle = document.getElementById("animationToggle");
    const soundToggle = document.getElementById("soundToggle");
    const resetBtn = document.getElementById("resetSystemBtn");

    themeSel?.addEventListener("change", e => {
        state.settings.theme = e.target.value;
        applyTheme();
        saveState();
        playClick();
    });

    densitySel?.addEventListener("change", e => {
        state.settings.hudDensity = e.target.value;
        applyHudDensity();
        saveState();
        playClick();
    });

    animToggle?.addEventListener("click", () => {
        state.settings.animations = !state.settings.animations;
        applyAnimations();
        saveState();
        playClick();
    });

    soundToggle?.addEventListener("click", () => {
        state.settings.soundFX = !state.settings.soundFX;
        saveState();
        playClick();
    });

    resetBtn?.addEventListener("click", () => {
        if(!confirm("RESET SYSTEM? This will clear all local data.")) return;
        localStorage.removeItem("beyondOS");
        location.reload();
    });
}

/* =========================
   QUICK ADD PANEL (V5)
========================= */

function initQuickAdd(){
    const overlay = document.getElementById("quickAddOverlay");
    const panel = document.getElementById("quickAddPanel");
    const openBtn = document.getElementById("quickAddOpenBtn");
    const closeBtn = document.getElementById("quickAddCloseBtn");

    function openPanel(){
        overlay.classList.add("active");
        panel.classList.add("active");
        playClick();
    }

    function closePanel(){
        overlay.classList.remove("active");
        panel.classList.remove("active");
        playClick();
    }

    openBtn?.addEventListener("click", openPanel);
    closeBtn?.addEventListener("click", closePanel);
    overlay?.addEventListener("click", closePanel);

    document.querySelectorAll(".quick-btn")
        .forEach(btn => {
            btn.addEventListener("click", () => {
                const action = btn.dataset.action;
                if(action === "hydration") updateHydration(8);
                if(action === "protein") updateProtein(20);
                if(action === "calories") updateCalories(250);
                if(action === "training") toggleTrainingSession();
                renderHUD();
            });
        });
}

/* =========================
   READINESS ENGINE
========================= */

function calculateReadiness(){
    let score =
        (state.sleep * 5) +
        (state.hydration * 0.5) +
        (state.protein * 0.2);

    score = Math.max(0, Math.min(100, score));
    state.readiness.current = score;
    return score;
}

function renderReadiness(){
    const score = calculateReadiness();

    const scoreEl = document.getElementById("readinessScore");
    const barEl = document.getElementById("readinessBarFill");

    if(scoreEl) scoreEl.innerText = score;
    if(barEl) barEl.style.width = score + "%";
}

/* =========================
   RECOMMENDATIONS ENGINE
========================= */

function generateRecommendations(){
    state.recommendations = [];

    if(state.hydration < 40)
        state.recommendations.push("Hydration LOW — add 16–24oz over next 2 hours.");

    if(state.protein < 80)
        state.recommendations.push("Protein LOW — add 20–40g before end of day.");

    if(state.sleep < 6)
        state.recommendations.push("Sleep DEFICIT — target 7–8h tonight.");

    if(state.training && state.readiness.current < 40)
        state.recommendations.push("Readiness LOW — consider lighter training or recovery focus.");
}

function renderRecommendations(){
    generateRecommendations();

    const el = document.getElementById("recList");
    if(!el) return;

    el.innerHTML = "";

    if(state.recommendations.length === 0){
        const div = document.createElement("div");
        div.textContent = "SYSTEM STABLE // NO ACTIVE RECOMMENDATIONS";
        el.appendChild(div);
        return;
    }

    state.recommendations.forEach(r => {
        const div = document.createElement("div");
        div.textContent = r;
        el.appendChild(div);
    });
}

/* =========================
   WEEKLY ENGINE
========================= */

function calculateWeekly(){
    state.weeklySummary = {
        calories: state.calories,
        protein: state.protein,
        hydration: state.hydration,
        sleep: state.sleep,
        training: state.training ? 1 : 0,
        consistency: calculateReadiness()
    };
}

function renderWeekly(){
    calculateWeekly();

    document.getElementById("weeklyConsistency").innerText =
        state.weeklySummary.consistency ?? 0;

    document.getElementById("weeklyCalories").innerText =
        state.weeklySummary.calories ?? 0;

    document.getElementById("weeklyProtein").innerText =
        state.weeklySummary.protein ?? 0;

    document.getElementById("weeklyHydration").innerText =
        state.weeklySummary.hydration ?? 0;

    document.getElementById("weeklySleep").innerText =
        state.weeklySummary.sleep ?? 0;

    document.getElementById("weeklyTraining").innerText =
        state.weeklySummary.training ?? 0;
}

/* =========================
   MASTER RENDER LOOP
========================= */

function renderHUD(){
    renderReadiness();
    renderRecommendations();
    applyTheme();
    applyHudDensity();
    applyAnimations();
    saveState();
}

/* =========================
   BOOTSTRAP
========================= */

document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    applyHudDensity();
    applyAnimations();
    initNavigation();
    initSettingsEngine();
    initQuickAdd();
    renderHUD();
});
