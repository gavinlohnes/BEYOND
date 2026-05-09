const state = {
  calories: { value: 1847, target: 2400, unit: 'kcal', pct: 77 },
  protein: { value: 148, target: 200, unit: 'g', pct: 74 },
  hydration: { value: 64, target: 100, unit: 'oz', pct: 64 },
  trainingLoad: { value: 'HIGH', sub: 'acute load: 1.2', badge: 'ATL' },
  readiness: { value: 82, unit: '%', status: 'OPTIMAL' },
  sleep: { value: 7.2, unit: 'h', status: 'NOMINAL' }
};

function renderHUD() {
  const hud = document.getElementById('hud-compact');
  if (!hud) return;

  hud.innerHTML = `
    <div class="bos-hud-seg">
      <div class="bos-hud-label">Calories</div>
      <div class="bos-hud-value">${state.calories.value}</div>
      <div class="bos-hud-unit">/ ${state.calories.target} ${state.calories.unit}</div>
      <div class="bos-hud-bar-wrap">
        <div class="bos-hud-bar" style="width:${state.calories.pct}%"></div>
      </div>
    </div>
    <div class="bos-hud-seg">
      <div class="bos-hud-label">Hydration</div>
      <div class="bos-hud-value">${state.hydration.value}</div>
      <div class="bos-hud-unit">/ ${state.hydration.target} ${state.hydration.unit}</div>
      <div class="bos-hud-bar-wrap">
        <div class="bos-hud-bar" style="width:${state.hydration.pct}%"></div>
      </div>
    </div>
    <div class="bos-hud-seg">
      <div class="bos-hud-label">Readiness</div>
      <div class="bos-hud-value">${state.readiness.value}%</div>
      <div class="bos-hud-unit">${state.readiness.status}</div>
      <div class="bos-hud-bar-wrap">
        <div class="bos-hud-bar" style="width:${state.readiness.value}%"></div>
      </div>
    </div>
    <div class="bos-hud-seg">
      <div class="bos-hud-label">Sleep</div>
      <div class="bos-hud-value">${state.sleep.value}h</div>
      <div class="bos-hud-unit">${state.sleep.status}</div>
      <div class="bos-hud-bar-wrap">
        <div class="bos-hud-bar" style="width:90%"></div>
      </div>
    </div>
  `;
}

function renderMetricGrid() {
  const grid = document.getElementById('metric-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="bos-tile">
      <div class="bos-tile-corner tl"></div><div class="bos-tile-corner tr"></div>
      <div class="bos-tile-corner bl"></div><div class="bos-tile-corner br"></div>
      <div class="bos-tile-label">Calories</div>
      <div class="bos-tile-value">${state.calories.value}</div>
      <div class="bos-tile-unit">${state.calories.unit} consumed</div>
      <div class="bos-tile-pct">${state.calories.pct}%</div>
    </div>
    <div class="bos-tile">
      <div class="bos-tile-corner tl"></div><div class="bos-tile-corner tr"></div>
      <div class="bos-tile-corner bl"></div><div class="bos-tile-corner br"></div>
      <div class="bos-tile-label">Protein</div>
      <div class="bos-tile-value">${state.protein.value}g</div>
      <div class="bos-tile-unit">of ${state.protein.target}g target</div>
      <div class="bos-tile-pct">${state.protein.pct}%</div>
    </div>
    <div class="bos-tile">
      <div class="bos-tile-corner tl"></div><div class="bos-tile-corner tr"></div>
      <div class="bos-tile-corner bl"></div><div class="bos-tile-corner br"></div>
      <div class="bos-tile-label">Hydration</div>
      <div class="bos-tile-value">${state.hydration.value}${state.hydration.unit}</div>
      <div class="bos-tile-unit">of ${state.hydration.target}${state.hydration.unit} target</div>
      <div class="bos-tile-pct">${state.hydration.pct}%</div>
    </div>
    <div class="bos-tile">
      <div class="bos-tile-corner tl"></div><div class="bos-tile-corner tr"></div>
      <div class="bos-tile-corner bl"></div><div class="bos-tile-corner br"></div>
      <div class="bos-tile-label">Training Load</div>
      <div class="bos-tile-value">HIGH</div>
      <div class="bos-tile-unit">${state.trainingLoad.sub}</div>
      <div class="bos-tile-pct" style="color:#b30000">ATL</div>
    </div>
  `;
}

function wireActions() {
  document.getElementById('btn-add')?.addEventListener('click', () => {
    // placeholder: later this opens QUICK ADD / modal
    console.log('ADD pressed');
  });
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    console.log('RESET pressed');
  });
  document.getElementById('btn-quick')?.addEventListener('click', () => {
    console.log('QUICK pressed');
  });
}

function init() {
  renderHUD();
  renderMetricGrid();
  wireActions();
}

document.addEventListener('DOMContentLoaded', init);
