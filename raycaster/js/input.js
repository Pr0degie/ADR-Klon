// ============================================================================
//  INPUT — Tastatur & Fokus
//  Stellt bereit: rcKeys{}, initFocus()
//  Benötigt: nichts (DOM per ID)
// ============================================================================

var rcKeys = {};

window.addEventListener('keydown', function(e) {
  rcKeys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].indexOf(e.code) !== -1) {
    e.preventDefault();
  }
  // Interact-Taste: Space oder Enter
  if ((e.code === 'Space' || e.code === 'Enter') && rcRunning && !rcPaused) {
    if (typeof rcInteract === 'function') rcInteract();
  }
});

window.addEventListener('keyup', function(e) {
  rcKeys[e.code] = false;
});

(function setupFocus() {
  var container = document.getElementById('rc-container');
  var focusHint = document.getElementById('rc-focus-hint');
  if (!container || !focusHint) return;

  function checkFocus() {
    focusHint.style.display = document.activeElement === container ? 'none' : 'block';
  }

  container.addEventListener('focus', checkFocus);
  container.addEventListener('blur', checkFocus);
  document.addEventListener('click', function() {
    if (container.style.display !== 'none') container.focus();
  });

  window.initFocus = function() {
    container.focus();
    checkFocus();
  };
})();
