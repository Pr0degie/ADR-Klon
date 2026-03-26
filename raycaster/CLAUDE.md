# Raycaster — Claude-Kontext

> Subsystem von **TIEF** — Hauptspiel-Kontext siehe `../CLAUDE.md`

## Projekt
First-Person ASCII-Raycaster, Vanilla HTML/CSS/JS, keine Dependencies, kein Build-Tool.
Standalone-Test: `index.html` öffnen (lokaler Server nötig wegen separater Dateien).
Thema: Lovecraft kosmischer Horror. Visuell: Effulgence RPG (glühende ASCII-Zeichen, per-Zeichen-Farbe).

**Status: Ersetzt die 2D-Kartenansicht vollständig.** Map wird dynamisch aus `G.map` generiert. Raum-Erkennung synchronisiert Spielzustand. Sprites für Items/Gegner. HUD mit Aktions-Buttons.

## Dateistruktur

| Datei | Inhalt | Anfassen wenn… |
|---|---|---|
| `js/constants.js` | SCREEN_W/H, FOV, MAX_DEPTH, RC_CELL, COLORS, RC_SPRITE_DEFS | Farben, Auflösung, Sichtfeld, Sprite-Definitionen, Raumgröße |
| `js/map.js` | rcBuildMapFromGame(), rcGetRoomAt(), RC_ROOM_CENTERS, rcSprites, rcBuildSprites(), rcSpriteBlocks() | Map-Generierung, Sprite-Liste, Raum-Erkennung, Sprite-Kollision |
| `js/grid.js` | Span-Grid-Setup (rcGrid[][]), rcInitGrid(), setCell() — 5. Parameter `bgColor` (optional) | Rendering-Technik, Performance, Hintergrundfarbe pro Zelle |
| `js/input.js` | rcKeys{}, initFocus(), Space/Enter → rcInteract() | Neue Tasten, Steuerung |
| `js/player.js` | rcPlayer{}, updatePlayer(), rcPaused | Spielerwerte, Bewegung, Kollision, Pause |
| `js/raycast.js` | castRay() — reiner DDA-Algorithmus | Raycast-Präzision |
| `js/render.js` | wallStyle(), isEdge(), isInnerEdge(), floorStyle(), ceilStyle(), renderSprites() | Wand-Shading, innere Wandkanten (dunkler Strich), Sprite-Rendering |
| `js/minimap.js` | renderMinimap() — Fog-of-War, Raum-Icons aus Spielzustand | Minimap-Layout |
| `js/hud.js` | updateHud(), rcUpdateRoomHud(), rcInteract() | HUD-Elemente, Aktions-Buttons |
| `js/main.js` | renderFrame(), rcGameLoop(), rcStart(), rcStop(), rcSyncRoom(), rcCheckPause(), rcTeleportToRoom() | Loop, Raum-Erkennung, Pause-System |
| `css/style.css` | Terminal-Ästhetik, CRT-Effekte (nur Standalone) | Standalone-Darstellung |
| `index.html` | Standalone-DOM + Script-Tags + rcStart()-Aufruf | Standalone testen |

**Script-Ladereihenfolge:** `constants.js` → `map.js` → `grid.js` → `input.js` → `player.js` → `raycast.js` → `render.js` → `minimap.js` → `hud.js` → `main.js`

## Konventionen
- **Keine ES-Module** — alles global, Script-Reihenfolge regelt Abhängigkeiten
- Alle Globals mit `rc`-Prefix: `rcPlayer`, `rcKeys`, `rcGrid`, `rcIsWall`, `rcGetCell`, `RC_MAP`, `RC_MAP_W`, `RC_MAP_H`, `rcInitGrid`, `rcStart`, `rcStop`, `rcBuildMapFromGame`, `rcGetRoomAt`, `RC_ROOM_CENTERS`, `rcSprites`, `rcBuildSprites`, `rcSyncRoom`, `rcCheckPause`, `rcTeleportToRoom`, `rcPaused`, `rcUpdateRoomHud`, `rcInteract`, `RC_CELL`, `RC_SPRITE_DEFS`
- Ausnahmen ohne Prefix: `castRay()`, `setCell()`, `wallStyle()`, `isEdge()`, `isInnerEdge()`, `floorStyle()`, `ceilStyle()`, `renderMinimap()`, `updateHud()`, `renderFrame()`, `updatePlayer()`, `renderSprites()`, `initFocus()`
- `var` statt `let`/`const` für maximale Kompatibilität
- Alle Farben in `COLORS` (constants.js), Sprites in `RC_SPRITE_DEFS`
- Wandtypen: 1=Stein (violett), 2=Eldritch (teal/cyan mit Glitch-Symbolen)

## Map-Generierung (dynamisch)
```
rcBuildMapFromGame() — Liest G.map, baut RC_MAP:
  1. Jeder Raum (r,c) → Block von RC_CELL × RC_CELL Tiles
  2. Inneres aushöhlen (1,1 bis RC_CELL-1,RC_CELL-1)
  3. Wandtyp: Artefakt/Rückblick/Funk → Eldritch (2), sonst Stein (1)
  4. Korridore: 3 Tiles breite Öffnungen an geteilten Wänden
  5. RC_ROOM_CENTERS speichert Weltkoordinaten der Raummitte
  6. rcBuildSprites() erstellt Sprite-Liste aus Rauminhalten
```

## Raum-Erkennung
```
rcSyncRoom() — Wird pro Frame aufgerufen (wenn nicht pausiert):
  1. rcGetRoomAt(px, py) → {r, c} oder null
  2. Prüft ob neuer Raum via hasConn() erreichbar
  3. Synchronisiert G.map.pr/pc
  4. Markiert Raum als besucht
  5. Löst Kampf / Rückblick automatisch aus
  6. Aktualisiert HUD + Sprites + 2D-Map
```

