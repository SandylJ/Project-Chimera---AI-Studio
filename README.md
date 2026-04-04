# Imperial Idle: Design & Development Guide

## 🏰 Project Vision
Imperial Idle is a high-fidelity incremental RPG inspired by the depth and "hoarding" satisfaction of Old School RuneScape (OSRS). The goal is to create a game where every item has a purpose, the "Bank" (Treasury) is a source of pride, and the progression loop is driven by a complex web of skill interdependencies.

## 🛠️ Architecture & Workflow

### Core State Management (`src/useGame.ts`)
- **Single Source of Truth:** The `PlayerState` object in `useGame.ts` manages everything: GP, Essence, Skills, Inventory, Equipment, Active Edicts, Buffs, and Kingdom workers.
- **Action Loop:** A `useInterval` hook (or `setInterval` in `useEffect`) handles the "ticking" of active actions. It calculates success based on level, processes inputs/outputs, and rolls for rare drops.
- **Luck System:** A global `luck` stat (derived from equipment and potions) scales the probability of hitting the `RARE_DROP_TABLE`. Items like `Ring of Wealth` and `Luck Potion` are key for rare hunting.
- **Salvage System:** Players can "Salvage" equipment in the Treasury. This destroys the item but grants `Essence` and potentially other materials (like `Iron` or `Steel` from junk items).
- **Set Bonuses:** Certain equipment sets (e.g., `Void`, `Justiciar`, `Ancestral`) provide massive global buffs when all pieces are equipped.

### Data Definitions (`src/constants.ts`)
- **ITEMS:** Every item is defined here with metadata: `rarity`, `type`, `value`, `stats`, and `setBonus`.
- **ACTIONS:** Defines the skill activities. Crucially, actions can have multiple `inputs` and `outputs` with varying `chance` values.
- **RARE_DROP_TABLE:** A global table rolled on *every* successful action, providing that "lottery" feel.

### Treasury (Bank) & Hoarding
- **OSRS Vibe:** The Treasury is designed to hold hundreds of unique items. Players are encouraged to "hoard" resources for later use in complex crafting chains (e.g., `Bones` -> `Bone Meal` -> `Prayer Potions`).
- **Collection Log:** Rare trophies and unique drops (like `Dragon Lord Trophy`) serve as long-term goals for completionists.
- **Organization:** Items are sorted by rarity and type, making a "beefy" bank feel rewarding to look at.

## 🎨 Stylistic Choices
- **Typography:** Inter for UI, JetBrains Mono for data/stats.
- **Color Palette:** Deep emeralds, rich golds, and obsidian blacks to evoke a "Royal/Imperial" theme.
- **Rarity Colors:**
  - `common`: Gray
  - `uncommon`: Green
  - `rare`: Blue
  - `epic`: Purple
  - `legendary`: Orange
  - `celestial`: Cyan/Glow

## 🚀 Roadmap for the Next Agent

### 1. 🧪 Advanced Alchemy & Herblore
- Implement a "Brewing" action that requires multiple herbs and secondary ingredients (e.g., "Dragon Scale Dust").
- Add more complex buffs: "Double XP", "Auto-Salvage", "Instant Tick".

### 2. ⚔️ Slayer & Bossing
- Create a "Slayer" skill where players are assigned tasks to kill specific monsters.
- Implement "Boss" actions that are high-duration, high-risk, but drop "Uniques" (1/5000 rarity items).

### 3. 📦 Bank Organization
- Add "Tabs" to the Treasury (BankView) to allow players to categorize their loot (Resources, Gear, Potions, Junk).
- Implement a "Search" bar for the inventory.

### 4. 🔨 Socketing & Augmentation
- Allow players to "Socket" the Gems (Ruby, Diamond, etc.) into equipment with empty slots to customize stats.

### 5. 🏰 Kingdom Expansion
- Expand the `KingdomView` to include "Buildings" that provide passive global buffs (e.g., "Blacksmith" reduces Smithing duration).

## 📝 Tips for Implementation
- **Item Repurposing:** When adding new items, always ask: "What skill can use this as an input?" (e.g., monster bones -> Prayer XP, flax -> Bowstrings).
- **The "OSRS Vibe":** Keep drop rates low for the best items. The satisfaction comes from the grind and the eventual "big drop."
- **Performance:** As the inventory grows, ensure `BankView` remains performant (memoize item components).

---
*Developed with ❤️ for the Imperial Empire.*
