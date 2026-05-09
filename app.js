/* =========================
   BEYOND OS V6 CORE
========================= */

const STORAGE_KEY = 'beyondOS_v6';

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function isSameWeek(d1, d2) {
    const a = new Date(d1);
    const b = new Date(d2);
    const oneJan = new Date(a.getFullYear(), 0, 1);
    const weekA = Math.floor((((a - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    const weekB = Math.floor((((b - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    return a.getFullYear() === b.getFullYear() && weekA === weekB;
}

/* =========================
   STATE
========================= */

let state = {
    date: todayStr(),

    // Daily metrics
    calories: 0,
    protein: 0,
    hydration: 0,
    sleep: 0,
    training: false,
    trainingLoad: 0,

    // Readiness
    readiness: { current: 100 },

    // V6 Playbooks
    playbooks: {
        CUT: {
            label: 'CUT',
            calories: 2200,
            protein: 190,
            hydration: 100,
            sleep: 7,
            readiness: 70,
            trainingLoad: 8000
        },
        MAINTAIN: {
            label: 'MAINTAIN',
            calories: 2400,
            protein: 180,
            hydration: 100,
            sleep: 7,
            readiness: 70,
            trainingLoad: 9000
        },
        BULK: {
            label: 'BULK',
            calories: 2700,
            protein: 200,
            hydration: 110,
            sleep: 7,
            readiness: 65,
            trainingLoad: 10000
        },
        RECOVERY: {
            label: 'RECOVERY',
            calories: 2300,
            protein: 170,
            hydration: 110,
            sleep: 8,
            readiness: 75,
            trainingLoad: 5000
        }
    },
    activePlaybook: 'MAINTAIN',

    // Scenario (optional overrides)
    scenario: null, // { type, label, expires, modifiers }

    // V6 Missions
    missions: [],

    // V6 Alerts
    alerts: [],

    // V6 Consistency
    consistency: {
        streak: 0,
        greenDays: 0,
        redDays: 0,
        compliance: 0,
        lastEvaluated: null
    },

    // Weekly aggregates
    weekly: {
        calories: 0,
        protein: 0,
        hydration: 0,
        sleep: 0,
        trainingLoad: 0,
        daysTracked: 0
    },

    // V6 Intelligence
    intelligence: {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        nextWeekFocus: []
    }
};

/* =========================
   LOAD / SAVE
========================= */

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const parsed = JSON.parse(saved);
        state = Object.assign({}, state, parsed);
    } catch (e) {
        console.warn('Failed to load state', e);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =========================
   V6 PLAYBOOK ENGINE
========================= */

const bosPlaybook = {
    getActiveKey() {
        return state.activePlaybook || 'MAINTAIN';
    },
    getActive() {
        return state.playbooks[this.getActiveKey()] || state.playbooks.MAINTAIN;
    },
    set(key) {
        if (!state.playbooks[key]) return;
        state.activePlaybook = key;
        this.syncTargets();
        bosMissions.generate();
        bosAlerts.check();
        computeReadiness();
        saveState();
        renderToday();
    },
    applyScenario(scenario) {
        state.scenario = scenario || null;
        this.syncTargets();
        bosMissions.generate();
        bosAlerts.check();
        computeReadiness();
        saveState();
        renderToday();
    },
    resetScenario() {
        state.scenario = null;
        this.syncTargets();
        bosMissions.generate();
        bosAlerts.check();
        computeReadiness();
        saveState();
        renderToday();
    },
    getTargets() {
        const base = this.getActive();
        const effective = {
            calories: base.calories,
            protein: base.protein,
            hydration: base.hydration,
            sleep: base.sleep,
            readiness: base.readiness,
            trainingLoad: base.trainingLoad
        };
        if (state.scenario && state.scenario.modifiers) {
            const m = state.scenario.modifiers;
            Object.keys(m).forEach(k => {
                if (effective[k] != null) effective[k] = m[k];
            });
        }
        return effective;
    },
    syncTargets() {
        // If you later add a dedicated target system, wire it here.
    }
};

/* =========================
   V6 MISSION ENGINE
========================= */

const BOS_MISSION_TEMPLATES = {
    calories:  t => ({ id: 'cal', label: 'CALORIES TARGET',  target: t.calories,     current: 0, status: 'PENDING' }),
    protein:   t => ({ id: 'pro', label: 'PROTEIN TARGET',   target: t.protein,      current: 0, status: 'PENDING' }),
    hydration: t => ({ id: 'hyd', label: 'HYDRATION TARGET', target: t.hydration,    current: 0, status: 'PENDING' }),
    sleep:     t => ({ id: 'slp', label: 'SLEEP TARGET',     target: t.sleep,        current: 0, status: 'PENDING' }),
    readiness: t => ({ id: 'rdy', label: 'READINESS TARGET', target: t.readiness,    current: 0, status: 'PENDING' }),
    training:  t => ({ id: 'tld', label: 'TRAINING LOAD',    target: t.trainingLoad, current: 0, status: 'PENDING' })
};

const bosMissions = {
    generate() {
        const t = bosPlaybook.getTargets();
        state.missions = [
            BOS_MISSION_TEMPLATES.calories(t),
            BOS_MISSION_TEMPLATES.protein(t),
            BOS_MISSION_TEMPLATES.hydration(t),
            BOS_MISSION_TEMPLATES.sleep(t),
            BOS_MISSION_TEMPLATES.readiness(t),
            BOS_MISSION_TEMPLATES.training(t)
        ];
        this.updateProgress();
        this.evaluate();
    },
    updateProgress() {
        state.missions.forEach(m => {
            switch (m.id) {
                case 'cal': m.current = state.calories; break;
                case 'pro': m.current = state.protein; break;
                case 'hyd': m.current = state.hydration; break;
                case 'slp': m.current = state.sleep; break;
                case 'rdy': m.current = state.readiness.current; break;
                case 'tld': m.current = state.trainingLoad; break;
            }
        });
    },
    evaluate() {
        state.missions.forEach(m => {
            m.status = m.current >= m.target ? 'COMPLETE' : 'PENDING';
        });
    }
};

/* =========================
   V6 ALERT ENGINE
========================= */

const BOS_ALERT_TYPES = {
    HYDRATION_LOW:  { id: 'HYDRATION_LOW',  label: 'HYDRATION LOW',  level: 'WARN' },
    PROTEIN_BEHIND: { id: 'PROTEIN_BEHIND', label: 'PROTEIN BEHIND', level: 'WARN' },
    CALORIES_HIGH:  { id: 'CALORIES_HIGH',  label: 'CALORIES HIGH',  level: 'WARN' },
    SLEEP_DEFICIT:  { id: 'SLEEP_DEFICIT',  label: 'SLEEP DEFICIT',  level: 'INFO' },
    READINESS_LOW:  { id: 'READINESS_LOW',  label: 'READINESS LOW',  level: 'INFO' },
    TRAINING_LOW:   { id: 'TRAINING_LOW',   label: 'TRAINING LOW',   level: 'INFO' },
    TRAINING_HIGH:  { id: 'TRAINING_HIGH',  label: 'TRAINING HIGH',  level: 'WARN' }
};

const bosAlerts = {
    clear() {
        state.alerts = [];
    },
    push(typeId, message) {
        const def = BOS_ALERT_TYPES[typeId];
        if (!def) return;
        if (state.alerts.some(a => a.id === def.id)) return;
        state.alerts.push({
            id: def.id,
            label: def.label,
            level: def.level,
            message: message || def.label
        });
    },
    check() {
        this.clear();
        const t = bosPlaybook.getTargets();

        const cal = state.calories;
        const pro = state.protein;
        const hyd = state.hydration;
        const slp = state.sleep;
        const rdy = state.readiness.current;
        const tld = state.trainingLoad;

        if (hyd < t.hydration * 0.7) {
            this.push('HYDRATION_LOW', 'Hydration below 70% of target');
        }
        if (pro < t.protein * 0.6) {
            this.push('PROTEIN_BEHIND', 'Protein significantly behind target');
        }
        if (cal > t.calories) {
            this.push('CALORIES_HIGH', 'Calories above target');
        }
        if (slp > 0 && slp < t.sleep) {
            this.push('SLEEP_DEFICIT', 'Sleep below target');
        }
        if (rdy > 0 && rdy < t.readiness) {
            this.push('READINESS_LOW', 'Readiness below target');
        }
        if (tld > 0 && t.trainingLoad > 0) {
            if (tld < t.trainingLoad * 0.5) {
                this.push('TRAINING_LOW', 'Training load below 50% of target');
            } else if (tld > t.trainingLoad * 1.3) {
                this.push('TRAINING_HIGH', 'Training load above 130% of target');
            }
        }
    }
};

/* =========================
   V6 CONSISTENCY ENGINE
========================= */

const bosConsistency = {
    update() {
        const missions = state.missions;
        if (!missions || missions.length === 0) return;

        const completed = missions.filter(m => m.status === 'COMPLETE').length;
        const total = missions.length;
        const pct = (completed / total) * 100;

        state.consistency.compliance = Math.round(pct);
        const isGreen = pct >= 70;

        if (isGreen) {
            state.consistency.greenDays++;
            state.consistency.streak++;
        } else {
            state.consistency.redDays++;
            state.consistency.streak = 0;
        }

        state.consistency.lastEvaluated = todayStr();
    },
    resetWeek() {
        state.consistency.streak = 0;
        state.consistency.greenDays = 0;
        state.consistency.redDays = 0;
        state.consistency.compliance = 0;
    }
};

/* =========================
   V6 SCENARIO ENGINE
========================= */

const BOS_SCENARIOS = {
    NIGHTSHIFT: {
        type: 'NIGHTSHIFT',
        label: 'NIGHT SHIFT',
        days: 3,
        modifiers: {
            hydration: 110,
            readiness: 60
        }
    },
    TRAVEL: {
        type: 'TRAVEL',
        label: 'TRAVEL MODE',
        days: 5,
        modifiers: {
            hydration: 120,
            readiness: 60,
            trainingLoad: 6000
        }
    },
    DELOAD: {
        type: 'DELOAD',
        label: 'DELOAD WEEK',
        days: 7,
        modifiers: {
            trainingLoad: 5000,
            readiness: 75
        }
    }
};

const bosScenario = {
    activate(key) {
        const def = BOS_SCENARIOS[key];
        if (!def) return;
        const expires = this._computeExpiry(def.days);
        state.scenario = {
            type: def.type,
            label: def.label,
            expires,
            modifiers: def.modifiers
        };
        bosPlaybook.applyScenario(state.scenario);
    },
    clear() {
        state.scenario = null;
        bosPlaybook.resetScenario();
    },
    checkExpiry() {
        if (!state.scenario || !state.scenario.expires) return;
        const today = todayStr();
        if (today > state.scenario.expires) {
            this.clear();
        }
    },
    _computeExpiry(days) {
        const d = new Date();
        d.setDate(d.getDate() + (days || 0));
        return d.toISOString().slice(0, 10);
    }
};

/* =========================
   V6 INTELLIGENCE ENGINE
========================= */

const bosIntelligence = {
    generateWeekly() {
        const intel = {
            strengths: [],
            weaknesses: [],
            recommendations: [],
            nextWeekFocus: []
        };

        const cons = state.consistency;
        const alerts = state.alerts;
        const missions = state.missions;

        if (cons.compliance >= 75) {
            intel.strengths.push('High overall compliance with daily missions.');
        }
        if (cons.streak >= 3) {
            intel.strengths.push('Strong streak of consecutive green days.');
        }

        const proMission = missions.find(m => m.id === 'pro');
        if (proMission && proMission.current >= proMission.target) {
            intel.strengths.push('Protein intake consistently meets or exceeds target.');
        }

        const hydMission = missions.find(m => m.id === 'hyd');
        if (hydMission && hydMission.current >= hydMission.target) {
            intel.strengths.push('Hydration levels are on target.');
        }

        if (cons.compliance < 60) {
            intel.weaknesses.push('Low mission completion rate across the week.');
        }
        if (cons.redDays > cons.greenDays) {
            intel.weaknesses.push('More red days than green days this week.');
        }

        const calMission = missions.find(m => m.id === 'cal');
        if (calMission && calMission.current > calMission.target) {
            intel.weaknesses.push('Calories frequently exceed target.');
        }

        const sleepMission = missions.find(m => m.id === 'slp');
        if (sleepMission && sleepMission.current < sleepMission.target) {
            intel.weaknesses.push('Sleep duration is below target.');
        }

        if (alerts.some(a => a.id === 'HYDRATION_LOW')) {
            intel.weaknesses.push('Hydration was repeatedly low relative to target.');
            intel.recommendations.push('Front‑load hydration earlier in the day and set a mid‑shift water checkpoint.');
        }
        if (alerts.some(a => a.id === 'PROTEIN_BEHIND')) {
            intel.weaknesses.push('Protein intake lagged behind target.');
            intel.recommendations.push('Add a fixed protein anchor meal or shake at the same time daily.');
        }
        if (alerts.some(a => a.id === 'SLEEP_DEFICIT')) {
            intel.recommendations.push('Protect a consistent pre‑sleep window and reduce late‑night screen time.');
        }
        if (alerts.some(a => a.id === 'TRAINING_HIGH')) {
            intel.recommendations.push('Consider a lighter training day or deload scenario to avoid overload.');
        }

        if (cons.compliance < 60) {
            intel.recommendations.push('Reduce complexity: focus on 2–3 key missions instead of all at once.');
        }

        if (cons.compliance < 70) {
            intel.nextWeekFocus.push('Primary: Improve mission completion rate above 70%.');
        } else {
            intel.nextWeekFocus.push('Primary: Maintain current discipline while refining weak spots.');
        }

        if (intel.strengths.length === 0) {
            intel.strengths.push('System has insufficient data or neutral performance this week.');
        }
        if (intel.weaknesses.length === 0) {
            intel.weaknesses.push('No major weaknesses detected this week.');
        }
        if (intel.recommendations.length === 0) {
            intel.recommendations.push('Maintain current routine and continue logging consistently.');
        }
        if (intel.nextWeekFocus.length === 0) {
            intel.nextWeekFocus.push('Maintain stability and continue tracking key metrics.');
        }

        state.intelligence = intel;
    }
};

/* =========================
   CORE UPDATE / ROLLOVER
========================= */

function ensureNewDay() {
    const today = todayStr();

    // Weekly reset if we crossed into a new week
    if (!isSameWeek(state.date, today)) {
        state.weekly = {
            calories: 0,
            protein: 0,
            hydration: 0,
            sleep: 0,
            trainingLoad: 0,
            daysTracked: 0
        };
        bosConsistency.resetWeek();
    }

    if (state.date !== today) {
        // Roll yesterday into weekly
        state.weekly.calories     += state.calories;
        state.weekly.protein      += state.protein;
        state.weekly.hydration    += state.hydration;
        state.weekly.sleep        += state.sleep;
        state.weekly.trainingLoad += state.trainingLoad;
        state.weekly.daysTracked  += 1;

        // Daily consistency snapshot
        bosMissions.updateProgress();
        bosMissions.evaluate();
        bosConsistency.update();

        // Reset daily
        state.date = today;
        state.calories = 0;
        state.protein = 0;
        state.hydration = 0;
        state.sleep = 0;
        state.training = false;
        state.trainingLoad = 0;

        bosMissions.generate();
        bosAlerts.check();
        computeReadiness();
        bosScenario.checkExpiry();
    }
}

function updateCalories(v) {
    ensureNewDay();
    state.calories += v;
    bosMissions.updateProgress();
    bosMissions.evaluate();
    bosAlerts.check();
    computeReadiness();
    saveState();
    renderToday();
}

function updateProtein(v) {
    ensureNewDay();
    state.protein += v;
    bosMissions.updateProgress();
    bosMissions.evaluate();
    bosAlerts.check();
    computeReadiness();
    saveState();
    renderToday();
}

function updateHydration(v) {
    ensureNewDay();
    state.hydration += v;
    bosMissions.updateProgress();
    bosMissions.evaluate();
    bosAlerts.check();
    computeReadiness();
    saveState();
    renderToday();
}

function toggleTrainingSession() {
    ensureNewDay();
    state.training = !state.training;
    if (state.training) {
        state.trainingLoad += 1000; // simple placeholder volume
    }
    bosMissions.updateProgress();
    bosMissions.evaluate();
    bosAlerts.check();
    computeReadiness();
    saveState();
    renderToday();
}

/* =========================
   READINESS + RECS
========================= */

function computeReadiness() {
    const t = bosPlaybook.getTargets();

    const hydPct = Math.min(1, state.hydration / (t.hydration || 1));
    const proPct = Math.min(1, state.protein   / (t.protein   || 1));
    const calPct = Math.min(1, state.calories  / (t.calories  || 1));
    const slpPct = Math.min(1, state.sleep     / (t.sleep     || 1));

    let calScore = 1;
    if (calPct > 1) {
        calScore = Math.max(0, 1 - (calPct - 1));
    } else {
        calScore = calPct * 0.9 + 0.1;
    }

    let score =
        hydPct * 0.35 +
        proPct * 0.30 +
        slpPct * 0.20 +
        calScore * 0.15;

    state.readiness.current = Math.round(score * 100);
}

/* =========================
   NAVIGATION
========================= */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen-active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('screen-active');

    if (id === 'weeklySummaryScreen') {
        bosIntelligence.generateWeekly();
        renderWeekly();
        renderIntelligence();
    }
}

/* =========================
   RENDER — TODAY
========================= */

function renderToday() {
    const readinessEl = document.getElementById('readinessScore');
    const barFill = document.getElementById('readinessBarFill');
    const recList = document.getElementById('recList');

    if (readinessEl) readinessEl.textContent = state.readiness.current;
    if (barFill) barFill.style.width = Math.min(100, state.readiness.current) + '%';

    if (recList) {
        recList.innerHTML = '';
        if (state.alerts.length === 0) {
            const div = document.createElement('div');
            div.textContent = 'SYSTEM NOMINAL';
            recList.appendChild(div);
        } else {
            state.alerts.forEach(a => {
                const div = document.createElement('div');
                div.textContent = a.message;
                recList.appendChild(div);
            });
        }
    }

    renderMissions();
    renderAlerts();
}

/* =========================
   RENDER — MISSIONS
========================= */

function renderMissions() {
    const list = document.getElementById('missionList');
    if (!list) return;

    list.innerHTML = '';

    state.missions.forEach(m => {
        const pct = Math.min(100, Math.round((m.current / (m.target || 1)) * 100));

        const row = document.createElement('div');
        row.style.marginBottom = '10px';

        row.innerHTML = `
            <div style="font-size:12px; letter-spacing:1px; margin-bottom:4px;">
                ${m.label}: ${m.current} / ${m.target}
            </div>
            <div style="width:100%; height:6px; background:#222; border:1px solid #400000;">
                <div style="
                    width:${pct}%;
                    height:100%;
                    background:var(--accent);
                    transition:width .25s ease;
                "></div>
            </div>
        `;

        list.appendChild(row);
    });
}

/* =========================
   RENDER — ALERTS
========================= */

function renderAlerts() {
    const list = document.getElementById('alertsList');
    if (!list) return;

    list.innerHTML = '';

    if (state.alerts.length === 0) {
        const div = document.createElement('div');
        div.style.fontSize = '12px';
        div.style.color = '#888';
        div.textContent = 'NO ACTIVE ALERTS';
        list.appendChild(div);
        return;
    }

    state.alerts.forEach(a => {
        const row = document.createElement('div');
        row.style.marginBottom = '8px';
        row.style.fontSize = '12px';
        row.style.letterSpacing = '1px';
        row.style.color = a.level === 'WARN' ? '#ff1a1a' : '#fff';

        row.textContent = `${a.label} — ${a.message}`;
        list.appendChild(row);
    });
}

/* =========================
   RENDER — WEEKLY
========================= */

function renderWeekly() {
    const w = state.weekly;
    const cons = state.consistency;

    const cEl  = document.getElementById('weeklyCalories');
    const pEl  = document.getElementById('weeklyProtein');
    const hEl  = document.getElementById('weeklyHydration');
    const sEl  = document.getElementById('weeklySleep');
    const tEl  = document.getElementById('weeklyTraining');
    const conEl = document.getElementById('weeklyConsistency');

    if (cEl) cEl.textContent = Math.round(w.calories).toLocaleString();
    if (pEl) pEl.textContent = Math.round(w.protein) + 'g';
    if (hEl) hEl.textContent = Math.round(w.hydration) + 'oz';
    if (sEl) sEl.textContent = Math.round(w.sleep) + 'h';
    if (tEl) tEl.textContent = Math.round(w.trainingLoad).toLocaleString();
    if (conEl) conEl.textContent = cons.compliance + '%';
}

/* =========================
   RENDER — INTELLIGENCE
========================= */

function renderIntelligence() {
    const intel = state.intelligence;

    const sEl = document.getElementById('intelStrengths');
    const wEl = document.getElementById('intelWeaknesses');
    const rEl = document.getElementById('intelRecommendations');
    const nEl = document.getElementById('intelNextWeek');

    if (!sEl || !wEl || !rEl || !nEl) return;

    function fill(el, arr) {
        el.innerHTML = '';
        arr.forEach(item => {
            const div = document.createElement('div');
            div.style.fontSize = '12px';
            div.style.margin = '4px 0';
            div.textContent = item;
            el.appendChild(div);
        });
    }

    fill(sEl, intel.strengths);
    fill(wEl, intel.weaknesses);
    fill(rEl, intel.recommendations);
    fill(nEl, intel.nextWeekFocus);
}

/* =========================
   QUICK ADD PANEL
========================= */

function openQuickAdd() {
    document.getElementById('quickAddOverlay').classList.add('active');
    document.getElementById('quickAddPanel').classList.add('active');
}

function closeQuickAdd() {
    document.getElementById('quickAddOverlay').classList.remove('active');
    document.getElementById('quickAddPanel').classList.remove('active');
}

/* =========================
   SETTINGS HELPERS
========================= */

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
}

function applyHudDensity(density) {
    document.getElementById('todayScreen').setAttribute('data-density', density);
}

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    ensureNewDay();
    bosPlaybook.syncTargets();
    bosMissions.generate();
    bosAlerts.check();
    computeReadiness();

    // Nav drawer
    const navDrawer = document.getElementById('navDrawer');
    const navToggleBtn = document.getElementById('navToggleBtn');
    navToggleBtn.addEventListener('click', () => {
        navDrawer.classList.toggle('nav-drawer--open');
    });

    document.getElementById('navTodayBtn').addEventListener('click', () => showScreen('todayScreen'));
    document.getElementById('navWeeklyBtn').addEventListener('click', () => showScreen('weeklySummaryScreen'));
    document.getElementById('navSettingsBtn').addEventListener('click', () => showScreen('settingsScreen'));

    // Settings navigation
    document.getElementById('settingsBackBtn').addEventListener('click', () => showScreen('todayScreen'));
    document.getElementById('weeklyBackBtn').addEventListener('click', () => showScreen('todayScreen'));

    // Quick Add
    document.getElementById('quickAddOpenBtn').addEventListener('click', openQuickAdd);
    document.getElementById('quickAddCloseBtn').addEventListener('click', closeQuickAdd);
    document.getElementById('quickAddOverlay').addEventListener('click', closeQuickAdd);

    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'hydration') updateHydration(8);
            if (action === 'protein') updateProtein(20);
            if (action === 'calories') updateCalories(250);
            if (action === 'training') toggleTrainingSession();
            closeQuickAdd();
        });
    });

    // Theme
    const themeSelector = document.getElementById('themeSelector');
    themeSelector.addEventListener('change', () => applyTheme(themeSelector.value));

    // HUD density
    const hudDensitySelector = document.getElementById('hudDensitySelector');
    hudDensitySelector.addEventListener('change', () => applyHudDensity(hudDensitySelector.value));

    // Playbook selector
    const playbookSelector = document.getElementById('playbookSelector');
    if (playbookSelector) {
        playbookSelector.value = state.activePlaybook || 'MAINTAIN';
        playbookSelector.addEventListener('change', () => {
            bosPlaybook.set(playbookSelector.value);
        });
    }

    // Scenario selector
    const scenarioSelector = document.getElementById('scenarioSelector');
    if (scenarioSelector) {
        scenarioSelector.value = state.scenario?.type || '';
        scenarioSelector.addEventListener('change', () => {
            const val = scenarioSelector.value;
            if (!val) bosScenario.clear();
            else bosScenario.activate(val);
        });
    }

    // Reset system
    document.getElementById('resetSystemBtn').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    });

    renderToday();
});
