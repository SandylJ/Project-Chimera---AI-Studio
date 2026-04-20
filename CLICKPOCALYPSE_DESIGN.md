# Clickpocalypse-Style Pivot — Design Document
*Branch: `clickpocalypse-pivot` — cut from `main` 2026-04-18*

## Core Loop

Player watches a 4-hero party auto-explore a tile-based dungeon. Heroes auto-move, auto-fight, auto-loot, auto-heal. Player returns the party to Town to equip gear, pick abilities on level-up, recruit new heroes, and choose the next dungeon. Occasional **Decision Events** pop a modal ("Drink from the fountain? Open the chest? Take the left path?"). Everything runs idle — offline catch-up when you come back.

## Non-Goals (what we drop from old Chimera)
- Solo skill grinding (Mining/Woodcutting/etc. as *player* skills). Heroes replace this.
- Player as the unit of progression. Party is the unit now.
- Kingdom worker idle-income model (workers become recruitable heroes).
- Active skill-clicking. No active action button — everything is observed.

## What We Keep / Reuse
- **Item/rarity system** — Common→Celestial, tooltips, stats, sockets, gems. Items become hero-equippable loot.
- **PixelWorldView** engine — refactored to render the **dungeon tile map** with party dots.
- **Achievements, pets, collection log, quests** — all still fit (party-level progression).
- **Audio/SFX, floating text, level-up celebration** — reusable as-is.
- **Save/load, offline progress scaffolding** — extend for new tick model.

---

## Party

- **Max size:** 4 active heroes. Up to 8 on bench in Tavern.
- **Starting party:** Knight (tank) + Priest (healer). Recruit the rest.
- **Classes (6 total):**
  - **Knight** — tank. High HP/def, shield bash, taunt. Starts unlocked.
  - **Priest** — healer. Heals weakest ally, smite undead. Starts unlocked.
  - **Mage** — caster. High DPS magic AOE, mana-gated.
  - **Rogue** — DPS. Backstab, poison, high crit, lockpicks chests for bonus loot.
  - **Ranger** — ranged DPS. Precise shot, tames dungeon pets.
  - **Barbarian** — bruiser. Rage mechanic, cleave, no armor.

### Hero Model
```
Hero {
  id, classId, name, level, xp
  hp / maxHp, mp / maxMp
  stats: { str, dex, int, con, spd, luck }
  equipment: { weapon, offhand, head, body, legs, feet, neck, ring }
  socketedGems: Record<slot, itemId[]>
  abilities: Ability[]           // unlocked this run
  cooldowns: Record<abilityId, msRemaining>
  aiTargetPriority: 'lowest_hp' | 'highest_threat' | 'ranged_first'
  state: 'alive' | 'downed' | 'dead'  // dead = need temple revive
}
```

### Hero AI (combat)
- Each tick (100ms): if any usable ability off-cooldown and valid target → cast highest priority ability. Else auto-attack target.
- Target selection: tanks grab highest-threat; DPS targets lowest-HP enemy; healers target lowest-HP ally below 70%.
- Health auto-manage: Priest auto-heals when ally < 50% HP and heal is off cooldown.

---

## Dungeon

### Structure
A dungeon is a **grid of tiles** (e.g. 10×10) with a connected path from entrance to boss. Tiles are revealed as the party enters. Fog-of-war on unexplored tiles.

### Tile Types
- **Empty** — corridor, no event.
- **Monster** — encounter (1–4 enemies scaled to dungeon floor).
- **Chest** — loot drop (rogue unlock = +loot quality).
- **Trap** — damages party unless rogue disarms (dex check).
- **Shrine** — buff for next N tiles OR full heal.
- **Fountain** — decision event (drink for random buff/debuff).
- **Fork** — decision event (left path easier loot, right harder boss).
- **Merchant** — rare, sell/buy in dungeon.
- **Boss** — final tile, unlocks next dungeon.
- **Exit** — return-to-town portal (always back at entrance).

### Exploration
- Party occupies one tile at a time. Every `N * speed` ms (baseline 4s/tile), moves to next unexplored tile along shortest path to boss.
- Entering Monster/Chest/Trap/Shrine triggers appropriate resolution (combat / loot / dmg / buff) before advancing.
- Party **auto-retreats to town** when: all healers dead, total party HP <30% and no healer, OR boss defeated.

### Dungeon List (launch set)
1. **Sewer Warrens** — L1, rats/slimes. Intro.
2. **Goblin Camp** — L5, goblins/shamans.
3. **Ancient Crypt** — L10, undead (priests shine).
4. **Spider Hollow** — L15, spiders + poison traps.
5. **Ice Caverns** — L22, ice elementals.
6. **Volcanic Forge** — L30, fire demons.
7. **Sunken Temple** — L40, aquatic beasts.
8. **Dragon's Lair** — L55, boss: Ancient Wyrm.
9. **Abyss Gate** — L70, endgame rotating content.

