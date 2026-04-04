import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameEvent } from '../useGame';

interface EventLogProps { events: GameEvent[]; showNotifications?: boolean; }

export function EventLog({ events, showNotifications = true }: EventLogProps) {
  if (!showNotifications) return null;
  return (
    <div className="fixed bottom-6 right-6 pointer-events-none z-50 space-y-2 flex flex-col items-end">
      <AnimatePresence initial={false}>
        {events.slice(0, 8).map((event) => (
          <motion.div key={event.id} initial={{ opacity: 0, x: 50, scale: 0.8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, x: 20, scale: 0.9, filter: 'blur(2px)' }}
            className={`px-3 py-2 border shadow-lg backdrop-blur-xl rounded-lg self-end w-max max-w-xs transition-all duration-300 ${
              event.type === 'level' ? 'bg-gradient-to-r from-[#D4A943] to-[#C17F4E] text-[#1A1510] font-bold border-[#B8922E]'
              : event.rarity === 'celestial' ? 'notif-pop notif-glow-celestial notif-shimmer bg-gradient-to-r from-cyan-400 via-white to-blue-400 text-[#1A1510] font-black border-cyan-300 scale-110'
              : event.rarity === 'legendary' ? 'notif-pop notif-glow-legendary bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold border-purple-400'
              : event.rarity === 'epic' ? 'notif-pop notif-glow-epic bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold border-red-400'
              : event.rarity === 'rare' ? 'notif-pop bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold border-blue-300'
              : event.rarity === 'uncommon' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium border-green-400'
              : event.type === 'loot' ? 'bg-[#1E1A16]/90 text-[#E8E0D4] border-[#3D3328]'
              : 'bg-[#1E1A16]/90 text-[#E8E0D4] border-[#3D3328]'
            }`}>
            <div className="text-xs whitespace-nowrap tracking-tight flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{event.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
