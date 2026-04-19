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
  const unlocked = DUNGEON_ORDER.filter(id => state.unlockedDungeons.includes(id));
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-br from-[#1a140f] to-[#0D0B09]">
      <div className="px-6 py-4 border-b border-[#3D3328] bg-gradient-to-r from-[#2B231B] via-[#1E1A16] to-[#2B231B] flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#F2E6A8] leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
            ⚔ Dungeon Board
          </h2>
          <p className="text-xs text-[#B8A890] mt-1">
            Choose where the party goes next. Your heroes fight autonomously — you make the calls that matter.
          </p>
        </div>
        <div className="flex gap-2 text-right">
          <Pill label="Avg Level" value={String(avgLevel)} color="#D4A943" />
          <Pill label="Active" value={`${active.length}/4`} color="#7FE2A0" />
          <Pill label="Unlocked" value={`${unlocked.length}/${DUNGEON_ORDER.length}`} color="#6EA9E4" />
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {DUNGEON_ORDER.map(id => {
          const def = DUNGEON_DEFS[id];
          const unlocked = state.unlockedDungeons.includes(id);
          const floor = (state.dungeonsCompleted[id] ?? 0) + 1;
          const theme = themeFor(id);
          const cleared = (state.dungeonsCompleted[id] ?? 0);
          const danger = def.minLevel > avgLevel + 2 ? 'hard' : def.minLevel > avgLevel - 3 ? 'balanced' : 'easy';
          const dangerChip = {
            hard:     { fg: '#ff9090', bg: '#4a1818', border: '#ff4040' },
            balanced: { fg: '#ffe090', bg: '#403008', border: '#e8b840' },
            easy:     { fg: '#c0ffc0', bg: '#183a20', border: '#7FE2A0' },
          }[danger];
          return (
            <button
              key={id}
              onClick={() => unlocked && enterDungeon(id)}
              disabled={!unlocked}
              className={`group relative text-left rounded-lg overflow-hidden border-2 transition-all
                ${unlocked
                  ? 'border-[#3D3328] hover:border-[color:var(--accent)] hover:scale-[1.015] hover:shadow-[0_8px_28px_rgba(0,0,0,0.6)] cursor-pointer'
                  : 'border-[#1E1A16] opacity-40 cursor-not-allowed grayscale'}`}
              style={{
                ['--accent' as any]: theme.accentColor,
                background: `linear-gradient(180deg, ${theme.wallDark} 0%, ${theme.floorDark} 55%, ${theme.floorMid} 100%)`,
              }}
            >
              {/* Decorative bg layer */}
              <div className="absolute inset-0 pointer-events-none">
                {theme.bgEmoji.map((e, i) => (
                  <span key={i} className="absolute text-4xl"
                        style={{
                          left: `${15 + (i * 23) % 70}%`,
                          top: `${20 + (i * 17) % 50}%`,
                          opacity: 0.16,
                          filter: 'blur(0.5px)',
                        }}>{e}</span>
                ))}
              </div>
              {/* Vignette */}
              <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 100px ${theme.vignetteColor}` }} />

              {/* Content */}
              <div className="relative p-3 h-full flex flex-col">
                <div className="flex items-start gap-3 mb-1.5">
                  <div className="text-4xl drop-shadow-lg leading-none">{def.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold leading-tight truncate"
                         style={{ color: theme.accentColor, fontFamily: "'Cinzel', serif", textShadow: '0 1px 4px #000' }}>
                      {def.name}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-[#F2E6A8]/75 font-bold leading-none mt-0.5"
                         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Min Lvl {def.minLevel} • Floor {floor}
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold shrink-0"
                        style={{
                          background: dangerChip.bg,
                          color: dangerChip.fg,
                          border: `1px solid ${dangerChip.border}`,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                    {danger}
                  </span>
                </div>
                <p className="text-[11px] text-[#E8E0D4]/90 leading-snug flex-1 line-clamp-3"
                   style={{ textShadow: '0 1px 2px #000' }}>
                  {def.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {cleared > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-black/70 border border-[#D4A943] text-[#D4A943] font-bold">
                      ✓ {cleared}
                    </span>
                  )}
                  <div className="ml-auto flex gap-0.5 items-center">
                    {def.monsterPool.slice(0, 3).map(mid => (
                      <span key={mid} className="text-lg drop-shadow" title={MONSTERS[mid]?.name}>{MONSTERS[mid]?.icon}</span>
                    ))}
                    <span className="text-lg ml-1" title="Boss"
                          style={{ filter: 'drop-shadow(0 0 3px #ff4040)' }}>👑</span>
                  </div>
                </div>
                {unlocked ? (
                  <div className="mt-2 text-center text-[11px] font-black rounded py-1.5 transition-all"
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
                ) : (
                  <div className="mt-2 text-center text-[11px] font-black text-[#E86E6E] bg-black/60 rounded py-1.5 border border-[#E86E6E]/40"
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

const Pill: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="px-2.5 py-1 rounded border leading-none"
       style={{ background: 'rgba(0,0,0,0.45)', borderColor: color + '60' }}>
    <div className="text-[8px] uppercase tracking-widest" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
    <div className="text-base font-black tabular-nums" style={{ color }}>{value}</div>
  </div>
);
