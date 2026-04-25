// Sub-components for TownSkillsView. Split out so the parent file is
// orchestration only — sidebar / banner / worker / action are each
// self-contained and easier to iterate on.
import React from 'react';
import { GameState, SkillId, TownWorker } from '../types';
import { ITEMS } from '../data/items';
import {
  SKILL_ACTIONS, SkillActionDef, SkillBonuses,
  TOWN_TIERS, TownBonuses,
  SKILL_MILESTONES,
  producerForItem, dominantSkill,
} from '../engine/skilling';

export type SkillEntry = { id: SkillId; icon: string; name: string };

export const SKILLS_LIST: SkillEntry[] = [
  { id: 'mining',       icon: '⛏️', name: 'Mining' },
  { id: 'smithing',     icon: '🔨', name: 'Smithing' },
  { id: 'woodcutting',  icon: '🪓', name: 'Woodcutting' },
  { id: 'farming',      icon: '🌱', name: 'Farming' },
  { id: 'crafting',     icon: '🧵', name: 'Crafting' },
  { id: 'herblore',     icon: '🧪', name: 'Herblore' },
  { id: 'fishing',      icon: '🎣', name: 'Fishing' },
  { id: 'cooking',      icon: '🍳', name: 'Cooking' },
  { id: 'runecrafting', icon: '🔮', name: 'Runecrafting' },
  { id: 'thieving',     icon: '🥷', name: 'Thieving' },
  { id: 'agility',      icon: '🏃', name: 'Agility' },
];

