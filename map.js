'use strict';

// ================================================================
// SEEDED RNG
// ================================================================
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(1664525, s) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
}

// ================================================================
// MAP GENERATION
// ================================================================
function generateFloor(floorIdx) {
  const rng = makeRng(floorIdx * 2971 + 137);
  const W = GRID_W, H = GRID_H;
  const grid = Array.from({length:H}, () => Array(W).fill(null));
  const conns = [];

  const SR = 1, SC = 0;
  const placed = [{r:SR, c:SC}];
  grid[SR][SC] = {type:'start', visited:true, content:'start', cleared:true};

  const frontier = neighbors(SR, SC, W, H);
  const target = 7 + Math.floor(rng() * 3);

  while (placed.length < target && frontier.length > 0) {
    const fi = Math.floor(rng() * frontier.length);
    const {r, c, fr, fc} = frontier[fi];
    frontier.splice(fi, 1);
    if (grid[r][c]) continue;

    grid[r][c] = {type:'room', visited:false, content:null, cleared:false, looted:false};
    placed.push({r, c});
    conns.push({r1:fr, c1:fc, r2:r, c2:c});

    const nb = neighbors(r, c, W, H);
    for (const n of nb) {
      if (!grid[n.r][n.c] && !frontier.some(f=>f.r===n.r&&f.c===n.c))
        frontier.push(n);
    }
  }

  for (const {r, c} of placed) {
    for (const {r:nr, c:nc} of neighbors(r, c, W, H).map(n=>({r:n.r,c:n.c}))) {
      if (grid[nr][nc] && !hasConn(conns, r,c,nr,nc) && rng() < 0.28)
        conns.push({r1:r,c1:c,r2:nr,c2:nc});
    }
  }

  const dist = bfsDist(SR, SC, placed, conns);
  let maxDist = 0, ar = SR, ac = SC;
  for (const {r,c} of placed) {
    const d = dist[`${r},${c}`] ?? 0;
    if (!(r===SR&&c===SC) && d > maxDist) { maxDist=d; ar=r; ac=c; }
  }
  grid[ar][ac].content = 'artifact';

  const others = placed.filter(p => !(p.r===SR&&p.c===SC) && !(p.r===ar&&p.c===ac));
  for (const {r,c} of others) {
    const roll = rng();
    const eDiff = Math.min(0.15 + floorIdx * 0.08, 0.5);
    if      (roll < eDiff)        grid[r][c].content = 'enemy';
    else if (roll < eDiff + 0.35) grid[r][c].content = 'loot';
    else                          grid[r][c].content = 'empty';
  }

  return { grid, conns, W, H, pr:SR, pc:SC };
}

function neighbors(r, c, W, H) {
  return [{dr:-1,dc:0},{dr:1,dc:0},{dr:0,dc:-1},{dr:0,dc:1}]
    .map(({dr,dc}) => ({r:r+dr, c:c+dc, fr:r, fc:c}))
    .filter(n => n.r>=0&&n.r<H&&n.c>=0&&n.c<W);
}

function hasConn(conns, r1,c1,r2,c2) {
  return conns.some(cn =>
    (cn.r1===r1&&cn.c1===c1&&cn.r2===r2&&cn.c2===c2) ||
    (cn.r1===r2&&cn.c1===c2&&cn.r2===r1&&cn.c2===c1)
  );
}

function bfsDist(sr, sc, placed, conns) {
  const dist = {[`${sr},${sc}`]:0};
  const q = [{r:sr,c:sc}];
  while (q.length) {
    const {r,c} = q.shift();
    for (const cn of conns) {
      let nr, nc;
      if (cn.r1===r&&cn.c1===c){nr=cn.r2;nc=cn.c2}
      else if(cn.r2===r&&cn.c2===c){nr=cn.r1;nc=cn.c1}
      else continue;
      const key=`${nr},${nc}`;
      if (dist[key]===undefined){dist[key]=(dist[`${r},${c}`]??0)+1;q.push({r:nr,c:nc});}
    }
  }
  return dist;
}

// ================================================================
// MAP RENDERING
// ================================================================
function renderMap() {
  const m = G.map; if (!m) return '';
  const {grid, conns, W, H, pr, pc} = m;

  function isVisible(r, c) {
    if (!grid[r][c]) return false;
    if (grid[r][c].visited) return true;
    for (const {r:nr,c:nc,fr,fc} of neighbors(r,c,W,H)) {
      if (grid[nr]?.[nc]?.visited && hasConn(conns,r,c,nr,nc)) return true;
    }
    return false;
  }

  function roomChar(r, c) {
    const isPlayer = (r===pr && c===pc);
    const room = grid[r]?.[c];
    if (!room) return `<span class="gd2"> </span>`;
    if (!isVisible(r,c)) return `<span class="gd2">▪</span>`;
    if (isPlayer) return `<span class="gc blink">@</span>`;
    if (!room.visited) return `<span class="gd">▪</span>`;
    switch(room.content) {
      case 'start':    return `<span class="gg">⌂</span>`;
      case 'artifact': return room.cleared ? `<span class="gd">·</span>` : `<span class="gk pulsek">✦</span>`;
      case 'stairs':   return `<span class="gg pulseg">▼</span>`;
      case 'enemy':    return room.cleared ? `<span class="gd">·</span>` : `<span class="gr pulser">!</span>`;
      case 'loot':     return room.looted  ? `<span class="gd">·</span>` : `<span class="ga">◇</span>`;
      case 'mushroom':      return room.cleared ? `<span class="gd">·</span>` : `<span class="ga pulsea">⁂</span>`;
      case 'wasserleitung': return room.cleared ? `<span class="gd">·</span>` : `<span class="gc">○</span>`;
      case 'schlafkammer':  return room.cleared ? `<span class="gd">·</span>` : `<span class="gd">⌂</span>`;
      case 'funkkabine':    return room.cleared ? `<span class="gd">·</span>` : `<span class="gk pulsek">⊕</span>`;
      case 'waffenlager':   return room.cleared ? `<span class="gd">·</span>` : `<span class="gr">⚔</span>`;
      case 'survivor':      return room.cleared ? `<span class="gd">·</span>` : `<span class="gg pulseg">✦</span>`;
      case 'rückblick':     return room.cleared ? `<span class="gd">·</span>` : `<span class="gk">◎</span>`;
      case 'empty':    return `<span class="gd">·</span>`;
      default:         return `<span class="gd">·</span>`;
    }
  }

  function hCor(r, c) {
    if (!grid[r]?.[c] || !grid[r]?.[c+1]) return `   `;
    if (!hasConn(conns, r,c,r,c+1)) return `   `;
    if (!isVisible(r,c) && !isVisible(r,c+1)) return `   `;
    return `<span class="gd">───</span>`;
  }

  function vCor(r, c) {
    if (!grid[r]?.[c] || !grid[r+1]?.[c]) return ` `;
    if (!hasConn(conns, r,c,r+1,c)) return ` `;
    if (!isVisible(r,c) && !isVisible(r+1,c)) return ` `;
    return `<span class="gd">│</span>`;
  }

  let lines = [];
  for (let r = 0; r < H; r++) {
    let line = '';
    for (let c = 0; c < W; c++) {
      line += roomChar(r, c);
      if (c < W-1) line += hCor(r, c);
    }
    lines.push(line);
    if (r < H-1) {
      let vline = '';
      for (let c = 0; c < W; c++) {
        vline += vCor(r, c);
        if (c < W-1) vline += `   `;
      }
      lines.push(vline);
    }
  }
  return lines.join('\n');
}

