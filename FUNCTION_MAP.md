# TIEF — Funktions-Map

> Zeilennummern-Index für alle JS-Dateien.
> Vor jedem Read: hier nachschlagen → dann nur offset/limit lesen.

## base.js (331 Zeilen)

| Zeile | Funktion |
|------:|---------|
| 6 | `stationArt(t)` |
| 18 | `renderBaseArt()` |
| 23 | `renderBaseActions()` |
| 45 | `doSearch()` |
| 94 | `doRest()` |
| 111 | `renderSurvivors()` |
| 132 | `doFunk()` |
| 144 | `renderPilzraum()` |
| 156 | `harvestPilze()` |
| 189 | `renderBuild()` |
| 209 | `doBuild(key)` |
| 220 | `renderCraft()` |
| 241 | `doCraft(key)` |
| 256 | `renderZeichen()` |
| 289 | `maybeBaseEvent()` |
| 303 | `fireBaseEvent(ev)` |
| 320 | `resolveBaseEvent(choiceIdx)` |

## combat.js (128 Zeilen)

| Zeile | Funktion |
|------:|---------|
| 6 | `updateCombatUI()` |
| 29 | `setCombatMsg(msg, col)` |
| 35 | `cbtAct(action)` |
| 97 | `endCombat(won)` |
| 115 | `checkLevelUp()` |

## explore.js (428 Zeilen)

| Zeile | Funktion |
|------:|---------|
| 7 | `enterLabyrinth()` |
| 77 | `returnToBase()` |
| 117 | `renderMapUI()` |
| 121 | `renderRoomInfo()` |
| 156 | `roomTypeName(content, room)` |
| 171 | `renderMoveButtons()` |
| 218 | `movePlayer(r, c)` |
| 243 | `lootRoom(r, c)` |
| 264 | `takeArtifact(r, c)` |
| 297 | `fightRoom(r, c)` |
| 317 | `claimPilzraum(r, c)` |
| 325 | `claimBaseRoom(r, c, type)` |
| 345 | `claimSurvivor(r, c)` |
| 363 | `showRückblick(r, c)` |
| 384 | `closeRückblick()` |
| 389 | `spawnSpecialRooms()` |
| 419 | `useLeuchtsporen()` |

## game.js (318 Zeilen)

| Zeile | Funktion |
|------:|---------|
| 6 | `journalAdd(text)` |
| 16 | `descendFloor()` |
| 58 | `showArtifactEvent(artDef, onDone)` |
| 78 | `closeArtifactEvent()` |
| 115 | `triggerEnding()` |
| 144 | `triggerAltEnding()` |
| 176 | `renderCurses()` |
| 194 | `renderStats()` |
| 253 | `log(msg, col)` |
| 271 | `updateFooter()` |
| 286 | `boot()` |

## map.js (178 Zeilen)

| Zeile | Funktion |
|------:|---------|
| 6 | `makeRng(seed)` |
| 17 | `generateFloor(floorIdx)` |
| 74 | `neighbors(r, c, W, H)` |
| 80 | `hasConn(conns, r1,c1,r2,c2)` |
| 87 | `bfsDist(sr, sc, placed, conns)` |
| 107 | `renderMap()` |

## state.js (279 Zeilen)

| Zeile | Inhalt |
|------:|--------|
| 6 | `canAfford(cost)` |
| 10 | `formatCost(cost, affordable)` |
| 17 | `hasSurvivor(type)` |
| 21 | `getSurvivorSlots()` |
| 28 | `const G = { ... }` — G-Objekt Definition |
| 62 | `G.craftItems: { ... }` — Craft-Rezepte |
| 126 | `startEngine()` |
| 130 | `tick()` |
| 185 | `checkUnlocks()` |

## Raycaster — raycaster/js/

### map.js (235 Zeilen)
| Zeile | Funktion |
|------:|---------|
| 18 | `rcBuildMapFromGame()` |
| 117 | `rcBuildSprites()` |
| 192 | `rcGetRoomAt(px, py)` |
| 213 | `rcSpriteBlocks(px, py)` |
| 223 | `rcIsWall(x, y)` |
| 230 | `rcGetCell(x, y)` |

### grid.js
| Zeile | Funktion |
|------:|---------|
| 14 | `rcInitGrid()` |
| 41 | `setCell(y, x, ch, color, bgColor)` |

### player.js
| Zeile | Funktion |
|------:|---------|
| 17 | `updatePlayer(dt)` |

### raycast.js
| Zeile | Funktion |
|------:|---------|
| 22 | `castRay(ox, oy, angle)` |

### render.js (260 Zeilen)
| Zeile | Funktion |
|------:|---------|
| 11 | `wallStyle(dist, side, wallType, time)` |
| 46 | `isEdge(wallHeights, col)` |
| 53 | `isInnerEdge(wallHeights, col)` |
| 60 | `floorStyle(row)` |
| 68 | `ceilStyle(row)` |
| 84 | `renderSprites(depthBuffer, time)` |
| 202 | `resetCthulhuPos()` — leert _cthulhuTestPos-Cache (Aufruf in rcStart) |
| 204 | `_drawCthulhuBillboard(depthBuffer)` — Cthulhu-PNG-Billboard via Canvas-Overlay |

### minimap.js
| Zeile | Funktion |
|------:|---------|
| 12 | `renderMinimap()` |
| 115 | `rcGetMinimapIcon(room)` |

### hud.js (142 Zeilen)
| Zeile | Funktion |
|------:|---------|
| 14 | `updateHud(time)` |
| 41 | `rcUpdateRoomHud()` |
| 125 | `rcInteract()` |

### main.js (266 Zeilen)
| Zeile | Funktion |
|------:|---------|
| 22 | `rcSyncRoom()` |
| 92 | `rcCheckPause()` |
| 117 | `renderFrame(time)` |
| 184 | `rcGameLoop(timestamp)` |
| 206 | `rcStart()` |
| 248 | `rcStop()` |
| 259 | `rcTeleportToRoom(r, c)` |

## Sprite-Dateien — NIE komplett lesen

| Datei | Größe | Hilfsfunktionen ab Zeile |
|-------|------:|--------------------------|
| `rpg_sprites.js` | 18 KB | 549 |
| `lovecraft_sprites.js` | 15 KB | 334 |
