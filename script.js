// -----------------------------
// CORE STATE
// -----------------------------
const State = {
    mode: "LOW_CAPACITY",
    heat: 20,
    stats: {
        readiness: 60,
        stress: 30
    },
    identity: {
        discipline: 60,
        consistency: 60
    },
    agentTone: "TACTICAL",
    emotion: {
        mood: "NEUTRAL",
        stability: 70,
        tension: 30,
        confidence: 60
    }
};

// -----------------------------
// SCENARIO ENGINE (simple demo)
// -----------------------------
const ScenarioEngine = {
    evaluate() {
        const t = Date.now() / 1000;
        State.stats.stress = 40 + 20 * Math.sin(t / 10);
        State.stats.readiness = 60 + 15 * Math.cos(t / 12);
        State.heat = Math.min(100, Math.max(0, State.heat + (Math.random() - 0.5) * 4));

        if (State.stats.stress > 70) State.mode = "ALERT";
        else if (State.stats.stress > 55) State.mode = "STEALTH";
        else if (State.stats.readiness > 70) State.mode = "HIGH_CAPACITY";
        else State.mode = "LOW_CAPACITY";

        if (State.heat > 80) State.mode = "OVERDRIVE_READY";
    }
};

// -----------------------------
// OVERDRIVE ENGINE
// -----------------------------
const Overdrive = {
    tick() {
        if (State.mode === "OVERDRIVE_READY") {
            State.heat = Math.min(100, State.heat + 2);
        }
    }
};

// -----------------------------
// IDENTITY ENGINE
// -----------------------------
const Identity = {
    update() {
        State.identity.discipline = Math.min(100, State.identity.discipline + 0.02);
        State.identity.consistency = Math.min(100, State.identity.consistency + 0.02);
    }
};

// -----------------------------
// COUNCIL ENGINE
// -----------------------------
const CouncilEngine = {
    evaluate() {
        const votes = [];

        if (State.stats.readiness > 70 && State.stats.stress < 50) {
            votes.push({ agent: "Load", recommendation: "increase_load" });
        } else if (State.stats.stress > 70 || State.heat > 80) {
            votes.push({ agent: "Protection", recommendation: "reduce_load" });
        } else {
            votes.push({ agent: "Baseline", recommendation: "maintain" });
        }

        if (State.identity.discipline < 60) {
            votes.push({ agent: "Discipline", recommendation: "enforce_structure" });
        }

        const rec = votes[0].recommendation;
        return { decision: rec, votes };
    }
};

function applyCouncil(decision) {
    if (decision === "reduce_load") {
        State.stats.readiness = Math.max(0, State.stats.readiness - 2);
        State.stats.stress = Math.max(0, State.stats.stress - 2);
    } else if (decision === "increase_load") {
        State.stats.readiness = Math.min(100, State.stats.readiness + 2);
        State.stats.stress = Math.min(100, State.stats.stress + 1);
    } else if (decision === "enforce_structure") {
        State.identity.discipline = Math.min(100, State.identity.discipline + 0.5);
    }
}

