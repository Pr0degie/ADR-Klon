'use strict';

// ================================================================
// JOURNAL
// ================================================================
function journalAdd(text) {
  const t = Math.floor(G.time);
  const ts = `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
  G.journal.unshift(`[${ts}] ${text}`);
  if (G.journal.length > 20) G.journal.pop();
}

// ================================================================
// DESCEND TO NEXT FLOOR
// ================================================================
function descendFloor() {
  G.floor++;
  log(`— abstieg: ebene ${G.floor+1} —`, 'green');
  journalAdd(`abstieg zu ebene ${G.floor+1}`);

  if (G.floor >= ARTIFACTS.length) {
    triggerEnding();
    return;
  }

  G.map = generateFloor(G.floor);
  G.artifactFound = false;

  // Spezielle Räume spawnen
  if (typeof spawnSpecialRooms === 'function') spawnSpecialRooms();
  if (typeof hasSurvivor === 'function' && hasSurvivor('kartograf')) {
    G.map.grid.forEach(row => row.forEach(cell => { if (cell) cell.visited = true; }));
  }

  document.getElementById('map-floor-num').textContent = G.floor+1;
  document.getElementById('floor-num').textContent     = G.floor+1;
  document.getElementById('ft-phase').textContent      = `ebene ${G.floor+1}`;

  const descent = [
    'es wird enger. die luft ändert sich.',
    'der boden aus dem material das kein gestein ist.',
    'du hörst das rauschen deines blutes sehr laut.',
    'ebene vier. die zahlen an den wänden enden hier.',
  ];
  log(descent[Math.min(G.floor-1, descent.length-1)], null);

  renderMapUI();
  renderRoomInfo();

  // Raycaster neustarten mit neuer Map
  if (typeof rcStop === 'function') rcStop();
  if (typeof rcStart === 'function') rcStart();
}

// ================================================================
// ARTIFACT EVENTS
// ================================================================
function showArtifactEvent(artDef, onDone) {
  G.eventPending = true;
  window._evCallback = onDone;
  window._evArtDef = artDef;

  if (!artDef.isFinal) {
    document.getElementById('ev-art').innerHTML = artDef.art(G.tick);
    document.getElementById('ev-title').textContent = artDef.name;
    document.getElementById('ev-body').textContent  = artDef.text;
    document.getElementById('ev-btns').innerHTML    =
      `<button class="btn know" onclick="closeArtifactEvent()">[ nehmen ]</button>`;
    document.getElementById('ev-ov').classList.add('on');
    log(`〔 RELIKT GEFUNDEN: ${artDef.name} 〕`, 'know');
  } else {
    document.getElementById('ev-ov').classList.remove('on');
    if (G.wahnsinn >= 90) triggerAltEnding();
    else triggerEnding();
  }
}

function closeArtifactEvent() {
  const artDef = window._evArtDef;
  document.getElementById('ev-ov').classList.remove('on');
  G.eventPending = false;

  G.wahnsinn = Math.min(100, G.wahnsinn + artDef.madness);
  if (artDef.madness > 0) log(`wahnsinn +${artDef.madness}%.`, 'know');

  // Fluch anwenden
  if (artDef.curse && !G.curses.find(c => c.type === artDef.curse)) {
    G.curses.push({ type: artDef.curse });
    const cd = CURSE_DEFS[artDef.curse];
    log(`fluch: ${cd.name}. ${cd.desc}`, 'red');
    journalAdd(`fluch erhalten: ${cd.name}`);
  }

  // Synergie-Prüfung
  for (const syn of SYNERGY_CHECKS) {
    if (G.unlocked['syn_' + syn.needs.join('')]) continue;
    if (!syn.needs.every(id => G.collectedArtifacts.includes(id))) continue;
    G.unlocked['syn_' + syn.needs.join('')] = true;
    syn.effect();
    log(`〔 SYNERGIE: ${syn.text} 〕`, 'know');
    journalAdd(`synergie: ${syn.needs.join(' + ')}`);
  }

  if (G.collectedArtifacts.length > 0) {
    document.getElementById('artifact-sec').style.display = 'block';
  }

  journalAdd(`relikt gefunden: ${artDef.name}`);
  if (window._evCallback) { window._evCallback(); window._evCallback = null; }
}

// ================================================================
// ENDING
// ================================================================
function triggerEnding() {
  G.wahnsinn = Math.min(100, G.wahnsinn + 40);
  setTimeout(() => {
    const endArt = `<span class="gk">  ▓▓▓╭───────────────────╮▓▓▓
▓▓╱  ╭─────────────╮  ╲▓▓
▓│  ╱   ◆◈◆◉◆◈◆   ╲  │▓
▓│ │   ◈ ◉ ◉ ◉ ◈   │ │▓
▓│ │   ◆◈◆◉◆◈◆     │ │▓
▓│  ╲               ╱  │▓
▓▓╲  ╰─────────────╯  ╱▓▓
  ▓▓▓╰───────────────────╯▓▓▓</span>`;

    document.getElementById('end-art').innerHTML = endArt;
    document.getElementById('end-title').textContent = 'VERSTANDEN';
    document.getElementById('end-body').innerHTML =
      `du hältst den kern. er enthält kein licht mehr.<br><br>
       in einem moment der dauert und nicht dauert,<br>
       verstehst du was du bist. was es ist.<br>
       es gibt keinen unterschied mehr zwischen dem,<br>
       was dich hierher geführt hat, und dem was wartet.<br><br>
       <span style="color:var(--know2);text-shadow:0 0 12px var(--know)">du bleibst unten.</span>`;

    document.getElementById('end-ov').classList.add('on');
    log('— ende —', 'know');
  }, 400);
}



function triggerAltEnding() {
  setTimeout(() => {
    const altArt = `<span style="color:var(--horror)">  ░░░╭───────────────────╮░░░
░░╱  ╭─────────────╮  ╲░░
░│  ╱   ҉ ҉ ҉ ҉ ҉   ╲  │░
░│ │   ҉ ◉ ◉ ◉ ҉   │ │░
░│ │   ҉ ҉ ҉ ҉ ҉     │ │░
░│  ╲               ╱  │░
░░╲  ╰─────────────╯  ╱░░
  ░░░╰───────────────────╯░░░</span>`;

    document.getElementById('end-art').innerHTML = altArt;
    document.getElementById('end-title').textContent = 'ANGEKOMMEN';
    document.getElementById('end-title').style.color = 'var(--horror)';
    document.getElementById('end-title').style.textShadow = '0 0 20px var(--red)';
    document.getElementById('end-body').innerHTML =
      `du hältst den kern. du bist der kern.<br><br>
       die flüche waren keine strafe.<br>
       sie waren eine einladung.<br><br>
       die anderen die hinabgestiegen sind<br>
       und nicht zurückgekehrt —<br>
       du kennst sie jetzt. sie kennen dich.<br><br>
       <span style="color:var(--horror);text-shadow:0 0 12px var(--red)">du bist das labyrinth geworden.</span>`;

    document.getElementById('end-ov').classList.add('on');
    log('— du bist angekommen —', 'red');
  }, 400);
}

// ================================================================
// CURSES RENDERING
// ================================================================
function renderCurses() {
  const sec = document.getElementById('curses-sec');
  if (!sec) return;
  if (G.curses.length === 0) { sec.style.display='none'; return; }
  sec.style.display = 'block';
  sec.innerHTML = `<div class="sdiv">// flüche</div>` +
    G.curses.map(c => {
      const def = CURSE_DEFS[c.type];
      return `<div style="font-size:10px;padding:2px 0;color:var(--red2)">
        <span style="opacity:.7">${def.sym}</span> ${def.name}
        <div style="font-size:9px;color:var(--dim)">${def.desc}</div>
      </div>`;
    }).join('');
}