## Sprite-System
```
rcBuildSprites() — Erzeugt rcSprites[] aus G.map:
  - Jeder ungelöste Raum mit content → Sprite an RC_ROOM_CENTERS[r,c]
  - RC_SPRITE_DEFS definiert Zeichen + Farbe pro content-Typ (Einzelzeichen-Modus)
  - RC_SPRITE_TEST = true (constants.js) → Test-Modus: alle LOVECRAFT_SPRITES +
    MUSHROOM_SPRITES + RPG_SPRITES auf Raum-Zentren verteilen statt normale Sprites

Sprite-Objekt-Format:
  { x, y, ch, color, type }               ← Normal (Einzelzeichen)
  { x, y, ch, color, type, sprite: def }  ← ASCII-Art (Multi-Zeilen)
    sprite = Eintrag aus LOVECRAFT_SPRITES / MUSHROOM_SPRITES / RPG_SPRITES
    sprite.frames = Array von Frames; jeder Frame = Array von Strings
    sprite.colorDim = Hintergrundfarbe (bgColor für opakes Sprite-Rechteck)

renderSprites(depthBuffer, time) — Billboard-Rendering:
  - Sortierung nach Distanz (weit → nah)
  - Projection auf Screen-Spalte
  - Depth-Test gegen Wand-Buffer
  - Schwebe-Animation + Glow-Pulsieren
  - Wenn .sprite.frames: Frame auf spriteH skalieren, Zeile für Zeile rendern,
    Leerzeichen innerhalb Bounding-Box mit bgColor=colorDim (opakes Rechteck)
  - Ohne .sprite: Einzelzeichen-Fallback (alter Pfad)

rcSpriteBlocks(px, py) — Kollision:
  - Radius SPRITE_BLOCK_RADIUS = 0.7 (map.js)
  - Wird in updatePlayer() für X und Y getrennt geprüft (wie Wandkollision)
```

## Externe Sprite-Dateien (Root-Verzeichnis)
| Datei | Inhalt | Ladereihenfolge |
|---|---|---|
| `lovecraft_sprites.js` | LOVECRAFT_SPRITES[], LOVECRAFT_ENCOUNTER_TABLE, getLovecraftSpriteById(), getLovecraftFrame(), scaleLovecraftFrame(), lovecraftRandomEncounter() | Nach game.js, vor raycaster/js/constants.js |
| `rpg_sprites.js` | MUSHROOM_SPRITES[], RPG_SPRITES[], MUSHROOM_IDS, getRpgSpriteById(), getGrowthFrame(), getRpgFrame(), scaleRpgFrame(), combineFramesSideBySide() | Nach game.js, vor raycaster/js/constants.js |

## Pause-System
```
rcCheckPause() — Prüft pro Frame:
  - #cbt-ov.on (Kampf) → rcPaused = true
  - #ev-ov.on (Event/Artefakt) → rcPaused = true
  - #end-ov.on (Ending) → rcPaused = true
  - Wenn Pause aufgehoben → Sprites + HUD refresh + Focus zurück
```

## HUD-System
```
#rc-hud enthält:
  - #rc-room-info: Raumbeschreibung (aus renderRoomInfo-Logik)
  - #rc-room-btns: Aktions-Buttons (.rc-btn, .rc-know, .rc-red, .rc-amb)
  - #rc-hud-bar: Steuerungshinweise + Wahnsinn-Balken (aus G.wahnsinn)
  
rcInteract() — Space/Enter: Führt Primäraktion des aktuellen Raums aus
rcUpdateRoomHud() — Aktualisiert Beschreibung + Buttons
```

## Loop-Steuerung
```
rcStart()  — rcBuildMapFromGame(), Grid init, Spieler zum Start-Raum, RAF starten
rcStop()   — rcRunning=false, RAF canceln
rcGameLoop → rcCheckPause() → updatePlayer(dt) → rcSyncRoom() → renderFrame(time)
renderFrame → Raycasting → Wände → Sprites → Minimap → HUD
```

## Integration ins Hauptspiel

| Funktion | Aufruf |
|---|---|
| `enterLabyrinth()` | Zeigt #rc-container, ruft `rcStop()` dann `rcStart()` |
| `returnToBase()` | Versteckt #rc-container, ruft `rcStop()` |
| `descendFloor()` | `rcStop()` → `rcStart()` (neue Map) |
| `endCombat()` | `rcBuildSprites()` + `rcUpdateRoomHud()` + Focus |
| `renderRoomInfo()` | Ruft `rcBuildSprites()` + `rcUpdateRoomHud()` am Ende |
| `lootRoom()`, `claimBaseRoom()`, etc. | Via `renderRoomInfo()` → Raycaster-Sync |

## Fallstricke
- **Script-Reihenfolge beachten** — constants.js muss zuerst, main.js zuletzt
- **G.map muss existieren** bevor rcBuildMapFromGame() aufgerufen wird
- **hasConn()** aus dem Hauptspiel (map.js) wird von Minimap und rcSyncRoom benötigt
- **rcPaused** verhindert Bewegung UND Raum-Erkennung während Overlays
- **RC_CELL = 8** — Raumgröße in Tiles. Ändern → alle Raumzentrums-Berechnungen betroffen
- **Sprites werden pro renderRoomInfo() neu gebaut** — kein separater Aufruf nötig
- **CSS für Hauptspiel** ist in `../style.css` (nicht in css/style.css) — scoped auf `#rc-container`
