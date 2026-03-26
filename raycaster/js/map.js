// ============================================================================
//  MAP — Dynamisch aus G.map generiert
//  Stellt bereit: RC_MAP, RC_MAP_W, RC_MAP_H, rcIsWall(), rcGetCell(),
//                 rcBuildMapFromGame(), rcGetRoomAt(), RC_ROOM_CENTERS
//  Benötigt: RC_CELL (constants.js), G.map (state.js/map.js)
// ============================================================================

var RC_MAP      = [];
var RC_MAP_W    = 1;
var RC_MAP_H    = 1;
var RC_ROOM_CENTERS = {};   // "r,c" -> {x, y} Raycaster-Weltkoordinaten
var rcSprites   = [];       // [{x, y, ch, color, type}]

/**
 * Baut die Raycaster-Tilemap aus G.map.
 * Jeder Raum wird zu einem RC_CELL×RC_CELL Block, Korridore als 3 Tile breite Öffnungen.
 */
function rcBuildMapFromGame() {
  var m = G.map;
  if (!m) return;
  var gw = m.W, gh = m.H;

  RC_MAP_W = gw * RC_CELL + 1;
  RC_MAP_H = gh * RC_CELL + 1;
  RC_MAP = [];
  RC_ROOM_CENTERS = {};

  // Alles mit Steinwänden füllen
  var y, x;
  for (y = 0; y < RC_MAP_H; y++) {
    RC_MAP[y] = [];
    for (x = 0; x < RC_MAP_W; x++) {
      RC_MAP[y][x] = 1;
    }
  }

  // Räume aushöhlen
  var r, c, ox, oy, dx, dy;
  for (r = 0; r < gh; r++) {
    for (c = 0; c < gw; c++) {
      if (!m.grid[r][c]) continue;
      ox = c * RC_CELL;
      oy = r * RC_CELL;

      // Innenraum: (ox+1,oy+1) bis (ox+RC_CELL-1, oy+RC_CELL-1)
      for (dy = 1; dy < RC_CELL; dy++) {
        for (dx = 1; dx < RC_CELL; dx++) {
          RC_MAP[oy + dy][ox + dx] = 0;
        }
      }

      // Wandtyp für besondere Räume
      var room = m.grid[r][c];
      var wt = 1;
      if (room.content === 'artifact' && !room.cleared) wt = 2;
      if (room.content === 'rückblick') wt = 2;
      if (room.content === 'funkkabine') wt = 2;

      // Raumwände mit Typ setzen
      for (dx = 0; dx <= RC_CELL; dx++) {
        if (ox + dx < RC_MAP_W) {
          RC_MAP[oy][ox + dx] = wt;
          if (oy + RC_CELL < RC_MAP_H) RC_MAP[oy + RC_CELL][ox + dx] = wt;
        }
      }
      for (dy = 0; dy <= RC_CELL; dy++) {
        if (oy + dy < RC_MAP_H) {
          RC_MAP[oy + dy][ox] = wt;
          if (ox + RC_CELL < RC_MAP_W) RC_MAP[oy + dy][ox + RC_CELL] = wt;
        }
      }

      // Raumzentrum speichern
      RC_ROOM_CENTERS[r + ',' + c] = {
        x: ox + RC_CELL / 2 + 0.5,
        y: oy + RC_CELL / 2 + 0.5
      };
    }
  }

  // Korridore aushöhlen
  var i, cn, mid;
  mid = Math.floor(RC_CELL / 2);
  for (i = 0; i < m.conns.length; i++) {
    cn = m.conns[i];
    if (cn.r1 === cn.r2) {
      // Horizontal: gleiche Zeile, benachbarte Spalten
      var minC = Math.min(cn.c1, cn.c2);
      ox = minC * RC_CELL + RC_CELL;  // Geteilte Wand-Spalte
      oy = cn.r1 * RC_CELL;
      for (dy = mid - 1; dy <= mid + 1; dy++) {
        if (oy + dy >= 0 && oy + dy < RC_MAP_H && ox >= 0 && ox < RC_MAP_W) {
          RC_MAP[oy + dy][ox] = 0;
        }
      }
    } else {
      // Vertikal: gleiche Spalte, benachbarte Zeilen
      var minR = Math.min(cn.r1, cn.r2);
      ox = cn.c1 * RC_CELL;
      oy = minR * RC_CELL + RC_CELL;  // Geteilte Wand-Zeile
      for (dx = mid - 1; dx <= mid + 1; dx++) {
        if (ox + dx >= 0 && ox + dx < RC_MAP_W && oy >= 0 && oy < RC_MAP_H) {
          RC_MAP[oy][ox + dx] = 0;
        }
      }
    }
  }

  // Sprites erstellen
  rcBuildSprites();
}

