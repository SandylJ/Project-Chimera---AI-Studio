import React, { ReactNode } from 'react';
import {
  Pickaxe,
  Trees,
  Fish,
  PawPrint,
  Sprout,
  Hammer,
  Utensils,
  FlaskConical,
  Scissors,
  Sword,
  Shield,
  Zap,
  Target,
  Castle,
  Skull,
  Briefcase,
  Store,
  Coins,
  LayoutDashboard,
  Package,
  Menu,
  X,
  Sparkles,
  Hexagon,
  Hand,
  Ghost,
  Footprints,
  Users,
  ScrollText,
  BookOpen,
  Trophy,
  Volume2,
  VolumeX,
  Map
} from 'lucide-react';
import { SkillId } from '../types';
import { playTabClick, isAudioEnabled, setAudioEnabled } from '../sounds';
import { AnimatedCounter } from './AnimatedCounter';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gp: number;
  bountyMarks: number;
  showNotifications: boolean;
  toggleNotifications: () => void;
  adminPanel?: ReactNode;
}

const SKILLS: { id: SkillId; name: string; icon: any }[] = [
  { id: 'mining', name: 'Mining', icon: Pickaxe },
  { id: 'woodcutting', name: 'Woodcutting', icon: Trees },
  { id: 'fishing', name: 'Fishing', icon: Fish },
  { id: 'hunting', name: 'Hunting', icon: PawPrint },
  { id: 'farming', name: 'Farming', icon: Sprout },
  { id: 'smithing', name: 'Smithing', icon: Hammer },
  { id: 'cooking', name: 'Cooking', icon: Utensils },
  { id: 'herblore', name: 'Herblore', icon: FlaskConical },
  { id: 'crafting', name: 'Crafting', icon: Scissors },
  { id: 'runecrafting', name: 'Runecrafting', icon: Hexagon },
  { id: 'thieving', name: 'Thieving', icon: Hand },
  { id: 'agility', name: 'Agility', icon: Footprints },
  { id: 'attack', name: 'Attack', icon: Sword },
  { id: 'strength', name: 'Strength', icon: Zap },
  { id: 'defense', name: 'Defense', icon: Shield },
  { id: 'magic', name: 'Magic', icon: Zap },
  { id: 'ranged', name: 'Ranged', icon: Target },
  { id: 'prayer', name: 'Prayer', icon: Sparkles },
  { id: 'empire', name: 'Empire', icon: Castle },
  { id: 'raids', name: 'Raids', icon: Skull },
  { id: 'slayer', name: 'Bounty Hunter', icon: Ghost },
  { id: 'construction', name: 'Construction', icon: Castle },
];

