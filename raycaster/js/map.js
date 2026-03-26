// ============================================================================
//  MAP-DATEN & HILFSFUNKTIONEN
//  ────────────────────────────
//  0 = frei, 1 = Steinwand, 2 = Eldritch-Wand
//  Hier die Map austauschen oder aus einem Level-Editor laden.
//
//  Stellt bereit: RC_MAP, RC_MAP_W, RC_MAP_H, rcIsWall(), rcGetCell()
//  Benötigt: nichts
// ============================================================================

var RC_MAP = [
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

var RC_MAP_W = RC_MAP[0].length;
var RC_MAP_H = RC_MAP.length;

/** Prüft ob die Position (x,y) in einer Wand liegt */
function rcIsWall(x, y) {
  var mx = Math.floor(x);
  var my = Math.floor(y);
  if (mx < 0 || mx >= RC_MAP_W || my < 0 || my >= RC_MAP_H) return true;
  return RC_MAP[my][mx] !== 0;
}

/** Gibt den Zellenwert an (x,y) zurück (1=Stein, 2=Eldritch, 0=frei) */
function rcGetCell(x, y) {
  var mx = Math.floor(x);
  var my = Math.floor(y);
  if (mx < 0 || mx >= RC_MAP_W || my < 0 || my >= RC_MAP_H) return 1;
  return RC_MAP[my][mx];
}
