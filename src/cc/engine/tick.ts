import { GameState } from '../types';
import { tickCombat } from './combat';
import { tickExploration } from './exploration';
import { resolveDecision } from './decisions';
import { tickSkilling } from './skilling';

const MAX_DT = 500; // clamp dt per tick

export function tickGame(state: GameState, dtRaw: number): void {
  if (state.paused) return;
  if (state.activeDecision) {
    // Auto-resolve on TTL
    if (Date.now() >= state.activeDecision.expiresAt) {
      resolveDecision(state, state.activeDecision.defaultOptionId);
    } else {
      return;
    }
  }
  const speed = state.speed;
  // Each real ms = speed game ms
  const dt = Math.min(dtRaw * speed, MAX_DT * speed);
  state.totalPlaytime += dt;

  tickSkilling(state, dt);

  tickCombat(state, dt);
  tickExploration(state, dt);
}