export function Layout({ children, activeTab, setActiveTab, gp, bountyMarks, showNotifications, toggleNotifications, adminPanel }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [audioOn, setAudioOn] = React.useState(isAudioEnabled());

  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) playTabClick();
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navButtonClass = (tab: string) =>
    `w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-100 ${
      activeTab === tab
        ? 'bg-[#D4A943] text-[#1A1510] font-bold shadow-[0_3px_0_0_#8A6E1E]'
        : 'bg-[#1E1A16] text-[#B8A890] shadow-[0_3px_0_0_#0D0B09] hover:shadow-[0_2px_0_0_#0D0B09] hover:translate-y-[1px] hover:text-[#E8E0D4] active:shadow-none active:translate-y-[3px]'
    }`;

  return (
    <div className="flex h-screen bg-[#151210] text-[#E8E0D4] selection:bg-[#D4A943] selection:text-[#1A1510]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#3D3328] bg-[#1A1612] flex flex-col overflow-hidden transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-[#3D3328] flex items-center justify-between bg-[#1A1612]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D4A943] rounded-lg flex items-center justify-center text-[#1A1510] shadow-[0_2px_0_0_#8A6E1E]">
              <Castle size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#E8E0D4]" style={{ fontFamily: "'Cinzel', serif" }}>Chimera</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-[#7A6E60] hover:text-[#E8E0D4]">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <button onClick={() => handleTabChange('dashboard')} className={navButtonClass('dashboard')}>
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button onClick={() => handleTabChange('bank')} className={navButtonClass('bank')}>
            <Package size={18} />
            Bank
          </button>
          <button onClick={() => handleTabChange('shop')} className={navButtonClass('shop')}>
            <Store size={18} />
            Shop
          </button>
          <button onClick={() => handleTabChange('forge')} className={navButtonClass('forge')}>
            <Sparkles size={18} />
            Celestial Forge
          </button>
          <button onClick={() => handleTabChange('kingdom')} className={navButtonClass('kingdom')}>
            <Users size={18} />
            Kingdom
          </button>
          <button onClick={() => handleTabChange('quests')} className={navButtonClass('quests')}>
            <ScrollText size={18} />
            Quests
          </button>
          <button onClick={() => handleTabChange('collection')} className={navButtonClass('collection')}>
            <BookOpen size={18} />
            Collection Log
          </button>
          <button onClick={() => handleTabChange('achievements')} className={navButtonClass('achievements')}>
            <Trophy size={18} />
            Achievements
          </button>
          <button onClick={() => handleTabChange('world-v2')} className={navButtonClass('world-v2')}>
            <Map size={18} />
            World v2
          </button>

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'Cinzel', serif" }}>
            Gathering & Artisan
          </div>
          {SKILLS.slice(0, 9).map(skill => (
            <button
              key={skill.id}
              onClick={() => handleTabChange(skill.id)}
              className={navButtonClass(skill.id)}
            >
              <skill.icon size={18} />
              {skill.name}
            </button>
          ))}

          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'Cinzel', serif" }}>
            Combat & Meta
          </div>
          {SKILLS.slice(9).map(skill => (
            <button
              key={skill.id}
              onClick={() => handleTabChange(skill.id)}
              className={navButtonClass(skill.id)}
            >
              <skill.icon size={18} />
              {skill.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#3D3328] bg-[#0D0B09]">
          <div className="flex items-center justify-between text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="text-[#7A6E60]">CURRENCY</span>
            <AnimatedCounter value={gp} className="font-bold text-[#D4A943]" suffix=" GP" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-14 border-b border-[#3D3328] flex items-center justify-between px-4 lg:px-6 bg-[#1A1612]/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-[#2A2520] rounded-lg text-[#7A6E60]">
              <Menu size={20} />
            </button>
            <div className="text-xs uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'Cinzel', serif" }}>
              {activeTab}
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6 text-[10px] lg:text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <button
              onClick={() => { const next = !audioOn; setAudioOn(next); setAudioEnabled(next); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-100 ${
                audioOn
                  ? 'bg-[#D4A943] text-[#1A1510] shadow-[0_2px_0_0_#8A6E1E] font-bold'
                  : 'bg-[#1E1A16] text-[#7A6E60] shadow-[0_2px_0_0_#0D0B09]'
              }`}
              title={audioOn ? "Mute Audio" : "Enable Audio"}
            >
              {audioOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden sm:inline">{audioOn ? "SFX ON" : "SFX OFF"}</span>
            </button>
            <button
              onClick={toggleNotifications}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-100 ${
                showNotifications
                  ? 'bg-[#D4A943] text-[#1A1510] shadow-[0_2px_0_0_#8A6E1E] font-bold'
                  : 'bg-[#1E1A16] text-[#7A6E60] shadow-[0_2px_0_0_#0D0B09]'
              }`}
              title={showNotifications ? "Disable Notifications" : "Enable Notifications"}
            >
              <Zap size={14} className={showNotifications ? "fill-current" : ""} />
              <span className="hidden sm:inline">{showNotifications ? "NOTIFS ON" : "NOTIFS OFF"}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#7A6E60]">STATUS</span>
              <span className="text-green-500 font-bold">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#7A6E60]">GP</span>
              <AnimatedCounter value={gp} className="font-bold text-[#D4A943]" />
            </div>
            {bountyMarks > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[#7A6E60]">MARKS</span>
                <span className="font-bold text-[#C17F4E]">{bountyMarks.toLocaleString()}</span>
              </div>
            )}
            {adminPanel}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
