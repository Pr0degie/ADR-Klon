// ============================================================================
//  SCREEN GRID — Vorab-allokiertes Span-Array
//  ────────────────────────────────────────────
//  Erstellt einmalig SCREEN_W × SCREEN_H <span>-Elemente im <pre>.
//  Danach wird nur textContent + style pro Span aktualisiert —
//  kein DOM-Rebuild pro Frame.
//
//  Stellt bereit: rcGrid[][], rcInitGrid(), setCell()
//  Benötigt: SCREEN_W, SCREEN_H (constants.js)
// ============================================================================

var rcGrid = [];  // rcGrid[row][col] = span-Element

function rcInitGrid() {
  var screenEl = document.getElementById('rc-screen');
  screenEl.textContent = '';
  rcGrid = [];

  for (var y = 0; y < SCREEN_H; y++) {
    rcGrid[y] = [];
    for (var x = 0; x < SCREEN_W; x++) {
      var span = document.createElement('span');
      span.textContent = ' ';
      screenEl.appendChild(span);
      rcGrid[y][x] = span;
    }
    if (y < SCREEN_H - 1) {
      screenEl.appendChild(document.createTextNode('\n'));
    }
  }
}

/**
 * Setzt ein einzelnes Zeichen im Grid mit Farbe und Glow.
 * @param {number} y — Zeile
 * @param {number} x — Spalte
 * @param {string} ch — Das Zeichen
 * @param {{ hex: string, glow: string }} color — Farbobjekt aus COLORS
 */
function setCell(y, x, ch, color) {
  if (y < 0 || y >= SCREEN_H || x < 0 || x >= SCREEN_W) return;
  var span = rcGrid[y][x];
  span.textContent = ch;
  span.style.color = color.hex;
  span.style.textShadow = color.glow !== 'none' ? '0 0 8px ' + color.glow : 'none';
}
