'use strict';


// ================================================================
// ENTER LABYRINTH
// ================================================================
function enterLabyrinth() {
  G.phase = 'explore';
  G.map   = generateFloor(G.floor);
  G.artifactFound = G.floorsCleared.includes(G.floor);

  // Artefakt bereits genommen: Raumzustand wiederherstellen + Treppe setzen
  if (G.artifactFound) {
    const fm = G.map;
    fm.grid.forEach(row => row.forEach(cell => {
      if (cell && cell.content === 'artifact') cell.cleared = true;
    }));
    const dist = bfsDist(fm.pr, fm.pc,
      fm.grid.flatMap((row,r) => row.map((cell,c) => cell ? {r,c} : null).filter(Boolean)),
      fm.conns
    );
    let maxD=0, sr=fm.pr, sc=fm.pc;
    fm.grid.forEach((row,r) => row.forEach((cell,c) => {
      if (cell && !(r===fm.pr&&c===fm.pc)) {
        const d = dist[`${r},${c}`] ?? 0;
        if (d > maxD) { maxD=d; sr=r; sc=c; }
      }
    }));
    fm.grid[sr][sc].content = 'stairs';
    fm.grid[sr][sc].visited = true;
  }

  // Spezielle Räume pro Ebene spawnen
  spawnSpecialRooms();

  // Kartograf: Karte zu Beginn enthüllen
  if (hasSurvivor('kartograf')) {
    G.map.grid.forEach(row => row.forEach(cell => { if (cell) cell.visited = true; }));
  }

  document.getElementById('base-art').style.display        = 'none';
  document.getElementById('zeichen-section').style.display  = 'none';
  document.getElementById('scene-desc').style.display       = 'none';
  document.getElementById('actions').style.display          = 'none';
  document.getElementById('craft-section').style.display    = 'none';
  document.getElementById('pilzraum-sec').style.display     = 'none';
  document.getElementById('survivor-sec').style.display     = 'none';
  document.getElementById('map-wrap').style.display         = 'none';

  document.getElementById('map-floor-num').textContent = G.floor + 1;
  document.getElementById('floor-num').textContent     = G.floor + 1;
  document.getElementById('ft-phase').textContent      = `ebene ${G.floor+1}`;
  document.getElementById('ft-room').style.display     = '';

  log(`— betreten: ebene ${G.floor+1} —`, 'green');

  const first = [
    'die tür schließt sich hinter dir. das echo bleibt.',
    'der gang riecht nach ozon und etwas älterem.',
    'die decke ist tiefer als sie sein sollte.',
    'irgendwo tropft wasser. oder etwas das wie wasser klingt.',
  ];
  log(first[G.floor % first.length], null);

  renderMapUI();
  renderRoomInfo();

  // Raycaster starten (ersetzt die 2D-Karte)
  var rcCont = document.getElementById('rc-container');
  if (rcCont) {
    rcCont.style.display = 'flex';
    if (typeof rcStop === 'function') rcStop();
    if (typeof rcStart === 'function') rcStart();
  }
}

function returnToBase() {
  // Raycaster stoppen
  var rcCont = document.getElementById('rc-container');
  if (rcCont) {
    rcCont.style.display = 'none';
    if (typeof rcStop === 'function') rcStop();
  }

  G.phase = 'base';
  document.getElementById('base-art').style.display   = '';
  document.getElementById('scene-desc').style.display = '';
  document.getElementById('actions').style.display    = '';
  document.getElementById('map-wrap').style.display   = 'none';
  if (G.buildings.werkbank.count) {
    document.getElementById('craft-section').style.display = 'block';
  }
  if (G.fackelAktiv) {
    document.getElementById('zeichen-section').style.display = 'block';
  }
  if (G.pilzraum) {
    document.getElementById('pilzraum-sec').style.display = 'block';
    renderPilzraum();
  }
  if (G.survivors.length > 0) {
    document.getElementById('survivor-sec').style.display = 'block';
    renderSurvivors();
  }
  document.getElementById('ft-phase').textContent = 'basis';
  document.getElementById('ft-room').style.display = 'none';

  log('rückkehr zur basis.', null);
  renderBaseArt();
  renderBaseActions();
  renderBuild();
  renderCraft();
}

