// ============================================================================
//  HUD — Raum-Info, Aktions-Buttons, Sanity-Bar
//  Stellt bereit: updateHud(), rcUpdateRoomHud(), rcInteract()
//  Benötigt: G (state.js), rcGetRoomAt (map.js)
// ============================================================================

var _rcSanityEl  = null;
var _rcRoomInfo  = null;
var _rcRoomBtns  = null;

/**
 * HUD pro Frame aktualisieren: Sanity aus G.wahnsinn.
 */
function updateHud(time) {
  if (!_rcSanityEl) _rcSanityEl = document.getElementById('rc-sanity-bar');
  if (_rcSanityEl) {
    var san = typeof G !== 'undefined' ? Math.floor(G.wahnsinn) : 0;
    var filled = Math.round(san / 10);
    var bar = '';
    for (var i = 0; i < 10; i++) bar += i < filled ? '█' : '░';
    _rcSanityEl.textContent = 'WAHNSINN ' + bar + ' ' + san + '%';

    // Farbwechsel bei hohem Wahnsinn
    if (san > 60) {
      _rcSanityEl.style.color = '#ef4444';
      _rcSanityEl.style.textShadow = '0 0 6px rgba(239,68,68,0.6)';
    } else if (san > 30) {
      _rcSanityEl.style.color = '#f59e0b';
      _rcSanityEl.style.textShadow = '0 0 6px rgba(245,158,11,0.4)';
    } else {
      _rcSanityEl.style.color = '#7c3aed';
      _rcSanityEl.style.textShadow = '0 0 6px rgba(124,58,237,0.4)';
    }
  }
}

/**
 * Raum-Info und Aktions-Buttons im Raycaster-HUD aktualisieren.
 * Wird aufgerufen wenn sich der Raum ändert oder nach Aktionen.
 */
