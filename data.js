'use strict';

// ================================================================
// CONFIG
// ================================================================

const GRID_W = 5, GRID_H = 3;

// Artifacts for each floor (0-indexed)
const ARTIFACTS = [
  {
    id:'auge', name:'DAS AUGE',
    sym:'◉',
    art: t => {
      const i = ['●','◉','⊙'][t%3];
      return `<span class="gr">     ╭─────────────╮
   ╭─╯             ╰─╮
  ╱                   ╲
 │   ╭─────────────╮   │
 │  ╱               ╲  │
 │ │       ${i}       │ │
 │  ╲               ╱  │
 │   ╰─────────────╯   │
  ╲                   ╱
   ╰─╮             ╭─╯
     ╰─────────────╯</span>`;
    },
    text:'in die wand gewachsen. nicht hineingehauen — gewachsen. eine iris, die sich dreht wenn du die hand ausstreckst. als du es herausreißt, siehst du einen moment lang alle korridore dieser ebene gleichzeitig. dann bist du wieder hier.',
    madness: 18, curse: 'stimmen'
  },
  {
    id:'echo', name:'DAS ECHO',
    sym:'◎',
    art: t => {
      const r = ['·','·','·'][t%3];
      return `<span class="gk">   ╭───────────╮
  ╱  ╭───────╮  ╲
 │  ╱  ╭───╮  ╲  │
 │ │  ╱ ${r}${r}${r} ╲  │ │
 │ │ │  ○○○  │ │ │
 │ │  ╲     ╱  │ │
 │  ╲  ╰───╯  ╱  │
  ╲  ╰───────╯  ╱
   ╰───────────╯</span>`;
    },
    text:'eine hohle kugel aus einem material das weder knochen noch stein ist. wenn du dein ohr anlegst, hörst du deine eigene stimme — aber nicht sätze die du erinnerst. älter. als ob du schon früher hier gewesen bist.',
    madness: 22, curse: 'erschöpfung'
  },
  {
    id:'abdruck', name:'DER ABDRUCK',
    sym:'✋',
    art: t => `<span class="gk">       ╭─╮ ╭─╮ ╭─╮
      ╱ │ ╲╱ │ ╲╱ │ ╲
     │  │    │    │  │
     │  │    │    │  │
      ╲ ╰────╯────╯ ╱
  ╭───╰─────────────╯
 ╱     PALM LINE 1    ╲
│      PALM LINE 2     │
 ╲     PALM LINE 3    ╱
  ╰────────────────────╯</span>`,
    text:'ein handabdruck im fels. nicht auf den fels gepresst — hineingewachsen. du steckst deine hand hinein. er passt. der stein ist warm. das warst du. das bist du. du bist schon hier gewesen.',
    madness: 26, curse: 'hunger'
  },
  {
    id:'gleichung', name:'DIE GLEICHUNG',
    sym:'∑',
    art: t => {
      const s = ['∞','∅','∆'][t%3];
      return `<span class="gk">╔══════════════════════╗
║  ${s} × ∅ = ∅ × ${s}   ║
║  ∫∫∫ f(x,t) → ?      ║
║  ──────────────────  ║
║  n+1 = n             ║
║  lim(x→∞) = 0 = ∞    ║
║  ──────────────────  ║
║  du bist Teil der    ║
║  Funktion            ║
╚══════════════════════╝</span>`;
    },
    text:'eine metallplatte mit einer gleichung. du verstehst die symbole nicht. dann plötzlich doch. sie beschreibt etwas — nicht mathematisch, sondern ontologisch. du kannst nicht aufhören, sie zu verstehen.',
    madness: 30, curse: 'blutung'
  },
  {
    id:'kern', name:'DER KERN',
    sym:'◆',
    art: t => {
      const p = ['▓','▒','░'][t%3];
      return `<span class="gk">  ${p}${p}${p}╭─────────────╮${p}${p}${p}
${p}${p}╱  ╭─────────╮  ╲${p}${p}
${p}│  ╱   ◆◈◆   ╲  │${p}
${p}│ │   ◈ ◉ ◈   │ │${p}
${p}│ │   ◆◈◆     │ │${p}
${p}│  ╲           ╱  │${p}
${p}${p}╲  ╰─────────╯  ╱${p}${p}
  ${p}${p}${p}╰─────────────╯${p}${p}${p}</span>`;
    },
    text:'am tiefsten punkt. eine kugel aus einem material das licht aufnimmt und nicht zurückgibt. als du sie aufhebst, wird alles klar. du verstehst was du bist. du verstehst was es ist. es gibt keinen unterschied mehr.',
    madness: 0,
    isFinal: true
  }
];

