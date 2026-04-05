import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, SkillId, SkillAction, InventoryItem, Equipment, Item, QuestProgress, Quest, QuestObjective, BountyContract, BountyTier } from './types';
import { ACTIONS, ITEMS, LEVEL_XP, XP_TO_LEVEL, KINGDOM_WORKERS, RARE_DROP_TABLE, MONSTER_DROP_TABLES, QUESTS, SKILL_PETS, PET_BASE_CHANCE, CLUE_REWARDS } from './constants';

const INITIAL_STATE: PlayerState = {
  gp: 0,
  celestialEssence: 0,
  skills: {
    mining: { id: 'mining', level: 1, xp: 0 },
    woodcutting: { id: 'woodcutting', level: 1, xp: 0 },
    fishing: { id: 'fishing', level: 1, xp: 0 },
    hunting: { id: 'hunting', level: 1, xp: 0 },
    farming: { id: 'farming', level: 1, xp: 0 },
    smithing: { id: 'smithing', level: 1, xp: 0 },
    cooking: { id: 'cooking', level: 1, xp: 0 },
    herblore: { id: 'herblore', level: 1, xp: 0 },
    crafting: { id: 'crafting', level: 1, xp: 0 },
    runecrafting: { id: 'runecrafting', level: 1, xp: 0 },
    thieving: { id: 'thieving', level: 1, xp: 0 },
    agility: { id: 'agility', level: 1, xp: 0 },
    attack: { id: 'attack', level: 1, xp: 0 },
    strength: { id: 'strength', level: 1, xp: 0 },
    defense: { id: 'defense', level: 1, xp: 0 },
    magic: { id: 'magic', level: 1, xp: 0 },
    ranged: { id: 'ranged', level: 1, xp: 0 },
    prayer: { id: 'prayer', level: 1, xp: 0 },
    empire: { id: 'empire', level: 1, xp: 0 },
    raids: { id: 'raids', level: 1, xp: 0 },
    slayer: { id: 'slayer', level: 1, xp: 0 },
    construction: { id: 'construction', level: 1, xp: 0 },
  },
  inventory: [],
  equipment: {},
  activeEdicts: [],
  ascensions: {
    mining: 0, woodcutting: 0, fishing: 0, hunting: 0, farming: 0,
    smithing: 0, cooking: 0, herblore: 0, crafting: 0, runecrafting: 0, thieving: 0,
    agility: 0, attack: 0, strength: 0, defense: 0, magic: 0, ranged: 0, prayer: 0,
    empire: 0, raids: 0, slayer: 0, construction: 0
  },
  buffs: [],
  kingdom: {},
  showNotifications: true,
  // New systems
  quests: {},
  collectionLog: [],
  totalActions: {},
  totalItemsGained: {},
  bankTab: 'all',
  killCount: {},
  // Bounty Hunting
  bountyContract: undefined,
  bountyStreak: 0,
  bountyMarks: 0,
  totalBountiesCompleted: 0,
  // Gem Socketing
  socketedGems: {},
  // Dry streak
  dryStreak: 0,
  // Pets
  activePet: undefined,
  petsUnlocked: [],
  // Auto-sell
  autoSellItems: [],
  // Prestige
  prestigeLevel: 0,
  prestigeTokens: 0,
};

export interface GameEvent {
  id: string;
  timestamp: number;
  message: string;
  type: 'loot' | 'level' | 'xp' | 'info' | 'quest';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'celestial';
  icon?: string;
}

const calculateLuck = (equipment: Equipment, socketedGems?: Record<string, string[]>, activeEdicts?: string[]) => {
  let luck = 0;
  Object.values(equipment).forEach(itemId => {
    if (itemId) {
      const item = ITEMS[itemId];
      if (item?.stats?.luck) luck += item.stats.luck;
    }
  });
  if (socketedGems) {
    const gemBonuses = calculateGemBonuses(socketedGems);
    luck += gemBonuses.luck || 0;
  }
  // Relic: Fortune Star — +50% luck
  if (activeEdicts?.includes('relic_fortune_star')) {
    luck = Math.floor(luck * 1.5);
  }
  return luck;
};

const calculateSetBonuses = (equipment: Equipment) => {
  const setCounts: Record<string, number> = {};
  const bonuses: Partial<Item['stats']> = {};

  Object.values(equipment).forEach(itemId => {
    if (itemId) {
      const item = ITEMS[itemId];
      if (item?.setBonus) {
        setCounts[item.setBonus.setId] = (setCounts[item.setBonus.setId] || 0) + 1;
      }
    }
  });

  Object.values(equipment).forEach(itemId => {
    if (itemId) {
      const item = ITEMS[itemId];
      if (item?.setBonus && setCounts[item.setBonus.setId] >= item.setBonus.piecesRequired) {
        const setId = item.setBonus.setId;
        if (setCounts[setId] !== -1) {
          Object.entries(item.setBonus.bonus).forEach(([stat, value]) => {
            const s = stat as keyof Item['stats'];
            bonuses[s] = (bonuses[s] || 0) + (value as number);
          });
          setCounts[setId] = -1;
        }
      }
    }
  });

  return bonuses;
};

const calculateGemBonuses = (socketedGems: Record<string, string[]>): Partial<Item['stats']> => {
  const bonuses: Partial<Item['stats']> = {};
  Object.values(socketedGems).forEach(gems => {
    gems.forEach(gemId => {
      const gem = ITEMS[gemId];
      if (gem?.gemBonus) {
        Object.entries(gem.gemBonus).forEach(([stat, value]) => {
          const s = stat as keyof Item['stats'];
          bonuses[s] = (bonuses[s] || 0) + (value as number);
        });
      }
    });
  });
  return bonuses;
};