// -----------------------------
// AGENT VOICE PACKS (V26)
// -----------------------------
const AgentVoices = {
    TACTICAL: {
        boot: "BEYOND-OS online. Kernel stable. Monitoring all systems.",
        highCapacity: "Capacity elevated. We can push with control.",
        lowCapacity: "System load reduced. We move with precision, not ego.",
        stealth: "Stress elevated. We shift into low-visibility operations.",
        alert: "Strain detected. Alert posture engaged.",
        overdrive: "Overdrive primed. Use it with intent.",
        heatCritical: "Thermal load critical. Stand down intensity.",
        heatRising: "Heat rising. Maintain discipline.",
        identityLock: "Identity consolidation detected. Discipline is default.",
        identityBuild: "You’re building the identity you train for.",
        councilReduce: "Council recommends reducing load. We protect the system.",
        councilIncrease: "Council recommends increasing load. Capacity supports escalation.",
        councilStructure: "Council calls for structure. Follow protocol.",
        councilSafe: "Council reports safe conditions. Standard execution authorized."
    },
    COACH: {
        boot: "We’re live. Let’s make today count.",
        highCapacity: "You’re in a great spot. We can push a bit today.",
        lowCapacity: "You’re not at 100%, and that’s fine. We’ll move smart.",
        stealth: "You’re under more stress than usual. We’ll keep things controlled.",
        alert: "You’re close to your limit. We’ll pull back before you break.",
        overdrive: "You’ve earned the right to push. Use it wisely.",
        heatCritical: "You’re red-lining. Time to back off.",
        heatRising: "You’re heating up. Stay composed.",
        identityLock: "This is who you are now. Consistent. Disciplined.",
        identityBuild: "You’re stacking proof that you’re serious.",
        councilReduce: "System says dial it down. That’s not weakness, that’s strategy.",
        councilIncrease: "You can handle more. Let’s level it up.",
        councilStructure: "You need structure today. No winging it.",
        councilSafe: "You’re in a good place. Standard plan is green-lit."
    },
    DRILL: {
        boot: "System online. No excuses.",
        highCapacity: "You’re loaded. We go hard.",
        lowCapacity: "You’re not sharp. We tighten up and execute.",
        stealth: "You’re compromised. We go quiet and controlled.",
        alert: "You’re on the edge. We pull back before you break.",
        overdrive: "Overdrive unlocked. Don’t waste it.",
        heatCritical: "You’re burning out. Stand down.",
        heatRising: "You’re heating up. Control or crash.",
        identityLock: "This is discipline. This is who you are.",
        identityBuild: "You’re earning your identity rep by rep.",
        councilReduce: "Council says cut it. You listen.",
        councilIncrease: "Council says push. You deliver.",
        councilStructure: "Council demands structure. No deviation.",
        councilSafe: "Conditions safe. Execute the plan."
    },
    CALM: {
        boot: "System is online. We’ll move with clarity.",
        highCapacity: "You’re in a strong place today. We can expand a bit.",
        lowCapacity: "You’re carrying more than usual. We’ll keep things light.",
        stealth: "Stress is high. We’ll move quietly and protect your bandwidth.",
        alert: "You’re close to your edge. We’ll step back before it breaks.",
        overdrive: "You have extra capacity. We’ll use it gently and deliberately.",
        heatCritical: "You’re overextended. It’s time to slow down.",
        heatRising: "You’re warming up. Let’s stay aware.",
        identityLock: "Your actions and identity are aligning.",
        identityBuild: "You’re building a steady, reliable version of yourself.",
        councilReduce: "The system suggests easing off. That’s care, not weakness.",
        councilIncrease: "You can handle a bit more. We’ll add it thoughtfully.",
        councilStructure: "You’ll feel better with structure today.",
        councilSafe: "Conditions are stable. We’ll follow the usual plan."
    }
};

function voiceLine(key) {
    const pack = AgentVoices[State.agentTone] || AgentVoices.TACTICAL;
    return pack[key] || "";
}

// -----------------------------
// AGENT ENGINE (FULL CONSOLE)
// -----------------------------
const Agent = {
    history: [],
    typing: false,
    lastMode: State.mode,

    say(message) {
        this.queueMessage(message);
    },

    queueMessage(message) {
        this.typing = true;
        this.renderTyping(true);

        setTimeout(() => {
            this.typing = false;
            this.history.push(message);
            this.renderMessage(message);
            this.renderTyping(false);
        }, this.typingDelay(message));
    },

    typingDelay(message) {
        return Math.min(2000, 40 * message.length);
    },

    renderMessage(message) {
        const box = document.getElementById("agent-messages");
        if (!box) return;

        const div = document.createElement("div");
        div.className = "agent-msg";
        div.textContent = message;

        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    },

    renderTyping(state) {
        const t = document.getElementById("agent-typing");
        if (!t) return;
        t.style.display = state ? "block" : "none";
    },

    onBoot() {
        this.say(voiceLine("boot"));
    },

    onModeChange(newMode) {
        const map = {
            HIGH_CAPACITY: "highCapacity",
            LOW_CAPACITY: "lowCapacity",
            STEALTH: "stealth",
            ALERT: "alert",
            OVERDRIVE_READY: "overdrive"
        };
        const key = map[newMode];
        if (key) this.say(voiceLine(key));
        else this.say(`Mode shift: ${newMode}.`);
    },

    onHeatChange(heat) {
        if (heat > 85) this.say(voiceLine("heatCritical"));
        else if (heat > 70) this.say(voiceLine("heatRising"));
    },

    onIdentityUpdate() {
        const id = State.identity;
        const score = (id.discipline + id.consistency) / 2;

        if (score > 80) this.say(voiceLine("identityLock"));
        else if (score > 65) this.say(voiceLine("identityBuild"));
    },

    onCouncilDecision(decision) {
        const map = {
            reduce_load: "councilReduce",
            increase_load: "councilIncrease",
            enforce_structure: "councilStructure",
            safe: "councilSafe",
            maintain: "councilSafe"
        };
        const key = map[decision];
        if (key) this.say(voiceLine(key));
        else this.say("Council decision registered.");
    },

    tick(prevState) {
        if (State.agentTone !== prevState.agentTone) {
            this.say(`Tone shift detected. Switching to ${State.agentTone} profile.`);
        }

        if (State.mode !== this.lastMode) {
            this.onModeChange(State.mode);
            this.lastMode = State.mode;
        }

        if (Math.abs(State.heat - prevState.heat) > 10) {
            this.onHeatChange(State.heat);
        }

        const prevIdScore = (prevState.identity.discipline + prevState.identity.consistency) / 2;
        const currIdScore = (State.identity.discipline + State.identity.consistency) / 2;
        if (currIdScore - prevIdScore > 2) {
            this.onIdentityUpdate();
        }

        if (State.emotion.mood !== prevState.emotion.mood) {
            this.say(`Emotional state shift detected. Mood: ${State.emotion.mood}.`);
        }
    }
};

