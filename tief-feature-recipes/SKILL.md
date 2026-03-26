---
name: tief-feature-recipes
description: >
  TIEF-Projekt: Schritt-für-Schritt-Rezepte für häufige Änderungen die
  mehrere Dateien gleichzeitig betreffen. Lese diesen Skill BEVOR du
  ein neues Feature implementierst — sonst vergisst du garantiert eine Datei.
---

# TIEF — Feature-Rezepte

---

## Neue Ressource hinzufügen

**3 Stellen, alle zwingend:**

1. `state.js:28` — G-Objekt, `G.res` erweitern:
   ```js
   res: { metall: 0, holz: 0, stoff: 0, nahrung: 0, NEUE_RES: 0 }
   ```

2. `game.js:194` — `renderStats()`, `resConfig`-Array erweitern:
   ```js
   { key: 'NEUE_RES', label: 'Neue Res', col: 'var(--white)' }
   ```

3. `state.js:185` — `checkUnlocks()`, Unlock-Bedingung hinzufügen:
   ```js
   if (G.res.NEUE_RES > 0 && !G.unlocked.neue_res) { ... }
   ```

---

## Neues Craft-Item hinzufügen

**1–2 Stellen:**

1. `state.js:62` — `G.craftItems` erweitern:
   ```js
   neues_item: {
     label: 'Bezeichnung',
     cost: { holz: 5, metall: 2 },
     desc: 'Beschreibung',
     effect: () => { /* Effekt */ },
     maxBuild: 1,                          // optional
     requiresSurvivor: 'schmied',          // optional
     requiresBaseRoom: 'waffenlager'       // optional
   }
   ```

2. Nur wenn `requiresBaseRoom` gesetzt: sicherstellen dass der Raum in
   `G.baseRooms` existiert (`state.js:28`).

`renderCraft()` und `doCraft()` erledigen den Rest automatisch — kein
weiterer Code nötig.

---

## Neues Gebäude (Building) hinzufügen

**2 Stellen:**

1. `state.js:28` — `G.buildings` erweitern:
   ```js
   neues_gebaeude: { count: 0, survivorSlots: 0, label: 'Name', cost: { holz: 10 } }
   ```

2. `base.js:189` — `renderBuild()` liest `G.buildings` dynamisch →
   automatisch sichtbar. Nur anfassen wenn Sonderlogik nötig.

---

## Neuen Survivor-Typ hinzufügen

**3 Stellen:**

1. `data.js:526` — `SURVIVOR_DEFS` erweitern:
   ```js
   neuer_typ: { label: 'Name', desc: 'Effekt-Beschreibung' }
   ```

2. `state.js` — Effekt einbauen wo er greift (z.B. in `tick()`:130
   für Passiv-Effekte, oder in der relevanten Aktion).

3. `explore.js:345` — `claimSurvivor()` prüfen ob Typ-spezifische
   Logik beim Rekrutieren nötig ist.

---

## Neues DOM-Element hinzufügen

**2–3 Stellen, alle zwingend:**

1. `index.html` — Element eintragen (richtige Position im Panel).

2. `explore.js:7` — `enterLabyrinth()`: Element bei Labyrinth-Eintritt
   ausblenden falls es nur in der Basis sichtbar sein soll:
   ```js
   document.getElementById('neues-element').style.display = 'none';
   ```

3. `explore.js:77` — `returnToBase()`: Element beim Zurückkehren
   wieder einblenden:
   ```js
   document.getElementById('neues-element').style.display = '';
   ```

---

## Neuen BASE_EVENT hinzufügen

**1 Stelle:**

`data.js:209` — `BASE_EVENTS`-Array, neuen Eintrag hinzufügen:
```js
{
  id: 'event_id',
  title: 'Titel',
  text: 'Beschreibungstext...',
  choices: [
    { label: 'Option A', outcome: 'Ergebnis A', fn: () => { G.res.holz += 5; } },
    { label: 'Option B', outcome: 'Ergebnis B', fn: () => { G.wahnsinn += 10; } }
  ]
}
```

`maybeBaseEvent()` (base.js:289) wählt automatisch aus dem Pool.

---

## Neuen FUNK_EVENT hinzufügen

**1 Stelle:**

`data.js:542` — `FUNK_EVENTS`-Array erweitern. Gleiche Struktur wie
BASE_EVENT. Wird von `doFunk()` (base.js:132) ausgelöst.

---

## Neues Artefakt hinzufügen

**2 Stellen:**

1. `data.js:10` — `ARTIFACTS`-Array erweitern:
   ```js
   {
     id: 'neues_id',
     name: 'Artefakt-Name',
     ascii: ['  /\\  ', ' /  \\ '],   // ASCII-Art Zeilen
     desc: 'Kurzbeschreibung',
     lore: 'Lore-Text im Event',
     curse: 'hunger',               // → CURSE_DEFS key
   }
   ```

2. Optional: `data.js:494` — `SYNERGY_CHECKS` erweitern wenn das
   Artefakt an einer Kombo beteiligt sein soll.

⚠️ Aktuell gibt es 5 Artefakte für 5 Floors. Mehr Artefakte →
`descendFloor()` (game.js:16) und `triggerEnding()` (game.js:115)
prüfen ob Floor-Count-Logik angepasst werden muss.

---

## Neuen Fluch hinzufügen

**2 Stellen:**

1. `data.js:480` — `CURSE_DEFS` erweitern:
   ```js
   neuer_fluch: {
     name: 'Fluchname',
     desc: 'Beschreibung',
     tick: () => { /* Effekt alle 500ms */ }
   }
   ```

2. Einem Artefakt zuweisen: `data.js:10` — `ARTIFACTS[x].curse = 'neuer_fluch'`.

---

## Neuen Floor-Typ / neue Ebene

**Mehrere Stellen — aufwendig:**

1. `state.js:28` — `G.floor` max prüfen (aktuell 0–4 = 5 Ebenen).
2. `explore.js:389` — `spawnSpecialRooms()`: Floor-spezifische Sonderräume.
3. `game.js:16` — `descendFloor()`: Ending-Trigger bei letztem Floor.
4. `data.js:10` — Artefakt für neuen Floor hinzufügen.
5. `raycaster/js/constants.js` — ggf. neue Wandtypen/Farben für den Floor.

---

## Wahnsinn-Effekt im Raycaster hinzufügen

**2 Stellen:**

1. `raycaster/js/render.js:11` — `wallStyle()`: Glitch-Effekt abhängig
   von `G.wahnsinn` einbauen (z.B. Zeichen-Swap ab Schwelle).
2. `raycaster/js/map.js:117` — `rcBuildSprites()`: Halluzinations-Sprites
   ab bestimmtem Wahnsinn-Level spawnen.
