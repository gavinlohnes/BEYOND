// =========================================================
// BEYOND-OS Boot Sequence
// =========================================================

import { PulseEngine } from './core/state.js';
import { renderHUD } from './ui/renderHUD.js';
import { initInteractions } from './controllers/interactions.js';

const boot = () => {
  console.log("BEYOND-OS // Initializing System Core...");

  initInteractions();

  PulseEngine.subscribe((state) => {
    renderHUD(state);
  });

  console.log("BEYOND-OS // System Online.");
};

document.addEventListener('DOMContentLoaded', boot);