Each dungeon has a **floor counter** — beat boss → harder variant unlocks (N+1). Infinite scaling past dungeon 9.

---

## Combat

Real-time with cooldowns, not turn-based. Each enemy and hero has its own attack timer.

```
onTick(dt) {
  for each combatant:
    if stunned/dead → skip
    cooldowns[*] -= dt
    attackTimer -= dt
    if attackTimer <= 0:
       pick target per AI rule
       for each ability if ready and valid: cast, return
       else auto-attack target
       attackTimer = 1000 / (speed stat)
}
```

Damage = `max(1, attackerStr * weaponPower - defenderDef * 0.5)` plus crit roll.
Magic = int-scaled, bypasses def but consumes MP.

---

## Loot & Economy

- Monsters drop GP + 0–N item rolls. Items use the existing `Item` type (rarity, stats, equipment slot).
- **Loot is auto-picked up** into Party Stash (shared).
- In Town, open Stash → equip to heroes, sell, socket gems, disenchant for essence.
- Currency: **GP** (buy gear/potions), **Essence** (prestige/celestial forge), **Bounty Marks** (event shop).
- Auto-sell rules by rarity remain (carry over from Chimera).

## Progression
- XP shared across party. On ally kill, XP splits by contribution.
- Level-up → **Ability Point**. Spend in Town on class ability tree.
- Every 10 hero levels → stat card upgrade (+max HP/MP, +base stats).
- Ascension/prestige carries over from Chimera: prestige token grants global party buffs.

## Idle / Offline
- Active tick: 10Hz.
- Speed buttons: 1× / 2× / 4×. (Unlock 4× after dungeon 3 cleared.)
- Offline catch-up: on load, simulate up to 8h at 1× via simplified batch resolver (estimate tiles cleared, monsters killed, avg loot).

## Decision Events (examples)
Fires ~1–2× per dungeon run. Pauses party until player responds OR 60s auto-default.
- **Fountain:** Drink / Ignore. Drink = random buff (+20% dmg next fight) OR random debuff (-20% HP next fight). Priest presence = no debuff outcome.
- **Fork:** Left (easy, +gold) / Right (hard, +rare loot).
- **Chest:** Force open / Have rogue pick (requires rogue in party, lower trap chance) / Skip.
- **Wounded adventurer:** Help (use potion charge, gain ally for 1 fight) / Rob (GP, alignment hit) / Ignore.

---

## UI Structure

Tabs (left rail):
- **Dungeon** — main view. Pixel grid, party dots, fog, HUD bar showing each hero's HP/MP + active ability.
- **Party** — hero cards. Equip, ability tree, stats.
- **Stash** — loot bank. Sell/socket/disenchant.
- **Town** — tavern (recruit), shop, temple (revive), smith (upgrade), dungeon board (pick next).
- **Quests / Log** — event log of combat + drops + decisions made.
- **Achievements / Collection** — unchanged from Chimera.

**HUD bar (always visible):** party HP/MP bars, current dungeon + floor, speed toggle, pause button.

---

## File Layout (new)

```
src/
  types/
    hero.ts       — Hero, HeroClass, Ability, AbilityEffect
    dungeon.ts    — Dungeon, Tile, Encounter
    combat.ts     — Combatant, DamageEvent
    game.ts       — GameState, PartyState, TownState
    item.ts       — (ported from existing types.ts; trimmed)
  data/
    classes.ts
    abilities.ts
    monsters.ts
    dungeons.ts
    items.ts
  engine/
    tick.ts       — master loop
    combat.ts     — damage/targeting
    exploration.ts— tile reveal/move
    loot.ts       — drop rolls
    decisions.ts  — decision event resolution
    offline.ts    — batch catch-up
  useGame.ts      — Zustand-less simple React store (or keep existing pattern)
  App.tsx         — tab shell
  components/
    DungeonView.tsx
    PartyView.tsx
    HeroCard.tsx
    StashView.tsx
    TownView.tsx
    CombatLog.tsx
    DecisionModal.tsx
    HUDBar.tsx
```

Old files moved to `src/_legacy/` to remain buildable during transition, then deleted at end.

## Implementation Phases

- **P1** Types + data + engine (headless, console-logged tick).
- **P2** Minimal UI: DungeonView + PartyView, tick visible.
- **P3** Combat visible (damage numbers, HP bars), loot to stash.
- **P4** Town hub (recruit, shop, temple, dungeon board).
- **P5** Decisions, offline catch-up, save/load for new state.
- **P6** Delete old solo-skill code, polish.

---

## Open Questions (defaulting these)
- Party size 4 (default, matches CC2).
- Start w/ 2 heroes, recruit up to 4 active. ✓
- Drop the solo 22-skill system entirely — classes replace them. ✓
- Dungeon floor infinite scaling past 9. ✓
- Keep items/rarity/pets/achievements from Chimera. ✓
- Kingdom workers removed; converted to recruitable tavern heroes list. ✓
