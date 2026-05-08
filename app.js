console.log("BBOS Tactical HUD Loaded — Wave 2 Active");

/* ============================
   OS STATE (PHASE 2)
============================ */
const OS = {
  phase: 2,
  status: "Booting",
  ticks: 0,
  lastUpdate: null
};

/* ============================
   HEARTBEAT LOOP
============================ */
function heartbeat() {
  OS.ticks++;
  OS.lastUpdate = new Date().toLocaleTimeString();

  updateOSStatus();
}

setInterval(heartbeat, 1000); // 1-second heartbeat

/* ============================
   UPDATE HUD STATUS
============================ */
function updateOSStatus() {
  const statusEl = document.getElementById("os-status");

  statusEl.textContent = `OS Status: Running | Ticks: ${OS.ticks} | Last Update: ${OS.lastUpdate}`;
}

/* ============================
   TEST BUTTON
============================ */
document.getElementById("testBtn").addEventListener("click", () => {
  const output = document.getElementById("output");

  const result = {
    status: "System Check Complete",
    phase: OS.phase,
    ticks: OS.ticks,
    timestamp: new Date().toLocaleTimeString(),
    message: "Wave 2 operational. OS heartbeat stable."
  };

  output.textContent = JSON.stringify(result, null, 2);
});
