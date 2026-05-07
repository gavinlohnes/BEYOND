/**
 * BEYOND-OS // UNIFIED HUD ENGINE
 */

const HUD_UI = {
  Stat: ({ label, value, status = '' }) => `
    <div class="hud-stat">
      <span class="hud-label">${label}</span>
      <span class="hud-value ${status}">${value}</span>
    </div>
  `,

  StatGrid: (stats, marginTop = 'mt-5') => `
    <div class="hud-grid ${marginTop}">
      ${stats.map(s => HUD_UI.Stat(s)).join('')}
    </div>
  `,

  ExerciseCard: ({ name, sets, last, target, rest }) => `
    <div class="hud-card-item">
      <div class="panel-header">
        <div>
          <div class="hud-label-xs">Exercise</div>
          <div class="panel-title-sm">${name}</div>
        </div>
        <span class="badge-outline">${sets} Sets</span>
      </div>
      <div class="divider"></div>
      ${HUD_UI.StatGrid([
        { label: 'Last', value: last },
        { label: 'Target', value: target, status: 'text-cyan' },
        { label: 'Rest', value: `${rest}s` }
      ], 'mt-4')}
    </div>
  `,

  Panel: ({ subtitle, title, action, content }) => `
    <section class="panel animate-fade-up">
      <div class="panel-header">
        <div>
          <p class="panel-subtitle">${subtitle}</p>
          <h2 class="panel-title">${title}</h2>
        </div>
        ${action ? `<button class="btn btn-${action.variant} ${action.animate || ''}">${action.label}</button>` : ''}
      </div>
      <div class="divider"></div>
      ${content}
    </section>
  `,

  Render: (data) => `
    <div class="screen-stack animate-stagger">
      
      ${HUD_UI.Panel({
        subtitle: "BEYOND-OS // ACTIVE SESSION",
        title: "Operator HUD",
        action: { label: "Sync", variant: "primary" },
        content: HUD_UI.StatGrid(data.sessionStats)
      })}

      ${HUD_UI.Panel({
        subtitle: "TODAY",
        title: data.workout.name,
        action: { label: "Begin", variant: "primary", animate: "animate-pulse-red" },
        content: `
          <div class="stack-v mt-5">
            ${data.workout.exercises.map(ex => HUD_UI.ExerciseCard(ex)).join('')}
          </div>
        `
      })}

      ${HUD_UI.Panel({
        subtitle: "SYSTEM",
        title: "Core Status",
        content: HUD_UI.StatGrid(data.systemStatus)
      })}

      <nav class="nav-tabs animate-fade-up">
        ${['HUD', 'Today', 'Fuel', 'Meals', 'Prep'].map(t => `
          <button class="nav-tab ${t === 'HUD' ? 'active' : ''}">${t}</button>
        `).join('')}
      </nav>

    </div>
  `
};

export default HUD_UI;
