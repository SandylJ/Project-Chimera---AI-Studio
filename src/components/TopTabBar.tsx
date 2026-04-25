import React from 'react';
import { GameState } from '../types';
import { CLASSES } from '../data/classes';
import { ClassSprite } from '../visuals/sprites';
import { xpToNext } from '../engine/util';

interface Props {
  tab: string;
  setTab: (t: string) => void;
  state: GameState;
  setSpeed: (s: 1 | 2 | 4) => void;
  togglePause: () => void;
  retreatToTown: () => void;
  focusHero: (heroId: string) => void;
}

const TABS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'dungeon', label: 'Dungeon', icon: '⚔' },
  { id: 'party',   label: 'Party',   icon: '👥' },
  { id: 'stash',   label: 'Stash',   icon: '📦' },
  { id: 'town',    label: 'Town',    icon: '🏰' },
  { id: 'skills',  label: 'Skills',  icon: '⛏️' },
  { id: 'log',     label: 'Log',     icon: '📜' },
];

// Drives the per-tab "pending action" highlight (Town has a claimable
// bounty, Party has free ability points or a downed hero, etc.).
function tabAlert(tabId: string, state: GameState): boolean {
  if (tabId === 'town') {
    const board = state.bountyBoard;
    if (!board) return false;
    return board.bounties.some(b => {
      const prog =
        b.kind === 'kill_count' ? Math.max(0, state.totalMonstersKilled - board.snapshot.totalMonstersKilled) :
        b.kind === 'earn_gold'  ? Math.max(0, state.totalGoldEarned - board.snapshot.totalGoldEarned) :
        b.kind === 'find_items' ? (board.itemsCollected ?? 0) :
        b.kind === 'best_combo' ? state.bestKillCombo :
        Object.values(board.dungeonClearCount ?? {}).reduce((a, v) => a + (v as number), 0);
      return !b.claimed && prog >= b.target;
    });
  }
  if (tabId === 'party') {
    return state.heroes.some(h => !h.bench && (h.abilityPoints > 0 || h.state !== 'alive'));
  }
  return false;
}

