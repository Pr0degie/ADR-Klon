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
    h += `<button class="btn" ${canHeal ? '' : 'disabled'} onclick="doRest()">[ rasten ]</button>`;
  }
  if (G.baseRooms.funkkabine) {
    h += `<button class="btn know" onclick="doFunk()">[ funk durchsuchen ]</button>`;
  }
  if (G.leuchtsporen > 0) {
    h += `<button class="btn amb" style="font-size:9px" disabled>[ leuchtsporen ×${G.leuchtsporen} — im labor. verwenden ]</button>`;
  }
  if (G.unlockedExplore) {
    h += `<button class="btn" onclick="enterLabyrinth()">[ labyrinth betreten ]</button>`;
  }
  a.innerHTML = h || `<span style="color:var(--dim);font-size:11px">...</span>`;
}

function doSearch() {
  // Frühes Spiel: primär Holz/Stoff, Metall selten
  const roll = Math.random();
  let primary = '';
  if (roll < 0.42) {
    const h = 2 + Math.floor(Math.random() * 3);
    G.res.holz = Math.min(G.res.holz + h, 200);
    primary = `${h} holz`;
  } else if (roll < 0.72) {
    const s = 1 + Math.floor(Math.random() * 2);
    G.res.stoff = Math.min(G.res.stoff + s, 200);
    primary = `${s} stoff`;
  } else if (roll < 0.88) {
    const n = 1 + Math.floor(Math.random() * 2);
    G.res.nahrung = Math.min(G.res.nahrung + n, 200);
    primary = `${n} nahrung`;
  } else {
    // Metall: selten, aber vorhanden
    const m = 1 + Math.floor(Math.random() * 3);
    G.res.metall = Math.min(G.res.metall + m, 200);
    primary = `${m} metall`;
  }

  // Kleiner Sekundär-Drop
  let extra = '';
  if (Math.random() < 0.25) {
    const sec = ['holz','stoff','nahrung'][Math.floor(Math.random()*3)];
    G.res[sec] = Math.min(G.res[sec] + 1, 200);
    extra = `, 1 ${sec}`;
  }

  const msgs = [
    'balken und bretter. irgendwer hat hier gebaut.',
    'fetzen stoff. zu dunkel um die farbe zu erkennen.',
    'eine konservenbüchse. das etikett fehlt.',
    'trümmer. alles hat einen preis.',
    'jemand hat hier gelebt. ein rest davon.',
    'rohre. schrauben. ein rest von etwas das einmal funktioniert hat.',
    'unter dem schutt: holz. imprägniert und alt.',
    'das metall ist kalt. es war schon lange hier.',
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
  let heal = 5 + Math.floor(G.player.lvl * 1.5);
  if (G.baseRooms.schlafkammer) heal = Math.floor(heal * 1.5);
  if (hasSurvivor('heiler')) heal = Math.floor(heal * 1.4);
  G.player.hp = Math.min(G.player.maxHp, G.player.hp + heal);
  const bonusNote = (G.baseRooms.schlafkammer || hasSurvivor('heiler')) ? ' (verbessert)' : '';
  log(`rast. +${heal} HP${bonusNote}. (${G.player.hp}/${G.player.maxHp})`, 'green');
  renderStats();
  renderBaseActions();
}

// ================================================================
// SURVIVORS
// ================================================================
function renderSurvivors() {
  const sec = document.getElementById('survivor-sec');
  if (!sec) return;
  const slots = getSurvivorSlots();
  const free = slots - G.survivors.length;
  let html = `<div class="csec-title">// überlebende</div>`;
  html += `<div style="font-size:9px;color:var(--dim);margin-bottom:6px">unterkunft: ${G.survivors.length}/${slots} belegt</div>`;
  for (const s of G.survivors) {
    const def = SURVIVOR_DEFS[s.type];
    html += `<div style="font-size:10px;margin-bottom:4px;padding:4px 2px;border-bottom:1px solid var(--dim2)">
      <span style="color:var(--green)">${def.name}</span>
      <span style="font-size:9px;color:var(--dim)"> · ${def.role}</span><br>
      <span style="font-size:9px;color:var(--dim)">${def.desc}</span>
    </div>`;
  }
  if (free > 0) {
    html += `<div style="font-size:9px;color:var(--dim);font-style:italic">${free} platz frei. überlebende warten im labyrinth.</div>`;
  }
  sec.innerHTML = html;
}

function doFunk() {
  if (G.eventPending) return;
  const pool = FUNK_EVENTS.filter(e => !e.once || !G.unlocked['ev_' + e.id]);
  if (!pool.length) { log('keine signale. nur rauschen.', 'know'); return; }
  const ev = pool[Math.floor(Math.random() * pool.length)];
  G.eventCooldown = 8;
  fireBaseEvent(ev);
}

// ================================================================
// PILZKAMMER
// ================================================================
function renderPilzraum() {
  const sec = document.getElementById('pilzraum-sec');
  if (!sec || !G.pilzraum) return;
  const cd = G.pilzCooldown;
  const btn = cd > 0
    ? `<button class="btn" disabled style="color:var(--dim)">[ ernte — bereit in ${Math.ceil(cd/2)}s ]</button>`
    : `<button class="btn amb" onclick="harvestPilze()">[ pilze ernten ]</button>`;
  sec.innerHTML = `<div class="csec-title">// pilzkammer</div>
<div style="font-size:9px;color:var(--dim);margin-bottom:6px">die pilze wachsen langsam zurück. geduld.</div>
${btn}`;
}

function harvestPilze() {
  if (G.pilzCooldown > 0) return;
  G.pilzCooldown = 40; // 20 Sekunden
  const n = 3 + Math.floor(Math.random() * 3);
  G.res.nahrung = Math.min(G.res.nahrung + n, 200);
  let extra = '';
  if (Math.random() < 0.35) {
    const s = 1 + Math.floor(Math.random() * 2);
    G.res.stoff = Math.min(G.res.stoff + s, 200);
    extra += `, ${s} stoff`;
  }
  if (Math.random() < 0.2) {
    G.wahnsinn = Math.max(0, G.wahnsinn - 5);
    extra += ', wahnsinn −5%';
  }
  if (Math.random() < 0.08) {
    G.leuchtsporen++;
    extra += ', leuchtsporen ×1';
    renderBaseActions();
  }
  const msgs = [
    `pilze geerntet. +${n} nahrung${extra}. der geruch bleibt an dir.`,
    `du greifst in die schicht. +${n} nahrung${extra}. sie wachsen schneller als erwartet.`,
    `ernte. +${n} nahrung${extra}. etwas pulsiert wenn du die hand zurückziehst.`,
  ];
  log(msgs[Math.floor(Math.random() * msgs.length)], 'green');
  renderStats();
  renderPilzraum();
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
    if (key === 'lagerfeuer' && !G.buildings.werkbank.count) continue;
    if (key === 'unterkunft' && !G.buildings.lagerfeuer.count) continue;
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
    if (ci.requiresSurvivor && !hasSurvivor(ci.requiresSurvivor)) return '';
    if (ci.requiresBaseRoom === 'pilzraum' && !G.pilzraum) return '';
    if (ci.requiresBaseRoom === 'waffenlager' && !G.baseRooms.waffenlager) return '';
    const hasAny = Object.keys(ci.cost).some(r => (G.res[r] || 0) > 0);
    if (!hasAny) return '';
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
