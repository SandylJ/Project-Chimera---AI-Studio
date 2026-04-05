import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerState, Quest, QuestStatus, QuestObjective, QuestReward, QuestRequirement } from '../types';
import { QUESTS, ITEMS } from '../constants';
import { playButtonPress, playSuccess, playQuestStart } from '../sounds';

interface QuestViewProps { state: PlayerState; startQuest: (questId: string) => void; }
const CATEGORIES = ['all', 'combat', 'gathering', 'artisan', 'exploration', 'special'] as const;
const DIFFICULTY_COLORS: Record<string, string> = {
  novice: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800', intermediate: 'bg-blue-900/50 text-blue-400 border border-blue-800',
  experienced: 'bg-amber-900/50 text-amber-400 border border-amber-800', master: 'bg-red-900/50 text-red-400 border border-red-800',
  grandmaster: 'bg-purple-900/50 text-purple-400 border border-purple-800',
};
const STATUS_STYLES: Record<QuestStatus, { border: string; bg: string; label: string }> = {
  locked: { border: 'border-[#3D3328]', bg: 'opacity-50', label: 'LOCKED' }, available: { border: 'border-[#3D3328]', bg: '', label: 'AVAILABLE' },
  in_progress: { border: 'border-[#D4A943]', bg: '', label: 'IN PROGRESS' }, completed: { border: 'border-emerald-700', bg: '', label: 'COMPLETED' },
};

function getQuestStatus(quest: Quest, state: PlayerState): QuestStatus {
  const progress = state.quests[quest.id]; if (progress) return progress.status;
  const met = quest.prerequisites.every(req => {
    switch (req.type) { case 'skill_level': return req.skillId ? state.skills[req.skillId]?.level >= req.quantity : false;
      case 'quest': return req.questId ? state.quests[req.questId]?.status === 'completed' : false;
      case 'item': return req.itemId ? (state.inventory.find(i => i.itemId === req.itemId)?.quantity || 0) >= req.quantity : false;
      case 'gp': return state.gp >= req.quantity; case 'kill_count': return req.actionId ? (state.killCount[req.actionId] || 0) >= req.quantity : false;
      case 'craft_count': return req.actionId ? (state.totalActions[req.actionId] || 0) >= req.quantity : false; default: return false; }
  }); return met ? 'available' : 'locked';
}
function formatRequirement(req: QuestRequirement): string {
  switch (req.type) { case 'skill_level': return `${req.skillId ? req.skillId.charAt(0).toUpperCase() + req.skillId.slice(1) : 'Skill'} Level ${req.quantity}`;
    case 'quest': return `Complete "${QUESTS.find(q => q.id === req.questId)?.name || req.questId}"`;
    case 'item': return `${req.quantity}x ${req.itemId ? ITEMS[req.itemId]?.name || req.itemId : ''}`;
    case 'gp': return `${req.quantity.toLocaleString()} GP`; case 'kill_count': return `Kill ${req.quantity}x ${req.actionId || 'enemies'}`;
    case 'craft_count': return `Craft ${req.quantity}x ${req.actionId || 'items'}`; default: return 'Unknown'; }
}
function formatReward(reward: QuestReward): string {
  switch (reward.type) { case 'xp': return `${reward.quantity.toLocaleString()} ${reward.skillId ? reward.skillId.charAt(0).toUpperCase() + reward.skillId.slice(1) : ''} XP`;
    case 'item': return `${reward.quantity}x ${reward.itemId ? ITEMS[reward.itemId]?.name || reward.itemId : ''}`;
    case 'gp': return `${reward.quantity.toLocaleString()} GP`; case 'celestial_essence': return `${reward.quantity} Celestial Essence`;
    case 'unlock_action': return `Unlock: ${reward.actionId || 'new action'}`; case 'unlock_area': return `Unlock: ${reward.actionId || 'new area'}`; default: return 'Unknown'; }
}
function getObjectiveProgress(quest: Quest, objective: QuestObjective, state: PlayerState): number {
  const progress = state.quests[quest.id]; if (progress?.objectiveProgress[objective.id] !== undefined) return progress.objectiveProgress[objective.id];
  switch (objective.type) { case 'gather': return objective.itemId ? (state.totalItemsGained[objective.itemId] || 0) : 0;
    case 'reach_level': return objective.skillId ? (state.skills[objective.skillId]?.level || 1) : 0;
    case 'kill': return objective.actionId ? (state.killCount[objective.actionId] || 0) : 0;
    case 'craft': return objective.actionId ? (state.totalActions[objective.actionId] || 0) : 0;
    case 'earn_gp': return state.gp; default: return 0; }
}

