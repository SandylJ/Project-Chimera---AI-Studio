import React from 'react';

/* Pixel-art monster sprites. Inline SVG, consistent 32x44 viewBox.
   Most monsters face LEFT (toward heroes). For the ones that naturally
   face forward (slime, etc.), we don't mirror. */

const common = {
  xmlns: 'http://www.w3.org/2000/svg',
  shapeRendering: 'crispEdges' as const,
  viewBox: '0 0 32 44',
};

interface SpriteProps { size?: number; }

function Shadow() {
  return <ellipse cx="16" cy="43" rx="9" ry="1.5" fill="#181218" opacity="0.55" />;
}

// ---- Sewer Rat (brown rodent) ----
export const SewerRatSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Body */}
    <rect x="8" y="28" width="16" height="10" fill="#6a4028" />
    <rect x="8" y="28" width="16" height="2"  fill="#8a5838" />
    {/* Head */}
    <rect x="3" y="24" width="9"  height="9"  fill="#6a4028" />
    <rect x="3" y="24" width="9"  height="1"  fill="#8a5838" />
    {/* Ears */}
    <rect x="4" y="21" width="2"  height="3"  fill="#a05a50" />
    <rect x="9" y="21" width="2"  height="3"  fill="#a05a50" />
    {/* Snout */}
    <rect x="1" y="28" width="3"  height="3"  fill="#4a2818" />
    <rect x="0" y="29" width="1"  height="1"  fill="#ff90a0" />
    {/* Eyes */}
    <rect x="6" y="26" width="1"  height="1"  fill="#ff3030" />
    {/* Legs */}
    <rect x="10" y="38" width="2"  height="3"  fill="#4a2818" />
    <rect x="14" y="38" width="2"  height="3"  fill="#4a2818" />
    <rect x="18" y="38" width="2"  height="3"  fill="#4a2818" />
    <rect x="22" y="38" width="2"  height="3"  fill="#4a2818" />
    {/* Tail (curvy) */}
    <rect x="24" y="30" width="6"  height="1.5" fill="#a05a50" />
    <rect x="29" y="30" width="2"  height="4"  fill="#a05a50" />
    <rect x="28" y="34" width="3"  height="1.5" fill="#a05a50" />
  </svg>
);

// ---- Green Slime ----
export const GreenSlimeSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Slime body */}
    <ellipse cx="16" cy="34" rx="14" ry="10" fill="#4aa03a" />
    <ellipse cx="16" cy="34" rx="14" ry="10" fill="#5ac050" opacity="0.5" />
    {/* Highlight */}
    <ellipse cx="10" cy="28" rx="4" ry="3" fill="#c0f0a0" opacity="0.7" />
    {/* Eyes */}
    <circle cx="12" cy="31" r="1.5" fill="#fff" />
    <circle cx="20" cy="31" r="1.5" fill="#fff" />
    <circle cx="12" cy="31" r="0.7" fill="#000" />
    <circle cx="20" cy="31" r="0.7" fill="#000" />
    {/* Mouth */}
    <rect x="14" y="36" width="4" height="1" fill="#182e10" />
    {/* Drips */}
    <rect x="6" y="40" width="2" height="3" fill="#4aa03a" />
    <rect x="24" y="41" width="2" height="2" fill="#4aa03a" />
  </svg>
);

