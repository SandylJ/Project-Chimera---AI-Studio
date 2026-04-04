import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, SkillId, SkillAction, InventoryItem, Equipment } from './types';
import { ACTIONS, ITEMS, LEVEL_XP, XP_TO_LEVEL, KINGDOM_WORKERS } from './constants';

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
  },
  inventory: [],
  equipment: {},
  activeEdicts: [],
  ascensions: {
    mining: 0, woodcutting: 0, fishing: 0, hunting: 0, farming: 0,
    smithing: 0, cooking: 0, herblore: 0, crafting: 0, runecrafting: 0, thieving: 0,
    agility: 0, attack: 0, strength: 0, defense: 0, magic: 0, ranged: 0, prayer: 0,
    empire: 0, raids: 0, slayer: 0
  },
  buffs: [],
  kingdom: {},
  showNotifications: true,
};

export interface GameEvent {
  id: string;
  timestamp: number;
  message: string;
  type: 'loot' | 'level' | 'xp' | 'info';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'celestial';
}

const calculateDuration = (action: SkillAction, skills: Record<SkillId, any>, equipment: Equipment, activeEdicts: string[], ascensions: Record<SkillId, number>, buffs: any[], inventory: InventoryItem[]) => {
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
    actualDuration *= 0.9; // 10% faster
  }

  // Relic: Heart of the Empire
  if (action.skill === 'empire' && activeEdicts.includes('relic_empire_heart')) {
    actualDuration *= 0.5; // 50% faster
  }

  // Ascension Bonus
  const ascensionCount = ascensions[action.skill] || 0;
  actualDuration *= (1 - ascensionCount * 0.05); // 5% faster per ascension

  if (action.isMonster) {
    // Relic: Void Blade (10% chance to execute)
    if (activeEdicts.includes('relic_void_blade') && Math.random() < 0.1) {
      return 100; // Near-instant kill
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

    // Base speed increase from combat level and equipment
    actualDuration = actualDuration / (1 + (combatLevel - 1) * 0.05 + equipmentBonus * 0.01);

    // Weakness bonus
    if (action.weakness && action.skill === action.weakness) {
      actualDuration *= 0.7; // 30% faster if using the correct weakness
    }

    // Martial Law Edict
    if (activeEdicts.includes('edict_martial_law')) {
      actualDuration *= 0.85; // 15% faster combat
    }
  }
  return Math.max(100, actualDuration);
};

