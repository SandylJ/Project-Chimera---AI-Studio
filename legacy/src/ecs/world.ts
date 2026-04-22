// ═══════════════════════════════════════════════════════════════
//  ECS World — Miniplex agent entities synced from game state
//  Pure data layer. No rendering. No React state mutations.
// ═══════════════════════════════════════════════════════════════

import { World } from 'miniplex';
import { PlayerState, SkillId } from '../types';
import { KINGDOM_WORKERS } from '../constants';

// ── Agent visual types ──────────────────────────────────────
export type AgentType = 'warrior' | 'mage' | 'ranger' | 'worker';
export type AgentVisualState = 'idle' | 'walking' | 'working';

// ── Location map (matches PixelWorldView LOCS) ─────────────
// All coords in world-space pixels (32px grid cells)
const WORLD_COLS = 40;
const WORLD_ROWS = 30;
export const TILE_SIZE = 32;
export const WORLD_W = WORLD_COLS * TILE_SIZE; // 1280
export const WORLD_H = WORLD_ROWS * TILE_SIZE; //  960

interface LocationDef {
  id: string;
  cx: number; // center x in world px
  cy: number; // center y in world px
  radius: number; // scatter radius for multiple agents
}

// Mapped from the existing LOCS (0-1 normalized) → world pixels
const LOCATIONS: Record<string, LocationDef> = {
  castle:   { id: 'castle',   cx: 0.50 * WORLD_W, cy: 0.50 * WORLD_H, radius: 48 },
  mine:     { id: 'mine',     cx: 0.12 * WORLD_W, cy: 0.20 * WORLD_H, radius: 40 },
  forge:    { id: 'forge',    cx: 0.28 * WORLD_W, cy: 0.72 * WORLD_H, radius: 32 },
  forest:   { id: 'forest',   cx: 0.82 * WORLD_W, cy: 0.18 * WORLD_H, radius: 48 },
  workshop: { id: 'workshop', cx: 0.68 * WORLD_W, cy: 0.75 * WORLD_H, radius: 32 },
  river:    { id: 'river',    cx: 0.85 * WORLD_W, cy: 0.55 * WORLD_H, radius: 36 },
  kitchen:  { id: 'kitchen',  cx: 0.35 * WORLD_W, cy: 0.28 * WORLD_H, radius: 28 },
  arena:    { id: 'arena',    cx: 0.15 * WORLD_W, cy: 0.72 * WORLD_H, radius: 36 },
  library:  { id: 'library',  cx: 0.72 * WORLD_W, cy: 0.32 * WORLD_H, radius: 28 },
  temple:   { id: 'temple',   cx: 0.50 * WORLD_W, cy: 0.12 * WORLD_H, radius: 32 },
  barracks: { id: 'barracks', cx: 0.22 * WORLD_W, cy: 0.48 * WORLD_H, radius: 32 },
  tower:    { id: 'tower',    cx: 0.88 * WORLD_W, cy: 0.82 * WORLD_H, radius: 28 },
};

// Skill → location mapping (same as PixelWorldView.skillLoc)
const SKILL_TO_LOC: Record<string, string> = {
  mining: 'mine', woodcutting: 'forest', fishing: 'river',
  hunting: 'forest', farming: 'forest',
  smithing: 'forge', cooking: 'kitchen', herblore: 'kitchen',
  crafting: 'workshop', runecrafting: 'tower',
  thieving: 'castle', agility: 'arena',
  attack: 'arena', strength: 'barracks', defense: 'barracks',
  magic: 'tower', ranged: 'arena', prayer: 'temple',
  empire: 'castle', raids: 'arena', slayer: 'forest',
  construction: 'workshop',
};

// Worker → visual agent type based on primary skill
function workerToAgentType(skillId: SkillId): AgentType {
  if (['attack', 'strength', 'defense', 'raids', 'slayer'].includes(skillId)) return 'warrior';
  if (['magic', 'prayer', 'runecrafting'].includes(skillId)) return 'mage';
  if (['ranged', 'agility', 'hunting'].includes(skillId)) return 'ranger';
  return 'worker';
}

