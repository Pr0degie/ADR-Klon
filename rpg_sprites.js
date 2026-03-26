// rpg_sprites.js
// Umgebungs- und NPC-Sprites für TIEF
// Kein import/export — alle Variablen global
// Ladereihenfolge: nach data.js, vor raycaster-Scripts
//
// Enthält:
//   MUSHROOM_SPRITES  — 5 Pilz-Varianten, je 4 Wachstums-Frames (0=Keim … 3=ausgewachsen)
//   RPG_SPRITES       — Wasserrohr, Schmied, Heiler
//   MUSHROOM_IDS      — Array aller Pilz-IDs
//
// Wachstums-Frame direkt per Index ansprechen:
//   var frame = sprite.frames[G.pilzWachstum];  // 0–3
//
// Passend zu G.baseRooms, G.pilzraum, G.survivors (schmied, heiler)

// ══════════════════════════════════════════════
//  PILZE
// ══════════════════════════════════════════════

var MUSHROOM_SPRITES = [

  {
    id: 'mushroom-red',
    name: 'Roter Fliegenpilz',
    lore: 'Giftig. Verursacht Wahnsinn-Schaden bei Verzehr — aber Leuchtsporen-Ausbeute ist hoch.',
    color:       '#ef4444',
    colorDim:    '#7f1d1d',
    colorBright: '#fca5a5',
    width: 15,
    height: 9,
    frames: [
      // Frame 0 — Keim
      [
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "     ,',       ",
        "     \\_/       "
      ],
      // Frame 1 — klein
      [
        "               ",
        "               ",
        "               ",
        "               ",
        "    _,o,_      ",
        "   ( \\-/ )     ",
        "    |   |      ",
        "   ,|   |,     ",
        "   \\_____/     "
      ],
      // Frame 2 — mittel
      [
        "               ",
        "               ",
        "   __,,,__     ",
        "  / o . o \\    ",
        " |  . o .  |   ",
        "  \\_______/    ",
        "     | | |     ",
        "  ,-/___|\\ -,  ",
        "  \\_______/    "
      ],
      // Frame 3 — ausgewachsen
      [
        "   ___,,,___   ",
        "  / o  .  o \\  ",
        " | .  o  .  o| ",
        "|o  . o .  .  |",
        " \\___________/ ",
        "     || ||     ",
        "     ||_||     ",
        "  ,-/     \\-,  ",
        "  \\_________/  "
      ]
    ]
  },

  {
    id: 'mushroom-blue',
    name: 'Blauer Traumschwamm',
    lore: 'Sporen verursachen Halluzinationen. Wahnsinn steigt — aber auch Einsicht.',
    color:       '#60a5fa',
    colorDim:    '#1e3a5f',
    colorBright: '#bfdbfe',
    width: 15,
    height: 9,
    frames: [
      [
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "      .        ",
        "     (|)       "
      ],
      [
        "               ",
        "               ",
        "               ",
        "               ",
        "     _~_       ",
        "    (   )      ",
        "     | |       ",
        "    _|_|_      ",
        "   (_____) "
      ],
      [
        "               ",
        "     *  *      ",
        "    _,~~~,_    ",
        "   /  . .  \\   ",
        "  ( .  *  . )  ",
        "   \\_______/   ",
        "     |   |     ",
        "  ,-/---|-\\-,  ",
        "  \\_______/    "
      ],
      [
        "  * . * . * .  ",
        "   _,,~~~,,_   ",
        "  /  * . *  \\  ",
        " | . * ~ * . | ",
        "  \\___~_~___/  ",
        "   *  | |  *   ",
        "      |_|      ",
        "  ,-/     \\-,  ",
        "  \\_______/    "
      ]
    ]
  },

  {
    id: 'mushroom-gold',
    name: 'Goldener Kaiserpilz',
    lore: 'Sehr wertvoll. Händler und der Schmied zahlen gut dafür.',
    color:       '#fbbf24',
    colorDim:    '#92400e',
    colorBright: '#fde68a',
    width: 15,
    height: 9,
    frames: [
      [
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "       ,       ",
        "      (u)      ",
        "     _/_\\_     "
      ],
      [
        "               ",
        "               ",
        "               ",
        "     _,_,_     ",
        "    /     \\    ",
        "   ( gold  )   ",
        "    \\     /    ",
        "     |   |     ",
        "    /|___|\\    "
      ],
      [
        "               ",
        "    __,,,__    ",
        "   /  $$$  \\   ",
        "  | $$   $$ |  ",
        "  |  $$$$$  |  ",
        "   \\_______/   ",
        "     |   |     ",
        "    _|___|_    ",
        "   (_______)   "
      ],
      [
        "  _,,$,,,$$_   ",
        " / $$ $$$ $$ \\ ",
        "|$  $$   $$  $|",
        "|  $ $$$$$ $  |",
        " \\$___$$$___$/ ",
        "   $  | |  $   ",
        "      |_|      ",
        "  ,$-/   \\-$,  ",
        "  \\_________/  "
      ]
    ]
  },

  {
    id: 'mushroom-dark',
    name: 'Schwarzer Schattenpilz',
    lore: 'Wächst nur dort, wo Blut vergossen wurde. Zutat für den Sporentrank.',
    color:       '#a3a3a3',
    colorDim:    '#262626',
    colorBright: '#d4d4d4',
    width: 15,
    height: 9,
    frames: [
      [
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "               ",
        "     `'`       ",
        "     /|\\       "
      ],
      [
        "               ",
        "               ",
        "               ",
        "               ",
        "    _,-,_      ",
        "   / x x \\     ",
        "   \\_____/     ",
        "     |||       ",
        "    /|||\\      "
      ],
      [
        "               ",
        "    __,x,__    ",
        "   / x   x \\   ",
        "  | x  x  x |  ",
        "   \\___ ___/   ",
        "      |||      ",
        "      |||      ",
        "  ,-/||||\\ -,  ",
        "  \\_______/    "
      ],
      [
        "  __,,xxx,,__  ",
        " /  x  x  x  \\ ",
        "| x  xxx  x  | ",
        "|  x  x  x   | ",
        " \\__,x,x,__/  ",
        "    x|||x      ",
        "    x|||x      ",
        " ,-/x|||x\\-,   ",
        " \\_x______x/   "
      ]
    ]
  },

  {
    id: 'mushroom-tiny',
    name: 'Winziger Moospilz',
    lore: 'Harmlos. Gibt wenig Nahrung, aber Kinder sammeln sie — vielleicht ein Zeichen von Hoffnung.',
    color:       '#4ade80',
    colorDim:    '#166534',
    colorBright: '#bbf7d0',
    width: 11,
    height: 7,
    frames: [
      [
        "           ",
        "           ",
        "           ",
        "           ",
        "           ",
        "     .     ",
        "     |     "
      ],
      [
        "           ",
        "           ",
        "           ",
        "    ,',    ",
        "   ( . )   ",
        "    \\ /    ",
        "    /|\\    "
      ],
      [
        "           ",
        "   _,_,_   ",
        "  (. . .)  ",
        "   \\_v_/   ",
        "    | |    ",
        "   _|_|_   ",
        "  (_____) "
      ],
      [
        "   _,~,_   ",
        "  ( . . )  ",
        " |  . .  | ",
        "  \\_____/  ",
        "    | |    ",
        "   ,|_|,   ",
        "   \\___/   "
      ]
    ]
  }

];

