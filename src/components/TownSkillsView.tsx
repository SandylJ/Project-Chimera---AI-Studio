import React, { useEffect, useMemo, useState } from 'react';
import { GameState, SkillId } from '../types';
import {
  SKILL_ACTIONS, SkillActionDef, xpForLevel, SKILL_MILESTONES,
  getSkillBonuses, workerHireCost, totalSkillLevel, townBonuses, CAPE_BY_SKILL,
  actionCategory, ActionCategory,
} from '../engine/skilling';
import { ITEMS } from '../data/items';
import {
  SKILLS_LIST, SkillSidebar, TownTierBanner, WorkerCard, SkillActionCard,
} from './town-skills-parts';

interface Props {
  state: GameState;
  setActiveTask: (skillId: string, actionId: string, duration: number, workerId?: string, repeatTimes?: number) => void;
  clearActiveTask: (workerId: string) => void;
  toggleAutoRepeat?: (workerId: string) => void;
  togglePinAction?: (actionId: string) => void;
  hireWorker?: () => void;
}

type Filter = 'all' | 'craftable' | 'unlocked';

const REPEAT_OPTIONS: Array<{ n: number; label: string }> = [
  { n: 0, label: '∞' }, { n: 5, label: '5×' }, { n: 10, label: '10×' }, { n: 25, label: '25×' }, { n: 100, label: '100×' },
];

const CATEGORY_ICON: Record<ActionCategory, string> = {
  ores: '🪨', bars: '🟧', logs: '🪵', gems: '💎',
  weapons: '⚔️', armor: '🛡️', jewelry: '💍',
  talismans: '🔯', runes: '🔮', scrolls: '📜',
  food: '🍖', potions: '🧪',
  materials: '🧶', mastery: '🏆', capes: '🎽',
  misc: '❓',
};

