# Project Chimera — Roadmap
*Updated: 2026-04-04*

## Current State
- Branch `sandil-expansion` has all new features (quest system, collection log, unique monster drops, bank upgrade)
- Branch `backup-original-state` has the untouched original code
- Build: passing, zero TS errors
- Tech: React 19 + TypeScript + Tailwind 4 + Vite 6 + Framer Motion

---

## Priority 1: Visual Overhaul (UI/UX)
The game is currently black-and-white. Patrick wants the loot/dopamine experience to be the star since it's a browser game competing with 3D MMOs on feel, not graphics.

- [ ] **Rarity color system** — consistent color theming for all rarity tiers across ALL views (not just bank). Items, drops, notifications, skill views should all respect rarity colors
- [ ] **Loot drop animations** — when rare+ items drop, show a satisfying animated popup (glow, scale, particle-like effects via CSS/Framer Motion). Think Diablo loot beam
- [ ] **Level-up celebration** — full-screen flash or banner animation on level up
- [ ] **Skill action progress** — make the progress bar more satisfying (pulse, glow on near-completion)
- [ ] **Dark mode** — the game is light theme only. Add dark mode toggle (many gamers prefer dark)
- [ ] **Item tooltips on hover** — OSRS-style tooltip showing stats/description without needing to click
- [ ] **Dashboard visual upgrade** — skill grid with color-coded progress, animated XP bars
- [ ] **Quest completion fanfare** — special animation when quest completes
- [ ] **Bank visual polish** — rarity glow borders, stacking animations, drag-and-drop reordering

## Priority 2: Gameplay Depth
- [ ] **Gem socketing UI + logic** — types support sockets but no implementation. Let players socket gems into equipment
- [ ] **Slayer task system** — NPC assigns specific monsters with bonus XP/loot for task completion
- [ ] **More actions for thin skills** — Hunting, Farming, Agility, Empire need more content
- [ ] **Kingdom buildings** — passive global buffs (Blacksmith: -10% smithing time, Library: +5% XP, etc.)
- [ ] **Achievement/milestone system** — "First 99", "1000 kills", "100k GP earned" etc. with rewards
- [ ] **Dry streak protection** — if you go 2x the expected rate without a rare drop, increase chance gradually
- [ ] **Item sets completion tracker** — show which pieces you have/need for each set
- [ ] **More set bonuses** — expand equipment sets so there are meaningful gear choices at every tier

## Priority 3: Content Expansion
- [ ] **More bosses** — each with unique mechanics (food consumption, rune costs, etc.) and signature loot tables
- [ ] **Clue scroll expansion** — full treasure trail system with tiered rewards
- [ ] **Fletching as proper skill** — currently mixed into crafting/woodcutting
- [ ] **Construction skill** — build kingdom structures for passive bonuses
- [ ] **More crafting recipes** — fill gaps in intermediate tiers
- [ ] **Pet system** — rare chance from any skill activity, cosmetic collectible

## Priority 4: Technical
- [ ] **Performance** — memoize item components in bank (could lag with 200+ items)
- [ ] **Code splitting** — constants.ts is 2000+ lines, consider splitting by category
- [ ] **Save file export/import** — let players backup their save
- [ ] **Offline progress** — calculate gains since last visit
- [ ] **Audio** — SFX for drops, level-ups, quest completion (optional toggle)
- [ ] **Mobile polish** — ensure touch targets are good, swipe navigation

## Priority 5: Future
- [ ] **Multiplayer** — leaderboards, trading, guilds (big scope)
- [ ] **Story/lore** — named NPCs, kingdom narrative
- [ ] **Seasonal events** — limited-time content with exclusive rewards
- [ ] **Prestige system** — beyond ascension, whole-account prestige for massive bonuses
