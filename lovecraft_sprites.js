// lovecraft_sprites.js
// Lovecraft-Monster-Sprites für TIEF
// Kein import/export — alle Variablen global, kompatibel mit onclick-Handlern
// Ladereihenfolge: nach data.js, vor raycaster-Scripts
//
// Jeder Sprite-Eintrag:
//   id          — Schlüssel (passend zu RC_SPRITE_DEFS id-Feldern)
//   name        — Anzeigename (Deutsch, für HUD/Journal)
//   lore        — Lore-Text (Deutsch, für journalAdd / Event-Overlay)
//   color       — Primärfarbe hex (Canvas-Tinting)
//   colorDim    — dunklere Variante (Schatten-Pass)
//   colorBright — hellere Variante (Highlight-Pass)
//   width       — max. Zeichenbreite
//   height      — Zeilenanzahl
//   frames      — Array von Frames; jeder Frame = Array von Strings

var LOVECRAFT_SPRITES = [

  // ─────────────────────────────────────────────
  //  CTHULHU
  // ─────────────────────────────────────────────
  {
    id: 'cthulhu',
    name: 'Cthulhu',
    lore: "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn. Der Große Alte schläft — und träumt.",
    color:       '#27ae60',
    colorDim:    '#1a5c38',
    colorBright: '#55ff99',
    width: 60,
    height: 36,
    frames: [[
      "                ~  ~  ~  ~  ~  ~  ~  ~         ",
      "          ~   ~   ~    ~   ~    ~   ~   ~   ~  ",
      "       ~    ~    ~   ~   ~   ~    ~   ~    ~   ",
      "     ___....----\"\"\"\"\"\"\"\"----....___             ",
      " .--\"\"   _                         _   \"\"--.   ",
      ".'    _.-\" /~._               _.-~\\ \"-._    '. ",
      "/   .-\"    /    \\             /    \\    \"-. \\  ",
      "|  .'   _..'      \\           /      '.._ '.  |",
      "|  |  .'   \\  .-~~~`._     _.'~~~-.  /   '.  ||",
      "|  |  |  _.-~\\  (####)\\   /(####)  /~-._  |  ||",
      "|  |  | /  .  \\  \\####/   \\####/  /  .  \\ |  ||",
      "|  |  |/   .   \\  ~~~~     ~~~~  /   .   \\|  ||",
      "|  |  |   .     \\   ___     ___   /    .   |  ||",
      "|  |  |    .     '-/   \\___/   \\-'    .    |  ||",
      " \\ |  |  .    _.-/ \\           / \\-._   .  |  |/",
      "  \\|  |     .'  /   \\  \\___/  /   \\  '.    |  |/",
      "   |  |   .'  _/  .  \\       /  .  \\_  '.  |  |",
      "   |  |  /  .'  .  .  \\_____/  .  .  '.  \\ |  |",
      "   |  | / .'  .  .  .  /~~~~~\\  .  .  '. \\ |  |",
      "   |  |/ /  .  .  .  . |     | .  .  .  \\ \\|  |",
      "   |  | /  .  .  .  .  |     |  .  .  .  \\ |  |",
      "  _|  |/  .  .  .  .   |     |   .  .  .  \\|  |_",
      " / |  |  .  .  .  .    |     |    .  .  .  |  | \\",
      "|  |  | .  .  .  .  .  |     |  .  .  .  . |  |  |",
      "|~~\\  |_.~._  .  .  . /  _  \\  .  . _.~._|  /~~|",
      "|   `-|  ~~~--._____.--~~~   ~~~--._____.---| -'   |",
      " \\   /  ~~ Tentakel ~~  \\     /  ~~ Tentakel ~  \\  /",
      "  |./  /~|  |~|  |~\\    \\   /  /~|  |~|  |~\\   \\.|",
      "  |/  / /|  | |  | |\\    \\ /  / /|  | |  | |\\ \\  \\|",
      " /|  |/ /~~|  | |  |~~\\ \\  X  / /~~|  | |  |~~\\ \\|  |\\",
      " ||  |/ /~~~`--' '--'~~~\\ \\/ \\/ /~~~`--' '--'~~~\\ \\|  ||",
      " ||  | |  .  .  .  .  . |    |  .  .  .  .  .  | |  ||",
      " ||  | |.  .  .  . . .-'    '-. .  .  .  .  . .|  |  ||",
      " ||  | |-. .  .  .  .-'          '-. .  .  . .-| |  ||",
      " ||  | |  '-.____.-'    ~~ ~ ~~    '-.____..-'  | |  ||",
      "  \\|  |/  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  \\|  |/"
    ]]
  },

  // ─────────────────────────────────────────────
  //  SHOGGOTH
  // ─────────────────────────────────────────────
  {
    id: 'shoggoth',
    name: 'Shoggoth',
    lore: "Tekeli-li! Tekeli-li! Formlose Protoplasma-Masse — einst Sklaven, nun frei und hungrig.",
    color:       '#2dd4bf',
    colorDim:    '#0f766e',
    colorBright: '#99f6e4',
    width: 40,
    height: 16,
    frames: [
      [
        "        .--\"\"\"\"\"\"\"\"-.",
        "     .-'  o    @   o  '-.",
        "    /   @   .-\"\"\"-.  o  \\",
        "   | o   . /  o o  \\   @ |",
        "   |   @  |  o @ o  |  . |",
        "   |  . o  \\ o   o /  @  |",
        "   | @   o  '-___-'  o . |",
        "    \\  o  @  .   .  @  o /",
        "     '-. o  ( @ @ )  o.-'",
        "  o @   '-._  \\ /  _.-'  @ o",
        " @  .  o    '--v--'   .  o  @",
        "  .  @  o  .  @ .  o  @  .  .",
        "   @  .   @   .  @  .    @  .",
        " .  o  @  .  o  @  .  o  @  o",
        "  @   .   o   .   @   .   o  .",
        "  tekeli-li!    tekeli-li!"
      ],
      [
        "      .-\"\"\"\"\"\"\"\"\"\"\"-.",
        "    .'  @   o    o  @  '.",
        "   / o   .-\"\"\"\"\"-.   o  \\",
        "  |   o /  @ o @  \\ o   |",
        "  | @  |  o  @  o  |  @ |",
        "  |  o  \\ @  o  @ /  o  |",
        "  | o  @ '-.___.-' @  o |",
        "   \\  @  o  .   .  o  @ /",
        "    '-. o  ( @ o @ )  o.-'",
        " o  @  '-._  \\ / _.-'  @ o",
        "@  o  .    '--v--'   .  o  @",
        " .  @  o  .  @ .  o  @  .  .",
        "  @  .   @   .  @  .    @  .",
        "  tekeli-li!    tekeli-li!"
      ]
    ]
  },

  // ─────────────────────────────────────────────
  //  MI-GO
  // ─────────────────────────────────────────────
  {
    id: 'mi-go',
    name: 'Mi-Go',
    lore: "Pilzwesen von Yuggoth. Sie ernten Gehirne in Metallzylindern und tragen sie in die Leere.",
    color:       '#fbbf24',
    colorDim:    '#92400e',
    colorBright: '#fde68a',
    width: 26,
    height: 19,
    frames: [
      [
        "      *   .  *   .   * ",
        "   .    *    .    *    .",
        "      .   ,-.   .      ",
        "   .     /   \\     .   ",
        "      . ( @ @ ) .      ",
        "   .    |  ^ ^  |   .  ",
        "      . | /||\\ | .     ",
        "   .    |/ | \\|    .   ",
        "      . /--+--\\ .      ",
        "   .  _/   |   \\_  .   ",
        "    _/ \\   |   / \\_    ",
        "   / .  \\  |  /  . \\   ",
        "  | .  . \\ | / .  . |  ",
        "  |.  .  \\|/  .  . .|  ",
        "   \\  .   o   .  . /   ",
        "    \\_.  _/ \\_ ._/     ",
        "      / /   \\ \\        ",
        "     / /     \\ \\       ",
        "    |_|       |_|      "
      ],
      [
        "  *  .  *   .  *  .  * ",
        "  \\ .  *  .  *  . *  / ",
        "   \\.   ,-.   .    ./  ",
        " .  \\  /   \\  .   /  . ",
        "  . \\( @ @ )/  . /  .  ",
        " .   \\|  ^ |  . /   .  ",
        "  .   | /||\\ . /  .    ",
        " .    |/ | \\| /  .   . ",
        "  .   /--+--\\/   .  .  ",
        "   . /   |   \\  .      ",
        "   _/    |    \\_       ",
        "  / .    |    . \\      ",
        " |  .  . | .  .  |     ",
        "  \\ .  . | .  . /      ",
        "   \\_.  _/ \\_ ._/      ",
        "     / /   \\ \\         ",
        "    |_|     |_|        "
      ]
    ]
  },

  // ─────────────────────────────────────────────
  //  DEEP ONE
  // ─────────────────────────────────────────────
  {
    id: 'deep-one',
    name: 'Tiefes Wesen',
    lore: "Halb Mensch, halb Fisch. Diener des Dagon. Ihre Augen vergessen nie — und du wirst nicht vergessen.",
    color:       '#60a5fa',
    colorDim:    '#1e3a5f',
    colorBright: '#bfdbfe',
    width: 24,
    height: 18,
    frames: [
      [
        "          ___          ",
        "        /o   o\\        ",
        "       |  ~~~  |       ",
        "      /|  ><   |\\      ",
        "     / |  \\/   | \\     ",
        "    /  |       |  \\    ",
        "   /  /|  ___  |\\  \\   ",
        "  |  / | /   \\ | \\  |  ",
        "  | /  |/  ^  \\|  \\ |  ",
        "  |/  /|       |\\ \\  \\|",
        "   \\ / ~~~~~~~~~~ \\ /  ",
        "   /\\   Innsmouth  /\\  ",
        "  /  \\_/__________/  \\ ",
        " |  / ~~~~~~~~~~~~ \\  |",
        " | /  .  . . .  . \\ | ",
        " |/ .  . . . .  .  \\| ",
        "  \\  . . . . . .  /   ",
        "   \\_____________/    "
      ],
      [
        "       ___             ",
        "     /o   o\\   ><      ",
        "    |  ~~~  |--        ",
        "   /|  ><   |\\         ",
        "  / |  \\/   | \\  ><    ",
        " /  |       |  \\       ",
        "/  /|  ___  |\\  \\      ",
        " | / | /   \\ | \\ |     ",
        " |/  |/  ^  \\|  \\|     ",
        " |  /|       |\\ \\      ",
        "  \\/ ~~~~~~~~~~ \\/     ",
        "  /\\ . Dagon .  /\\     ",
        " /  \\_/__________/  \\ ",
        "|  / ~~~~~~~~~~~~ \\  | ",
        "| /  .  . . .  . \\ |  ",
        "|/ .  . . . .  .  \\|  ",
        " \\  . . . . . .  /    ",
        "  \\_____________/     "
      ]
    ]
  },

  // ─────────────────────────────────────────────
  //  NYARLATHOTEP
  // ─────────────────────────────────────────────
  {
    id: 'nyarlathotep',
    name: 'Nyarlathotep',
    lore: "Der Kriechende Chaos. Einziger der Alten Götter, der spricht — und lacht.",
    color:       '#c084fc',
    colorDim:    '#4c1d95',
    colorBright: '#e9d5ff',
    width: 30,
    height: 25,
    frames: [[
      "              .            ",
      "            /|\\           ",
      "           /*|*\\          ",
      "          / *|* \\         ",
      "         /   |   \\        ",
      "        / .  |  . \\       ",
      "        | *  |  * |       ",
      "    .---|----+----|--.    ",
      "   /    |  .   .  |   \\   ",
      "  / *   | .  +  . |  * \\  ",
      " |  .   |   /|\\   |   . | ",
      " | * .  |  / | \\  |  . *| ",
      "  \\  *  | /  |  \\ | *  /  ",
      "   \\  . |/   |   \\|  ./   ",
      "    `---|----+----|-'     ",
      "        \\  . | . /        ",
      "      *  \\ * | */  *      ",
      "    *     \\  |/  *    *   ",
      "  *      . \\ | .  .  *    ",
      "    * .    \\|/ .  *       ",
      "  .    *  . | .  .   *    ",
      "    *    .  |  *   .   *  ",
      "  *    *   .|.   *    *   ",
      "     *   *  .  *   *      ",
      "       *    .    *        "
    ]]
  },

  // ─────────────────────────────────────────────
  //  HASTUR
  // ─────────────────────────────────────────────
  {
    id: 'hastur',
    name: 'Hastur',
    lore: "Der Namenlose. Hast du das Gelbe Zeichen gesehen? Jetzt ist es zu spät.",
    color:       '#f87171',
    colorDim:    '#7f1d1d',
    colorBright: '#fecaca',
    width: 34,
    height: 25,
    frames: [[
      "              .  .             ",
      "          .  _|_  .            ",
      "         . /|   |\\ .           ",
      "        . / |   | \\ .          ",
      "       . /  | Y |  \\ .         ",
      "      . /   | / \\   \\ .        ",
      "     . / .  |/ Y \\  . \\.       ",
      "    . /  .  /  |  \\  .  \\ .    ",
      "   ./   . _/   |   \\_   .\\     ",
      "  .   . / /\\   |   /\\ \\ . .    ",
      " .  . / /  \\   |   /  \\ \\. .   ",
      ". . / /  .  \\ \\|/ /  .  \\ \\.   ",
      "  ./ /  . .  \\   /  . .  \\/    ",
      "  / /  .   .  \\_/  .   .  \\    ",
      " / /  . . . .  |  . . . .  \\   ",
      "|_/             |           \\_|",
      "|               |              |",
      "|  H A S T U R  | F H T A G N |",
      "|               |              |",
      "|  das gelbe    |  Zeichen     |",
      "|               |              |",
      " \\_____________.|._____________/",
      "      ~   ~   ~ . ~   ~   ~     ",
      "         ~    ~   ~    ~         ",
      "              ~  ~  ~            "
    ]]
  }

];

