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
  Sparkles
} from 'lucide-react';
import { SkillId } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gp: number;
  showNotifications: boolean;
  toggleNotifications: () => void;
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
  { id: 'attack', name: 'Attack', icon: Sword },
  { id: 'strength', name: 'Strength', icon: Zap },
  { id: 'defense', name: 'Defense', icon: Shield },
  { id: 'magic', name: 'Magic', icon: Zap },
  { id: 'ranged', name: 'Ranged', icon: Target },
  { id: 'empire', name: 'Empire', icon: Castle },
  { id: 'raids', name: 'Raids', icon: Skull },
];

export function Layout({ children, activeTab, setActiveTab, gp, showNotifications, toggleNotifications }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#141414] bg-[#E4E3E0] flex flex-col overflow-hidden transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#141414] rounded-sm flex items-center justify-center text-[#E4E3E0]">
              <Castle size={20} />
            </div>
            <h1 className="font-serif italic text-lg font-bold tracking-tight">Chimera</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange('bank')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'bank' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
            }`}
          >
            <Package size={18} />
            Bank
          </button>
          <button
            onClick={() => handleTabChange('shop')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'shop' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
            }`}
          >
            <Store size={18} />
            Shop
          </button>
          <button
            onClick={() => handleTabChange('forge')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'forge' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
            }`}
          >
            <Sparkles size={18} />
            Celestial Forge
          </button>

          <div className="pt-4 pb-2 px-3 text-[10px] font-serif italic uppercase opacity-50 tracking-widest">
            Gathering & Artisan
          </div>
          {SKILLS.slice(0, 9).map(skill => (
            <button
              key={skill.id}
              onClick={() => handleTabChange(skill.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === skill.id ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
              }`}
            >
              <skill.icon size={18} />
              {skill.name}
            </button>
          ))}

          <div className="pt-4 pb-2 px-3 text-[10px] font-serif italic uppercase opacity-50 tracking-widest">
            Combat & Meta
          </div>
          {SKILLS.slice(9).map(skill => (
            <button
              key={skill.id}
              onClick={() => handleTabChange(skill.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === skill.id ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/10'
              }`}
            >
              <skill.icon size={18} />
              {skill.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#141414] bg-[#141414]/5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="opacity-50">CURRENCY</span>
            <span className="font-bold">{gp.toLocaleString()} GP</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-14 border-b border-[#141414] flex items-center justify-between px-4 lg:px-6 bg-[#E4E3E0]/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-[#141414]/10 rounded-sm">
              <Menu size={20} />
            </button>
            <div className="text-xs font-serif italic opacity-50 uppercase tracking-widest">
              {activeTab}
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-6 text-[10px] lg:text-xs font-mono">
            <button 
              onClick={toggleNotifications}
              className={`flex items-center gap-2 px-2 py-1 border border-[#141414]/20 rounded-sm transition-all ${showNotifications ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-transparent text-[#141414] opacity-50'}`}
              title={showNotifications ? "Disable Notifications" : "Enable Notifications"}
            >
              <Zap size={14} className={showNotifications ? "fill-current" : ""} />
              <span className="hidden sm:inline">{showNotifications ? "NOTIFS ON" : "NOTIFS OFF"}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="opacity-50">STATUS</span>
              <span className="text-green-600">ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-50">GP</span>
              <span className="font-bold">{gp.toLocaleString()}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#141414]/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
