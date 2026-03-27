// ============================================================================
//  MAIN — Game Loop, Raum-Erkennung, Frame-Orchestrierung
//  Einstiegspunkt. Verbindet alle Module.
//
//  Stellt bereit: rcStart(), rcStop(), renderFrame(), rcSyncRoom()
//  Benötigt: alles andere (wird per Script-Reihenfolge garantiert)
// ============================================================================

var rcRunning     = false;
var _rcLastTime   = 0;
var _rcRafId      = null;
var _rcGridReady  = false;
var _rcCurrentRoom = null;  // {r, c} oder null — aktueller Spielraum

// Depth-Buffer (pro Spalte) — wird in renderFrame gefüllt, von renderSprites gelesen
var _rcDepthBuffer = [];

/**
 * Raum-Erkennung: Prüft ob der Spieler einen neuen Raum betreten hat.
 * Wenn ja → Spielzustand synchronisieren (movePlayer aufrufen).
 */
function rcSyncRoom() {
  if (!G.map) return;

  var room = rcGetRoomAt(rcPlayer.x, rcPlayer.y);
  if (!room) return;

  // Gleicher Raum wie vorher?
  if (_rcCurrentRoom && room.r === _rcCurrentRoom.r && room.c === _rcCurrentRoom.c) return;

  // Neuer Raum! Prüfen ob Verbindung existiert
  var m = G.map;
  if (_rcCurrentRoom) {
    // Nur erlauben wenn Verbindung (conn) zwischen altem und neuem Raum existiert
    var connected = hasConn(m.conns, _rcCurrentRoom.r, _rcCurrentRoom.c, room.r, room.c);
    // Oder Start-Raum (für initialen Spawn)
    if (!connected && !(room.r === m.pr && room.c === m.pc)) return;
  }

  _rcCurrentRoom = { r: room.r, c: room.c };

  // Spielzustand synchronisieren
  m.pr = room.r;
  m.pc = room.c;
  var gRoom = m.grid[room.r][room.c];

  if (!gRoom.visited) {
    gRoom.visited = true;

    // Gegner-Raum: Kampf auslösen
    if (gRoom.content === 'enemy' && !gRoom.cleared) {
      rcPaused = true;
      rcUpdateRoomHud();
      rcBuildSprites();
      if (typeof renderMapUI === 'function') renderMapUI();
      if (typeof renderRoomInfo === 'function') renderRoomInfo();
      setTimeout(function() {
        fightRoom(room.r, room.c);
      }, 200);
      return;
    }

    // Rückblick-Raum
    if (gRoom.content === 'rückblick' && !gRoom.cleared) {
      rcPaused = true;
      rcUpdateRoomHud();
      if (typeof renderMapUI === 'function') renderMapUI();
      if (typeof renderRoomInfo === 'function') renderRoomInfo();
      setTimeout(function() {
        showRückblick(room.r, room.c);
      }, 300);
      return;
    }
  }

  // UI aktualisieren
  rcUpdateRoomHud();
  rcBuildSprites();
  if (typeof renderMapUI === 'function') renderMapUI();
  if (typeof renderRoomInfo === 'function') renderRoomInfo();

  // Footer aktualisieren
  var ftRoom = document.getElementById('ft-roomtype');
  if (ftRoom && typeof roomTypeName === 'function') {
    ftRoom.textContent = roomTypeName(gRoom.content, gRoom);
  }
}

/**
 * Pause-Zustand prüfen: Kampf / Event-Overlay aktiv?
 */
function rcCheckPause() {
  if (typeof G === 'undefined') return;
  var cbtOv = document.getElementById('cbt-ov');
  var evOv  = document.getElementById('ev-ov');
  var endOv = document.getElementById('end-ov');

  var wasPaused = rcPaused;
  rcPaused = false;
  if (cbtOv && cbtOv.classList.contains('on')) rcPaused = true;
  if (evOv  && evOv.classList.contains('on'))  rcPaused = true;
  if (endOv && endOv.classList.contains('on')) rcPaused = true;

  // Wenn Pause gerade aufgehoben wurde → HUD + Sprites aktualisieren
  if (wasPaused && !rcPaused) {
    rcBuildSprites();
    rcUpdateRoomHud();
    // Focus zurück zum Container
    var cont = document.getElementById('rc-container');
    if (cont) cont.focus();
  }
}

/**
 * Einen kompletten Frame rendern.
 */