// ================================================================
// MAP UI
// ================================================================
function renderMapUI() {
  document.getElementById('map-grid').innerHTML = renderMap();
}

function renderRoomInfo() {
  const m = G.map; if (!m) return;
  const {grid, pr, pc} = m;
  const room = grid[pr][pc];

  let desc = '';
  switch(room.content) {
    case 'start':    desc = 'eingang. du weißt den weg zurück.'; break;
    case 'artifact': desc = room.cleared ? 'eine leere stelle. das relikt ist weg.' : `ein glitzern. das artefakt.`; break;
    case 'stairs':   desc = 'eine treppe nach unten. tiefer als du warst.'; break;
    case 'loot':     desc = room.looted ? 'ausgeraubt.' : 'reste. verwertbares metall.'; break;
    case 'enemy':    desc = room.cleared ? 'stille nach dem kampf.' : 'bewegung. etwas lebt hier.'; break;
    case 'mushroom':      desc = room.cleared ? 'die pilze wurden gesichert. sie wachsen jetzt in deiner basis.' : 'der raum ist von pilzen überwachsen. biolumineszent. feucht. lebendig.'; break;
    case 'wasserleitung': desc = room.cleared ? 'die leitung wurde repariert. wasser fließt zurück zur basis.' : 'eine aufgebrochene wasserleitung. noch intakt. reparierbar.'; break;
    case 'schlafkammer':  desc = room.cleared ? 'die schlafkammer ist gesichert. erholung verbessert.' : 'feldbetten. decken. irgendwer hat hier lange geschlafen.'; break;
    case 'funkkabine':    desc = room.cleared ? 'die funkkabine empfängt signale. manche sind echt.' : 'ein funktisch. eine antenne. die leuchte blinkt noch.'; break;
    case 'waffenlager':   desc = room.cleared ? 'das waffenlager ist gesichert. erweiterte fertigung möglich.' : 'verschlossene schränke. schwerere ausrüstung. noch nutzbar.'; break;
    case 'rückblick':     desc = room.cleared ? 'der weg nach innen.' : 'ein spiegel der nicht spiegelt. erinnerungen an der wand.'; break;
    case 'survivor': {
      const sdef = SURVIVOR_DEFS[room.survivorType] || {};
      desc = room.cleared ? `${sdef.name||'unbekannt'} ist jetzt in der basis.` : `jemand versteckt sich hier. ${sdef.role ? sdef.role+'.' : ''}`;
      break;
    }
    case 'empty':    desc = EMPTY_FLAVORS[Math.abs(pr*7+pc*3+G.floor) % EMPTY_FLAVORS.length]; break;
  }
  document.getElementById('room-desc').textContent = desc;
  document.getElementById('ft-roomtype').textContent = roomTypeName(room.content, room);

  renderMoveButtons();

  // Raycaster-HUD synchronisieren
  if (typeof rcBuildSprites === 'function') rcBuildSprites();
  if (typeof rcUpdateRoomHud === 'function') rcUpdateRoomHud();
}

function roomTypeName(content, room) {
  if (content==='enemy'&&!room.cleared)    return 'gefahr';
  if (content==='artifact'&&!room.cleared) return 'artefakt';
  if (content==='stairs')                  return 'treppe';
  if (content==='loot'&&!room.looted)      return 'lager';
  if (content==='mushroom'    &&!room.cleared) return 'pilzkammer';
  if (content==='wasserleitung'&&!room.cleared) return 'wasserleitung';
  if (content==='schlafkammer'&&!room.cleared) return 'schlafkammer';
  if (content==='funkkabine'  &&!room.cleared) return 'funkkabine';
  if (content==='waffenlager' &&!room.cleared) return 'waffenlager';
  if (content==='rückblick'   &&!room.cleared) return 'rückblick';
  if (content==='survivor'    &&!room.cleared) return (SURVIVOR_DEFS[room.survivorType]?.name||'überlebender').toLowerCase();
  return content || '?';
}