// Enemies per floor (0-indexed, gets harder)
const ENEMY_TIERS = [
  [
    {name:'SCHLEICHER', hp:10, atk:3, def:0, xp:6, loot:{metall:3},
     art: t => `<span class="gr">  ${['~','≈','~'][t%3]}${['~','≈','~'][t%3]} SCHLEICHER ${['~','≈','~'][t%3]}${['~','≈','~'][t%3]}
    ╭───────╮
   ╱  · · ·  ╲
  │   ╰─╯     │
   ╲  ─────  ╱
    ╰───────╯
  ╱╲╱╲╱╲╱╲╱╲╱╲</span>`,
     intro:'es bewegt sich schneller als erwartet.'},
  ],
  [
    {name:'GAZER', hp:22, atk:5, def:1, xp:12, loot:{metall:5, stoff:1},
     art: t => `<span class="gr">  ${['*','·','✦'][t%3]} ╭──────────╮ ${['*','·','✦'][t%3]}
  ╭─╯  ● ◉ ●  ╰─╮
  │ ╰──────────╯ │
  │  ╱╲      ╱╲  │
  ╰──╯ ╰────╯ ╰──╯
  ${['*','·','✦'][t%3]}  ╱╲╱╲╱╲╱╲╱╲  ${['*','·','✦'][t%3]}</span>`,
     intro:'es sieht dich. es sah dich schon vorher.'},
  ],
  [
    {name:'GEFORMTES', hp:40, atk:7, def:2, xp:20, loot:{metall:8, holz:2},
     art: t => `<span class="gr"> ${['▓','▒','░'][t%3]}${['▓','▒','░'][t%3]}╭──────────────╮${['▓','▒','░'][t%3]}${['▓','▒','░'][t%3]}
${['▓','▒','░'][t%3]}╱  ● ◉ ◉ ● ◉  ╲${['▓','▒','░'][t%3]}
│  ╭────────────╮  │
│  │  ≠ ≠ ≠ ≠  │  │
│  ╰────────────╯  │
${['▓','▒','░'][t%3]}╲               ╱${['▓','▒','░'][t%3]}
 ${['▓','▒','░'][t%3]}${['▓','▒','░'][t%3]}╰──────────────╯${['▓','▒','░'][t%3]}${['▓','▒','░'][t%3]}</span>`,
     intro:'es hat keine form die du benennen kannst.'},
  ],
  [
    {name:'STIMME', hp:55, atk:9, def:3, xp:28, loot:{metall:12, nahrung:2},
     art: t => `<span class="gr">╭─────────────────────╮
│ ● ● ◉ ${['∞','∅','∆'][t%3]} ◉ ● ● │
│╭───────────────────╮│
││ ≠ ≠ ≠ ≠ ≠ ≠ ≠ ≠ ≠ ││
│╰───────────────────╯│
│ ╱╲ ╱╲ ╱╲ ╱╲ ╱╲ ╱╲ │
╰─────────────────────╯</span>`,
     intro:'du hörst deinen namen. du hast ihr deinen namen nicht gesagt.'},
  ],
  [
    {name:'NEXUS', hp:80, atk:12, def:4, xp:40, loot:{metall:20, stoff:3, nahrung:3},
     art: t => {
       const c = ['▓','▒','░'][t%3];
       return `<span class="gr">${c}${c}${c}╭───────────────────╮${c}${c}${c}
${c}${c}╱  ◉ ◉ ◉ ∞ ◉ ◉ ◉  ╲${c}${c}
${c}│ ╭─────────────────╮ │${c}
${c}│ │  ≠ ≠ ≠ ≠ ≠ ≠ ≠  │ │${c}
${c}│ ╰─────────────────╯ │${c}
${c}${c}╲  ╱╲ ╱╲ ╱╲ ╱╲ ╱╲  ╱${c}${c}
${c}${c}${c}╰───────────────────╯${c}${c}${c}</span>`;
     },
     intro:'der nexus erkennt dich. du erkennst den nexus.'},
  ],
];

