// === CONFIG ==================================================

const SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxr55bhTpVcAZsb7_g1R20L2Xs40ardP_YK8QA-e1_ABiSFXW1c4pvDeldnWOamyYEUJQ/exec";

// === DOM HOOKS ===============================================

const form = document.getElementById("dailyForm");
const syncStatus = document.getElementById("syncStatus");

const scenarioEl = document.getElementById("scenario");
const missionEl = document.getElementById("mission");
const emotionalEl = document.getElementById("emotional");

const signalScenario = document.getElementById("signalScenario");
const signalMission = document.getElementById("signalMission");
const signalEmotional = document.getElementById("signalEmotional");

const last7List = document.getElementById("last7List");

// === LOCAL STATE =============================================

let last7Local = [];

// === HELPERS =================================================

function setStatus(text, mode = "idle") {
  syncStatus.textContent = `SHEETS: ${text}`;
  syncStatus.classList.remove("ok", "error");
  if (mode === "ok") syncStatus.classList.add("ok");
  if (mode === "error") syncStatus.classList.add("error");
}

function pushLocalLog(entry) {
  last7Local.push(entry);
  if (last7Local.length > 7) last7Local.shift();
  renderLast7();
}

function renderLast7() {
  last7List.innerHTML = "";
  last7Local
    .slice()
    .reverse()
    .forEach((e) => {
      const li = document.createElement("li");
      li.className = "log-item";
      li.innerHTML = `
        <span class="key">${e.date}</span>
        <span>${e.calories} kcal • ${e.protein}g • ${e.sleep}h</span>
      `;
      last7List.appendChild(li);
    });
}

function updateSignals() {
  signalScenario.textContent = scenarioEl.value;
  signalMission.textContent = missionEl.value;
  signalEmotional.textContent = emotionalEl.value;
}

// === EVENT WIRING ============================================

scenarioEl.addEventListener("change", updateSignals);
missionEl.addEventListener("change", updateSignals);
emotionalEl.addEventListener("change", updateSignals);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    calories: Number(document.getElementById("calories").value),
    protein: Number(document.getElementById("protein").value),
    hydration: Number(document.getElementById("hydration").value),
    sleep: Number(document.getElementById("sleep").value),
    readiness: document.getElementById("readiness").value || "",
    threat: document.getElementById("threat").value || "",
    stability: document.getElementById("stability").value || "",
    scenario: scenarioEl.value,
    mission: missionEl.value,
    emotional: emotionalEl.value,
  };

  setStatus("SENDING…");

  try {
    const res = await fetch(SHEETS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    setStatus("OK", "ok");

    const today = new Date().toISOString().slice(0, 10);
    pushLocalLog({
      date: today,
      calories: payload.calories,
      protein: payload.protein,
      sleep: payload.sleep,
    });
  } catch (err) {
    console.error(err);
    setStatus("ERROR", "error");
  }
});

// === BOOT ====================================================

updateSignals();
setStatus("READY");