// ---- Giant Spider ----
export const GiantSpiderSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Legs (8, dark) */}
    <line x1="16" y1="32" x2="2"  y2="24" stroke="#1a1018" strokeWidth="1.5" />
    <line x1="16" y1="32" x2="2"  y2="34" stroke="#1a1018" strokeWidth="1.5" />
    <line x1="16" y1="32" x2="6"  y2="41" stroke="#1a1018" strokeWidth="1.5" />
    <line x1="16" y1="32" x2="12" y2="42" stroke="#1a1018" strokeWidth="1.5" />
    <line x1="16" y1="32" x2="30" y2="24" stroke="#1a1018" strokeWidth="1.5" />
    <line x1="16" y1="32" x2="30" y2="34" stroke="#1a1018" strokeWidth="1.5" />
    <line x1="16" y1="32" x2="26" y2="41" stroke="#1a1018" strokeWidth="1.5" />
    <line x1="16" y1="32" x2="20" y2="42" stroke="#1a1018" strokeWidth="1.5" />
    {/* Body (bulbous) */}
    <ellipse cx="16" cy="33" rx="7" ry="6" fill="#2a0828" />
    {/* Abdomen markings */}
    <rect x="14" y="29" width="4" height="2" fill="#aa2040" />
    {/* Head */}
    <ellipse cx="16" cy="26" rx="4.5" ry="3.5" fill="#1a0418" />
    {/* Eyes */}
    <circle cx="14" cy="25.5" r="0.9" fill="#ff2040" />
    <circle cx="18" cy="25.5" r="0.9" fill="#ff2040" />
    <circle cx="15" cy="27" r="0.5" fill="#ff2040" />
    <circle cx="17" cy="27" r="0.5" fill="#ff2040" />
  </svg>
);

// ---- Goblin Scout ----
export const GoblinScoutSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Legs */}
    <rect x="11" y="30" width="3" height="10" fill="#4a2e10" />
    <rect x="18" y="30" width="3" height="10" fill="#4a2e10" />
    <rect x="10" y="38" width="4" height="3" fill="#2a1810" />
    <rect x="18" y="38" width="4" height="3" fill="#2a1810" />
    {/* Body (leather) */}
    <rect x="9"  y="18" width="14" height="12" fill="#6a4818" />
    <rect x="9"  y="18" width="14" height="1"  fill="#8a6828" />
    <rect x="9"  y="24" width="14" height="1"  fill="#2a1800" />
    {/* Green skin arms */}
    <rect x="5"  y="20" width="4" height="8"  fill="#5a8038" />
    <rect x="23" y="20" width="4" height="8"  fill="#5a8038" />
    {/* Head */}
    <rect x="11" y="8"  width="10" height="10" fill="#5a8038" />
    <rect x="11" y="8"  width="10" height="1"  fill="#7aa048" />
    {/* Ears (pointy) */}
    <polygon points="9,12 11,10 11,14" fill="#5a8038" />
    <polygon points="23,12 21,10 21,14" fill="#5a8038" />
    {/* Eyes */}
    <rect x="13" y="12" width="2" height="1.5" fill="#f0e040" />
    <rect x="17" y="12" width="2" height="1.5" fill="#f0e040" />
    {/* Teeth (mouth) */}
    <rect x="13" y="16" width="1" height="1" fill="#fff" />
    <rect x="18" y="16" width="1" height="1" fill="#fff" />
    {/* Crude dagger */}
    <rect x="27" y="14" width="1.5" height="9" fill="#c0c0c0" />
    <rect x="26" y="23" width="3"   height="1" fill="#4a2808" />
  </svg>
);

// ---- Goblin Raider (bigger, with warhammer) ----
export const GoblinRaiderSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Legs */}
    <rect x="10" y="28" width="4" height="12" fill="#3a2008" />
    <rect x="18" y="28" width="4" height="12" fill="#3a2008" />
    <rect x="9"  y="38" width="6" height="3"  fill="#2a1800" />
    <rect x="17" y="38" width="6" height="3"  fill="#2a1800" />
    {/* Armor chest */}
    <rect x="7"  y="15" width="18" height="15" fill="#5a5a5a" />
    <rect x="7"  y="15" width="18" height="2"  fill="#7a7a7a" />
    <rect x="15" y="15" width="2"  height="15" fill="#3a3a3a" />
    {/* Arms (green) */}
    <rect x="3"  y="17" width="5" height="10" fill="#5a8038" />
    <rect x="24" y="17" width="5" height="10" fill="#5a8038" />
    {/* Head */}
    <rect x="10" y="4"  width="12" height="12" fill="#5a8038" />
    <rect x="10" y="4"  width="12" height="1"  fill="#7aa048" />
    {/* Helmet */}
    <rect x="10" y="4"  width="12" height="4"  fill="#444444" />
    <rect x="15" y="2"  width="2"  height="3"  fill="#444444" />
    {/* Ears */}
    <polygon points="8,10 10,8 10,13" fill="#5a8038" />
    <polygon points="24,10 22,8 22,13" fill="#5a8038" />
    {/* Eyes */}
    <rect x="12" y="10" width="2" height="2" fill="#ff4040" />
    <rect x="18" y="10" width="2" height="2" fill="#ff4040" />
    {/* Tusks */}
    <rect x="13" y="14" width="1" height="2" fill="#fff" />
    <rect x="18" y="14" width="1" height="2" fill="#fff" />
    {/* Warhammer */}
    <rect x="28" y="10" width="1.5" height="18" fill="#4a2810" />
    <rect x="26" y="6"  width="5"   height="6"  fill="#606060" />
    <rect x="26" y="6"  width="5"   height="1"  fill="#808080" />
  </svg>
);