export function QuestView({ state, startQuest }: QuestViewProps) {
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('all');
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);
  const completedCount = useMemo(() => Object.values(state.quests).filter(q => q.status === 'completed').length, [state.quests]);
  const questsWithStatus = useMemo(() => QUESTS.map(quest => ({ quest, status: getQuestStatus(quest, state) })), [state]);
  const filtered = useMemo(() => {
    const list = category === 'all' ? questsWithStatus : questsWithStatus.filter(q => q.quest.category === category);
    const order: Record<QuestStatus, number> = { in_progress: 0, available: 1, locked: 2, completed: 3 };
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }, [questsWithStatus, category]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#3D3328] pb-6 gap-6">
        <div>
          <h2 className="text-5xl font-bold tracking-tight capitalize" style={{ fontFamily: "'Cinzel', serif" }}>Quest Journal</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{completedCount} / {QUESTS.length} COMPLETED</div>
            <div className="h-1 w-1 bg-[#3D3328] rounded-full" />
            <div className="text-xs text-[#D4A943] font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{Object.values(state.quests).filter(q => q.status === 'in_progress').length} ACTIVE</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { playButtonPress(); setCategory(cat); }}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-lg ${
                category === cat ? 'bg-[#D4A943] text-[#1A1510] font-bold shadow-[0_3px_0_0_#8A6E1E]'
                : 'bg-[#1E1A16] border border-[#3D3328] shadow-[0_2px_0_0_#0D0B09] hover:text-[#E8E0D4]'
              }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{cat}</button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(({ quest, status }) => {
            const style = STATUS_STYLES[status]; const isExpanded = expandedQuest === quest.id;
            return (
              <motion.div key={quest.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className={`card border ${style.border} ${style.bg} transition-all overflow-hidden`}>
                <button onClick={() => { playButtonPress(); setExpandedQuest(isExpanded ? null : quest.id); }}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#2A2520]/50 transition-all rounded-t-[10px]">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{quest.icon}</div>
                    <div>
                      <div className="flex items-center gap-3"><span className="font-bold text-lg">{quest.name}</span>
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest rounded-md ${DIFFICULTY_COLORS[quest.difficulty]}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{quest.difficulty}</span></div>
                      <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{quest.category} — {style.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {status === 'completed' && <span className="text-emerald-400 text-lg">✓</span>}
                    {status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-[#D4A943] animate-pulse" />}
                    <span className="text-[10px] text-[#7A6E60]">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-4 border-t border-[#3D3328] pt-4">
                        <p className="text-sm leading-relaxed text-[#B8A890]">{quest.description}</p>
                        {quest.flavorText && <p className="text-xs italic text-[#7A6E60]">"{quest.flavorText}"</p>}
                        {status === 'locked' && quest.prerequisites.length > 0 && (
                          <div className="space-y-2"><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Prerequisites</div>
                            <div className="space-y-1">{quest.prerequisites.map((req, i) => {
                              const met = (() => { switch (req.type) { case 'skill_level': return req.skillId ? state.skills[req.skillId]?.level >= req.quantity : false;
                                case 'quest': return req.questId ? state.quests[req.questId]?.status === 'completed' : false;
                                case 'item': return req.itemId ? (state.inventory.find(it => it.itemId === req.itemId)?.quantity || 0) >= req.quantity : false;
                                case 'gp': return state.gp >= req.quantity; default: return false; } })();
                              return <div key={i} className={`text-xs flex items-center gap-2 ${met ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}><span>{met ? '✓' : '✗'}</span><span>{formatRequirement(req)}</span></div>;
                            })}</div></div>
                        )}
                        <div className="space-y-2"><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Objectives</div>
                          <div className="space-y-2">{quest.objectives.map(obj => {
                            const current = Math.min(getObjectiveProgress(quest, obj, state), obj.target); const pct = Math.min((current / obj.target) * 100, 100); const done = current >= obj.target;
                            return (<div key={obj.id} className="space-y-1">
                              <div className="flex items-center justify-between"><span className={`text-xs ${done ? 'text-emerald-400 line-through' : ''}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{obj.description}</span>
                                <span className="text-[10px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{current.toLocaleString()} / {obj.target.toLocaleString()}</span></div>
                              <div className="progress-bar" style={{ height: '6px' }}><div className={`h-full rounded-[10px] transition-all duration-500 ${done ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-gradient-to-r from-[#C17F4E] to-[#D4A943]' : 'bg-[#3D3328]'}`} style={{ width: `${pct}%` }} /></div>
                            </div>);
                          })}</div></div>
                        <div className="space-y-2"><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Rewards</div>
                          <div className="flex flex-wrap gap-2">{quest.rewards.map((reward, i) => (<span key={i} className="px-2 py-1 text-[10px] uppercase tracking-widest border border-[#3D3328] bg-[#0D0B09] rounded-md" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatReward(reward)}</span>))}</div></div>
                        <div className="pt-2">
                          {status === 'available' && <button onClick={() => { playQuestStart(); startQuest(quest.id); }} className="keycap keycap-gold text-[10px] uppercase tracking-widest px-6 py-2.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Start Quest</button>}
                          {status === 'in_progress' && <div className="flex items-center gap-2 text-[#D4A943]"><span className="w-2 h-2 rounded-full bg-[#D4A943] animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>In Progress</span></div>}
                          {status === 'completed' && <div className="flex items-center gap-2 text-emerald-400"><span>✓</span><span className="text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Completed</span>{state.quests[quest.id]?.completedAt && <span className="text-[10px] text-[#7A6E60] ml-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{new Date(state.quests[quest.id].completedAt!).toLocaleDateString()}</span>}</div>}
                          {status === 'locked' && <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Complete prerequisites to unlock</div>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && <div className="text-center py-16 text-[#7A6E60]"><div className="text-4xl mb-4">📜</div><div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>No quests in this category</div></div>}
      </div>
    </div>
  );
}
