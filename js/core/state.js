// =========================================================
// BEYOND-OS Pulse Engine
// =========================================================

const listeners = new Set();

const state = {
  activeView: 'HUD',
  workoutActive: false,

  metrics: {
    readiness: 84,
    fatigue: 31,
    recovery: 92,
    strain: 67
  },

  workout: {
    title: 'Push Session',
    exercises: [
      { id: 'incline_press', name: 'Incline Press', sets: 4, last: 185, target: 190, rest: 90 },
      { id: 'machine_fly', name: 'Machine Chest Fly', sets: 3, last: 120, target: 125, rest: 75 }
    ]
  }
};

function cloneState() {
  return structuredClone(state);
}

function notify() {
  const snapshot = cloneState();
  listeners.forEach(fn => fn(snapshot));
}

function commit(patch) {
  let changed = false;

  for (const [key, value] of Object.entries(patch)) {
    if (state[key] !== value) {
      state[key] = value;
      changed = true;
    }
  }

  if (changed) notify();
}

export const PulseEngine = {
  subscribe(fn) {
    if (typeof fn !== 'function') throw new Error('subscribe() requires a function.');
    listeners.add(fn);
    fn(cloneState());
    return () => listeners.delete(fn);
  },

  setView(view) {
    if (state.activeView !== view) commit({ activeView: view });
  },

  toggleWorkout(flag) {
    if (state.workoutActive !== flag) commit({ workoutActive: flag });
  },

  emit(patch) {
    commit(patch);
  },

  getState() {
    return cloneState();
  }
};