// ---- Goblin Shaman (caster) ----
export const GoblinShamanSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Robe */}
    <rect x="6"  y="18" width="20" height="18" fill="#5a1848" />
    <rect x="4"  y="34" width="24" height="5"  fill="#5a1848" />
    <rect x="4"  y="38" width="24" height="1"  fill="#c030a0" />
    {/* Arms green */}
    <rect x="2"  y="20" width="5"  height="8"  fill="#5a8038" />
    <rect x="25" y="20" width="5"  height="8"  fill="#5a8038" />
    {/* Head */}
    <rect x="10" y="6"  width="12" height="12" fill="#5a8038" />
    {/* Feathered hood */}
    <polygon points="10,6 10,2 13,2 14,6" fill="#c03030" />
    <polygon points="18,6 19,2 22,2 22,6" fill="#4060c0" />
    {/* Eyes glowing */}
    <rect x="12" y="12" width="2" height="2" fill="#40f0ff" />
    <rect x="18" y="12" width="2" height="2" fill="#40f0ff" />
    {/* Staff with skull */}
    <rect x="28" y="8" width="1.5" height="22" fill="#3a2008" />
    <circle cx="28.8" cy="6.5" r="2.5" fill="#f0e8c8" />
    <rect x="28" y="5" width="2" height="1" fill="#000" />
    <rect x="28" y="7" width="1" height="1" fill="#000" />
  </svg>
);

// ---- Skeleton ----
export const SkeletonSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Legs */}
    <rect x="11" y="28" width="3" height="12" fill="#e0dcc0" />
    <rect x="18" y="28" width="3" height="12" fill="#e0dcc0" />
    <rect x="10" y="38" width="5" height="3"  fill="#bfb89c" />
    <rect x="17" y="38" width="5" height="3"  fill="#bfb89c" />
    {/* Ribcage */}
    <rect x="9"  y="16" width="14" height="13" fill="#e0dcc0" />
    <rect x="11" y="18" width="10" height="1"  fill="#5a5438" />
    <rect x="11" y="21" width="10" height="1"  fill="#5a5438" />
    <rect x="11" y="24" width="10" height="1"  fill="#5a5438" />
    <rect x="15" y="16" width="2"  height="13" fill="#bfb89c" />
    {/* Arms */}
    <rect x="5"  y="17" width="4" height="10" fill="#e0dcc0" />
    <rect x="23" y="17" width="4" height="10" fill="#e0dcc0" />
    {/* Skull */}
    <rect x="11" y="4"  width="10" height="10" fill="#f0ecd0" />
    {/* Eye sockets */}
    <rect x="13" y="8"  width="2"  height="3"  fill="#000" />
    <rect x="17" y="8"  width="2"  height="3"  fill="#ff8020" />
    {/* Nose */}
    <rect x="15" y="11" width="2"  height="2"  fill="#000" />
    {/* Teeth */}
    <rect x="13" y="13" width="6"  height="1"  fill="#bfb89c" />
    <rect x="14" y="13" width="1"  height="1"  fill="#000" />
    <rect x="16" y="13" width="1"  height="1"  fill="#000" />
    <rect x="18" y="13" width="1"  height="1"  fill="#000" />
    {/* Sword */}
    <rect x="27" y="10" width="2"  height="16" fill="#c0c0d0" />
    <rect x="26" y="25" width="4"  height="1.5" fill="#8a6418" />
  </svg>
);