export function useGame() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [state, setState] = useState<PlayerState>(() => {
    const saved = localStorage.getItem('chimera_save');
    if (!saved) return INITIAL_STATE;
    try {
      const parsed = JSON.parse(saved);
      // Merge with INITIAL_STATE to ensure new fields exist
      return {
        ...INITIAL_STATE,
        ...parsed,
        skills: { ...INITIAL_STATE.skills, ...parsed.skills },
        ascensions: { ...INITIAL_STATE.ascensions, ...parsed.ascensions },
        equipment: { ...INITIAL_STATE.equipment, ...parsed.equipment },
        buffs: parsed.buffs || [],
        kingdom: parsed.kingdom || {},
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

  useEffect(() => {
    localStorage.setItem('chimera_save', JSON.stringify(state));
  }, [state]);

  const addToInventory = useCallback((itemId: string, quantity: number) => {
    const item = ITEMS[itemId];
    if (item) {
      const rarityIcon = item.rarity === 'legendary' ? '🌟' : item.rarity === 'rare' ? '💎' : '';
      addEvent(`Gained ${quantity}x ${item.name}`, 'loot', rarityIcon || item.icon, item.rarity);
    }
    
    setState(prev => {
      const existing = prev.inventory.find(i => i.itemId === itemId);
      if (existing) {
        return {
          ...prev,
          inventory: prev.inventory.map(i => 
            i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i
          )
        };
      }
      return {
        ...prev,
        inventory: [...prev.inventory, { itemId, quantity }]
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

    const actualDuration = calculateDuration(action, stateRef.current.skills, stateRef.current.equipment, stateRef.current.activeEdicts, stateRef.current.ascensions, stateRef.current.buffs, stateRef.current.inventory);

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
    if (amount > 0) addEvent(`Gained ${amount} GP`, 'loot', '💰');
    setState(prev => ({ ...prev, gp: prev.gp + amount }));
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
    action.outputs.forEach(output => {
      if (Math.random() <= output.chance) {
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
        } else if (output.itemId === 'celestial_essence') {
          setState(prev => ({ ...prev, celestialEssence: prev.celestialEssence + quantity }));
          addEvent(`Gained ${quantity} Celestial Essence`, 'loot');
        } else {
          addToInventory(output.itemId, quantity);
        }
      }
    });

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

      // Ascension Bonus
      const ascensionCount = prev.ascensions[action.skill] || 0;
      xpReward = Math.floor(xpReward * (1 + ascensionCount * 0.05));

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
      }

      const nextSkills = {
        ...prev.skills,
        [action.skill]: { ...skill, xp: newXp, level: newLevel }
      };

      const nextBuffs = prev.buffs.map(b => ({ ...b, remainingActions: b.remainingActions - 1 })).filter(b => b.remainingActions > 0);
      if (nextBuffs.length < prev.buffs.length) {
        addEvent(`A buff has expired!`, 'info');
      }

      const nextDuration = calculateDuration(action, nextSkills, prev.equipment, prev.activeEdicts, prev.ascensions, nextBuffs, prev.inventory);

      return {
        ...prev,
        skills: nextSkills,
        buffs: nextBuffs,
        // Restart action if possible
        activeAction: prev.activeAction ? {
          ...prev.activeAction,
          startTime: Date.now(),
          progress: 0,
          actualDuration: nextDuration
        } : undefined
      };
    });
  }, [addToInventory, removeFromInventory, hasItems, stopAction, addEvent, addGp]);

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
  }, [addEvent]);

  const unequipItem = useCallback((slot: string) => {
    setState(prev => {
      const itemId = prev.equipment[slot as keyof Equipment];
      if (!itemId) return prev;

      const newInventory = [...prev.inventory];
      const existing = newInventory.find(i => i.itemId === itemId);
      if (existing) {
        return {
          ...prev,
          inventory: prev.inventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i),
          equipment: { ...prev.equipment, [slot]: undefined }
        };
      }

      return {
        ...prev,
        inventory: [...prev.inventory, { itemId, quantity: 1 }],
        equipment: { ...prev.equipment, [slot]: undefined }
      };
    });
    addEvent(`Unequipped item from ${slot}`, 'info');
  }, [addEvent]);

  const toggleEdict = useCallback((itemId: string) => {
    const item = ITEMS[itemId];
    if (!item || item.type !== 'edict') return; // Relics use edict type for logic

    setState(prev => {
      const isActive = prev.activeEdicts.includes(itemId);
      if (isActive) {
        addEvent(`Deactivated ${item.name}`, 'info');
        return { ...prev, activeEdicts: prev.activeEdicts.filter(id => id !== itemId) };
      } else {
        // Relics don't count towards the 3-edict limit
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
        activeAction: undefined // Stop current action
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

      // Check skill requirements
      const missingReqs = worker.requirements.filter(req => prev.skills[req.skillId].level < req.level);
      if (missingReqs.length > 0) {
        const reqStr = missingReqs.map(r => `${r.skillId} Lv.${r.level}`).join(', ');
        addEvent(`Requirements not met: ${reqStr}`, 'info');
        return prev;
      }

      // Tiered hiring limits: 1 at base, 3 at lvl 20, 5 at lvl 40, 7 at lvl 60...
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
        // Food currently doesn't do much since there's no HP, 
        // but we can make it give a small XP buff or speed buff for a few actions
        nextBuffs.push({
          id: `${itemId}_buff_${Date.now()}`,
          name: `${item.name} Energy`,
          type: 'speed',
          multiplier: 1.05,
          remainingActions: 5
        });
        addEvent(`Ate ${item.name}. Feeling energized!`, 'info');
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
    }, 1000); // Passive tick every second

    return () => clearInterval(interval);
  }, [addEvent]);

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
    toggleNotifications
  };
}
