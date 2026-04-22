# legacy/ — archived reference code

**Do not import anything here from `src/`.** This directory is out of the TypeScript build (`tsconfig.json` excludes it) and is not wired into any entry point. It exists purely as reference material.

## What's here

`legacy/src/` — the pre-pivot **Imperial Idle** implementation. A solo-skill OSRS-clone with a kingdom of workers, quest system, collection log, ECS experiments, and a pixel world view.

| File / dir | What it was |
|------------|-------------|
| `App.tsx` | Old root shell with tab-based kingdom UI |
| `useGame.ts` | Old game hook — worker assignments, skill XP, quest state |
| `constants.ts` | ~2000 lines: ITEMS, ACTIONS, WORKERS, drop tables |
| `types.ts` | Old type system (incompatible with new `src/types.ts`) |
| `questData.ts` | 28 quest definitions |
| `collectionLogData.ts` | 20 collection log categories |
| `achievementData.ts` | Achievement definitions |
| `components/` | SkillView, BankView, KingdomView, PixelWorldView, DashboardView, CelestialForgeView, QuestView, ShopView, CollectionLogView, AchievementView, BountyBoardView, AdminPanel, Layout, EventLog, FloatingText, LevelUpOverlay, LootDropOverlay, QuestCompleteOverlay, AnimatedCounter, AgentSprite, VisualDashboard |
| `ecs/` | Miniplex-based ECS world scaffold (WIP, never shipped) |

`legacy/check_consistency.ts` — old standalone script that cross-checked ITEMS vs ACTIONS in `constants.ts`.

## Why keep it

Some of the mechanics (skills, quests, collection log, pixel world agents) are candidates to re-introduce into the new party-idle game. When designing a new system, it's useful to see how it worked before, what the data schema was, and which drop tables were tuned.

## If you want to run the old version

Check out the `backup-original-state` branch — the original Imperial Idle is fully wired up there with its own `src/` entry points.