// Random empty room flavor texts
const EMPTY_FLAVORS = [
  'eine kerze. kein wachs. nie gebrannt.',
  'der boden ist kalt. der decke fehlt etwas.',
  'jemand hat hier auf den wänden gezählt. die zahlen sind falsch.',
  'trockene luft. ein geruch der keinem bekannten stoff entspricht.',
  'ein nagel in der wand. nichts anderes.',
  'der raum ist größer innen als außen.',
  'risse im beton in einem muster das beinahe einem gesicht ähnelt.',
  'stille die schwerer ist als luft.',
];

// ================================================================
// ZEICHEN SYSTEM (wall signs, revealed by Fackel)
// ================================================================
const ZEICHEN_SETS = [
  // 0-29: geometric, neutral
  { syms: ['◇','△','○','□','◁','▷','◈','⊙','◎','·','─','│','╱','╲','○'], cls: 'zn' },
  // 30-59: arcane, ambiguous
  { syms: ['◉','⊛','⊗','⊕','≠','≈','∞','∅','∆','∇','ψ','φ','ω','Ω','∑'], cls: 'zw' },
  // 60-79: threatening
  { syms: ['✖','✗','⚠','☠','▓','▒','░','∴','∵','⁂','※','⋮','҉','∞','◈'], cls: 'zh' },
  // 80-100: horror
  { syms: ['҉','Ϣ','ϟ','⁂','☠','✗','▓','⚠','∞','☠','҉','✖','⋮','Ω','҉'], cls: 'zh zflicker' },
];

const ZEICHEN_DESC = [
  ['die zeichen sind alt. geometrisch. fast beruhigend.',
   'symbole. vielleicht eine sprache. vielleicht kein mensch.',
   'muster. sich wiederholend. du kannst sie noch ignorieren.'],
  ['die symbole folgen einer logik die du nicht kennst.',
   'du siehst dasselbe zeichen an drei stellen gleichzeitig.',
   'sie verändern sich. du fragst dich ob du sie veränderst.'],
  ['die zeichen bewegen sich. nein. du hast dich bewegt.',
   'ein muster das wie ein gesicht aussieht. schaut es zurück?',
   'sie schreiben etwas. du verstehst es. du wünschst du tätest es nicht.'],
  ['die zeichen kennen deinen namen. du hast ihn ihnen nicht gegeben.',
   'alles an den wänden ist eine nachricht. sie kommt von dir.',
   'du erkennst die handschrift. das ist deine handschrift.'],
];