// -----------------------------
// TONE ENGINE (V27)
// -----------------------------
const ToneEngine = {
    evaluate() {
        const r = State.stats.readiness;
        const s = State.stats.stress;
        const h = State.heat;
        const id = (State.identity.discipline + State.identity.consistency) / 2;

        if (r > 75 && s < 40) {
            State.agentTone = "TACTICAL";
        } else if (r < 50 && s > 60) {
            State.agentTone = "CALM";
        } else if (h > 70 || State.mode === "ALERT") {
            State.agentTone = "DRILL";
        } else if (id > 75) {
            State.agentTone = "COACH";
        } else {
            State.agentTone = "TACTICAL";
        }
    }
};

// -----------------------------
// MISSION BRIEFING ENGINE (V28)
// -----------------------------
const MissionEngine = {
    generateBriefing() {
        const r = State.stats.readiness;
        const s = State.stats.stress;
        const h = State.heat;
        const id = (State.identity.discipline + State.identity.consistency) / 2;
        const mode = State.mode;

        let objective = "";
        let focus = "";
        let caution = "";

        if (r > 75) objective = "High-output training block authorized.";
        else if (r > 55) objective = "Standard training block recommended.";
        else objective = "Reduced load protocol advised.";

        if (id > 80) focus = "Identity consolidation phase: reinforce discipline.";
        else if (id > 65) focus = "Identity building phase: maintain consistency.";
        else focus = "Identity foundation phase: establish reliable patterns.";

        if (s > 70) caution = "Stress spike detected. Prioritize controlled pacing.";
        else if (h > 70) caution = "Thermal load elevated. Avoid overdrive engagement.";
        else caution = "System stable. No major constraints.";

        return { objective, focus, caution, mode };
    },

    deliverBriefing() {
        const b = this.generateBriefing();
        Agent.say(`Mission Briefing: ${b.objective}`);
        Agent.say(`Focus: ${b.focus}`);
        Agent.say(`Caution: ${b.caution}`);
        Agent.say(`Operational Mode: ${b.mode}`);
    }
};

// -----------------------------
// THREAT DETECTION ENGINE (V29)
// -----------------------------
const ThreatEngine = {
    lastThreat: null,

    evaluate(prevState) {
        const threats = [];

        if (State.stats.stress - prevState.stats.stress > 10) {
            threats.push("STRESS_SPIKE");
        }

        if (prevState.stats.readiness - State.stats.readiness > 10) {
            threats.push("READINESS_DROP");
        }

        if (State.heat - prevState.heat > 15) {
            threats.push("HEAT_SURGE");
        }

        const prevId = (prevState.identity.discipline + prevState.identity.consistency) / 2;
        const currId = (State.identity.discipline + State.identity.consistency) / 2;
        if (prevId - currId > 5) {
            threats.push("IDENTITY_COLLAPSE");
        }

        if (State.mode !== prevState.mode &&
            prevState.mode === "HIGH_CAPACITY" &&
            State.mode === "ALERT") {
            threats.push("MODE_CRASH");
        }

        this.lastThreat = threats[0] || this.lastThreat;
        return threats;
    },

    respond(threats) {
        if (!threats.length) return;

        threats.forEach(t => {
            switch (t) {
                case "STRESS_SPIKE":
                    Agent.say("Threat detected: sudden stress spike. Switching to protective posture.");
                    break;
                case "READINESS_DROP":
                    Agent.say("Threat detected: readiness drop. Adjusting mission parameters.");
                    break;
                case "HEAT_SURGE":
                    Agent.say("Threat detected: thermal surge. Overdrive risk elevated.");
                    break;
                case "IDENTITY_COLLAPSE":
                    Agent.say("Threat detected: identity instability. Reinforce discipline immediately.");
                    break;
                case "MODE_CRASH":
                    Agent.say("Threat detected: mode crash from HIGH_CAPACITY to ALERT. System strain critical.");
                    break;
            }
        });
    }
};

