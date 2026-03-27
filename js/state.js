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

function hasSurvivor(type) {
  return G.survivors.some(s => s.type === type);
}

function getSurvivorSlots() {
  return Object.values(G.buildings).reduce((n, b) => n + (b.survivorSlots || 0) * b.count, 0);
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
  floorsCleared: [],
  fackelAktiv: false,
  eventCooldown: 0,
  survivors: [],
  baseRooms: { wasserleitung: false, schlafkammer: false, funkkabine: false, waffenlager: false },
  curses: [],
  curseCooldowns: {},
  leuchtsporen: 0,
  journal: [],
  wasserCooldown: 0,
  sammlerCooldown: 0,
  companionCooldown: 0,
  buildings: {
    werkbank: {
      count:0, cost:{holz:8, stoff:4}, label:'Werkbank', survivorSlots:0,
      desc:'werkzeuge. fertigung. überlebenschance.',
    },
    lagerfeuer: {
      count:0, cost:{holz:6, stoff:2}, label:'Lagerfeuer', survivorSlots:1,
      desc:'wärme. überlebende finden den weg. +1 unterkunft.',
    },
    unterkunft: {
      count:0, cost:{holz:12, stoff:6}, label:'Unterkunft', survivorSlots:2,
      desc:'platz für andere. +2 unterkunft.',
    },
  },
  craftItems: {
    holzknüppel:{ built:0, maxBuild:1,  cost:{holz:8},
                   label:'Holzknüppel', desc:'ATK +1. ein anfang.',
                   effect:()=>{ G.player.atk+=1; if(!G.player.weapon) G.player.weapon='Holzknüppel'; G.unlockedExplore=true; log('holzknüppel. roh. es reicht fürs erste.','green'); }},
    fackel:      { built:0, maxBuild:1,  cost:{holz:3, stoff:2},
                   label:'Fackel', desc:'licht ins dunkel bringen',
                   effect:()=>{ G.fackelAktiv=true; log('die fackel brennt. etwas an den wänden verändert sich.','amber'); }},
    verband:     { built:0, maxBuild:99, cost:{stoff:3},
                   label:'Verband', desc:'HP +8 (sofort)',
                   effect:()=>{ const h=Math.min(G.player.maxHp-G.player.hp,8); G.player.hp+=h; log(`wunde verbunden. +${h} HP.`,'green'); }},
    notration:   { built:0, maxBuild:99, cost:{nahrung:4},
                   label:'Notration', desc:'HP +12, maxHP +2',
                   effect:()=>{ G.player.maxHp+=2; G.player.hp=Math.min(G.player.maxHp,G.player.hp+12); log('notration. körper stabilisiert. +12 HP, +2 maxHP.','green'); }},
    sporentrank: { built:0, maxBuild:99, cost:{nahrung:5, stoff:2},
                   label:'Sporen-Trank', desc:'Wahnsinn −12%. Risiko.',
                   requiresBaseRoom:'pilzraum',
                   effect:()=>{ if(Math.random()<0.15){ G.player.hp=Math.max(1,G.player.hp-8); log('der trank wirkt falsch. −8 HP.','red'); } else { G.wahnsinn=Math.max(0,G.wahnsinn-12); G.player.hp=Math.min(G.player.maxHp,G.player.hp+5); const c=G.curses.shift(); const extra=c?` fluch "${CURSE_DEFS[c.type].name}" gelöst.`:''; log(`sporen-trank. klarheit kehrt zurück. wahnsinn −12%, +5 HP.${extra}`,'amber'); } }},
    myzelweste:  { built:0, maxBuild:1,  cost:{stoff:6, nahrung:4},
                   label:'Myzel-Weste', desc:'DEF +2, maxHP +8',
                   requiresBaseRoom:'pilzraum',
                   effect:()=>{ G.player.def+=2; G.player.maxHp+=8; G.player.hp+=8; log('myzel-weste. die fasern atmen. DEF +2, maxHP +8.','green'); }},
    notklinge:   { built:0, maxBuild:3,  cost:{metall:6, holz:4},
                   label:'Notklinge', desc:'ATK +2',
                   requiresSurvivor:'schmied',
                   effect:()=>{ G.player.atk+=2; if(!G.player.weapon||G.player.weapon==='Holzknüppel') G.player.weapon='Notklinge'; G.unlockedExplore=true; log('notklinge. roh, aber effektiv. ATK +2.','green'); }},
    rohrklinge:  { built:0, maxBuild:1,  cost:{metall:8},
                   label:'Rohrklinge', desc:'ATK +3',
                   requiresSurvivor:'schmied',
                   effect:()=>{ G.player.atk+=3; G.player.weapon='Rohrklinge'; G.unlockedExplore=true; }},
    schutzblech: { built:0, maxBuild:3,  cost:{metall:14},
                   label:'Schutzblech', desc:'DEF +2',
                   requiresSurvivor:'schmied',
                   effect:()=>{ G.player.def+=2; }},
    flickenweste:{ built:0, maxBuild:1,  cost:{stoff:8, metall:5},
                   label:'Flickenweste', desc:'DEF +3, maxHP +5',
                   requiresSurvivor:'schmied',
                   effect:()=>{ G.player.def+=3; G.player.maxHp+=5; G.player.hp+=5; log('flickenweste. etwas schutz ist besser als keiner. DEF +3, maxHP +5.','metal'); }},
    schweißlampe:{ built:0, maxBuild:1,  cost:{metall:20},
                   label:'Schweißlampe', desc:'ATK +2, DEF +1',
                   requiresSurvivor:'schmied',
                   effect:()=>{ G.player.atk+=2; G.player.def+=1; }},
    panzerplatte:{ built:0, maxBuild:1,  cost:{metall:18, stoff:5},
                   label:'Panzerplatte', desc:'DEF +4, maxHP +5',
                   requiresSurvivor:'schmied', requiresBaseRoom:'waffenlager',
                   effect:()=>{ G.player.def+=4; G.player.maxHp+=5; G.player.hp+=5; log('panzerplatte. schwer. solide. DEF +4, maxHP +5.','metal'); }},
    schwertstahl:{ built:0, maxBuild:1,  cost:{metall:15, holz:4},
                   label:'Schwertstahl', desc:'ATK +5',
                   requiresSurvivor:'schmied', requiresBaseRoom:'waffenlager',
                   effect:()=>{ G.player.atk+=5; G.player.weapon='Schwertstahl'; log('schwertstahl. die klinge hält.ATK +5.','green'); }},
  },
  pilzraum: false,
  pilzCooldown: 0,
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
  if (G.pilzCooldown > 0) G.pilzCooldown--;
  if (G.wasserCooldown > 0) G.wasserCooldown--;
  if (G.sammlerCooldown > 0) G.sammlerCooldown--;
  if (G.companionCooldown > 0) G.companionCooldown--;
  // Fluch-Effekte pro Tick
  for (const curse of G.curses) {
    const def = CURSE_DEFS[curse.type];
    if (!def || def.passive) continue;
    if (!G.curseCooldowns[curse.type]) G.curseCooldowns[curse.type] = 0;
    if (G.curseCooldowns[curse.type] > 0) { G.curseCooldowns[curse.type]--; continue; }
    G.curseCooldowns[curse.type] = def.tickInterval;
    def.effect();
  }
  checkUnlocks();
  renderStats();
  updateFooter();
  if (G.wahnsinn >= 60 && Math.random() < 0.004) phantomLog();
  // Sammler: passiv Ressourcen alle 30s
  if (G.phase === 'base' && hasSurvivor('sammler') && G.sammlerCooldown === 0) {
    G.sammlerCooldown = 60;
    const res = ['holz','stoff','nahrung'][Math.floor(Math.random()*3)];
    const amt = 1 + Math.floor(Math.random()*2);
    G.res[res] = Math.min(G.res[res] + amt, 200);
    if (Math.random() < 0.3) log(`sammler kehrt zurück. +${amt} ${res}.`, null);
  }
  // Wasserleitung: passiv nahrung + wahnsinn alle 25s
  if (G.phase === 'base' && G.baseRooms.wasserleitung && G.wasserCooldown === 0) {
    G.wasserCooldown = 50;
    G.res.nahrung = Math.min(G.res.nahrung + 2, 200);
  }
  // Pilze flüstern bei Wahnsinn 40+
  if (G.phase === 'base' && G.pilzraum && G.wahnsinn >= 40 && Math.random() < 0.003) {
    const msg = PILZ_WHISPERS[Math.floor(Math.random()*PILZ_WHISPERS.length)];
    const el = document.getElementById('log');
    const div = document.createElement('div');
    div.className = 'le';
    div.innerHTML = `<span class="lts">·· :</span><span style="color:var(--amber);font-size:11px;opacity:.5;font-style:italic">${msg}</span>`;
    el.insertBefore(div, el.firstChild);
  }
  if (G.phase === 'base' && G.pilzraum) renderPilzraum();
  // Companion-Dialoge
  if (G.phase === 'base' && G.survivors.length > 0) {
    if (G.companionCooldown === 0 && Math.random() < 0.003 * G.survivors.length) {
      G.companionCooldown = 240;
      const s = G.survivors[Math.floor(Math.random()*G.survivors.length)];
      const lines = COMPANION_LINES[s.type];
      if (lines) log(`${SURVIVOR_DEFS[s.type].name}: "${lines[Math.floor(Math.random()*lines.length)]}"`, null);
    }
  }
}