function renderFrame(time) {
  // Phase 1: Raycasting
  var rays = [];
  var wallHeights = [];
  _rcDepthBuffer = [];

  var col, angle, ray, corrected, wallH;
  for (col = 0; col < SCREEN_W; col++) {
    angle = rcPlayer.dir - FOV / 2 + (col / SCREEN_W) * FOV;
    ray = castRay(rcPlayer.x, rcPlayer.y, angle);
    corrected = ray.dist * Math.cos(angle - rcPlayer.dir);
    wallH = Math.min(SCREEN_H, Math.floor(SCREEN_H / (corrected + 0.0001)));

    rays[col] = {
      dist: ray.dist, side: ray.side, hit: ray.hit,
      wallType: ray.wallType, corrected: corrected, wallH: wallH
    };
    wallHeights[col] = ray.hit ? wallH : 0;
    _rcDepthBuffer[col] = ray.hit ? corrected : MAX_DEPTH;
  }

  // Phase 2: Pixel setzen (Decke / Wand / Boden)
  var r, wallTop, wallBottom, edge, inner;
  for (col = 0; col < SCREEN_W; col++) {
    r = rays[col];
    wallTop    = Math.floor((SCREEN_H - r.wallH) / 2);
    wallBottom = wallTop + r.wallH;
    edge  = r.hit && isEdge(wallHeights, col);
    inner = r.hit && isInnerEdge(wallHeights, col);

    for (var row = 0; row < SCREEN_H; row++) {
      if (row < wallTop) {
        var cs = ceilStyle(row);
        setCell(row, col, cs.ch, cs.color);
      } else if (row < wallBottom && r.hit) {
        if (inner) {
          var dc = r.wallType === 2 ? COLORS.eldVoid : COLORS.stoneVoid;
          setCell(row, col, '│', dc);
        } else if (edge && (row === wallTop || row === wallBottom - 1)) {
          var ec = r.wallType === 2 ? COLORS.edgeEld : COLORS.edgeBright;
          setCell(row, col, '─', ec);
        } else if (edge) {
          var ec2 = r.wallType === 2 ? COLORS.edgeEld : COLORS.edgeBright;
          setCell(row, col, '│', ec2);
        } else {
          var ws = wallStyle(r.corrected, r.side, r.wallType, time);
          setCell(row, col, ws.ch, ws.color);
        }
      } else {
        var fs = floorStyle(row);
        setCell(row, col, fs.ch, fs.color);
      }
    }
  }

  // Phase 3: Sprites rendern
  renderSprites(_rcDepthBuffer, time);

  // Phase 4: Overlays
  renderMinimap();
  updateHud(time);
}

// ============================================================================
//  GAME LOOP
// ============================================================================

function rcGameLoop(timestamp) {
  if (!rcRunning) return;
  var dt = Math.min((timestamp - _rcLastTime) / 1000, 0.05);
  _rcLastTime = timestamp;
  var time = timestamp / 1000;

  // Pause-Check (Kampf/Event-Overlay)
  rcCheckPause();

  updatePlayer(dt);

  // Raum-Erkennung
  if (!rcPaused) rcSyncRoom();

  renderFrame(time);

  _rcRafId = requestAnimationFrame(rcGameLoop);
}

/**
 * Raycaster starten — Map aus G.map generieren, Spieler positionieren.
 */
function rcStart() {
  if (rcRunning) return;

  // Map aus Spielzustand generieren
  if (typeof rcBuildMapFromGame === 'function') {
    rcBuildMapFromGame();
  }

  // Grid initialisieren (einmalig)
  if (!_rcGridReady) {
    rcInitGrid();
    _rcGridReady = true;
  }

  // Spielerposition: Zentrum des Start-Raums
  var m = G.map;
  if (m) {
    var startCenter = RC_ROOM_CENTERS[m.pr + ',' + m.pc];
    if (startCenter) {
      rcPlayer.x = startCenter.x;
      rcPlayer.y = startCenter.y;
    }
  }
  rcPlayer.dir = 0;
  if (typeof resetCthulhuPos === 'function') resetCthulhuPos();

  // Aktuellen Raum setzen
  _rcCurrentRoom = m ? { r: m.pr, c: m.pc } : null;

  rcPaused  = false;
  rcRunning = true;
  _rcLastTime = 0;

  // HUD initialisieren
  _rcSanityEl = null;
  _rcRoomInfo = null;
  _rcRoomBtns = null;
  rcUpdateRoomHud();

  if (typeof initFocus === 'function') initFocus();
  _rcRafId = requestAnimationFrame(rcGameLoop);
}

function rcStop() {
  rcRunning = false;
  _rcCurrentRoom = null;
  if (_rcRafId) { cancelAnimationFrame(_rcRafId); _rcRafId = null; }
}

/**
 * Teleportiert den Raycaster-Spieler zu einem bestimmten Raum.
 * Wird aufgerufen wenn das Spiel den Spieler bewegen muss
 * (z.B. nach Kampfende, Rückblick schließen etc.)
 */
function rcTeleportToRoom(r, c) {
  var center = RC_ROOM_CENTERS[r + ',' + c];
  if (center) {
    rcPlayer.x = center.x;
    rcPlayer.y = center.y;
  }
  _rcCurrentRoom = { r: r, c: c };
}