// ─────────────────────────────────────────────
//  ENCOUNTER-TABELLE
//  sanityDmg wirkt direkt auf G.wahnsinn
// ─────────────────────────────────────────────
var LOVECRAFT_ENCOUNTER_TABLE = [
  { id: 'deep-one',     weight: 40, sanityDmg: 5,  hp: 30  },
  { id: 'shoggoth',     weight: 25, sanityDmg: 15, hp: 80  },
  { id: 'mi-go',        weight: 20, sanityDmg: 8,  hp: 45  },
  { id: 'nyarlathotep', weight: 8,  sanityDmg: 25, hp: 120 },
  { id: 'hastur',       weight: 5,  sanityDmg: 30, hp: 150 },
  { id: 'cthulhu',      weight: 2,  sanityDmg: 99, hp: 999 }
];

// ─────────────────────────────────────────────
//  HELPER
// ─────────────────────────────────────────────

function getLovecraftSpriteById(id) {
  for (var i = 0; i < LOVECRAFT_SPRITES.length; i++) {
    if (LOVECRAFT_SPRITES[i].id === id) return LOVECRAFT_SPRITES[i];
  }
  return null;
}

// Aktuellen Animations-Frame zurückgeben
// elapsed = ms (z.B. Date.now()), fps = Frames/Sekunde (default 2)
function getLovecraftFrame(sprite, elapsed, fps) {
  fps = fps || 2;
  var n = sprite.frames.length;
  if (n === 1) return sprite.frames[0];
  return sprite.frames[Math.floor((elapsed / 1000) * fps) % n];
}

