// Dungeon-specific visual themes: palettes, ambient particles.
// Reworked to match Clickpocalypse II's warm-stone aesthetic.

export interface DungeonTheme {
  // Outer / void color (the dark around the dungeon)
  voidColor: string;
  // Walls
  wallTop: string;          // lightest highlight on top edge
  wallLight: string;        // main light block color
  wallMid: string;          // mid-tone
  wallDark: string;         // deep mortar / shadow
  wallMortar: string;       // grout between bricks
  // Floor
  floorLight: string;
  floorMid: string;
  floorDark: string;
  // Accents
  accentColor: string;      // UI glow / HUD color
  fogColor: string;
  // Ambient
  ambientKind: 'dust' | 'embers' | 'snow' | 'bubbles' | 'sparks' | 'leaves' | 'shadow' | 'stars' | 'webs';
  bgEmoji: string[];
  vignetteColor: string;
}

const STONE_WARM: Omit<DungeonTheme, 'ambientKind' | 'bgEmoji' | 'accentColor' | 'fogColor' | 'vignetteColor'> = {
  voidColor: '#000000',
  wallTop:   '#e9cf95',
  wallLight: '#c9a870',
  wallMid:   '#9a7a50',
  wallDark:  '#5a4028',
  wallMortar:'#3a2618',
  floorLight:'#d8b582',
  floorMid:  '#b08656',
  floorDark: '#7a5838',
};

const STONE_COLD: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#b8d4e8',
  wallLight: '#8ab3d0',
  wallMid:   '#5c84a4',
  wallDark:  '#2e4a64',
  wallMortar:'#1a2e40',
  floorLight:'#b8d0dc',
  floorMid:  '#7a9cb4',
  floorDark: '#4a6884',
};

const STONE_CRYPT: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#c8b8d8',
  wallLight: '#9080b0',
  wallMid:   '#5d486e',
  wallDark:  '#322038',
  wallMortar:'#1a0c22',
  floorLight:'#a898b0',
  floorMid:  '#6c5a76',
  floorDark: '#3c2a40',
};

const STONE_LAVA: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#f0a890',
  wallLight: '#c46c4a',
  wallMid:   '#8a3a22',
  wallDark:  '#4a1a0c',
  wallMortar:'#26080a',
  floorLight:'#d88a58',
  floorMid:  '#a85020',
  floorDark: '#5a1e0a',
};

const STONE_ICE: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#d8ecf8',
  wallLight: '#9cc0dc',
  wallMid:   '#5a88ac',
  wallDark:  '#2e4c6c',
  wallMortar:'#14243a',
  floorLight:'#c4e0f0',
  floorMid:  '#7ea8c8',
  floorDark: '#4a6a88',
};

const STONE_WEB: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#e0c8c4',
  wallLight: '#b09088',
  wallMid:   '#7a584c',
  wallDark:  '#3a2018',
  wallMortar:'#22100a',
  floorLight:'#b89c90',
  floorMid:  '#8a6858',
  floorDark: '#503828',
};

const STONE_AQUA: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#a8e0d8',
  wallLight: '#78b0a8',
  wallMid:   '#42786e',
  wallDark:  '#1c3a34',
  wallMortar:'#0a1e1c',
  floorLight:'#a0cac0',
  floorMid:  '#58907e',
  floorDark: '#2a4e44',
};

const STONE_GOLD: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#f5d890',
  wallLight: '#d0a048',
  wallMid:   '#8a6420',
  wallDark:  '#4a3410',
  wallMortar:'#22180a',
  floorLight:'#d8b068',
  floorMid:  '#a07830',
  floorDark: '#5a3e14',
};

const STONE_VOID: typeof STONE_WARM = {
  voidColor: '#000000',
  wallTop:   '#b090d8',
  wallLight: '#6a4a90',
  wallMid:   '#3c2860',
  wallDark:  '#1a1030',
  wallMortar:'#0a0418',
  floorLight:'#a088c0',
  floorMid:  '#5a427e',
  floorDark: '#281a44',
};

export const DUNGEON_THEMES: Record<string, DungeonTheme> = {
  sewer_warrens: {
    ...STONE_WARM,
    accentColor: '#7fcf7a',
    fogColor: 'rgba(80, 120, 70, 0.08)',
    ambientKind: 'bubbles',
    bgEmoji: ['🦴', '💧', '🕸️', '🪨'],
    vignetteColor: 'rgba(20, 10, 5, 0.85)',
  },
  goblin_camp: {
    ...STONE_WARM,
    accentColor: '#ff9040',
    fogColor: 'rgba(255, 120, 40, 0.08)',
    ambientKind: 'embers',
    bgEmoji: ['🔥', '🏕️', '🦴', '🏹'],
    vignetteColor: 'rgba(40, 14, 4, 0.85)',
  },
  ancient_crypt: {
    ...STONE_CRYPT,
    accentColor: '#b485e8',
    fogColor: 'rgba(140, 100, 200, 0.12)',
    ambientKind: 'shadow',
    bgEmoji: ['⚰️', '💀', '🕯️', '🪦'],
    vignetteColor: 'rgba(12, 5, 22, 0.9)',
  },
  spider_hollow: {
    ...STONE_WEB,
    accentColor: '#d86eb2',
    fogColor: 'rgba(180, 80, 120, 0.08)',
    ambientKind: 'webs',
    bgEmoji: ['🕸️', '🕷️', '🥚', '🕸️'],
    vignetteColor: 'rgba(18, 6, 10, 0.9)',
  },
  ice_caverns: {
    ...STONE_ICE,
    accentColor: '#8fdcff',
    fogColor: 'rgba(180, 220, 255, 0.14)',
    ambientKind: 'snow',
    bgEmoji: ['🧊', '❄️', '🗻', '🧊'],
    vignetteColor: 'rgba(12, 26, 46, 0.85)',
  },
  volcanic_forge: {
    ...STONE_LAVA,
    accentColor: '#ff6030',
    fogColor: 'rgba(255, 80, 30, 0.18)',
    ambientKind: 'embers',
    bgEmoji: ['🌋', '🔥', '💎', '🔥'],
    vignetteColor: 'rgba(40, 6, 2, 0.85)',
  },
  sunken_temple: {
    ...STONE_AQUA,
    accentColor: '#5edcff',
    fogColor: 'rgba(80, 200, 240, 0.13)',
    ambientKind: 'bubbles',
    bgEmoji: ['🏛️', '🐚', '🐠', '🪨'],
    vignetteColor: 'rgba(4, 18, 22, 0.85)',
  },
  dragons_lair: {
    ...STONE_GOLD,
    accentColor: '#f2b84b',
    fogColor: 'rgba(255, 180, 70, 0.12)',
    ambientKind: 'sparks',
    bgEmoji: ['💰', '💎', '🐉', '🪙'],
    vignetteColor: 'rgba(34, 18, 4, 0.85)',
  },
  abyss_gate: {
    ...STONE_VOID,
    accentColor: '#c58bff',
    fogColor: 'rgba(180, 100, 255, 0.15)',
    ambientKind: 'stars',
    bgEmoji: ['🌌', '👁️', '🌀', '⭐'],
    vignetteColor: 'rgba(2, 2, 12, 0.92)',
  },
};

export function themeFor(defId: string | undefined): DungeonTheme {
  return (defId && DUNGEON_THEMES[defId]) || DUNGEON_THEMES.sewer_warrens;
}