const calculateDuration = (action: SkillAction, skills: Record<SkillId, any>, equipment: Equipment, activeEdicts: string[], ascensions: Record<SkillId, number>, buffs: any[], inventory: InventoryItem[], socketedGems?: Record<string, string[]>) => {
  let actualDuration = action.duration;

  // Tool Bonus
  const bestTool = inventory
    .map(i => ITEMS[i.itemId])
    .filter(item => item?.type === 'tool' && item.toolBonus?.skillId === action.skill)
    .sort((a, b) => (b.toolBonus?.speedMultiplier || 1) - (a.toolBonus?.speedMultiplier || 1))[0];

  if (bestTool?.toolBonus) {
    actualDuration *= (1 / bestTool.toolBonus.speedMultiplier);
  }

  // Buffs
  buffs.forEach(buff => {
    if (buff.type === 'speed') {
      actualDuration *= (1 / buff.multiplier);
    }
    if (buff.type === 'combat' && action.isMonster) {
      actualDuration *= (1 / buff.multiplier);
    }
  });

  // Global Edict Efficiency
  if (activeEdicts.includes('edict_efficiency')) {
    actualDuration *= 0.9;
  }

  // Relic: Heart of the Empire
  if (action.skill === 'empire' && activeEdicts.includes('relic_empire_heart')) {
    actualDuration *= 0.5;
  }

  // Relic: Iron Will — combat 25% faster
  if (action.isMonster && activeEdicts.includes('relic_iron_will')) {
    actualDuration *= 0.75;
  }

  // Relic: Gatherer's Grace — gathering 30% faster
  const gatheringSkills: SkillId[] = ['mining', 'woodcutting', 'fishing', 'hunting', 'farming'];
  if (gatheringSkills.includes(action.skill) && activeEdicts.includes('relic_gatherers_grace')) {
    actualDuration *= 0.7;
  }

  // Ascension Bonus
  const ascensionCount = ascensions[action.skill] || 0;
  const ascensionMultiplier = activeEdicts.includes('relic_timeless_mastery') ? 0.10 : 0.05;
  actualDuration *= (1 - ascensionCount * ascensionMultiplier);

  if (action.isMonster) {
    // Relic: Void Blade (10% chance to execute)
    if (activeEdicts.includes('relic_void_blade') && Math.random() < 0.1) {
      return 100;
    }

    let combatLevel = 1;

    if (['attack', 'strength', 'defense'].includes(action.skill)) {
      combatLevel = (skills.attack.level + skills.strength.level + skills.defense.level) / 3;
    } else if (action.skill === 'magic') {
      combatLevel = skills.magic.level;
    } else if (action.skill === 'ranged') {
      combatLevel = skills.ranged.level;
    }

    // Equipment Stats
    let equipmentBonus = 0;
    Object.values(equipment).forEach((itemId: string | undefined) => {
      if (itemId) {
        const item = ITEMS[itemId];
        if (item?.stats) {
          if (['attack', 'strength', 'defense'].includes(action.skill)) {
            equipmentBonus += (item.stats.attack || 0) + (item.stats.strength || 0);
          } else if (action.skill === 'magic') {
            equipmentBonus += item.stats.magic || 0;
          } else if (action.skill === 'ranged') {
            equipmentBonus += item.stats.ranged || 0;
          }
        }
      }
    });

    // Gem Bonuses
    if (socketedGems) {
      const gemBonuses = calculateGemBonuses(socketedGems);
      if (['attack', 'strength', 'defense'].includes(action.skill)) {
        equipmentBonus += (gemBonuses.attack || 0) + (gemBonuses.strength || 0);
      } else if (action.skill === 'magic') {
        equipmentBonus += gemBonuses.magic || 0;
      } else if (action.skill === 'ranged') {
        equipmentBonus += gemBonuses.ranged || 0;
      }
    }

    actualDuration = actualDuration / (1 + (combatLevel - 1) * 0.05 + equipmentBonus * 0.01);

    // Weakness bonus
    if (action.weakness && action.skill === action.weakness) {
      actualDuration *= 0.7;
    }

    // Martial Law Edict
    if (activeEdicts.includes('edict_martial_law')) {
      actualDuration *= 0.85;
    }
  }

  // Set Bonus
  const setBonuses = calculateSetBonuses(equipment);
  if (setBonuses.speed) {
    actualDuration /= (1 + setBonuses.speed);
  }

  return Math.max(100, actualDuration);
};

// Quest helper: check if quest prerequisites are met
const checkQuestPrerequisites = (quest: Quest, state: PlayerState): boolean => {
  return quest.prerequisites.every(req => {
    switch (req.type) {
      case 'skill_level':
        return req.skillId ? state.skills[req.skillId].level >= req.quantity : false;
      case 'item':
        return req.itemId ? (state.inventory.find(i => i.itemId === req.itemId)?.quantity || 0) >= req.quantity : false;
      case 'quest':
        return req.questId ? state.quests[req.questId]?.status === 'completed' : false;
      case 'gp':
        return state.gp >= req.quantity;
      case 'kill_count':
        return req.actionId ? (state.killCount[req.actionId] || 0) >= req.quantity : false;
      default:
        return true;
    }
  });
};

// Check if a quest objective is complete
const checkObjectiveProgress = (obj: QuestObjective, state: PlayerState, questProgress: QuestProgress): boolean => {
  const current = questProgress.objectiveProgress[obj.id] || 0;
  return current >= obj.target;
};

