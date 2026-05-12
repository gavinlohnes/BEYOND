/* RESET */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background: #000;
  color: #fff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* OS FRAME */
#os-frame {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #000;
}

/* HEADER */
#os-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #ff0000;
  background: #050505;
}

#os-brand {
  font-size: 0.9rem;
  letter-spacing: 0.18rem;
  text-transform: uppercase;
  color: #ff0000;
}

#os-status {
  font-family: monospace;
  font-size: 0.8rem;
  color: #ff0000;
}

/* MAIN GRID */
#os-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1.1fr 1.4fr 1.1fr;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem 1.25rem;
}

/* PANELS */
.os-panel {
  border: 1px solid #222;
  background: #050505;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 0.75rem;
  letter-spacing: 0.16rem;
  text-transform: uppercase;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #111;
  color: #ff0000;
}

.panel-body {
  padding: 0.75rem;
  font-size: 0.85rem;
}

/* VISOR */
.visor-line {
  font-family: monospace;
  color: #ccc;
  margin-bottom: 0.25rem;
}

/* TODAY */
.today-line {
  font-family: monospace;
  color: #fff;
  margin-bottom: 0.35rem;
}

/* SYSTEM LOG */
#log-panel {
  font-family: monospace;
  color: #aaa;
}

/* COMMAND BAR */
#os-command {
  display: flex;
  align-items: center;
  border-top: 1px solid #111;
  background: #050505;
  padding: 0.5rem 1.25rem;
  font-family: monospace;
  font-size: 0.8rem;
}

#command-label {
  color: #ff0000;
  margin-right: 0.75rem;
  letter-spacing: 0.12rem;
}

#command-line {
  color: #ccc;
}

/* SPLASH SCREEN */
#os-splash {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  animation: osSplashFade 0.8s ease-out forwards;
  animation-delay: 1.2s;
}

#os-splash-text {
  color: #ff0000;
  font-family: monospace;
  font-size: 1.6rem;
  letter-spacing: 0.18rem;
  text-transform: uppercase;
  opacity: 0;
  animation: osSplashText 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: 0.15s;
}

@keyframes osSplashText {
  0% { opacity: 0; transform: scale(0.92); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes osSplashFade {
  0% { opacity: 1; }
  100% { opacity: 0; visibility: hidden; }
}

/* RESPONSIVE */
@media (max-width: 900px) {
  #os-main {
    grid-template-columns: 1fr;
  }
}
