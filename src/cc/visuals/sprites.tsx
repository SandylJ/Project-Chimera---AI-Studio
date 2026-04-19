import React from 'react';
import type { ClassId } from '../types';

/* Pixel-art hero sprites as inline SVG.
   viewBox is 32x44 across all classes for a consistent proportion.
   shapeRendering="crispEdges" keeps the blocky pixel feel.
   The sprite faces right (toward the enemies on the enemy side). */

interface SpriteProps { size?: number; }

const PALETTE = {
  skin:      '#f0c89c',
  skinDark:  '#a07050',
  shadow:    '#2a1810',
  boot:      '#3a2416',
  steel:     '#b0b8c2',
  steelDark: '#606878',
  gold:      '#e8b84b',
  goldDark:  '#8a6418',
  white:     '#f6f0e0',
  black:     '#181218',
  blood:     '#c03030',
};

const common = {
  xmlns: 'http://www.w3.org/2000/svg',
  shapeRendering: 'crispEdges' as const,
  viewBox: '0 0 32 44',
};

// Helpers for face + boot blocks (shared silhouette)
function Feet({ color = PALETTE.boot }: { color?: string }) {
  return (
    <>
      <rect x="10" y="40" width="5" height="3" fill={color} />
      <rect x="17" y="40" width="5" height="3" fill={color} />
    </>
  );
}
function Shadow() {
  return <ellipse cx="16" cy="43" rx="8" ry="1.4" fill={PALETTE.shadow} opacity="0.55" />;
}

// =====================================================================
export const KnightSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Plume */}
    <rect x="13" y="2" width="6" height="3" fill={PALETTE.blood} />
    {/* Helmet */}
    <rect x="11" y="5"  width="10" height="8"  fill={PALETTE.steel} />
    <rect x="11" y="6"  width="10" height="1"  fill={PALETTE.white} />
    <rect x="11" y="9"  width="10" height="1.5" fill={PALETTE.black} />
    {/* Gorget */}
    <rect x="12" y="13" width="8"  height="2"  fill={PALETTE.steelDark} />
    {/* Tabard body (blue + gold cross) */}
    <rect x="9"  y="15" width="14" height="15" fill="#3f6ec9" />
    <rect x="15" y="15" width="2"  height="15" fill={PALETTE.gold} />
    <rect x="9"  y="22" width="14" height="2"  fill={PALETTE.gold} />
    {/* Arms */}
    <rect x="6"  y="17" width="4"  height="7"  fill={PALETTE.steel} />
    <rect x="22" y="17" width="4"  height="7"  fill={PALETTE.steel} />
    {/* Legs */}
    <rect x="11" y="30" width="4"  height="10" fill={PALETTE.steelDark} />
    <rect x="17" y="30" width="4"  height="10" fill={PALETTE.steelDark} />
    {/* Shield (viewer's left) */}
    <rect x="2"  y="18" width="5"  height="10" fill="#8a5220" />
    <rect x="3"  y="20" width="3"  height="2"  fill={PALETTE.gold} />
    <rect x="3"  y="23" width="3"  height="3"  fill={PALETTE.gold} />
    {/* Sword (viewer's right) */}
    <rect x="26" y="10" width="2"  height="18" fill={PALETTE.white} />
    <rect x="25" y="11" width="4"  height="1"  fill={PALETTE.steelDark} />
    <rect x="24" y="27" width="6"  height="2"  fill={PALETTE.gold} />
    <rect x="26" y="29" width="2"  height="3"  fill="#604018" />
    <Feet />
  </svg>
);

// =====================================================================
export const PriestSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Hood (white with gold trim) */}
    <rect x="10" y="4" width="12" height="10" fill={PALETTE.white} />
    <rect x="10" y="4" width="12" height="1"  fill={PALETTE.gold} />
    <rect x="10" y="13" width="12" height="1" fill={PALETTE.gold} />
    {/* Face in hood */}
    <rect x="12" y="7"  width="8"  height="5"  fill={PALETTE.skin} />
    <rect x="14" y="9"  width="1"  height="1"  fill={PALETTE.black} />
    <rect x="17" y="9"  width="1"  height="1"  fill={PALETTE.black} />
    {/* Body robe */}
    <rect x="9"  y="14" width="14" height="16" fill={PALETTE.white} />
    <rect x="9"  y="14" width="14" height="1"  fill={PALETTE.gold} />
    {/* Holy sigil on chest */}
    <rect x="15" y="18" width="2"  height="6"  fill={PALETTE.gold} />
    <rect x="13" y="20" width="6"  height="2"  fill={PALETTE.gold} />
    {/* Robe flare bottom */}
    <rect x="7"  y="28" width="18" height="5"  fill={PALETTE.white} />
    <rect x="7"  y="32" width="18" height="1"  fill={PALETTE.gold} />
    {/* Sandals/feet */}
    <rect x="11" y="34" width="4" height="5" fill={PALETTE.skin} />
    <rect x="17" y="34" width="4" height="5" fill={PALETTE.skin} />
    <Feet color={PALETTE.boot} />
    {/* Staff (viewer's right) */}
    <rect x="25" y="8"  width="1.5" height="24" fill={PALETTE.goldDark} />
    {/* Orb on top of staff */}
    <circle cx="25.8" cy="7" r="3" fill={PALETTE.gold} />
    <circle cx="25.8" cy="7" r="1.8" fill={PALETTE.white} />
  </svg>
);