// ================================================================
// BASE EVENTS
// ================================================================
const BASE_EVENTS = [
  {
    id: 'fremder_schuh',
    title: 'EIN SCHUH',
    body: 'ein einzelner schuh. deine größe. du erinnerst dich nicht ihn verloren zu haben.',
    art: `<span class="gd">      ___
     /   \\
    |     |___
    |_________|</span>`,
    logCol: null,
    once: false,
    choices: [
      { label: '[ anziehen ]', cls: '',
        effect: () => { G.player.def += 1; },
        outcome: 'er passt. natürlich passt er. +1 DEF.', outcomeCol: 'green' },
      { label: '[ zerlegen ]', cls: '',
        effect: () => { G.res.stoff = Math.min(G.res.stoff + 2, 200); },
        outcome: 'du reißt das leder auf. 2 stoff.', outcomeCol: null },
    ]
  },
  {
    id: 'stimme_im_rohr',
    title: 'STIMME IM ROHR',
    body: 'durch das ventilationsrohr: eine stimme. sie nennt eine zahl. du weißt nicht warum du ihr glaubst.',
    art: `<span class="gd">  ╔═══════╗
  ║ · · · ║
  ╚═══╦═══╝
      ║
   ───╚───</span>`,
    logCol: null,
    once: true,
    choices: [
      { label: '[ zuhören ]', cls: 'know',
        effect: () => { G.wahnsinn = Math.min(100, G.wahnsinn + 5); G.player.atk += 1; },
        outcome: 'du verstehst die zahl. +1 ATK, +5% wahnsinn.', outcomeCol: 'know' },
      { label: '[ verstopfen ]', cls: '',
        effect: () => { G.res.metall = Math.min(G.res.metall + 3, 200); },
        outcome: 'du verschließt es mit einem stück blech. 3 metall gefunden.', outcomeCol: null },
    ]
  },
  {
    id: 'markierung',
    title: 'MARKIERUNG',
    body: 'auf der wand: eine markierung in einer substanz die du nicht analysierst. sie zeigt auf einen spalt im boden.',
    art: '',
    logCol: 'red',
    once: false,
    choices: [
      { label: '[ nachsehen ]', cls: 'amb',
        effect: () => {
          if (Math.random() < 0.55) {
            const h = 2 + Math.floor(Math.random()*3);
            G.res.holz = Math.min(G.res.holz + h, 200);
            return `${h} holz im spalt.`;
          } else {
            G.player.hp = Math.max(1, G.player.hp - 3);
            return 'du verletzt dich. -3 HP. nichts sonst.';
          }
        },
        outcome: '', outcomeCol: 'amber' },
      { label: '[ ignorieren ]', cls: '',
        effect: () => {},
        outcome: 'du schaust weg. die markierung bleibt.', outcomeCol: null },
    ]
  },
  {
    id: 'erschoepfung',
    title: 'ERSCHÖPFUNG',
    body: 'du bist erschöpft. die wände bewegen sich wenn du blinzelst. du könntest schlafen — aber was wenn etwas kommt.',
    art: '',
    logCol: null,
    once: false,
    choices: [
      { label: '[ schlafen ]', cls: '',
        effect: () => {
          const heal = Math.floor(G.player.maxHp * 0.35);
          G.player.hp = Math.min(G.player.maxHp, G.player.hp + heal);
          G.wahnsinn = Math.min(100, G.wahnsinn + 3);
          return `+${heal} HP. aber der traum war zu laut.`;
        },
        outcome: '', outcomeCol: 'green' },
      { label: '[ weiterarbeiten ]', cls: '',
        effect: () => {
          const amt = 3 + Math.floor(Math.random()*4);
          G.res.metall = Math.min(G.res.metall + amt, 200);
          return `du arbeitest durch. +${amt} metall. hände zittern.`;
        },
        outcome: '', outcomeCol: null },
    ]
  },
  {
    id: 'spiegel',
    title: 'DER SPIEGEL',
    body: 'eine glasscheibe. du siehst dein spiegelbild — es reagiert eine sekunde zu spät.',
    art: `<span class="gd">  ┌─────────┐
  │    @    │
  │   /|\\   │
  │   / \\   │
  └─────────┘</span>`,
    logCol: 'know',
    once: true,
    choices: [
      { label: '[ einschlagen ]', cls: 'red',
        effect: () => {
          G.res.metall = Math.min(G.res.metall + 4, 200);
          G.player.hp  = Math.max(1, G.player.hp - 2);
          G.wahnsinn   = Math.min(100, G.wahnsinn + 4);
          return 'scherben und blut. 4 metall. -2 HP. +4% wahnsinn.';
        },
        outcome: '', outcomeCol: 'red' },
      { label: '[ stehen lassen ]', cls: 'know',
        effect: () => { G.wahnsinn = Math.min(100, G.wahnsinn + 8); },
        outcome: 'du schaust zu lange. +8% wahnsinn.', outcomeCol: 'know' },
    ]
  },
  {
    id: 'kiste',
    title: 'VERSIEGELTE KISTE',
    body: 'eine metallkiste mit einem zahlencode. du hörst etwas darin. es bewegt sich.',
    art: `<span class="ga">  ╔═══════╗
  ║ [?][?] ║
  ║════════║
  ╚═══════╝</span>`,
    logCol: 'amber',
    once: false,
    choices: [
      { label: '[ aufbrechen ]', cls: 'amb',
        effect: () => {
          if (Math.random() < 0.6) {
            const m = 5 + Math.floor(Math.random()*6);
            const s = 1 + Math.floor(Math.random()*2);
            G.res.metall = Math.min(G.res.metall + m, 200);
            G.res.stoff  = Math.min(G.res.stoff  + s, 200);
            return `du öffnest sie. ${m} metall, ${s} stoff. was drin war ist jetzt weg.`;
          } else {
            G.wahnsinn  = Math.min(100, G.wahnsinn + 6);
            G.player.hp = Math.max(1, G.player.hp - 4);
            return 'du öffnest sie. etwas kommt heraus. -4 HP, +6% wahnsinn.';
          }
        },
        outcome: '', outcomeCol: 'amber' },
      { label: '[ dalassen ]', cls: '',
        effect: () => {},
        outcome: 'du lässt sie stehen. das geräusch hört auf.', outcomeCol: null },
    ]
  },
  {
    id: 'notiz',
    title: 'NOTIZ',
    body: 'eine handgeschriebene notiz: "der dritte gang ab rechts führt nicht zurück. ich habe es dreimal versucht." — die unterschrift ist dein name.',
    art: `<span class="gd">  ╭───────────────╮
  │ ~~~~~~~~~~~~~ │
  │ ~~~~~~~~~~    │
  │        — du   │
  ╰───────────────╯</span>`,
    logCol: 'know',
    once: true,
    choices: [
      { label: '[ mitnehmen ]', cls: 'know',
        effect: () => { G.wahnsinn = Math.min(100, G.wahnsinn + 7); G.player.def += 1; },
        outcome: 'du weißt jetzt etwas. +1 DEF, +7% wahnsinn.', outcomeCol: 'know' },
      { label: '[ verbrennen ]', cls: '',
        effect: () => { G.res.nahrung = Math.min(G.res.nahrung + 2, 200); },
        outcome: 'es brennt schnell. wärme, keine antworten. 2 nahrung.', outcomeCol: null },
    ]
  },
  {
    id: 'kaelte',
    title: 'KÄLTEEINBRUCH',
    body: 'die temperatur fällt ohne erklärung. dein atem wird sichtbar. etwas reguliert sie von unten.',
    art: '',
    logCol: null,
    once: false,
    choices: [
      { label: '[ feuer machen ]', cls: 'amb',
        effect: () => {
          if (G.res.holz >= 2) {
            G.res.holz -= 2;
            const heal = 6;
            G.player.hp = Math.min(G.player.maxHp, G.player.hp + heal);
            return `holz verbrennt. wärme kehrt zurück. +${heal} HP.`;
          }
          return 'zu wenig holz. du frierst weiter.';
        },
        outcome: '', outcomeCol: 'amber' },
      { label: '[ durchhalten ]', cls: '',
        effect: () => { G.player.def += 1; },
        outcome: 'du gewöhnst dich an die kälte. +1 DEF.', outcomeCol: null },
    ]
  },
  {
    id: 'händler',
    title: 'EIN ANGEBOT',
    body: 'ein tisch aus trümmern. darauf: ressourcen. daneben: jemand der wartet und nicht erklärt.',
    art: `<span class="ga">  ┌─────────────┐
  │  [?] → [?]  │
  └─────────────┘</span>`,
    logCol: 'amber', once: false,
    choices: [
      { label: '[ handeln ]', cls: 'amb',
        effect: () => {
          const trades = [
            {give:'holz',   gAmt:5, take:'metall',  tAmt:3},
            {give:'stoff',  gAmt:4, take:'holz',    tAmt:6},
            {give:'nahrung',gAmt:5, take:'stoff',   tAmt:4},
            {give:'metall', gAmt:3, take:'nahrung', tAmt:6},
            {give:'holz',   gAmt:7, take:'stoff',   tAmt:5},
            {give:'nahrung',gAmt:4, take:'metall',  tAmt:2},
          ];
          const t = trades[Math.floor(Math.random()*trades.length)];
          if (G.res[t.give] < t.gAmt) return `zu wenig ${t.give}. der händler nickt und wartet.`;
          G.res[t.give] -= t.gAmt; G.res[t.take] = Math.min(G.res[t.take]+t.tAmt,200);
          return `${t.gAmt} ${t.give} gegen ${t.tAmt} ${t.take}. fair.`;
        }, outcomeCol: 'amber' },
      { label: '[ ablehnen ]', cls: '',
        effect: () => {}, outcome: 'er nickt. beim nächsten mal vielleicht.', outcomeCol: null },
    ]
  },
  {
    id: 'fremder_sammler',
    title: 'JEMAND AN DER TÜR',
    body: 'ein klopfen. vorsichtig. als ob derjenige nicht sicher ist ob er stören darf. draußen steht jemand mit leeren händen und einem müden gesicht.',
    art: `<span class="gd">     ╭───╮
     │ · │
  ───┤   ├───
     │   │
     ╰───╯</span>`,
    logCol: null, once: true,
    choices: [
      { label: '[ reinlassen ]', cls: 'know',
        effect: () => {
          const slots = getSurvivorSlots();
          if (G.survivors.length >= slots) return 'kein platz. unterkunft bauen.';
          G.survivors.push({ type: 'sammler' });
          return 'er bleibt. er fängt sofort an zu suchen. der SAMMLER ist jetzt in der basis.';
        }, outcomeCol: 'green' },
      { label: '[ wegschicken ]', cls: 'red',
        effect: () => { G.res.holz = Math.min(G.res.holz + 3, 200);
          return 'er lässt holz da bevor er geht. 3 holz.'; }, outcomeCol: null },
    ]
  },
  {
    id: 'tropfen',
    title: 'TROPFENGERÄUSCH',
    body: 'rhythmisch. regelmäßig. irgendwo tropft flüssigkeit. du findest die quelle — eine aufgebrochene leitung.',
    art: '',
    logCol: null,
    once: false,
    choices: [
      { label: '[ sammeln ]', cls: '',
        effect: () => {
          const n = 2 + Math.floor(Math.random()*3);
          G.res.nahrung = Math.min(G.res.nahrung + n, 200);
          return `trinkwasser. es hat eine farbe aber du ignorierst sie. +${n} nahrung.`;
        },
        outcome: '', outcomeCol: null },
      { label: '[ abdichten ]', cls: '',
        effect: () => {
          G.res.metall = Math.min(G.res.metall + 2, 200);
          G.wahnsinn   = Math.max(0, G.wahnsinn - 3);
          return 'stille. -3% wahnsinn. du findest 2 metall an der leitung.';
        },
        outcome: '', outcomeCol: null },
    ]
  },
];


