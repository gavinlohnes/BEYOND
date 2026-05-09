console.log("BEYOND OS V2 HUD Loaded");

/* =========================
   STATE
========================= */

const defaultState = {
    calories: { current: 0, target: 2000, pct: 0 },
    protein: { current: 0, target: 150, pct: 0 },
    hydration: { current: 0, target: 80, pct: 0 },
    readiness: { current: 0, target: 100, pct: 0 },
    sleep: { current: 0, target: 8, pct: 0 },
    training: { completed: false }
};

let state;

try {
    const stored = localStorage.getItem("beyondOS");
    state = stored ? JSON.parse(stored) : structuredClone(defaultState);
} catch {
    state = structuredClone(defaultState);
}

/* =========================
   LOCAL STORAGE
========================= */

function saveState(){
    localStorage.setItem(
        "beyondOS",
        JSON.stringify(state)
    );
}

/* =========================
   HELPERS
========================= */

function clampPct(value) {
    return Math.max(0, Math.min(100, value));
}

function recomputePercents() {
    state.calories.pct = clampPct((state.calories.current / state.calories.target) * 100);
    state.protein.pct  = clampPct((state.protein.current  / state.protein.target)  * 100);
    state.hydration.pct = clampPct((state.hydration.current / state.hydration.target) * 100);
    state.readiness.pct = clampPct((state.readiness.current / state.readiness.target) * 100);
    state.sleep.pct     = clampPct((state.sleep.current     / state.sleep.target)     * 100);
}

/* =========================
   UPDATE FUNCTIONS
========================= */

function updateCalories(amount) {
    state.calories.current += amount;
    recomputePercents();
    saveState();
    renderHUD();
    renderMetricGrid();
    renderFullHUD();
}

function updateProtein(amount) {
    state.protein.current += amount;
    recomputePercents();
    saveState();
    renderHUD();
    renderMetricGrid();
    renderFullHUD();
}

function updateHydration(amount) {
    state.hydration.current += amount;
    recomputePercents();
    saveState();
    renderHUD();
    renderMetricGrid();
    renderFullHUD();
}

function toggleTrainingSession() {
    state.training.completed = !state.training.completed;
    saveState();
    renderHUD();
    renderMetricGrid();
    renderFullHUD();
}

/* =========================
   QUICK ADD PANEL
========================= */

const quickAddBtn = document.getElementById("quickAddBtn");
const quickAddPanel = document.getElementById("quickAddPanel");
const quickAddOverlay = document.getElementById("quickAddOverlay");
const closeQuickAdd = document.getElementById("closeQuickAdd");

function openQuickAddPanel() {
    quickAddPanel.classList.add("active");
    quickAddOverlay.classList.add("active");
}

function closeQuickAddPanel() {
    quickAddPanel.classList.remove("active");
    quickAddOverlay.classList.remove("active");
}

quickAddBtn?.addEventListener("click", openQuickAddPanel);
closeQuickAdd?.addEventListener("click", closeQuickAddPanel);
quickAddOverlay?.addEventListener("click", closeQuickAddPanel);

/* QUICK ACTION EVENTS */

document.querySelectorAll(".quick-action-btn")
    .forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;

            switch(action){
                case "hydration":
                    updateHydration(8);
                    break;
                case "protein":
                    updateProtein(20);
                    break;
                case "calories":
                    updateCalories(250);
                    break;
                case "training":
                    toggleTrainingSession();
                    break;
            }
        });
    });

/* =========================
   SCREEN NAVIGATION
========================= */

const todayScreen = document.getElementById("todayScreen");
const hudFullScreen = document.getElementById("hudFullScreen");
const compactHUD = document.getElementById("compactHUD");
const backToToday = document.getElementById("backToToday");

function openHUDScreen(){
    todayScreen.classList.remove("screen-active");
    hudFullScreen.classList.add("screen-active");
    renderFullHUD();
}

function closeHUDScreen(){
    hudFullScreen.classList.remove("screen-active");
    todayScreen.classList.add("screen-active");
}

compactHUD?.addEventListener("click", openHUDScreen);
backToToday?.addEventListener("click", closeHUDScreen);

/* =========================
   RENDERING
========================= */

function renderHUD() {
    // Compact HUD
    const cCal = document.getElementById("compactCalories");
    const cHyd = document.getElementById("compactHydration");
    const cRead = document.getElementById("compactReadiness");
    const cSleep = document.getElementById("compactSleep");

    if (cCal)   cCal.textContent   = state.calories.current;
    if (cHyd)   cHyd.textContent   = state.hydration.current;
    if (cRead)  cRead.textContent  = `${state.readiness.pct}%`;
    if (cSleep) cSleep.textContent = `${state.sleep.current}h`;
}

// Placeholder for future metric grid if you add one
function renderMetricGrid() {}

/* FULL HUD RENDER */

function renderFullHUD(){

    document.getElementById("hudCaloriesValue").textContent =
        state.calories.current;

    document.getElementById("hudHydrationValue").textContent =
        state.hydration.current;

    document.getElementById("hudReadinessValue").textContent =
        state.readiness.current;

    document.getElementById("hudSleepValue").textContent =
        state.sleep.current;

    document.getElementById("hudCaloriesBar").style.width =
        `${state.calories.pct}%`;

    document.getElementById("hudHydrationBar").style.width =
        `${state.hydration.pct}%`;

    document.getElementById("hudReadinessBar").style.width =
        `${state.readiness.pct}%`;

    document.getElementById("hudSleepBar").style.width =
        `${state.sleep.pct}%`;
}

/* =========================
   INITIAL BOOT
========================= */

recomputePercents();
renderHUD();
renderFullHUD();
saveState();