// ---- Zombie ----
export const ZombieSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Legs */}
    <rect x="10" y="28" width="4" height="12" fill="#3a281a" />
    <rect x="18" y="28" width="4" height="12" fill="#3a281a" />
    <rect x="9"  y="38" width="6" height="3"  fill="#2a1800" />
    <rect x="17" y="38" width="6" height="3"  fill="#2a1800" />
    {/* Tattered shirt */}
    <rect x="8"  y="16" width="16" height="13" fill="#5a3830" />
    <rect x="8"  y="26" width="3"  height="3"  fill="#0d0b09" /> {/* hole */}
    <rect x="20" y="23" width="3"  height="2"  fill="#0d0b09" />
    {/* Arms (bluish skin, dangling forward) */}
    <rect x="4"  y="18" width="4" height="14" fill="#7a9080" />
    <rect x="24" y="18" width="4" height="14" fill="#7a9080" />
    <rect x="3"  y="30" width="6" height="3"  fill="#7a9080" /> {/* hand */}
    <rect x="23" y="30" width="6" height="3"  fill="#7a9080" />
    {/* Head */}
    <rect x="11" y="4"  width="10" height="12" fill="#7a9080" />
    <rect x="11" y="4"  width="10" height="1"  fill="#9ab0a0" />
    {/* Eyes (dead) */}
    <rect x="13" y="9"  width="2"  height="2"  fill="#ff3030" />
    <rect x="17" y="9"  width="2"  height="2"  fill="#ff3030" />
    {/* Mouth with dripping blood */}
    <rect x="13" y="14" width="6"  height="1"  fill="#000" />
    <rect x="14" y="15" width="1"  height="2"  fill="#801818" />
    <rect x="17" y="15" width="1"  height="2"  fill="#801818" />
  </svg>
);

// ---- Wraith (ghostly) ----
export const WraithSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Wispy bottom */}
    <polygon points="4,40 16,28 28,40 26,42 22,36 18,42 14,36 10,42 6,36"
             fill="#504878" opacity="0.85" />
    {/* Robe body (semi-transparent) */}
    <rect x="6" y="12" width="20" height="24" fill="#504878" opacity="0.9" />
    <rect x="4" y="14" width="24" height="20" fill="#6a5a98" opacity="0.4" />
    {/* Hood */}
    <polygon points="8,14 16,4 24,14" fill="#3a3058" />
    <rect x="7" y="13" width="18" height="4" fill="#3a3058" />
    {/* Glowing eyes */}
    <rect x="12" y="9"  width="3" height="2" fill="#e0f0ff" />
    <rect x="17" y="9"  width="3" height="2" fill="#e0f0ff" />
    {/* Particle wisps */}
    <circle cx="3"  cy="20" r="1" fill="#a0b0ff" opacity="0.5" />
    <circle cx="29" cy="22" r="1" fill="#a0b0ff" opacity="0.5" />
    <circle cx="5"  cy="28" r="0.8" fill="#a0b0ff" opacity="0.6" />
    <circle cx="27" cy="32" r="0.8" fill="#a0b0ff" opacity="0.6" />
  </svg>
);

