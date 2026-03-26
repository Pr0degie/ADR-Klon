// ============================================================================
//  RENDER-STYLES — Wand, Boden, Decke, Kanten
//  ────────────────────────────────────────────
//  Bestimmt Zeichen und Farbe basierend auf Distanz, Wandtyp, Position.
//
//  Stellt bereit: wallStyle(), isEdge(), floorStyle(), ceilStyle()
//  Benötigt: COLORS, SCREEN_W (constants.js)
// ============================================================================

// Glitch-Symbole für Eldritch-Wände
var ELDRITCH_GLYPHS = '⛧∴⍟◊⌖⛤△▽◇';

/**
 * Zeichen + Farbe für einen Wandpixel.
 * @param {number} dist — Korrigierte Distanz
 * @param {number} side — 0=Ost/West, 1=Nord/Süd
 * @param {number} wallType — 1=Stein, 2=Eldritch
 * @param {number} time — Sekunden seit Start (für Glitch-Animation)
 * @returns {{ ch: string, color: object }}
 */
function wallStyle(dist, side, wallType, time) {
  var isEld = wallType === 2;

  // ── ASCII-Zeichen nach Distanz ──
  var ch;
  if      (dist < 1.5) ch = '█';
  else if (dist < 3.0) ch = side === 1 ? '▓' : '█';
  else if (dist < 4.5) ch = side === 1 ? '▒' : '▓';
  else if (dist < 6.5) ch = side === 1 ? '░' : '▒';
  else if (dist < 8.5) ch = '░';
  else if (dist < 11)  ch = '·';
  else                  ch = ' ';

  // Eldritch-Glitch: zeitbasiert flackernde Symbole
  if (isEld && dist < 6) {
    if (Math.sin(time * 3 + dist * 7) > 0.85) {
      var idx = Math.floor(Math.abs(Math.sin(time * 5 + dist * 13)) * ELDRITCH_GLYPHS.length);
      ch = ELDRITCH_GLYPHS[idx];
    }
  }

  // ── Farbe nach Distanz und Typ ──
  var color;
  if (isEld) {
    if      (dist < 2.0) color = COLORS.eldNear;
    else if (dist < 4.5) color = COLORS.eldMid;
    else if (dist < 7.0) color = COLORS.eldFar;
    else if (dist < 10)  color = COLORS.eldDim;
    else                  color = COLORS.eldVoid;
  } else {
    if      (dist < 2.0) color = COLORS.stoneNear;
    else if (dist < 4.5) color = COLORS.stoneMid;
    else if (dist < 7.0) color = COLORS.stoneFar;
    else if (dist < 10)  color = COLORS.stoneDim;
    else                  color = COLORS.stoneVoid;
  }

  return { ch: ch, color: color };
}

/**
 * Prüft ob eine Spalte eine Wandkante ist (Ecke / Vorsprung).
 * @param {number[]} wallHeights — Array aller Wandhöhen
 * @param {number} col — Aktuelle Spalte
 * @returns {boolean}
 */
function isEdge(wallHeights, col) {
  var h    = wallHeights[col];
  var prev = col > 0              ? wallHeights[col - 1] : h;
  var next = col < SCREEN_W - 1   ? wallHeights[col + 1] : h;
  var threshold = 3;
  return Math.abs(h - prev) > threshold || Math.abs(h - next) > threshold;
}

/**
 * Zeichen + Farbe für den Boden.
 * @param {number} row — Bildschirmzeile
 * @returns {{ ch: string, color: object }}
 */
function floorStyle(row) {
  var depth = (row - SCREEN_H / 2) / (SCREEN_H / 2);

  if      (depth > 0.75) return { ch: '▓', color: COLORS.floorNear };
  else if (depth > 0.5)  return { ch: '░', color: COLORS.floorMid };
  else if (depth > 0.25) return { ch: ',', color: COLORS.floorFar };
  else                    return { ch: '.', color: COLORS.floorVoid };
}

/**
 * Zeichen + Farbe für die Decke.
 * @param {number} row — Bildschirmzeile
 * @returns {{ ch: string, color: object }}
 */
function ceilStyle(row) {
  var depth = (SCREEN_H / 2 - row) / (SCREEN_H / 2);

  if      (depth > 0.7) return { ch: ' ', color: COLORS.ceilVoid };
  else if (depth > 0.3) return { ch: '·', color: COLORS.ceilFar };
  else                   return { ch: '∴', color: COLORS.ceilNear };
}
