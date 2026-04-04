import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameEvent } from '../useGame';

interface EventLogProps {
  events: GameEvent[];
  showNotifications?: boolean;
}

export function EventLog({ events, showNotifications = true }: EventLogProps) {
  if (!showNotifications) return null;

  return (
    <div className="fixed bottom-6 right-6 pointer-events-none z-50 space-y-2 flex flex-col items-end">
      <AnimatePresence initial={false}>
        {events.slice(0, 8).map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 50, scale: 0.8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, scale: 0.9, filter: 'blur(2px)' }}
            className={`px-3 py-2 border shadow-lg backdrop-blur-xl rounded-md self-end w-max max-w-xs transition-all duration-300 ${
              event.type === 'level' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-[#141414] font-bold shadow-yellow-500/20 border-yellow-600' : 
              event.rarity === 'celestial' ? 'bg-gradient-to-r from-cyan-400 via-white to-blue-400 text-[#141414] font-black shadow-cyan-500/50 border-cyan-300 animate-pulse scale-110' :
              event.rarity === 'legendary' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-purple-500/40 border-purple-400 animate-pulse' :
              event.rarity === 'epic' ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold shadow-red-500/30 border-red-400' :
              event.rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-blue-400/30 border-blue-300' :
              event.rarity === 'uncommon' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium border-green-400' :
              event.type === 'loot' ? 'bg-[#141414]/80 text-[#E4E3E0] border-[#E4E3E0]/10' : 
              'bg-[#E4E3E0]/80 text-[#141414] border-[#141414]/10'
            }`}
          >
            <div className="text-xs whitespace-nowrap font-serif italic tracking-tight flex items-center gap-2">
              {event.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
