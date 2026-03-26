// ============================================================================
//  SPIELER — Zustand & Bewegung
//  ─────────────────────────────
//  Stellt bereit: rcPlayer{}, updatePlayer()
//  Benötigt: rcIsWall() (map.js), rcKeys{} (input.js)
// ============================================================================

var rcPlayer = {
  x:   1.5,       // Startposition X
  y:   1.5,       // Startposition Y
  dir: 0,         // Blickrichtung (Rad, 0 = Osten)
  spd: 3.0,       // Einheiten/Sekunde
  rot: 2.5,       // Rad/Sekunde
};

/**
 * Spieler-Update pro Frame.
 * @param {number} dt — Delta-Time in Sekunden
 */
function updatePlayer(dt) {
  var moveSpeed = rcPlayer.spd * dt;
  var rotSpeed  = rcPlayer.rot * dt;

  // ── Drehung ──
  if (rcKeys['ArrowLeft']  || rcKeys['KeyA']) rcPlayer.dir -= rotSpeed;
  if (rcKeys['ArrowRight'] || rcKeys['KeyD']) rcPlayer.dir += rotSpeed;

  // Normalisieren auf [-PI, PI]
  if (rcPlayer.dir >  Math.PI) rcPlayer.dir -= 2 * Math.PI;
  if (rcPlayer.dir < -Math.PI) rcPlayer.dir += 2 * Math.PI;

  // ── Bewegungsvektor berechnen ──
  var dx = 0, dy = 0;

  // Vorwärts / Rückwärts
  if (rcKeys['ArrowUp']   || rcKeys['KeyW']) {
    dx += Math.cos(rcPlayer.dir) * moveSpeed;
    dy += Math.sin(rcPlayer.dir) * moveSpeed;
  }
  if (rcKeys['ArrowDown'] || rcKeys['KeyS']) {
    dx -= Math.cos(rcPlayer.dir) * moveSpeed;
    dy -= Math.sin(rcPlayer.dir) * moveSpeed;
  }

  // Seitliches Strafing
  if (rcKeys['KeyQ']) {
    dx += Math.cos(rcPlayer.dir - Math.PI / 2) * moveSpeed;
    dy += Math.sin(rcPlayer.dir - Math.PI / 2) * moveSpeed;
  }
  if (rcKeys['KeyE']) {
    dx += Math.cos(rcPlayer.dir + Math.PI / 2) * moveSpeed;
    dy += Math.sin(rcPlayer.dir + Math.PI / 2) * moveSpeed;
  }

  // ── Kollision: X und Y getrennt (ermöglicht Wandgleiten) ──
  var m = 0.2;  // Abstandspuffer

  var nx = rcPlayer.x + dx;
  if (!rcIsWall(nx + m, rcPlayer.y + m) && !rcIsWall(nx + m, rcPlayer.y - m) &&
      !rcIsWall(nx - m, rcPlayer.y + m) && !rcIsWall(nx - m, rcPlayer.y - m)) {
    rcPlayer.x = nx;
  }

  var ny = rcPlayer.y + dy;
  if (!rcIsWall(rcPlayer.x + m, ny + m) && !rcIsWall(rcPlayer.x + m, ny - m) &&
      !rcIsWall(rcPlayer.x - m, ny + m) && !rcIsWall(rcPlayer.x - m, ny - m)) {
    rcPlayer.y = ny;
  }
}
