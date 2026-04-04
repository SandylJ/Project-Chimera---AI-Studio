import React, { useState } from 'react';
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
import AdminPanel from './components/AdminPanel';
import { SkillId } from './types';

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
  } = useGame();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return <DashboardView state={state} events={events} setActiveTab={setActiveTab} />;
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
      'prayer', 'empire', 'raids'
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
    </Layout>
  );
}
