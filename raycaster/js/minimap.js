// ============================================================================
//  MINIMAP — Spielraum-basierte Minimap
//  Zeigt Raumgraph mit Inhalts-Icons, Korridore, Spielerposition.
//  Fog-of-War für unbesuchte Räume.
//
//  Stellt bereit: renderMinimap()
//  Benötigt: SCREEN_W, MINIMAP_SIZE, COLORS (constants.js),
//            RC_CELL, RC_ROOM_CENTERS (map.js), rcPlayer (player.js),
//            setCell() (grid.js), G.map
// ============================================================================

function renderMinimap() {
  if (!G.map) return;

  var ox = SCREEN_W - MINIMAP_SIZE - 2;
  var oy = 1;
  var m  = G.map;

  // Rahmen
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

  // Minimap-Ansicht: Tile-basiert, zentriert auf Spieler
  var cx = Math.floor(rcPlayer.x);
  var cy = Math.floor(rcPlayer.y);
  var half = Math.floor(MINIMAP_SIZE / 2);

  for (my = 0; my < MINIMAP_SIZE; my++) {
    for (mx = 0; mx < MINIMAP_SIZE; mx++) {
      var wx = cx - half + mx;
      var wy = cy - half + my;

      var ch    = ' ';
      var color = COLORS.void;

      // Spieler-Zelle?
      if (wx === cx && wy === cy) {
        var d = rcPlayer.dir;
        if      (d > -Math.PI/4   && d <= Math.PI/4)   ch = '▸';
        else if (d > Math.PI/4    && d <= 3*Math.PI/4)  ch = '▾';
        else if (d > -3*Math.PI/4 && d <= -Math.PI/4)   ch = '▴';
        else                                             ch = '◂';
        color = COLORS.mapPlayer;
      }
      else if (wx >= 0 && wx < RC_MAP_W && wy >= 0 && wy < RC_MAP_H) {
        var cell = RC_MAP[wy][wx];

        // Raumzugehörigkeit prüfen für Fog-of-War
        var roomC = Math.floor(wx / RC_CELL);
        var roomR = Math.floor(wy / RC_CELL);
        var gRoom = (roomR >= 0 && roomR < m.H && roomC >= 0 && roomC < m.W)
                    ? m.grid[roomR][roomC] : null;

        // Ist der Raum sichtbar? (besucht oder benachbart zu besuchtem)
        var visible = false;
        if (gRoom) {
          if (gRoom.visited) visible = true;
          else {
            // Benachbarte besuchte Räume prüfen
            var nbs = [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}];
            for (var ni = 0; ni < nbs.length; ni++) {
              var nr = roomR + nbs[ni].dr;
              var nc = roomC + nbs[ni].dc;
              if (nr >= 0 && nr < m.H && nc >= 0 && nc < m.W &&
                  m.grid[nr][nc] && m.grid[nr][nc].visited &&
                  hasConn(m.conns, roomR, roomC, nr, nc)) {
                visible = true;
                break;
              }
            }
          }
        }

        if (!visible && gRoom) {
          ch = '·'; color = COLORS.mapFog;
        } else if (cell === 1) {
          ch = '█'; color = COLORS.mapWall;
        } else if (cell === 2) {
          ch = '▓'; color = COLORS.mapEld;
        } else {
          ch = '·'; color = COLORS.mapFloor;
        }

        // Raum-Icon overlay an Raumzentren
        if (gRoom && visible && cell === 0) {
          var centerKey = roomR + ',' + roomC;
          var rc = RC_ROOM_CENTERS[centerKey];
          if (rc && Math.floor(rc.x) === wx && Math.floor(rc.y) === wy) {
            var spDef = rcGetMinimapIcon(gRoom);
            if (spDef) {
              ch = spDef.ch;
              color = spDef.color;
            }
          }
        }
      }

      setCell(oy + my, ox + mx, ch, color);
    }
  }
}

/** Minimap-Icon für einen Raum ermitteln */
function rcGetMinimapIcon(room) {
  var type = room.content;
  if (type === 'empty') return null;
  if (type === 'start') return { ch: '⌂', color: { hex: '#6b21a8', glow: 'none' } };
  if (type === 'enemy'    && room.cleared) return null;
  if (type === 'loot'     && room.looted)  return null;
  if (type === 'artifact' && room.cleared) return null;
  if (type === 'stairs')  return RC_SPRITE_DEFS.stairs;
  if (room.cleared && type !== 'stairs') return null;
  return RC_SPRITE_DEFS[type] || null;
}