// -----------------------------
// MISSION DEBRIEF ENGINE (V30A)
// -----------------------------
const DebriefEngine = {
    generate(prevState) {
        const r0 = prevState.stats.readiness;
        const r1 = State.stats.readiness;
        const s0 = prevState.stats.stress;
        const s1 = State.stats.stress;
        const h0 = prevState.heat;
        const h1 = State.heat;
        const id0 = (prevState.identity.discipline + prevState.identity.consistency) / 2;
        const id1 = (State.identity.discipline + State.identity.consistency) / 2;
        const council = CouncilEngine.evaluate();

        let readinessSummary = "";
        if (r1 > r0) readinessSummary = "Readiness improved over the cycle.";
        else if (r1 < r0) readinessSummary = "Readiness decreased. Recovery recommended.";
        else readinessSummary = "Readiness stable.";

        let stressSummary = "";
        if (s1 > s0) stressSummary = "Stress increased. System load was significant.";
        else if (s1 < s0) stressSummary = "Stress decreased. Good regulation.";
        else stressSummary = "Stress stable.";

        let heatSummary = "";
        if (h1 > h0) heatSummary = "Thermal load increased. Overdrive usage was high.";
        else if (h1 < h0) heatSummary = "Thermal load decreased. Good pacing.";
        else heatSummary = "Thermal load stable.";

        let identitySummary = "";
        if (id1 > id0 + 2) identitySummary = "Identity strengthened. Discipline reinforced.";
        else if (id1 < id0 - 2) identitySummary = "Identity destabilized. Re-center tomorrow.";
        else identitySummary = "Identity stable.";

        let councilSummary = "";
        if (council.decision === "increase_load") councilSummary = "Council favored escalation today.";
        else if (council.decision === "reduce_load") councilSummary = "Council favored protection today.";
        else if (council.decision === "enforce_structure") councilSummary = "Council demanded structure.";
        else councilSummary = "Council maintained standard posture.";

        return { readinessSummary, stressSummary, heatSummary, identitySummary, councilSummary };
    },

    deliver(prevState) {
        const d = this.generate(prevState);

        Agent.say("Mission Debrief:");
        Agent.say(d.readinessSummary);
        Agent.say(d.stressSummary);
        Agent.say(d.heatSummary);
        Agent.say(d.identitySummary);
        Agent.say(d.councilSummary);

        const id = (State.identity.discipline + State.identity.consistency) / 2;
        if (id > 80) Agent.say("Identity consolidation confirmed. You’re becoming the person you train to be.");
        else if (id > 65) Agent.say("Identity trending upward. Keep reinforcing the pattern.");
        else Agent.say("Identity foundation forming. Tomorrow is another rep.");
    }
};

// -----------------------------
// OVERDRIVE IGNITION ENGINE (V31C)
// -----------------------------
const OverdriveIgnition = {
    triggered: false,

    check(prevState) {
        if (State.mode === "OVERDRIVE_READY" && prevState.mode !== "OVERDRIVE_READY") {
            this.trigger();
        }

        if (State.heat > 85 && prevState.heat <= 85) {
            this.trigger();
        }
    },

    trigger() {
        if (this.triggered) return;
        this.triggered = true;

        const layer = document.getElementById("overdrive-ignition");
        layer.classList.remove("hidden");
        layer.classList.add("overdrive-ignition");

        const hud = document.querySelector(".hud");
        if (hud) hud.classList.add("hud-distort");

        document.querySelectorAll(".panel").forEach(p => {
            p.classList.add("redline-pulse");
            setTimeout(() => p.classList.remove("redline-pulse"), 1200);
        });

        Agent.say("Overdrive ignition sequence triggered. System output elevated.");

        setTimeout(() => {
            layer.classList.add("hidden");
            this.triggered = false;
        }, 900);
    }
};

