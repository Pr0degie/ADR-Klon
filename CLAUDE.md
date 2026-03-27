# TIEF — Claude-Kontext

## Projekt
Browser-Dungeon-Crawler, Vanilla HTML/CSS/JS, keine Dependencies, kein Build-Tool.
Öffnen via `index.html`. Sprache: Deutsch (UI, Texte, Lognachrichten).

**Inspiriert von:** A Dark Room, Candybox. **Visuell:** Effulgence RPG (Terminal-Ästhetik, ASCII-Art). **Thematisch:** H.P. Lovecraft (kosmischer Horror, Wahnsinn als Spielmechanik).

## Ordnerstruktur

```
TIEF/
├── CLAUDE.md                      ← Diese Datei
├── FUNCTION_MAP.md                ← Alle Funktionen mit Zeilennummern
├── DATA_INDEX.md                  ← data.js Blöcke mit Zeilennummern
├── tief-feature-recipes/SKILL.md  ← Rezepte für Multi-Datei-Änderungen
├── index.html       ← DOM-Struktur (IDs → siehe unten)
├── style.css        ← Styles + Raycaster-CSS (CSS-Vars → siehe unten)
├── js/              ← Spiellogik
│   ├── data.js      ← Texte, Konstanten (→ DATA_INDEX.md)
│   ├── map.js       ← Kartengenerierung
│   ├── state.js     ← G-Objekt, Tick-Engine, Unlocks
│   ├── combat.js    ← Kampfsystem
│   ├── base.js      ← Basis-Phase
│   ├── explore.js   ← Labyrinth-Phase
│   └── game.js      ← Boot, Endings, Stats, Log
├── sprites/         ← Sprite-Datendateien (groß, selten bearbeitet)
│   ├── lovecraft_sprites.js
│   └── rpg_sprites.js
└── raycaster/       ← First-Person-Ansicht (→ raycaster/CLAUDE.md)
```

**Script-Ladereihenfolge:** `js/data.js` → `js/map.js` → `js/state.js` → `js/combat.js` → `js/base.js` → `js/explore.js` → `js/game.js` → `sprites/lovecraft_sprites.js` → `sprites/rpg_sprites.js` → dann 10 Raycaster-Scripts (constants → map → grid → input → player → raycast → render → minimap → hud → main)

## Spielzustand (G)

```
G.res            — { metall, holz, stoff, nahrung }
G.player         — { hp, maxHp, atk, def, lvl, xp, xpNext, weapon }
G.wahnsinn       — 0–100, beeinflusst Zeichen + Log-Scrambling
G.time           — Tick-Zähler (500ms-Schritte), used in checkUnlocks
G.unlockedExplore — boolean, wird von doCraft() gesetzt wenn erste Waffe gebaut
G.fackelAktiv    — true = Zeichen sichtbar
G.buildings      — { werkbank, lagerfeuer, unterkunft }
G.craftItems     — alle Craft-Rezepte mit cost, effect, maxBuild
G.unlocked       — { gather, werkstatt, craft, explore, stats, holz, stoff,
                     nahrung, lagerfeuer, zeichen, curses, pilzraum, survivors,
                     schmied, waffenlager, funkkabine, schlafkammer,
                     wasserleitung, firstKill, rückblick }
G.phase          — 'boot' | 'base' | 'explore'
G.floor          — 0-indexed, 0–4 (5 Ebenen)
G.survivors      — Array von {type} Objekten (schmied, heiler, wächter, sammler, kartograf)
G.baseRooms      — { wasserleitung, schlafkammer, funkkabine, waffenlager } — boolean
G.pilzraum       — boolean, Pilzkammer gefunden
G.leuchtsporen   — Anzahl geernteter Leuchtsporen
G.curses         — Array aktiver Flüche [{id, ...}]
G.curseCooldowns — Cooldown-Tracker pro Fluch-ID
G.journal        — Array von Einträgen (journalAdd() in game.js)
G.floorsCleared  — Array von Floor-Indizes wo Artefakt bereits genommen
```

## Konventionen
- **Dateien nicht erneut lesen** — Bei großen Dateien `offset/limit` verwenden. Funktionen → `FUNCTION_MAP.md`, data.js → `DATA_INDEX.md`
- Alle Spieltexte auf **Deutsch**
- Kein Framework, kein npm, kein Build
- `onclick="..."` in HTML direkt auf globale Funktionen — funktioniert weil keine ES-Module
- Craft-Items: `G.craftItems` in `state.js` + optional `requiresSurvivor`/`requiresBaseRoom` → Rest automatisch
- Base-Events: Eintrag in `BASE_EVENTS` in `data.js` reicht
- CSS-Variablen für alle Farben in `:root` — nie Hex-Werte hardcoden

## Render-Pipeline
Kein Reactivity-System — Änderungen manuell rendern:

