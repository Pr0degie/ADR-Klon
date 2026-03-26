// ============================================================================
//  SPIELER — Zustand & Bewegung
//  Stellt bereit: rcPlayer{}, updatePlayer(), rcPaused
//  Benötigt: rcIsWall() (map.js), rcKeys{} (input.js)
// ============================================================================

var rcPlayer = {
  x:   1.5,
  y:   1.5,
  dir: 0,
  spd: 3.0,
  rot: 2.5,
};

var rcPaused = false;   // true während Kampf / Event / Overlay

function updatePlayer(dt) {
  // Keine Bewegung wenn pausiert (Kampf, Event, etc.)
  if (rcPaused) return;

  var moveSpeed = rcPlayer.spd * dt;
  var rotSpeed  = rcPlayer.rot * dt;

  // Drehung
  if (rcKeys['ArrowLeft']  || rcKeys['KeyA']) rcPlayer.dir -= rotSpeed;
  if (rcKeys['ArrowRight'] || rcKeys['KeyD']) rcPlayer.dir += rotSpeed;
  if (rcPlayer.dir >  Math.PI) rcPlayer.dir -= 2 * Math.PI;
  if (rcPlayer.dir < -Math.PI) rcPlayer.dir += 2 * Math.PI;

  // Bewegungsvektor
  var dx = 0, dy = 0;
  if (rcKeys['ArrowUp']   || rcKeys['KeyW']) {
    dx += Math.cos(rcPlayer.dir) * moveSpeed;
    dy += Math.sin(rcPlayer.dir) * moveSpeed;
  }
  if (rcKeys['ArrowDown'] || rcKeys['KeyS']) {
    dx -= Math.cos(rcPlayer.dir) * moveSpeed;
    dy -= Math.sin(rcPlayer.dir) * moveSpeed;
  }
  if (rcKeys['KeyQ']) {
    dx += Math.cos(rcPlayer.dir - Math.PI / 2) * moveSpeed;
    dy += Math.sin(rcPlayer.dir - Math.PI / 2) * moveSpeed;
  }
  if (rcKeys['KeyE']) {
    dx += Math.cos(rcPlayer.dir + Math.PI / 2) * moveSpeed;
    dy += Math.sin(rcPlayer.dir + Math.PI / 2) * moveSpeed;
  }

  // Kollision: X und Y getrennt (Wände + Sprites)
  var m = 0.2;
  var nx = rcPlayer.x + dx;
  if (!rcIsWall(nx + m, rcPlayer.y + m) && !rcIsWall(nx + m, rcPlayer.y - m) &&
      !rcIsWall(nx - m, rcPlayer.y + m) && !rcIsWall(nx - m, rcPlayer.y - m) &&
      !rcSpriteBlocks(nx, rcPlayer.y)) {
    rcPlayer.x = nx;
  }
  var ny = rcPlayer.y + dy;
  if (!rcIsWall(rcPlayer.x + m, ny + m) && !rcIsWall(rcPlayer.x + m, ny - m) &&
      !rcIsWall(rcPlayer.x - m, ny + m) && !rcIsWall(rcPlayer.x - m, ny - m) &&
      !rcSpriteBlocks(rcPlayer.x, ny)) {
    rcPlayer.y = ny;
  }
}