// =====================================================================
export const MageSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Pointy hat */}
    <polygon points="16,1 12,9 20,9" fill="#6b45a8" />
    <rect x="11" y="9"  width="10" height="2" fill="#7a55c0" />
    <rect x="11" y="10" width="10" height="1" fill={PALETTE.gold} />
    <circle cx="17" cy="4" r="0.9" fill={PALETTE.gold} />
    {/* Face under hat */}
    <rect x="12" y="11" width="8" height="5" fill={PALETTE.skin} />
    <rect x="14" y="13" width="1" height="1" fill={PALETTE.black} />
    <rect x="17" y="13" width="1" height="1" fill={PALETTE.black} />
    {/* Beard hint */}
    <rect x="13" y="15" width="6" height="1" fill={PALETTE.white} />
    {/* Robe */}
    <rect x="8"  y="16" width="16" height="14" fill="#6b45a8" />
    <rect x="8"  y="16" width="16" height="1"  fill={PALETTE.gold} />
    {/* Stars */}
    <rect x="12" y="21" width="1" height="1" fill={PALETTE.gold} />
    <rect x="19" y="24" width="1" height="1" fill={PALETTE.gold} />
    <rect x="15" y="26" width="1" height="1" fill={PALETTE.gold} />
    {/* Robe bottom */}
    <rect x="6"  y="28" width="20" height="7" fill="#7a55c0" />
    <rect x="6"  y="34" width="20" height="1" fill={PALETTE.gold} />
    <Feet />
    {/* Wand (viewer's right) */}
    <rect x="26" y="14" width="1.5" height="16" fill="#4a2808" />
    <circle cx="26.8" cy="12.5" r="2.6" fill="#b0e0ff" />
    <circle cx="26.8" cy="12.5" r="1" fill={PALETTE.white} />
  </svg>
);

// =====================================================================
export const RogueSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Hood */}
    <rect x="10" y="4"  width="12" height="9"  fill="#1a1a20" />
    <rect x="10" y="4"  width="12" height="1"  fill="#2a2830" />
    {/* Face in shadow */}
    <rect x="12" y="8"  width="8"  height="4"  fill={PALETTE.skin} />
    <rect x="12" y="8"  width="8"  height="1"  fill={PALETTE.shadow} />
    <rect x="14" y="10" width="1"  height="1"  fill="#4cf08a" />
    <rect x="17" y="10" width="1"  height="1"  fill="#4cf08a" />
    {/* Body (dark leather) */}
    <rect x="10" y="13" width="12" height="13" fill="#2a2a32" />
    <rect x="14" y="16" width="4"  height="1"  fill={PALETTE.gold} /> {/* belt buckle */}
    <rect x="10" y="21" width="12" height="1"  fill="#1a1a20" /> {/* belt */}
    {/* Cloak flare */}
    <polygon points="6,14 10,13 10,28 5,28" fill="#1a1a20" />
    <polygon points="26,14 22,13 22,28 27,28" fill="#1a1a20" />
    {/* Legs */}
    <rect x="11" y="26" width="4" height="13" fill="#2a2a32" />
    <rect x="17" y="26" width="4" height="13" fill="#2a2a32" />
    <Feet />
    {/* Left dagger */}
    <rect x="4"  y="18" width="1.5" height="7"  fill={PALETTE.white} />
    <rect x="3"  y="25" width="3"   height="1"  fill={PALETTE.goldDark} />
    {/* Right dagger */}
    <rect x="26.5" y="18" width="1.5" height="7" fill={PALETTE.white} />
    <rect x="26" y="25" width="3" height="1" fill={PALETTE.goldDark} />
  </svg>
);