```
Ressource geändert   → renderStats()
Craft/Build geändert → renderCraft() + renderBuild()
Base-Aktionen        → renderBaseActions()
Karte / Raum         → renderMapUI() + renderRoomInfo()
Zeichen              → renderZeichen() (auto via renderBaseArt() alle 500ms)
Flüche               → renderCurses() (auto via renderStats())
```

`tick()` läuft alle 500ms: `checkUnlocks()` → `renderStats()` → `updateFooter()` → (wenn base) `renderBaseArt()`.

`log(msg, col)` — col-Werte: `null` (--text), `'amber'`, `'green'`, `'metal'`, `'know'`, `'red'`, `'red2'`, `'horror'`, `'dim'`

## Fallstricke
- **Keine ES-Module** (`import`/`export`) — `onclick="..."` Handler funktionieren dann nicht mehr
- **Script-Reihenfolge** — `data.js` vor allem, `state.js` vor `base.js`
- **`checkUnlocks()` manipuliert DOM direkt** — `craft-section`, `stats-sec`, `zeichen-section`, `curses-sec`, `pilzraum-sec`, `survivor-sec` werden automatisch ein-/ausgeblendet. Diese Elemente nie manuell zeigen/verstecken.
- **Neues DOM-Element** → in `index.html` + in `enterLabyrinth()`/`returnToBase()` (explore.js) ein-/ausblenden
- **Neue Ressource** → `G.res` (state.js) + `renderStats()` resConfig (game.js) + `checkUnlocks()` (state.js) — alle 3 Stellen!
- **Raycaster-CSS ist in style.css** — scoped auf `#rc-container`, kein separates Link-Tag

## Overlay-Globals
Beide Overlay-Typen teilen `#ev-ov`. Nie direkt DOM prüfen — immer über Globals:

| Global | Gesetzt in | Gelesen in | Zweck |
|--------|-----------|------------|-------|
| `window._activeBaseEvent` | `fireBaseEvent()` | `resolveBaseEvent()` | Aktives Base-Event |
| `window._evCallback` | `showArtifactEvent()` | `closeArtifactEvent()` | Callback nach Artefakt-Event |
| `window._evArtDef` | `showArtifactEvent()` | `closeArtifactEvent()` | Artefakt-Definition im Event |

## Survivor-System
Typen: `schmied`, `heiler`, `wächter`, `sammler`, `kartograf`. Slots via `getSurvivorSlots()` (Lagerfeuer +1, Unterkunft +2). Effekte: Schmied → Metall-Crafts sichtbar; Heiler → doRest +40%; Wächter → DEF +2 bei Rekrutierung; Sammler → passiv Ressource alle 30s; Kartograf → Karte enthüllt.

## Basis-Räume (Explore-Funde)
| Raum | Floor | Effekt |
|------|-------|--------|
| Pilzkammer | 0 | Ernte: Nahrung, Stoff, Leuchtsporen (8% rare), Wahnsinn-Reduktion |
| Wasserleitung | 1 | Passiv alle 25s: +2 Nahrung — Reparatur kostet 20 Metall |
| Schlafkammer | 2 | doRest heilt ×1.5 |
| Funkkabine | 3 | `doFunk()` → FUNK_EVENTS Pool |
| Waffenlager | 4 | Panzerplatte + Schwertstahl craftbar (req. Schmied) |

Craft-Gates: `requiresSurvivor: 'schmied'` oder `requiresBaseRoom: 'pilzraum'|'waffenlager'`.
Frühspiel: Werkbank kostet Holz+Stoff. Erste Waffe = Holzknüppel (8 Holz) → schaltet Explore frei. Metall erst relevant mit Schmied.

## Flüche & Synergien
`CURSE_DEFS` in data.js: `stimmen`, `erschöpfung`, `hunger`, `blutung` — tick-Effekt alle 500ms. `sporentrank` (craft) entfernt ältesten Fluch. `SYNERGY_CHECKS[]`: 4 Artefakt-Kombos mit Boni.

## Wahnsinn-Schwellen
| % | Effekt |
|---|--------|
| 30 | Zeichen-Tier → amber/arkanes |
| 55 | Log-Texte entstellen (maybeScramble) |
| 60 | Zeichen-Tier → rot, Phantom-Log-Einträge |
| 75 | Wortsplitter in Zeichen |
| 80 | Zeichen-Tier Horror + Flicker |
| 90 | Alt-Ending beim letzten Artefakt (triggerAltEnding) |

## Aktueller Stand
Raycaster ersetzt 2D-Karte vollständig. Map dynamisch aus G.map (8×8 Tiles/Raum, 3-Tile-Korridore). Sprites für Items/Gegner/Treppen. HUD mit Aktions-Buttons. Kampf/Event-Overlays pausieren Bewegung.
Details → `raycaster/CLAUDE.md`. Nächste Schritte: Wahnsinn-Effekte im Raycaster, Sound, Wand-Texturen pro Ebene.

