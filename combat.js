'use strict';

// ================================================================
// COMBAT
// ================================================================
function updateCombatUI() {
  const c = G.combat; if (!c) return;
  const {enemy} = c;
  document.getElementById('cbt-art').innerHTML = enemy.art(G.tick);

  const pp = (G.player.hp/G.player.maxHp*100).toFixed(0);
  const ep = (enemy.hp/enemy.maxHp*100).toFixed(0);
  document.getElementById('bar-p').style.width = pp+'%';
  document.getElementById('bar-e').style.width = ep+'%';
  document.getElementById('txt-p').textContent = `${G.player.hp}/${G.player.maxHp}`;
  document.getElementById('txt-e').textContent = `${enemy.hp}/${enemy.maxHp}`;
  document.getElementById('hud-en').textContent = enemy.name;

  const btns = document.getElementById('cbt-btns');
  if (c.pturn && enemy.hp > 0 && G.player.hp > 0) {
    btns.innerHTML = `
      <button class="btn" onclick="cbtAct('attack')">[ angreifen ]</button>
      <button class="btn" onclick="cbtAct('defend')">[ ausweichen ]</button>
      <button class="btn know" onclick="cbtAct('analyse')">[ analysieren ]</button>
      <button class="btn red" onclick="cbtAct('flee')">[ fliehen ]</button>`;
  } else { btns.innerHTML = ''; }
}

function setCombatMsg(msg, col) {
  const cols = {red:'var(--red2)',green:'var(--green)',know:'var(--know2)',amber:'var(--amber)'};
  document.getElementById('cbt-msg').innerHTML =
    `<span style="color:${cols[col]||'var(--text)'}">${msg}</span>`;
}

function cbtAct(action) {
  const c = G.combat; if (!c || !c.pturn) return;
  const {enemy} = c;

  if (action==='flee') {
    log('rückzug. die dunkelheit schließt sich.', null);
    endCombat(false); return;
  }

  c.pturn = false;
  const madDebuff = G.wahnsinn > 70 ? Math.floor((G.wahnsinn-70)/15) : 0;

  if (action==='attack') {
    const dmg = Math.max(1, G.player.atk - madDebuff - enemy.def + Math.floor(Math.random()*3));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    setCombatMsg(`${dmg} schaden. ${enemy.hp > 0 ? enemy.name+' weicht zurück.' : ''}`, 'green');
  } else if (action==='defend') {
    c.defending = true;
    setCombatMsg('du deckst dich ab.', null);
  } else if (action==='analyse') {
    G.res.metall = Math.min(G.res.metall+1, 200);
    enemy.def = Math.max(0, enemy.def-1);
    setCombatMsg('schwäche erkannt. verteidigung sinkt.', 'know');
  }

  updateCombatUI();

  if (enemy.hp <= 0) {
    const lootParts = [];
    for (const [r,v] of Object.entries(enemy.loot)) {
      G.res[r] = Math.min((G.res[r]||0)+v, 200);
      lootParts.push(`${v} ${r}`);
    }
    G.player.xp += enemy.xp;
    checkLevelUp();
    setCombatMsg(`${enemy.name} aufgelöst. ${lootParts.join(', ')}.`, 'green');
    log(`${enemy.name} besiegt. ${lootParts.join(', ')}.`, 'metal');
    if (!G.unlocked.firstKill) { G.unlocked.firstKill=true; journalAdd(`erste entität besiegt: ${enemy.name}`); }
    setTimeout(()=>endCombat(true), 1800); return;
  }

  setTimeout(()=>{
    if (!G.combat) return;
    const def  = G.player.def + (c.defending?3:0);
    const eDmg = Math.max(0, enemy.atk - def + Math.floor(Math.random()*3));
    c.defending = false;
    G.player.hp = Math.max(0, G.player.hp - eDmg);

    if (G.player.hp <= 0) {
      G.player.hp = Math.ceil(G.player.maxHp * 0.3);
      G.wahnsinn  = Math.min(100, G.wahnsinn + 12);
      setCombatMsg('du verlierst das bewusstsein. du wachst auf. irgendwo.', 'red');
      log('niedergeschlagen. erinnerungsfragmente fehlen.', 'red');
      setTimeout(()=>endCombat(false), 1800); return;
    }

    setCombatMsg(`${enemy.name}: ${eDmg} schaden.`, 'red');
    c.pturn = true;
    updateCombatUI();
  }, 700);
}

function endCombat(won) {
  if (won && G.combat) {
    const {roomR, roomC} = G.combat;
    G.map.grid[roomR][roomC].cleared = true;
  }
  G.combat = null;
  document.getElementById('cbt-ov').classList.remove('on');
  renderMapUI();
  renderRoomInfo();
  renderStats();

  // Raycaster: Sprites neu bauen, HUD aktualisieren, Fokus zurück
  if (typeof rcBuildSprites === 'function') rcBuildSprites();
  if (typeof rcUpdateRoomHud === 'function') rcUpdateRoomHud();
  var rcCont = document.getElementById('rc-container');
  if (rcCont && rcCont.style.display !== 'none') rcCont.focus();
}

function checkLevelUp() {
  while (G.player.xp >= G.player.xpNext) {
    G.player.xp     -= G.player.xpNext;
    G.player.xpNext  = Math.floor(G.player.xpNext * 1.65);
    G.player.lvl++;
    G.player.maxHp += 5;
    G.player.hp     = G.player.maxHp;
    G.player.atk++;
    if (G.player.lvl%3===0) G.player.def++;
    log(`level ${G.player.lvl}. du bist stärker. oder abgestumpfter.`, 'green');
    journalAdd(`stufe ${G.player.lvl} erreicht`);
  }
}

