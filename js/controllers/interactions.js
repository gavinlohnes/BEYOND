// =========================================================
// BEYOND-OS Interaction Controller
// =========================================================

import { PulseEngine } from '../core/state.js';

export const initInteractions = () => {
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Navigation
    if (target.classList.contains('nav-tab')) {
      PulseEngine.setView(target.textContent.trim());
    }

    // Begin Workout
    if (target.textContent.trim() === 'Begin') {
      PulseEngine.toggleWorkout(true);
    }

    // Close Modal
    if (target.id === 'close-modal') {
      PulseEngine.toggleWorkout(false);
    }

    // Sync Button
    if (target.textContent.trim() === 'Sync') {
      PulseEngine.emit({
        metrics: { readiness: 100, recovery: 100 }
      });
    }
  });
};
