export default function renderHUD() {
  return `
    <div class="hud-container">

      <!-- CALORIES -->
      <div class="hud-panel" onclick="openInputPanel('calories')">
        <div class="hud-title">CALORIES</div>
        <div class="hud-value" id="hud-calories">0</div>
      </div>

      <!-- PROTEIN -->
      <div class="hud-panel" onclick="openInputPanel('protein')">
        <div class="hud-title">PROTEIN</div>
        <div class="hud-value" id="hud-protein">0g</div>
      </div>

      <!-- RECOVERY -->
      <div class="hud-panel" onclick="openInputPanel('recovery')">
        <div class="hud-title">RECOVERY</div>
        <div class="hud-value" id="hud-recovery">0%</div>
      </div>

      <!-- ENERGY -->
      <div class="hud-panel" onclick="openInputPanel('energy')">
        <div class="hud-title">ENERGY</div>
        <div class="hud-value" id="hud-energy">0%</div>
      </div>

    </div>

    <!-- FULL SCREEN INPUT PANEL -->
    <div id="input-panel" class="input-panel hidden">
      <div class="input-header" id="input-title"></div>

      <input 
        id="input-field" 
        type="number" 
        class="input-field"
        inputmode="numeric"
      />

      <button class="input-save" onclick="saveInputValue()">SAVE</button>
      <button class="input-cancel" onclick="closeInputPanel()">CANCEL</button>
    </div>
  `;
}

/* ------------------------------
   FULL SCREEN INPUT PANEL LOGIC
--------------------------------*/

window.openInputPanel = function (metric) {
  const panel = document.getElementById("input-panel");
  const title = document.getElementById("input-title");
  const field = document.getElementById("input-field");

  window.currentMetric = metric;

  // Set title
  title.textContent = metric.toUpperCase();

  // Load existing value
  const saved = localStorage.getItem(metric) || "";
  field.value = saved.replace("%", "").replace("g", "");

  panel.classList.remove("hidden");
  panel.classList.add("visible");
};

window.closeInputPanel = function () {
  const panel = document.getElementById("input-panel");
  panel.classList.remove("visible");
  panel.classList.add("hidden");
};

window.saveInputValue = function () {
  const field = document.getElementById("input-field");
  let value = field.value.trim();

  if (value === "") return;

  // Format based on metric
  if (currentMetric === "calories") {
    value = parseInt(value);
  }

  if (currentMetric === "protein") {
    value = parseInt(value) + "g";
  }

  if (currentMetric === "recovery" || currentMetric === "energy") {
    value = parseInt(value) + "%";
  }

  // Save
  localStorage.setItem(currentMetric, value);

  // Update HUD
  updateHUDValues();

  // Close panel
  closeInputPanel();
};

/* ------------------------------
   UPDATE HUD FROM STORAGE
--------------------------------*/

window.updateHUDValues = function () {
  const cals = localStorage.getItem("calories") || 0;
  const prot = localStorage.getItem("protein") || "0g";
  const rec = localStorage.getItem("recovery") || "0%";
  const eng = localStorage.getItem("energy") || "0%";

  document.getElementById("hud-calories").textContent = cals;
  document.getElementById("hud-protein").textContent = prot;
  document.getElementById("hud-recovery").textContent = rec;
  document.getElementById("hud-energy").textContent = eng;
};

// Run on load
setTimeout(updateHUDValues, 50);