// Agent color palette keyed by type
export const AGENT_COLORS: Record<AgentType, number> = {
  warrior: 0x882222,
  mage:    0x6633aa,
  ranger:  0x336633,
  worker:  0x7a5533,
};

// ── Entity schema ───────────────────────────────────────────
export interface AgentEntity {
  // Identity
  id: string;
  workerId: string;
  instanceIndex: number; // which copy of this worker (0, 1, 2...)
  agentType: AgentType;
  skillId: SkillId;
  label: string; // display name

  // Spatial — mutable each tick, never set via React setState
  position: { x: number; y: number };
  target: { x: number; y: number };
  home: { x: number; y: number };

  // Visual state machine
  visualState: AgentVisualState;
  stateTimer: number; // seconds remaining in current state
  color: number;
}

// ── The world ───────────────────────────────────────────────
export const ecsWorld = new World<AgentEntity>();

// Derived queries — used by renderers
export const movingAgents = ecsWorld.with('position', 'target', 'visualState');
export const allAgents = ecsWorld.with('position', 'visualState');

// ── HMR safety: reset all module-level mutable state ────────
export function resetECS(): void {
  for (const entity of [...ecsWorld.entities]) {
    ecsWorld.remove(entity);
  }
  _trackedIds.clear();
  _workEventQueue.length = 0;
  _workerBonusMap = null;
}

// ── Deterministic scatter within a location ─────────────────
function scatterPosition(loc: LocationDef, index: number, total: number): { x: number; y: number } {
  if (total <= 1) return { x: loc.cx, y: loc.cy };
  // Golden-angle spiral for even distribution
  const angle = index * 2.399963; // golden angle in radians
  const r = loc.radius * Math.sqrt(index / total);
  return {
    x: loc.cx + Math.cos(angle) * r,
    y: loc.cy + Math.sin(angle) * r,
  };
}

// ── Sync: game state → ECS world ────────────────────────────
// Call this every time PlayerState changes. It diffs the kingdom
// record against existing entities and creates/removes as needed.

const _trackedIds = new Set<string>();

export function syncFromGameState(state: PlayerState): void {
  const desiredIds = new Set<string>();

  // Build desired agent set from kingdom workers
  for (const worker of KINGDOM_WORKERS) {
    const count = state.kingdom[worker.id] || 0;
    for (let i = 0; i < count; i++) {
      const agentId = `${worker.id}_${i}`;
      desiredIds.add(agentId);

      if (!_trackedIds.has(agentId)) {
        // New agent — spawn it
        const locId = SKILL_TO_LOC[worker.primarySkillId] || 'castle';
        const loc = LOCATIONS[locId] || LOCATIONS.castle;
        const home = scatterPosition(loc, i, count);

        ecsWorld.add({
          id: agentId,
          workerId: worker.id,
          instanceIndex: i,
          agentType: workerToAgentType(worker.primarySkillId),
          skillId: worker.primarySkillId,
          label: worker.name,
          position: { x: LOCATIONS.castle.cx, y: LOCATIONS.castle.cy }, // spawn at castle
          target: { x: home.x, y: home.y },
          home: { x: home.x, y: home.y },
          visualState: 'walking',
          stateTimer: 0,
          color: AGENT_COLORS[workerToAgentType(worker.primarySkillId)],
        });
        _trackedIds.add(agentId);
      }
    }
  }

  // Remove agents that no longer exist in game state
  for (const tracked of _trackedIds) {
    if (!desiredIds.has(tracked)) {
      const entity = [...ecsWorld.entities].find(e => e.id === tracked);
      if (entity) ecsWorld.remove(entity);
      _trackedIds.delete(tracked);
    }
  }
}

