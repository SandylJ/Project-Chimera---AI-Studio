import { GameState, ActiveDecision, DecisionOption } from '../types';
import { aliveActiveHeroes, pushLog, mkId, rngInt, rollChance, rngChoice } from './util';
import { ITEMS } from '../data/items';
import { addToStash } from './loot';

const DECISION_TTL_MS = 60_000;

export function triggerDecision(state: GameState, kind: 'fountain' | 'fork' | 'chest' | 'merchant'): void {
  if (state.activeDecision) return;
  switch (kind) {
    case 'fountain':
      state.activeDecision = mkFountain(state);
      break;
    case 'fork':
      state.activeDecision = mkFork(state);
      break;
    case 'chest':
      state.activeDecision = mkChest(state);
      break;
    case 'merchant':
      state.activeDecision = mkMerchant(state);
      break;
  }
  if (state.activeDecision) {
    pushLog(state, 'decision', `❓ ${state.activeDecision.title}`);
  }
}

function mkFountain(state: GameState): ActiveDecision {
  const priestPresent = aliveActiveHeroes(state).some(h => h.classId === 'priest');
  return {
    id: mkId('dec'),
    kind: 'fountain',
    title: 'A Strange Fountain',
    icon: '⛲',
    description: priestPresent
      ? 'The waters glow. Your priest senses only blessings here.'
      : 'Glowing waters bubble unnaturally. It could heal — or hex.',
    options: [
      { id: 'drink', label: 'Drink', description: priestPresent ? 'Random buff.' : 'Random buff OR debuff.' },
      { id: 'skip', label: 'Ignore', description: 'Leave it untouched.' },
    ],
    defaultOptionId: 'skip',
    expiresAt: Date.now() + DECISION_TTL_MS,
    context: { priestPresent },
  };
}

function mkFork(state: GameState): ActiveDecision {
  return {
    id: mkId('dec'),
    kind: 'fork',
    title: 'Fork in the Path',
    icon: '🛤️',
    description: 'The corridor splits. Which way?',
    options: [
      { id: 'left', label: 'Left (Safe)', description: 'More gold, fewer enemies.' },
      { id: 'right', label: 'Right (Risky)', description: 'Rarer loot, more danger.' },
    ],
    defaultOptionId: 'left',
    expiresAt: Date.now() + DECISION_TTL_MS,
  };
}

function mkChest(state: GameState): ActiveDecision {
  const rogue = aliveActiveHeroes(state).find(h => h.classId === 'rogue');
  return {
    id: mkId('dec'),
    kind: 'chest',
    title: 'Suspicious Chest',
    icon: '📦',
    description: rogue ? `${rogue.name} spots a tripwire. Pick it?` : 'No rogue to pick the lock. Force it open?',
    options: [
      { id: 'force', label: 'Force open', description: 'Risk trap damage.' },
      { id: 'pick', label: 'Pick carefully', description: rogue ? 'Rogue attempts disarm.' : 'No rogue present.', disabled: !rogue },
      { id: 'skip', label: 'Walk away', description: 'Leave it.' },
    ],
    defaultOptionId: rogue ? 'pick' : 'skip',
    expiresAt: Date.now() + DECISION_TTL_MS,
  };
}

function mkMerchant(state: GameState): ActiveDecision {
  const offer = rngChoice(['greater_healing_potion', 'mana_potion', 'elixir_of_life']);
  const price = Math.floor((ITEMS[offer]?.value ?? 50) * 0.8);
  return {
    id: mkId('dec'),
    kind: 'merchant',
    title: 'Wandering Merchant',
    icon: '🧳',
    description: `A hooded figure offers 1× ${ITEMS[offer]?.name} for ${price} gp.`,
    options: [
      { id: 'buy', label: `Buy (${price} gp)`, description: `Add to stash.`, disabled: state.stash.gold < price, disabledReason: 'Not enough gold' },
      { id: 'skip', label: 'Decline', description: 'Move on.' },
    ],
    defaultOptionId: 'skip',
    expiresAt: Date.now() + DECISION_TTL_MS,
    context: { offer, price },
  };
}

export function resolveDecision(state: GameState, optionId: string): void {
  const dec = state.activeDecision;
  if (!dec) return;
  const alive = aliveActiveHeroes(state);
  switch (dec.kind) {
    case 'fountain': {
      if (optionId === 'drink') {
        const good = dec.context?.priestPresent || rollChance(0.7);
        if (good) {
          for (const h of alive) { h.hp = h.maxHp; h.mp = h.maxMp; }
          pushLog(state, 'heal', '💧 The fountain heals the party!');
        } else {
          for (const h of alive) { h.hp = Math.max(1, Math.floor(h.hp * 0.6)); }
          pushLog(state, 'system', '🩸 The waters were cursed! Party wounded.');
        }
      } else {
        pushLog(state, 'decision', 'Fountain left untouched.');
      }
      break;
    }
    case 'fork': {
      if (optionId === 'left') {
        state.stash.gold += rngInt(20, 60);
        pushLog(state, 'loot', '🪙 Safer path rewards extra gold.');
      } else {
        if (rollChance(0.4)) {
          // drop a random rare-tier item
          const pool = ['ring_of_power', 'swift_boots', 'lucky_charm'];
          const item = rngChoice(pool);
          addToStash(state, item, 1);
          pushLog(state, 'loot', `🎁 Rare find on the risky path!`, 'rare');
        } else {
          for (const h of alive) h.hp = Math.max(1, Math.floor(h.hp * 0.7));
          pushLog(state, 'system', '⚠ Ambush! Party wounded on risky path.');
        }
      }
      break;
    }
    case 'chest': {
      if (optionId === 'force') {
        if (rollChance(0.45)) {
          // Trap
          for (const h of alive) h.hp = Math.max(1, h.hp - 30);
          pushLog(state, 'system', '💥 The chest was trapped!');
        } else {
          addToStash(state, rngChoice(['greater_healing_potion', 'lucky_charm', 'iron_sword']), 1);
          pushLog(state, 'loot', '📦 Chest forced open!');
        }
      } else if (optionId === 'pick') {
        addToStash(state, rngChoice(['ring_of_power', 'lucky_charm', 'greater_healing_potion']), 1);
        pushLog(state, 'loot', '🗝 Chest picked cleanly!', 'rare');
      }
      break;
    }
    case 'merchant': {
      if (optionId === 'buy') {
        const { offer, price } = dec.context ?? {};
        if (state.stash.gold >= price) {
          state.stash.gold -= price;
          addToStash(state, offer, 1);
          pushLog(state, 'loot', `🧳 Purchased ${ITEMS[offer]?.name}.`);
        }
      }
      break;
    }
  }
  state.activeDecision = undefined;
}
