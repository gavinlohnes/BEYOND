// ===============================
// BEYOND‑OS  //  app.js (Full)
// Mode: CSV Sync + Full UI + Boot
// ===============================

// ---------- CONFIG ----------

// Google Sheets CSV endpoints
const CSV_ENDPOINTS = {
    weight: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQovcBi7FMhJ-NKhCFLguuIey_pinokMbaEvr8ISsSaRHIsLtG2tzwJ4uITrLyNvZrotYESNCMZggME/pub?gid=0&single=true&output=csv",
    compliance: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQovcBi7FMhJ-NKhCFLguuIey_pinokMbaEvr8ISsSaRHIsLtG2tzwJ4uITrLyNvZrotYESNCMZggME/pub?gid=1615652213&single=true&output=csv",
    weekly: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQovcBi7FMhJ-NKhCFLguuIey_pinokMbaEvr8ISsSaRHIsLtG2tzwJ4uITrLyNvZrotYESNCMZggME/pub?gid=2023671118&single=true&output=csv"
};

// Universal page IDs (you can match your HTML to these)
const PAGES = {
    home: "page-home",
    weight: "page-weight",
    compliance: "page-compliance",
    weekly: "page-weekly",
    settings: "page-settings"
};

// Boot + sync timing
const SYNC_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes
const BOOT_MIN_DURATION_MS = 1500;

// ---------- UTILITIES ----------

function $(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
}

function setVisible(id, visible) {
    const el = $(id);
    if (!el) return;
    el.style.display = visible ? "block" : "none";
}

function addClass(id, cls) {
    const el = $(id);
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
}

function removeClass(id, cls) {
    const el = $(id);
    if (el && el.classList.contains(cls)) el.classList.remove(cls);
}

// ---------- CSV PARSING ----------
// Requires PapaParse loaded in HTML (via <script src="...papaparse..."></script>)

async function fetchCSV(url) {
    try {
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true });
        return parsed.data.filter(row => Object.keys(row).some(k => row[k] !== ""));
    } catch (e) {
        console.error("CSV fetch error:", e);
        return [];
    }
}

// ---------- SYNC ENGINE ----------

async function syncBeyondOS() {
    console.log("BEYOND‑OS: Sync started…");

    const [weightData, complianceData, weeklyData] = await Promise.all([
        fetchCSV(CSV_ENDPOINTS.weight),
        fetchCSV(CSV_ENDPOINTS.compliance),
        fetchCSV(CSV_ENDPOINTS.weekly)
    ]);

    updateWeightModule(weightData);
    updateComplianceModule(complianceData);
    updateWeeklyModule(weeklyData);

    console.log("BEYOND‑OS: Sync complete.");
}

// ---------- MODULE: WEIGHT ----------
// Expects IDs:
//   weight-current
//   weight-delta
//   weight-avg
//   weight-trend

function updateWeightModule(rows) {
    if (!rows || rows.length === 0) {
        setText("weight-current", "--");
        setText("weight-delta", "--");
        setText("weight-avg", "--");
        setText("weight-trend", "■");
        return;
    }

    const latest = rows[rows.length - 1];

    const current = latest.weight || latest.Weight || latest.current || "--";
    const delta = latest.delta || latest.Delta || "--";
    const avg7 = latest.avg7 || latest["7d_avg"] || latest["7_day_avg"] || "--";
    const trendRaw = (latest.trend || latest.Trend || "").toString().toLowerCase();

    let arrow = "■";
    if (trendRaw.includes("up")) arrow = "▲";
    else if (trendRaw.includes("down")) arrow = "▼";

    setText("weight-current", current);
    setText("weight-delta", delta);
    setText("weight-avg", avg7);
    setText("weight-trend", arrow);
}

// ---------- MODULE: COMPLIANCE ----------
// Expects IDs:
//   comp-score
//   comp-flags
//   comp-readiness

function updateComplianceModule(rows) {
    if (!rows || rows.length === 0) {
        setText("comp-score", "--");
        setText("comp-flags", "--");
        setText("comp-readiness", "--");
        return;
    }

    const latest = rows[rows.length - 1];

    const score = latest.score || latest.Score || latest.compliance || "--";
    const flags = latest.flags || latest.Flags || latest.notes || "--";
    const readiness = latest.readiness || latest.Readiness || "--";

    setText("comp-score", score);
    setText("comp-flags", flags);
    setText("comp-readiness", readiness);
}