var MUSHROOM_IDS = [
  'mushroom-red',
  'mushroom-blue',
  'mushroom-gold',
  'mushroom-dark',
  'mushroom-tiny'
];

// ══════════════════════════════════════════════
//  UMGEBUNGS- UND NPC-SPRITES
// ══════════════════════════════════════════════

var RPG_SPRITES = [

  // ─────────────────────────────────────────────
  //  WASSERROHR  (G.baseRooms.wasserleitung)
  // ─────────────────────────────────────────────
  {
    id: 'water-pipe',
    name: 'Wasserleitung',
    lore: 'Ein altes Rohr. Repariert liefert es passiv +2 Nahrung alle 25 Sekunden.',
    color:       '#94a3b8',
    colorDim:    '#334155',
    colorBright: '#e2e8f0',
    width: 20,
    height: 16,
    frames: [
      // Frame 0 — ruhig / tropfend
      [
        "  ____________    ",
        " |____________|   ",
        "       ||         ",
        "  _____|_|_____   ",
        " |=============|  ",
        " |             |  ",
        " |_____________|  ",
        "       ||         ",
        "       ||         ",
        "      [||]        ",
        "       ||         ",
        "       ||         ",
        "  _____|_|_____   ",
        " |=====|=|=====|  ",
        "       |          ",
        "       *  (tropf) "
      ],
      // Frame 1 — sprudelnd (Rohr aktiv)
      [
        "  ____________    ",
        " |____________|   ",
        "       ||         ",
        "  _____|_|_____   ",
        " |=============|  ",
        " |  ~  ~  ~    |  ",
        " |_____________|  ",
        "      ||||        ",
        "     ||||||       ",
        "    [||||||]      ",
        "     ||||||       ",
        "      ||||        ",
        "  _____|_|_____   ",
        " |=====|=|=====|  ",
        "    ~  |  ~  ~    ",
        "  ~ *  * *  ~  ~  "
      ]
    ]
  },

  // ─────────────────────────────────────────────
  //  SCHMIED  (G.survivors — typ: 'schmied')
  // ─────────────────────────────────────────────
  {
    id: 'blacksmith',
    name: 'Schmied',
    lore: 'Er hämmert Tag und Nacht. Mit ihm werden Metall-Crafts freigeschaltet.',
    color:       '#fb923c',
    colorDim:    '#7c2d12',
    colorBright: '#fed7aa',
    width: 28,
    height: 20,
    frames: [
      // Frame 0 — Hammer hoch
      [
        "              ___          ",
        "         ____/===\\         ",
        "        /    |   |         ",
        "       |     |   |  _      ",
        "       |    [#]  | | |     ",
        "        \\    |   |_| |     ",
        "         \\   |  _____/     ",
        "          \\  | /           ",
        "   _       \\[#]            ",
        "  | |   ___|  |___         ",
        "  | |  /    /\\    \\        ",
        "  | | |    /  \\    |       ",
        "  [_] |   / \\/ \\   |       ",
        "   |  |  /   /  \\  |       ",
        "   |  \\_/___/____\\_/       ",
        "   |    | ESSE  |          ",
        "  _|_   |_______|          ",
        " /   \\  ~~ *** ~~          ",
        "|  o  | ~*  *  *~          ",
        " \\___/ ~ *** *** ~         "
      ],
      // Frame 1 — Aufprall (CLANG)
      [
        "                           ",
        "   _                       ",
        "  / \\  ____                ",
        " /   \\/    \\               ",
        "|  o  |    |   _           ",
        " \\   /|    |  | |          ",
        "  \\_/ |[===|__| |          ",
        "      |    |  __/          ",
        "   _  |[#]-| /             ",
        "  | |_|____|/___           ",
        "  | | /    /\\    \\         ",
        "  | ||    /  \\    |        ",
        "  [_]|   / \\/ \\   |        ",
        "   | |  /   /  \\  |        ",
        "   | \\_/___/____\\_/        ",
        "   |   | ESSE  |           ",
        "  _|_  |_______|           ",
        " /   \\ ~~ *** ~~  * *      ",
        "|  o  |~*  *  *~ *CLANG*   ",
        " \\___/ ~ *** *** ~  * *    "
      ],
      // Frame 2 — Rückzug
      [
        "                           ",
        "         ___               ",
        "   _    /===\\              ",
        "  / \\  /  |  \\             ",
        " /   |   |   \\  _          ",
        "|  o |  [#]   || |         ",
        " \\   |   |    || |         ",
        "  \\_/|   |____||_/         ",
        "     |   |  __/            ",
        "   __|[#]| /___            ",
        "  | | /    /\\    \\         ",
        "  | ||    /  \\    |        ",
        "  [_]|   / \\/ \\   |        ",
        "   | |  /   /  \\  |        ",
        "   | \\_/___/____\\_/        ",
        "   |   | ESSE  |           ",
        "  _|_  |_______|           ",
        " /   \\ ~~ *** ~~           ",
        "|  o  |~*  *  *~           ",
        " \\___/ ~ *** *** ~         "
      ]
    ]
  },

  // ─────────────────────────────────────────────
  //  HEILER  (G.survivors — typ: 'heiler')
  // ─────────────────────────────────────────────
  {
    id: 'healer',
    name: 'Heilerin',
    lore: 'Sie heilt Wunden mit uralten Kräutern. Mit ihr heilt doRest 40% mehr.',
    color:       '#34d399',
    colorDim:    '#065f46',
    colorBright: '#a7f3d0',
    width: 26,
    height: 20,
    frames: [
      // Frame 0 — ruhig stehend
      [
        "          _____          ",
        "         /+   +\\         ",
        "        | + + + |        ",
        "         \\_____/         ",
        "        __|   |__        ",
        "       /  |   |  \\       ",
        "      / .-|   |-. \\      ",
        "     | /  | + |  \\ |     ",
        "     ||   | + |   ||     ",
        "     ||   |_+_|   ||     ",
        "      \\  / | | \\  /      ",
        "       \\/  | |  \\/       ",
        "           | |           ",
        "          /   \\          ",
        "         /     \\         ",
        "        /  ___  \\        ",
        "       /__/   \\__\\       ",
        "          |   |          ",
        "         _|___|_         ",
        "        (_______)        "
      ],
      // Frame 1 — heilt (Hände leuchten)
      [
        "     *    _____   *      ",
        "      *  /+   +\\  *      ",
        "        | + + + |        ",
        "    *    \\_____/   *     ",
        "    *  __|   |__  *      ",
        "   * /  |   |  \\ *       ",
        "  * / .-|   |-. \\ *      ",
        " * | /  | + |  \\ | *     ",
        "* ||  * | + | *  || *    ",
        " * ||  *|_+_|*   || *    ",
        "  * \\  / | | \\  / *      ",
        "   * \\/  | |  \\/ *       ",
        "    *     | |    *       ",
        "    *    /   \\   *       ",
        "        /     \\          ",
        "       /  ___  \\         ",
        "      /__/   \\__\\        ",
        "         |   |           ",
        "        _|___|_          ",
        "       (_______)         "
      ],
      // Frame 2 — Arme ausgestreckt
      [
        "          _____          ",
        "         /+   +\\         ",
        "        | + + + |        ",
        "         \\_____/         ",
        "   *  ---|   |---  *     ",
        "  *--/   |   |   \\--*    ",
        " *  / .- |   | -. \\ *    ",
        "*  |/    | + |    \\|  *  ",
        "* [*]    | + |    [*] *  ",
        " * |\\    |_+_|    /| *   ",
        "  * \\ \\  | | |  / / *    ",
        "   *  \\  | | | /  *      ",
        "    *  \\ | | |/  *       ",
        "     *  \\   / *          ",
        "         \\   \\           ",
        "         /___\\           ",
        "        /__   \\          ",
        "           |   |         ",
        "          _|___|_        ",
        "         (_______)       "
      ]
    ]
  }

];

