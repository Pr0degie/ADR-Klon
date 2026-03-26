// ============================================================================
//  KONSTANTEN & FARBPALETTE
//  Stellt bereit: SCREEN_W, SCREEN_H, FOV, MAX_DEPTH, MINIMAP_SIZE, COLORS,
//                 RC_CELL, RC_SPRITE_DEFS
// ============================================================================

var SCREEN_W     = 120;
var SCREEN_H     = 36;
var FOV          = Math.PI / 3;
var MAX_DEPTH    = 32;
var MINIMAP_SIZE = 12;
var RC_CELL      = 8;

var COLORS = {
  stoneNear:  { hex: '#c4b5fd', glow: 'rgba(196,181,253,0.6)' },
  stoneMid:   { hex: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
  stoneFar:   { hex: '#5b21b6', glow: 'rgba(91,33,182,0.3)' },
  stoneDim:   { hex: '#2e1065', glow: 'rgba(46,16,101,0.2)' },
  stoneVoid:  { hex: '#1a0a2e', glow: 'rgba(26,10,46,0.1)' },
  eldNear:    { hex: '#5eead4', glow: 'rgba(94,234,212,0.7)' },
  eldMid:     { hex: '#14b8a6', glow: 'rgba(20,184,166,0.5)' },
  eldFar:     { hex: '#0d7377', glow: 'rgba(13,115,119,0.3)' },
  eldDim:     { hex: '#134e4a', glow: 'rgba(19,78,74,0.2)' },
  eldVoid:    { hex: '#0a2a2a', glow: 'rgba(10,42,42,0.1)' },
  edgeBright: { hex: '#f0abfc', glow: 'rgba(240,171,252,0.8)' },
  edgeEld:    { hex: '#67e8f9', glow: 'rgba(103,232,249,0.8)' },
  floorNear:  { hex: '#6b21a8', glow: 'rgba(107,33,168,0.3)' },
  floorMid:   { hex: '#3b0764', glow: 'rgba(59,7,100,0.2)' },
  floorFar:   { hex: '#1e0638', glow: 'rgba(30,6,56,0.1)' },
  floorVoid:  { hex: '#0f0320', glow: 'rgba(15,3,32,0.05)' },
  ceilNear:   { hex: '#312e81', glow: 'rgba(49,46,129,0.2)' },
  ceilFar:    { hex: '#1e1b4b', glow: 'rgba(30,27,75,0.1)' },
  ceilVoid:   { hex: '#0c0a2a', glow: 'rgba(12,10,42,0.05)' },
  mapWall:    { hex: '#7c3aed', glow: 'rgba(124,58,237,0.4)' },
  mapEld:     { hex: '#14b8a6', glow: 'rgba(20,184,166,0.4)' },
  mapFloor:   { hex: '#1e0638', glow: 'none' },
  mapPlayer:  { hex: '#f0abfc', glow: 'rgba(240,171,252,0.9)' },
  mapBorder:  { hex: '#4c1d95', glow: 'rgba(76,29,149,0.3)' },
  mapFog:     { hex: '#0a0515', glow: 'none' },
  void:       { hex: '#03000a', glow: 'none' },
};

// Test-Modus: alle Sprites aus lovecraft_sprites.js + rpg_sprites.js auf Ebene 1 spawnen
var RC_SPRITE_TEST = true;

var RC_SPRITE_DEFS = {
  artifact:      { ch: '✦', color: { hex: '#fbbf24', glow: 'rgba(251,191,36,0.9)' } },
  enemy:         { ch: '▲', color: { hex: '#ef4444', glow: 'rgba(239,68,68,0.8)' } },
  loot:          { ch: '◇', color: { hex: '#f59e0b', glow: 'rgba(245,158,11,0.7)' } },
  stairs:        { ch: '▼', color: { hex: '#22c55e', glow: 'rgba(34,197,94,0.8)' } },
  mushroom:      { ch: '⁂', color: { hex: '#4ade80', glow: 'rgba(74,222,128,0.7)' } },
  wasserleitung: { ch: '○', color: { hex: '#67e8f9', glow: 'rgba(103,232,249,0.7)' } },
  schlafkammer:  { ch: '⌂', color: { hex: '#a78bfa', glow: 'rgba(167,139,250,0.6)' } },
  funkkabine:    { ch: '⊕', color: { hex: '#fbbf24', glow: 'rgba(251,191,36,0.7)' } },
  waffenlager:   { ch: '⚔', color: { hex: '#f87171', glow: 'rgba(248,113,113,0.6)' } },
  survivor:      { ch: '☺', color: { hex: '#22c55e', glow: 'rgba(34,197,94,0.8)' } },
  'rückblick':   { ch: '◎', color: { hex: '#c4b5fd', glow: 'rgba(196,181,253,0.7)' } },
  start:         { ch: '⌂', color: { hex: '#6b21a8', glow: 'rgba(107,33,168,0.3)' } },
};