/**
 * Sprite-Liste aus aktuellem G.map-Zustand aufbauen.
 * Im Test-Modus (RC_SPRITE_TEST): alle Sprites aus lovecraft_sprites.js + rpg_sprites.js zeigen.
 */
function rcBuildSprites() {
  rcSprites = [];
  if (!G.map) return;
  var m = G.map;
  var r, c, room, center, spDef, type;

  // ── Test-Modus: alle Sprite-Definitionen auf verfügbare Räume verteilen ──
  if (typeof RC_SPRITE_TEST !== 'undefined' && RC_SPRITE_TEST) {
    var allDefs = [];
    if (typeof LOVECRAFT_SPRITES !== 'undefined') {
      for (var li = 0; li < LOVECRAFT_SPRITES.length; li++) allDefs.push(LOVECRAFT_SPRITES[li]);
    }
    if (typeof MUSHROOM_SPRITES !== 'undefined') {
      for (var mi = 0; mi < MUSHROOM_SPRITES.length; mi++) allDefs.push(MUSHROOM_SPRITES[mi]);
    }
    if (typeof RPG_SPRITES !== 'undefined') {
      for (var ri = 0; ri < RPG_SPRITES.length; ri++) allDefs.push(RPG_SPRITES[ri]);
    }

    // Alle Raumzentren außer Start-Raum sammeln
    var testCenters = [];
    for (var key in RC_ROOM_CENTERS) {
      var parts = key.split(',');
      var tr = parseInt(parts[0]), tc = parseInt(parts[1]);
      var troom = m.grid[tr] && m.grid[tr][tc];
      if (!troom || troom.content === 'start') continue;
      testCenters.push(RC_ROOM_CENTERS[key]);
    }

    for (var ti = 0; ti < allDefs.length && ti < testCenters.length; ti++) {
      var tsp = allDefs[ti];
      rcSprites.push({
        x: testCenters[ti].x,
        y: testCenters[ti].y,
        ch: '?',
        color: { hex: tsp.color, glow: 'none' },
        type: 'test',
        sprite: tsp
      });
    }
    return;
  }

  // ── Normal-Modus ──
  for (r = 0; r < m.H; r++) {
    for (c = 0; c < m.W; c++) {
      room = m.grid[r][c];
      if (!room) continue;
      center = RC_ROOM_CENTERS[r + ',' + c];
      if (!center) continue;

      type = room.content;
      if (type === 'empty') continue;
      if (type === 'start') continue;
      if (type === 'enemy'    && room.cleared) continue;
      if (type === 'loot'     && room.looted)  continue;
      if (type === 'artifact' && room.cleared) continue;
      if (type === 'stairs')  { /* Treppe immer zeigen */ }
      else if (room.cleared)  continue;

      spDef = RC_SPRITE_DEFS[type];
      if (!spDef) continue;

      rcSprites.push({
        x: center.x, y: center.y,
        ch: spDef.ch, color: spDef.color, type: type
      });
    }
  }
}

/**
 * Ermittelt welcher Spielraum (r,c) an einer Raycaster-Position liegt.
 * @returns {{ r:number, c:number }|null}
 */
function rcGetRoomAt(px, py) {
  if (!G.map) return null;
  var c = Math.floor(px / RC_CELL);
  var r = Math.floor(py / RC_CELL);
  if (r < 0 || r >= G.map.H || c < 0 || c >= G.map.W) return null;
  if (!G.map.grid[r][c]) return null;

  // Prüfe ob Position im Rauminneren liegt (nicht in der Wand)
  var lx = px - c * RC_CELL;
  var ly = py - r * RC_CELL;
  if (lx < 1 || lx >= RC_CELL || ly < 1 || ly >= RC_CELL) return null;

  return { r: r, c: c };
}

// Kollisionsradius: entspricht ungefähr dem Punkt, an dem ein Sprite die volle Bildschirmhöhe erreicht
var SPRITE_BLOCK_RADIUS = 0.7;

/**
 * Prüft ob eine Position durch einen Sprite blockiert wird.
 */
function rcSpriteBlocks(px, py) {
  for (var i = 0; i < rcSprites.length; i++) {
    var sp = rcSprites[i];
    var dx = px - sp.x;
    var dy = py - sp.y;
    if (dx * dx + dy * dy < SPRITE_BLOCK_RADIUS * SPRITE_BLOCK_RADIUS) return true;
  }
  return false;
}

function rcIsWall(x, y) {
  var mx = Math.floor(x);
  var my = Math.floor(y);
  if (mx < 0 || mx >= RC_MAP_W || my < 0 || my >= RC_MAP_H) return true;
  return RC_MAP[my][mx] !== 0;
}

function rcGetCell(x, y) {
  var mx = Math.floor(x);
  var my = Math.floor(y);
  if (mx < 0 || mx >= RC_MAP_W || my < 0 || my >= RC_MAP_H) return 1;
  return RC_MAP[my][mx];
}