// -----------------------------
// EMOTIONAL STATE ENGINE (V32B)
// -----------------------------
const EmotionEngine = {
    evaluate(prevState) {
        const e = State.emotion;

        e.tension += (State.stats.stress - prevState.stats.stress) * 0.2;
        e.tension += (State.heat - prevState.heat) * 0.1;

        if (State.stats.stress > 75) e.stability -= 1.5;
        if (State.heat > 85) e.stability -= 1.2;

        const prevId = (prevState.identity.discipline + prevState.identity.consistency) / 2;
        const currId = (State.identity.discipline + State.identity.consistency) / 2;
        if (currId > prevId) e.confidence += 0.5;

        if (State.stats.readiness < prevState.stats.readiness) {
            e.confidence -= 0.4;
        }

        e.tension = Math.max(0, Math.min(100, e.tension));
        e.stability = Math.max(0, Math.min(100, e.stability));
        e.confidence = Math.max(0, Math.min(100, e.confidence));

        State.emotion.mood = this.determineMood(e);
    },

    determineMood(e) {
        if (e.tension > 70) return "ALERT";
        if (e.stability < 40) return "UNSTABLE";
        if (e.confidence > 80) return "ASSERTIVE";
        if (e.confidence < 40) return "CAUTIOUS";
        return "NEUTRAL";
    }
};

// -----------------------------
// PERSONA DEFINITIONS (V34A)
// -----------------------------
const Personas = {
    STRATEGIST: {
        name: "STRATEGIST",
        tone: "TACTICAL",
        lines: {
            greet: "Strategist online. Optimizing operational pathways.",
            advise: "Recommendation: maximize efficiency and minimize wasted motion.",
            alert: "Deviation detected. Re-align with optimal trajectory."
        }
    },
    OPERATOR: {
        name: "OPERATOR",
        tone: "DRILL",
        lines: {
            greet: "Operator online. Ready for direct execution.",
            advise: "Execute cleanly. No hesitation.",
            alert: "System strain rising. Adjust immediately."
        }
    },
    SURVIVAL: {
        name: "SURVIVAL",
        tone: "CALM",
        lines: {
            greet: "Survival online. Prioritizing system integrity.",
            advise: "Reduce load. Protect the system.",
            alert: "Critical threat detected. Pull back."
        }
    },
    DISCIPLINE: {
        name: "DISCIPLINE",
        tone: "COACH",
        lines: {
            greet: "Discipline online. Reinforcing identity.",
            advise: "Stay consistent. Identity is built through repetition.",
            alert: "Identity drift detected. Re-center immediately."
        }
    }
};

// -----------------------------
// MULTI-PERSONA ENGINE (V34A)
// -----------------------------
const PersonaEngine = {
    activePersona: "STRATEGIST",

    evaluate(prevState) {
        const r = State.stats.readiness;
        const s = State.stats.stress;
        const h = State.heat;
        const id = (State.identity.discipline + State.identity.consistency) / 2;
        const mode = State.mode;

        if (r > 75 && s < 40) this.switchTo("STRATEGIST");
        else if (h > 70 || mode === "ALERT") this.switchTo("OPERATOR");
        else if (s > 70 || r < 50) this.switchTo("SURVIVAL");
        else if (id < 60 || id > 80) this.switchTo("DISCIPLINE");
        else this.switchTo("STRATEGIST");
    },

    switchTo(persona) {
        if (this.activePersona === persona) return;
        this.activePersona = persona;
        const p = Personas[persona];
        State.agentTone = p.tone;
        Agent.say(p.lines.greet);
    },

    advise() {
        const p = Personas[this.activePersona];
        Agent.say(p.lines.advise);
    }
};