// =====================================================================
export const RangerSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Hood green */}
    <rect x="10" y="4"  width="12" height="9"  fill="#4a7238" />
    <rect x="10" y="4"  width="12" height="1"  fill="#5a8648" />
    {/* Face */}
    <rect x="12" y="8"  width="8"  height="4"  fill={PALETTE.skin} />
    <rect x="14" y="10" width="1"  height="1"  fill={PALETTE.black} />
    <rect x="17" y="10" width="1"  height="1"  fill={PALETTE.black} />
    {/* Tunic green */}
    <rect x="10" y="13" width="12" height="13" fill="#5a8a44" />
    <rect x="10" y="13" width="12" height="1"  fill="#7aa45a" />
    {/* Belt */}
    <rect x="10" y="20" width="12" height="1.5" fill="#3a2a14" />
    {/* Quiver on back (peeking) */}
    <rect x="23" y="10" width="3"  height="10" fill="#5a3014" />
    <rect x="23" y="9"  width="3"  height="2"  fill="#3a2008" />
    {/* Arrow fletching */}
    <rect x="23.5" y="7" width="0.8" height="3" fill={PALETTE.blood} />
    <rect x="24.7" y="7" width="0.8" height="3" fill={PALETTE.white} />
    {/* Legs (brown pants) */}
    <rect x="11" y="26" width="4"  height="13" fill="#4a2810" />
    <rect x="17" y="26" width="4"  height="13" fill="#4a2810" />
    <Feet />
    {/* Bow (viewer's right side, held in hand) */}
    <path d="M 26 8 Q 31 20 26 32" stroke="#4a2810" strokeWidth="1.2" fill="none" />
    <line x1="27.5" y1="9" x2="27.5" y2="31" stroke={PALETTE.white} strokeWidth="0.5" />
  </svg>
);

// =====================================================================
export const BarbarianSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Horned helmet */}
    <rect x="11" y="5"  width="10" height="7" fill="#555558" />
    <rect x="11" y="5"  width="10" height="1" fill="#7a7a80" />
    {/* Horns */}
    <polygon points="10,5 7,2 11,6" fill="#e8d090" />
    <polygon points="22,5 25,2 21,6" fill="#e8d090" />
    {/* Face */}
    <rect x="12" y="12" width="8" height="4" fill={PALETTE.skin} />
    <rect x="14" y="13" width="1" height="1" fill={PALETTE.black} />
    <rect x="17" y="13" width="1" height="1" fill={PALETTE.black} />
    {/* Beard */}
    <rect x="13" y="15" width="6" height="2" fill="#8a3010" />
    {/* Bare chest (muscular torso) */}
    <rect x="10" y="16" width="12" height="10" fill={PALETTE.skin} />
    <rect x="10" y="16" width="12" height="1"  fill={PALETTE.skinDark} />
    <rect x="15" y="17" width="2"  height="9"  fill={PALETTE.skinDark} /> {/* ab shadow */}
    {/* Arms */}
    <rect x="6"  y="18" width="4"  height="8"  fill={PALETTE.skin} />
    <rect x="22" y="18" width="4"  height="8"  fill={PALETTE.skin} />
    {/* Loincloth */}
    <rect x="10" y="26" width="12" height="6"  fill="#5a2418" />
    <rect x="10" y="26" width="12" height="1"  fill="#8a3020" />
    {/* Legs */}
    <rect x="11" y="32" width="4"  height="8"  fill={PALETTE.skinDark} />
    <rect x="17" y="32" width="4"  height="8"  fill={PALETTE.skinDark} />
    <Feet />
    {/* Big axe (held high, blade up) */}
    <rect x="28" y="10" width="1.2" height="22" fill="#4a2810" />
    <polygon points="24,6 31,4 31,10 26,12" fill={PALETTE.steelDark} />
    <polygon points="24,6 30,4.5 29,11 26,11" fill={PALETTE.steel} />
  </svg>
);

// =====================================================================

export const ClassSprite: React.FC<{ classId: ClassId; size?: number }> = ({ classId, size }) => {
  switch (classId) {
    case 'knight':    return <KnightSprite size={size} />;
    case 'priest':    return <PriestSprite size={size} />;
    case 'mage':      return <MageSprite size={size} />;
    case 'rogue':     return <RogueSprite size={size} />;
    case 'ranger':    return <RangerSprite size={size} />;
    case 'barbarian': return <BarbarianSprite size={size} />;
  }
};