// ---- Frost Wolf ----
export const FrostWolfSprite: React.FC<SpriteProps> = ({ size = 56 }) => (
  <svg {...common} width={size} height={size * 44 / 32}>
    <Shadow />
    {/* Body (horizontal) */}
    <rect x="6" y="24" width="20" height="12" fill="#6a8cb0" />
    <rect x="6" y="24" width="20" height="2"  fill="#a0c0e0" />
    {/* Legs */}
    <rect x="8"  y="36" width="3" height="6" fill="#4a6088" />
    <rect x="13" y="36" width="3" height="6" fill="#4a6088" />
    <rect x="17" y="36" width="3" height="6" fill="#4a6088" />
    <rect x="22" y="36" width="3" height="6" fill="#4a6088" />
    {/* Head */}
    <rect x="0" y="22" width="8" height="10" fill="#6a8cb0" />
    <rect x="0" y="22" width="8" height="1"  fill="#a0c0e0" />
    {/* Snout */}
    <rect x="-1" y="28" width="4" height="4" fill="#4a6088" />
    {/* Teeth */}
    <rect x="0" y="30" width="1" height="2" fill="#fff" />
    <rect x="2" y="30" width="1" height="2" fill="#fff" />
    {/* Eye glowing */}
    <rect x="5" y="25" width="2" height="1.5" fill="#e0f8ff" />
    {/* Ears */}
    <polygon points="1,22 3,18 5,22" fill="#4a6088" />
    <polygon points="6,22 4,18 2,22" fill="#6a8cb0" />
    {/* Tail */}
    <rect x="26" y="24" width="6" height="3" fill="#6a8cb0" />
    <rect x="30" y="22" width="2" height="5" fill="#a0c0e0" />
    {/* Frost particles */}
    <circle cx="10" cy="20" r="0.8" fill="#fff" />
    <circle cx="22" cy="18" r="0.6" fill="#fff" />
  </svg>
);

// ---- Generic monster fallback (dark shadow + glowing eyes + emoji hint) ----
export const GenericMonsterSprite: React.FC<SpriteProps & { icon?: string; tier?: number }> = ({ size = 56, icon = '👾', tier = 1 }) => {
  const colors = ['#5a2020', '#6a2020', '#802020', '#a02020', '#c02020'];
  const col = colors[Math.min(colors.length - 1, Math.max(0, tier - 1))];
  return (
    <svg {...common} width={size} height={size * 44 / 32}>
      <Shadow />
      {/* Hulking silhouette */}
      <path d={`M 4 28 Q 4 14 16 10 Q 28 14 28 28 L 28 38 L 4 38 Z`} fill={col} />
      <path d={`M 4 28 Q 4 14 16 10 Q 28 14 28 28 L 28 38 L 4 38 Z`} fill="#00000040" />
      {/* Glowing eyes */}
      <circle cx="12" cy="18" r="2" fill="#ff4040" />
      <circle cx="20" cy="18" r="2" fill="#ff4040" />
      <circle cx="12" cy="18" r="0.9" fill="#fff" />
      <circle cx="20" cy="18" r="0.9" fill="#fff" />
      {/* Emoji overlay for recognition */}
      <text x="16" y="32" fontSize="10" textAnchor="middle" fill="#fff" opacity="0.85">
        {icon}
      </text>
    </svg>
  );
};

// ============ Dispatcher ============

export const MonsterSpriteArt: React.FC<{
  monsterId: string; icon: string; size?: number; level?: number;
}> = ({ monsterId, icon, size, level }) => {
  const tier = level ? Math.ceil(level / 15) : 1;
  switch (monsterId) {
    case 'sewer_rat':      return <SewerRatSprite size={size} />;
    case 'green_slime':    return <GreenSlimeSprite size={size} />;
    case 'giant_spider':
    case 'web_weaver':
    case 'venom_crawler':  return <GiantSpiderSprite size={size} />;
    case 'goblin_scout':   return <GoblinScoutSprite size={size} />;
    case 'goblin_raider':  return <GoblinRaiderSprite size={size} />;
    case 'goblin_shaman':  return <GoblinShamanSprite size={size} />;
    case 'skeleton':       return <SkeletonSprite size={size} />;
    case 'zombie':         return <ZombieSprite size={size} />;
    case 'wraith':         return <WraithSprite size={size} />;
    case 'frost_wolf':     return <FrostWolfSprite size={size} />;
    default:
      return <GenericMonsterSprite size={size} icon={icon} tier={tier} />;
  }
};
