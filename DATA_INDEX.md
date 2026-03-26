# TIEF — data.js Index

> data.js ist 28 KB / 626 Zeilen — nie komplett lesen.
> Hier Zeile nachschlagen, dann offset/limit verwenden.

## Blöcke

| Zeile | bis | Konstante | Inhalt |
|------:|----:|-----------|--------|
| 7 | 9 | `GRID_W`, `GRID_H` | Map-Größe (5×3) |
| 10 | 104 | `ARTIFACTS` | 5 Artefakte mit id, name, desc, curse, lore |
| 105 | 165 | `ENEMY_TIERS` | Gegner (hp, atk, def, xp, img, floor) |
| 166 | 179 | `EMPTY_FLAVORS` | Flavor-Texte leere Räume |
| 180 | 190 | `ZEICHEN_SETS` | 4 Wahnsinn-Tiers (syms[], cls) |
| 191 | 208 | `ZEICHEN_DESC` | Beschreibungen der Zeichen |
| 209 | 479 | `BASE_EVENTS` | 11 Basis-Random-Events mit choices |
| 480 | 493 | `CURSE_DEFS` | 4 Flüche: stimmen/erschöpfung/hunger/blutung |
| 494 | 514 | `SYNERGY_CHECKS` | 5 Artefakt-Kombo-Boni |
| 515 | 525 | `COMPANION_LINES` | Begleiter-Dialoge |
| 526 | 533 | `SURVIVOR_DEFS` | 5 Survivor-Typen |
| 534 | 541 | `PILZ_WHISPERS` | Flüster-Texte Pilzkammer |
| 542 | 600 | `FUNK_EVENTS` | 3 Funkkabinen-Events |
| 601 | 606 | `PHANTOM_LINES` | Phantom-Log bei Wahnsinn |
| 607 | 615 | `phantomLog()` | Phantom-Log Funktion |
| 616 | 626 | `maybeScramble(text)` | Text-Entstellung ab Wahnsinn 55 |

## Schnell-Referenz

| Aufgabe | offset | limit |
|---------|-------:|------:|
| Neues Artefakt hinzufügen | 10 | 95 |
| Neuen Gegner hinzufügen | 105 | 61 |
| Neuen BASE_EVENT hinzufügen | 209 | 271 |
| Neuen FUNK_EVENT hinzufügen | 542 | 59 |
| Fluch-Definition ändern | 480 | 14 |
| Neue Synergie hinzufügen | 494 | 21 |
| Zeichen-Symbole ändern | 180 | 11 |
| PHANTOM_LINES ergänzen | 601 | 6 |

## Datenstrukturen

**Artefakt:**
```js
{ id, name, ascii, desc, lore, curse, effect }
```

**BASE_EVENT:**
```js
{ id, title, text, choices: [{ label, outcome, fn }] }
```

**ENEMY_TIER:**
```js
{ id, name, hp, atk, def, xp, gold, img, floor }
```

**CURSE_DEF:**
```js
{ name, desc, tick: () => { /* Effekt alle 500ms */ } }
```
