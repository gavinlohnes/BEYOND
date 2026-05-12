// Simple boot log + splash removal

const bootLog = [
  "/// BOOTSTRAP: CORE ONLINE",
  "/// VISOR: LINKED",
  "/// REDX PROFILE: LOADED",
  "/// PANELS: STANDING BY",
  "/// SYSTEM: IDLE, AWAITING INPUT"
];

function renderLog() {
  const logPanel = document.getElementById("log-panel");
  if (!logPanel) return;
  bootLog.forEach((line, index) => {
    const row = document.createElement("p");
    row.textContent = line;
    row.style.opacity = "0";
    row.style.transform = "translateY(4px)";
    row.style.transition = "opacity 0.25s ease-out, transform 0.25s ease-out";
    row.style.marginBottom = "0.2rem";
    logPanel.appendChild(row);
    setTimeout(() => {
      row.style.opacity = "1";
      row.style.transform = "translateY(0)";
    }, 200 + index * 160);
  });
}

window.addEventListener("load", () => {
  renderLog();

  // Remove splash after boot timing
  setTimeout(() => {
    const splash = document.getElementById("os-splash");
    if (splash) splash.remove();
  }, 1600);
});
