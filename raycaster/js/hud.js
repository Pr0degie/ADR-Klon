// ============================================================================
//  HUD — Sanity-Bar & UI-Overlays
//  ────────────────────────────────
//  Kosmetische UI-Elemente. Hier weitere HUD-Sachen ergänzen
//  (Inventar, Nachrichten, Wahnsinn-Effekte, etc.)
//
//  Stellt bereit: updateHud()
//  Benötigt: nichts (DOM per ID)
// ============================================================================

var _sanityEl = document.getElementById('sanity-bar');

/**
 * Sanity-Anzeige aktualisieren (pulsiert zeitbasiert).
 * @param {number} time — Spielzeit in Sekunden
 */
function updateHud(time) {
  var pulse  = Math.sin(time * 0.5) * 10 + 70;  // Schwankt 60–80%
  var filled = Math.round(pulse / 10);
  var bar    = '';
  for (var i = 0; i < 10; i++) bar += i < filled ? '█' : '░';
  _sanityEl.textContent = 'SAN ' + bar + ' ' + Math.round(pulse) + '%';
}
