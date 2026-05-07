// =========================================================
// BEYOND-OS Unified Renderer
// =========================================================

import HUD_UI from '../components/beyond-os-hud.js';

const DOM = {
  main: document.querySelector('#viewport'),
  modal: document.querySelector('[data-modal-root]')
};

export const renderHUD = (state) => {
  // HUD_UI handles all HUD visuals
  DOM.main.innerHTML = HUD_UI.Render({
    sessionStats: [
      { label: "Readiness", value: `${state.metrics.readiness}%` },
      { label: "Fatigue", value: `${state.metrics.fatigue}%` },
      { label: "Recovery", value: `${state.metrics.recovery}%` },
      { label: "Strain", value: `${state.metrics.strain}%` }
    ],
    workout: state.workout,
    systemStatus: state.systemStatus,
    activeView: state.activeView
  });

  // Modal
  if (state.workoutActive) {
    DOM.modal.innerHTML = `
      <div class="modal-overlay animate-fade-in" data-modal-overlay>
        <div class="modal-content glass-panel animate-scale-up">
          <p class="panel-subtitle">SYSTEM INITIALIZING</p>
          <h2 class="panel-title text-glow">Initiating ${state.workout.title}</h2>
          <div class="divider my-5"></div>
          <div class="stack-v items-center">
            <button id="close-modal" class="btn btn-primary shadow-glow">Abort Session</button>
          </div>
        </div>
      </div>
    `;
    DOM.modal.classList.add('active');
  } else {
    DOM.modal.innerHTML = '';
    DOM.modal.classList.remove('active');
  }
};