// ---------- MODULE: WEEKLY SUMMARY ----------
// Expects IDs:
//   week-cal
//   week-pro
//   week-hyd
//   week-sleep
//   week-train
//   week-ready

function updateWeeklyModule(rows) {
    if (!rows || rows.length === 0) {
        setText("week-cal", "--");
        setText("week-pro", "--");
        setText("week-hyd", "--");
        setText("week-sleep", "--");
        setText("week-train", "--");
        setText("week-ready", "--");
        return;
    }

    const latest = rows[rows.length - 1];

    const cal = latest.calories || latest.Calories || latest.kcal || "--";
    const pro = latest.protein || latest.Protein || latest.pro || "--";
    const hyd = latest.hydration || latest.Hydration || latest.water || "--";
    const sleep = latest.sleep || latest.Sleep || "--";
    const train = latest.training || latest.Training || latest.sessions || "--";
    const ready = latest.readiness || latest.Readiness || "--";

    setText("week-cal", cal);
    setText("week-pro", pro);
    setText("week-hyd", hyd);
    setText("week-sleep", sleep);
    setText("week-train", train);
    setText("week-ready", ready);
}

// ---------- PAGE SYSTEM ----------
// Uses universal page IDs:
//   page-home
//   page-weight
//   page-compliance
//   page-weekly
//   page-settings

let currentPage = "home";

function showPage(key) {
    currentPage = key;

    Object.keys(PAGES).forEach(k => {
        const id = PAGES[k];
        setVisible(id, k === key);
    });

    // Optional: highlight nav buttons if you use them
    highlightNav(key);
}

function highlightNav(key) {
    const navIds = {
        home: "nav-home",
        weight: "nav-weight",
        compliance: "nav-compliance",
        weekly: "nav-weekly",
        settings: "nav-settings"
    };

    Object.keys(navIds).forEach(k => {
        const el = $(navIds[k]);
        if (!el) return;
        if (k === key) el.classList.add("active");
        else el.classList.remove("active");
    });
}

// ---------- BOOT SEQUENCE ----------
// Expects optional IDs:
//   boot-screen
//   boot-logo
//   boot-text

async function runBootSequence() {
    const bootStart = Date.now();

    setVisible("boot-screen", true);
    addClass("boot-screen", "boot-active");

    // Simple pulse / flicker if you have CSS for it
    addClass("boot-logo", "boot-pulse");
    setText("boot-text", "INITIALIZING BEYOND‑OS…");

    // Start sync in parallel
    const syncPromise = syncBeyondOS();

    // Minimum boot duration
    const elapsed = Date.now() - bootStart;
    const remaining = Math.max(0, BOOT_MIN_DURATION_MS - elapsed);
    await new Promise(res => setTimeout(res, remaining));

    await syncPromise.catch(() => {});

    // Exit boot
    removeClass("boot-logo", "boot-pulse");
    setText("boot-text", "SYSTEM ONLINE");

    setTimeout(() => {
        setVisible("boot-screen", false);
        removeClass("boot-screen", "boot-active");
        showPage("home");
    }, 400);
}

// ---------- EVENT WIRING ----------

function wireNav() {
    const map = {
        "nav-home": "home",
        "nav-weight": "weight",
        "nav-compliance": "compliance",
        "nav-weekly": "weekly",
        "nav-settings": "settings"
    };

    Object.keys(map).forEach(id => {
        const el = $(id);
        if (!el) return;
        el.addEventListener("click", () => showPage(map[id]));
    });
}

// Example tile handlers (optional)
// Match these IDs to your tiles if you want tap‑to‑jump behavior
function wireTiles() {
    const tileMap = {
        "tile-weight": "weight",
        "tile-compliance": "compliance",
        "tile-weekly": "weekly"
    };

    Object.keys(tileMap).forEach(id => {
        const el = $(id);
        if (!el) return;
        el.addEventListener("click", () => showPage(tileMap[id]));
    });
}

// ---------- AUTO‑SYNC ----------

function startAutoSync() {
    setInterval(syncBeyondOS, SYNC_INTERVAL_MS);
}

// ---------- BOOTSTRAP ----------

document.addEventListener("DOMContentLoaded", () => {
    // Hide all pages initially
    Object.keys(PAGES).forEach(k => setVisible(PAGES[k], false));

    wireNav();
    wireTiles();
    startAutoSync();
    runBootSequence();
});
