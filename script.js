// === V36 PREDICTIVE ENGINE ===================================

// Compute averages from last 7 logs
function computeV36Averages() {
  if (!last7Local.length) {
    return { avgCalories: 0, avgProtein: 0, avgSleep: 0 };
  }

  let c = 0, p = 0, s = 0;
  last7Local.forEach(e => {
    c += e.calories || 0;
    p += e.protein || 0;
    s += e.sleep || 0;
  });

  const d = last7Local.length;
  return {
    avgCalories: c / d,
    avgProtein: p / d,
    avgSleep: s / d
  };
}

// Compute training load (duration × RPE)
function computeV36TrainingLoad() {
  if (!trainingLocal.length) return 0;
  let total = 0;
  trainingLocal.forEach(t => {
    total += (t.duration || 0) * (t.rpe || 1);
  });
  return total;
}

// Main predictive engine
function updatePredictiveEngine() {
  const { avgCalories, avgProtein, avgSleep } = computeV36Averages();
  const load = computeV36TrainingLoad();
  const emotional = emotionalEl.value;

  let predScenario = "IDLE";
  let predMission = "NEUTRAL";
  let predIntensity = "LOW";
  let predCalories = Math.round(avgCalories || 2200);

  // Sleep-driven predictions
  if (avgSleep < 6) {
    predScenario = "RECOVERY";
    predMission = "NEUTRAL";
    predIntensity = "LOW";
    predCalories = Math.max(2000, avgCalories);
  }

  // High training load
  if (load > 1500) {
    predScenario = "OVERWATCH";
    predMission = "ENGAGED";
    predIntensity = "MODERATE";
    predCalories = Math.max(2400, avgCalories);
  }

  // Emotional state influence
  if (emotional === "WIRED") {
    predMission = "AGGRESSIVE";
    predIntensity = "HIGH";
  }

  if (emotional === "DRAINED") {
    predScenario = "RECOVERY";
    predIntensity = "LOW";
  }

  // Protein deficiency → recovery bias
  if (avgProtein < 120) {
    predScenario = "RECOVERY";
    predIntensity = "LOW";
  }

  // Output to UI
  document.getElementById("predScenario").textContent = predScenario;
  document.getElementById("predMission").textContent = predMission;
  document.getElementById("predIntensity").textContent = predIntensity;
  document.getElementById("predCalories").textContent = predCalories + " kcal";
}
