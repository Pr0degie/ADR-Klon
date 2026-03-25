'use strict';

// ================================================================
// BASE PHASE VISUALS
// ================================================================
function stationArt(t) {
  const pp = ['─','═','─'][t%3];
  const ll = t%6<3 ? '█' : '▓';
  return `<span class="gd2">╔═══════════════════════════╗</span>
<span class="gd2">║  </span><span class="gg">${ll}</span><span class="gd2"> FORSCHUNGSANLAGE EOS  </span><span class="gg">${ll}</span><span class="gd2">  ║</span>
<span class="gd2">║  </span><span class="gm">╔${pp}${pp}${pp}╗  ┌────┐  ╔${pp}${pp}${pp}╗</span><span class="gd2">   ║</span>
<span class="gd2">║  </span><span class="gm">║   ║  │    │  ║   ║</span><span class="gd2">   ║</span>
<span class="gd2">║  </span><span class="gm">╚═══╝  └────┘  ╚═══╝</span><span class="gd2">   ║</span>
<span class="gd2">║  </span><span class="gd">· · · · · · · · · · ·</span><span class="gd2">  ║</span>
<span class="gd2">╚═══════════════════════════╝</span>`;
}

function renderBaseArt() {
  document.getElementById('base-art').innerHTML = stationArt(G.tick);
  if (G.fackelAktiv) renderZeichen();
}

function renderBaseActions() {
  const a = document.getElementById('actions');
  let h = '';
  if (G.unlocked.gather) {
    h += `<button class="btn" onclick="doSearch()">[ trümmer durchsuchen ]</button>`;
  }
  if (G.buildings.lagerfeuer.count > 0) {
    const canHeal = G.player.hp < G.player.maxHp;
    h += `<button class="btn${canHeal ? '' : ''}" ${canHeal ? '' : 'disabled'} onclick="doRest()">[ rasten ]</button>`;
  }
  if (G.unlockedExplore) {
    h += `<button class="btn" onclick="enterLabyrinth()">[ labyrinth betreten ]</button>`;
  }
  a.innerHTML = h || `<span style="color:var(--dim);font-size:11px">...</span>`;
}

function doSearch() {
  const base = 2 + G.player.lvl;
  const metAmt = base + Math.floor(Math.random() * 3);
  G.res.metall = Math.min(G.res.metall + metAmt, 200);

  // Secondary resource drops
  const roll = Math.random();
  let extra = '';
  if (roll < 0.30) {
    const h = 1 + Math.floor(Math.random() * 3);
    G.res.holz = Math.min(G.res.holz + h, 200);
    extra = `, ${h} holz`;
  } else if (roll < 0.52) {
    const s = 1 + Math.floor(Math.random() * 2);
    G.res.stoff = Math.min(G.res.stoff + s, 200);
    extra = `, ${s} stoff`;
  } else if (roll < 0.62) {
    const n = 1 + Math.floor(Math.random() * 2);
    G.res.nahrung = Math.min(G.res.nahrung + n, 200);
    extra = `, ${n} nahrung`;
  }

  const msgs = [
    'rohre. schrauben. ein rest von etwas das einmal funktioniert hat.',
    'armierungsstahl. verwertbar.',
    'jemand hat hier werkzeuge zurückgelassen.',
    'trümmer. alles hat einen preis.',
    'das metall ist kalt. es war schon lange hier.',
    'unter dem schutt: holz. imprägniert und alt.',
    'fetzen stoff. zu dunkel um die farbe zu erkennen.',
    'eine konservenbüchse. das etikett fehlt.',
  ];
  if (Math.random() < 0.4) log(msgs[Math.floor(Math.random()*msgs.length)], null);

  maybeBaseEvent();
  renderStats();
  renderBuild();
  renderCraft();
}

function doRest() {
  if (G.player.hp >= G.player.maxHp) {
    log('keine verletzungen. rast unnötig.', null); return;
  }
  const heal = 5 + Math.floor(G.player.lvl * 1.5);
  G.player.hp = Math.min(G.player.maxHp, G.player.hp + heal);
  log(`rast. +${heal} HP. (${G.player.hp}/${G.player.maxHp})`, 'green');
  renderStats();
  renderBaseActions();
}

// ================================================================
// BUILD & CRAFT
// ================================================================
function renderBuild() {
  let html = '';
  for (const [key, b] of Object.entries(G.buildings)) {
    if (b.count > 0) {
      html += `<span style="font-size:11px;color:var(--green)">✓ ${b.label}</span>`;
      continue;
    }
    // lagerfeuer only after werkbank
    if (key === 'lagerfeuer' && !G.buildings.werkbank.count) continue;
    const can = canAfford(b.cost);
    html += `<button class="btn ${can?'amb':''}" onclick="doBuild('${key}')"
      style="text-align:left;padding:7px 10px;line-height:1.7;width:165px">
      <div style="color:var(--amber);font-size:11px">${b.label}</div>
      <div style="font-size:9px;color:var(--dim);font-style:italic">${b.desc}</div>
      <div style="font-size:9px">${formatCost(b.cost, can)}</div>
    </button>`;
  }
  document.getElementById('build-list').innerHTML = html;
}

