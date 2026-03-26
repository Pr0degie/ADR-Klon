// ============================================================================
//  MINIMAP
//  ───────
//  Zeichnet einen Ausschnitt der Map mit Spielerposition und Blickrichtung
//  als Overlay in den Screen-Buffer (rechts oben).
//
//  Stellt bereit: renderMinimap()
//  Benötigt: SCREEN_W, MINIMAP_SIZE, COLORS (constants.js),
//            RC_MAP, RC_MAP_W, RC_MAP_H (map.js), rcPlayer (player.js),
//            setCell() (grid.js)
// ============================================================================

function renderMinimap() {
  var ox = SCREEN_W - MINIMAP_SIZE - 2;  // X-Offset im Screen
  var oy = 1;                             // Y-Offset
  var cx = Math.floor(rcPlayer.x);
  var cy = Math.floor(rcPlayer.y);
  var half = Math.floor(MINIMAP_SIZE / 2);

  // ── Rahmen ──
  var mx, my;
  for (mx = -1; mx <= MINIMAP_SIZE; mx++) {
    setCell(oy - 1, ox + mx, '─', COLORS.mapBorder);
    setCell(oy + MINIMAP_SIZE, ox + mx, '─', COLORS.mapBorder);
  }
  for (my = 0; my < MINIMAP_SIZE; my++) {
    setCell(oy + my, ox - 1, '│', COLORS.mapBorder);
    setCell(oy + my, ox + MINIMAP_SIZE, '│', COLORS.mapBorder);
  }
  setCell(oy - 1, ox - 1, '┌', COLORS.mapBorder);
  setCell(oy - 1, ox + MINIMAP_SIZE, '┐', COLORS.mapBorder);
  setCell(oy + MINIMAP_SIZE, ox - 1, '└', COLORS.mapBorder);
  setCell(oy + MINIMAP_SIZE, ox + MINIMAP_SIZE, '┘', COLORS.mapBorder);

  // ── Map-Inhalt (zentriert auf Spieler) ──
  for (my = 0; my < MINIMAP_SIZE; my++) {
    for (mx = 0; mx < MINIMAP_SIZE; mx++) {
      var wx = cx - half + mx;
      var wy = cy - half + my;

      var ch = ' ';
      var color = COLORS.void;

      // Spieler-Zelle?
      if (wx === Math.floor(rcPlayer.x) && wy === Math.floor(rcPlayer.y)) {
        var d = rcPlayer.dir;
        if      (d > -Math.PI/4   && d <= Math.PI/4)   ch = '▸';
        else if (d > Math.PI/4    && d <= 3*Math.PI/4)  ch = '▾';
        else if (d > -3*Math.PI/4 && d <= -Math.PI/4)   ch = '▴';
        else                                             ch = '◂';
        color = COLORS.mapPlayer;
      }
      // In der Map?
      else if (wx >= 0 && wx < RC_MAP_W && wy >= 0 && wy < RC_MAP_H) {
        var cell = RC_MAP[wy][wx];
        if (cell === 1)      { ch = '█'; color = COLORS.mapWall; }
        else if (cell === 2) { ch = '▓'; color = COLORS.mapEld; }
        else                  { ch = '·'; color = COLORS.mapFloor; }
      }

      setCell(oy + my, ox + mx, ch, color);
    }
  }
}
