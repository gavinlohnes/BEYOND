console.log("BBOS Tactical HUD Loaded — Wave 4 Active");

/* ============================
   OS STATE
============================ */
const OS = {
  phase: 4,
  status: "Running",
  ticks: 0,
  lastUpdate: null
};

/* ============================
   PROTOCOL ENGINE (WAVE 4)
============================ */
const Protocols = [
  {
    name: "Baseline Stabilization",
    duration: 30, // seconds
    progress: 0,
    active: false
  },
  {
    name: "Cognitive Prep",
    duration: 45,
    progress: 0,
    active: false
  }
];

let activeProtocol = null;

/* Start a protocol */
function startProtocol() {
  if (activeProtocol) return;

  activeProtocol = Protocols[0]; // default protocol
  activeProtocol.active = true;
  activeProtocol.progress = 0;

  updateProtocolHUD();
}

/* Update protocol progress */
function updateProtocol() {
  if (!activeProtocol) return;

  activeProtocol.progress += 1;

  if (activeProtocol.progress >= activeProtocol.duration) {
    completeProtocol();
  }

  updateProtocolHUD();
}

/* Complete protocol */
function completeProtocol() {
  if (!activeProtocol) return;

  activeProtocol.active = false;
  activeProtocol = null;

  document.getElementById("protocol-name").textContent = "None";
  document.getElementById("protocol-progress").textContent = "Progress: 0%";
}

/* Update HUD for protocol */
function updateProtocolHUD() {
  if (!activeProtocol) return;

  const pct = Math.floor(
    (activeProtocol.progress / activeProtocol.duration) * 100
  );

  document.getElementById("protocol-name").textContent =
    activeProtocol.name;

  document.getElementById("protocol-progress").textContent =
    `Progress: ${pct}%`;
}

/* ============================
   HEARTBEAT LOOP
============================ */
function heartbeat() {
  OS.ticks++;
  OS.lastUpdate = new Date().toLocaleTimeString();

  updateOSStatus();
  updateProtocol();
}

setInterval(heartbeat, 1000);

/* ============================
   UPDATE HUD STATUS
============================ */
function updateOSStatus() {
  const statusEl = document.getElementById("os-status");

  statusEl.textContent =
    `OS Status: Running | Ticks: ${OS.ticks} | Last Update: ${OS.lastUpdate}`;
}

/* ============================
   BUTTONS
============================ */
document.getElementById("testBtn").addEventListener("click", () => {
  const output = document.getElementById("output");

  const result = {
    status: "System Check Complete",
    phase: OS.phase,
    ticks: OS.ticks,
    timestamp: new Date().toLocaleTimeString(),
    message: "Wave 4 operational. Protocol engine online."
  };

  output.textContent = JSON.stringify(result, null, 2);
});

document.getElementById("startProtocolBtn").addEventListener("click", () => {
  startProtocol();
});
