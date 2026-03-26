// ============================================================================
//  MAIN — Game Loop & Frame-Orchestrierung
//  ─────────────────────────────────────────
//  Einstiegspunkt. Verbindet alle Module.
//  rcStart() / rcStop() steuern den Loop von außen.
//
//  Stellt bereit: rcStart(), rcStop(), renderFrame()
//  Benötigt: alles andere (wird per Script-Reihenfolge garantiert)
// ============================================================================

var rcRunning    = false;
var _rcLastTime  = 0;
var _rcRafId     = null;
var _rcGridReady = false;

/**
 * Einen kompletten Frame rendern.
 * 1. Raycasting für alle Spalten → Wandhöhen
 * 2. Zeilen füllen (Decke / Wand / Boden)
 * 3. Kanten hervorheben
 * 4. Minimap + HUD überlagern
 */
function renderFrame(time) {
  // ── Phase 1: Raycasting ──
  var rays = [];
  var wallHeights = [];

  for (var col = 0; col < SCREEN_W; col++) {
    var angle = rcPlayer.dir - FOV / 2 + (col / SCREEN_W) * FOV;
    var ray = castRay(rcPlayer.x, rcPlayer.y, angle);
    var corrected = ray.dist * Math.cos(angle - rcPlayer.dir);
    var wallH = Math.min(SCREEN_H, Math.floor(SCREEN_H / (corrected + 0.0001)));

    rays[col] = {
      dist: ray.dist, side: ray.side, hit: ray.hit,
      wallType: ray.wallType, corrected: corrected, wallH: wallH
    };
    wallHeights[col] = ray.hit ? wallH : 0;
  }

  // ── Phase 2: Pixel setzen ──
  for (var col = 0; col < SCREEN_W; col++) {
    var r = rays[col];
    var wallTop    = Math.floor((SCREEN_H - r.wallH) / 2);
    var wallBottom = wallTop + r.wallH;
    var edge = r.hit && isEdge(wallHeights, col);

    for (var row = 0; row < SCREEN_H; row++) {
      if (row < wallTop) {
        // ── Decke ──
        var cs = ceilStyle(row);
        setCell(row, col, cs.ch, cs.color);

      } else if (row < wallBottom && r.hit) {
        // ── Wand (mit Kanten-Hervorhebung) ──
        if (edge && (row === wallTop || row === wallBottom - 1)) {
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
        // ── Boden ──
        var fs = floorStyle(row);
        setCell(row, col, fs.ch, fs.color);
      }
    }
  }

  // ── Phase 3: Overlays ──
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

  updatePlayer(dt);
  renderFrame(time);

  _rcRafId = requestAnimationFrame(rcGameLoop);
}

/** Raycaster starten (einmalig Grid initialisieren, dann Loop) */
function rcStart() {
  if (rcRunning) return;
  if (!_rcGridReady) {
    rcInitGrid();
    _rcGridReady = true;
  }
  // Spielerposition zurücksetzen
  rcPlayer.x   = 1.5;
  rcPlayer.y   = 1.5;
  rcPlayer.dir = 0;
  rcRunning    = true;
  _rcLastTime  = 0;
  if (typeof initFocus === 'function') initFocus();
  _rcRafId = requestAnimationFrame(rcGameLoop);
}

/** Raycaster stoppen */
function rcStop() {
  rcRunning = false;
  if (_rcRafId) { cancelAnimationFrame(_rcRafId); _rcRafId = null; }
}