// ================================================================
// CURSES
// ================================================================
const CURSE_DEFS = {
  stimmen:     { name:'STIMMEN',     sym:'◉', desc:'das auge zeigt dir zu viel. wahnsinn steigt.',
                 tickInterval:60,  effect:()=>{ G.wahnsinn=Math.min(100,G.wahnsinn+1); } },
  erschöpfung: { name:'ERSCHÖPFUNG',sym:'≈', desc:'das echo erschöpft dich. heilung vermindert.',
                 passive:true },  // handled in doRest
  hunger:      { name:'HUNGER',      sym:'▽', desc:'der abdruck verbraucht dich. nahrung schwindet.',
                 tickInterval:30,  effect:()=>{ G.res.nahrung=Math.max(0,G.res.nahrung-1); } },
  blutung:     { name:'BLUTUNG',     sym:'✗', desc:'die gleichung läuft durch dich. HP sinkt langsam.',
                 tickInterval:20,  effect:()=>{ if(G.player.hp>1) G.player.hp=Math.max(1,G.player.hp-1); } },
};

// ================================================================
// SYNERGIES
// ================================================================
const SYNERGY_CHECKS = [
  { needs:['auge','echo'],
    text:'das auge und das echo resonieren. du siehst dich selbst von außen. +1 DEF.',
    effect:()=>{ G.player.def+=1; } },
  { needs:['echo','abdruck'],
    text:'das echo kennt den abdruck. du erkennst die stimmen als deine eigenen. wahnsinn −8%.',
    effect:()=>{ G.wahnsinn=Math.max(0,G.wahnsinn-8); } },
  { needs:['auge','gleichung'],
    text:'das auge liest die gleichung. beide verstummen gleichzeitig. +2 ATK.',
    effect:()=>{ G.player.atk+=2; } },
  { needs:['abdruck','gleichung'],
    text:'abdruck und gleichung. du kennst die formel deiner eigenen form. maxHP +8.',
    effect:()=>{ G.player.maxHp+=8; G.player.hp+=8; } },
  { needs:['auge','echo','abdruck','gleichung'],
    text:'vier relikte. du bist vollständig unvollständig. alle flüche schwächen sich ab.',
    effect:()=>{ G.curses=[]; } },
];

