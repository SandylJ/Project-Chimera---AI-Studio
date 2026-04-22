import { GameState } from '../types';
import { pushLog } from './util';
import { addToStash, removeFromStash } from './loot';

// Define the available actions for each skill.
export interface SkillActionDef {
  id: string;
  name: string;
  levelReq: number;
  duration: number;  // base ms per completed cycle
  xpReward: number;
  inputs?: Record<string, number>;
  outputs?: Record<string, number>;
}

export const SKILL_ACTIONS: Record<string, SkillActionDef[]> = {
  mining: [
    { id: 'mine_copper',   name: 'Mine Copper',    levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { copper_ore: 1 } },
    { id: 'mine_tin',      name: 'Mine Tin',       levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { tin_ore: 1 } },
    { id: 'mine_iron',     name: 'Mine Iron',      levelReq: 15, duration: 5000, xpReward: 35,  outputs: { iron_ore: 1 } },
    { id: 'mine_silver',   name: 'Mine Silver',    levelReq: 20, duration: 5500, xpReward: 40,  outputs: { silver_ore: 1 } },
    { id: 'mine_coal',     name: 'Mine Coal',      levelReq: 30, duration: 6500, xpReward: 50,  outputs: { coal: 1 } },
    { id: 'mine_gold',     name: 'Mine Gold',      levelReq: 40, duration: 8000, xpReward: 65,  outputs: { gold_ore: 1 } },
    { id: 'mine_gems',     name: 'Mine Gem Rocks', levelReq: 40, duration: 12000,xpReward: 90,  outputs: { uncut_sapphire: 1 } },
    { id: 'mine_mithril',  name: 'Mine Mithril',   levelReq: 55, duration: 10000,xpReward: 80,  outputs: { mithril_ore: 1 } },
    { id: 'mine_adamant',  name: 'Mine Adamant',   levelReq: 70, duration: 13000,xpReward: 120, outputs: { adamant_ore: 1 } },
    { id: 'mine_runite',   name: 'Mine Runite',    levelReq: 85, duration: 22000,xpReward: 250, outputs: { runite_ore: 1 } },
    { id: 'mine_dragonite',name: 'Mine Dragonite', levelReq: 95, duration: 30000,xpReward: 420, outputs: { dragonite_ore: 1 } },
  ],

  woodcutting: [
    { id: 'chop_logs',     name: 'Chop Regular Logs', levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { logs: 1 } },
    { id: 'chop_oak',      name: 'Chop Oak',         levelReq: 15, duration: 5000, xpReward: 37,  outputs: { oak_logs: 1 } },
    { id: 'chop_willow',   name: 'Chop Willow',      levelReq: 30, duration: 7000, xpReward: 67,  outputs: { willow_logs: 1 } },
    { id: 'chop_teak',     name: 'Chop Teak',        levelReq: 35, duration: 7500, xpReward: 85,  outputs: { teak_logs: 1 } },
    { id: 'chop_maple',    name: 'Chop Maple',       levelReq: 45, duration: 9000, xpReward: 100, outputs: { maple_logs: 1 } },
    { id: 'chop_mahogany', name: 'Chop Mahogany',    levelReq: 50, duration: 10000,xpReward: 125, outputs: { mahogany_logs: 1 } },
    { id: 'chop_yew',      name: 'Chop Yew',         levelReq: 60, duration: 11000,xpReward: 175, outputs: { yew_logs: 1 } },
    { id: 'chop_magic',    name: 'Chop Magic',       levelReq: 75, duration: 14000,xpReward: 250, outputs: { magic_logs: 1 } },
    { id: 'chop_elder',    name: 'Chop Elder',       levelReq: 90, duration: 22000,xpReward: 425, outputs: { elder_logs: 1 } },
  ],

  smithing: [
    // ---- Smelt bars ----
    { id: 'smelt_bronze',   name: 'Smelt Bronze Bar',  levelReq: 1,  duration: 2500, xpReward: 6,  inputs: { copper_ore: 1, tin_ore: 1 }, outputs: { bronze_bar: 1 } },
    { id: 'smelt_iron',     name: 'Smelt Iron Bar',    levelReq: 15, duration: 3000, xpReward: 12, inputs: { iron_ore: 1 },               outputs: { iron_bar: 1 } },
    { id: 'smelt_silver',   name: 'Smelt Silver Bar',  levelReq: 20, duration: 3500, xpReward: 14, inputs: { silver_ore: 1 },             outputs: { silver_bar: 1 } },
    { id: 'smelt_steel',    name: 'Smelt Steel Bar',   levelReq: 30, duration: 4000, xpReward: 17, inputs: { iron_ore: 1, coal: 2 },      outputs: { steel_bar: 1 } },
    { id: 'smelt_gold',     name: 'Smelt Gold Bar',    levelReq: 40, duration: 4500, xpReward: 22, inputs: { gold_ore: 1 },               outputs: { gold_bar: 1 } },
    { id: 'smelt_mithril',  name: 'Smelt Mithril Bar', levelReq: 50, duration: 5000, xpReward: 30, inputs: { mithril_ore: 1, coal: 4 },   outputs: { mithril_bar: 1 } },
    { id: 'smelt_adamant',  name: 'Smelt Adamant Bar', levelReq: 70, duration: 6000, xpReward: 37, inputs: { adamant_ore: 1, coal: 6 },   outputs: { adamant_bar: 1 } },
    { id: 'smelt_runite',   name: 'Smelt Runite Bar',  levelReq: 85, duration: 8000, xpReward: 50, inputs: { runite_ore: 1, coal: 8 },    outputs: { runite_bar: 1 } },
    { id: 'smelt_dragonite',name: 'Smelt Dragonite Bar',levelReq:95, duration: 12000,xpReward: 80, inputs: { dragonite_ore: 1, coal: 12 },outputs: { dragonite_bar: 1 } },

    // ---- Bronze set ----
    { id: 'smith_bronze_sword',    name: 'Smith Bronze Sword',    levelReq: 1,  duration: 4000, xpReward: 12, inputs: { bronze_bar: 1 }, outputs: { bronze_sword: 1 } },
    { id: 'smith_bronze_helm',     name: 'Smith Bronze Helm',     levelReq: 3,  duration: 4500, xpReward: 16, inputs: { bronze_bar: 2 }, outputs: { bronze_helm: 1 } },
    { id: 'smith_bronze_platelegs',name: 'Smith Bronze Platelegs',levelReq: 8,  duration: 5500, xpReward: 24, inputs: { bronze_bar: 3 }, outputs: { bronze_platelegs: 1 } },
    { id: 'smith_bronze_platebody',name: 'Smith Bronze Platebody',levelReq: 12, duration: 7000, xpReward: 32, inputs: { bronze_bar: 4 }, outputs: { bronze_platebody: 1 } },
    // ---- Iron set ----
    { id: 'smith_iron_sword',      name: 'Smith Iron Sword',      levelReq: 15, duration: 5000, xpReward: 25, inputs: { iron_bar: 1 }, outputs: { iron_sword: 1 } },
    { id: 'smith_iron_helm',       name: 'Smith Iron Helm',       levelReq: 20, duration: 6500, xpReward: 32, inputs: { iron_bar: 2 }, outputs: { iron_helm: 1 } },
    { id: 'smith_iron_platelegs',  name: 'Smith Iron Platelegs',  levelReq: 24, duration: 8000, xpReward: 48, inputs: { iron_bar: 3 }, outputs: { iron_platelegs: 1 } },
    { id: 'smith_iron_platebody',  name: 'Smith Iron Platebody',  levelReq: 28, duration: 10000,xpReward: 64, inputs: { iron_bar: 4 }, outputs: { iron_platebody: 1 } },
    // ---- Steel set ----
    { id: 'smith_steel_sword',     name: 'Smith Steel Longsword', levelReq: 30, duration: 6000, xpReward: 37, inputs: { steel_bar: 2 }, outputs: { steel_longsword: 1 } },
    { id: 'smith_steel_helm',      name: 'Smith Steel Helm',      levelReq: 35, duration: 7500, xpReward: 42, inputs: { steel_bar: 2 }, outputs: { steel_helm: 1 } },
    { id: 'smith_steel_platelegs', name: 'Smith Steel Platelegs', levelReq: 40, duration: 10000,xpReward: 65, inputs: { steel_bar: 3 }, outputs: { steel_platelegs: 1 } },
    { id: 'smith_steel_platebody', name: 'Smith Steel Platebody', levelReq: 45, duration: 13000,xpReward: 90, inputs: { steel_bar: 4 }, outputs: { steel_platebody: 1 } },
    // ---- Mithril set ----
    { id: 'smith_mithril_sword',   name: 'Smith Mithril Longsword',  levelReq: 50, duration: 7000, xpReward: 50, inputs: { mithril_bar: 2 }, outputs: { mithril_sword: 1 } },
    { id: 'smith_mithril_helm',    name: 'Smith Mithril Helm',       levelReq: 55, duration: 8500, xpReward: 60, inputs: { mithril_bar: 2 }, outputs: { mithril_helm: 1 } },
    { id: 'smith_mithril_platelegs',name:'Smith Mithril Platelegs',  levelReq: 60, duration: 11000,xpReward: 85, inputs: { mithril_bar: 3 }, outputs: { mithril_platelegs: 1 } },
    { id: 'smith_mithril_platebody',name:'Smith Mithril Platebody',  levelReq: 65, duration: 15000,xpReward: 110,inputs: { mithril_bar: 4 }, outputs: { mithril_platebody: 1 } },
    // ---- Adamant set ----
    { id: 'smith_adamant_sword',   name: 'Smith Adamant Longsword',  levelReq: 70, duration: 8000, xpReward: 65, inputs: { adamant_bar: 2 }, outputs: { adamant_sword: 1 } },
    { id: 'smith_adamant_helm',    name: 'Smith Adamant Helm',       levelReq: 75, duration: 10000,xpReward: 75, inputs: { adamant_bar: 2 }, outputs: { adamant_helm: 1 } },
    { id: 'smith_adamant_platelegs',name:'Smith Adamant Platelegs',  levelReq: 80, duration: 13000,xpReward: 105,inputs: { adamant_bar: 3 }, outputs: { adamant_platelegs: 1 } },
    { id: 'smith_adamant_platebody',name:'Smith Adamant Platebody',  levelReq: 84, duration: 18000,xpReward: 140,inputs: { adamant_bar: 4 }, outputs: { adamant_platebody: 1 } },
    // ---- Runite set ----
    { id: 'smith_runite_sword',    name: 'Smith Runite Longsword',   levelReq: 85, duration: 10000,xpReward: 85, inputs: { runite_bar: 2 }, outputs: { runite_sword: 1 } },
    { id: 'smith_runite_helm',     name: 'Smith Runite Helm',        levelReq: 88, duration: 13000,xpReward: 100,inputs: { runite_bar: 2 }, outputs: { runite_helm: 1 } },
    { id: 'smith_runite_platelegs',name: 'Smith Runite Platelegs',   levelReq: 92, duration: 17000,xpReward: 140,inputs: { runite_bar: 3 }, outputs: { runite_platelegs: 1 } },
    { id: 'smith_runite_platebody',name: 'Smith Runite Platebody',   levelReq: 99, duration: 24000,xpReward: 200,inputs: { runite_bar: 4 }, outputs: { runite_platebody: 1 } },
  ],

  crafting: [
    // ---- Cut gems ----
    { id: 'cut_sapphire',   name: 'Cut Sapphire',   levelReq: 20, duration: 2500, xpReward: 30,  inputs: { uncut_sapphire: 1 }, outputs: { sapphire: 1 } },
    { id: 'cut_emerald',    name: 'Cut Emerald',    levelReq: 27, duration: 2500, xpReward: 40,  inputs: { uncut_emerald: 1 },  outputs: { emerald: 1 } },
    { id: 'cut_ruby',       name: 'Cut Ruby',       levelReq: 34, duration: 3000, xpReward: 60,  inputs: { uncut_ruby: 1 },     outputs: { ruby: 1 } },
    { id: 'cut_diamond',    name: 'Cut Diamond',    levelReq: 43, duration: 3500, xpReward: 90,  inputs: { uncut_diamond: 1 },  outputs: { diamond: 1 } },
    // ---- Cloth / bowstring ----
    { id: 'spin_flax',      name: 'Spin Bowstring', levelReq: 10, duration: 1500, xpReward: 15,  inputs: { flax: 1 },            outputs: { bowstring: 1 } },
    // ---- Armor ----
    { id: 'craft_leather_vest',name:'Craft Leather Vest',levelReq: 8, duration: 4500, xpReward: 22, inputs: { leather: 3, thread: 1 }, outputs: { leather_vest: 1 } },
    { id: 'craft_cloth_robe',  name:'Craft Cloth Robe',  levelReq: 5, duration: 4000, xpReward: 25, inputs: { spider_silk: 3 },         outputs: { cloth_robe: 1 } },
    // ---- Fletching (bows + staves) ----
    { id: 'fletch_short_bow',  name:'Fletch Short Bow',  levelReq: 10, duration: 5000, xpReward: 35, inputs: { logs: 2, bowstring: 1 },        outputs: { short_bow: 1 } },
    { id: 'fletch_oak_staff',  name:'Fletch Oak Staff',  levelReq: 15, duration: 6000, xpReward: 45, inputs: { oak_logs: 2, bone_shard: 1 },   outputs: { oak_staff: 1 } },
    { id: 'fletch_yew_longbow',name:'Fletch Yew Longbow',levelReq: 40, duration: 8000, xpReward: 90, inputs: { yew_logs: 2, bowstring: 2 },    outputs: { yew_longbow: 1 } },
    { id: 'fletch_elven_bow',  name:'Fletch Elven Bow',  levelReq: 55, duration: 10000,xpReward: 130,inputs: { magic_logs: 2, bowstring: 2, emerald: 1 }, outputs: { elven_bow: 1 } },
    { id: 'craft_archon_staff',name:'Craft Archon Staff',levelReq: 65, duration: 12000,xpReward: 180,inputs: { magic_logs: 2, demon_horn: 2, sapphire: 1 }, outputs: { archon_staff: 1 } },
    // ---- Jewelry ----
    { id: 'craft_sapphire_ring',  name:'Craft Sapphire Ring',  levelReq: 25, duration: 4000, xpReward: 55,  inputs: { silver_bar: 1, sapphire: 1 }, outputs: { sapphire_ring: 1 } },
    { id: 'craft_emerald_ring',   name:'Craft Emerald Ring',   levelReq: 32, duration: 4500, xpReward: 78,  inputs: { silver_bar: 1, emerald: 1 },  outputs: { emerald_ring: 1 } },
    { id: 'craft_ruby_ring',      name:'Craft Ruby Ring',      levelReq: 40, duration: 5500, xpReward: 115, inputs: { gold_bar: 1, ruby: 1 },       outputs: { ruby_ring: 1 } },
    { id: 'craft_diamond_ring',   name:'Craft Diamond Ring',   levelReq: 50, duration: 7000, xpReward: 180, inputs: { gold_bar: 1, diamond: 1 },    outputs: { diamond_ring: 1 } },
    { id: 'craft_sapphire_amulet',name:'Craft Sapphire Amulet',levelReq: 28, duration: 4500, xpReward: 65,  inputs: { silver_bar: 2, sapphire: 1 }, outputs: { sapphire_amulet: 1 } },
    { id: 'craft_emerald_amulet', name:'Craft Emerald Amulet', levelReq: 35, duration: 5000, xpReward: 95,  inputs: { silver_bar: 2, emerald: 1 },  outputs: { emerald_amulet: 1 } },
    { id: 'craft_ruby_amulet',    name:'Craft Ruby Amulet',    levelReq: 44, duration: 6500, xpReward: 150, inputs: { gold_bar: 2, ruby: 1 },       outputs: { ruby_amulet: 1 } },
    { id: 'craft_diamond_amulet', name:'Craft Diamond Amulet', levelReq: 55, duration: 8000, xpReward: 240, inputs: { gold_bar: 2, diamond: 1 },    outputs: { diamond_amulet: 1 } },
  ],

  herblore: [
    { id: 'mix_attack_pot',   name: 'Mix Attack Potion',   levelReq: 3,  duration: 2000, xpReward: 25,  inputs: { herbs: 1,    vial_of_water: 1 }, outputs: { attack_potion: 1 } },
    { id: 'mix_defense_pot',  name: 'Mix Defense Potion',  levelReq: 6,  duration: 2000, xpReward: 30,  inputs: { herbs: 2,    vial_of_water: 1 }, outputs: { defense_potion: 1 } },
    { id: 'mix_health_pot',   name: 'Mix Healing Potion',  levelReq: 10, duration: 2500, xpReward: 40,  inputs: { herbs: 2,    vial_of_water: 1 }, outputs: { healing_potion: 1 } },
    { id: 'mix_mana_pot',     name: 'Mix Mana Potion',     levelReq: 15, duration: 3000, xpReward: 50,  inputs: { herbs: 2,    vial_of_water: 1, glowing_mushroom: 1 }, outputs: { mana_potion: 1 } },
    { id: 'mix_strength_pot', name: 'Mix Strength Potion', levelReq: 22, duration: 3200, xpReward: 65,  inputs: { toadflax: 1, vial_of_water: 1 }, outputs: { strength_potion: 1 } },
    { id: 'mix_magic_pot',    name: 'Mix Magic Potion',    levelReq: 28, duration: 3500, xpReward: 78,  inputs: { ranarr: 1,   vial_of_water: 1, glowing_mushroom: 1 }, outputs: { magic_potion: 1 } },
    { id: 'mix_ranging_pot',  name: 'Mix Ranging Potion',  levelReq: 28, duration: 3500, xpReward: 78,  inputs: { ranarr: 1,   vial_of_water: 1, feathers: 5 }, outputs: { ranging_potion: 1 } },
    { id: 'mix_super_attack', name: 'Mix Super Attack',    levelReq: 40, duration: 4500, xpReward: 120, inputs: { avantoe: 1,  vial_of_water: 1, ruby: 1 }, outputs: { super_attack: 1 } },
    { id: 'mix_super_defense',name: 'Mix Super Defense',   levelReq: 48, duration: 5000, xpReward: 140, inputs: { kwuarm: 1,   vial_of_water: 1, diamond: 1 }, outputs: { super_defense: 1 } },
    { id: 'mix_prayer_pot',   name: 'Mix Prayer Potion',   levelReq: 55, duration: 5500, xpReward: 175, inputs: { ranarr: 1,   vial_of_water: 1, bone_shard: 3 }, outputs: { prayer_potion: 1 } },
    { id: 'mix_saradomin',    name: 'Mix Saradomin Brew',  levelReq: 72, duration: 7000, xpReward: 260, inputs: { cadantine: 1,vial_of_water: 1, celestial_dust: 1 }, outputs: { saradomin_brew: 1 } },
    { id: 'mix_elixir_life',  name: 'Mix Elixir of Life',  levelReq: 85, duration: 10000,xpReward: 400, inputs: { cadantine: 1,vial_of_water: 1, dragon_scale: 1, diamond: 1 }, outputs: { elixir_of_life: 1 } },
  ],

  fishing: [
    { id: 'net_shrimp',       name: 'Net Shrimp',         levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { raw_shrimp: 1 } },
    { id: 'bait_sardine',     name: 'Bait Sardine',       levelReq: 5,  duration: 4500, xpReward: 20,  outputs: { raw_sardine: 1 } },
    { id: 'flyfish_trout',    name: 'Flyfish Trout',      levelReq: 20, duration: 5500, xpReward: 50,  outputs: { raw_trout: 1 } },
    { id: 'flyfish_salmon',   name: 'Flyfish Salmon',     levelReq: 30, duration: 6500, xpReward: 70,  outputs: { raw_salmon: 1 } },
    { id: 'bait_tuna',        name: 'Bait Tuna',          levelReq: 35, duration: 7000, xpReward: 80,  outputs: { raw_tuna: 1 } },
    { id: 'cage_lobster',     name: 'Cage Lobster',       levelReq: 40, duration: 8000, xpReward: 90,  outputs: { raw_lobster: 1 } },
    { id: 'harpoon_swordfish',name: 'Harpoon Swordfish',  levelReq: 50, duration: 9000, xpReward: 100, outputs: { raw_swordfish: 1 } },
    { id: 'net_monkfish',     name: 'Net Monkfish',       levelReq: 62, duration: 11000,xpReward: 120, outputs: { raw_monkfish: 1 } },
    { id: 'harpoon_shark',    name: 'Harpoon Shark',      levelReq: 76, duration: 15000,xpReward: 110, outputs: { raw_shark: 1 } },
    { id: 'net_manta_ray',    name: 'Net Manta Ray',      levelReq: 81, duration: 18000,xpReward: 150, outputs: { raw_manta_ray: 1 } },
    { id: 'harpoon_anglerfish',name:'Harpoon Anglerfish', levelReq: 82, duration: 20000,xpReward: 160, outputs: { raw_anglerfish: 1 } },
    { id: 'cage_dark_crab',   name: 'Cage Dark Crab',     levelReq: 85, duration: 22000,xpReward: 170, outputs: { raw_dark_crab: 1 } },
  ],

  farming: [
    // Free grows — slow, no inputs, steady yield of cooking/herblore reagents.
    { id: 'grow_wheat',      name: 'Grow Wheat',       levelReq: 1,  duration: 8000,  xpReward: 12,  outputs: { wheat: 1 } },
    { id: 'mill_flour',      name: 'Mill Flour',       levelReq: 3,  duration: 3000,  xpReward: 10,  inputs: { wheat: 2 },  outputs: { flour: 1 } },
    { id: 'harvest_flax',    name: 'Harvest Flax',     levelReq: 5,  duration: 6000,  xpReward: 18,  outputs: { flax: 1 } },
    { id: 'fill_vials',      name: 'Fill Water Vials', levelReq: 1,  duration: 2000,  xpReward: 5,   outputs: { vial_of_water: 1 } },
    { id: 'gather_feathers', name: 'Gather Feathers',  levelReq: 5,  duration: 5000,  xpReward: 14,  outputs: { feathers: 3 } },
    { id: 'grow_herbs',      name: 'Grow Herbs',       levelReq: 10, duration: 9000,  xpReward: 32,  outputs: { herbs: 1 } },
    { id: 'grow_mushrooms',  name: 'Grow Glow Shrooms',levelReq: 18, duration: 10000, xpReward: 50,  outputs: { glowing_mushroom: 1 } },
    { id: 'grow_toadflax',   name: 'Grow Toadflax',    levelReq: 25, duration: 12000, xpReward: 75,  outputs: { toadflax: 1 } },
    { id: 'grow_ranarr',     name: 'Grow Ranarr',      levelReq: 32, duration: 15000, xpReward: 110, outputs: { ranarr: 1 } },
    { id: 'grow_avantoe',    name: 'Grow Avantoe',     levelReq: 45, duration: 18000, xpReward: 160, outputs: { avantoe: 1 } },
    { id: 'grow_kwuarm',     name: 'Grow Kwuarm',      levelReq: 55, duration: 22000, xpReward: 220, outputs: { kwuarm: 1 } },
    { id: 'grow_cadantine',  name: 'Grow Cadantine',   levelReq: 70, duration: 28000, xpReward: 320, outputs: { cadantine: 1 } },
  ],

  cooking: [
    { id: 'cook_shrimp',      name: 'Cook Shrimp',        levelReq: 1,  duration: 2000, xpReward: 30,  inputs: { raw_shrimp: 1 },   outputs: { cooked_shrimp: 1 } },
    { id: 'cook_sardine',     name: 'Cook Sardine',       levelReq: 1,  duration: 2000, xpReward: 40,  inputs: { raw_sardine: 1 },  outputs: { cooked_sardine: 1 } },
    { id: 'cook_trout',       name: 'Cook Trout',         levelReq: 15, duration: 2500, xpReward: 70,  inputs: { raw_trout: 1 },    outputs: { cooked_trout: 1 } },
    { id: 'bake_bread',       name: 'Bake Bread',         levelReq: 14, duration: 3000, xpReward: 40,  inputs: { flour: 2, vial_of_water: 1 }, outputs: { bread: 1 } },
    { id: 'cook_salmon',      name: 'Cook Salmon',        levelReq: 25, duration: 2800, xpReward: 90,  inputs: { raw_salmon: 1 },   outputs: { cooked_salmon: 1 } },
    { id: 'cook_tuna',        name: 'Cook Tuna',          levelReq: 30, duration: 3000, xpReward: 110, inputs: { raw_tuna: 1 },     outputs: { cooked_tuna: 1 } },
    { id: 'cook_lobster',     name: 'Cook Lobster',       levelReq: 40, duration: 3500, xpReward: 120, inputs: { raw_lobster: 1 },  outputs: { cooked_lobster: 1 } },
    { id: 'bake_meat_pie',    name: 'Bake Meat Pie',      levelReq: 42, duration: 4500, xpReward: 150, inputs: { flour: 2, bone_shard: 2, vial_of_water: 1 }, outputs: { meat_pie: 1 } },
    { id: 'cook_swordfish',   name: 'Cook Swordfish',     levelReq: 45, duration: 4000, xpReward: 140, inputs: { raw_swordfish: 1 },outputs: { cooked_swordfish: 1 } },
    { id: 'cook_monkfish',    name: 'Cook Monkfish',      levelReq: 62, duration: 4500, xpReward: 180, inputs: { raw_monkfish: 1 }, outputs: { cooked_monkfish: 1 } },
    { id: 'cook_stew',        name: 'Cook Hearty Stew',   levelReq: 70, duration: 6000, xpReward: 280, inputs: { raw_shark: 1, herbs: 2, vial_of_water: 1 }, outputs: { hearty_stew: 1 } },
    { id: 'cook_shark',       name: 'Cook Shark',         levelReq: 80, duration: 5000, xpReward: 210, inputs: { raw_shark: 1 },    outputs: { cooked_shark: 1 } },
    { id: 'cook_manta_ray',   name: 'Cook Manta Ray',     levelReq: 91, duration: 5500, xpReward: 260, inputs: { raw_manta_ray: 1 },outputs: { cooked_manta_ray: 1 } },
    { id: 'cook_anglerfish',  name: 'Cook Anglerfish',    levelReq: 92, duration: 5500, xpReward: 280, inputs: { raw_anglerfish: 1 },outputs: { cooked_anglerfish: 1 } },
    { id: 'cook_dark_crab',   name: 'Cook Dark Crab',     levelReq: 95, duration: 6000, xpReward: 320, inputs: { raw_dark_crab: 1 },outputs: { cooked_dark_crab: 1 } },
  ],
};

