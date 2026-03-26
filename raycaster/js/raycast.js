// ============================================================================
//  DDA RAYCASTING
//  ──────────────
//  Reiner Algorithmus — keine Rendering-Logik hier.
//
//  Stellt bereit: castRay()
//  Benötigt: MAP, MAP_W, MAP_H (map.js)
// ============================================================================

/**
 * Einen einzelnen Strahl casten (DDA-Algorithmus).
 *
 * @param {number} ox — Ursprung X
 * @param {number} oy — Ursprung Y
 * @param {number} angle — Strahlwinkel in Rad
 * @returns {{ dist: number, side: number, hit: boolean, wallType: number }}
 *   dist     — Perpendicular Distance zur Wand
 *   side     — 0 = X-Seite (Ost/West), 1 = Y-Seite (Nord/Süd)
 *   hit      — true wenn Wand getroffen
 *   wallType — 0=keine, 1=Stein, 2=Eldritch
 */
function castRay(ox, oy, angle) {
  var rdx = Math.cos(angle);
  var rdy = Math.sin(angle);

  // Aktuelle Map-Zelle
  var mapX = Math.floor(ox);
  var mapY = Math.floor(oy);

  // Delta-Distanz pro Zelle in X/Y
  var ddx = Math.abs(1 / rdx);
  var ddy = Math.abs(1 / rdy);

  // Schritt-Richtung und initiale Seitendistanz
  var stepX, sideDistX;
  var stepY, sideDistY;

  if (rdx < 0) { stepX = -1; sideDistX = (ox - mapX) * ddx; }
  else          { stepX =  1; sideDistX = (mapX + 1 - ox) * ddx; }

  if (rdy < 0) { stepY = -1; sideDistY = (oy - mapY) * ddy; }
  else          { stepY =  1; sideDistY = (mapY + 1 - oy) * ddy; }

  // ── DDA-Schleife ──
  var hit = false;
  var side = 0;
  var wallType = 0;

  for (var i = 0; i < 64; i++) {
    // Zum nächsten Zellenrand springen
    if (sideDistX < sideDistY) {
      sideDistX += ddx;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += ddy;
      mapY += stepY;
      side = 1;
    }

    // Außerhalb der Map?
    if (mapX < 0 || mapX >= MAP_W || mapY < 0 || mapY >= MAP_H) break;

    // Wand getroffen?
    var cell = MAP[mapY][mapX];
    if (cell !== 0) {
      hit = true;
      wallType = cell;
      break;
    }
  }

  // Perpendicular Distance (vermeidet Fisheye)
  var dist;
  if (hit) {
    dist = side === 0
      ? (mapX - ox + (1 - stepX) / 2) / rdx
      : (mapY - oy + (1 - stepY) / 2) / rdy;
  } else {
    dist = MAX_DEPTH;
  }

  return { dist: Math.abs(dist), side: side, hit: hit, wallType: wallType };
}
