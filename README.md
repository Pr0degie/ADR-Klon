# TIEF

Ein Browser-Dungeon-Crawler mit Terminal-Ästhetik. Kein Server, kein Build-Tool — einfach `index.html` öffnen.

## Spielprinzip

Du wachst in der verlassenen Forschungsanlage EOS auf. Unter dir liegen fünf Ebenen eines Labyrinths. Jede Ebene birgt ein Relikt. Sammle alle fünf.

Der Wahnsinn steigt. Die Zeichen an den Wänden verändern sich.

## Starten

```
index.html im Browser öffnen
```

Kein Build, keine Dependencies, kein Webserver nötig.

## Gameplay

**Basis-Phase**
- Trümmer durchsuchen → Metall, Holz, Stoff, Nahrung
- Werkbank bauen → Waffen, Rüstung, Verband, Notration craften
- Lagerfeuer bauen → rasten, HP regenerieren
- Fackel craften → Zeichen an den Wänden werden sichtbar

**Labyrinth**
- Prozedural generierte Karte pro Ebene (5×3 Raster, Prim-Algorithmus)
- Räume: Lager, Gegner, Artefakt, Treppe
- Kampf rundenbasiert: Angreifen / Ausweichen / Analysieren / Fliehen
- Artefakt finden → Treppe erscheint → nächste Ebene

**Wahnsinn**
- Steigt durch Relikte, Kampfniederlagen, bestimmte Events
- Ab 30%: Zeichen an der Wand werden beunruhigender
- Ab 55%: Lognachrichten beginnen sich zu entstellen
- Ab 60%: Phantom-Einträge erscheinen im Log
- Ab 75%: Wortsplitter tauchen in den Zeichen auf

## Projektstruktur

```
index.html      — HTML-Struktur
style.css       — Styles und Animationen

data.js         — Alle Texte, ASCII-Art, Konstanten
                  (ARTIFACTS, ENEMY_TIERS, BASE_EVENTS, ZEICHEN_SETS …)
map.js          — Kartengenerierung und -rendering
state.js        — Spielzustand (G), Tick-Engine, Unlock-System
combat.js       — Kampfsystem
base.js         — Basis-Phase: suchen, bauen, craften, Zeichen, Events
explore.js      — Labyrinth: Bewegung, Räume, Loot, Kämpfe auslösen
game.js         — Artefakt-Events, Ending, Stats, Log, Boot-Sequenz
```

## Ressourcen

| Ressource | Fundort | Verwendung |
|-----------|---------|------------|
| Metall | Trümmer, Gegner, Lagerräume | Werkbank, Waffen, Rüstung |
| Holz | Trümmer (zufällig) | Fackel, Lagerfeuer, Klingen |
| Stoff | Trümmer (zufällig) | Verband, Rüstung, Lagerfeuer |
| Nahrung | Trümmer (selten), Gegner | Notration |

## Techstack

Vanilla HTML / CSS / JavaScript. Keine Frameworks, keine Dependencies.
