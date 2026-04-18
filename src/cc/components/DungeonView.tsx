import React, { useEffect, useRef } from 'react';
import { GameState, Tile } from '../types';
import { DUNGEON_DEFS } from '../data/dungeons';
import { CLASSES } from '../data/classes';

interface Props {
  state: GameState;
  enterDungeon: (id: string) => void;
}

export const DungeonView: React.FC<Props> = ({ state, enterDungeon }) => {
  const dungeon = state.activeDungeon;
  if (!dungeon) {
    return <DungeonPicker state={state} enterDungeon={enterDungeon} />;
  }
  return <DungeonGrid state={state} />;
};

const DungeonPicker: React.FC<Props> = ({ state, enterDungeon }) => {
  return (
    <div className="p-6 flex flex-col h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-[#F2E6A8] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
        Dungeon Board
      </h2>
      <p className="text-sm text-[#B8A890] mb-4">
        Choose where the party goes next. Your heroes will explore autonomously — you'll make the calls that matter.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(DUNGEON_DEFS).map(def => {
          const unlocked = state.unlockedDungeons.includes(def.id);
          const floor = (state.dungeonsCompleted[def.id] ?? 0) + 1;
          return (
            <button
              key={def.id}
              onClick={() => unlocked && enterDungeon(def.id)}
              disabled={!unlocked}
              className={`text-left p-4 rounded-lg border transition-all
                ${unlocked
                  ? 'bg-[#1E1A16] border-[#3D3328] hover:border-[#D4A943] hover:bg-[#2B231B] cursor-pointer'
                  : 'bg-[#0D0B09] border-[#1E1A16] opacity-40 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{def.icon}</span>
                <div>
                  <div className="text-lg font-bold text-[#F2E6A8]" style={{ fontFamily: "'Cinzel', serif" }}>
                    {def.name}
                  </div>
                  <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Min Level {def.minLevel} • Floor {floor}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#B8A890] leading-relaxed">{def.description}</p>
              {unlocked ? (
                <div className="mt-2 text-[10px] text-[#7FE2A0] font-bold">
                  ENTER →
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-[#E86E6E]">
                  LOCKED — clear previous dungeon
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DungeonGrid: React.FC<{ state: GameState }> = ({ state }) => {
  const d = state.activeDungeon!;
  const cellSize = Math.min(52, Math.floor(700 / Math.max(d.width, d.height)));
  const w = d.width * cellSize;
  const h = d.height * cellSize;

  const tileAt = (x: number, y: number) => d.tiles[y * d.width + x];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="mb-3 flex items-end gap-3">
        <div>
          <div className="text-xl font-bold text-[#F2E6A8]" style={{ fontFamily: "'Cinzel', serif" }}>
            {d.icon} {d.name}
          </div>
          <div className="text-[11px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Floor {d.floor} • Tile [{d.partyPos.x},{d.partyPos.y}] of [{d.width - 1},{d.height - 1}]
          </div>
        </div>
        <div className="ml-auto text-[10px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Next move in {Math.max(0, Math.ceil(d.moveTimer / 1000))}s
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-auto">
        <div
          className="relative bg-[#0A0806] border border-[#3D3328] rounded-lg p-2"
          style={{ width: w + 16, height: h + 16 }}
        >
          <div
            className="relative"
            style={{
              width: w,
              height: h,
              display: 'grid',
              gridTemplateColumns: `repeat(${d.width}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${d.height}, ${cellSize}px)`,
            }}
          >
            {d.tiles.map(t => (
              <TileCell key={`${t.x},${t.y}`} tile={t} size={cellSize}
                isParty={t.x === d.partyPos.x && t.y === d.partyPos.y} />
            ))}
          </div>
        </div>
      </div>

      <PartyStatus state={state} />
    </div>
  );
};

const TileCell: React.FC<{ tile: Tile; size: number; isParty: boolean }> = ({ tile, size, isParty }) => {
  const bg = tileBg(tile);
  const fg = tileFg(tile);
  const icon = tile.revealed ? tileIcon(tile) : '';
  return (
    <div
      className="relative flex items-center justify-center border border-[#0A0806] transition-all"
      style={{
        width: size, height: size,
        background: bg,
        color: fg,
        fontSize: Math.floor(size * 0.45),
      }}
    >
      <span>{icon}</span>
      {isParty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
          <div
            className="rounded-full border-2 border-[#F2E6A8] bg-[#D4A943]/30"
            style={{ width: size * 0.7, height: size * 0.7 }}
          />
        </div>
      )}
      {tile.encounter && tile.encounter.monsters.length > 0 && tile.revealed && (
        <div className="absolute bottom-0 right-0 text-[8px] bg-black/70 px-1 rounded-tl text-[#E86E6E] font-bold"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {tile.encounter.monsters.length}
        </div>
      )}
    </div>
  );
};

function tileBg(t: Tile): string {
  if (!t.revealed) return '#0A0806';
  if (t.cleared) return '#1A140E';
  switch (t.kind) {
    case 'entrance': return '#2B4024';
    case 'boss': return '#401A1A';
    case 'chest': return '#3D2E14';
    case 'trap': return '#401A2A';
    case 'shrine': return '#1A3D3D';
    case 'fountain': return '#1A2D40';
    case 'fork': return '#2E2D1A';
    case 'merchant': return '#402D1A';
    case 'monster': return '#2B1A1A';
    default: return '#14100C';
  }
}

function tileFg(t: Tile): string {
  return t.cleared ? '#7A6E60' : '#E8E0D4';
}

function tileIcon(t: Tile): string {
  switch (t.kind) {
    case 'entrance': return '🚪';
    case 'boss': return '👑';
    case 'chest': return t.cleared ? '' : '📦';
    case 'trap': return t.cleared ? '' : '⚠';
    case 'shrine': return t.cleared ? '' : '⛩';
    case 'fountain': return t.cleared ? '' : '⛲';
    case 'fork': return t.cleared ? '' : '🛤';
    case 'merchant': return t.cleared ? '' : '🧳';
    case 'monster': return t.cleared ? '' : '⚔';
    default: return '';
  }
}

const PartyStatus: React.FC<{ state: GameState }> = ({ state }) => {
  const active = state.heroes.filter(h => !h.bench);
  return (
    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
      {active.map(h => {
        const cls = CLASSES[h.classId];
        return (
          <div key={h.id} className={`bg-[#14100C] rounded border border-[#3D3328] p-2 ${h.state !== 'alive' ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex items-center gap-2 text-xs">
              <span>{cls.icon}</span>
              <span style={{ color: cls.color }} className="font-bold truncate">{h.name}</span>
              <span className="ml-auto text-[9px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>L{h.level}</span>
            </div>
            <div className="h-2 bg-black mt-1 rounded relative overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-700 to-green-400"
                   style={{ width: `${(h.hp / h.maxHp) * 100}%` }} />
              <div className="absolute inset-0 text-[8px] flex items-center justify-center font-bold"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {Math.ceil(h.hp)}/{h.maxHp}
              </div>
            </div>
            {h.shield > 0 && (
              <div className="text-[9px] text-[#6EA9E4] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                🛡 {h.shield}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
