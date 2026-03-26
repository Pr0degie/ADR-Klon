// ============================================================================
//  MAP-DATEN & HILFSFUNKTIONEN
//  ────────────────────────────
//  0 = frei, 1 = Steinwand, 2 = Eldritch-Wand
//  Hier die Map austauschen oder aus einem Level-Editor laden.
//
//  Stellt bereit: MAP, MAP_W, MAP_H, isWall(), getCell()
//  Benötigt: nichts
// ============================================================================

var MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,2,2,0,0,1,0,0,0,1],
  [1,2,2,0,1,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,2,0,2,0,0,0,1,1,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,0,0,0,0,0,2,0,0,2,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,0,1,1,0,0,1,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,2,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,0,0,2,0,1],
  [1,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

var MAP_W = MAP[0].length;
var MAP_H = MAP.length;

/** Prüft ob die Position (x,y) in einer Wand liegt */
function isWall(x, y) {
  var mx = Math.floor(x);
  var my = Math.floor(y);
  if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) return true;
  return MAP[my][mx] !== 0;
}

/** Gibt den Zellenwert an (x,y) zurück (1=Stein, 2=Eldritch, 0=frei) */
function getCell(x, y) {
  var mx = Math.floor(x);
  var my = Math.floor(y);
  if (mx < 0 || mx >= MAP_W || my < 0 || my >= MAP_H) return 1;
  return MAP[my][mx];
}
