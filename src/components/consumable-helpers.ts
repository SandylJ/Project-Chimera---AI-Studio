// Centralized predicate + label for the "Use/Open/Read/Drink" button in
// StashView and other consumable surfaces. Keeps the whitelist of
// actually-handled consumables in one place — when useGame.ts adds a
// new case to its useScroll switch, mirror it here so the UI offers
// the button.
import { Item } from '../types';

const USABLE_IDS = new Set<string>([
  // Loot containers
  'jewel_case', 'thieves_cache', 'stolen_scroll',
  // Tomes / brews
  'tome_of_mastery', 'wisdom_potion',
]);

export function isUsableConsumable(id: string, item: Item): boolean {
  if (!item || item.type !== 'consumable') return false;
  if (id.startsWith('scroll_')) return true;
  return USABLE_IDS.has(id);
}

export function useLabel(id: string): string {
  if (id === 'tome_of_mastery') return 'Read';
  if (id === 'wisdom_potion') return 'Drink';
  if (id.startsWith('scroll_')) return 'Use';
  return 'Open';
}