export const TopTabBar: React.FC<Props> = ({ tab, setTab, state, setSpeed, togglePause, retreatToTown, focusHero }) => {
  const dungeon = state.activeDungeon;
  return (
    <div className="shrink-0 bg-[#0A0806] border-b-2 border-[#3D3328] flex items-center gap-1.5 px-2 py-1.5"
         style={{ backgroundImage: 'linear-gradient(180deg, #1a1410 0%, #0a0806 100%)' }}>
      <div className="flex items-center gap-1">
        {/* "Game" tab — always returns to dungeon view (picker or battle). */}
        <button type="button" onClick={() => setTab('dungeon')}
                className={`press px-3 py-1.5 text-xs transition-colors font-bold ${
                  tab === 'dungeon' ? 'text-[#0a0806]' : 'text-[#B8A890] hover:bg-[#1E1A16] hover:text-[#E8E0D4]'
                }`}
                style={{
                  background: tab === 'dungeon' ? 'var(--cc-blue)' : '#14100C',
                  border: `1px solid ${tab === 'dungeon' ? 'var(--cc-blue)' : '#2B2B32'}`,
                  borderRadius: 2,
                }}>
          <span className="mr-1">⚔</span>Game
        </button>

        {/* Per-hero quick tabs — click jumps to Party view focused on that hero. */}
        {state.heroes.filter(h => !h.bench).map(h => {
          const cls = CLASSES[h.classId];
          const hpPct = Math.max(0, (h.hp / Math.max(1, h.maxHp)) * 100);
          const mpPct = h.maxMp > 0 ? Math.max(0, (h.mp / h.maxMp) * 100) : 0;
          const hpColor = hpPct > 66 ? '#55d86b' : hpPct > 33 ? '#e9cc3a' : '#e04040';
          const lowHp = hpPct < 30 && h.state === 'alive';
          const downed = h.state !== 'alive';
          return (
            <button key={h.id} type="button" onClick={() => focusHero(h.id)}
                    className="press relative flex items-center gap-1.5 px-1.5 py-0.5 transition-colors hover:bg-[#2B2B32]"
                    style={{
                      background: downed ? '#2a1010' : '#14100C',
                      border: `1px solid ${downed ? 'var(--cc-orange)' : cls.color + '55'}`,
                      borderRadius: 2,
                      fontFamily: "'Nunito', sans-serif",
                      boxShadow: lowHp ? '0 0 8px var(--cc-orange)' : undefined,
                      animation: lowHp ? 'glowPulse 1.4s ease-in-out infinite' : undefined,
                      ['--glow' as any]: 'var(--cc-orange)',
                    }}
                    title={`${h.name} — ${cls.name}\nHP ${Math.ceil(h.hp)}/${h.maxHp} · MP ${Math.ceil(h.mp)}/${h.maxMp}`}>
              <span className="shrink-0" style={{ width: 24, height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <ClassSprite classId={h.classId} size={24} />
              </span>
              <div className="flex flex-col min-w-0" style={{ width: 62 }}>
                <div className="flex items-baseline gap-1 leading-none">
                  <span className="font-black truncate"
                        style={{ color: cls.color, fontSize: '10px', textShadow: '0 1px 0 #000' }}>
                    {h.name.slice(0, 8)}
                  </span>
                  <span className="text-[9px] text-[#f2e08a] font-bold shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    L{h.level}
                  </span>
                </div>
                <div className="relative h-[4px] mt-0.5 bg-black rounded-sm overflow-hidden">
                  <div className="h-full" style={{ width: hpPct + '%', background: hpColor, transition: 'width 180ms' }} />
                </div>
                {h.maxMp > 0 && (
                  <div className="relative h-[2px] mt-[1px] bg-black rounded-sm overflow-hidden">
                    <div className="h-full" style={{ width: mpPct + '%', background: '#2060dc' }} />
                  </div>
                )}
                <div className="relative h-[2px] mt-[1px] bg-black rounded-sm overflow-hidden">
                  <div className="h-full"
                       style={{
                         width: Math.min(100, (h.xp / Math.max(1, xpToNext(h))) * 100) + '%',
                         background: 'linear-gradient(90deg, #9a8030 0%, #ffe080 100%)',
                       }} />
                </div>
              </div>
              {h.abilityPoints > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#D4A943] text-black text-[8px] font-black animate-pulse"
                      style={{ boxShadow: '0 0 4px #D4A943' }}>+</span>
              )}
              {downed && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black bg-black px-1 rounded text-[#E86E6E] border border-[#E86E6E]/70"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>DOWN</span>
              )}
            </button>
          );
        })}

        {TABS.slice(1).map(t => {
          const active = tab === t.id;
          const highlighted = tabAlert(t.id, state);
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
                    className={`press relative px-3 py-1.5 text-xs transition-colors font-bold ${
                      active
                        ? 'text-[#0a0806]'
                        : highlighted
                          ? 'text-[#0a0806] hover:brightness-110'
                          : 'text-[#B8A890] hover:bg-[#1E1A16] hover:text-[#E8E0D4]'
                    }`}
                    style={{
                      background: active || highlighted ? 'var(--cc-blue)' : '#14100C',
                      border: `1px solid ${active || highlighted ? 'var(--cc-blue)' : '#2B2B32'}`,
                      borderRadius: 2,
                      fontFamily: "'Nunito', sans-serif",
                      animation: highlighted && !active ? 'glowPulse 1.8s ease-in-out infinite' : undefined,
                      ['--glow' as any]: 'var(--cc-blue)',
                    }}>
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          );
        })}
      </div>

      {/* Center: dungeon badge while in a run. */}
      <div className="flex-1 flex items-center justify-center">
        {dungeon ? (
          <div className="text-[10px] uppercase tracking-widest text-[#F2E6A8] font-bold"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {dungeon.icon} {dungeon.name} — Room {dungeon.pathIndex + 1}/{dungeon.path.length}
          </div>
        ) : (
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#7A6E60]"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Party Idle
          </div>
        )}
      </div>

      {/* Right: currencies + speed/pause/retreat. */}
      <div className="flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-lg">🪙</span>
          <span className="text-[#D4A943] font-bold tabular-nums">{state.stash.gold.toLocaleString()}</span>
        </div>
        {state.stash.essence > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-lg">⟡</span>
            <span className="text-[#B485E8] font-bold tabular-nums">{state.stash.essence.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[#7A6E60]">XP</span>
          <span className="text-[#F2E6A8] font-bold tabular-nums">
            {state.heroes.reduce((a, h) => a + h.xp + h.level * 1000, 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-0.5 ml-2">
          {[1, 2, 4].map(s => {
            const active = state.speed === s;
            return (
              <button key={s} type="button" onClick={() => setSpeed(s as 1 | 2 | 4)}
                      className={`press w-7 h-7 text-[10px] font-bold transition-colors ${
                        active ? 'text-[#0a0806]' : 'text-[#B8A890] hover:bg-[#2B2B32]'
                      }`}
                      style={{
                        background: active ? 'var(--cc-orange)' : '#14100C',
                        border: `1px solid ${active ? 'var(--cc-orange)' : '#2B2B32'}`,
                        borderRadius: 2,
                      }}>{s}×</button>
            );
          })}
          <button type="button" onClick={togglePause}
                  className={`press w-7 h-7 text-xs font-bold transition-colors ${
                    state.paused ? 'text-[#0a0806]' : 'text-[#E8E0D4] hover:bg-[#2B2B32]'
                  }`}
                  style={{
                    background: state.paused ? 'var(--cc-blue)' : '#14100C',
                    border: `1px solid ${state.paused ? 'var(--cc-blue)' : '#2B2B32'}`,
                    borderRadius: 2,
                  }}>{state.paused ? '▶' : '❚❚'}</button>
          {dungeon && (
            <button type="button" onClick={retreatToTown}
                    className="press ml-1 px-2 h-7 text-[10px] font-bold text-[#E86E6E] hover:bg-[#2a1410]"
                    style={{
                      background: '#14100C',
                      border: '1px solid #E86E6E50',
                      borderRadius: 2,
                    }}>
              ← TOWN
            </button>
          )}
          <button type="button"
                  onClick={() => {
                    if (!confirm('Hard reset: wipe save, clear cache, reload?')) return;
                    try { localStorage.removeItem('cc_save_v1'); } catch { /* ignored */ }
                    window.location.href = window.location.pathname + '?nuked=' + Date.now();
                  }}
                  className="press ml-1 px-1.5 h-7 text-[9px] text-[#7A6E60] hover:text-[#E86E6E]"
                  style={{
                    background: '#14100C',
                    border: '1px solid #2B2B32',
                    borderRadius: 2,
                  }}
                  title="Hard reset">
            ⚠
          </button>
        </div>
      </div>
    </div>
  );
};