function renderMoveButtons() {
  const m = G.map; if (!m) return;
  const {grid, conns, pr, pc, W, H} = m;
  const btns = document.getElementById('move-btns');

  const DIR = [{dr:-1,dc:0,lbl:'↑ norden'},{dr:1,dc:0,lbl:'↓ süden'},
               {dr:0,dc:-1,lbl:'← westen'},{dr:0,dc:1,lbl:'→ osten'}];

  let h = '';
  for (const {dr,dc,lbl} of DIR) {
    const nr = pr+dr, nc = pc+dc;
    if (nr>=0&&nr<H&&nc>=0&&nc<W && grid[nr][nc] && hasConn(conns,pr,pc,nr,nc)) {
      const target = grid[nr][nc];
      let cls = '';
      if (target.content==='enemy'&&!target.cleared) cls='red';
      else if (target.content==='artifact'&&!target.cleared) cls='know';
      h += `<button class="btn ${cls}" onclick="movePlayer(${nr},${nc})">${lbl}</button>`;
    }
  }

  const cur = grid[pr][pc];
  if (cur.content==='artifact' && !cur.cleared) {
    h += `<button class="btn know" onclick="takeArtifact(${pr},${pc})">[ aufheben ]</button>`;
  }
  if (cur.content==='stairs') {
    h += `<button class="btn" onclick="descendFloor()">[ hinabsteigen ]</button>`;
  }
  if (cur.content==='start') {
    h += `<button class="btn" onclick="returnToBase()">[ zur basis ]</button>`;
  }
  if (cur.content==='loot' && !cur.looted) {
    h += `<button class="btn amb" onclick="lootRoom(${pr},${pc})">[ durchsuchen ]</button>`;
  }
  if (cur.content==='enemy' && !cur.cleared) {
    h += `<button class="btn red" onclick="fightRoom(${pr},${pc})">[ kampf ]</button>`;
  }
  if (cur.content==='mushroom'     && !cur.cleared) h += `<button class="btn amb" onclick="claimPilzraum(${pr},${pc})">[ pilze sichern ]</button>`;
  if (cur.content==='wasserleitung'&& !cur.cleared) h += `<button class="btn" onclick="claimBaseRoom(${pr},${pc},'wasserleitung')">[ leitung reparieren ]</button>`;
  if (cur.content==='schlafkammer' && !cur.cleared) h += `<button class="btn" onclick="claimBaseRoom(${pr},${pc},'schlafkammer')">[ kammer sichern ]</button>`;
  if (cur.content==='funkkabine'   && !cur.cleared) h += `<button class="btn know" onclick="claimBaseRoom(${pr},${pc},'funkkabine')">[ funk aktivieren ]</button>`;
  if (cur.content==='waffenlager'  && !cur.cleared) h += `<button class="btn" onclick="claimBaseRoom(${pr},${pc},'waffenlager')">[ lager sichern ]</button>`;
  if (cur.content==='survivor'     && !cur.cleared) h += `<button class="btn know" onclick="claimSurvivor(${pr},${pc})">[ ansprechen ]</button>`;
  if (cur.content==='start' && G.leuchtsporen > 0) h += `<button class="btn amb" onclick="useLeuchtsporen()">[ leuchtsporen einsetzen ×${G.leuchtsporen} ]</button>`;

  btns.innerHTML = h;
}

function movePlayer(r, c) {
  const m = G.map; if (!m) return;
  m.pr = r; m.pc = c;
  const room = m.grid[r][c];

  if (!room.visited) {
    room.visited = true;
    if (room.content === 'enemy' && !room.cleared) {
      renderMapUI();
      renderRoomInfo();
      setTimeout(() => fightRoom(r,c), 200);
      return;
    }
    if (room.content === 'rückblick' && !room.cleared) {
      renderMapUI();
      renderRoomInfo();
      setTimeout(() => showRückblick(r,c), 300);
      return;
    }
  }

  renderMapUI();
  renderRoomInfo();
}

function lootRoom(r, c) {
  const room = G.map.grid[r][c];
  if (room.looted) return;
  room.looted = true;
  const amt = 4 + G.floor * 2 + Math.floor(Math.random() * 5);
  G.res.metall = Math.min(G.res.metall + amt, 200);
  let extra = '';
  if (G.floor >= 1 && Math.random() < 0.4) {
    const h = 1 + Math.floor(Math.random()*3);
    G.res.holz = Math.min(G.res.holz + h, 200);
    extra += `, ${h} holz`;
  }
  if (G.floor >= 1 && Math.random() < 0.3) {
    const s = 1 + Math.floor(Math.random()*2);
    G.res.stoff = Math.min(G.res.stoff + s, 200);
    extra += `, ${s} stoff`;
  }
  log(`${amt} metall geborgen${extra}.`, 'metal');
  renderMapUI(); renderRoomInfo(); renderStats();
}