// =====================================================================
// Skill list sidebar — left rail with icon, level, craftable badge.
// =====================================================================
export const SkillSidebar: React.FC<{
  state: GameState;
  selected: SkillId;
  setSelected: (id: SkillId) => void;
  totalLevelSum: number;
  craftableCountBySkill: Partial<Record<SkillId, number>>;
}> = ({ state, selected, setSelected, totalLevelSum, craftableCountBySkill }) => {
  const workers = state.town?.workers || [];
  return (
    <div className="w-full sm:w-52 shrink-0 bg-[#14100C] border-r border-[#3D3328] flex flex-col p-2 gap-1 overflow-y-auto">
      <div className="flex items-center justify-between px-2 py-1 mb-1">
        <div className="text-[10px] uppercase tracking-widest text-[#7A6E60] font-bold">Town Skills</div>
        <div className="text-[10px] text-[#D4A943] font-bold tabular-nums"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Σ {totalLevelSum}
        </div>
      </div>
      {SKILLS_LIST.map(s => {
        const isActiveSkill = workers.some(w => w.activeTask?.skillId === s.id);
        const lvl = state.skills[s.id]?.level || 1;
        const craftable = craftableCountBySkill[s.id] || 0;
        const isSelected = selected === s.id;
        return (
          <button key={s.id} onClick={() => setSelected(s.id)}
                  className={`flex items-center gap-2 p-2 rounded text-sm transition-colors text-left relative
                    ${isSelected ? 'bg-[#2B231B] border-l-2 border-[#D4A943]' : 'hover:bg-[#1E1A16] border-l-2 border-transparent'}`}>
            <span className="text-lg w-6 shrink-0 text-center">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-1">
                <span className={`truncate ${isSelected ? 'text-[#F2E6A8]' : 'text-[#B8A890]'}`}>{s.name}</span>
                <span className="text-[10px] text-[#D4A943] font-bold tabular-nums"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  L{lvl}
                </span>
              </div>
              {/* 5 dots, one per milestone tier — lit when reached. */}
              <div className="flex gap-[2px] mt-0.5"
                   title={SKILL_MILESTONES.map(m => `L${m.level}: ${m.title}`).join(' · ')}>
                {SKILL_MILESTONES.map(m => {
                  const reached = lvl >= m.level;
                  return (
                    <span key={m.id}
                          className={`block w-1.5 h-1.5 rounded-full transition-colors
                            ${reached ? 'bg-[#D4A943] shadow-[0_0_3px_#D4A943]' : 'bg-[#3D3328]'}`} />
                  );
                })}
              </div>
              {craftable > 0 && (
                <div className="text-[9px] text-[#7FE2A0] font-bold leading-none mt-0.5"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  ✓ {craftable} ready
                </div>
              )}
            </div>
            {isActiveSkill && (
              <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-[#7FE2A0] shadow-[0_0_8px_#7FE2A0] animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
};

// =====================================================================
// Town tier banner — global "all skills together" perk display.
// =====================================================================
export const TownTierBanner: React.FC<{ totalLevelSum: number; town: TownBonuses }> = ({ totalLevelSum, town }) => {
  const tierReached = TOWN_TIERS.filter(t => totalLevelSum >= t.total).pop();
  const nextTier = TOWN_TIERS.find(t => totalLevelSum < t.total);
  return (
    <div className="bg-[#14100C] border border-[#3D3328] rounded-lg p-2.5 mb-3 shadow-md flex flex-col gap-2">
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-widest text-[#7A6E60] font-bold">Town Tier</span>
          <span className="text-sm font-bold text-[#F2E6A8]"
                style={{ fontFamily: "'Cinzel', serif" }}>
            {tierReached ? tierReached.title : 'Hamlet'}
          </span>
          <span className="text-[10px] text-[#7FE2A0] font-bold tabular-nums"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {town.goldMul > 1 && <span className="mr-2">+{Math.round((town.goldMul - 1) * 100)}% gold</span>}
            {town.xpMul > 1 && <span className="mr-2">+{Math.round((town.xpMul - 1) * 100)}% xp</span>}
            {town.essenceMul > 1 && <span>+{Math.round((town.essenceMul - 1) * 100)}% essence</span>}
          </span>
        </div>
        <div className="text-[10px] text-[#B8A890] tabular-nums shrink-0"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}
             title={nextTier ? `Next: ${nextTier.title} — ${nextTier.blurb}` : 'All town tiers reached'}>
          {nextTier
            ? <>Σ <span className="text-[#F2E6A8] font-bold">{totalLevelSum}</span> / {nextTier.total}</>
            : <>Σ <span className="text-[#F2B84B] font-bold">{totalLevelSum}</span> · MAX</>}
        </div>
      </div>
      {nextTier && (
        <div className="w-full bg-[#0D0B09] h-1.5 rounded overflow-hidden border border-[#3D3328]">
          <div className="h-full bg-[linear-gradient(90deg,#9a8030_0%,#ffe080_100%)] transition-all"
               style={{ width: `${Math.min(100, (totalLevelSum / nextTier.total) * 100)}%` }} />
        </div>
      )}
    </div>
  );
};

// =====================================================================
// Worker card — one tile in the worker grid.
// =====================================================================
export const WorkerCard: React.FC<{
  worker: TownWorker;
  clearActiveTask: (workerId: string) => void;
  toggleAutoRepeat?: (workerId: string) => void;
}> = ({ worker, clearActiveTask, toggleAutoRepeat }) => {
  const isIdle = !worker.activeTask;
  const taskDef = worker.activeTask
    ? SKILL_ACTIONS[worker.activeTask.skillId]?.find(a => a.id === worker.activeTask!.actionId)
    : null;
  const skillEntry = worker.activeTask ? SKILLS_LIST.find(s => s.id === worker.activeTask!.skillId) : null;
  const icon = skillEntry?.icon ?? '💤';
  const stalled = !!worker.activeTask?.stalled;
  const repeating = !!worker.activeTask?.autoRepeat;
  const dom = dominantSkill(worker);
  const domEntry = dom ? SKILLS_LIST.find(s => s.id === dom) : null;
  const matchesDom = !!(worker.activeTask && dom && worker.activeTask.skillId === dom);
  // Pre-specialty hint: while no skill has hit the 30-cycle threshold,
  // show the leading skill + progress so the player can see which way
  // a worker is leaning.
  const SPECIALTY_THRESHOLD = 30;
  const leadingSkill = (() => {
    if (dom) return null;
    const counts = worker.cyclesPerSkill ?? {};
    let bestId: SkillId | null = null;
    let bestN = 0;
    for (const [id, n] of Object.entries(counts) as [SkillId, number][]) {
      if (n > bestN) { bestN = n; bestId = id; }
    }
    if (!bestId || bestN < 5) return null;
    return { id: bestId, n: bestN };
  })();
  const leadingEntry = leadingSkill ? SKILLS_LIST.find(s => s.id === leadingSkill.id) : null;
  const remaining = worker.activeTask?.repeatRemaining;
  const progressPct = worker.activeTask
    ? (worker.activeTask.progress / worker.activeTask.duration) * 100
    : 0;
  return (
    <div className={`p-2 rounded-lg border flex flex-col gap-1.5 relative overflow-hidden transition-colors
      ${isIdle ? 'bg-[#1A1512] border-[#3D3328]'
        : stalled ? 'bg-[#2E2818] border-[#D4A943]'
        : 'bg-[#1A2E20] border-[#4EBA6F] shadow-[0_0_10px_rgba(78,186,111,0.15)]'}`}>
      <div className="flex items-center justify-between">
        <span className={`font-bold text-xs truncate
          ${isIdle ? 'text-[#B8A890]' : stalled ? 'text-[#F2E6A8]' : 'text-[#A3E6B5]'}`}>{worker.name}</span>
        <span className={`text-sm shrink-0 ${!isIdle && !stalled && 'animate-pulse'}`}>{icon}</span>
      </div>
      {domEntry && (
        <div className={`text-[9px] leading-none flex items-center gap-1 -mt-1
          ${matchesDom ? 'text-[#F2B84B]' : 'text-[#7A6E60]'}`}
             style={{ fontFamily: "'JetBrains Mono', monospace" }}
             title={matchesDom
               ? `Specialist in ${domEntry.name} — −8% cycle time`
               : `Specialist in ${domEntry.name} (assign there for −8%)`}>
          <span>{domEntry.icon}</span>
          <span className="uppercase tracking-widest">{matchesDom ? 'Specialist ★' : 'Specialty'}</span>
        </div>
      )}
      {!domEntry && leadingEntry && leadingSkill && (
        <div className="text-[9px] leading-none flex items-center gap-1 -mt-1 text-[#7A6E60]"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}
             title={`${leadingSkill.n}/${SPECIALTY_THRESHOLD} cycles toward ${leadingEntry.name} specialty`}>
          <span className="opacity-60">{leadingEntry.icon}</span>
          <span className="tabular-nums">{leadingSkill.n}/{SPECIALTY_THRESHOLD}</span>
          <span className="uppercase tracking-widest opacity-60">→ specialty</span>
        </div>
      )}
      {isIdle ? (
        <div className="text-[10px] text-[#7A6E60]">Idle</div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className={`text-[10px] truncate ${stalled ? 'text-[#D4A943]' : 'text-[#4EBA6F]'}`}>
            {stalled ? `⏸ Out of mats — ${taskDef?.name}` : (taskDef?.name || 'Working...')}
            {typeof remaining === 'number' && remaining > 0 && (
              <span className="ml-1 text-[#F2E6A8]">×{remaining}</span>
            )}
          </div>
          <div className="w-full bg-[#0A1A10] h-1 rounded-full overflow-hidden">
            <div className={
              stalled ? 'h-full bg-[#D4A943]/50'
              : progressPct >= 85
                ? 'h-full bg-[#A3E6B5] shadow-[0_0_6px_#7FE2A0] animate-pulse'
                : 'h-full bg-[#4EBA6F]'
            } style={{ width: `${progressPct}%`, transition: 'width 0.2s linear' }} />
          </div>
        </div>
      )}
      {!isIdle && (
        <div className="absolute top-1 right-1 flex gap-1">
          {toggleAutoRepeat && (
            <button
              onClick={() => toggleAutoRepeat(worker.id)}
              title={repeating
                ? 'Auto-repeat ON — keep task assigned through stockouts'
                : 'Auto-repeat OFF — stop on stockout'}
              className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold border
                ${repeating
                  ? 'bg-[#7FE2A030] text-[#7FE2A0] border-[#7FE2A080]'
                  : 'bg-[#1A1A1A] text-[#7A6E60] border-[#3D3328] hover:text-[#B8A890] hover:border-[#7A6E60]'}`}>
              ↻
            </button>
          )}
          <button onClick={() => clearActiveTask(worker.id)}
                  className="px-1.5 py-0.5 bg-[#E86E6E20] text-[#E86E6E] hover:bg-[#E86E6E40] border border-[#E86E6E80] rounded text-[8px] uppercase tracking-widest font-bold">
            Stop
          </button>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// Skill action card — one craftable in the action grid.
// =====================================================================
export const SkillActionCard: React.FC<{
  state: GameState;
  selectedSkill: SkillId;
  action: SkillActionDef;
  unlocked: boolean;
  missingInput: boolean;
  isPinned: boolean;
  isDoing: boolean;
  bonuses: SkillBonuses;
  freeWorkerCount: number;
  repeatTimes: number;
  onAssign: () => void;
  onBulkAssign: () => void;
  onTogglePin?: () => void;
  onJumpToSkill: (id: SkillId) => void;
}> = ({
  state, selectedSkill, action, unlocked, missingInput, isPinned, isDoing,
  bonuses, freeWorkerCount, repeatTimes,
  onAssign, onBulkAssign, onTogglePin, onJumpToSkill,
}) => {
  void selectedSkill; void repeatTimes; // reserved for future use
  const itemDef = (id: string, qty: number) => {
    const it = ITEMS[id];
    return { name: it?.name || id, icon: it?.icon || '📦', qty };
  };
  const cycleSec = (Math.max(200, action.duration * bonuses.speedMul) / 1000).toFixed(1);
  const xpDisplay = Math.floor(action.xpReward * bonuses.xpMul);
  return (
    <div className={`relative bg-[#1A1512] rounded-lg border p-2.5 flex flex-col gap-1.5 transition-colors
      ${isDoing ? 'border-[#4EBA6F] shadow-[0_0_10px_rgba(78,186,111,0.25)]'
        : isPinned ? 'border-[#F2B84B] shadow-[0_0_8px_rgba(242,184,75,0.25)]'
        : !unlocked ? 'border-[#2a2420] opacity-55 grayscale'
        : missingInput ? 'border-[#3D3328]'
        : 'border-[#D4A943]/40 shadow-[0_0_6px_rgba(212,169,67,0.1)]'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="font-bold text-[#F2E6A8] text-xs leading-tight truncate flex-1">{action.name}</div>
        {onTogglePin && (
          <button onClick={onTogglePin}
                  title={isPinned ? 'Unpin from top' : 'Pin to top'}
                  className={`shrink-0 text-[10px] leading-none px-1 ${isPinned ? 'text-[#F2B84B]' : 'text-[#5C5246] hover:text-[#F2B84B]'}`}>
            {isPinned ? '★' : '☆'}
          </button>
        )}
        <div className={`text-[9px] font-bold shrink-0 px-1 py-0.5 rounded border
          ${unlocked
            ? 'text-[#D4A943] bg-[#2B231B] border-[#D4A943]/30'
            : 'text-[#E86E6E] bg-[#2a1010] border-[#E86E6E]/40'}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          L{action.levelReq}
        </div>
      </div>

      <div className="flex items-center gap-1 py-1 text-[11px]">
        {action.inputs ? (
          <div className="flex flex-col gap-0.5">
            {Object.entries(action.inputs).map(([id, qty]) => {
              const def = itemDef(id, qty);
              const have = state.stash.items[id] || 0;
              const hasEnough = have >= qty;
              const producer = !hasEnough ? producerForItem(id) : null;
              const tooltip = producer
                ? `${def.name}: ${have}/${qty} — Click to view ${producer.name} (Lvl ${producer.levelReq})`
                : `${def.name}: ${have} in stash, need ${qty}`;
              const inner = (
                <>
                  <span className="tabular-nums text-[10px] font-bold"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {have}/{qty}
                  </span>
                  <span className="text-sm">{def.icon}</span>
                  {producer && <span className="text-[8px] text-[#7FE2A0] font-bold">↗</span>}
                </>
              );
              if (producer) {
                return (
                  <button key={id} onClick={() => onJumpToSkill(producer.skillId)}
                          className="flex items-center gap-1 text-[#E86E6E] hover:text-[#F2E6A8] hover:underline text-left"
                          title={tooltip}>
                    {inner}
                  </button>
                );
              }
              return (
                <div key={id}
                     className={`flex items-center gap-1 ${hasEnough ? 'text-[#B8A890]' : 'text-[#E86E6E]'}`}
                     title={tooltip}>
                  {inner}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-base opacity-40">👐</div>
        )}
        <span className="text-[#3D3328] text-sm mx-1">➔</span>
        <div className="flex flex-col gap-0.5">
          {action.outputs && Object.entries(action.outputs).map(([id, qty]) => {
            const def = itemDef(id, qty);
            return (
              <div key={id} className="flex items-center gap-1 text-[#F2E6A8] font-bold" title={def.name}>
                <span className="tabular-nums text-[10px]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>+{qty}</span>
                <span className="text-sm drop-shadow-[0_0_3px_rgba(242,230,168,0.5)]">{def.icon}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center text-[9px] text-[#7A6E60] uppercase tracking-widest font-bold"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <span title={bonuses.speedMul < 1 ? `Base ${(action.duration / 1000).toFixed(1)}s · sped up by milestone perk` : undefined}>
          {cycleSec}s
        </span>
        <span className="text-[#7FE2A0]">+{xpDisplay} XP</span>
      </div>

      {unlocked ? (
        <div className="flex gap-1">
          <button
            disabled={freeWorkerCount === 0 || missingInput}
            onClick={onAssign}
            className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors
              ${freeWorkerCount === 0
                ? 'bg-[#1A1A1A] text-[#7A6E60] border border-[#3D3328] cursor-not-allowed'
                : missingInput
                  ? 'bg-[#E86E6E15] text-[#E86E6E] border border-[#E86E6E]/20 cursor-not-allowed'
                  : 'bg-[#D4A943] text-[#14100C] hover:bg-[#F2E6A8]'}`}>
            {freeWorkerCount === 0 ? 'No Workers' : missingInput ? 'No Mats' : 'Assign'}
          </button>
          {freeWorkerCount > 1 && !missingInput && (
            <button onClick={onBulkAssign}
                    title={`Assign all ${freeWorkerCount} idle workers to this`}
                    className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2B231B] text-[#D4A943] border border-[#D4A943]/40 hover:bg-[#3A2E1F]">
              ×{freeWorkerCount}
            </button>
          )}
        </div>
      ) : (
        <div className="w-full py-1 rounded text-[10px] font-bold uppercase tracking-wider text-center text-[#E86E6E]">
          Requires Lvl {action.levelReq}
        </div>
      )}
    </div>
  );
};