export const TownSkillsView: React.FC<Props> = ({
  state, setActiveTask, clearActiveTask, toggleAutoRepeat, togglePinAction, hireWorker,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillId>('mining');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [repeatTimes, setRepeatTimes] = useState<number>(0);
  const [category, setCategory] = useState<ActionCategory | 'all'>('all');

  const workers = state.town?.workers || [];
  const freeWorkers = workers.filter(w => !w.activeTask);
  const activeWorkers = workers.filter(w => w.activeTask && w.activeTask.skillId === selectedSkill);

  const currentLevel = state.skills[selectedSkill]?.level || 1;
  const currentXp = state.skills[selectedSkill]?.xp || 0;
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const prevLevelXp = xpForLevel(currentLevel);
  const levelProgress = Math.min(100, Math.max(0, ((currentXp - prevLevelXp) / Math.max(1, nextLevelXp - prevLevelXp)) * 100));

  const craftableCountBySkill = useMemo(() => {
    const result: Partial<Record<SkillId, number>> = {};
    for (const s of SKILLS_LIST) {
      const lvl = state.skills[s.id]?.level || 1;
      const defs = SKILL_ACTIONS[s.id] || [];
      let count = 0;
      for (const a of defs) {
        if (a.levelReq > lvl) continue;
        if (!a.inputs) { count++; continue; }
        let ok = true;
        for (const [id, qty] of Object.entries(a.inputs)) {
          if ((state.stash.items[id] || 0) < qty) { ok = false; break; }
        }
        if (ok) count++;
      }
      result[s.id] = count;
    }
    return result;
  }, [state.skills, state.stash.items]);

  const totalLevelSum = totalSkillLevel(state);
  const town = townBonuses(totalLevelSum);

  const actions: SkillActionDef[] = SKILL_ACTIONS[selectedSkill] || [];
  const pinned = state.pinnedActions ?? [];

  // Categories present for this skill (derived from outputs). When the
  // skill has 3+ distinct categories it's worth showing a filter chip
  // strip — Crafting alone has ~10 categories.
  const categoriesPresent = useMemo(() => {
    const counts = new Map<ActionCategory, number>();
    for (const a of actions) {
      const c = actionCategory(a, ITEMS);
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [actions]);
  const showCategoryChips = categoriesPresent.length >= 3;
  // Reset category when switching skills so a "talismans" filter from
  // Crafting doesn't carry into Mining and hide everything.
  useEffect(() => { setCategory('all'); }, [selectedSkill]);

  // Sort: pinned → craftable now → unlocked but missing inputs → locked.
  const rankedActions = useMemo(() => {
    return [...actions].map(a => {
      const unlocked = currentLevel >= a.levelReq;
      let missingInput = false;
      if (a.inputs) {
        for (const [id, qty] of Object.entries(a.inputs)) {
          if ((state.stash.items[id] || 0) < qty) { missingInput = true; break; }
        }
      }
      const isPinned = pinned.includes(a.id);
      const rank = isPinned ? -1 : !unlocked ? 2 : missingInput ? 1 : 0;
      return { a, unlocked, missingInput, rank, isPinned };
    }).sort((x, y) => {
      if (x.rank !== y.rank) return x.rank - y.rank;
      return x.a.levelReq - y.a.levelReq;
    });
  }, [actions, currentLevel, state.stash.items, pinned]);

  const q = search.trim().toLowerCase();
  const filteredActions = rankedActions.filter(({ a, unlocked, missingInput }) => {
    if (filter === 'craftable' && !(unlocked && !missingInput)) return false;
    if (filter === 'unlocked'  && !unlocked) return false;
    if (category !== 'all' && actionCategory(a, ITEMS) !== category) return false;
    if (q) {
      const inName = a.name.toLowerCase().includes(q);
      const inOutput = Object.keys(a.outputs || {}).some(id =>
        (ITEMS[id]?.name || id).toLowerCase().includes(q));
      if (!inName && !inOutput) return false;
    }
    return true;
  });

  const bonuses = getSkillBonuses(currentLevel);

  // Cape + wisdom bonuses for the chip strip.
  const skillCapeId = CAPE_BY_SKILL[selectedSkill];
  const capeWornFor = state.heroes.some(h => !h.bench && h.equipment.neck === skillCapeId);
  const completionCapeWorn = state.heroes.some(h => !h.bench && h.equipment.neck === 'cape_of_completion');
  const capeBonus = (capeWornFor ? 0.25 : 0) + (completionCapeWorn ? 0.10 : 0);
  const wisdomMs = Math.max(0, (state.skillXpBoostUntil ?? 0) - Date.now());
  const wisdomActive = wisdomMs > 0;

  const bulkAssign = (actionId: string, duration: number) => {
    for (const w of freeWorkers) setActiveTask(selectedSkill, actionId, duration, w.id, repeatTimes);
  };
  const bulkStop = () => {
    for (const w of activeWorkers) clearActiveTask(w.id);
  };

  const hireCost = workerHireCost(workers.length);
  const selectedEntry = SKILLS_LIST.find(s => s.id === selectedSkill);

  return (
    <div className="h-full flex flex-col sm:flex-row bg-[#0D0B09]">
      <SkillSidebar
        state={state}
        selected={selectedSkill}
        setSelected={setSelectedSkill}
        totalLevelSum={totalLevelSum}
        craftableCountBySkill={craftableCountBySkill}
      />

      <div className="flex-1 flex flex-col overflow-y-auto p-4 relative">
        <TownTierBanner totalLevelSum={totalLevelSum} town={town} />

        {/* Worker roster header + grid */}
        <div className="flex justify-between items-center bg-[#14100C] border border-[#3D3328] rounded-lg p-2.5 mb-3 shadow-md">
          <div className="font-bold text-[#F2E6A8] text-xs uppercase tracking-widest">Worker Roster</div>
          <div className="text-xs font-bold text-[#D4A943]">{freeWorkers.length} / {workers.length} Idle</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-5">
          {workers.map(w => (
            <WorkerCard key={w.id} worker={w}
                        clearActiveTask={clearActiveTask}
                        toggleAutoRepeat={toggleAutoRepeat} />
          ))}
          {hireWorker && (
            <button onClick={hireWorker}
                    disabled={state.stash.gold < hireCost}
                    className={`p-2 rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 transition-colors
                      ${state.stash.gold >= hireCost
                        ? 'bg-[#14100C] border-[#D4A943]/50 text-[#D4A943] hover:bg-[#2B231B] hover:border-[#D4A943]'
                        : 'bg-[#0D0B09] border-[#3D3328] text-[#7A6E60] cursor-not-allowed'}`}>
              <div className="font-bold text-xs">+ Hire</div>
              <div className="text-[10px] flex items-center gap-1">
                <span>🪙</span><span>{hireCost.toLocaleString()}</span>
              </div>
            </button>
          )}
        </div>

        {/* Selected-skill header (sticky) */}
        <div className="flex flex-col gap-2 mb-3 sticky top-0 bg-[#0D0B09]/95 backdrop-blur-sm p-3 rounded-lg border border-[#3D3328] z-10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{selectedEntry?.icon}</div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xl font-bold text-[#F2E6A8] leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                  {selectedEntry?.name}
                </h2>
                <div className="text-[10px] text-[#B8A890] font-bold tabular-nums"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Lvl <span className="text-[#F2E6A8] text-sm">{currentLevel}</span>
                  <span className="text-[#7A6E60] mx-1">·</span>
                  {Math.floor(currentXp).toLocaleString()} / {nextLevelXp.toLocaleString()} xp
                </div>
              </div>
              <div className="w-full bg-[#14100C] h-2 rounded mt-1 overflow-hidden border border-[#3D3328]">
                <div className="h-full bg-[linear-gradient(90deg,#9a8030_0%,#ffe080_100%)] transition-all"
                     style={{ width: `${levelProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Milestones + bonus chips on one row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SKILL_MILESTONES.map(m => {
              const reached = currentLevel >= m.level;
              return (
                <div key={m.id}
                     title={`Lvl ${m.level} — ${m.title}: ${m.blurb}`}
                     className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest
                       ${reached
                         ? 'bg-[#2B231B] text-[#F2E6A8] border-[#D4A943] shadow-[0_0_6px_rgba(212,169,67,0.35)]'
                         : 'bg-[#14100C] text-[#5C5246] border-[#3D3328]'}`}
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {reached ? '✓' : m.level} {m.title}
                </div>
              );
            })}
            {(bonuses.speedMul < 1 || bonuses.doubleChance > 0 || bonuses.skipChance > 0 || bonuses.xpMul > 1 || capeBonus > 0 || wisdomActive) && (
              <div className="text-[9px] text-[#7FE2A0] font-bold ml-1 tabular-nums"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {bonuses.speedMul < 1 && <span className="mr-2">−{Math.round((1 - bonuses.speedMul) * 100)}% time</span>}
                {(bonuses.doubleChance + capeBonus) > 0 && (
                  <span className="mr-2">
                    {Math.round((bonuses.doubleChance + capeBonus) * 100)}% 2×
                    {capeBonus > 0 && <span className="text-[#F2B84B] ml-0.5">★</span>}
                  </span>
                )}
                {bonuses.skipChance > 0 && <span className="mr-2">{Math.round(bonuses.skipChance * 100)}% skip</span>}
                {bonuses.xpMul > 1 && <span className="mr-2">+{Math.round((bonuses.xpMul - 1) * 100)}% xp</span>}
                {wisdomActive && (
                  <span className="text-[#B485E8]" title="Wisdom Potion active — +50% skill XP">
                    📘 +50% xp · {Math.ceil(wisdomMs / 60000)}m left
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Filter / search / repeat / bulk-stop on one row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 text-[10px] font-bold uppercase tracking-widest"
                 style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {([
                { id: 'all',       label: `All · ${rankedActions.length}` },
                { id: 'craftable', label: `Ready · ${rankedActions.filter(r => r.unlocked && !r.missingInput).length}` },
                { id: 'unlocked',  label: `Unlocked · ${rankedActions.filter(r => r.unlocked).length}` },
              ] as { id: Filter; label: string }[]).map(f => {
                const on = filter === f.id;
                return (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                          className={`px-2 py-1 rounded border transition-colors ${
                            on ? 'bg-[#D4A943] text-[#14100C] border-[#D4A943]'
                               : 'bg-[#14100C] text-[#B8A890] border-[#3D3328] hover:border-[#D4A943] hover:text-[#F2E6A8]'
                          }`}>
                    {f.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 min-w-[140px] bg-[#14100C] border border-[#3D3328] rounded px-2 py-1 text-xs text-[#F2E6A8] placeholder-[#5C5246] focus:outline-none focus:border-[#D4A943]"
            />
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                 style={{ fontFamily: "'JetBrains Mono', monospace" }}
                 title="Mass-craft: how many cycles per assign before the worker auto-stops. ∞ = run forever.">
              <span className="text-[#7A6E60] mr-1">Run:</span>
              {REPEAT_OPTIONS.map(o => {
                const on = repeatTimes === o.n;
                return (
                  <button key={o.n} onClick={() => setRepeatTimes(o.n)}
                          className={`px-1.5 py-1 rounded border transition-colors ${
                            on ? 'bg-[#D4A943] text-[#14100C] border-[#D4A943]'
                               : 'bg-[#14100C] text-[#B8A890] border-[#3D3328] hover:border-[#D4A943]'
                          }`}>
                    {o.label}
                  </button>
                );
              })}
            </div>
            {activeWorkers.length > 0 && (
              <button onClick={bulkStop}
                      className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold rounded border bg-[#E86E6E20] text-[#E86E6E] hover:bg-[#E86E6E40] border-[#E86E6E80]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Stop all
              </button>
            )}
          </div>

          {/* Category chips — only shown when the skill has enough variety
              to warrant filtering. Each chip shows count of recipes in
              that bucket. */}
          {showCategoryChips && (
            <div className="flex items-center gap-1 flex-wrap text-[10px] font-bold uppercase tracking-widest"
                 style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-[#7A6E60] mr-1">Type:</span>
              <button onClick={() => setCategory('all')}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        category === 'all'
                          ? 'bg-[#D4A943] text-[#14100C] border-[#D4A943]'
                          : 'bg-[#14100C] text-[#B8A890] border-[#3D3328] hover:border-[#D4A943]'
                      }`}>
                All · {actions.length}
              </button>
              {categoriesPresent.map(([cat, count]) => (
                <button key={cat} onClick={() => setCategory(cat)}
                        className={`px-2 py-0.5 rounded border transition-colors ${
                          category === cat
                            ? 'bg-[#D4A943] text-[#14100C] border-[#D4A943]'
                            : 'bg-[#14100C] text-[#B8A890] border-[#3D3328] hover:border-[#D4A943]'
                        }`}>
                  {CATEGORY_ICON[cat]} {cat} · {count}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredActions.map(({ a: action, unlocked, missingInput, isPinned }) => {
            const isDoing = activeWorkers.some(w => w.activeTask?.actionId === action.id);
            return (
              <SkillActionCard
                key={action.id}
                state={state}
                selectedSkill={selectedSkill}
                action={action}
                unlocked={unlocked}
                missingInput={missingInput}
                isPinned={isPinned}
                isDoing={isDoing}
                bonuses={bonuses}
                freeWorkerCount={freeWorkers.length}
                repeatTimes={repeatTimes}
                onAssign={() => setActiveTask(selectedSkill, action.id, action.duration, undefined, repeatTimes)}
                onBulkAssign={() => bulkAssign(action.id, action.duration)}
                onTogglePin={togglePinAction ? () => togglePinAction(action.id) : undefined}
                onJumpToSkill={(id) => { setSelectedSkill(id); setSearch(''); }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