// -----------------------------
// PERSONA CONFLICT ENGINE (V35A)
// -----------------------------
const ConflictEngine = {
    lastConflict: null,

    evaluate(prevState) {
        const triggers = [];

        if (State.stats.stress - prevState.stats.stress > 8) triggers.push("STRESS_SPIKE");
        if (State.heat - prevState.heat > 12) triggers.push("HEAT_SURGE");
        if (prevState.stats.readiness - State.stats.readiness > 8) triggers.push("READINESS_DROP");
        if (State.mode === "ALERT" && prevState.mode !== "ALERT") triggers.push("MODE_ALERT");
        if (State.mode === "STEALTH" && prevState.mode !== "STEALTH") triggers.push("MODE_STEALTH");

        if (!triggers.length) return;

        this.lastConflict = triggers[0];
        this.resolveConflict(triggers[0]);
    },

    resolveConflict(trigger) {
        const votes = [];

        switch (trigger) {
            case "STRESS_SPIKE":
                votes.push({ persona: "STRATEGIST", vote: "maintain" });
                votes.push({ persona: "OPERATOR", vote: "correct" });
                votes.push({ persona: "SURVIVAL", vote: "reduce" });
                votes.push({ persona: "DISCIPLINE", vote: "structure" });
                break;

            case "HEAT_SURGE":
                votes.push({ persona: "STRATEGIST", vote: "maintain" });
                votes.push({ persona: "OPERATOR", vote: "cooldown" });
                votes.push({ persona: "SURVIVAL", vote: "reduce" });
                votes.push({ persona: "DISCIPLINE", vote: "structure" });
                break;

            case "READINESS_DROP":
                votes.push({ persona: "STRATEGIST", vote: "adjust" });
                votes.push({ persona: "OPERATOR", vote: "push" });
                votes.push({ persona: "SURVIVAL", vote: "reduce" });
                votes.push({ persona: "DISCIPLINE", vote: "structure" });
                break;

            case "MODE_ALERT":
                votes.push({ persona: "STRATEGIST", vote: "maintain" });
                votes.push({ persona: "OPERATOR", vote: "correct" });
                votes.push({ persona: "SURVIVAL", vote: "protect" });
                votes.push({ persona: "DISCIPLINE", vote: "structure" });
                break;

            case "MODE_STEALTH":
                votes.push({ persona: "STRATEGIST", vote: "maintain" });
                votes.push({ persona: "OPERATOR", vote: "hold" });
                votes.push({ persona: "SURVIVAL", vote: "protect" });
                votes.push({ persona: "DISCIPLINE", vote: "structure" });
                break;
        }

        const tally = {};
        votes.forEach(v => {
            tally[v.vote] = (tally[v.vote] || 0) + 1;
        });

        const winner = Object.keys(tally).reduce((a, b) => tally[a] > tally[b] ? a : b);

        this.announceConflict(trigger, votes, winner);
        this.applyResolution(winner);
    },

    announceConflict(trigger, votes, winner) {
        Agent.say(`Persona conflict triggered: ${trigger.replace("_", " ").toLowerCase()}.`);

        votes.forEach(v => {
            const p = Personas[v.persona];
            Agent.say(`${p.name}: "${p.lines.alert}"`);
        });

        Agent.say(`Conflict resolved. Consensus: ${winner}.`);
    },

    applyResolution(winner) {
        switch (winner) {
            case "reduce":
            case "protect":
                PersonaEngine.switchTo("SURVIVAL");
                break;

            case "cooldown":
            case "correct":
                PersonaEngine.switchTo("OPERATOR");
                break;

            case "structure":
                PersonaEngine.switchTo("DISCIPLINE");
                break;

            case "push":
                PersonaEngine.switchTo("OPERATOR");
                break;

            case "adjust":
            case "maintain":
            default:
                PersonaEngine.switchTo("STRATEGIST");
                break;
        }
    }
};

