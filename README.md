# Party Idle — Clickpocalypse-Style Auto-Explorer

*Branch: `clickpocalypse-pivot` — pivoted from the earlier solo-skill Imperial Idle on 2026-04-18.*

Inspired by **Clickpocalypse II**. The player assembles a party of 4 heroes who auto-explore tile-based dungeons, fight, loot, and level on their own. You make the decisions that matter: equipment, ability picks, which dungeon to tackle, and the occasional dungeon-event choice.

## Core Loop
1. Pick a dungeon from the **Dungeon Board**.
2. Watch your party move tile-to-tile, auto-fighting monsters and auto-looting.
3. Respond to **Decision Events** (fountains, forks, suspicious chests) within 60s.
4. Boss dies → dungeon unlocked → back to Town. Party wipes → carried back, gold hit.
5. In **Town**: equip loot from the Stash, learn new abilities, recruit heroes at the Tavern, revive the dead at the Temple, rest at the Inn, stock potions at the Shop.
6. Repeat at higher floors or harder dungeons.

## Architecture

```
src/cc/
  types.ts                 — Hero, Dungeon, Tile, Ability, Item, GameState
  data/
    classes.ts             — 6 hero classes (Knight, Priest, Mage, Rogue, Ranger, Barbarian)
    abilities.ts           — per-class ability trees
    monsters.ts             — 25+ monsters across 9 dungeon tiers
    dungeons.ts            — 9 dungeons with infinite-scaling floors
    items.ts               — weapons, armor, trinkets, potions, materials
    names.ts               — randomized hero names
  engine/
    tick.ts                — master game loop (10Hz, speed 1× / 2× / 4×)
    combat.ts              — real-time combat with cooldowns and abilities
    exploration.ts         — tile-by-tile auto-movement
    dungeonGen.ts          — procedural dungeon + encounter generator
    loot.ts                — loot rolls, tiered drop pools, auto-sell
    decisions.ts           — decision events
    progression.ts         — XP curve, level-up, ability points
    offline.ts             — up to 8h offline catch-up
    util.ts                — stats, HP/MP formulas, rarity colors
  useGame.ts               — React hook wrapping state, tick, persistence
  App.tsx                  — main shell (Sidebar + HUD + Tabs)
  components/
    Sidebar, HUDBar, DungeonView, PartyView, StashView,
    TownView, CombatLog, DecisionModal
```

## Game Design Notes
- **Party size 4** (bench for extras). Starts with Knight + Priest, 100 gp, 3 healing potions.
- **9 dungeons** from *Sewer Warrens* (L1) to *Abyss Gate* (L70, infinite scaling).
- **Tile kinds:** entrance, monster, chest, trap, shrine, fountain, fork, merchant, boss, exit.
- **Combat:** each combatant has its own attack timer; abilities have cooldowns and MP cost.
- **Decisions:** fountain / fork / chest / merchant modals with 60s auto-pick fallback.
- **Persistence:** localStorage save every 5s + on unload. Offline catch-up computes batched rewards on reload.
- **No active skill-clicking** — everything is observed and decided at town or on modal pop-ups.

## Running
```
npm install
npm run dev       # http://localhost:3000 (or 3001 if 3000 is busy)
npm run build
npm run lint      # tsc --noEmit
```

## Design Doc
See `CLICKPOCALYPSE_DESIGN.md` for the full pivot design and what was kept from the original Imperial Idle.

## Previous Branch
The original solo-skill OSRS-clone implementation is preserved on `main` and `backup-original-state`.