function doBuild(key) {
  const b = G.buildings[key];
  if (!canAfford(b.cost)) { log('ressourcen fehlen.','red'); return; }
  for (const [r,v] of Object.entries(b.cost)) G.res[r] -= v;
  b.count++;
  log(`${b.label} errichtet.`, 'metal');
  renderBuild();
  renderStats();
  checkUnlocks();
}

function renderCraft() {
  const list = document.getElementById('craft-list');
  if (!G.buildings.werkbank.count) { list.innerHTML = ''; return; }
  list.innerHTML = Object.entries(G.craftItems).map(([key, ci]) => {
    if (ci.built >= ci.maxBuild)
      return `<span style="font-size:11px;color:var(--dim)">✓ ${ci.label}</span>`;
    const can = canAfford(ci.cost);
    return `<button class="btn" onclick="doCraft('${key}')"
      style="text-align:left;padding:7px 10px;line-height:1.7;width:165px">
      <div style="color:var(--green);font-size:11px">${ci.label}</div>
      <div style="font-size:9px;color:var(--dim)">${ci.desc}</div>
      <div style="font-size:9px">${formatCost(ci.cost, can)}</div>
    </button>`;
  }).join('');
}

function doCraft(key) {
  const ci = G.craftItems[key];
  if (!G.buildings.werkbank.count) { log('werkbank benötigt.','red'); return; }
  if (!canAfford(ci.cost)) { log('ressourcen fehlen.','red'); return; }
  for (const [r,v] of Object.entries(ci.cost)) G.res[r] -= v;
  ci.built++;
  ci.effect();
  renderCraft();
  renderStats();
  checkUnlocks();
}

// ================================================================
// ZEICHEN (wall signs)
// ================================================================
function renderZeichen() {
  const el = document.getElementById('zeichen-display');
  const de = document.getElementById('zeichen-desc');
  if (!el) return;

  const wahn = G.wahnsinn;
  const tierIdx = wahn >= 80 ? 3 : wahn >= 60 ? 2 : wahn >= 30 ? 1 : 0;
  const set = ZEICHEN_SETS[tierIdx];
  const t = G.tick;

  // Two rows of 7 symbols, shifted by tick for animation
  const row1 = Array.from({length:7}, (_,i) => set.syms[(t + i*3)     % set.syms.length]);
  const row2 = Array.from({length:7}, (_,i) => set.syms[(t + i*3 + 9) % set.syms.length]);

  // At high madness, occasionally show a word fragment between rows
  let fragment = '';
  if (wahn >= 75 && t % 12 < 6) {
    const words = ['UNTEN','SIEH','WIRST','WEISST','BLEIB','HÖRST','DICH','KENNEN'];
    const w = words[(Math.floor(t / 12)) % words.length];
    fragment = `\n<span style="font-size:9px;letter-spacing:7px;color:var(--horror);opacity:.7">${w}</span>`;
  }

  el.innerHTML = `<span class="${set.cls}">${row1.join(' ')}\n${row2.join(' ')}${fragment}</span>`;

  if (de) {
    const descs = ZEICHEN_DESC[tierIdx];
    de.textContent = descs[Math.floor(t / 18) % descs.length];
  }
}

// ================================================================
// BASE EVENTS
// ================================================================
function maybeBaseEvent() {
  if (G.phase !== 'base') return;
  if (G.eventCooldown > 0) return;
  if (G.eventPending) return;
  if (Math.random() > 0.28) return;

  const pool = BASE_EVENTS.filter(e => !e.once || !G.unlocked['ev_' + e.id]);
  if (!pool.length) return;

  const ev = pool[Math.floor(Math.random() * pool.length)];
  G.eventCooldown = 12;
  fireBaseEvent(ev);
}

function fireBaseEvent(ev) {
  G.eventPending = true;
  if (ev.once) G.unlocked['ev_' + ev.id] = true;

  document.getElementById('ev-art').innerHTML    = ev.art || '';
  document.getElementById('ev-title').textContent = ev.title;
  document.getElementById('ev-body').textContent  = ev.body;
  document.getElementById('ev-btns').innerHTML =
    ev.choices.map((c, i) =>
      `<button class="btn ${c.cls||''}" onclick="resolveBaseEvent(${i})">${c.label}</button>`
    ).join('');

  window._activeBaseEvent = ev;
  document.getElementById('ev-ov').classList.add('on');
  log(`〔 ${ev.title} 〕`, ev.logCol || null);
}

function resolveBaseEvent(choiceIdx) {
  const ev = window._activeBaseEvent;
  if (!ev) return;
  const choice = ev.choices[choiceIdx];
  document.getElementById('ev-ov').classList.remove('on');
  G.eventPending = false;
  window._activeBaseEvent = null;
  const dynamic = choice.effect();
  log(dynamic || choice.outcome, choice.outcomeCol || null);
  renderStats();
  renderBaseActions();
}
