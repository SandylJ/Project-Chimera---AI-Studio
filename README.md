# Party Idle — Clickpocalypse-Style Auto-Explorer

> **For AI agents / collaborators:** the active game lives in `src/`. That's it — no sub-folders to hunt for, no alternate branches. Anything under `legacy/` is archived reference code from earlier iterations (skills system, kingdom view, etc.) and must **not** be imported from `src/`. The `main` branch is always the canonical current version.

Inspired by **Clickpocalypse II**. The player assembles a party of 4 heroes who auto-explore tile-based dungeons, fight, loot, and level on their own. You make the decisions that matter: equipment, ability picks, which dungeon to tackle, and the occasional dungeon-event choice.

## Core Loop
1. Pick a dungeon from the **Dungeon Board**.
2. Watch your party move tile-to-tile, auto-fighting monsters and auto-looting.
3. Respond to **Decision Events** (fountains, forks, suspicious chests) within 60s.
4. Boss dies → dungeon unlocked → back to Town. Party wipes → carried back, gold hit.
5. In **Town**: equip loot from the Stash, learn new abilities, recruit heroes at the Tavern, revive the dead at the Temple, rest at the Inn, stock potions at the Shop. Workers assigned to skill stations produce materials and XP.
6. Repeat at higher floors or harder dungeons.

## Project Layout

```
src/                         — active game (the ONLY code that runs)
  main.tsx                   — entry point
  App.tsx                    — main shell (Sidebar + HUD + Tabs)
  index.css                  — Tailwind 4 + custom palette
  sounds.ts                  — SFX (level-up, rare-drop, tab click, etc.)
  useGame.ts                 — React hook: state, tick, persistence
  types.ts                   — Hero, Dungeon, Tile, Ability, Item, GameState
  data/                      — classes, abilities, monsters, dungeons, items, names
  engine/                    — tick, combat, exploration, dungeonGen, loot,
                               decisions, progression, offline, skilling, util
  components/                — Sidebar, HUDBar, DungeonView, PartyView, StashView,
                               TownView, TownSkillsView, CombatLog, DecisionModal,
                               BattleView, PixelMapView, ErrorBoundary, …
  visuals/                   — dungeonTheme, ClassSprite, MonsterSpriteArt

legacy/                      — archived, do NOT import from src/
  src/                       — pre-pivot Imperial Idle code (skills, kingdom view,
                               quest system, collection log, ECS experiments)
  check_consistency.ts       — old ITEMS/ACTIONS consistency checker
  README.md                  — what's in here and why it's kept
```

## Game Design Notes
- **Party size 4** (bench for extras). Starts with Knight + Priest, 100 gp, 3 healing potions.
- **9 dungeons** from *Sewer Warrens* (L1) to *Abyss Gate* (L70, infinite scaling).
- **Tile kinds:** entrance, monster, chest, trap, shrine, fountain, fork, merchant, boss, exit.
- **Combat:** each combatant has its own attack timer; abilities have cooldowns and MP cost.
- **Decisions:** fountain / fork / chest / merchant modals with 60s auto-pick fallback.
- **Skills (town):** Mining / Smithing / Woodcutting / Farming / Crafting / Herblore / Fishing / Cooking. Workers assigned at the Town plaza generate materials and XP. Dungeon loot feeds tier-appropriate materials (copper → runite, shrimp → anglerfish). Cooked food with `healOnUse` powers `quickHealParty` / `quickHealHero` mid-dungeon.
- **Persistence:** localStorage save every 5s + on unload. Offline catch-up (up to 8h) computes batched rewards on reload.
- **No active skill-clicking** — everything is observed and decided at town or on modal pop-ups.

## Running
```
npm install
npm run dev       # http://localhost:3000 (or 3001 if 3000 is busy)
npm run build
npm run lint      # tsc --noEmit
```

## Design Doc
`CLICKPOCALYPSE_DESIGN.md` — full pivot design and what was kept from Imperial Idle.
`ROADMAP.md` — prioritized feature list (note: some entries predate the pivot; cross-check against `src/`).

## History
- **2026-04-18** — pivoted from solo-skill Imperial Idle to Clickpocalypse-style party auto-explorer. Old code preserved in `legacy/` and on the `backup-original-state` branch.
- **2026-04-20** — pivot merged into `main`.
- **2026-04-22** — repo flattened: active game lives at `src/` root, legacy code moved to `legacy/`.
