import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { SkillId, PlayerState } from '../types';

const ALL_SKILLS: SkillId[] = [
  'mining', 'woodcutting', 'fishing', 'hunting', 'farming',
  'smithing', 'cooking', 'herblore', 'crafting', 'runecrafting',
  'thieving', 'agility', 'attack', 'strength', 'defense',
  'magic', 'ranged', 'prayer', 'empire', 'raids', 'slayer',
];

interface AdminPanelProps {
  state: PlayerState;
  adminSetLevel: (skillId: SkillId, level: number) => void;
  adminAddGp: (amount: number) => void;
  adminAddBountyMarks: (amount: number) => void;
  adminSetAllLevels: (level: number) => void;
  adminResetSave: () => void;
}

export default function AdminPanel({ state, adminSetLevel, adminAddGp, adminAddBountyMarks, adminSetAllLevels, adminResetSave }: AdminPanelProps) {
  const [open, setOpen] = useState(false);
  const [allLevel, setAllLevel] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<SkillId>('mining');
  const [skillLevel, setSkillLevel] = useState(1);
  const [confirmReset, setConfirmReset] = useState(false);

  const btnBase = 'px-2 py-0.5 text-[10px] font-mono border border-[#3D3328] bg-[#1E1A16] text-[#E8E0D4] hover:bg-[#D4A943] hover:text-[#1A1510] hover:border-[#D4A943] transition-colors cursor-pointer rounded';

  return (
    <div className="relative z-50">
      <button onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded-lg border transition-colors cursor-pointer ${
          open ? 'bg-[#D4A943] text-[#1A1510] border-[#8A6E1E]' : 'bg-[#1E1A16] text-[#7A6E60] border-[#3D3328] hover:text-[#E8E0D4]'
        }`}>
        <Wrench size={10} /> DEV
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 border border-[#3D3328] bg-[#1E1A16] p-3 shadow-xl rounded-lg">
          <p className="text-xs font-bold mb-2 border-b border-[#3D3328] pb-1 text-[#D4A943]" style={{ fontFamily: "'Cinzel', serif" }}>Admin Tools</p>
          <div className="mb-2">
            <label className="text-[10px] font-mono text-[#7A6E60] block mb-0.5">Set All Levels</label>
            <div className="flex gap-1">
              <input type="number" min={1} max={99} value={allLevel} onChange={(e) => setAllLevel(Math.min(99, Math.max(1, Number(e.target.value))))}
                className="w-14 px-1 py-0.5 text-[10px] font-mono border border-[#3D3328] bg-[#0D0B09] text-[#E8E0D4] rounded" />
              <button onClick={() => adminSetAllLevels(allLevel)} className={btnBase}>Set</button>
            </div>
          </div>
          <div className="mb-2">
            <label className="text-[10px] font-mono text-[#7A6E60] block mb-0.5">Add GP</label>
            <div className="flex gap-1 flex-wrap">
              {[1_000, 10_000, 100_000, 1_000_000].map((amt) => (
                <button key={amt} onClick={() => adminAddGp(amt)} className={btnBase}>+{amt >= 1_000_000 ? '1M' : `${amt / 1_000}K`}</button>
              ))}
            </div>
          </div>
          <div className="mb-2">
            <label className="text-[10px] font-mono text-[#7A6E60] block mb-0.5">Add Bounty Marks</label>
            <div className="flex gap-1 flex-wrap">
              {[10, 50, 100, 500].map((amt) => (<button key={amt} onClick={() => adminAddBountyMarks(amt)} className={btnBase}>+{amt}</button>))}
            </div>
          </div>
          <div className="mb-2">
            <label className="text-[10px] font-mono text-[#7A6E60] block mb-0.5">Set Skill Level</label>
            <div className="flex gap-1">
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value as SkillId)}
                className="w-24 px-1 py-0.5 text-[10px] font-mono border border-[#3D3328] bg-[#0D0B09] text-[#E8E0D4] rounded">
                {ALL_SKILLS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
              <input type="number" min={1} max={99} value={skillLevel} onChange={(e) => setSkillLevel(Math.min(99, Math.max(1, Number(e.target.value))))}
                className="w-12 px-1 py-0.5 text-[10px] font-mono border border-[#3D3328] bg-[#0D0B09] text-[#E8E0D4] rounded" />
              <button onClick={() => adminSetLevel(selectedSkill, skillLevel)} className={btnBase}>Set</button>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#3D3328]">
            <button onClick={() => { if (confirmReset) { adminResetSave(); setConfirmReset(false); } else { setConfirmReset(true); } }}
              onBlur={() => setConfirmReset(false)}
              className={`w-full px-2 py-1 text-[10px] font-mono border cursor-pointer transition-colors rounded ${
                confirmReset ? 'border-red-600 bg-red-600 text-white' : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
              }`}>{confirmReset ? 'Are you sure?' : 'Reset Save'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