function takeArtifact(r, c) {
  const room    = G.map.grid[r][c]; if (room.cleared) return;
  const artDef  = ARTIFACTS[G.floor];
  room.cleared  = true;
  G.artifactFound = true;
  if (!G.collectedArtifacts.includes(artDef.id)) G.collectedArtifacts.push(artDef.id);
  if (!G.floorsCleared.includes(G.floor)) G.floorsCleared.push(G.floor);

  showArtifactEvent(artDef, () => {
    const m = G.map;
    const sr = m.grid.findIndex(row => row.some(c => c?.content === 'start'));
    if (sr >= 0) {
      const sc = m.grid[sr].findIndex(c => c?.content === 'start');
      const dists = bfsDist(r, c,
        m.grid.flatMap((row,ri)=>row.map((cell,ci)=>cell?{r:ri,c:ci}:null).filter(Boolean)),
        m.conns
      );
      let maxD=0, stairsR=sr, stairsC=sc;
      m.grid.forEach((row,ri)=>row.forEach((cell,ci)=>{
        if (cell && !(ri===r&&ci===c)) {
          const d = dists[`${ri},${ci}`]??0;
          if (d > maxD) {maxD=d; stairsR=ri; stairsC=ci;}
        }
      }));
      m.grid[stairsR][stairsC].content = 'stairs';
      m.grid[stairsR][stairsC].visited = true;
    }
    renderMapUI();
    renderRoomInfo();
    renderStats();
  });
}

function fightRoom(r, c) {
  const room     = G.map.grid[r][c]; if (room.cleared) return;
  const tier     = Math.min(G.floor, ENEMY_TIERS.length-1);
  const pool     = ENEMY_TIERS[tier];
  const base     = pool[Math.floor(Math.random()*pool.length)];
  const scale    = 1 + G.floor * 0.15;
  const enemy    = {
    ...base,
    hp:    Math.floor(base.hp  * scale),
    maxHp: Math.floor(base.hp  * scale),
    atk:   Math.floor(base.atk * scale),
  };

  G.combat = { enemy, pturn:true, defending:false, roomR:r, roomC:c };
  document.getElementById('cbt-ov').classList.add('on');
  log(enemy.intro, 'red');
  updateCombatUI();
  setCombatMsg(enemy.intro, 'red');
}

function claimPilzraum(r, c) {
  const room = G.map.grid[r][c]; if (room.cleared) return;
  room.cleared = true;
  G.pilzraum = true;
  log('pilze gesichert. du weißt jetzt wie man sie kultiviert. sie werden in der basis gedeihen.', 'green');
  renderMapUI(); renderRoomInfo();
}

function claimBaseRoom(r, c, type) {
  const room = G.map.grid[r][c]; if (room.cleared) return;
  if (type === 'wasserleitung') {
    if (G.res.metall < 20) { log('wasserleitung: 20 metall benötigt.', 'red'); return; }
    G.res.metall -= 20;
    renderStats();
  }
  room.cleared = true;
  G.baseRooms[type] = true;
  const msgs = {
    wasserleitung: 'wasserleitung repariert. 20 metall verbraucht. sie fließt zurück zur basis.',
    schlafkammer:  'schlafkammer gesichert. erholung wird besser.',
    funkkabine:    'funk aktiviert. signale aus der tiefe werden empfangen.',
    waffenlager:   'waffenlager gesichert. der schmied kann mehr formen.',
  };
  log(msgs[type] || `${type} gesichert.`, 'green');
  journalAdd(`${type} gesichert`);
  renderMapUI(); renderRoomInfo();
}

