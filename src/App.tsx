import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layout } from './components/Layout';
import { useGame } from './useGame';
import { SkillView } from './components/SkillView';
import { BankView } from './components/BankView';
import { ShopView } from './components/ShopView';
import { DashboardView } from './components/DashboardView';
import { EventLog } from './components/EventLog';
import { KingdomView } from './components/KingdomView';
import { QuestView } from './components/QuestView';
import { CollectionLogView } from './components/CollectionLogView';
import { BountyBoardView } from './components/BountyBoardView';
import { AchievementView } from './components/AchievementView';
import { LootDropOverlay, LootDropEvent } from './components/LootDropOverlay';
import { LevelUpOverlay, LevelUpEvent } from './components/LevelUpOverlay';
import { QuestCompleteOverlay, QuestCompleteEvent } from './components/QuestCompleteOverlay';
import AdminPanel from './components/AdminPanel';
import { SkillId } from './types';
import { ITEMS, QUESTS } from './constants';

import { CelestialForgeView } from './components/CelestialForgeView';

export default function App() {
  const {
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
    toggleNotifications,
    salvageItem,
    usePotion,
    startQuest,
    setBankTab,
    requestBounty,
    abandonBounty,
    adminSetLevel,
    adminAddGp,
    adminAddBountyMarks,
    adminSetAllLevels,
    adminResetSave,
    buyBountyItem,
    socketGem,
    unsocketGem,
    setActivePet,
    openClueScroll,
    toggleAutoSell,
    prestige,
    offlineGains,
    dismissOfflineGains,
  } = useGame();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Overlay state — queued drops/level-ups/quests shown one at a time
  const [lootDropQueue, setLootDropQueue] = useState<LootDropEvent[]>([]);
  const [activeLootDrop, setActiveLootDrop] = useState<LootDropEvent | null>(null);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpEvent[]>([]);
  const [activeLevelUp, setActiveLevelUp] = useState<LevelUpEvent | null>(null);
  const [questCompleteQueue, setQuestCompleteQueue] = useState<QuestCompleteEvent[]>([]);
  const [activeQuestComplete, setActiveQuestComplete] = useState<QuestCompleteEvent | null>(null);
  const lastEventIdRef = useRef<string>('');

  // Watch events for rare+ drops and level-ups
  useEffect(() => {
    if (events.length === 0) return;
    const latest = events[0];
    if (latest.id === lastEventIdRef.current) return;
    lastEventIdRef.current = latest.id;

    if (latest.type === 'loot' && latest.rarity && ['rare', 'epic', 'legendary', 'celestial'].includes(latest.rarity)) {
      const msgText = latest.message.replace(/^[^\s]+\s+/, ''); // strip icon
      // Match standard drops: "LEGENDARY DROP: 1x Dragon Blade!" and "UNIQUE DROP: 1x Item!"
      const match = msgText.match(/(?:UNIQUE|CELESTIAL|LEGENDARY|EPIC|Rare)\s+(?:DROP:|drop:)\s+(\d+)x\s+(.+?)!?$/i);
      // Match pet drops: "PET DROP: Rock Golem! A new companion follows you!"
      const petMatch = !match ? msgText.match(/PET\s+DROP:\s+(.+?)!/i) : null;

      if (match) {
        const quantity = parseInt(match[1]);
        const itemName = match[2];
        const item = Object.values(ITEMS).find(i => i.name === itemName);
        setLootDropQueue(q => [...q, {
          id: latest.id,
          itemName,
          itemIcon: item?.icon || '?',
          quantity,
          rarity: latest.rarity as LootDropEvent['rarity'],
        }]);
      } else if (petMatch) {
        const petName = petMatch[1];
        const pet = Object.values(ITEMS).find(i => i.name === petName);
        setLootDropQueue(q => [...q, {
          id: latest.id,
          itemName: petName,
          itemIcon: pet?.icon || '🐾',
          quantity: 1,
          rarity: 'celestial',
        }]);
      }
    }

    if (latest.type === 'level') {
      // Parse: "⬆️ LEVEL UP! MINING is now level 5!"
      const match = latest.message.match(/LEVEL UP!\s+(\w+)\s+is now level\s+(\d+)/i);
      if (match) {
        setLevelUpQueue(q => [...q, {
          id: latest.id,
          skillName: match[1].charAt(0) + match[1].slice(1).toLowerCase(),
          newLevel: parseInt(match[2]),
        }]);
      }
    }

    if (latest.type === 'quest') {
      // Parse: "🏆 QUEST COMPLETE: The Miner's Path!"
      const match = latest.message.match(/QUEST COMPLETE:\s+(.+?)!/i);
      if (match) {
        const questName = match[1];
        const quest = QUESTS.find(q => q.name === questName);
        setQuestCompleteQueue(q => [...q, {
          id: latest.id,
          questName,
          difficulty: quest?.difficulty || 'experienced',
        }]);
      }
    }
  }, [events]);

  // Process queues — loot drops take priority, then level-ups, then quests
  useEffect(() => {
    if (activeLootDrop || activeLevelUp || activeQuestComplete) return;
    if (lootDropQueue.length > 0) {
      setActiveLootDrop(lootDropQueue[0]);
      setLootDropQueue(q => q.slice(1));
    } else if (levelUpQueue.length > 0) {
      setActiveLevelUp(levelUpQueue[0]);
      setLevelUpQueue(q => q.slice(1));
    } else if (questCompleteQueue.length > 0) {
      setActiveQuestComplete(questCompleteQueue[0]);
      setQuestCompleteQueue(q => q.slice(1));
    }
  }, [lootDropQueue, levelUpQueue, questCompleteQueue, activeLootDrop, activeLevelUp, activeQuestComplete]);

  const dismissLootDrop = useCallback(() => setActiveLootDrop(null), []);
  const dismissLevelUp = useCallback(() => setActiveLevelUp(null), []);
  const dismissQuestComplete = useCallback(() => setActiveQuestComplete(null), []);

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return <DashboardView state={state} events={events} setActiveTab={setActiveTab} prestige={prestige} />;
    }
    if (activeTab === 'bank') {
      return (
        <BankView
          state={state}
          equipItem={equipItem}
          unequipItem={unequipItem}
          toggleEdict={toggleEdict}
          removeFromInventory={removeFromInventory}
          addGp={addGp}
          salvageItem={salvageItem}
          usePotion={usePotion}
          socketGem={socketGem}
          unsocketGem={unsocketGem}
          openClueScroll={openClueScroll}
          toggleAutoSell={toggleAutoSell}
        />
      );
    }
    if (activeTab === 'shop') {
      return (
        <ShopView
          state={state}
          addToInventory={addToInventory}
          removeFromInventory={removeFromInventory}
          addGp={addGp}
        />
      );
    }
    if (activeTab === 'forge') {
      return <CelestialForgeView state={state} buyRelic={buyRelic} toggleEdict={toggleEdict} />;
    }
    if (activeTab === 'kingdom') {
      return <KingdomView state={state} hireWorker={hireWorker} />;
    }
    if (activeTab === 'quests') {
      return <QuestView state={state} startQuest={startQuest} />;
    }
    if (activeTab === 'collection') {
      return <CollectionLogView state={state} />;
    }
    if (activeTab === 'achievements') {
      return <AchievementView state={state} />;
    }

    // Bounty Hunting (replaces generic slayer skill view)
    if (activeTab === 'slayer') {
      return (
        <BountyBoardView
          state={state}
          requestBounty={requestBounty}
          abandonBounty={abandonBounty}
          startAction={startAction}
          stopAction={stopAction}
          ascendSkill={ascendSkill}
          buyBountyItem={buyBountyItem}
        />
      );
    }

    // Check if activeTab is a SkillId
    const skillIds: SkillId[] = [
      'mining', 'woodcutting', 'fishing', 'hunting', 'farming',
      'smithing', 'cooking', 'herblore', 'crafting', 'runecrafting',
      'thieving', 'agility', 'attack', 'strength', 'defense', 'magic', 'ranged',
      'prayer', 'empire', 'raids', 'construction'
    ];

    if (skillIds.includes(activeTab as SkillId)) {
      return (
        <SkillView
          skillId={activeTab as SkillId}
          state={state}
          startAction={startAction}
          stopAction={stopAction}
          ascendSkill={ascendSkill}
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>Under Construction</h2>
        <p className="text-lg text-[#B8A890]">This area of the empire is still being developed.</p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="keycap keycap-gold text-xs uppercase tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      gp={state.gp}
      bountyMarks={state.bountyMarks}
      showNotifications={state.showNotifications || false}
      toggleNotifications={toggleNotifications}
      adminPanel={
        <AdminPanel
          state={state}
          adminSetLevel={adminSetLevel}
          adminAddGp={adminAddGp}
          adminAddBountyMarks={adminAddBountyMarks}
          adminSetAllLevels={adminSetAllLevels}
          adminResetSave={adminResetSave}
        />
      }
    >
      {renderContent()}
      <EventLog events={events} showNotifications={state.showNotifications} />
      <LootDropOverlay drop={activeLootDrop} onDismiss={dismissLootDrop} />
      <LevelUpOverlay levelUp={activeLevelUp} onDismiss={dismissLevelUp} />
      <QuestCompleteOverlay quest={activeQuestComplete} onDismiss={dismissQuestComplete} />
      {offlineGains && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer" onClick={dismissOfflineGains}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-[#1E1A16] border border-[#D4A943]/30 rounded-xl shadow-2xl p-8 max-w-sm text-center space-y-4">
            <div className="text-[11px] text-[#D4A943] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Welcome Back</div>
            <div className="text-sm text-[#B8A890]">While you were away for <span className="text-[#E8E0D4] font-bold">{offlineGains.duration}</span>, your workers completed:</div>
            <div className="space-y-2 text-left bg-[#0D0B09] rounded-lg p-4 border border-[#3D3328]">
              <div className="flex justify-between text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-[#7A6E60]">Actions</span>
                <span className="text-[#E8E0D4] font-bold">{offlineGains.actions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-[#7A6E60]">XP Gained</span>
                <span className="text-emerald-400 font-bold">+{offlineGains.xp.toLocaleString()}</span>
              </div>
              {offlineGains.gp > 0 && (
                <div className="flex justify-between text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span className="text-[#7A6E60]">GP Earned</span>
                  <span className="text-[#D4A943] font-bold">+{offlineGains.gp.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>click to dismiss</div>
          </div>
        </div>
      )}
    </Layout>
  );
}
