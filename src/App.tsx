import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { useGame } from './useGame';
import { SkillView } from './components/SkillView';
import { BankView } from './components/BankView';
import { ShopView } from './components/ShopView';
import { DashboardView } from './components/DashboardView';
import { EventLog } from './components/EventLog';
import { KingdomView } from './components/KingdomView';
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
    usePotion
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
    
    // Check if activeTab is a SkillId
    const skillIds: SkillId[] = [
      'mining', 'woodcutting', 'fishing', 'hunting', 'farming',
      'smithing', 'cooking', 'herblore', 'crafting', 'runecrafting',
      'thieving', 'agility', 'attack', 'strength', 'defense', 'magic', 'ranged',
      'prayer', 'empire', 'raids', 'slayer'
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
        <h2 className="text-4xl font-serif italic font-bold tracking-tight">Under Construction</h2>
        <p className="text-lg font-serif italic opacity-70">This area of the empire is still being developed.</p>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-3 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest hover:bg-[#141414]/80 transition-colors"
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
      showNotifications={state.showNotifications || false}
      toggleNotifications={toggleNotifications}
    >
      {renderContent()}
      <EventLog events={events} showNotifications={state.showNotifications} />
    </Layout>
  );
}