function hasRequiredInputs(state: GameState, inputs?: Record<string, number>): boolean {
  if (!inputs) return true;
  for (const [itemId, qty] of Object.entries(inputs)) {
    if (qty > 0 && (state.stash.items[itemId] || 0) < qty) return false;
  }
  return true;
}

export function xpForLevel(level: number): number {
  // Simple cubic — lvl 2 ≈ 100xp, lvl 99 ≈ 12M.
  if (level <= 1) return 0;
  return Math.floor(0.25 * Math.pow(level, 3) * 50);
}

export function tickSkilling(state: GameState, dt: number) {
  if (!state.town || !state.town.workers) return;

  for (const worker of state.town.workers) {
    if (!worker.activeTask) continue;
    const task = worker.activeTask;
    const defs = SKILL_ACTIONS[task.skillId] || [];
    const actionDef = defs.find(d => d.id === task.actionId);

    if (!actionDef) {
      worker.activeTask = undefined;
      continue;
    }
    if (!hasRequiredInputs(state, actionDef.inputs)) {
      pushLog(state, 'system', `${worker.name} ran out of materials for ${actionDef.name}.`);
      worker.activeTask = undefined;
      continue;
    }

    task.progress += dt;
    while (task.progress >= task.duration) {
      task.progress -= task.duration;

      if (actionDef.inputs) {
        for (const [id, qty] of Object.entries(actionDef.inputs)) {
          if (qty > 0) removeFromStash(state, id, qty);
        }
      }
      if (actionDef.outputs) {
        for (const [id, qty] of Object.entries(actionDef.outputs)) {
          addToStash(state, id, qty);
        }
      }

      if (!state.skills[task.skillId]) {
        state.skills[task.skillId] = { level: 1, xp: 0 };
      }
      const sk = state.skills[task.skillId]!;
      sk.xp += actionDef.xpReward;

      while (sk.level < 99 && sk.xp >= xpForLevel(sk.level + 1)) {
        sk.level++;
        pushLog(state, 'level', `⬆ ${capitalize(task.skillId)} reached level ${sk.level}!`);
      }

      if (!hasRequiredInputs(state, actionDef.inputs)) {
        pushLog(state, 'system', `${worker.name} ran out of materials for ${actionDef.name}.`);
        worker.activeTask = undefined;
        break;
      }
    }
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