// Frame auf Canvas zeichnen
function renderLovecraftSprite(ctx, frame, x, y, charW, charH, color, font) {
  charW = charW || 8; charH = charH || 14; color = color || '#27ae60';
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font || (charH + 'px monospace');
  ctx.textBaseline = 'top';
  for (var i = 0; i < frame.length; i++) ctx.fillText(frame[i], x, y + i * charH);
  ctx.restore();
}

// Frame auf maxH Zeilen herunterskalieren (Raycaster-Distanz-Scaling)
function scaleLovecraftFrame(frame, maxH) {
  if (frame.length <= maxH) return frame;
  var step = frame.length / maxH, out = [];
  for (var i = 0; i < maxH; i++) out.push(frame[Math.floor(i * step)]);
  return out;
}

// Gewichtete Zufallsbegegnung → { sprite, sanityDmg, hp }
function lovecraftRandomEncounter() {
  var total = 0, i;
  for (i = 0; i < LOVECRAFT_ENCOUNTER_TABLE.length; i++) total += LOVECRAFT_ENCOUNTER_TABLE[i].weight;
  var roll = Math.random() * total;
  for (i = 0; i < LOVECRAFT_ENCOUNTER_TABLE.length; i++) {
    roll -= LOVECRAFT_ENCOUNTER_TABLE[i].weight;
    if (roll <= 0) {
      var e = LOVECRAFT_ENCOUNTER_TABLE[i];
      return { sprite: getLovecraftSpriteById(e.id), sanityDmg: e.sanityDmg, hp: e.hp };
    }
  }
  return { sprite: getLovecraftSpriteById('deep-one'), sanityDmg: 5, hp: 30 };
}
