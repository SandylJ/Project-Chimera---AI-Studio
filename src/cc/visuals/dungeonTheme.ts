// Dungeon-specific visual themes: backgrounds, palettes, ambient particles.

export interface DungeonTheme {
  skyGradient: string;        // top→bottom sky/wall
  floorGradient: string;      // floor near→far
  floorBand: string;          // solid floor accent
  accentColor: string;        // glow color
  fogColor: string;           // atmospheric haze
  ambientKind: 'dust' | 'embers' | 'snow' | 'bubbles' | 'sparks' | 'leaves' | 'shadow' | 'stars' | 'webs';
  bgEmoji: string[];          // decorative emoji placed as parallax
  emojiHueShift?: number;     // optional filter-like tint
  vignetteColor: string;
}

export const DUNGEON_THEMES: Record<string, DungeonTheme> = {
  sewer_warrens: {
    skyGradient: 'linear-gradient(180deg, #1a2418 0%, #0d1410 60%, #141812 100%)',
    floorGradient: 'linear-gradient(180deg, #2f3a2a 0%, #1d241b 100%)',
    floorBand: '#3a4a34',
    accentColor: '#7fcf7a',
    fogColor: 'rgba(80, 120, 70, 0.12)',
    ambientKind: 'bubbles',
    bgEmoji: ['🪨', '💧', '🕸️', '🪨'],
    vignetteColor: 'rgba(10, 20, 8, 0.85)',
  },
  goblin_camp: {
    skyGradient: 'linear-gradient(180deg, #2b1a12 0%, #180f0a 60%, #1d120c 100%)',
    floorGradient: 'linear-gradient(180deg, #4a2f1a 0%, #291c12 100%)',
    floorBand: '#5a3820',
    accentColor: '#ff9040',
    fogColor: 'rgba(255, 120, 40, 0.1)',
    ambientKind: 'embers',
    bgEmoji: ['🔥', '🏕️', '🦴', '🏹'],
    vignetteColor: 'rgba(30, 10, 0, 0.85)',
  },
  ancient_crypt: {
    skyGradient: 'linear-gradient(180deg, #1a1628 0%, #0a0814 60%, #120f1c 100%)',
    floorGradient: 'linear-gradient(180deg, #2d2438 0%, #15111e 100%)',
    floorBand: '#3a3048',
    accentColor: '#b485e8',
    fogColor: 'rgba(140, 100, 200, 0.1)',
    ambientKind: 'shadow',
    bgEmoji: ['⚰️', '💀', '🕯️', '🪦'],
    vignetteColor: 'rgba(10, 5, 20, 0.9)',
  },
  spider_hollow: {
    skyGradient: 'linear-gradient(180deg, #1a1214 0%, #0a0608 60%, #14080f 100%)',
    floorGradient: 'linear-gradient(180deg, #2a1a1d 0%, #180c0f 100%)',
    floorBand: '#3e1e22',
    accentColor: '#d86eb2',
    fogColor: 'rgba(180, 80, 120, 0.08)',
    ambientKind: 'webs',
    bgEmoji: ['🕸️', '🕷️', '🥚', '🕸️'],
    vignetteColor: 'rgba(10, 0, 5, 0.9)',
  },
  ice_caverns: {
    skyGradient: 'linear-gradient(180deg, #142438 0%, #0a1422 60%, #1a2c44 100%)',
    floorGradient: 'linear-gradient(180deg, #2a486a 0%, #18283e 100%)',
    floorBand: '#3a5c80',
    accentColor: '#8fdcff',
    fogColor: 'rgba(180, 220, 255, 0.14)',
    ambientKind: 'snow',
    bgEmoji: ['🧊', '❄️', '🗻', '🧊'],
    vignetteColor: 'rgba(10, 20, 40, 0.85)',
  },
  volcanic_forge: {
    skyGradient: 'linear-gradient(180deg, #3a1208 0%, #1a0604 60%, #2a0a05 100%)',
    floorGradient: 'linear-gradient(180deg, #6a2010 0%, #2a0e06 100%)',
    floorBand: '#8a2a12',
    accentColor: '#ff6030',
    fogColor: 'rgba(255, 80, 30, 0.18)',
    ambientKind: 'embers',
    bgEmoji: ['🌋', '🔥', '💎', '🔥'],
    vignetteColor: 'rgba(30, 0, 0, 0.8)',
  },
  sunken_temple: {
    skyGradient: 'linear-gradient(180deg, #082830 0%, #03141a 60%, #0a2a34 100%)',
    floorGradient: 'linear-gradient(180deg, #144050 0%, #0a202a 100%)',
    floorBand: '#1a5c70',
    accentColor: '#5edcff',
    fogColor: 'rgba(80, 200, 240, 0.13)',
    ambientKind: 'bubbles',
    bgEmoji: ['🏛️', '🐚', '🐠', '🪨'],
    vignetteColor: 'rgba(0, 10, 20, 0.85)',
  },
  dragons_lair: {
    skyGradient: 'linear-gradient(180deg, #2a1808 0%, #180c04 60%, #1c1208 100%)',
    floorGradient: 'linear-gradient(180deg, #5a3812 0%, #2a1c08 100%)',
    floorBand: '#8a5a20',
    accentColor: '#f2b84b',
    fogColor: 'rgba(255, 180, 70, 0.12)',
    ambientKind: 'sparks',
    bgEmoji: ['💰', '💎', '🐉', '🪙'],
    vignetteColor: 'rgba(30, 15, 0, 0.85)',
  },
  abyss_gate: {
    skyGradient: 'linear-gradient(180deg, #0a0618 0%, #030208 60%, #0c0820 100%)',
    floorGradient: 'linear-gradient(180deg, #1a1030 0%, #0a0618 100%)',
    floorBand: '#2a1a50',
    accentColor: '#c58bff',
    fogColor: 'rgba(180, 100, 255, 0.15)',
    ambientKind: 'stars',
    bgEmoji: ['🌌', '👁️', '🌀', '⭐'],
    vignetteColor: 'rgba(0, 0, 10, 0.92)',
  },
};

export function themeFor(defId: string | undefined): DungeonTheme {
  return (defId && DUNGEON_THEMES[defId]) || DUNGEON_THEMES.sewer_warrens;
}