// ================================================================
// STATS & RESOURCES RENDERING
// ================================================================
function renderStats() {
  const resConfig = [
    { key:'metall',  label:'METALL',  cls:'rv-metal' },
    { key:'holz',    label:'HOLZ',    cls:'rv-holz'  },
    { key:'stoff',   label:'STOFF',   cls:'rv-stoff' },
    { key:'nahrung', label:'NAHRUNG', cls:'rv-nahr'  },
  ];
  document.getElementById('res-list').innerHTML = resConfig
    .filter(r => r.key === 'metall' || G.unlocked[r.key])
    .map(r => `<div class="res">
      <span class="rn">${r.label}</span>
      <span class="rv ${r.cls}">${Math.floor(G.res[r.key] || 0)}</span>
    </div>`).join('');

  // Wahnsinn bar
  const wp = Math.floor(G.wahnsinn);
  document.getElementById('wahn-pct').textContent  = wp + '%';
  document.getElementById('wahn-fill').style.width = wp + '%';
  const wf = document.getElementById('wahn-fill');
  if (wp > 70) { wf.style.background='var(--red)'; wf.style.boxShadow='0 0 10px var(--red)'; }
  else if (wp > 40) { wf.style.background='var(--amber)'; wf.style.boxShadow='0 0 7px var(--amber)'; }
  else { wf.style.background='var(--know)'; wf.style.boxShadow='0 0 6px var(--know)'; }

  // Madness header indicator
  const mh = document.getElementById('mad-hdr');
  if (wp >= 30) {
    mh.textContent = `WAHNSINN ${wp}%`;
    mh.style.color = wp > 70 ? 'var(--red2)' : wp > 50 ? 'var(--amber)' : 'var(--know2)';
    mh.style.textShadow = wp > 70 ? '0 0 8px var(--red)' : '';
  }

  // Player stats
  if (G.unlocked.stats) {
    const p = G.player;
    document.getElementById('stats-list').innerHTML = `
      <div class="res"><span class="rn">LVL</span><span class="rv rv-white">${p.lvl}</span></div>
      <div class="res"><span class="rn">HP</span><span class="rv rv-green">${p.hp}/${p.maxHp}</span></div>
      <div class="res"><span class="rn">ATK</span><span class="rv rv-metal">${p.atk}</span></div>
      <div class="res"><span class="rn">DEF</span><span class="rv rv-metal">${p.def}</span></div>
      <div class="res"><span class="rn">WAFFE</span><span class="rv" style="font-size:10px;color:var(--amber)">${p.weapon||'—'}</span></div>`;
  }

  // Curses (inline in renderStats for live refresh)
  if (G.curses.length > 0) renderCurses();

  // Artifacts
  if (G.collectedArtifacts.length > 0) {
    document.getElementById('artifact-list').innerHTML =
      G.collectedArtifacts.map(id => {
        const a = ARTIFACTS.find(x=>x.id===id);
        return `<div class="art-entry"><span class="art-sym">${a.sym}</span> ${a.name}</div>`;
      }).join('');
  }
}

