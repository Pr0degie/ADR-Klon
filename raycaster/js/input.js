// ============================================================================
//  INPUT — Tastatur & Fokus
//  ─────────────────────────
//  Stellt bereit: rcKeys{}, initFocus()
//  Benötigt: nichts (DOM-Elemente per ID)
// ============================================================================

/** Aktuell gedrückte Tasten — rcKeys['KeyW'] === true wenn W gedrückt */
var rcKeys = {};

window.addEventListener('keydown', function(e) {
  rcKeys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) !== -1) {
    e.preventDefault();
  }
});

window.addEventListener('keyup', function(e) {
  rcKeys[e.code] = false;
});

// ── Fokus-Management ──
(function setupFocus() {
  var container = document.getElementById('container');
  var focusHint = document.getElementById('focus-hint');

  function checkFocus() {
    focusHint.style.display = document.activeElement === container ? 'none' : 'block';
  }

  container.addEventListener('focus', checkFocus);
  container.addEventListener('blur', checkFocus);
  document.addEventListener('click', function() { container.focus(); });

  /** Global aufrufbar — initiales Fokussieren */
  window.initFocus = function() {
    container.focus();
    checkFocus();
  };
})();