// ══════════════════════════════════════════════
//  HELPER
// ══════════════════════════════════════════════

function getRpgSpriteById(id) {
  var all = MUSHROOM_SPRITES.concat(RPG_SPRITES);
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) return all[i];
  }
  return null;
}

// Wachstums-Frame für Pilze (stage 0–3)
function getGrowthFrame(sprite, stage) {
  var s = Math.max(0, Math.min(stage, sprite.frames.length - 1));
  return sprite.frames[s];
}

// Animations-Frame anhand Zeit (für Schmied, Heiler, Rohr)
function getRpgFrame(sprite, elapsed, fps) {
  fps = fps || 2;
  var n = sprite.frames.length;
  if (n === 1) return sprite.frames[0];
  return sprite.frames[Math.floor((elapsed / 1000) * fps) % n];
}

// Frame auf Canvas zeichnen
function renderRpgSprite(ctx, frame, x, y, charW, charH, color, font) {
  charW = charW || 8; charH = charH || 14; color = color || '#4ade80';
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font || (charH + 'px monospace');
  ctx.textBaseline = 'top';
  for (var i = 0; i < frame.length; i++) ctx.fillText(frame[i], x, y + i * charH);
  ctx.restore();
}

// Frame auf maxH Zeilen skalieren (Raycaster-Distanz)
function scaleRpgFrame(frame, maxH) {
  if (frame.length <= maxH) return frame;
  var step = frame.length / maxH, out = [];
  for (var i = 0; i < maxH; i++) out.push(frame[Math.floor(i * step)]);
  return out;
}

// Mehrere Frames nebeneinander kombinieren (Pilzgruppe als ein Sprite)
// frames = Array von String-Arrays, gap = Leerzeichen zwischen Sprites
function combineFramesSideBySide(frames, gap) {
  gap = gap || 2;
  var gapStr = '';
  for (var g = 0; g < gap; g++) gapStr += ' ';
  var maxH = 0, i, j;
  for (i = 0; i < frames.length; i++) if (frames[i].length > maxH) maxH = frames[i].length;
  var padded = [];
  for (i = 0; i < frames.length; i++) {
    var f = frames[i];
    var w = 0;
    for (j = 0; j < f.length; j++) if (f[j].length > w) w = f[j].length;
    var top = [];
    for (j = 0; j < maxH - f.length; j++) { var s = ''; while (s.length < w) s += ' '; top.push(s); }
    var rows = top.concat(f.map(function(l) { while (l.length < w) l += ' '; return l; }));
    padded.push(rows);
  }
  var result = [];
  for (i = 0; i < maxH; i++) {
    var row = '';
    for (j = 0; j < padded.length; j++) {
      if (j > 0) row += gapStr;
      row += padded[j][i];
    }
    result.push(row);
  }
  return result;
}