// ================================================================
// COMPANION DIALOGUES
// ================================================================
const COMPANION_LINES = {
  schmied:   ['das metall hier hat eine komische zusammensetzung.','ich habe noch nie stahl wie diesen gesehen.','mit dem richtigen werkzeug wäre alles möglich.','sag mir wenn du mehr brauchst.'],
  heiler:    ['trink mehr. es hilft nicht, aber es hilft.','diese wände machen krank.','du siehst besser aus. relativ gesehen.','schlaf wenn du kannst.'],
  wächter:   ['ich habe heute nacht etwas gehört. ich erzähle es dir nicht.','alles ruhig. soweit.','ich halte wache. geh schlafen.','nichts bewegt sich. noch.'],
  sammler:   ['unter dem schacht: mehr holz. ich habe es schon geholt.','der sektor ost gibt nichts mehr her.','ich glaube wir sind nicht alleine hier.','es wird knapp.'],
  kartograf: ['der gang nach links biegt falsch ab.','ich habe diese struktur anderswo gesehen.','die karten stimmen nicht mit der realität überein.','ebene drei ist nicht wo sie sein sollte.'],
};

// ================================================================
// SURVIVORS
// ================================================================
const SURVIVOR_DEFS = {
  schmied:   { name:'SCHMIED',    role:'metallbearbeitung', desc:'kann metall formen. waffen. rüstung. dinge die standhalten.' },
  heiler:    { name:'HEILER',     role:'medizin',           desc:'kennt kräuter. verbessert heilung. hält dich länger am leben.' },
  wächter:   { name:'WÄCHTER',    role:'wache',             desc:'hält die stellung. du kämpfst mit mehr rückhalt. DEF +2.' },
  sammler:   { name:'SAMMLER',    role:'beschaffung',       desc:'durchsucht trümmer ohne pause. ressourcen kommen von selbst.' },
  kartograf: { name:'KARTOGRAF',  role:'navigation',        desc:'hat die strukturen im kopf. der grundriss ist beim betreten sichtbar.' },
};

