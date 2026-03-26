// ============================================================================
//  RENDER-STYLES — Wand, Boden, Decke, Kanten, Sprites
//  Stellt bereit: wallStyle(), isEdge(), isInnerEdge(), floorStyle(),
//                 ceilStyle(), renderSprites()
//  Benötigt: COLORS, SCREEN_W, SCREEN_H, FOV (constants.js),
//            rcSprites (map.js), rcPlayer (player.js), setCell() (grid.js)
// ============================================================================

var ELDRITCH_GLYPHS = '⛧∴⍟◊⌖⛤△▽◇';

function wallStyle(dist, side, wallType, time) {
  var isEld = wallType === 2;
  var ch;
  if      (dist < 1.5) ch = '█';
  else if (dist < 3.0) ch = side === 1 ? '▓' : '█';
  else if (dist < 4.5) ch = side === 1 ? '▒' : '▓';
  else if (dist < 6.5) ch = side === 1 ? '░' : '▒';
  else if (dist < 8.5) ch = '░';
  else if (dist < 11)  ch = '·';
  else                  ch = ' ';

  if (isEld && dist < 6) {
    if (Math.sin(time * 3 + dist * 7) > 0.85) {
      var idx = Math.floor(Math.abs(Math.sin(time * 5 + dist * 13)) * ELDRITCH_GLYPHS.length);
      ch = ELDRITCH_GLYPHS[idx];
    }
  }

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

function isEdge(wallHeights, col) {
  var h    = wallHeights[col];
  var prev = col > 0            ? wallHeights[col - 1] : h;
  var next = col < SCREEN_W - 1 ? wallHeights[col + 1] : h;
  return Math.abs(h - prev) > 3 || Math.abs(h - next) > 3;
}

function isInnerEdge(wallHeights, col) {
  if (!isEdge(wallHeights, col)) return false;
  var prev = col > 0            ? wallHeights[col - 1] : 0;
  var next = col < SCREEN_W - 1 ? wallHeights[col + 1] : 0;
  return prev > 0 && next > 0;
}

function floorStyle(row) {
  var depth = (row - SCREEN_H / 2) / (SCREEN_H / 2);
  if      (depth > 0.75) return { ch: '▓', color: COLORS.floorNear };
  else if (depth > 0.5)  return { ch: '░', color: COLORS.floorMid };
  else if (depth > 0.25) return { ch: ',', color: COLORS.floorFar };
  else                    return { ch: '.', color: COLORS.floorVoid };
}

function ceilStyle(row) {
  var depth = (SCREEN_H / 2 - row) / (SCREEN_H / 2);
  if      (depth > 0.7) return { ch: ' ', color: COLORS.ceilVoid };
  else if (depth > 0.3) return { ch: '·', color: COLORS.ceilFar };
  else                   return { ch: '∴', color: COLORS.ceilNear };
}

// ============================================================================
//  SPRITE-RENDERING — Billboard-Sprites für Rauminhalte
// ============================================================================

/**
 * Rendert alle Sprites über die Wanddarstellung.
 * @param {number[]} depthBuffer — Wanddistanz pro Spalte (aus renderFrame)
 * @param {number} time — Spielzeit in Sekunden
 */
function renderSprites(depthBuffer, time) {
  if (!rcSprites || rcSprites.length === 0) return;

  // Sprites nach Distanz sortieren (weit → nah, damit nahe über ferne gezeichnet werden)
  var sorted = [];
  var i, sp, dx, dy, dist;
  for (i = 0; i < rcSprites.length; i++) {
    sp = rcSprites[i];
    dx = sp.x - rcPlayer.x;
    dy = sp.y - rcPlayer.y;
    dist = Math.sqrt(dx * dx + dy * dy);
    sorted.push({ sp: sp, dist: dist, dx: dx, dy: dy });
  }
  sorted.sort(function(a, b) { return b.dist - a.dist; });

  for (i = 0; i < sorted.length; i++) {
    var s = sorted[i];
    if (s.dist < 0.5 || s.dist > MAX_DEPTH) continue;

    // Winkel zum Sprite relativ zur Blickrichtung
    var spriteAngle = Math.atan2(s.dy, s.dx);
    var relAngle = spriteAngle - rcPlayer.dir;
    while (relAngle >  Math.PI) relAngle -= 2 * Math.PI;
    while (relAngle < -Math.PI) relAngle += 2 * Math.PI;

    // Außerhalb des Sichtfeldes?
    if (Math.abs(relAngle) > FOV / 2 + 0.15) continue;

    // Perpendicular Distance
    var perpDist = s.dist * Math.cos(relAngle);
    if (perpDist < 0.3) continue;

    // Screen-Position
    var screenX = Math.floor((relAngle / FOV + 0.5) * SCREEN_W);

    // Sprite-Höhe (ähnlich wie Wandhöhe, aber etwas kleiner)
    var spriteH = Math.min(SCREEN_H - 2, Math.floor(SCREEN_H * 0.7 / perpDist));
    if (spriteH < 1) continue;
    var halfH = Math.floor(spriteH / 2);
    var centerY = Math.floor(SCREEN_H / 2);

    // Sprite-Breite (proportional, mindestens 1)
    var spriteW = Math.max(1, Math.floor(spriteH * 0.4));
    var halfW = Math.floor(spriteW / 2);

    // Animation: leichtes Schweben
    var bob = Math.sin(time * 2.5 + s.sp.x * 3) * 0.5;
    var yOff = Math.floor(bob);

    // Zeichen und Farbe
    var ch    = s.sp.ch;
    var color = s.sp.color;

    // Pulsierender Glow für nahe Sprites
    if (perpDist < 4) {
      var pulse = 0.7 + Math.sin(time * 3 + s.sp.y * 2) * 0.3;
      var baseHex = color.hex;
      color = { hex: baseHex, glow: color.glow.replace(/[\d.]+\)$/, (pulse).toFixed(1) + ')') };
    }

    // Zeichnen
    var col, row, spriteDef = s.sp.sprite;
    if (spriteDef && spriteDef.frames) {
      // ── Multi-Zeilen ASCII-Art Sprite ──
      var frame = spriteDef.frames[Math.floor(time * 2) % spriteDef.frames.length];
      var srcH  = frame.length;
      var bgColor = spriteDef.colorDim || '';

      // Frame auf spriteH Zeilen herunterskalieren
      var scaled = [], si;
      for (si = 0; si < spriteH; si++) {
        scaled.push(frame[Math.floor(si * srcH / spriteH)] || '');
      }

      var sprRow, line, lineStart, lineCol, sc;
      for (sprRow = 0; sprRow < scaled.length; sprRow++) {
        row = centerY - halfH + yOff + sprRow;
        if (row < 0 || row >= SCREEN_H) continue;
        line = scaled[sprRow];
        lineStart = screenX - Math.floor(line.length / 2);
        for (lineCol = 0; lineCol < line.length; lineCol++) {
          col = lineStart + lineCol;
          if (col < 0 || col >= SCREEN_W) continue;
          if (perpDist >= depthBuffer[col]) continue;
          sc = line[lineCol];
          if (sc === ' ') {
            // Leerzeichen innerhalb der Bounding-Box: dunkler Hintergrund → opakes Rechteck
            setCell(row, col, ' ', color, bgColor);
          } else {
            setCell(row, col, sc, color, bgColor);
          }
        }
      }
    } else {
      // ── Einzelzeichen-Sprite (Normal-Modus) ──
      for (col = screenX - halfW; col <= screenX + halfW; col++) {
        if (col < 0 || col >= SCREEN_W) continue;
        if (perpDist >= depthBuffer[col]) continue;

        for (row = centerY - halfH + yOff; row <= centerY + halfH + yOff; row++) {
          if (row < 0 || row >= SCREEN_H) continue;
          var localY = row - (centerY - halfH + yOff);
          var localRatio = localY / spriteH;
          if (localRatio < 0.15 || localRatio > 0.85) {
            if (Math.abs(col - screenX) > 0) continue;
          }
          setCell(row, col, ch, color);
        }
      }
    }
  }
}
