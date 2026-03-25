'use strict';


// ================================================================
// ENTER LABYRINTH
// ================================================================
function enterLabyrinth() {
  G.phase = 'explore';
  G.map   = generateFloor(G.floor);
  G.artifactFound = false;

  document.getElementById('base-art').style.display      = 'none';
  document.getElementById('zeichen-section').style.display = 'none';
  document.getElementById('scene-desc').style.display    = 'none';
  document.getElementById('actions').style.display       = 'none';
  document.getElementById('craft-section').style.display = 'none';
  document.getElementById('map-wrap').style.display      = 'flex';

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
}

function returnToBase() {
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
    case 'empty':    desc = EMPTY_FLAVORS[Math.abs(pr*7+pc*3+G.floor) % EMPTY_FLAVORS.length]; break;
  }
  document.getElementById('room-desc').textContent = desc;
  document.getElementById('ft-roomtype').textContent = roomTypeName(room.content, room);

  renderMoveButtons();
}

function roomTypeName(content, room) {
  if (content==='enemy'&&!room.cleared)    return 'gefahr';
  if (content==='artifact'&&!room.cleared) return 'artefakt';
  if (content==='stairs')                  return 'treppe';
  if (content==='loot'&&!room.looted)      return 'lager';
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
  G.collectedArtifacts.push(artDef.id);

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