---

## DOM-IDs Schnell-Referenz

| ID | Panel | Inhalt |
|----|-------|--------|
| `#hdr` | Header | Gesamter Header |
| `#floor-num` | Header | Aktuelle Ebenennummer |
| `#mad-hdr` | Header | Wahnsinn-Anzeige oben |
| `#lpanel` | Links | Log-Panel |
| `#log` | Links | Log-Nachrichten |
| `#cpanel` | Mitte | Haupt-Content |
| `#base-art` | Mitte | ASCII-Stations-Art |
| `#scene-desc` | Mitte | Szenen-Beschreibung |
| `#actions` | Mitte | Aktions-Buttons (Suchen/Ausruhen) |
| `#zeichen-section` | Mitte | Zeichen-Container |
| `#zeichen-display` | Mitte | Zeichen-Symbole |
| `#zeichen-desc` | Mitte | Zeichen-Beschreibungstext |
| `#craft-section` | Mitte | Bau + Craft Container |
| `#build-list` | Mitte | Gebäude-Liste |
| `#craft-title` | Mitte | "// fertigung" Titel |
| `#craft-list` | Mitte | Craft-Items |
| `#pilzraum-sec` | Mitte | Pilzkammer-Sektion |
| `#survivor-sec` | Mitte | Survivor-Liste |
| `#map-wrap` | Mitte | Karten-Container (2D-Fallback) |
| `#map-floor-num` | Mitte | Floor-Nummer auf Karte |
| `#map-grid` | Mitte | ASCII-Karte |
| `#room-desc` | Mitte | Raum-Beschreibung (2D) |
| `#move-btns` | Mitte | Bewegungs-Buttons (2D) |
| `#rc-container` | Mitte | Raycaster-Container |
| `#rc-hud` | Raycaster | HUD-Overlay |
| `#rc-room-info` | Raycaster | Raumbeschreibung im HUD |
| `#rc-room-btns` | Raycaster | Aktions-Buttons im HUD |
| `#rc-hud-bar` | Raycaster | Steuerungshinweise + Wahnsinn-Balken |
| `#rpanel` | Rechts | Stats-Panel |
| `#res-list` | Rechts | Ressourcen-Liste |
| `#wahn-bar-wrap` | Rechts | Wahnsinn-Balken Container |
| `#wahn-pct` | Rechts | Wahnsinn-Prozentzahl |
| `#wahn-fill` | Rechts | Wahnsinn-Balken Füllung |
| `#stats-sec` | Rechts | Spieler-Stats Sektion |
| `#stats-list` | Rechts | Stats-Liste |
| `#artifact-sec` | Rechts | Artefakt-Sektion |
| `#artifact-list` | Rechts | Artefakt-Liste |
| `#curses-sec` | Rechts | Aktive Flüche |
| `#ftr` | Footer | Gesamter Footer |
| `#ft-phase` | Footer | Aktuelle Phase |
| `#ft-room` | Footer | Raum-Info Container |
| `#ft-roomtype` | Footer | Raumtyp-Text |
| `#ft-shift` | Footer | Schicht-Anzeige |
| `#ft-time` | Footer | Spielzeit |
| `#ev-ov` | Overlay | Event-Overlay (Base + Artefakt) |
| `#cbt-ov` | Overlay | Kampf-Overlay |
| `#end-ov` | Overlay | Ending-Overlay |

---

## CSS-Variablen Schnell-Referenz

| Variable | Hex | Verwendung |
|----------|-----|------------|
| `--bg` | `#020408` | Hintergrund |
| `--bg2` | `#050810` | Sekundärer Hintergrund |
| `--text` | `#b8c8d8` | Haupttext |
| `--dim` | `#647888` | Sekundärer Text |
| `--dim2` | `#0e1218` | Fast unsichtbar |
| `--green` | `#48c070` | Positiv, Erfolg |
| `--teal` | `#206050` | Akzent, Raycaster-Wände |
| `--red` | `#d03038` | Gefahr, Schaden |
| `--red2` | `#ff5058` | Heller Rot-Akzent |
| `--horror` | `#c03040` | Hoher Wahnsinn, Fehler |
| `--amber` | `#b87820` | Warnungen, Kosten |
| `--know` | `#6840b8` | Wissen/Lore (dunkel) |
| `--know2` | `#a070f0` | Wissen/Lore (hell) |
| `--metal` | `#5878a0` | Metall-Ressource |
| `--cyan` | `#2898c8` | Hervorhebung |
| `--white` | `#c8d0d8` | Weiß-Akzent |
| `--holz` | `#8a5c2a` | Holz-Ressource |
| `--stoff` | `#7a6888` | Stoff-Ressource |
| `--nahr` | `#5a8840` | Nahrung-Ressource |