// -----------------------------
// UI ENGINE
// -----------------------------
const UI = {
    render(prevState) {
        const app = document.getElementById("app");
        const council = CouncilEngine.evaluate();
        const briefing = MissionEngine.generateBriefing();
        const debrief = DebriefEngine.generate(prevState);

        app.innerHTML = `
        <div class="os mode-${State.mode}">
            <div class="header">
                <div>BEYOND-OS :: ${State.mode}</div>
                <div class="hud">
                    <div>R:${State.stats.readiness.toFixed(0)}</div>
                    <div>S:${State.stats.stress.toFixed(0)}</div>
                    <div class="heat-bar">
                        <div class="heat-fill" style="width:${State.heat}%"></div>
                    </div>
                </div>
            </div>

            <div class="tactical-hud">
                <div class="waveform" id="waveform"></div>
                <div class="readiness-arc">
                    <div class="readiness-fill" id="readiness-fill"></div>
                </div>
                <div class="radar">
                    <div class="radar-sweep"></div>
                </div>
            </div>

            <div class="panel">
                <h3>TACTICAL CORE</h3>
                <div class="card">Discipline: ${State.identity.discipline.toFixed(1)}</div>
                <div class="card">Consistency: ${State.identity.consistency.toFixed(1)}</div>
                <div class="card">Council Decision: ${council.decision}</div>
                <div class="card">
                    Votes: ${council.votes.map(v => v.agent + ":" + v.recommendation).join(", ")}
                </div>
            </div>

            <div class="panel">
                <h3>MISSION BRIEFING</h3>
                <div class="card">Objective: ${briefing.objective}</div>
                <div class="card">Focus: ${briefing.focus}</div>
                <div class="card">Caution: ${briefing.caution}</div>
            </div>

            <div class="panel">
                <h3>MISSION DEBRIEF</h3>
                <div class="card">${debrief.readinessSummary}</div>
                <div class="card">${debrief.stressSummary}</div>
                <div class="card">${debrief.heatSummary}</div>
                <div class="card">${debrief.identitySummary}</div>
                <div class="card">${debrief.councilSummary}</div>
            </div>

            <div class="panel">
                <h3>THREAT MONITOR</h3>
                <div class="card">Last Threat: ${ThreatEngine.lastThreat || "None"}</div>
            </div>

            <div class="panel">
                <h3>EMOTIONAL STATE</h3>
                <div class="card">Mood: ${State.emotion.mood}</div>
                <div class="card">Stability: ${State.emotion.stability.toFixed(0)}</div>
                <div class="card">Tension: ${State.emotion.tension.toFixed(0)}</div>
                <div class="card">Confidence: ${State.emotion.confidence.toFixed(0)}</div>
            </div>

            <div class="panel">
                <h3>ACTIVE PERSONA</h3>
                <div class="card">${PersonaEngine.activePersona}</div>
            </div>

            <div class="panel agent-console">
                <h3>AGENT</h3>
                <div class="agent-messages" id="agent-messages"></div>
                <div class="agent-typing" id="agent-typing" style="display:none;">typing…</div>
            </div>

            <div class="panel">
                <h3>PERSONA CONFLICT</h3>
                <div class="card">Last Conflict: ${ConflictEngine.lastConflict || "None"}</div>
            </div>

            <div class="footer">
                KERNEL ACTIVE :: BEYOND-OS RUNNING
            </div>
        </div>
        `;
    }
};

// -----------------------------
// TACTICAL HUD ENGINE (V33D)
// -----------------------------
const TacticalHUD = {
    update() {
        const wf = document.getElementById("waveform");
        if (wf) {
            wf.innerHTML = "";
            const bars = 20;
            for (let i = 0; i < bars; i++) {
                const bar = document.createElement("div");
                bar.className = "waveform-line";
                bar.style.left = `${i * 7}px`;
                bar.style.animationDelay = `${i * 0.05}s`;
                bar.style.height = `${10 + State.stats.stress * 0.8}%`;
                wf.appendChild(bar);
            }
        }

        const arc = document.getElementById("readiness-fill");
        if (arc) {
            arc.style.height = `${State.stats.readiness}%`;
        }
    }
};

// -----------------------------
// KERNEL LOOP
// -----------------------------
function Kernel() {
    const prevState = JSON.parse(JSON.stringify(State));

    ScenarioEngine.evaluate();
    Overdrive.tick();
    Identity.update();

    const council = CouncilEngine.evaluate();
    applyCouncil(council.decision);
    Agent.onCouncilDecision(council.decision);

    ToneEngine.evaluate();
    const threats = ThreatEngine.evaluate(prevState);
    ThreatEngine.respond(threats);
    EmotionEngine.evaluate(prevState);
    PersonaEngine.evaluate(prevState);
    ConflictEngine.evaluate(prevState);
    OverdriveIgnition.check(prevState);

    UI.render(prevState);
    TacticalHUD.update();
    Agent.tick(prevState);

    const now = performance.now();
    if (now % 30000 < 1000) {
        MissionEngine.deliverBriefing();
    }
    if (now % 60000 < 1000) {
        DebriefEngine.deliver(prevState);
    }
}

// -----------------------------
// BOOT
// -----------------------------
document.getElementById("boot-btn").onclick = () => {
    document.getElementById("boot-screen").style.display = "none";
    document.getElementById("app").classList.remove("hidden");

    UI.render(State);
    Agent.onBoot();
    setInterval(Kernel, 1000);

    console.log("[BEYOND-OS] FULL SYSTEM ONLINE");
};
