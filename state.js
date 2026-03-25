'use strict';

// ================================================================
// HELPERS
// ================================================================
function canAfford(cost) {
  return Object.entries(cost).every(([r, v]) => (G.res[r] || 0) >= v);
}

function formatCost(cost, affordable) {
  const col = affordable ? 'var(--amber)' : 'var(--horror)';
  return Object.entries(cost)
    .map(([r, v]) => `<span style="color:${col}">${v} ${r.toUpperCase()}</span>`)
    .join(' + ');
}

// ================================================================
// GAME STATE
// ================================================================
const G = {
  phase: 'boot',
  res: { metall: 0, holz: 0, stoff: 0, nahrung: 0 },
  wahnsinn: 0,
  floor: 0,
  map: null,
  artifactFound: false,
  collectedArtifacts: [],
  fackelAktiv: false,
  eventCooldown: 0,
  buildings: {
    werkbank: {
      count:0, cost:{metall:10}, label:'Werkbank',
      desc:'werkzeuge. fertigung. überlebenschance.',
    },
    lagerfeuer: {
      count:0, cost:{holz:6, stoff:2}, label:'Lagerfeuer',
      desc:'rasten möglich. heilung über zeit.',
    },
  },
  craftItems: {
    fackel:      { built:0, maxBuild:1,  cost:{holz:3, stoff:2},
                   label:'Fackel', desc:'zeichen an den wänden erwachen',
                   effect:()=>{ G.fackelAktiv=true; log('die fackel brennt. etwas an den wänden verändert sich.','amber'); }},
    verband:     { built:0, maxBuild:99, cost:{stoff:3},
                   label:'Verband', desc:'HP +8 (sofort)',
                   effect:()=>{ const h=Math.min(G.player.maxHp-G.player.hp,8); G.player.hp+=h; log(`wunde verbunden. +${h} HP.`,'green'); }},
    notration:   { built:0, maxBuild:99, cost:{nahrung:4},
                   label:'Notration', desc:'HP +12, maxHP +2',
                   effect:()=>{ G.player.maxHp+=2; G.player.hp=Math.min(G.player.maxHp,G.player.hp+12); log('notration. körper stabilisiert. +12 HP, +2 maxHP.','green'); }},
    notklinge:   { built:0, maxBuild:3,  cost:{metall:6, holz:4},
                   label:'Notklinge', desc:'ATK +2',
                   effect:()=>{ G.player.atk+=2; if(!G.player.weapon) G.player.weapon='Notklinge'; G.unlockedExplore=true; log('notklinge. roh, aber effektiv. ATK +2.','green'); }},
    rohrklinge:  { built:0, maxBuild:1,  cost:{metall:8},
                   label:'Rohrklinge', desc:'ATK +3',
                   effect:()=>{ G.player.atk+=3; G.player.weapon='Rohrklinge'; G.unlockedExplore=true; }},
    schutzblech: { built:0, maxBuild:3,  cost:{metall:14},
                   label:'Schutzblech', desc:'DEF +2',
                   effect:()=>{ G.player.def+=2; }},
    flickenweste:{ built:0, maxBuild:1,  cost:{stoff:8, metall:5},
                   label:'Flickenweste', desc:'DEF +3, maxHP +5',
                   effect:()=>{ G.player.def+=3; G.player.maxHp+=5; G.player.hp+=5; log('flickenweste. etwas schutz ist besser als keiner. DEF +3, maxHP +5.','metal'); }},
    schweißlampe:{ built:0, maxBuild:1,  cost:{metall:20},
                   label:'Schweißlampe', desc:'ATK +2, DEF +1',
                   effect:()=>{ G.player.atk+=2; G.player.def+=1; }},
  },
  unlockedExplore: false,
  player: {hp:20, maxHp:20, atk:2, def:1, lvl:1, xp:0, xpNext:10, weapon:null},
  combat: null,
  eventPending: false,
  tick: 0, time: 0,
  unlocked: {},
};

// ================================================================
// TICK ENGINE
// ================================================================
let _engine = null;
function startEngine() {
  _engine = setInterval(tick, 500);
}

function tick() {
  G.tick++;
  G.time += 0.5;
  if (G.eventCooldown > 0) G.eventCooldown--;
  checkUnlocks();
  renderStats();
  updateFooter();
  if (G.wahnsinn >= 60 && Math.random() < 0.004) phantomLog();
}

function checkUnlocks() {
  const u = G.unlocked;

  if (!u.gather && G.time >= 8) {
    u.gather = true;
    log('du bist wach. die hände erinnern sich wie man trümmer durchsucht.', null);
    renderBaseActions();
  }
  if (!u.werkstatt && G.res.metall >= 10) {
    u.werkstatt = true;
    document.getElementById('craft-section').style.display = 'block';
    log('genug rohmaterial. man könnte etwas bauen.', 'metal');
    renderBuild();
  }
  if (!u.craft && G.buildings.werkbank.count > 0) {
    u.craft = true;
    document.getElementById('craft-title').style.display = 'block';
    log('werkbank aktiv. fertigung möglich.', 'metal');
    renderCraft();
  }
  if (!u.explore && G.unlockedExplore) {
    u.explore = true;
    log('— waffe gefertigt. das labyrinth wartet. —', 'green');
    renderBaseActions();
  }
  if (!u.stats && G.player.weapon) {
    u.stats = true;
    document.getElementById('stats-sec').style.display = 'block';
  }
  if (!u.holz && G.res.holz > 0) {
    u.holz = true;
    log('holz. brauchbar.', 'amber');
    renderCraft();
  }
  if (!u.stoff && G.res.stoff > 0) {
    u.stoff = true;
    log('stoff. verbände. mehr.', null);
    renderCraft();
  }
  if (!u.nahrung && G.res.nahrung > 0) {
    u.nahrung = true;
    log('nahrung. überleben verlängert.', null);
    renderCraft();
  }
  if (!u.lagerfeuer && G.buildings.lagerfeuer.count > 0) {
    u.lagerfeuer = true;
    log('lagerfeuer. wärme. die erste echte pause.', 'amber');
    renderBaseActions();
  }
  if (!u.zeichen && G.fackelAktiv) {
    u.zeichen = true;
    document.getElementById('zeichen-section').style.display = 'block';
    log('— die fackel wirft licht auf die wände. dort waren immer schon zeichen. —', 'amber');
  }
}

