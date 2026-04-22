import React, { useMemo, useState } from 'react';
import { GameState, SkillId } from '../types';
import { SKILL_ACTIONS, SkillActionDef, xpForLevel } from '../engine/skilling';
import { ITEMS } from '../data/items';

interface Props {
  state: GameState;
  setActiveTask: (skillId: string, actionId: string, duration: number, workerId?: string) => void;
  clearActiveTask: (workerId: string) => void;
  hireWorker?: () => void;
}

type Filter = 'all' | 'craftable' | 'unlocked';

export const TownSkillsView: React.FC<Props> = ({ state, setActiveTask, clearActiveTask, hireWorker }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillId>('mining');
  const [filter, setFilter] = useState<Filter>('all');

  const skillsList: { id: SkillId; icon: string; name: string }[] = [
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

  const workers = state.town?.workers || [];
  const freeWorkers = workers.filter(w => !w.activeTask);
  const activeWorkers = workers.filter(w => w.activeTask && w.activeTask.skillId === selectedSkill);

  const currentLevel = state.skills[selectedSkill]?.level || 1;
  const currentXp = state.skills[selectedSkill]?.xp || 0;
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const prevLevelXp = xpForLevel(currentLevel);
  const levelProgress = Math.min(100, Math.max(0, ((currentXp - prevLevelXp) / Math.max(1, nextLevelXp - prevLevelXp)) * 100));

  // How many unique craftable-now recipes exist per skill — shown as a sidebar badge.
  const craftableCountBySkill = useMemo(() => {
    const result: Partial<Record<SkillId, number>> = {};
    for (const s of skillsList) {
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

  const totalLevelSum = skillsList.reduce((a, s) => a + (state.skills[s.id]?.level || 1), 0);

  const actions: SkillActionDef[] = SKILL_ACTIONS[selectedSkill] || [];

  // Sort: craftable now → unlocked but missing inputs → locked. Stable by level.
  const rankedActions = useMemo(() => {
    return [...actions].map(a => {
      const unlocked = currentLevel >= a.levelReq;
      let missingInput = false;
      if (a.inputs) {
        for (const [id, qty] of Object.entries(a.inputs)) {
          if ((state.stash.items[id] || 0) < qty) { missingInput = true; break; }
        }
      }
      const rank = !unlocked ? 2 : missingInput ? 1 : 0;
      return { a, unlocked, missingInput, rank };
    }).sort((x, y) => {
      if (x.rank !== y.rank) return x.rank - y.rank;
      return x.a.levelReq - y.a.levelReq;
    });
  }, [actions, currentLevel, state.stash.items]);

  const filteredActions = rankedActions.filter(({ unlocked, missingInput }) => {
    if (filter === 'craftable') return unlocked && !missingInput;
    if (filter === 'unlocked')  return unlocked;
    return true;
  });

  const getDef = (id: string, qty: number) => {
    const item = ITEMS[id];
    return { name: item?.name || id, icon: item?.icon || '📦', qty, id: item?.id };
  };

  const hireCost = 1000 * Math.pow(2, Math.max(0, workers.length - 3));

  return (
    <div className="h-full flex flex-col sm:flex-row bg-[#0D0B09]">
      {/* ============ Skill list sidebar ============ */}
      <div className="w-full sm:w-52 shrink-0 bg-[#14100C] border-r border-[#3D3328] flex flex-col p-2 gap-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1 mb-1">
          <div className="text-[10px] uppercase tracking-widest text-[#7A6E60] font-bold">Town Skills</div>
          <div className="text-[10px] text-[#D4A943] font-bold tabular-nums"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Σ {totalLevelSum}
          </div>
        </div>
        {skillsList.map(s => {
          const workersOnSkill = workers.filter(w => w.activeTask?.skillId === s.id);
          const isActiveSkill = workersOnSkill.length > 0;
          const lvl = state.skills[s.id]?.level || 1;
          const craftable = craftableCountBySkill[s.id] || 0;
          const selected = selectedSkill === s.id;
          return (
            <button key={s.id} onClick={() => setSelectedSkill(s.id)}
                    className={`flex items-center gap-2 p-2 rounded text-sm transition-colors text-left relative
                      ${selected ? 'bg-[#2B231B] border-l-2 border-[#D4A943]' : 'hover:bg-[#1E1A16] border-l-2 border-transparent'}
                    `}>
              <span className="text-lg w-6 shrink-0 text-center">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-1">
                  <span className={`truncate ${selected ? 'text-[#F2E6A8]' : 'text-[#B8A890]'}`}>{s.name}</span>
                  <span className="text-[10px] text-[#D4A943] font-bold tabular-nums"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    L{lvl}
                  </span>
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

      {/* ============ Main panel ============ */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 relative">
        {/* Worker roster */}
        <div className="flex justify-between items-center bg-[#14100C] border border-[#3D3328] rounded-lg p-2.5 mb-3 shadow-md">
          <div className="font-bold text-[#F2E6A8] text-xs uppercase tracking-widest">
            Worker Roster
          </div>
          <div className="text-xs font-bold text-[#D4A943]">
            {freeWorkers.length} / {workers.length} Idle
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-5">
          {workers.map(w => {
            const isIdle = !w.activeTask;
            const taskDef = w.activeTask ? SKILL_ACTIONS[w.activeTask.skillId]?.find(a => a.id === w.activeTask!.actionId) : null;
            const icon = w.activeTask ? skillsList.find(s => s.id === w.activeTask!.skillId)?.icon : '💤';
            return (
              <div key={w.id} className={`p-2 rounded-lg border ${isIdle ? 'bg-[#1A1512] border-[#3D3328]' : 'bg-[#1A2E20] border-[#4EBA6F] shadow-[0_0_10px_rgba(78,186,111,0.15)]'} flex flex-col gap-1.5 relative overflow-hidden transition-colors`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs truncate ${isIdle ? 'text-[#B8A890]' : 'text-[#A3E6B5]'}`}>{w.name}</span>
                  <span className={`text-sm shrink-0 ${!isIdle && 'animate-pulse'}`}>{icon}</span>
                </div>
                {isIdle ? (
                  <div className="text-[10px] text-[#7A6E60]">Idle</div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] text-[#4EBA6F] truncate">{taskDef?.name || 'Working...'}</div>
                    <div className="w-full bg-[#0A1A10] h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4EBA6F]" style={{ width: `${(w.activeTask!.progress / w.activeTask!.duration) * 100}%`, transition: 'width 0.2s linear' }} />
                    </div>
                  </div>
                )}
                {!isIdle && (
                  <button onClick={() => clearActiveTask(w.id)} className="absolute top-1 right-1 px-1.5 py-0.5 bg-[#E86E6E20] text-[#E86E6E] hover:bg-[#E86E6E40] border border-[#E86E6E80] rounded text-[8px] uppercase tracking-widest font-bold">
                    Stop
                  </button>
                )}
              </div>
            );
          })}
          {hireWorker && (
            <button
              onClick={hireWorker}
              className={`p-2 rounded-lg border border-dashed flex flex-col items-center justify-center gap-1 transition-colors
                ${state.stash.gold >= hireCost
                  ? 'bg-[#14100C] border-[#D4A943]/50 text-[#D4A943] hover:bg-[#2B231B] hover:border-[#D4A943]'
                  : 'bg-[#0D0B09] border-[#3D3328] text-[#7A6E60] cursor-not-allowed'}`}
              disabled={state.stash.gold < hireCost}
            >
              <div className="font-bold text-xs">+ Hire</div>
              <div className="text-[10px] flex items-center gap-1">
                <span>🪙</span>
                <span>{hireCost.toLocaleString()}</span>
              </div>
            </button>
          )}
        </div>

        {/* Selected-skill header */}
        <div className="flex items-center gap-3 mb-3 sticky top-0 bg-[#0D0B09]/95 backdrop-blur-sm p-3 rounded-lg border border-[#3D3328] z-10 shadow-xl">
          <div className="text-3xl">{skillsList.find(s => s.id === selectedSkill)?.icon}</div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold text-[#F2E6A8] leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                {skillsList.find(s => s.id === selectedSkill)?.name}
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

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-widest"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {([
            { id: 'all',       label: `All · ${rankedActions.length}` },
            { id: 'craftable', label: `Ready · ${rankedActions.filter(r => r.unlocked && !r.missingInput).length}` },
            { id: 'unlocked',  label: `Unlocked · ${rankedActions.filter(r => r.unlocked).length}` },
          ] as { id: Filter; label: string }[]).map(f => {
            const active = filter === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                      className={`px-2.5 py-1 rounded border transition-colors ${
                        active
                          ? 'bg-[#D4A943] text-[#14100C] border-[#D4A943]'
                          : 'bg-[#14100C] text-[#B8A890] border-[#3D3328] hover:border-[#D4A943] hover:text-[#F2E6A8]'
                      }`}>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Active task readouts (big) */}
        {activeWorkers.length > 0 && activeWorkers.map(worker => {
          const activeTask = worker.activeTask!;
          const taskDef = SKILL_ACTIONS[selectedSkill]?.find(a => a.id === activeTask.actionId);
          return (
            <div key={worker.id} className="mb-3 p-3 rounded bg-[#1A2E20] border border-[#2D4A35] flex items-center gap-3">
              <div className="text-xl animate-spin" style={{ animationDuration: '3s' }}>{skillsList.find(s => s.id === selectedSkill)?.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[#A3E6B5] font-bold text-xs mb-1 truncate">
                  {worker.name} — {taskDef?.name}
                </div>
                <div className="w-full bg-[#0A1A10] h-2 rounded overflow-hidden">
                  <div className="h-full bg-[#4EBA6F]" style={{ width: `${(activeTask.progress / activeTask.duration) * 100}%`, transition: 'width 0.2s linear' }} />
                </div>
              </div>
              <button onClick={() => clearActiveTask(worker.id)} className="px-2 py-1 bg-[#E86E6E20] text-[#E86E6E] hover:bg-[#E86E6E40] border border-[#E86E6E80] rounded text-[10px] uppercase tracking-widest font-bold">
                Stop
              </button>
            </div>
          );
        })}

        {/* Action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredActions.map(({ a: action, unlocked, missingInput }) => {
            const workersDoingThis = activeWorkers.filter(w => w.activeTask?.actionId === action.id);
            const isDoing = workersDoingThis.length > 0;

            return (
              <div key={action.id}
                   className={`relative bg-[#1A1512] rounded-lg border p-2.5 flex flex-col gap-1.5 transition-colors
                     ${isDoing ? 'border-[#4EBA6F] shadow-[0_0_10px_rgba(78,186,111,0.25)]'
                       : !unlocked ? 'border-[#2a2420] opacity-55 grayscale'
                       : missingInput ? 'border-[#3D3328]'
                       : 'border-[#D4A943]/40 shadow-[0_0_6px_rgba(212,169,67,0.1)]'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-[#F2E6A8] text-xs leading-tight truncate flex-1">{action.name}</div>
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
                        const def = getDef(id, qty);
                        const have = state.stash.items[id] || 0;
                        const hasEnough = have >= qty;
                        return (
                          <div key={id}
                               className={`flex items-center gap-1 ${hasEnough ? 'text-[#B8A890]' : 'text-[#E86E6E]'}`}
                               title={`${def.name}: ${have} in stash, need ${qty}`}>
                            <span className="tabular-nums text-[10px] font-bold"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              {have}/{qty}
                            </span>
                            <span className="text-sm">{def.icon}</span>
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
                      const def = getDef(id, qty);
                      return (
                        <div key={id}
                             className="flex items-center gap-1 text-[#F2E6A8] font-bold"
                             title={def.name}>
                          <span className="tabular-nums text-[10px]"
                                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            +{qty}
                          </span>
                          <span className="text-sm drop-shadow-[0_0_3px_rgba(242,230,168,0.5)]">{def.icon}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-[#7A6E60] uppercase tracking-widest font-bold"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>{(action.duration / 1000).toFixed(1)}s</span>
                  <span className="text-[#7FE2A0]">+{action.xpReward} XP</span>
                </div>

                {unlocked ? (
                  <button
                    disabled={freeWorkers.length === 0 || missingInput}
                    onClick={() => setActiveTask(selectedSkill, action.id, action.duration)}
                    className={`w-full py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors
                      ${freeWorkers.length === 0
                        ? 'bg-[#1A1A1A] text-[#7A6E60] border border-[#3D3328] cursor-not-allowed'
                        : missingInput
                          ? 'bg-[#E86E6E15] text-[#E86E6E] border border-[#E86E6E]/20 cursor-not-allowed'
                          : 'bg-[#D4A943] text-[#14100C] hover:bg-[#F2E6A8]'}`}
                  >
                    {freeWorkers.length === 0 ? 'No Free Workers' : missingInput ? 'Missing Mats' : 'Assign'}
                  </button>
                ) : (
                  <div className="w-full py-1 rounded text-[10px] font-bold uppercase tracking-wider text-center text-[#E86E6E]">
                    Requires Lvl {action.levelReq}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
