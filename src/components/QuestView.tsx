import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerState, Quest, QuestStatus, QuestObjective, QuestReward, QuestRequirement } from '../types';
import { QUESTS, ITEMS } from '../constants';

interface QuestViewProps {
  state: PlayerState;
  startQuest: (questId: string) => void;
}

const CATEGORIES = ['all', 'combat', 'gathering', 'artisan', 'exploration', 'special'] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  novice: 'bg-green-700 text-green-50',
  intermediate: 'bg-blue-700 text-blue-50',
  experienced: 'bg-amber-700 text-amber-50',
  master: 'bg-red-700 text-red-50',
  grandmaster: 'bg-purple-700 text-purple-50',
};

const STATUS_STYLES: Record<QuestStatus, { border: string; bg: string; label: string }> = {
  locked: { border: 'border-[#141414]/20', bg: 'opacity-50', label: 'LOCKED' },
  available: { border: 'border-[#141414]', bg: '', label: 'AVAILABLE' },
  in_progress: { border: 'border-amber-600', bg: '', label: 'IN PROGRESS' },
  completed: { border: 'border-green-700', bg: '', label: 'COMPLETED' },
};

function getQuestStatus(quest: Quest, state: PlayerState): QuestStatus {
  const progress = state.quests[quest.id];
  if (progress) return progress.status;
  // Check prerequisites
  const met = quest.prerequisites.every(req => {
    switch (req.type) {
      case 'skill_level':
        return req.skillId ? state.skills[req.skillId]?.level >= req.quantity : false;
      case 'quest':
        return req.questId ? state.quests[req.questId]?.status === 'completed' : false;
      case 'item':
        return req.itemId ? (state.inventory.find(i => i.itemId === req.itemId)?.quantity || 0) >= req.quantity : false;
      case 'gp':
        return state.gp >= req.quantity;
      case 'kill_count':
        return req.actionId ? (state.killCount[req.actionId] || 0) >= req.quantity : false;
      case 'craft_count':
        return req.actionId ? (state.totalActions[req.actionId] || 0) >= req.quantity : false;
      default:
        return false;
    }
  });
  return met ? 'available' : 'locked';
}

function formatRequirement(req: QuestRequirement): string {
  switch (req.type) {
    case 'skill_level':
      return `${req.skillId ? req.skillId.charAt(0).toUpperCase() + req.skillId.slice(1) : 'Skill'} Level ${req.quantity}`;
    case 'quest':
      const q = QUESTS.find(quest => quest.id === req.questId);
      return `Complete "${q?.name || req.questId}"`;
    case 'item':
      const item = req.itemId ? ITEMS[req.itemId] : null;
      return `${req.quantity}x ${item?.name || req.itemId}`;
    case 'gp':
      return `${req.quantity.toLocaleString()} GP`;
    case 'kill_count':
      return `Kill ${req.quantity}x ${req.actionId || 'enemies'}`;
    case 'craft_count':
      return `Craft ${req.quantity}x ${req.actionId || 'items'}`;
    default:
      return 'Unknown requirement';
  }
}

function formatReward(reward: QuestReward): string {
  switch (reward.type) {
    case 'xp':
      return `${reward.quantity.toLocaleString()} ${reward.skillId ? reward.skillId.charAt(0).toUpperCase() + reward.skillId.slice(1) : ''} XP`;
    case 'item':
      const item = reward.itemId ? ITEMS[reward.itemId] : null;
      return `${reward.quantity}x ${item?.name || reward.itemId}`;
    case 'gp':
      return `${reward.quantity.toLocaleString()} GP`;
    case 'celestial_essence':
      return `${reward.quantity} Celestial Essence`;
    case 'unlock_action':
      return `Unlock: ${reward.actionId || 'new action'}`;
    case 'unlock_area':
      return `Unlock: ${reward.actionId || 'new area'}`;
    default:
      return 'Unknown reward';
  }
}

function getObjectiveProgress(quest: Quest, objective: QuestObjective, state: PlayerState): number {
  const progress = state.quests[quest.id];
  if (progress?.objectiveProgress[objective.id] !== undefined) {
    return progress.objectiveProgress[objective.id];
  }
  // Derive from state for display even if quest not started
  switch (objective.type) {
    case 'gather':
      return objective.itemId ? (state.totalItemsGained[objective.itemId] || 0) : 0;
    case 'reach_level':
      return objective.skillId ? (state.skills[objective.skillId]?.level || 1) : 0;
    case 'kill':
      return objective.actionId ? (state.killCount[objective.actionId] || 0) : 0;
    case 'craft':
      return objective.actionId ? (state.totalActions[objective.actionId] || 0) : 0;
    case 'earn_gp':
      return state.gp;
    default:
      return 0;
  }
}