// ── Work-completion event queue ─────────────────────────────
// Drained by VisualDashboard each frame to spawn FloatingText.
export interface WorkCompleteEvent {
  agentId: string;
  workerId: string;
  x: number;
  y: number;
  bonusType: 'gp' | 'xp' | 'celestial_essence';
  bonusValue: number;
  label: string;
}

const _workEventQueue: WorkCompleteEvent[] = [];

export function drainWorkEvents(): WorkCompleteEvent[] {
  return _workEventQueue.splice(0, _workEventQueue.length);
}

// Worker bonus lookup (cached on first call)
let _workerBonusMap: Map<string, { bonusType: 'gp' | 'xp' | 'celestial_essence'; bonusValue: number; label: string }> | null = null;

function getWorkerBonus(workerId: string) {
  if (!_workerBonusMap) {
    _workerBonusMap = new Map();
    for (const w of KINGDOM_WORKERS) {
      const label = w.bonusType === 'gp'
        ? `+${w.bonusValue} GP`
        : w.bonusType === 'xp'
          ? `+${w.bonusValue} XP`
          : `+${w.bonusValue} Essence`;
      _workerBonusMap.set(w.id, {
        bonusType: w.bonusType,
        bonusValue: w.bonusValue,
        label,
      });
    }
  }
  return _workerBonusMap.get(workerId);
}

// ── Tick: autonomous agent behaviour ────────────────────────
// Called from PixiJS useTick. Mutates entity position/state
// directly — never triggers React renders.
const WALK_SPEED = 80; // pixels per second
const IDLE_MIN = 1.5;
const IDLE_MAX = 4.0;
const WORK_MIN = 2.0;
const WORK_MAX = 5.0;

export function tickAgents(deltaSec: number): void {
  for (const agent of ecsWorld.entities) {
    switch (agent.visualState) {
      case 'walking': {
        const dx = agent.target.x - agent.position.x;
        const dy = agent.target.y - agent.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          // Arrived
          agent.position.x = agent.target.x;
          agent.position.y = agent.target.y;
          agent.visualState = 'working';
          agent.stateTimer = WORK_MIN + Math.random() * (WORK_MAX - WORK_MIN);
        } else {
          const step = Math.min(WALK_SPEED * deltaSec, dist);
          agent.position.x += (dx / dist) * step;
          agent.position.y += (dy / dist) * step;
        }
        break;
      }

      case 'working': {
        agent.stateTimer -= deltaSec;
        if (agent.stateTimer <= 0) {
          // Done working → emit work-complete event for floating text
          const bonus = getWorkerBonus(agent.workerId);
          if (bonus) {
            _workEventQueue.push({
              agentId: agent.id,
              workerId: agent.workerId,
              x: agent.position.x,
              y: agent.position.y,
              bonusType: bonus.bonusType,
              bonusValue: bonus.bonusValue,
              label: bonus.label,
            });
          }

          agent.visualState = 'idle';
          agent.stateTimer = IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
        }
        break;
      }

      case 'idle': {
        agent.stateTimer -= deltaSec;
        if (agent.stateTimer <= 0) {
          // Pick a new destination: either home or castle (round-trip)
          const atHome =
            Math.abs(agent.position.x - agent.home.x) < 4 &&
            Math.abs(agent.position.y - agent.home.y) < 4;

          if (atHome) {
            // Walk to castle to "deliver"
            agent.target.x = LOCATIONS.castle.cx + (Math.random() - 0.5) * 30;
            agent.target.y = LOCATIONS.castle.cy + (Math.random() - 0.5) * 30;
          } else {
            // Walk back home to "work"
            agent.target.x = agent.home.x;
            agent.target.y = agent.home.y;
          }
          agent.visualState = 'walking';
        }
        break;
      }
    }
  }
}

// ── Get location center for floating text spawn ─────────────
export function getLocationCenter(skillId: SkillId): { x: number; y: number } {
  const locId = SKILL_TO_LOC[skillId] || 'castle';
  const loc = LOCATIONS[locId] || LOCATIONS.castle;
  return { x: loc.cx, y: loc.cy };
}

export { LOCATIONS };
