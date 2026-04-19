import React from 'react';
import { GameState } from '../types';
import { DUNGEON_DEFS, DUNGEON_ORDER } from '../data/dungeons';
import { MONSTERS } from '../data/monsters';
import { themeFor } from '../visuals/dungeonTheme';
import { BattleView } from './BattleView';

interface Props {
  state: GameState;
  enterDungeon: (id: string) => void;
  clickMonster?: (id: string) => void;
  autoEquipBest?: () => void;
  quickHealParty?: () => void;
  reviveHero?: (heroId: string) => void;
  sellJunk?: () => void;
  useScroll?: (itemId: string) => void;
  spendAllAP?: () => void;
  autoEnchantCheapest?: () => void;
  quickHealHero?: (heroId: string) => void;
}

export const DungeonView: React.FC<Props> = ({
  state, enterDungeon, clickMonster, autoEquipBest, quickHealParty, reviveHero, sellJunk, useScroll,
  spendAllAP, autoEnchantCheapest, quickHealHero,
}) => {
  if (!state.activeDungeon) {
    return <DungeonPicker state={state} enterDungeon={enterDungeon} />;
  }
  return <BattleView state={state}
                     clickMonster={clickMonster}
                     autoEquipBest={autoEquipBest}
                     quickHealParty={quickHealParty}
                     reviveHero={reviveHero}
                     sellJunk={sellJunk}
                     useScroll={useScroll}
                     spendAllAP={spendAllAP}
                     autoEnchantCheapest={autoEnchantCheapest}
                     quickHealHero={quickHealHero} />;
};

const DungeonPicker: React.FC<Props> = ({ state, enterDungeon }) => {
  const active = state.heroes.filter(h => !h.bench && h.state === 'alive');
  const avgLevel = active.length > 0 ? Math.round(active.reduce((a, h) => a + h.level, 0) / active.length) : 1;
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-br from-[#1a140f] to-[#0D0B09]">
      <div className="p-6 border-b border-[#3D3328] bg-gradient-to-r from-[#2B231B] via-[#1E1A16] to-[#2B231B]">
        <h2 className="text-3xl font-bold text-[#F2E6A8] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
          ⚔ Dungeon Board
        </h2>
        <p className="text-sm text-[#B8A890]">
          Choose where the party goes next. Your heroes fight autonomously — you make the calls that matter.
        </p>
        <div className="mt-2 text-[11px] text-[#D4A943] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Party avg level: <span className="font-bold">{avgLevel}</span> • Active: {active.length}
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DUNGEON_ORDER.map(id => {
          const def = DUNGEON_DEFS[id];
          const unlocked = state.unlockedDungeons.includes(id);
          const floor = (state.dungeonsCompleted[id] ?? 0) + 1;
          const theme = themeFor(id);
          const cleared = (state.dungeonsCompleted[id] ?? 0);
          const danger = def.minLevel > avgLevel + 2 ? 'hard' : def.minLevel > avgLevel - 3 ? 'balanced' : 'easy';
          return (
            <button
              key={id}
              onClick={() => unlocked && enterDungeon(id)}
              disabled={!unlocked}
              className={`group relative text-left rounded-xl overflow-hidden border transition-all min-h-[220px]
                ${unlocked
                  ? 'border-[#3D3328] hover:border-[#D4A943] hover:scale-[1.02] hover:shadow-2xl cursor-pointer'
                  : 'border-[#1E1A16] opacity-40 cursor-not-allowed grayscale'}`}
              style={{ background: `linear-gradient(180deg, ${theme.wallDark} 0%, ${theme.floorDark} 60%, ${theme.floorMid} 100%)` }}
            >
              {/* Decorative bg layer */}
              <div className="absolute inset-0 pointer-events-none">
                {theme.bgEmoji.map((e, i) => (
                  <span key={i} className="absolute text-4xl"
                        style={{
                          left: `${15 + (i * 23) % 70}%`,
                          top: `${20 + (i * 17) % 50}%`,
                          opacity: 0.2,
                          filter: 'blur(0.3px)',
                        }}>{e}</span>
                ))}
              </div>
              {/* Vignette */}
              <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 120px ${theme.vignetteColor}` }} />

              {/* Content */}
              <div className="relative p-4 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-5xl drop-shadow-lg">{def.icon}</div>
                  <div className="flex-1">
                    <div className="text-xl font-bold" style={{ color: theme.accentColor, fontFamily: "'Cinzel', serif", textShadow: '0 1px 4px #000' }}>
                      {def.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[#F2E6A8]/80 font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      MIN LVL {def.minLevel} • FLOOR {floor}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#E8E0D4]/90 leading-relaxed flex-1" style={{ textShadow: '0 1px 2px #000' }}>
                  {def.description}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    danger === 'hard' ? 'bg-[#e8404060] text-[#ff9090] border border-[#ff4040]' :
                    danger === 'balanced' ? 'bg-[#e8b84060] text-[#ffe090] border border-[#e8b840]' :
                    'bg-[#7FE2A060] text-[#c0ffc0] border border-[#7FE2A0]'
                  }`}>
                    {danger.toUpperCase()}
                  </span>
                  {cleared > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-black/50 border border-[#D4A943] text-[#D4A943]">
                      ✓ {cleared} cleared
                    </span>
                  )}
                  <div className="ml-auto flex -space-x-1">
                    {def.monsterPool.slice(0, 3).map(mid => (
                      <span key={mid} className="text-lg drop-shadow" title={MONSTERS[mid]?.name}>{MONSTERS[mid]?.icon}</span>
                    ))}
                    <span className="text-lg drop-shadow" title="Boss">👑</span>
                  </div>
                </div>
                {unlocked && (
                  <div className="mt-3 text-center text-xs font-bold rounded-lg py-2 group-hover:py-3 transition-all"
                       style={{
                         background: `linear-gradient(90deg, ${theme.accentColor}30, ${theme.accentColor}60, ${theme.accentColor}30)`,
                         border: `1px solid ${theme.accentColor}`,
                         color: theme.accentColor,
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 3s infinite linear',
                         textShadow: '0 1px 2px #000',
                         fontFamily: "'JetBrains Mono', monospace",
                         letterSpacing: '0.2em',
                       }}>
                    ENTER →
                  </div>
                )}
                {!unlocked && (
                  <div className="mt-3 text-center text-xs font-bold text-[#E86E6E] bg-black/60 rounded-lg py-2 border border-[#E86E6E]/40"
                       style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.2em' }}>
                    🔒 LOCKED
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