export function QuestView({ state, startQuest }: QuestViewProps) {
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('all');
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);

  const completedCount = useMemo(
    () => Object.values(state.quests).filter(q => q.status === 'completed').length,
    [state.quests]
  );

  const questsWithStatus = useMemo(() => {
    return QUESTS.map(quest => ({
      quest,
      status: getQuestStatus(quest, state),
    }));
  }, [state]);

  const filtered = useMemo(() => {
    const list = category === 'all'
      ? questsWithStatus
      : questsWithStatus.filter(q => q.quest.category === category);
    // Sort: in_progress first, then available, then locked, then completed
    const order: Record<QuestStatus, number> = { in_progress: 0, available: 1, locked: 2, completed: 3 };
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }, [questsWithStatus, category]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#141414] pb-6 gap-6">
        <div>
          <h2 className="text-5xl font-serif italic font-bold tracking-tight capitalize">Quest Journal</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs font-mono opacity-50 uppercase tracking-widest">
              {completedCount} / {QUESTS.length} COMPLETED
            </div>
            <div className="h-1 w-1 bg-[#141414]/20 rounded-full" />
            <div className="text-xs font-mono text-amber-700 font-bold uppercase tracking-widest">
              {Object.values(state.quests).filter(q => q.status === 'in_progress').length} ACTIVE
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all border ${
                category === cat
                  ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]'
                  : 'border-[#141414]/20 hover:border-[#141414]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(({ quest, status }) => {
            const style = STATUS_STYLES[status];
            const isExpanded = expandedQuest === quest.id;

            return (
              <motion.div
                key={quest.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className={`border ${style.border} ${style.bg} transition-all`}
              >
                {/* Card Header */}
                <button
                  onClick={() => setExpandedQuest(isExpanded ? null : quest.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-[#141414]/[0.03] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{quest.icon}</div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif italic font-bold text-lg">{quest.name}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${DIFFICULTY_COLORS[quest.difficulty]}`}>
                          {quest.difficulty}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-0.5">
                        {quest.category} — {style.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {status === 'completed' && (
                      <span className="text-green-700 text-lg">✓</span>
                    )}
                    {status === 'in_progress' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    <span className="text-[10px] font-mono opacity-30">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-[#141414]/10 pt-4">
                        {/* Description */}
                        <p className="text-sm leading-relaxed">{quest.description}</p>
                        {quest.flavorText && (
                          <p className="text-xs italic opacity-40 font-serif">"{quest.flavorText}"</p>
                        )}

                        {/* Locked: show prerequisites */}
                        {status === 'locked' && quest.prerequisites.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Prerequisites</div>
                            <div className="space-y-1">
                              {quest.prerequisites.map((req, i) => {
                                const met = (() => {
                                  switch (req.type) {
                                    case 'skill_level':
                                      return req.skillId ? state.skills[req.skillId]?.level >= req.quantity : false;
                                    case 'quest':
                                      return req.questId ? state.quests[req.questId]?.status === 'completed' : false;
                                    case 'item':
                                      return req.itemId ? (state.inventory.find(it => it.itemId === req.itemId)?.quantity || 0) >= req.quantity : false;
                                    case 'gp':
                                      return state.gp >= req.quantity;
                                    default:
                                      return false;
                                  }
                                })();
                                return (
                                  <div key={i} className={`text-xs font-mono flex items-center gap-2 ${met ? 'text-green-700' : 'text-red-700'}`}>
                                    <span>{met ? '✓' : '✗'}</span>
                                    <span>{formatRequirement(req)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Objectives */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Objectives</div>
                          <div className="space-y-2">
                            {quest.objectives.map(obj => {
                              const current = Math.min(
                                getObjectiveProgress(quest, obj, state),
                                obj.target
                              );
                              const pct = Math.min((current / obj.target) * 100, 100);
                              const done = current >= obj.target;

                              return (
                                <div key={obj.id} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-mono ${done ? 'text-green-700 line-through' : ''}`}>
                                      {obj.description}
                                    </span>
                                    <span className="text-[10px] font-mono opacity-50">
                                      {current.toLocaleString()} / {obj.target.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#141414]/10 overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-500 ${done ? 'bg-green-700' : status === 'in_progress' ? 'bg-amber-600' : 'bg-[#141414]/30'}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Rewards */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-mono uppercase tracking-widest opacity-50">Rewards</div>
                          <div className="flex flex-wrap gap-2">
                            {quest.rewards.map((reward, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-[#141414]/20 bg-[#141414]/[0.03]"
                              >
                                {formatReward(reward)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                          {status === 'available' && (
                            <button
                              onClick={() => startQuest(quest.id)}
                              className="px-6 py-2.5 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest hover:bg-[#141414]/80 transition-all"
                            >
                              Start Quest
                            </button>
                          )}
                          {status === 'in_progress' && (
                            <div className="flex items-center gap-2 text-amber-700">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">In Progress</span>
                            </div>
                          )}
                          {status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-700">
                              <span className="text-sm">✓</span>
                              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Completed</span>
                              {state.quests[quest.id]?.completedAt && (
                                <span className="text-[10px] font-mono opacity-40 ml-2">
                                  {new Date(state.quests[quest.id].completedAt!).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                          {status === 'locked' && (
                            <div className="text-[10px] font-mono uppercase tracking-widest opacity-30">
                              Complete prerequisites to unlock
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-16 opacity-30">
            <div className="text-4xl mb-4">📜</div>
            <div className="text-[10px] font-mono uppercase tracking-widest">No quests in this category</div>
          </div>
        )}
      </div>
    </div>
  );
}
