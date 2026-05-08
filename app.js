console.log("BEYOND‑OS Loaded");

document.getElementById("testBtn").addEventListener("click", () => {
  const output = document.getElementById("output");

  const result = {
    status: "Engine running",
    timestamp: new Date().toLocaleTimeString(),
    message: "This is a clean fresh start."
  };

  output.textContent = JSON.stringify(result, null, 2);
});