// ================================================================
// LOG
// ================================================================
const LOGD = [];
function log(msg, col) {
  const t   = Math.floor(G.time);
  const ts  = `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
  const cols = {green:'var(--green)', red:'var(--red2)', know:'var(--know2)',
                metal:'var(--metal)', amber:'var(--amber)'};
  const finalMsg = maybeScramble(msg);
  LOGD.unshift({msg:finalMsg, col:cols[col]||null, ts});
  if (LOGD.length > 80) LOGD.pop();
  document.getElementById('log').innerHTML = LOGD.map((e,i) => {
    const age = i===0?'':i<4?'a1':i<14?'a2':'a3';
    const sty = e.col ? `color:${e.col};` : '';
    return `<div class="le ${age}"><span class="lts">${e.ts}</span><span style="${sty}">${e.msg}</span></div>`;
  }).join('');
}

// ================================================================
// FOOTER
// ================================================================
function updateFooter() {
  const t = Math.floor(G.time);
  document.getElementById('ft-time').textContent =
    `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
  // Schicht-Anzeige: alle 5 Minuten eine neue Schicht
  const schicht = Math.floor(G.time / 300) + 1;
  const phase = ['○','◑','●','◕'][Math.floor(G.time / 75) % 4];
  const sd = document.getElementById('ft-shift');
  if (sd) { sd.textContent = `${phase} sch. ${schicht}`; }
  if (G.phase==='base') renderBaseArt();
}

// ================================================================
// BOOT SEQUENCE
// ================================================================
function boot() {
  renderBaseArt();
  renderStats();
  document.getElementById('actions').innerHTML =
    `<span style="color:var(--dim);font-size:11px">...</span>`;

  const seq = [
    [0,     ()=> log('dunkel.', null)],
    [700,   ()=> log('kalt.', null)],
    [1400,  ()=> log('knochen tun weh.', null)],
    [2200,  ()=> {
      document.getElementById('scene-desc').textContent =
        'forschungsanlage eos. ebene —. die anderen sind weg.';
      log('du bist allein. soweit du das beurteilen kannst.', null);
    }],
    [3200,  ()=> log('unter dir: labyrinthkorridore die keine karte hat.', null)],
    [4400,  ()=> {
      log('— etwas lebt hier —', 'red');
      log('es hat fünf teile von sich zurückgelassen. fünf relikte. fünf treppen nach unten.', null);
    }],
    [5600,  ()=> log('— du musst sie finden —', 'know')],
    [6400,  ()=> {
      log('überleben. erst überleben.', null);
      G.phase = 'base';
      document.getElementById('floor-num').textContent = '—';
      renderBaseActions();
      startEngine();
    }],
  ];
  seq.forEach(([d,fn]) => setTimeout(fn, d));
}

document.addEventListener('DOMContentLoaded', boot);