export function useGame() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [state, setState] = useState<PlayerState>(() => {
    const saved = localStorage.getItem('chimera_save');
    if (!saved) return INITIAL_STATE;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATE,
        ...parsed,
        skills: { ...INITIAL_STATE.skills, ...parsed.skills },
        ascensions: { ...INITIAL_STATE.ascensions, ...parsed.ascensions },
        equipment: { ...INITIAL_STATE.equipment, ...parsed.equipment },
        buffs: parsed.buffs || [],
        kingdom: parsed.kingdom || {},
        // Merge new systems
        quests: parsed.quests || {},
        collectionLog: parsed.collectionLog || [],
        totalActions: parsed.totalActions || {},
        totalItemsGained: parsed.totalItemsGained || {},
        bankTab: parsed.bankTab || 'all',
        killCount: parsed.killCount || {},
        // Bounty Hunting
        bountyContract: parsed.bountyContract || undefined,
        bountyStreak: parsed.bountyStreak || 0,
        bountyMarks: parsed.bountyMarks || 0,
        totalBountiesCompleted: parsed.totalBountiesCompleted || 0,
        socketedGems: parsed.socketedGems || {},
        dryStreak: parsed.dryStreak || 0,
        activePet: parsed.activePet || undefined,
        petsUnlocked: parsed.petsUnlocked || [],
        autoSellItems: parsed.autoSellItems || [],
        prestigeLevel: parsed.prestigeLevel || 0,
        prestigeTokens: parsed.prestigeTokens || 0,
      };
    } catch (e) {
      return INITIAL_STATE;
    }
  });

  const addEvent = useCallback((message: string, type: GameEvent['type'] = 'info', icon?: string, rarity?: GameEvent['rarity']) => {
    const displayMessage = icon ? `${icon} ${message}` : message;
    setEvents(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message: displayMessage,
      type,
      rarity
    }, ...prev].slice(0, 20));
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Offline progress calculation — computed once on mount, applied to state
  const [offlineGains, setOfflineGains] = useState<{ xp: number; gp: number; actions: number; duration: string; skillId: string } | null>(null);
  const offlineAppliedRef = useRef(false);

  useEffect(() => {
    if (offlineAppliedRef.current) return;
    offlineAppliedRef.current = true;

    const saved = localStorage.getItem('chimera_save');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const lastSave = parsed._lastSaveTime;
      if (!lastSave || !parsed.activeAction) return;

      const elapsed = Date.now() - lastSave;
      if (elapsed < 60000) return; // less than 1 minute, skip

      const action = ACTIONS.find(a => a.id === parsed.activeAction?.actionId);
      if (!action) return;

      const duration = parsed.activeAction.actualDuration || action.duration;
      const completedActions = Math.min(Math.floor(elapsed / duration), 500); // cap at 500
      if (completedActions < 1) return;

      const totalXp = completedActions * action.xpReward;
      let totalGp = 0;
      action.outputs.forEach(o => {
        if (o.itemId === 'gp' && o.chance >= 0.5) {
          totalGp += o.quantity * completedActions;
        }
      });

      // Apply gains to state
      setState(prev => {
        const skill = prev.skills[action.skill];
        const newXp = skill.xp + totalXp;
        const newLevel = XP_TO_LEVEL(newXp);
        return {
          ...prev,
          gp: prev.gp + totalGp,
          skills: {
            ...prev.skills,
            [action.skill]: { ...skill, xp: newXp, level: newLevel },
          },
        };
      });

      const mins = Math.floor(elapsed / 60000);
      const hrs = Math.floor(mins / 60);
      const durationStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;

      setOfflineGains({ xp: totalXp, gp: totalGp, actions: completedActions, duration: durationStr, skillId: action.skill });
    } catch { /* invalid save */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('chimera_save', JSON.stringify({ ...state, _lastSaveTime: Date.now() }));
  }, [state]);

  // Track item in collection log
  const trackCollectionLog = useCallback((itemId: string) => {
    setState(prev => {
      if (prev.collectionLog.includes(itemId)) return prev;
      return { ...prev, collectionLog: [...prev.collectionLog, itemId] };
    });
  }, []);

  const addToInventory = useCallback((itemId: string, quantity: number) => {
    const item = ITEMS[itemId];
    if (!item) return;

    // Auto-sell check: if item is in auto-sell list and not rare+, sell immediately
    if (stateRef.current.autoSellItems.includes(itemId) && (!item.rarity || item.rarity === 'common' || item.rarity === 'uncommon')) {
      const gpValue = item.value * quantity;
      addEvent(`Auto-sold ${quantity}x ${item.name} for ${gpValue} GP`, 'loot', '💰');
      setState(prev => ({ ...prev, gp: prev.gp + gpValue, totalItemsGained: { ...prev.totalItemsGained, [itemId]: (prev.totalItemsGained[itemId] || 0) + quantity } }));
      trackCollectionLog(itemId);
      return;
    }

    if (item.rarity === 'celestial') {
      addEvent(`CELESTIAL DROP: ${quantity}x ${item.name}`, 'loot', '🌌', 'celestial');
    } else if (item.rarity === 'legendary') {
      addEvent(`LEGENDARY DROP: ${quantity}x ${item.name}`, 'loot', '🔥', 'legendary');
    } else if (item.rarity === 'epic') {
      addEvent(`EPIC DROP: ${quantity}x ${item.name}`, 'loot', '🟣', 'epic');
    } else if (item.rarity === 'rare') {
      addEvent(`Rare drop: ${quantity}x ${item.name}`, 'loot', '🔷', 'rare');
    } else {
      addEvent(`Gained ${quantity}x ${item.name}`, 'loot', item.icon, item.rarity);
    }
    // Track in collection log
    trackCollectionLog(itemId);

    setState(prev => {
      const existing = prev.inventory.find(i => i.itemId === itemId);
      // Track lifetime totals
      const newTotalItems = { ...prev.totalItemsGained, [itemId]: (prev.totalItemsGained[itemId] || 0) + quantity };

      if (existing) {
        return {
          ...prev,
          totalItemsGained: newTotalItems,
          inventory: prev.inventory.map(i =>
            i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
          )
        };
      }
      return {
        ...prev,
        totalItemsGained: newTotalItems,
        inventory: [...prev.inventory, { itemId, quantity }]
      };
    });
  }, [addEvent, trackCollectionLog]);

  const salvageItem = useCallback((itemId: string, quantity: number) => {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'equipment') return;

    setState(prev => {
      const existing = prev.inventory.find(i => i.itemId === itemId);
      if (!existing || existing.quantity < quantity) return prev;

      let essenceAmount = 0;
      switch (item.rarity) {
        case 'common': essenceAmount = 1 * quantity; break;
        case 'uncommon': essenceAmount = 5 * quantity; break;
        case 'rare': essenceAmount = 25 * quantity; break;
        case 'epic': essenceAmount = 100 * quantity; break;
        case 'legendary': essenceAmount = 500 * quantity; break;
        case 'celestial': essenceAmount = 2500 * quantity; break;
        default: essenceAmount = 1 * quantity;
      }

      addEvent(`Salvaged ${quantity}x ${item.name} for ${essenceAmount} Celestial Essence`, 'info', '♻️');

      return {
        ...prev,
        celestialEssence: prev.celestialEssence + essenceAmount,
        inventory: prev.inventory
          .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i)
          .filter(i => i.quantity > 0)
      };
    });
  }, [addEvent]);

  const removeFromInventory = useCallback((itemId: string, quantity: number) => {
    setState(prev => {
      const existing = prev.inventory.find(i => i.itemId === itemId);
      if (!existing || existing.quantity < quantity) return prev;

      const newInventory = prev.inventory
        .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i)
        .filter(i => i.quantity > 0);

      return { ...prev, inventory: newInventory };
    });
  }, []);

  const hasItems = useCallback((items: { itemId: string; quantity: number }[]) => {
    return items.every(req => {
      if (req.itemId === 'gp') return stateRef.current.gp >= req.quantity;
      if (req.itemId === 'celestial_essence') return stateRef.current.celestialEssence >= req.quantity;
      const inv = stateRef.current.inventory.find(i => i.itemId === req.itemId);
      return inv && inv.quantity >= req.quantity;
    });
  }, []);

  const startAction = useCallback((actionId: string) => {
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    const skill = stateRef.current.skills[action.skill];
    if (skill.level < action.levelRequired) {
      addEvent(`Level ${action.levelRequired} ${action.skill} required!`, 'info');
      return;
    }

    if (action.secondarySkillRequired) {
      const secSkill = stateRef.current.skills[action.secondarySkillRequired.skill];
      if (secSkill.level < action.secondarySkillRequired.level) {
        addEvent(`Level ${action.secondarySkillRequired.level} ${action.secondarySkillRequired.skill} required!`, 'info');
        return;
      }
    }

    // Check quest requirement
    if (action.questRequired) {
      const questProgress = stateRef.current.quests[action.questRequired];
      if (!questProgress || questProgress.status !== 'completed') {
        const quest = QUESTS.find(q => q.id === action.questRequired);
        addEvent(`Quest required: ${quest?.name || action.questRequired}!`, 'info');
        return;
      }
    }

    if (action.toolRequired) {
      const hasTool = stateRef.current.inventory.some(i => i.itemId === action.toolRequired);
      if (!hasTool) {
        addEvent(`Required tool missing: ${ITEMS[action.toolRequired!]?.name || action.toolRequired}`, 'info');
        return;
      }
    }

    if (action.inputs && !hasItems(action.inputs)) {
      addEvent(`Missing required materials!`, 'info');
      return;
    }

    const actualDuration = calculateDuration(action, stateRef.current.skills, stateRef.current.equipment, stateRef.current.activeEdicts, stateRef.current.ascensions, stateRef.current.buffs, stateRef.current.inventory, stateRef.current.socketedGems);

    setState(prev => ({
      ...prev,
      activeAction: {
        actionId,
        startTime: Date.now(),
        progress: 0,
        actualDuration
      }
    }));
  }, [hasItems, addEvent]);

  const stopAction = useCallback(() => {
    setState(prev => ({ ...prev, activeAction: undefined }));
  }, []);

  const addGp = useCallback((amount: number) => {
    setState(prev => {
      // Relic: Golden Touch — double positive GP gains
      let finalAmount = amount;
      if (amount > 0 && prev.activeEdicts.includes('relic_golden_touch')) {
        finalAmount = amount * 2;
      }
      if (finalAmount > 0) addEvent(`Gained ${finalAmount} GP`, 'loot', '💰');
      return { ...prev, gp: prev.gp + finalAmount };
    });
  }, [addEvent]);

  // Update quest progress based on game events
  const updateQuestProgress = useCallback((eventType: string, data: { actionId?: string; itemId?: string; skillId?: SkillId; quantity?: number }) => {
    setState(prev => {
      let changed = false;
      const newQuests = { ...prev.quests };

      // Check all in-progress quests
      (Object.values(newQuests) as QuestProgress[]).forEach(qp => {
        if (qp.status !== 'in_progress') return;
        const quest = QUESTS.find(q => q.id === qp.questId);
        if (!quest) return;

        quest.objectives.forEach(obj => {
          const currentProgress = qp.objectiveProgress[obj.id] || 0;
          if (currentProgress >= obj.target) return; // Already complete

          let increment = 0;

          if (eventType === 'action_complete' && obj.type === 'kill' && data.actionId === obj.actionId) {
            increment = 1;
          } else if (eventType === 'action_complete' && obj.type === 'craft' && data.actionId === obj.actionId) {
            increment = 1;
          } else if (eventType === 'item_gained' && obj.type === 'gather' && data.itemId === obj.itemId) {
            increment = data.quantity || 1;
          } else if (eventType === 'level_up' && obj.type === 'reach_level' && data.skillId === obj.skillId) {
            // Set to current level
            const skillLevel = prev.skills[data.skillId!]?.level || 0;
            if (skillLevel >= obj.target) {
              qp.objectiveProgress[obj.id] = obj.target;
              changed = true;
              return;
            }
          } else if (eventType === 'gp_gained' && obj.type === 'earn_gp') {
            increment = data.quantity || 0;
          }

          if (increment > 0) {
            qp.objectiveProgress[obj.id] = Math.min(obj.target, currentProgress + increment);
            changed = true;
          }
        });

        // Check if all objectives complete
        if (changed) {
          const allComplete = quest.objectives.every(obj =>
            (qp.objectiveProgress[obj.id] || 0) >= obj.target
          );
          if (allComplete && qp.status === 'in_progress') {
            qp.status = 'completed';
            qp.completedAt = Date.now();
            addEvent(`QUEST COMPLETE: ${quest.name}!`, 'quest', '🏆', 'legendary');

            // Grant rewards
            quest.rewards.forEach(reward => {
              switch (reward.type) {
                case 'xp':
                  if (reward.skillId) {
                    const skill = prev.skills[reward.skillId];
                    const newXp = skill.xp + reward.quantity;
                    const newLevel = XP_TO_LEVEL(newXp);
                    prev.skills[reward.skillId] = { ...skill, xp: newXp, level: newLevel };
                    addEvent(`Quest reward: ${reward.quantity} ${reward.skillId} XP`, 'xp', '⭐');
                  }
                  break;
                case 'gp':
                  prev.gp += reward.quantity;
                  addEvent(`Quest reward: ${reward.quantity} GP`, 'loot', '💰');
                  break;
                case 'celestial_essence':
                  prev.celestialEssence += reward.quantity;
                  addEvent(`Quest reward: ${reward.quantity} Celestial Essence`, 'loot', '✨');
                  break;
                case 'item':
                  if (reward.itemId) {
                    const existing = prev.inventory.find(i => i.itemId === reward.itemId);
                    if (existing) {
                      existing.quantity += reward.quantity;
                    } else {
                      prev.inventory.push({ itemId: reward.itemId, quantity: reward.quantity });
                    }
                    const rewardItem = ITEMS[reward.itemId];
                    addEvent(`Quest reward: ${reward.quantity}x ${rewardItem?.name || reward.itemId}`, 'loot', rewardItem?.icon);
                  }
                  break;
              }
            });
          }
        }
      });

      return changed ? { ...prev, quests: newQuests } : prev;
    });
  }, [addEvent]);

  const completeAction = useCallback((action: SkillAction) => {
    // Check inputs again
    if (action.inputs && !hasItems(action.inputs)) {
      addEvent(`Stopped: Out of materials!`, 'info');
      stopAction();
      return;
    }

    // Remove inputs
    if (action.inputs) {
      action.inputs.forEach(input => {
        if (input.itemId === 'gp') {
          setState(prev => ({ ...prev, gp: prev.gp - input.quantity }));
        } else if (input.itemId === 'celestial_essence') {
          setState(prev => ({ ...prev, celestialEssence: prev.celestialEssence - input.quantity }));
        } else {
          removeFromInventory(input.itemId, input.quantity);
        }
      });
    }

    // Add outputs
    const luck = calculateLuck(stateRef.current.equipment, stateRef.current.socketedGems, stateRef.current.activeEdicts);
    const luckMultiplier = 1 + (luck / 100);

    action.outputs.forEach(output => {
      const rolledChance = output.chance * luckMultiplier;
      if (Math.random() <= rolledChance) {
        let quantity = output.quantity;

        // Relic: Eye of the Storm (20% chance to double)
        if (stateRef.current.activeEdicts.includes('relic_storm_eye') && Math.random() < 0.2) {
          quantity *= 2;
          addEvent(`Eye of the Storm doubled your ${ITEMS[output.itemId]?.name || 'loot'}!`, 'loot');
        }

        if (output.itemId === 'gp') {
          if (stateRef.current.activeEdicts.includes('edict_prosperity')) {
            quantity = Math.floor(quantity * 1.2);
          }
          addGp(quantity);
          // Track GP for quests
          updateQuestProgress('gp_gained', { quantity });
        } else if (output.itemId === 'celestial_essence') {
          setState(prev => ({ ...prev, celestialEssence: prev.celestialEssence + quantity }));
          addEvent(`Gained ${quantity} Celestial Essence`, 'loot');
        } else {
          addToInventory(output.itemId, quantity);
          // Track items for quests
          updateQuestProgress('item_gained', { itemId: output.itemId, quantity });
        }
      }
    });

    // ===== UNIQUE MONSTER DROP TABLE =====
    // Each monster has signature drops that roll separately from RDT
    if (action.isMonster) {
      const monsterDrops = MONSTER_DROP_TABLES[action.id];
      if (monsterDrops) {
        monsterDrops.forEach(drop => {
          const adjustedChance = drop.chance * luckMultiplier;
          if (Math.random() <= adjustedChance) {
            let qty = drop.quantity;
            // Eye of the Storm can double these too
            if (stateRef.current.activeEdicts.includes('relic_storm_eye') && Math.random() < 0.2) {
              qty *= 2;
            }
            addToInventory(drop.itemId, qty);
            const dropItem = ITEMS[drop.itemId];
            if (dropItem && (dropItem.rarity === 'legendary' || dropItem.rarity === 'celestial' || dropItem.rarity === 'epic')) {
              addEvent(`UNIQUE DROP: ${qty}x ${dropItem.name}!`, 'loot', dropItem.icon, dropItem.rarity);
            }
          }
        });
      }
    }

    // Global Rare Drop Table (RDT) roll for monsters — with dry streak protection
    if (action.isMonster) {
      const currentDryStreak = stateRef.current.dryStreak;
      // After 40 kills (2x expected rate of 1/20), boost chance by 2% per kill over threshold
      const dryStreakBoost = currentDryStreak > 40 ? (currentDryStreak - 40) * 0.02 : 0;
      const rdtChance = Math.min(0.5, (0.05 + dryStreakBoost) * luckMultiplier);
      let gotRareDrop = false;

      if (Math.random() <= rdtChance) {
        const rdtRoll = Math.random();
        let cumulativeChance = 0;
        for (const rdtItem of RARE_DROP_TABLE) {
          cumulativeChance += rdtItem.chance;
          if (rdtRoll <= cumulativeChance) {
            if (rdtItem.itemId === 'gp') {
              const gpAmount = Math.floor(Math.random() * 5000) + 1000;
              addGp(gpAmount);
              addEvent(`RARE DROP TABLE: Hidden stash of ${gpAmount} GP!`, 'loot', '💰', 'rare');
            } else {
              addToInventory(rdtItem.itemId, 1);
              addEvent(`RARE DROP TABLE: ${ITEMS[rdtItem.itemId]?.name}!`, 'loot', ITEMS[rdtItem.itemId]?.icon, ITEMS[rdtItem.itemId]?.rarity);
            }
            gotRareDrop = true;
            break;
          }
        }
      }

      // Update dry streak counter
      setState(prev => ({
        ...prev,
        dryStreak: gotRareDrop ? 0 : prev.dryStreak + 1,
      }));
    }

    // ===== PET DROP ROLL =====
    const petId = SKILL_PETS[action.skill];
    if (petId && !stateRef.current.petsUnlocked.includes(petId)) {
      // Higher skill level slightly improves chance
      const levelBonus = stateRef.current.skills[action.skill].level * 0.0001;
      const petChance = PET_BASE_CHANCE + levelBonus;
      if (Math.random() <= petChance) {
        addToInventory(petId, 1);
        addEvent(`PET DROP: ${ITEMS[petId]?.name}! A new companion follows you!`, 'loot', ITEMS[petId]?.icon, 'celestial');
        setState(prev => ({
          ...prev,
          petsUnlocked: [...prev.petsUnlocked, petId],
          activePet: prev.activePet || petId, // auto-equip first pet
        }));
      }
    }

    // Track action completion for quests + kill counts + bounty contracts
    setState(prev => {
      let newBountyContract = prev.bountyContract;
      let newBountyStreak = prev.bountyStreak;
      let newBountyMarks = prev.bountyMarks;
      let newTotalBounties = prev.totalBountiesCompleted;
      let newSlayerSkills = { ...prev.skills };

      // Track bounty contract progress
      if (action.isMonster && newBountyContract && action.id === newBountyContract.monsterId) {
        newBountyContract = { ...newBountyContract, killsCompleted: newBountyContract.killsCompleted + 1 };

        if (newBountyContract.killsCompleted >= newBountyContract.killsRequired) {
          // Contract complete!
          const streakBonus = Math.floor(newBountyStreak * 0.1 * newBountyContract.bountyMarkReward);
          const totalMarks = newBountyContract.bountyMarkReward + streakBonus;
          newBountyMarks += totalMarks;
          newBountyStreak += 1;
          newTotalBounties += 1;

          // Bonus slayer XP
          const slayer = newSlayerSkills.slayer;
          const newXp = slayer.xp + newBountyContract.bonusXp;
          const newLevel = XP_TO_LEVEL(newXp);
          if (newLevel > slayer.level) {
            addEvent(`LEVEL UP! SLAYER is now level ${newLevel}!`, 'level');
          }
          newSlayerSkills = { ...newSlayerSkills, slayer: { ...slayer, xp: newXp, level: newLevel } };

          addEvent(`CONTRACT COMPLETE! +${totalMarks} Bounty Marks${streakBonus > 0 ? ` (${streakBonus} streak bonus)` : ''} | Streak: ${newBountyStreak}`, 'quest', '🏆', 'legendary');
          newBountyContract = undefined;
        }
      }

      return {
        ...prev,
        skills: newSlayerSkills,
        totalActions: { ...prev.totalActions, [action.id]: (prev.totalActions[action.id] || 0) + 1 },
        killCount: action.isMonster
          ? { ...prev.killCount, [action.id]: (prev.killCount[action.id] || 0) + 1 }
          : prev.killCount,
        bountyContract: newBountyContract,
        bountyStreak: newBountyStreak,
        bountyMarks: newBountyMarks,
        totalBountiesCompleted: newTotalBounties,
      };
    });

    // Update quest progress for action completion
    if (action.isMonster) {
      updateQuestProgress('action_complete', { actionId: action.id });
    } else {
      updateQuestProgress('action_complete', { actionId: action.id });
    }

    // Add XP
    setState(prev => {
      const skill = prev.skills[action.skill];
      let xpReward = action.xpReward;

      // Buffs
      prev.buffs.forEach(buff => {
        if (buff.type === 'xp') {
          xpReward = Math.floor(xpReward * buff.multiplier);
        }
      });

      // Edict: Wisdom
      if (prev.activeEdicts.includes('edict_wisdom')) {
        xpReward = Math.floor(xpReward * 1.15);
      }

      // Relic: Eternal Wisdom
      if (prev.activeEdicts.includes('relic_eternal_wisdom')) {
        xpReward = Math.floor(xpReward * 1.25);
      }

      // Prestige bonus: +5% XP per prestige level
      if (prev.prestigeLevel > 0) {
        xpReward = Math.floor(xpReward * (1 + prev.prestigeLevel * 0.05));
      }

      // Ascension Bonus (Timeless Mastery doubles it)
      const ascensionCount = prev.ascensions[action.skill] || 0;
      const ascXpMult = prev.activeEdicts.includes('relic_timeless_mastery') ? 0.10 : 0.05;
      xpReward = Math.floor(xpReward * (1 + ascensionCount * ascXpMult));

      // Tool XP Bonus
      const bestTool = prev.inventory
        .map(i => ITEMS[i.itemId])
        .filter(item => item?.type === 'tool' && item.toolBonus?.skillId === action.skill)
        .sort((a, b) => (b.toolBonus?.xpMultiplier || 1) - (a.toolBonus?.xpMultiplier || 1))[0];

      if (bestTool?.toolBonus) {
        xpReward = Math.floor(xpReward * bestTool.toolBonus.xpMultiplier);
      }

      const newXp = skill.xp + xpReward;
      const newLevel = XP_TO_LEVEL(newXp);

      if (newLevel > skill.level) {
        addEvent(`LEVEL UP! ${action.skill.toUpperCase()} is now level ${newLevel}!`, 'level');
        // Update quest progress for level ups
        updateQuestProgress('level_up', { skillId: action.skill });
      }

      const nextSkills = {
        ...prev.skills,
        [action.skill]: { ...skill, xp: newXp, level: newLevel }
      };

      const nextBuffs = prev.buffs.map(b => ({ ...b, remainingActions: b.remainingActions - 1 })).filter(b => b.remainingActions > 0);
      if (nextBuffs.length < prev.buffs.length) {
        addEvent(`A buff has expired!`, 'info');
      }

      const nextDuration = calculateDuration(action, nextSkills, prev.equipment, prev.activeEdicts, prev.ascensions, nextBuffs, prev.inventory, prev.socketedGems);

      return {
        ...prev,
        skills: nextSkills,
        buffs: nextBuffs,
        activeAction: prev.activeAction ? {
          ...prev.activeAction,
          startTime: Date.now(),
          progress: 0,
          actualDuration: nextDuration
        } : undefined
      };
    });
  }, [addToInventory, removeFromInventory, hasItems, stopAction, addEvent, addGp, updateQuestProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { activeAction } = stateRef.current;
      if (!activeAction) return;

      const action = ACTIONS.find(a => a.id === activeAction.actionId);
      if (!action) return;

      const elapsed = Date.now() - activeAction.startTime;
      const progress = Math.min(100, (elapsed / activeAction.actualDuration) * 100);

      if (progress >= 100) {
        completeAction(action);
      } else {
        setState(prev => prev.activeAction ? {
          ...prev,
          activeAction: { ...prev.activeAction, progress }
        } : prev);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [completeAction]);

  const equipItem = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'equipment' || !item.equipmentSlot) return;

    setState(prev => {
      const currentEquipped = prev.equipment[item.equipmentSlot!];
      let newInventory = prev.inventory
        .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);

      if (currentEquipped) {
        const existing = newInventory.find(i => i.itemId === currentEquipped);
        if (existing) {
          newInventory = newInventory.map(i => i.itemId === currentEquipped ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newInventory.push({ itemId: currentEquipped, quantity: 1 });
        }
      }

      return {
        ...prev,
        inventory: newInventory,
        equipment: { ...prev.equipment, [item.equipmentSlot!]: itemId }
      };
    });
    addEvent(`Equipped ${item.name}`, 'info');
    updateQuestProgress('action_complete', { actionId: `equip_${itemId}` });
  }, [addEvent, updateQuestProgress]);

  const unequipItem = useCallback((slot: string) => {
    setState(prev => {
      const itemId = prev.equipment[slot as keyof Equipment];
      if (!itemId) return prev;

      // Return the item to inventory
      let newInventory = [...prev.inventory];
      const existing = newInventory.find(i => i.itemId === itemId);
      if (existing) {
        newInventory = newInventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newInventory.push({ itemId, quantity: 1 });
      }

      // Return any socketed gems to inventory
      const socketedGems = prev.socketedGems[slot] || [];
      socketedGems.forEach(gemId => {
        const gemInInv = newInventory.find(i => i.itemId === gemId);
        if (gemInInv) {
          newInventory = newInventory.map(i => i.itemId === gemId ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newInventory.push({ itemId: gemId, quantity: 1 });
        }
      });

      // Clear socketed gems for this slot
      const newSocketedGems = { ...prev.socketedGems };
      delete newSocketedGems[slot];

      return {
        ...prev,
        inventory: newInventory,
        equipment: { ...prev.equipment, [slot]: undefined },
        socketedGems: newSocketedGems,
      };
    });
    addEvent(`Unequipped item from ${slot}`, 'info');
  }, [addEvent]);

  const toggleEdict = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'edict') return;

    setState(prev => {
      const isActive = prev.activeEdicts.includes(itemId);
      if (isActive) {
        addEvent(`Deactivated ${item.name}`, 'info');
        return { ...prev, activeEdicts: prev.activeEdicts.filter(id => id !== itemId) };
      } else {
        const activeEdictsOnly = prev.activeEdicts.filter(id => ITEMS[id]?.type === 'edict' && !id.startsWith('relic_'));
        if (!itemId.startsWith('relic_') && activeEdictsOnly.length >= 3) {
          addEvent(`Maximum of 3 Edicts can be active!`, 'info');
          return prev;
        }
        addEvent(`Activated ${item.name}`, 'info');
        return { ...prev, activeEdicts: [...prev.activeEdicts, itemId] };
      }
    });
  }, [addEvent]);

  const usePotion = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'potion') return;

    setState(prev => {
      const existing = prev.inventory.find(i => i.itemId === itemId);
      if (!existing || existing.quantity <= 0) return prev;

      let buff: any = null;
      if (itemId === 'luck_potion') {
        buff = { id: 'luck_buff', name: 'Luck Boost', type: 'combat', multiplier: 1.5, remainingActions: 50 };
      } else if (itemId === 'overload_potion') {
        buff = { id: 'overload_buff', name: 'Overload', type: 'combat', multiplier: 2.0, remainingActions: 100 };
      } else if (itemId === 'agility_elixir') {
        buff = { id: 'agility_buff', name: 'Agility Boost', type: 'speed', multiplier: 1.25, remainingActions: 50 };
      } else if (itemId === 'thief_brew') {
        buff = { id: 'thief_buff', name: 'Thief\'s Brew', type: 'speed', multiplier: 1.5, remainingActions: 30 };
      } else if (itemId === 'vampyrism_potion') {
        buff = { id: 'vampyrism_buff', name: 'Vampyrism', type: 'combat', multiplier: 1.3, remainingActions: 100 };
      }

      if (!buff) return prev;

      addEvent(`Consumed ${item.name}!`, 'info', '🧪');

      return {
        ...prev,
        inventory: prev.inventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0),
        buffs: [...prev.buffs.filter(b => b.id !== buff.id), buff]
      };
    });
  }, [addEvent]);

  const ascendSkill = useCallback((skillId: SkillId) => {
    setState(prev => {
      const skill = prev.skills[skillId];
      if (skill.level < 99) return prev;

      const newAscensions = { ...prev.ascensions, [skillId]: (prev.ascensions[skillId] || 0) + 1 };
      const newSkills = { ...prev.skills, [skillId]: { id: skillId, level: 1, xp: 0 } };

      addEvent(`ASCENSION! ${skillId.toUpperCase()} has been reborn. Gained 1 Celestial Essence.`, 'level');

      return {
        ...prev,
        celestialEssence: prev.celestialEssence + 1,
        skills: newSkills,
        ascensions: newAscensions,
        activeAction: undefined
      };
    });
  }, [addEvent]);

  const buyRelic = useCallback((relicId: string) => {
    const relic = ITEMS[relicId];
    if (!relic || !relicId.startsWith('relic_')) return;

    setState(prev => {
      if (prev.celestialEssence < relic.value) {
        addEvent(`Not enough Celestial Essence!`, 'info');
        return prev;
      }

      if (prev.inventory.some(i => i.itemId === relicId)) {
        addEvent(`You already own this relic!`, 'info');
        return prev;
      }

      addEvent(`Forged ${relic.name}!`, 'loot');
      return {
        ...prev,
        celestialEssence: prev.celestialEssence - relic.value,
        inventory: [...prev.inventory, { itemId: relicId, quantity: 1 }]
      };
    });
  }, [addEvent]);

  const hireWorker = useCallback((workerId: string) => {
    const worker = KINGDOM_WORKERS.find(w => w.id === workerId);
    if (!worker) return;

    setState(prev => {
      const currentCount = prev.kingdom[workerId] || 0;
      const cost = Math.floor(worker.baseCost * Math.pow(worker.costMultiplier, currentCount));

      if (prev.gp < cost) {
        addEvent(`Not enough GP to hire ${worker.name}!`, 'info');
        return prev;
      }

      const missingReqs = worker.requirements.filter(req => prev.skills[req.skillId].level < req.level);
      if (missingReqs.length > 0) {
        const reqStr = missingReqs.map(r => `${r.skillId} Lv.${r.level}`).join(', ');
        addEvent(`Requirements not met: ${reqStr}`, 'info');
        return prev;
      }

      const primarySkill = prev.skills[worker.primarySkillId];
      const maxWorkers = 1 + Math.floor(primarySkill.level / 20) * 2;
      if (currentCount >= maxWorkers) {
        addEvent(`Maximum ${worker.name}s reached for level ${primarySkill.level} (${maxWorkers})!`, 'info');
        return prev;
      }

      addEvent(`Hired ${worker.name}!`, 'info');
      return {
        ...prev,
        gp: prev.gp - cost,
        kingdom: { ...prev.kingdom, [workerId]: currentCount + 1 }
      };
    });
  }, [addEvent]);

  const useItem = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;

    setState(prev => {
      const existing = prev.inventory.find(i => i.itemId === itemId);
      if (!existing || existing.quantity <= 0) return prev;

      let nextBuffs = [...prev.buffs];

      if (item.type === 'food') {
        if (itemId === 'wilderness_stew') {
          nextBuffs.push({ id: 'stew_buff', name: 'Wilderness Stew', type: 'xp', multiplier: 1.1, remainingActions: 20 });
          addEvent(`Ate Wilderness Stew. +10% XP for 20 actions!`, 'info', '🍲');
        } else if (itemId === 'dragon_feast') {
          nextBuffs.push({ id: 'feast_xp_buff', name: 'Dragon Feast (XP)', type: 'xp', multiplier: 1.25, remainingActions: 50 });
          nextBuffs.push({ id: 'feast_speed_buff', name: 'Dragon Feast (Speed)', type: 'speed', multiplier: 1.15, remainingActions: 50 });
          addEvent(`Ate Dragon Feast. +25% XP and +15% speed for 50 actions!`, 'info', '🍖');
        } else {
          nextBuffs.push({
            id: `${itemId}_buff_${Date.now()}`,
            name: `${item.name} Energy`,
            type: 'speed',
            multiplier: 1.05,
            remainingActions: 5
          });
          addEvent(`Ate ${item.name}. Feeling energized!`, 'info');
        }
      } else if (item.type === 'potion') {
        let buffType: 'speed' | 'combat' | 'xp' = 'speed';
        let multiplier = 1.2;
        let duration = 20;

        if (itemId.includes('strength') || itemId.includes('attack') || itemId.includes('defense') || itemId.includes('combat')) {
          buffType = 'combat';
          multiplier = 1.5;
        } else if (itemId.includes('wisdom') || itemId.includes('overload')) {
          buffType = 'xp';
          multiplier = 1.5;
        }

        if (itemId === 'overload_potion' || itemId === 'overload') {
          multiplier = 2.0;
          duration = 50;
        }

        nextBuffs.push({
          id: `${itemId}_buff_${Date.now()}`,
          name: item.name,
          type: buffType,
          multiplier,
          remainingActions: duration
        });
        addEvent(`Drank ${item.name}. You feel powerful!`, 'info');
      } else {
        return prev;
      }

      const newInventory = prev.inventory
        .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0);

      return {
        ...prev,
        inventory: newInventory,
        buffs: nextBuffs
      };
    });
  }, [addEvent]);

  const toggleNotifications = useCallback(() => {
    setState(prev => ({ ...prev, showNotifications: !prev.showNotifications }));
  }, []);

  // Quest system functions
  const startQuest = useCallback((questId: string) => {
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest) return;

    setState(prev => {
      // Check prerequisites
      if (!checkQuestPrerequisites(quest, prev)) {
        addEvent(`Quest prerequisites not met!`, 'info');
        return prev;
      }

      // Check if already started/completed
      if (prev.quests[questId]) {
        addEvent(`Quest already ${prev.quests[questId].status}!`, 'info');
        return prev;
      }

      addEvent(`Quest started: ${quest.name}`, 'quest', '📋');

      // Initialize objective progress, pre-filling any already-met objectives
      const objectiveProgress: Record<string, number> = {};
      quest.objectives.forEach(obj => {
        let current = 0;
        if (obj.type === 'gather' && obj.itemId) {
          current = prev.totalItemsGained[obj.itemId] || 0;
        } else if (obj.type === 'kill' && obj.actionId) {
          current = prev.killCount[obj.actionId] || 0;
        } else if (obj.type === 'reach_level' && obj.skillId) {
          current = prev.skills[obj.skillId].level;
        } else if (obj.type === 'earn_gp') {
          current = prev.gp;
        }
        objectiveProgress[obj.id] = Math.min(current, obj.target);
      });

      return {
        ...prev,
        quests: {
          ...prev.quests,
          [questId]: {
            questId,
            status: 'in_progress',
            objectiveProgress,
            startedAt: Date.now(),
          }
        }
      };
    });
  }, [addEvent]);

  // Set bank tab
  const setBankTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, bankTab: tab }));
  }, []);

  // ===== BOUNTY HUNTING SYSTEM =====
  const BOUNTY_TIERS: Record<BountyTier, { minLevel: number; killRange: [number, number]; markMultiplier: number; xpMultiplier: number }> = {
    iron: { minLevel: 1, killRange: [15, 40], markMultiplier: 1, xpMultiplier: 1 },
    gold: { minLevel: 40, killRange: [30, 80], markMultiplier: 2, xpMultiplier: 1.5 },
    imperial: { minLevel: 75, killRange: [50, 150], markMultiplier: 4, xpMultiplier: 2.5 },
  };

  const requestBounty = useCallback((tier: BountyTier) => {
    setState(prev => {
      if (prev.bountyContract) {
        addEvent('You already have an active contract! Complete or abandon it first.', 'info');
        return prev;
      }

      const slayerLevel = prev.skills.slayer.level;
      const tierConfig = BOUNTY_TIERS[tier];
      if (slayerLevel < tierConfig.minLevel) {
        addEvent(`Slayer level ${tierConfig.minLevel} required for ${tier} contracts!`, 'info');
        return prev;
      }

      // Find eligible monsters for this tier
      const eligibleMonsters = ACTIONS.filter(a =>
        a.isMonster &&
        a.skill === 'slayer' &&
        a.levelRequired <= slayerLevel &&
        a.levelRequired >= Math.max(1, tierConfig.minLevel - 10)
      );

      if (eligibleMonsters.length === 0) {
        addEvent('No suitable targets found for your level!', 'info');
        return prev;
      }

      const target = eligibleMonsters[Math.floor(Math.random() * eligibleMonsters.length)];
      const killsRequired = tierConfig.killRange[0] + Math.floor(Math.random() * (tierConfig.killRange[1] - tierConfig.killRange[0]));
      const baseMarks = Math.floor(killsRequired * 0.5 * tierConfig.markMultiplier);
      const bonusXp = Math.floor(target.xpReward * killsRequired * 0.3 * tierConfig.xpMultiplier);

      const contract: BountyContract = {
        monsterId: target.id,
        monsterName: target.name,
        killsRequired,
        killsCompleted: 0,
        tier,
        bountyMarkReward: baseMarks,
        bonusXp,
        assignedAt: Date.now(),
      };

      addEvent(`NEW CONTRACT: Hunt ${killsRequired}x ${target.name}`, 'info', '📜');

      return { ...prev, bountyContract: contract };
    });
  }, [addEvent]);

  const abandonBounty = useCallback(() => {
    setState(prev => {
      if (!prev.bountyContract) return prev;
      addEvent('Contract abandoned. Streak reset.', 'info', '❌');
      return { ...prev, bountyContract: undefined, bountyStreak: 0 };
    });
  }, [addEvent]);

  // ===== ADMIN / DEV TOOLS =====
  const adminSetLevel = useCallback((skillId: SkillId, level: number) => {
    const clampedLevel = Math.max(1, Math.min(99, level));
    setState(prev => {
      const xp = LEVEL_XP(clampedLevel);
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [skillId]: { id: skillId, level: clampedLevel, xp }
        }
      };
    });
  }, []);

  const adminAddGp = useCallback((amount: number) => {
    setState(prev => ({ ...prev, gp: prev.gp + amount }));
  }, []);

  const adminAddBountyMarks = useCallback((amount: number) => {
    setState(prev => ({ ...prev, bountyMarks: prev.bountyMarks + amount }));
  }, []);

  const adminSetAllLevels = useCallback((level: number) => {
    const clampedLevel = Math.max(1, Math.min(99, level));
    const xp = LEVEL_XP(clampedLevel);
    setState(prev => {
      const newSkills = { ...prev.skills };
      (Object.keys(newSkills) as SkillId[]).forEach(id => {
        newSkills[id] = { id, level: clampedLevel, xp };
      });
      return { ...prev, skills: newSkills };
    });
  }, []);

  const adminResetSave = useCallback(() => {
    setState(INITIAL_STATE);
    addEvent('Save data reset!', 'info');
  }, [addEvent]);

  const buyBountyItem = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item) return;

    setState(prev => {
      const cost = item.value; // bounty mark cost stored in item value
      if (prev.bountyMarks < cost) {
        addEvent('Not enough Bounty Marks!', 'info');
        return prev;
      }
      if (prev.inventory.some(i => i.itemId === itemId)) {
        addEvent('You already own this item!', 'info');
        return prev;
      }

      addEvent(`Purchased ${item.name} for ${cost} Bounty Marks!`, 'loot', item.icon, item.rarity);
      return {
        ...prev,
        bountyMarks: prev.bountyMarks - cost,
        inventory: [...prev.inventory, { itemId, quantity: 1 }],
      };
    });
  }, [addEvent]);

  // Kingdom passive income tick
  useEffect(() => {
    const interval = setInterval(() => {
      const { kingdom, skills } = stateRef.current;

      let gpGain = 0;
      let essenceGain = 0;
      const xpGains: Record<string, number> = {};

      KINGDOM_WORKERS.forEach(worker => {
        const count = kingdom[worker.id] || 0;
        if (count === 0) return;

        const totalBonus = worker.bonusValue * count;

        if (worker.bonusType === 'gp') {
          gpGain += totalBonus;
        } else if (worker.bonusType === 'celestial_essence') {
          essenceGain += totalBonus;
        } else if (worker.bonusType === 'xp') {
          xpGains[worker.primarySkillId] = (xpGains[worker.primarySkillId] || 0) + totalBonus;
        }
      });

      if (gpGain > 0 || essenceGain > 0 || Object.keys(xpGains).length > 0) {
        setState(prev => {
          let nextGp = prev.gp + gpGain;
          let nextEssence = prev.celestialEssence + essenceGain;
          const nextSkills = { ...prev.skills };

          Object.entries(xpGains).forEach(([skillId, xp]) => {
            const sId = skillId as SkillId;
            const skill = nextSkills[sId];
            const newXp = skill.xp + xp;
            const newLevel = XP_TO_LEVEL(newXp);

            if (newLevel > skill.level) {
              addEvent(`KINGDOM LEVEL UP! ${sId.toUpperCase()} is now level ${newLevel}!`, 'level');
            }
            nextSkills[sId] = { ...skill, xp: newXp, level: newLevel };
          });

          return {
            ...prev,
            gp: nextGp,
            celestialEssence: nextEssence,
            skills: nextSkills
          };
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [addEvent]);

  // === Gem Socketing ===
  const socketGem = useCallback((equipmentSlot: string, gemItemId: string) => {
    const gem = ITEMS[gemItemId];
    if (!gem?.isGem) return;

    setState(prev => {
      const equippedItemId = prev.equipment[equipmentSlot as keyof Equipment];
      if (!equippedItemId) return prev;
      const equippedItem = ITEMS[equippedItemId];
      if (!equippedItem?.socketable) return prev;

      const currentGems = prev.socketedGems[equipmentSlot] || [];
      const maxSockets = equippedItem.sockets || 0;
      if (currentGems.length >= maxSockets) return prev;

      // Must have the gem in inventory
      const invGem = prev.inventory.find(i => i.itemId === gemItemId);
      if (!invGem || invGem.quantity < 1) return prev;

      addEvent(`Socketed ${gem.name} into ${equippedItem.name}`, 'info', '💎');

      return {
        ...prev,
        inventory: prev.inventory
          .map(i => i.itemId === gemItemId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0),
        socketedGems: {
          ...prev.socketedGems,
          [equipmentSlot]: [...currentGems, gemItemId],
        },
      };
    });
  }, [addEvent]);

  const unsocketGem = useCallback((equipmentSlot: string, gemIndex: number) => {
    setState(prev => {
      const currentGems = prev.socketedGems[equipmentSlot];
      if (!currentGems || gemIndex >= currentGems.length) return prev;

      const gemId = currentGems[gemIndex];
      const gem = ITEMS[gemId];
      addEvent(`Removed ${gem?.name || 'gem'} from socket`, 'info', '💎');

      const newGems = [...currentGems];
      newGems.splice(gemIndex, 1);

      // Return gem to inventory
      const existing = prev.inventory.find(i => i.itemId === gemId);
      const newInventory = existing
        ? prev.inventory.map(i => i.itemId === gemId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev.inventory, { itemId: gemId, quantity: 1 }];

      return {
        ...prev,
        inventory: newInventory,
        socketedGems: {
          ...prev.socketedGems,
          [equipmentSlot]: newGems.length > 0 ? newGems : [],
        },
      };
    });
  }, [addEvent]);

  // === Pets ===
  const setActivePet = useCallback((petId: string | undefined) => {
    setState(prev => ({ ...prev, activePet: petId }));
    if (petId) {
      addEvent(`${ITEMS[petId]?.name} is now following you!`, 'info', ITEMS[petId]?.icon);
    }
  }, [addEvent]);

  // === Clue Scrolls ===
  const openClueScroll = useCallback((clueItemId: string) => {
    const rewards = CLUE_REWARDS[clueItemId];
    if (!rewards) return;

    // Must have the clue scroll
    const hasClue = stateRef.current.inventory.find(i => i.itemId === clueItemId);
    if (!hasClue || hasClue.quantity < 1) return;

    // Remove the clue scroll
    removeFromInventory(clueItemId, 1);

    const tierName = clueItemId.replace('clue_scroll_', '').toUpperCase();
    addEvent(`Opening ${tierName} Clue Scroll...`, 'info', '📜');

    // Roll each reward independently
    let gotAnything = false;
    rewards.forEach(reward => {
      if (Math.random() <= reward.chance) {
        if (reward.itemId === 'gp') {
          addGp(reward.quantity);
        } else {
          addToInventory(reward.itemId, reward.quantity);
        }
        gotAnything = true;
      }
    });

    if (!gotAnything) {
      // Consolation prize — always at least some GP
      const consolation = clueItemId === 'clue_scroll_easy' ? 2000
        : clueItemId === 'clue_scroll_medium' ? 10000
        : clueItemId === 'clue_scroll_hard' ? 50000 : 200000;
      addGp(consolation);
    }
  }, [addToInventory, removeFromInventory, addGp, addEvent]);

  return {
    state,
    events,
    startAction,
    stopAction,
    addToInventory,
    removeFromInventory,
    addGp,
    equipItem,
    unequipItem,
    toggleEdict,
    ascendSkill,
    buyRelic,
    hireWorker,
    useItem,
    toggleNotifications,
    salvageItem,
    usePotion,
    // New systems
    startQuest,
    setBankTab,
    // Bounty Hunting
    requestBounty,
    abandonBounty,
    // Admin/Dev Tools
    adminSetLevel,
    adminAddGp,
    adminAddBountyMarks,
    adminSetAllLevels,
    adminResetSave,
    // Bounty shop
    buyBountyItem,
    // Gem Socketing
    socketGem,
    unsocketGem,
    // Pets
    setActivePet,
    // Prestige
    prestige: useCallback(() => {
      setState(prev => {
        let totalLevel = 0;
        (Object.values(prev.skills) as { level: number }[]).forEach(s => { totalLevel += s.level; });
        if (totalLevel < 1500) return prev; // minimum requirement

        // Tokens earned = total level / 100, bonus for ascensions
        let totalAsc = 0;
        (Object.values(prev.ascensions) as number[]).forEach(a => { totalAsc += a; });
        const tokensEarned = Math.floor(totalLevel / 100) + totalAsc * 2;

        // Reset skills to level 1
        const resetSkills: any = {};
        Object.keys(prev.skills).forEach(id => {
          resetSkills[id] = { id, level: 1, xp: 0 };
        });

        // Reset ascensions
        const resetAscensions: any = {};
        Object.keys(prev.ascensions).forEach(id => {
          resetAscensions[id] = 0;
        });

        addEvent(`PRESTIGE ${prev.prestigeLevel + 1}! Earned ${tokensEarned} Prestige Tokens!`, 'level');

        return {
          ...prev,
          skills: resetSkills,
          gp: 0,
          celestialEssence: 0,
          inventory: [],
          equipment: {},
          activeEdicts: [],
          ascensions: resetAscensions,
          buffs: [],
          kingdom: {},
          activeAction: undefined,
          socketedGems: {},
          dryStreak: 0,
          bountyContract: undefined,
          bountyStreak: 0,
          bountyMarks: 0,
          autoSellItems: [],
          // KEEP: collectionLog, petsUnlocked, activePet, quests, killCount, totalActions, totalItemsGained, achievements
          prestigeLevel: prev.prestigeLevel + 1,
          prestigeTokens: prev.prestigeTokens + tokensEarned,
        };
      });
    }, [addEvent]),
    // Auto-sell
    toggleAutoSell: useCallback((itemId: string) => {
      setState(prev => {
        const isAutoSell = prev.autoSellItems.includes(itemId);
        return {
          ...prev,
          autoSellItems: isAutoSell
            ? prev.autoSellItems.filter(id => id !== itemId)
            : [...prev.autoSellItems, itemId],
        };
      });
    }, []),
    // Clue Scrolls
    openClueScroll,
    // Offline progress
    offlineGains,
    dismissOfflineGains: () => setOfflineGains(null),
  };
}