function rcUpdateRoomHud() {
  if (!_rcRoomInfo) _rcRoomInfo = document.getElementById('rc-room-info');
  if (!_rcRoomBtns) _rcRoomBtns = document.getElementById('rc-room-btns');
  if (!_rcRoomInfo || !_rcRoomBtns) return;
  if (!G.map) return;

  var m   = G.map;
  var pr  = m.pr, pc = m.pc;
  var room = m.grid[pr][pc];
  if (!room) { _rcRoomInfo.textContent = ''; _rcRoomBtns.innerHTML = ''; return; }

  // Raumbeschreibung
  var desc = '';
  switch(room.content) {
    case 'start':    desc = 'eingang — der weg zurück.'; break;
    case 'artifact': desc = room.cleared ? 'die stelle ist leer.' : 'ein glitzern. das artefakt.'; break;
    case 'stairs':   desc = 'eine treppe. tiefer.'; break;
    case 'loot':     desc = room.looted ? 'ausgeraubt.' : 'reste. verwertbares.'; break;
    case 'enemy':    desc = room.cleared ? 'stille.' : 'bewegung. gefahr.'; break;
    case 'mushroom':      desc = room.cleared ? 'pilze gesichert.' : 'biolumineszente pilze.'; break;
    case 'wasserleitung': desc = room.cleared ? 'leitung repariert.' : 'wasserleitung. reparierbar.'; break;
    case 'schlafkammer':  desc = room.cleared ? 'kammer gesichert.' : 'feldbetten. erholung.'; break;
    case 'funkkabine':    desc = room.cleared ? 'funk aktiv.' : 'ein funktisch. blinkt noch.'; break;
    case 'waffenlager':   desc = room.cleared ? 'lager gesichert.' : 'schwere ausrüstung.'; break;
    case 'rückblick':     desc = room.cleared ? 'der spiegel schweigt.' : 'ein spiegel der nicht spiegelt.'; break;
    case 'survivor': {
      var sdef = (typeof SURVIVOR_DEFS !== 'undefined') ? SURVIVOR_DEFS[room.survivorType] : null;
      desc = room.cleared ? (sdef ? sdef.name + ' ist in der basis.' : 'leer.') : 'jemand versteckt sich.';
      break;
    }
    case 'empty':
      desc = (typeof EMPTY_FLAVORS !== 'undefined')
        ? EMPTY_FLAVORS[Math.abs(pr * 7 + pc * 3 + G.floor) % EMPTY_FLAVORS.length]
        : 'leerer raum.';
      break;
    default: desc = ''; break;
  }
  _rcRoomInfo.textContent = desc;

  // Aktions-Buttons
  var h = '';
  if (room.content === 'artifact' && !room.cleared) {
    h += '<button class="rc-btn rc-know" onclick="takeArtifact(' + pr + ',' + pc + ')">[ aufheben ]</button>';
  }
  if (room.content === 'stairs') {
    h += '<button class="rc-btn" onclick="descendFloor()">[ hinabsteigen ]</button>';
  }
  if (room.content === 'start') {
    h += '<button class="rc-btn" onclick="returnToBase()">[ zur basis ]</button>';
  }
  if (room.content === 'loot' && !room.looted) {
    h += '<button class="rc-btn rc-amb" onclick="lootRoom(' + pr + ',' + pc + ')">[ durchsuchen ]</button>';
  }
  if (room.content === 'enemy' && !room.cleared) {
    h += '<button class="rc-btn rc-red" onclick="fightRoom(' + pr + ',' + pc + ')">[ kampf ]</button>';
  }
  if (room.content === 'mushroom' && !room.cleared) {
    h += '<button class="rc-btn rc-amb" onclick="claimPilzraum(' + pr + ',' + pc + ')">[ pilze sichern ]</button>';
  }
  if (room.content === 'wasserleitung' && !room.cleared) {
    h += '<button class="rc-btn" onclick="claimBaseRoom(' + pr + ',' + pc + ',\'wasserleitung\')">[ leitung reparieren ]</button>';
  }
  if (room.content === 'schlafkammer' && !room.cleared) {
    h += '<button class="rc-btn" onclick="claimBaseRoom(' + pr + ',' + pc + ',\'schlafkammer\')">[ kammer sichern ]</button>';
  }
  if (room.content === 'funkkabine' && !room.cleared) {
    h += '<button class="rc-btn rc-know" onclick="claimBaseRoom(' + pr + ',' + pc + ',\'funkkabine\')">[ funk aktivieren ]</button>';
  }
  if (room.content === 'waffenlager' && !room.cleared) {
    h += '<button class="rc-btn" onclick="claimBaseRoom(' + pr + ',' + pc + ',\'waffenlager\')">[ lager sichern ]</button>';
  }
  if (room.content === 'survivor' && !room.cleared) {
    h += '<button class="rc-btn rc-know" onclick="claimSurvivor(' + pr + ',' + pc + ')">[ ansprechen ]</button>';
  }
  if (room.content === 'start' && G.leuchtsporen > 0) {
    h += '<button class="rc-btn rc-amb" onclick="useLeuchtsporen()">[ leuchtsporen ×' + G.leuchtsporen + ' ]</button>';
  }

  _rcRoomBtns.innerHTML = h;
}

/**
 * Interact-Taste (Space/Enter): Primäre Aktion des aktuellen Raums.
 */
function rcInteract() {
  if (!G.map) return;
  var m = G.map;
  var room = m.grid[m.pr][m.pc];
  if (!room) return;

  if (room.content === 'artifact' && !room.cleared)       { takeArtifact(m.pr, m.pc); return; }
  if (room.content === 'stairs')                           { descendFloor(); return; }
  if (room.content === 'start')                            { returnToBase(); return; }
  if (room.content === 'loot' && !room.looted)             { lootRoom(m.pr, m.pc); return; }
  if (room.content === 'enemy' && !room.cleared)           { fightRoom(m.pr, m.pc); return; }
  if (room.content === 'mushroom' && !room.cleared)        { claimPilzraum(m.pr, m.pc); return; }
  if (room.content === 'wasserleitung' && !room.cleared)   { claimBaseRoom(m.pr, m.pc, 'wasserleitung'); return; }
  if (room.content === 'schlafkammer' && !room.cleared)    { claimBaseRoom(m.pr, m.pc, 'schlafkammer'); return; }
  if (room.content === 'funkkabine' && !room.cleared)      { claimBaseRoom(m.pr, m.pc, 'funkkabine'); return; }
  if (room.content === 'waffenlager' && !room.cleared)     { claimBaseRoom(m.pr, m.pc, 'waffenlager'); return; }
  if (room.content === 'survivor' && !room.cleared)        { claimSurvivor(m.pr, m.pc); return; }
}