const PILZ_WHISPERS = [
  'die pilze erinnern sich.','sie wuchsen hier bevor du kamst.','unter dem boden ist mehr.',
  'die sporen kennen deinen weg.','sie haben gedächtnis.','alles ist verbunden.',
];

// ================================================================
// FUNK EVENTS (Funkkabine transmissions)
// ================================================================
const FUNK_EVENTS = [
  {
    id: 'signal_koordinaten',
    title: 'SIGNAL: KOORDINATEN',
    body: 'frequenzrauschen. dann zahlen. eine koordinate, die keinen ort auf keiner karte markiert.',
    art: `<span class="gd">  ╔══════════════╗
  ║ ·─·─·─·─·─· ║
  ║ 47.3 // 9.1 ║
  ╚══════════════╝</span>`,
    logCol: 'know', once: false,
    choices: [
      { label: '[ aufzeichnen ]', cls: 'know',
        effect: () => { G.wahnsinn = Math.min(100, G.wahnsinn + 4); G.player.def += 1;
          return 'du verstehst die bedeutung. irgendwie. +1 DEF, +4% wahnsinn.'; }, outcomeCol: 'know' },
      { label: '[ ignorieren ]', cls: '',
        effect: () => { G.res.metall = Math.min(G.res.metall + 3, 200);
          return 'du baust die antenne teilweise ab. 3 metall.'; }, outcomeCol: null },
    ]
  },
  {
    id: 'signal_stimme',
    title: 'SIGNAL: STIMME',
    body: 'eine menschliche stimme. klar. ruhig. sie liest eine liste vor. dein name ist nicht dabei. aber die beschreibung passt.',
    art: '',
    logCol: null, once: true,
    choices: [
      { label: '[ zuhören ]', cls: '',
        effect: () => { const h = Math.floor(G.player.maxHp * 0.2);
          G.player.hp = Math.min(G.player.maxHp, G.player.hp + h);
          return `die stimme beruhigt dich. +${h} HP.`; }, outcomeCol: 'green' },
      { label: '[ unterbrechen ]', cls: 'red',
        effect: () => { G.wahnsinn = Math.min(100, G.wahnsinn + 8); G.res.metall = Math.min(G.res.metall + 6, 200);
          return 'du störst die übertragung. 6 metall. die stille danach ist schlimmer.'; }, outcomeCol: 'red' },
    ]
  },
  {
    id: 'signal_muster',
    title: 'SIGNAL: MUSTER',
    body: 'kein ton. kein wort. nur ein rhythmisches muster das sich alle 17 sekunden wiederholt. du fängst an es zu erkennen.',
    art: '',
    logCol: 'amber', once: false,
    choices: [
      { label: '[ das muster notieren ]', cls: 'amb',
        effect: () => {
          const res = ['holz','stoff','nahrung'][Math.floor(Math.random()*3)];
          const amt = 3 + Math.floor(Math.random()*4);
          G.res[res] = Math.min(G.res[res] + amt, 200);
          return `das muster führt zu etwas. +${amt} ${res}.`;
        }, outcomeCol: 'amber' },
      { label: '[ gerät ausschalten ]', cls: '',
        effect: () => { G.wahnsinn = Math.max(0, G.wahnsinn - 6);
          return 'stille. wahnsinn −6%.'; }, outcomeCol: null },
    ]
  },
];

// ================================================================
// MADNESS EFFECTS
// ================================================================
const PHANTOM_LINES = [
  'es schreibt mit.','ich war hier.','sieben ebenen und keine zurück.',
  'hör auf nach unten zu gehen.','du hörst mich nicht.',
  'was du trägst trägt dich.','die treppe hat kein ende.',
];

function phantomLog() {
  const msg = PHANTOM_LINES[Math.floor(Math.random()*PHANTOM_LINES.length)];
  const el  = document.getElementById('log');
  const div = document.createElement('div');
  div.className = 'le';
  div.innerHTML = `<span class="lts">??:??</span><span style="color:var(--horror);font-size:11px;opacity:.6;font-style:italic">${msg}</span>`;
  el.insertBefore(div, el.firstChild);
}

function maybeScramble(text) {
  if (G.wahnsinn < 55 || Math.random() > (G.wahnsinn - 55)/80) return text;
  return text.split('').map(ch => {
    if (ch===' '||ch==='.'||ch==='—') return ch;
    if (Math.random() < 0.12) {
      const rep = ['e','i','a','o','n','s','·','─','│'];
      return rep[Math.floor(Math.random()*rep.length)];
    }
    return ch;
  }).join('');
}