function checkUnlocks() {
  const u = G.unlocked;

  if (!u.gather && G.time >= 8) {
    u.gather = true;
    log('du bist wach. die hände erinnern sich wie man trümmer durchsucht.', null);
    renderBaseActions();
  }
  if (!u.werkstatt && G.res.holz >= 5) {
    u.werkstatt = true;
    document.getElementById('craft-section').style.display = 'block';
    log('genug holz. konstruktion ist möglich.', 'amber');
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
    log('— die fackel wirft licht auf die wände—', 'amber');
  }
  if (!u.curses && G.curses.length > 0) {
    u.curses = true;
    document.getElementById('curses-sec').style.display = 'block';
  }
  if (G.curses.length > 0) renderCurses();
  if (!u.pilzraum && G.pilzraum) {
    u.pilzraum = true;
    document.getElementById('pilzraum-sec').style.display = 'block';
    log('— die pilze etablieren sich in der basis. ernte möglich. —', 'green');
    renderPilzraum();
  }
  if (!u.survivors && G.survivors.length > 0) {
    u.survivors = true;
    document.getElementById('survivor-sec').style.display = 'block';
    renderSurvivors();
  }
  if (!u.schmied && hasSurvivor('schmied')) {
    u.schmied = true;
    log('— schmied aktiv. metallverarbeitung möglich. —', 'metal');
    renderCraft();
  }
  if (!u.waffenlager && G.baseRooms.waffenlager) {
    u.waffenlager = true;
    log('— waffenlager gesichert. erweiterte fertigung verfügbar. —', 'metal');
    renderCraft();
  }
  if (!u.funkkabine && G.baseRooms.funkkabine) {
    u.funkkabine = true;
    log('— funkkabine aktiv. signale aus der tiefe. —', 'know');
    renderBaseActions();
  }
  if (!u.schlafkammer && G.baseRooms.schlafkammer) {
    u.schlafkammer = true;
    log('— schlafkammer gesichert. erholung verbessert. —', 'green');
  }
  if (!u.wasserleitung && G.baseRooms.wasserleitung) {
    u.wasserleitung = true;
    log('— wasserleitung aktiv. kontinuierliche versorgung. —', 'green');
  }
}

