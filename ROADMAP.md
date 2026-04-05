# Project Chimera — Roadmap
*Updated: 2026-04-04*

## Current State
- Branch `main` has all features
- Branch `backup-original-state` has the untouched original code
- Build: passing, zero TS errors
- Tech: React 19 + TypeScript + Tailwind 4 + Vite 6 + Framer Motion

---

## Completed

### Priority 1: Visual Overhaul ✅
- [x] Rarity color system across all views (bank, skills, dashboard, notifications)
- [x] Loot drop animations — Diablo-style loot beam overlay with rarity-specific effects
- [x] Level-up celebration — full-screen gold flash + particle burst
- [x] Skill action progress bar pulse/glow at 85%+
- [x] OSRS-style item tooltips on hover (bank, skill view, equipment slots)
- [x] Dashboard visual upgrade — color-coded skill cards by category (gathering/combat/artisan/support)
- [x] Quest completion fanfare overlay
- [x] Bank visual polish — rarity glow borders, shimmer on legendary/celestial, stack glow scaling
- [x] Rarity-specific sound effects (rare/epic/legendary/celestial drops, level-up)

### Priority 2: Gameplay Depth ✅
- [x] Gem socketing UI + logic (5 gems, 12 socketable items, full UI in bank modal)
- [x] Achievement/milestone system (35 achievements, 6 categories, 4 tiers, dedicated view + sidebar tab)
- [x] Dry streak protection (2x expected rate → scaling boost, capped at 50%)
- [x] Item sets completion tracker (4 sets visualized in collection log)
- [x] Empire skill expanded (6 → 11 actions, every 10 levels now has content)
- [x] Prayer skill expanded (5 → 10 actions, altar/sacred/divine rituals at higher levels)

### Priority 3: Content Expansion ✅
- [x] Pet system — 21 skill pets, ~1/3000 chance, auto-equip, dashboard display
- [x] Clue scroll treasure trail system — 4 tiers, 7 exclusive rewards, reward chains
- [x] 3 new mid-game bosses (Stoneguard Titan L50, Shadowfang Alpha L70, Tidecaller Leviathan L80)

### Priority 4: Technical ✅
- [x] Save file export/import (JSON download/upload in admin panel)
- [x] Offline progress calculation + "Welcome Back" overlay
- [x] Performance — memoized VaultItem component (React.memo)
- [x] Audio toggle (master SFX on/off in header, persisted)
- [x] New SFX: sell (coin clink), equip (metallic clank), quest start (horn)

### Celestial Forge Expansion ✅
- [x] 5 new relics: Fortune Star (+50% luck), Iron Will (combat speed), Gatherer's Grace (gathering speed), Golden Touch (2x GP), Timeless Mastery (2x ascension bonuses)
- [x] All relic effects fully implemented in game logic

### Bug Fixes ✅
- [x] Gems returned to inventory on unequip (was losing permanently)
- [x] UNIQUE DROP + PET DROP events now trigger loot beam overlay
- [x] Offline progress no longer has localStorage race condition
- [x] Shop consumables section added (was useless after early game)

---

## Remaining / Future Ideas

### Gameplay
- [ ] **Construction skill** — build kingdom structures for passive bonuses
- [ ] **Fletching as proper skill** — currently mixed into crafting/woodcutting
- [ ] **More crafting recipes** — fill gaps in intermediate tiers
- [ ] **More set bonuses** — expand equipment sets so there are meaningful gear choices
- [ ] **Prestige system** — beyond ascension, whole-account prestige for massive bonuses
- [ ] **Seasonal events** — limited-time content with exclusive rewards

### Quality of Life
- [ ] **XP curve rework** — current cubic formula isn't OSRS-style back-loaded enough (L80 should = halfway to 100)
- [ ] **Mobile polish** — ensure touch targets are good, swipe navigation
- [ ] **Code splitting** — constants.ts is 2200+ lines, consider splitting by category
- [ ] **Keyboard shortcuts** — quick-switch between skills, cancel action
- [ ] **Auto-sell** — configure items to auto-sell on pickup

### Social / Multiplayer
- [ ] **Leaderboards** — total level, GP, collection log completion
- [ ] **Trading** — player-to-player item exchange
- [ ] **Guilds** — shared progression bonuses
- [ ] **Story/lore** — named NPCs, kingdom narrative