function claimSurvivor(r, c) {
  const room = G.map.grid[r][c]; if (room.cleared) return;
  const type = room.survivorType;
  const def = SURVIVOR_DEFS[type];
  if (!def) return;
  const slots = getSurvivorSlots();
  if (G.survivors.length >= slots) {
    log(`kein platz für ${def.name}. unterkunft bauen und zurückkehren.`, 'red');
    return;
  }
  room.cleared = true;
  G.survivors.push({ type });
  if (type === 'wächter') G.player.def += 2;
  log(`${def.name} schließt sich an. ${def.desc}`, 'green');
  journalAdd(`${def.name} aufgenommen`);
  renderMapUI(); renderRoomInfo();
}

function showRückblick(r, c) {
  const room = G.map.grid[r][c]; if (room.cleared) return;
  room.cleared = true;
  G.unlocked.rückblick = true;
  const entries = G.journal.slice(0, 10)
    .map(j => `<div style="font-size:10px;color:var(--dim);margin:3px 0;border-bottom:1px solid var(--dim2);padding-bottom:3px">${j}</div>`)
    .join('') || `<div style="font-size:10px;color:var(--dim)">keine aufzeichnungen.</div>`;
  const stats = `<div style="font-size:9px;color:var(--dim);margin-top:8px">
    ebenen: ${G.floor+1} · relikte: ${G.collectedArtifacts.length} · wahnsinn: ${Math.floor(G.wahnsinn)}% · flüche: ${G.curses.length}
  </div>`;
  document.getElementById('ev-art').innerHTML = '';
  document.getElementById('ev-title').textContent = 'RÜCKBLICK';
  document.getElementById('ev-body').innerHTML = entries + stats;
  document.getElementById('ev-btns').innerHTML = `<button class="btn know" onclick="closeRückblick()">[ weitergehen ]</button>`;
  window._activeBaseEvent = null;
  G.eventPending = true;
  document.getElementById('ev-ov').classList.add('on');
  log('— rückblick —', 'know');
  renderMapUI(); renderRoomInfo();
}

function closeRückblick() {
  document.getElementById('ev-ov').classList.remove('on');
  G.eventPending = false;
}

function spawnSpecialRooms() {
  const specials = [
    { floor:0, key:'pilzraum',      check:()=>!G.pilzraum,                 content:'mushroom'      },
    { floor:1, key:'wasserleitung', check:()=>!G.baseRooms.wasserleitung,  content:'wasserleitung' },
    { floor:1, key:'surv_schmied',  check:()=>!hasSurvivor('schmied'),     content:'survivor', survivorType:'schmied'  },
    { floor:2, key:'schlafkammer',  check:()=>!G.baseRooms.schlafkammer,   content:'schlafkammer'  },
    { floor:2, key:'surv_heiler',   check:()=>!hasSurvivor('heiler'),      content:'survivor', survivorType:'heiler'   },
    { floor:3, key:'funkkabine',    check:()=>!G.baseRooms.funkkabine,     content:'funkkabine'    },
    { floor:3, key:'surv_wächter',  check:()=>!hasSurvivor('wächter'),     content:'survivor', survivorType:'wächter'  },
    { floor:4, key:'waffenlager',   check:()=>!G.baseRooms.waffenlager,    content:'waffenlager'   },
    { floor:4, key:'surv_kartograf',check:()=>!hasSurvivor('kartograf'),   content:'survivor', survivorType:'kartograf'},
    { floor:4, key:'rückblick',    check:()=>!G.unlocked.rückblick,       content:'rückblick'    },
  ];
  const m = G.map;
  for (const sp of specials) {
    if (sp.floor !== G.floor) continue;
    if (!sp.check()) continue;
    const candidates = [];
    m.grid.forEach((row, r) => row.forEach((cell, c) => {
      if (cell && (cell.content === 'loot' || cell.content === 'empty')) candidates.push({r, c});
    }));
    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      m.grid[pick.r][pick.c].content = sp.content;
      if (sp.survivorType) m.grid[pick.r][pick.c].survivorType = sp.survivorType;
      candidates.splice(candidates.indexOf(pick), 1);
    }
  }
}

function useLeuchtsporen() {
  if (G.leuchtsporen <= 0) return;
  G.leuchtsporen--;
  G.map.grid.forEach(row => row.forEach(cell => { if (cell) cell.visited = true; }));
  log('leuchtsporen freigesetzt. der gesamte grundriss ist sichtbar.', 'amber');
  renderBaseActions();
  renderMapUI(); renderRoomInfo();
}


