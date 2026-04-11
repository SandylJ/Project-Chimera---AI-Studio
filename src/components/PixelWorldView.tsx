import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { PlayerState, SkillId } from '../types';
import { ACTIONS, KINGDOM_WORKERS, ITEMS } from '../constants';
import { GameEvent } from '../useGame';

// ═══════════════════════════════════════════════════════════════
//  PIXEL WORLD v6 — Living Kingdom with Zoom, Stockpiles & Flow
//  Camera system, inventory-driven visuals, duration-aware agents
// ═══════════════════════════════════════════════════════════════

interface PixelWorldProps {
  state: PlayerState;
  events: GameEvent[];
  activeTab?: string;
}

// ── Camera state ─────────────────────────────────────────────
interface Camera {
  zoom: number;    // 1.0 to 3.0
  panX: number;    // normalized offset (0-1 space)
  panY: number;
  targetZoom: number;
  targetPanX: number;
  targetPanY: number;
}

// ── Palette ──────────────────────────────────────────────────
const C = {
  // Grass - richer, more varied
  GRASS1:'#3a6030',GRASS2:'#4a7040',GRASS3:'#365828',GRASS4:'#507842',GRASS5:'#456a35',GRASS_DARK:'#2a4a20',
  // Dirt - warmer
  DIRT:'#7a6540',DIRT2:'#6a5530',DIRT3:'#8a7550',DIRT_DARK:'#5a4525',
  // Water - deeper, more vibrant
  WATER1:'#2050a0',WATER2:'#2860b0',WATER3:'#1840880',WATER_LIGHT:'#4080cc',WATER_SHORE:'#4a8048',WATER_DEEP:'#183878',WATER_FOAM:'#88bbdd',
  // Sand
  SAND:'#c8aa60',SAND2:'#b89850',
  // Stone
  STONE:'#7a7a7a',STONE_D:'#585858',STONE_L:'#9a9a9a',STONE_LL:'#b0b0b0',
  // Cave
  CAVE:'#3a3028',CAVE_D:'#2a2018',CAVE_L:'#4a4035',
  // Trees - lush
  TRUNK:'#5a3a22',TRUNK_L:'#6a4a30',TREE1:'#286028',TREE2:'#387038',TREE3:'#1e5020',TREE4:'#4a7a40',TREE_SHADOW:'rgba(0,0,0,0.12)',
  // Bushes
  BUSH1:'#2a5a22',BUSH2:'#387035',BUSH3:'#1e4a18',
  // Buildings
  WALL:'#8a7a6a',WALL_D:'#6a5a4a',WALL_L:'#a89a88',ROOF:'#8a4422',ROOF_D:'#6a3318',
  CASTLE_W:'#a09080',CASTLE_WD:'#887868',CASTLE_T:'#7a6a5a',CASTLE_TL:'#9a8a78',
  WOOD:'#7a5a3a',WOOD_D:'#5a4028',WOOD_L:'#9a7a55',
  // Characters
  SKIN:'#deb887',SKIN_D:'#c49a6c',HAIR:'#5a3a22',
  // UI
  GOLD:'#d4a943',GOLD_D:'#8a6e1e',GOLD_L:'#eac060',
  SPARK:'#ffd700',SPARK_W:'#fff',
  XP:'#00ff88',DMG:'#ff3333',
  // Fire
  FIRE1:'#ff7700',FIRE2:'#ffaa22',FIRE3:'#ffcc55',FIRE_GLOW:'rgba(255,140,40,0.08)',
  SMOKE:'rgba(80,70,60,0.25)',
  // Ores
  COPPER:'#c08040',IRON:'#a8a8a8',MITHRIL:'#4490cc',ADAMANT:'#40aa44',GOLD_ORE:'#d4a943',
  // Workers
  MINER:'#7a5533',SMITH:'#8a4422',LUMBER:'#336633',CARP:'#6a5a3a',
  FISHER:'#335577',CHEF:'#ddd',KNIGHT:'#666',SCHOLAR:'#4444aa',
  PRIEST:'#ddddcc',GENERAL:'#882222',ARCHMAGE:'#6633aa',
  // Ambient
  TORCH:'#ffcc44',TORCH_GLOW:'rgba(255,200,80,0.06)',LANTERN:'#ffeebb',
  FLOWER_PINK:'#ff6688',FLOWER_YELLOW:'#ffdd44',FLOWER_BLUE:'#6688ff',FLOWER_WHITE:'#eeeedd',
};

// ── Map locations (all coords 0-1) ───────────────────────────
interface Loc { id:string; name:string; x:number; y:number; r:number; terrain:string;
  building:string; workerIds:string[]; }

const LOCS: Loc[] = [
  {id:'castle',name:'Castle',x:0.50,y:0.50,r:0.07,terrain:'stone',building:'castle',workerIds:[]},
  {id:'mine',name:'Mine',x:0.12,y:0.20,r:0.055,terrain:'cave',building:'mine',workerIds:['worker_miner']},
  {id:'forge',name:'Forge',x:0.28,y:0.72,r:0.045,terrain:'stone',building:'forge',workerIds:['worker_blacksmith']},
  {id:'forest',name:'Forest',x:0.82,y:0.18,r:0.07,terrain:'grass',building:'cabin',workerIds:['worker_lumberjack']},
  {id:'workshop',name:'Workshop',x:0.68,y:0.75,r:0.045,terrain:'dirt',building:'cabin',workerIds:['worker_carpenter']},
  {id:'river',name:'River',x:0.85,y:0.55,r:0.05,terrain:'sand',building:'dock',workerIds:['worker_fisherman']},
  {id:'kitchen',name:'Kitchen',x:0.35,y:0.28,r:0.04,terrain:'stone',building:'kitchen',workerIds:['worker_chef']},
  {id:'arena',name:'Arena',x:0.15,y:0.72,r:0.05,terrain:'dirt',building:'arena',workerIds:['worker_knight']},
  {id:'library',name:'Library',x:0.72,y:0.32,r:0.04,terrain:'stone',building:'tower',workerIds:['worker_scholar']},
  {id:'temple',name:'Temple',x:0.50,y:0.12,r:0.045,terrain:'stone',building:'temple',workerIds:['worker_priest']},
  {id:'barracks',name:'Barracks',x:0.22,y:0.48,r:0.045,terrain:'dirt',building:'barracks',workerIds:['worker_general']},
  {id:'tower',name:'Mage Tower',x:0.88,y:0.82,r:0.04,terrain:'stone',building:'tower_mage',workerIds:['worker_archmage']},
];

const PATHS: [string,string][] = [
  ['castle','mine'],['castle','forge'],['castle','forest'],['castle','kitchen'],
  ['castle','barracks'],['castle','library'],['castle','arena'],['castle','temple'],
  ['castle','workshop'],['castle','river'],
  ['forge','mine'],['forest','library'],['kitchen','temple'],
  ['arena','barracks'],['river','workshop'],['workshop','tower'],
];

function skillLoc(s?:SkillId): string {
  if(!s) return 'castle';
  const m:Record<string,string> = {
    mining:'mine',woodcutting:'forest',fishing:'river',hunting:'forest',farming:'forest',
    smithing:'forge',cooking:'kitchen',herblore:'kitchen',crafting:'workshop',
    runecrafting:'temple',thieving:'arena',agility:'forest',
    attack:'arena',strength:'arena',defense:'barracks',magic:'tower',
    ranged:'arena',prayer:'temple',empire:'castle',raids:'arena',
    slayer:'arena',construction:'workshop',
  };
  return m[s]||'castle';
}

// Worker appearance
interface WLook { shirt:string; pants:string; hair:string; carry?:string; }
const WLOOKS:Record<string,WLook> = {
  worker_miner:{shirt:C.MINER,pants:C.DIRT2,hair:C.HAIR,carry:C.COPPER},
  worker_blacksmith:{shirt:C.SMITH,pants:'#3a2a1a',hair:'#222',carry:C.IRON},
  worker_lumberjack:{shirt:C.LUMBER,pants:'#2a3a2a',hair:'#8a3a20',carry:C.WOOD},
  worker_carpenter:{shirt:C.CARP,pants:'#4a3a2a',hair:C.HAIR,carry:C.WOOD_D},
  worker_fisherman:{shirt:C.FISHER,pants:'#2a3a4a',hair:C.HAIR,carry:C.WATER2},
  worker_chef:{shirt:C.CHEF,pants:'#333',hair:'#3a2a1e',carry:'#ffaa44'},
  worker_knight:{shirt:C.KNIGHT,pants:'#aaa',hair:C.HAIR},
  worker_scholar:{shirt:C.SCHOLAR,pants:'#2a2a4a',hair:'#3a2a1e'},
  worker_priest:{shirt:C.PRIEST,pants:'#aaa888',hair:'#ccccbb'},
  worker_general:{shirt:C.GENERAL,pants:'#4a2a2a',hair:'#222'},
  worker_archmage:{shirt:C.ARCHMAGE,pants:'#2a1a3a',hair:'#c4a050'},
};

// ── Agent (all positions normalized 0-1) ─────────────────────
interface Agent {
  id:string;
  nx:number; ny:number; // normalized position
  shirt:string; pants:string; hair:string;
  state:'goWork'|'work'|'goHome'|'deliver'|'idle';
  timer:number;
  homeLoc:string; // location id for home (castle)
  workLoc:string; // location id for work
  workOffX:number; workOffY:number; // offset from work location center
  dir:number; // 0-3
  frame:number;
  carrying:boolean; carryColor?:string;
  workerId?:string; isPlayer?:boolean; label?:string;
}

// ── Particle ─────────────────────────────────────────────────
interface Particle {
  x:number;y:number;vx:number;vy:number;
  life:number;maxLife:number;color:string;size:number;
  type:'spark'|'xp'|'text'|'coin'|'smoke';
  text?:string;
}

// ── Static features ──────────────────────────────────────────
interface Feature { type:'tree'|'rock'|'bush'|'flower'; nx:number; ny:number; seed:number; }

function genFeatures(): Feature[] {
  const out: Feature[] = [];
  let s=42;
  const r=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};

  // More trees — denser forests, scattered elsewhere
  for(let i=0;i<100;i++){
    const x=r(),y=r();
    if(LOCS.some(l=>Math.hypot(x-l.x,y-l.y)<l.r+0.03)) continue;
    // More trees near forest
    const nearForest=Math.hypot(x-0.82,y-0.18)<0.15;
    if(!nearForest&&r()>0.45) continue;
    out.push({type:'tree',nx:x,ny:y,seed:i});
  }
  // Rocks near mine
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI*2;
    out.push({type:'rock',nx:0.12+Math.cos(a)*0.04,ny:0.20+Math.sin(a)*0.03,seed:100+i});
  }
  // More bushes and flowers
  for(let i=0;i<40;i++){
    const x=r(),y=r();
    if(LOCS.some(l=>Math.hypot(x-l.x,y-l.y)<l.r+0.02)) continue;
    out.push({type:r()>0.5?'flower':'bush',nx:x,ny:y,seed:200+i});
  }
  // Flower meadow clusters
  const meadowCenters=[[0.40,0.38],[0.60,0.30],[0.35,0.60],[0.55,0.78]];
  meadowCenters.forEach(([mx,my],mi)=>{
    for(let i=0;i<12;i++){
      const angle=r()*Math.PI*2;
      const dist=r()*0.04;
      const fx=mx+Math.cos(angle)*dist;
      const fy=my+Math.sin(angle)*dist;
      if(LOCS.some(l=>Math.hypot(fx-l.x,fy-l.y)<l.r+0.02)) continue;
      out.push({type:'flower',nx:fx,ny:fy,seed:400+mi*20+i});
    }
  });
  return out;
}

// River spline points
const RIVER=[
  {x:0.95,y:0.0},{x:0.90,y:0.12},{x:0.87,y:0.25},{x:0.85,y:0.38},
  {x:0.84,y:0.48},{x:0.83,y:0.55},{x:0.82,y:0.65},{x:0.84,y:0.75},
  {x:0.87,y:0.85},{x:0.90,y:0.95},{x:0.92,y:1.0},
];

// ═══════════════════════════════════════════════════════════════
export function PixelWorldView({state,events,activeTab}:PixelWorldProps) {
  const cvRef=useRef<HTMLCanvasElement>(null);
  const fRef=useRef(0);
  const aRef=useRef<Agent[]>([]);
  const pRef=useRef<Particle[]>([]);
  const featRef=useRef<Feature[]>(genFeatures());
  const lastEvt=useRef('');
  const rafRef=useRef(0);
  const prevLvl=useRef<Record<string,number>>({});
  const [collapsed,setCollapsed]=useState(false);
  const [fullscreen,setFullscreen]=useState(false);
  // Track kingdom worker counts to know when to rebuild
  const prevKingdom=useRef<string>('');

  // Camera system
  const camRef=useRef<Camera>({zoom:1,panX:0.5,panY:0.5,targetZoom:1,targetPanX:0.5,targetPanY:0.5});
  const dragRef=useRef<{dragging:boolean;lastX:number;lastY:number}>({dragging:false,lastX:0,lastY:0});
  // Resource flow particles (separate from main particles for layering)
  const flowRef=useRef<{x:number;y:number;tx:number;ty:number;progress:number;color:string;size:number;fromLoc:string}[]>([]);

  const activeSkill:SkillId|undefined=state.activeAction
    ?ACTIONS.find(a=>a.id===state.activeAction!.actionId)?.skill:undefined;
  const activeAct=state.activeAction
    ?ACTIONS.find(a=>a.id===state.activeAction!.actionId):undefined;

  const totalW=useMemo(()=>{
    let t=0;Object.values(state.kingdom).forEach(c=>{t+=(c||0);});return t;
  },[state.kingdom]);

  // Stable kingdom key
  const kingdomKey=useMemo(()=>{
    return KINGDOM_WORKERS.map(w=>`${w.id}:${state.kingdom[w.id]||0}`).join(',');
  },[state.kingdom]);

  // Kingdom progression tier (drives visual transformation of the entire map)
  const kingdomTier=useMemo(()=>{
    const totalSkillLvl=Object.values(state.skills).reduce((sum,sk)=>sum+sk.level,0);
    if(state.gp>=5000000&&totalW>=50&&totalSkillLvl>=500) return 5; // Legendary
    if(state.gp>=500000&&totalW>=30&&totalSkillLvl>=200) return 4;  // Grand
    if(state.gp>=50000&&totalW>=15&&totalSkillLvl>=80) return 3;    // Fortified
    if(state.gp>=5000&&totalW>=5&&totalSkillLvl>=30) return 2;      // Established
    return 1; // Frontier
  },[state.gp,totalW,state.skills]);

  // Work site production levels (how much stuff has accumulated at each site)
  const siteProduction=useMemo(()=>{
    const prod:Record<string,number>={};
    // Use worker count as proxy for production level (0-8 scale)
    KINGDOM_WORKERS.forEach(wk=>{
      const count=state.kingdom[wk.id]||0;
      const loc=LOCS.find(l=>l.workerIds.includes(wk.id));
      if(loc) prod[loc.id]=count;
    });
    return prod;
  },[state.kingdom]);

  // ── Build agents (only when kingdom actually changes) ──────
  const buildAgents=useCallback(()=>{
    const castle=LOCS.find(l=>l.id==='castle')!;
    const ag:Agent[]=[];

    KINGDOM_WORKERS.forEach(wk=>{
      const count=state.kingdom[wk.id]||0;
      if(!count) return;
      const loc=LOCS.find(l=>l.workerIds.includes(wk.id));
      if(!loc) return;
      const look=WLOOKS[wk.id];
      if(!look) return;

      const vis=Math.min(count,8);
      for(let i=0;i<vis;i++){
        const angle=(i/vis)*Math.PI*2+i*0.7;
        const offX=Math.cos(angle)*loc.r*0.5;
        const offY=Math.sin(angle)*loc.r*0.4;

        // Stagger phases so they're not all synced
        const phase=i/vis;
        let startState:'goWork'|'work'|'goHome'|'idle';
        let startX:number, startY:number;
        if(phase<0.3){
          startState='goWork'; startX=castle.x;startY=castle.y;
        } else if(phase<0.7){
          startState='work'; startX=loc.x+offX;startY=loc.y+offY;
        } else {
          startState='goHome'; startX=loc.x+offX;startY=loc.y+offY;
        }

        ag.push({
          id:`kw_${wk.id}_${i}`,
          nx:startX, ny:startY,
          shirt:look.shirt, pants:look.pants, hair:look.hair,
          state:startState,
          timer: 30+Math.floor(Math.random()*80)*(startState==='work'?2:1),
          homeLoc:'castle', workLoc:loc.id,
          workOffX:offX, workOffY:offY,
          dir:0, frame:Math.floor(Math.random()*100),
          carrying:startState==='goHome',
          carryColor:look.carry,
          workerId:wk.id,
          label:i===0?loc.name:undefined,
        });
      }
    });

    // Townsfolk NPCs (ambient wanderers near castle)
    const townColors=[
      {shirt:'#7a5a4a',pants:'#4a3a2a',hair:'#5a3a22'},
      {shirt:'#4a6a7a',pants:'#3a3a3a',hair:'#3a2a1e'},
      {shirt:'#8a6a4a',pants:'#5a4a3a',hair:'#c4a050'},
      {shirt:'#5a4a6a',pants:'#3a3a4a',hair:'#222'},
    ];
    for(let i=0;i<4;i++){
      const tc=townColors[i];
      const angle=i*Math.PI/2+0.3;
      const dist=0.06+Math.random()*0.04;
      ag.push({
        id:`town_${i}`,
        nx:castle.x+Math.cos(angle)*dist,
        ny:castle.y+Math.sin(angle)*dist,
        shirt:tc.shirt, pants:tc.pants, hair:tc.hair,
        state:'idle',
        timer:20+Math.floor(Math.random()*60),
        homeLoc:'castle', workLoc:'castle',
        workOffX:Math.cos(angle+i)*0.05,
        workOffY:Math.sin(angle+i)*0.04,
        dir:i%4, frame:i*25, carrying:false,
      });
    }

    // Player
    const pLocId=skillLoc(activeSkill);
    const pLoc=LOCS.find(l=>l.id===pLocId)||castle;
    ag.push({
      id:'player', nx:pLoc.x, ny:pLoc.y,
      shirt:'#8b2500', pants:C.DIRT2, hair:C.HAIR,
      state:state.activeAction?'work':'idle',
      timer:120, homeLoc:'castle', workLoc:pLocId,
      workOffX:0, workOffY:0,
      dir:0, frame:0, carrying:false,
      isPlayer:true, label:'You',
    });

    return ag;
  },[state.kingdom,state.activeAction,activeSkill]);

  // Rebuild agents only when kingdom key changes
  useEffect(()=>{
    if(kingdomKey!==prevKingdom.current){
      prevKingdom.current=kingdomKey;
      aRef.current=buildAgents();
    }
  },[kingdomKey,buildAgents]);

  // Init agents on mount
  useEffect(()=>{
    if(aRef.current.length===0) aRef.current=buildAgents();
  },[buildAgents]);

  // ── Level-up particles ─────────────────────────────────────
  useEffect(()=>{
    Object.entries(state.skills).forEach(([id,sk])=>{
      const prev=prevLvl.current[id]||1;
      if(sk.level>prev){
        const player=aRef.current.find(a=>a.isPlayer);
        if(player){
          const cv=cvRef.current;if(!cv)return;
          const px=player.nx*cv.width, py=player.ny*cv.height;
          for(let i=0;i<25;i++){
            const a=(Math.PI*2*i)/25;
            pRef.current.push({
              x:px,y:py,vx:Math.cos(a)*(1.5+Math.random()*2),vy:Math.sin(a)*(1.5+Math.random()*2),
              life:70,maxLife:70,color:[C.GOLD,C.SPARK,C.SPARK_W][i%3],size:2.5,type:'spark',
            });
          }
          pRef.current.push({
            x:px-10,y:py-15,vx:0,vy:-0.6,life:100,maxLife:100,color:C.GOLD,size:3,type:'text',
            text:`${id.charAt(0).toUpperCase()+id.slice(1)} ${sk.level}!`,
          });
        }
      }
      prevLvl.current[id]=sk.level;
    });
  },[state.skills]);

  // ── Event particles ────────────────────────────────────────
  useEffect(()=>{
    if(!events.length) return;
    const e=events[0];
    if(e.id===lastEvt.current) return;
    lastEvt.current=e.id;
    const cv=cvRef.current;if(!cv) return;
    const player=aRef.current.find(a=>a.isPlayer);
    if(!player) return;
    const px=player.nx*cv.width, py=player.ny*cv.height;

    if(e.type==='xp'){
      // Green XP orbs — more of them, more visible
      for(let i=0;i<8;i++){
        pRef.current.push({
          x:px+Math.random()*20-10,y:py-5,
          vx:(Math.random()-0.5)*1.2,vy:-1.2-Math.random()*1.2,
          life:50,maxLife:50,color:C.XP,size:2.5,type:'spark',
        });
      }
      // XP text — bigger, green
      const m=e.message.match(/\+(\d+)/);
      if(m){
        pRef.current.push({
          x:px-10,y:py-12,vx:0,vy:-0.9,
          life:65,maxLife:65,color:C.XP,size:3,type:'text',text:`+${m[1]} XP`,
        });
      }
    }
    if(e.type==='level'){
      // MASSIVE level-up celebration — Cookie Clicker milestone energy
      // Ring explosion
      for(let i=0;i<60;i++){
        const a=(Math.PI*2*i)/60;
        const speed=2+Math.random()*4;
        pRef.current.push({
          x:px,y:py,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
          life:90,maxLife:90,color:[C.GOLD,C.SPARK,C.SPARK_W,'#ffaa00','#ffcc66'][i%5],
          size:2+Math.random()*2,type:'spark',
        });
      }
      // Gold coin rain
      for(let i=0;i<15;i++){
        pRef.current.push({
          x:px-40+Math.random()*80,y:py-20-Math.random()*30,
          vx:(Math.random()-0.5)*2,vy:-1+Math.random()*0.5,
          life:80,maxLife:80,color:C.GOLD,size:3+Math.random()*2,type:'coin',
        });
      }
      // Second ring (delayed by starting closer)
      for(let i=0;i<30;i++){
        const a=(Math.PI*2*i)/30+0.1;
        pRef.current.push({
          x:px,y:py,vx:Math.cos(a)*(1+Math.random()*2),vy:Math.sin(a)*(1+Math.random()*2),
          life:70,maxLife:70,color:C.SPARK_W,size:1.5,type:'spark',
        });
      }
      // "LEVEL UP!" text
      const lvlMatch=e.message.match(/(\w+)\s+is now level\s+(\d+)/i);
      if(lvlMatch){
        pRef.current.push({
          x:px-30,y:py-25,vx:0,vy:-0.5,
          life:120,maxLife:120,color:C.GOLD_L,size:4,type:'text',
          text:`⬆ ${lvlMatch[1]} LV.${lvlMatch[2]}!`,
        });
      }
    }
    if(e.type==='loot'&&e.rarity&&['rare','epic','legendary','celestial'].includes(e.rarity)){
      const bc=e.rarity==='legendary'?'#ff8800':e.rarity==='celestial'?'#00ddff':e.rarity==='epic'?'#aa44ff':'#4488ff';
      // Loot beam column — tall and dramatic
      for(let i=0;i<35;i++){
        pRef.current.push({
          x:px+(Math.random()-0.5)*8,y:py-Math.random()*60,
          vx:(Math.random()-0.5)*0.3,vy:-2-Math.random()*3,
          life:120,maxLife:120,color:bc,size:2+Math.random()*2,type:'spark',
        });
      }
      // Radial star burst
      for(let i=0;i<20;i++){
        const a=(Math.PI*2*i)/20;
        pRef.current.push({
          x:px,y:py-10,vx:Math.cos(a)*3,vy:Math.sin(a)*3,
          life:40,maxLife:40,color:C.SPARK_W,size:2,type:'spark',
        });
      }
      // Rarity text
      const rarityNames:Record<string,string>={rare:'RARE DROP!',epic:'EPIC DROP!',legendary:'LEGENDARY!',celestial:'✦ CELESTIAL ✦'};
      pRef.current.push({
        x:px-30,y:py-40,vx:0,vy:-0.4,
        life:130,maxLife:130,color:bc,size:4,type:'text',
        text:rarityNames[e.rarity]||'DROP!',
      });
      // Gold shower
      for(let i=0;i<10;i++){
        pRef.current.push({
          x:px-30+Math.random()*60,y:py-30,
          vx:(Math.random()-0.5)*2,vy:-0.5+Math.random()*0.5,
          life:60,maxLife:60,color:bc,size:2+Math.random()*2,type:'coin',
        });
      }
    }
  },[events]);

  // ── ESC to exit fullscreen ─────────────────────────────────
  useEffect(()=>{
    if(!fullscreen) return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setFullscreen(false);};
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[fullscreen]);

  // ── Camera mouse handlers ──────────────────────────────────
  useEffect(()=>{
    const cv=cvRef.current;
    if(!cv||collapsed) return;

    const onWheel=(e:WheelEvent)=>{
      e.preventDefault();
      const cam=camRef.current;
      const delta=e.deltaY>0?-0.15:0.15;
      cam.targetZoom=Math.max(1,Math.min(3.5,cam.targetZoom+delta));
      // Zoom toward mouse position
      const rect=cv.getBoundingClientRect();
      const mx=(e.clientX-rect.left)/rect.width;
      const my=(e.clientY-rect.top)/rect.height;
      if(cam.targetZoom>1){
        cam.targetPanX+=(mx-0.5)*delta*0.3;
        cam.targetPanY+=(my-0.5)*delta*0.3;
      } else {
        cam.targetPanX=0.5;cam.targetPanY=0.5;
      }
      // Clamp pan
      const maxPan=1-1/cam.targetZoom;
      cam.targetPanX=Math.max(0.5-maxPan*0.5,Math.min(0.5+maxPan*0.5,cam.targetPanX));
      cam.targetPanY=Math.max(0.5-maxPan*0.5,Math.min(0.5+maxPan*0.5,cam.targetPanY));
    };
    const onDown=(e:MouseEvent)=>{
      if(camRef.current.zoom>1.05){
        dragRef.current={dragging:true,lastX:e.clientX,lastY:e.clientY};
      }
    };
    const onMove=(e:MouseEvent)=>{
      if(!dragRef.current.dragging) return;
      const cam=camRef.current;
      const rect=cv.getBoundingClientRect();
      const dx=(e.clientX-dragRef.current.lastX)/rect.width/cam.zoom;
      const dy=(e.clientY-dragRef.current.lastY)/rect.height/cam.zoom;
      cam.targetPanX-=dx;cam.targetPanY-=dy;
      const maxPan=1-1/cam.zoom;
      cam.targetPanX=Math.max(0.5-maxPan*0.5,Math.min(0.5+maxPan*0.5,cam.targetPanX));
      cam.targetPanY=Math.max(0.5-maxPan*0.5,Math.min(0.5+maxPan*0.5,cam.targetPanY));
      dragRef.current.lastX=e.clientX;dragRef.current.lastY=e.clientY;
    };
    const onUp=()=>{dragRef.current.dragging=false;};
    const onDblClick=(e:MouseEvent)=>{
      const cam=camRef.current;
      if(cam.targetZoom>1.5){
        cam.targetZoom=1;cam.targetPanX=0.5;cam.targetPanY=0.5;
      } else {
        cam.targetZoom=2.2;
        const rect=cv.getBoundingClientRect();
        cam.targetPanX=(e.clientX-rect.left)/rect.width;
        cam.targetPanY=(e.clientY-rect.top)/rect.height;
      }
    };

    cv.addEventListener('wheel',onWheel,{passive:false});
    cv.addEventListener('mousedown',onDown);
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',onUp);
    cv.addEventListener('dblclick',onDblClick);
    return()=>{
      cv.removeEventListener('wheel',onWheel);
      cv.removeEventListener('mousedown',onDown);
      window.removeEventListener('mousemove',onMove);
      window.removeEventListener('mouseup',onUp);
      cv.removeEventListener('dblclick',onDblClick);
    };
  },[collapsed]);

  // ── Main render loop ───────────────────────────────────────
  useEffect(()=>{
    const cv=cvRef.current;
    if(!cv||collapsed) return;
    const ctx=cv.getContext('2d');
    if(!ctx) return;

    const resize=()=>{
      const r=cv.parentElement?.getBoundingClientRect();
      if(r){cv.width=r.width*devicePixelRatio;cv.height=r.height*devicePixelRatio;ctx.imageSmoothingEnabled=false;}
    };
    resize();
    window.addEventListener('resize',resize);

    const S=()=>Math.max(2,Math.floor(cv.width/400)); // bigger pixels, more visible

    // ── Terrain ──────────────────────────────────────────────
    const drawTerrain=(w:number,h:number,f:number)=>{
      const s=S();
      const grasses=[C.GRASS1,C.GRASS2,C.GRASS3,C.GRASS4,C.GRASS5];

      // Mountain range along top edge
      for(let mx=0;mx<w;mx+=s){
        const mountainH=s*(8+Math.sin(mx*0.005)*5+Math.sin(mx*0.012+2)*3+Math.sin(mx*0.003)*4);
        // Far mountains (darker, taller)
        ctx.fillStyle='#2a3a28';
        ctx.fillRect(mx,0,s,mountainH*0.4);
        // Mid mountains
        const midH=mountainH*0.3+Math.sin(mx*0.008+1)*s*3;
        ctx.fillStyle='#354a32';
        ctx.fillRect(mx,0,s,midH);
        // Snow caps on tallest peaks
        if(mountainH>s*14){
          ctx.fillStyle='rgba(220,220,210,0.3)';
          ctx.fillRect(mx,0,s,s*2);
        }
      }

      // Horizon tree line (silhouette)
      for(let hx=0;hx<w;hx+=s*3){
        const htreeH=s*(3+Math.sin(hx*0.01+0.5)*2);
        const baseY=s*(6+Math.sin(hx*0.005)*3);
        ctx.fillStyle='#2a4a25';
        ctx.fillRect(hx,baseY-htreeH,s*2,htreeH);
        ctx.fillRect(hx-s,baseY-htreeH+s,s*4,s);
      }

      // Base grass with Perlin-like noise pattern
      for(let gx=0;gx<w;gx+=s*2){
        for(let gy=0;gy<h;gy+=s*2){
          // Multi-octave noise approximation
          const n1=Math.sin(gx*0.008+gy*0.006)*0.5+0.5;
          const n2=Math.sin(gx*0.02+gy*0.015+3.7)*0.25+0.25;
          const n=(n1+n2);
          const gi=Math.floor(n*grasses.length)%grasses.length;
          ctx.fillStyle=grasses[gi];
          ctx.fillRect(gx,gy,s*2,s*2);
        }
      }

      // Dark grass patches (meadow variation)
      for(let gx=0;gx<w;gx+=s*6){
        for(let gy=0;gy<h;gy+=s*6){
          if(Math.sin(gx*0.005+gy*0.007+2.1)>0.6){
            ctx.fillStyle=C.GRASS_DARK;
            ctx.fillRect(gx,gy,s*2,s*2);
          }
        }
      }

      // River — wider, with depth gradient and shore
      RIVER.forEach((pt,i)=>{
        if(!i) return;
        const prev=RIVER[i-1];
        for(let t=0;t<1;t+=0.03){
          const rx=(prev.x+(pt.x-prev.x)*t)*w;
          const ry=(prev.y+(pt.y-prev.y)*t)*h;
          const rw=s*14+Math.sin(ry*0.006)*s*3;
          // Shore (grass-sand blend)
          for(let dx=-rw/2-s*3;dx<rw/2+s*3;dx+=s){
            if(Math.abs(dx)>rw/2){
              ctx.fillStyle=C.WATER_SHORE;
              ctx.fillRect(rx+dx,ry,s,s*2);
            }
          }
          // Sand edge
          for(let dx=-rw/2-s;dx<rw/2+s;dx+=s){
            if(Math.abs(dx)>rw/2-s*1){
              ctx.fillStyle=C.SAND2;
              ctx.fillRect(rx+dx,ry,s,s*2);
            }
          }
          // Water body with depth
          for(let dx=-rw/2;dx<rw/2;dx+=s){
            const wave=Math.sin((rx+dx)*0.012+f*0.025)*s*0.6;
            const depthRatio=1-Math.abs(dx)/(rw/2);
            ctx.fillStyle=depthRatio>0.6?C.WATER_DEEP:depthRatio>0.3?C.WATER1:C.WATER2;
            ctx.fillRect(rx+dx,ry+wave,s,s*2);
          }
          // Animated wave highlights
          for(let dx=-rw/2+s*2;dx<rw/2-s*2;dx+=s*3){
            if(Math.sin((rx+dx)*0.01+f*0.04+t*5)>0.5){
              ctx.fillStyle=C.WATER_LIGHT;
              ctx.fillRect(rx+dx,ry+Math.sin((rx+dx)*0.012+f*0.025)*s*0.6,s*2,s*0.5);
            }
          }
        }
      });

      // Lily pads on river
      const lilies=[[0.86,0.42],[0.83,0.58],[0.85,0.68],[0.84,0.50],[0.82,0.62]];
      lilies.forEach(([lx,ly])=>{
        const fx=lx*w+Math.sin(f*0.015+lx*10)*s;
        const fy=ly*h+Math.cos(f*0.02+ly*10)*s*0.5;
        ctx.fillStyle='#3a7a3a';
        ctx.beginPath();ctx.arc(fx,fy,s*1.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#4a8a44';
        ctx.beginPath();ctx.arc(fx-s*0.3,fy-s*0.3,s*0.8,0,Math.PI*2);ctx.fill();
      });

      // Bridge over river (connecting castle area to river/forest)
      const bridgeY=0.45*h;
      const bridgeX=0.83*w;
      const bridgeW=s*16;
      // Bridge planks
      ctx.fillStyle=C.WOOD;
      ctx.fillRect(bridgeX-bridgeW/2,bridgeY-s*2,bridgeW,s*5);
      ctx.fillStyle=C.WOOD_D;
      for(let bx=bridgeX-bridgeW/2;bx<bridgeX+bridgeW/2;bx+=s*3){
        ctx.fillRect(bx,bridgeY-s*2,s,s*5);
      }
      // Railings
      ctx.fillStyle=C.WOOD_L||C.WOOD;
      ctx.fillRect(bridgeX-bridgeW/2,bridgeY-s*3,bridgeW,s);
      ctx.fillRect(bridgeX-bridgeW/2,bridgeY+s*3,bridgeW,s);
      // Posts
      ctx.fillStyle=C.TRUNK;
      for(let bx=bridgeX-bridgeW/2;bx<=bridgeX+bridgeW/2;bx+=s*5){
        ctx.fillRect(bx,bridgeY-s*4,s,s*2);
        ctx.fillRect(bx,bridgeY+s*3,s,s*2);
      }

      // Location terrain patches with soft edges
      LOCS.forEach(loc=>{
        const lx=loc.x*w,ly=loc.y*h,lr=loc.r*Math.min(w,h);
        let tc:string,tc2:string;
        switch(loc.terrain){
          case 'stone':tc=C.STONE_D;tc2=C.STONE;break;
          case 'sand':tc=C.SAND;tc2=C.SAND2;break;
          case 'cave':tc=C.CAVE;tc2=C.CAVE_D;break;
          case 'dirt':tc=C.DIRT;tc2=C.DIRT_DARK;break;
          default:tc=C.GRASS2;tc2=C.GRASS4;
        }
        for(let dx=-lr-s*2;dx<lr+s*2;dx+=s){
          for(let dy=-lr-s*2;dy<lr+s*2;dy+=s){
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<lr){
              const n2=((Math.floor(lx+dx)*3+Math.floor(ly+dy)*7)%10)/10;
              ctx.fillStyle=n2>0.5?tc:tc2;
              ctx.fillRect(lx+dx,ly+dy,s,s);
            } else if(dist<lr+s*2){
              // Soft edge blend
              ctx.fillStyle=C.DIRT2;
              ctx.globalAlpha=0.4;
              ctx.fillRect(lx+dx,ly+dy,s,s);
              ctx.globalAlpha=1;
            }
          }
        }
      });

      // Paths — wider, with worn edges
      PATHS.forEach(([a,b])=>{
        const la=LOCS.find(l=>l.id===a),lb=LOCS.find(l=>l.id===b);
        if(!la||!lb) return;
        const steps=60;
        for(let t=0;t<=steps;t++){
          const frac=t/steps;
          const px=la.x*w+(lb.x*w-la.x*w)*frac;
          const py=la.y*h+(lb.y*h-la.y*h)*frac;
          const curve=Math.sin(frac*Math.PI)*s*5;
          const perpX=-(lb.y-la.y),perpY=lb.x-la.x;
          const len=Math.hypot(perpX,perpY)||1;
          // Worn grass edges
          for(let dw=-s*2.5;dw<=s*2.5;dw+=s){
            const isEdge=Math.abs(dw)>s*1.5;
            ctx.fillStyle=isEdge?C.GRASS_DARK:(((Math.floor(px+py+dw)*7)%10)>5?C.DIRT3:C.DIRT);
            ctx.fillRect(px+perpX/len*curve+perpX/len*dw,py+perpY/len*curve+perpY/len*dw,s,s);
          }
        }
      });

      // Small pond (southwest area)
      const pondX=0.30*w,pondY=0.55*h,pondR=s*12;
      // Shore
      ctx.fillStyle=C.SAND2;
      ctx.beginPath();ctx.ellipse(pondX,pondY,pondR+s*3,pondR*0.7+s*3,0,0,Math.PI*2);ctx.fill();
      // Water
      ctx.fillStyle=C.WATER1;
      ctx.beginPath();ctx.ellipse(pondX,pondY,pondR,pondR*0.7,0,0,Math.PI*2);ctx.fill();
      // Depth
      ctx.fillStyle=C.WATER_DEEP;
      ctx.beginPath();ctx.ellipse(pondX,pondY,pondR*0.5,pondR*0.35,0,0,Math.PI*2);ctx.fill();
      // Ripples
      const rippleR=pondR*0.6+Math.sin(f*0.03)*s*2;
      ctx.strokeStyle=`rgba(60,120,180,${0.2+Math.sin(f*0.04)*0.1})`;
      ctx.lineWidth=0.5;
      ctx.beginPath();ctx.ellipse(pondX+s*2,pondY-s,rippleR,rippleR*0.6,0,0,Math.PI*2);ctx.stroke();
      // Reeds
      for(let i=0;i<6;i++){
        const ra=i/6*Math.PI*2;
        const rx=pondX+Math.cos(ra)*(pondR+s);
        const ry=pondY+Math.sin(ra)*(pondR*0.7+s);
        ctx.fillStyle='#5a7a3a';
        ctx.fillRect(rx,ry-s*3,s*0.4,s*3);
        ctx.fillRect(rx+s,ry-s*2.5,s*0.4,s*2.5);
        // Cattail head
        ctx.fillStyle='#6a4a2a';
        ctx.fillRect(rx,ry-s*3.5,s*0.6,s*1);
      }
      // Lily pads on pond
      for(let i=0;i<3;i++){
        const lpa=i*2.1+0.5;
        const lpx=pondX+Math.cos(lpa)*pondR*0.4+Math.sin(f*0.01+i)*s;
        const lpy=pondY+Math.sin(lpa)*pondR*0.3+Math.cos(f*0.015+i)*s*0.5;
        ctx.fillStyle='#3a8a3a';
        ctx.beginPath();ctx.arc(lpx,lpy,s*1.3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#4a9a4a';
        ctx.beginPath();ctx.arc(lpx-s*0.3,lpy-s*0.2,s*0.6,0,Math.PI*2);ctx.fill();
      }

      // Stone fences around castle perimeter
      const castle=LOCS.find(l=>l.id==='castle')!;
      const cxp=castle.x*w,cyp=castle.y*h;
      const fenceR=castle.r*Math.min(w,h)+s*6;
      for(let a=0;a<Math.PI*2;a+=s*1.5/fenceR){
        // Gap for paths
        const isGap=Math.abs(Math.sin(a))>0.95||Math.abs(Math.cos(a))>0.95;
        if(isGap) continue;
        const fx=cxp+Math.cos(a)*fenceR;
        const fy=cyp+Math.sin(a)*fenceR*0.85;
        ctx.fillStyle=((Math.floor(a*100))%3===0)?C.STONE_L:C.STONE_D;
        ctx.fillRect(fx,fy,s,s);
      }

      // Crates & barrels near workshop
      const wsLoc=LOCS.find(l=>l.id==='workshop')!;
      const wsX=wsLoc.x*w,wsY=wsLoc.y*h;
      // Crates
      [[s*6,-s*3],[s*7,-s],[s*8,-s*2]].forEach(([dx,dy])=>{
        ctx.fillStyle=C.WOOD;
        ctx.fillRect(wsX+dx,wsY+dy,s*2,s*2);
        ctx.fillStyle=C.WOOD_D;
        ctx.fillRect(wsX+dx,wsY+dy,s*2,s*0.3);
        ctx.fillRect(wsX+dx,wsY+dy+s,s*2,s*0.3);
        ctx.fillRect(wsX+dx+s,wsY+dy,s*0.3,s*2);
      });
      // Barrels
      [[-s*6,s*2],[-s*5,-s]].forEach(([dx,dy])=>{
        ctx.fillStyle='#6a4a2a';
        ctx.beginPath();ctx.arc(wsX+dx,wsY+dy,s*1.2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#5a3a1a';
        ctx.beginPath();ctx.arc(wsX+dx,wsY+dy,s*0.8,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#444';ctx.lineWidth=s*0.2;
        ctx.beginPath();ctx.arc(wsX+dx,wsY+dy,s*1.1,0,Math.PI*2);ctx.stroke();
      });

      // Small graveyard near temple
      const tempLoc=LOCS.find(l=>l.id==='temple')!;
      const gx=tempLoc.x*w-s*12,gy=tempLoc.y*h+s*2;
      // Headstones
      [[-s*2,0],[s*2,0],[0,s*3],[s*4,s*3],[-s*2,s*3]].forEach(([dx,dy])=>{
        ctx.fillStyle=C.STONE;
        ctx.fillRect(gx+dx,gy+dy-s*1.5,s*1.5,s*2.5);
        ctx.fillStyle=C.STONE_L;
        ctx.fillRect(gx+dx,gy+dy-s*1.5,s*1.5,s*0.5);
        // Cross
        ctx.fillStyle=C.STONE_D;
        ctx.fillRect(gx+dx+s*0.5,gy+dy-s,s*0.3,s*1);
        ctx.fillRect(gx+dx+s*0.2,gy+dy-s*0.6,s*1,s*0.3);
      });
      // Dead flowers
      ctx.fillStyle='#7a6a5a';
      ctx.fillRect(gx+s,gy+s,s*0.5,s*0.8);
      ctx.fillStyle='#aa8866';
      ctx.fillRect(gx+s*0.7,gy+s*0.5,s*1,s*0.5);

      // Crop field near kitchen (with scarecrow)
      const kitchenLoc=LOCS.find(l=>l.id==='kitchen')!;
      const cropX=kitchenLoc.x*w+s*8,cropY=kitchenLoc.y*h+s*4;
      for(let row=0;row<4;row++){
        const ry=cropY+row*s*3;
        // Tilled earth
        ctx.fillStyle='#4a3520';
        ctx.fillRect(cropX,ry,s*15,s*1.5);
        // Crops
        for(let cx=cropX;cx<cropX+s*15;cx+=s*2){
          const cropH=s*(1.5+Math.sin(cx*0.01+f*0.015+row)*0.5);
          ctx.fillStyle=row%2===0?'#4a8a30':'#5a9a38';
          ctx.fillRect(cx+s*0.5,ry-cropH,s*0.8,cropH);
          // Wheat/crop head
          ctx.fillStyle=row%2===0?'#c4aa50':'#aacc44';
          ctx.fillRect(cx+s*0.3,ry-cropH-s*0.5,s*1.2,s*0.6);
        }
      }

      // Scattered campfires
      const campfires=[[0.55,0.35],[0.40,0.62]];
      campfires.forEach(([cfx,cfy])=>{
        const cx2=cfx*w,cy2=cfy*h;
        // Stone ring
        ctx.fillStyle=C.STONE_D;
        for(let a=0;a<Math.PI*2;a+=Math.PI/4){
          ctx.fillRect(cx2+Math.cos(a)*s*2,cy2+Math.sin(a)*s*2,s,s);
        }
        // Fire
        const flicker=Math.sin(f*0.12+cfx*100);
        ctx.fillStyle=flicker>0?C.FIRE1:C.FIRE2;
        ctx.fillRect(cx2-s*0.5,cy2-s*0.5,s*1.5,s*1.5);
        ctx.fillStyle=C.FIRE3;
        ctx.fillRect(cx2,cy2-s,s,s);
        // Glow
        ctx.fillStyle=C.TORCH_GLOW;
        ctx.beginPath();ctx.arc(cx2,cy2,s*8,0,Math.PI*2);ctx.fill();
        // Smoke
        if(f%10<2){
          pRef.current.push({
            x:cx2,y:cy2-s*2,vx:(Math.random()-0.5)*0.15,vy:-0.3,
            life:40,maxLife:40,color:C.SMOKE,size:s*1.2,type:'smoke',
          });
        }
        // Log seats
        ctx.fillStyle=C.TRUNK;
        ctx.fillRect(cx2-s*4,cy2+s,s*3,s);
        ctx.fillRect(cx2+s*2,cy2-s*2,s,s*3);
      });

      // Tree stumps in forest clearing
      const stumps=[[0.76,0.15],[0.80,0.25],[0.85,0.12]];
      stumps.forEach(([sx2,sy2])=>{
        const stx=sx2*w,sty=sy2*h;
        ctx.fillStyle=C.TRUNK;
        ctx.fillRect(stx,sty,s*2,s*2);
        ctx.fillStyle='#7a5a3a';
        ctx.fillRect(stx+s*0.3,sty+s*0.3,s*1.4,s*1.4);
        // Ring detail
        ctx.fillStyle='#8a6a44';
        ctx.fillRect(stx+s*0.6,sty+s*0.6,s*0.8,s*0.8);
      });

      // Wooden fence around crop field
      ctx.fillStyle=C.TRUNK;
      const fenceLeft=cropX-s*2,fenceRight=cropX+s*17;
      const fenceTop=cropY-s*5,fenceBot=cropY+s*14;
      // Posts
      for(let fx=fenceLeft;fx<=fenceRight;fx+=s*4){
        ctx.fillRect(fx,fenceTop,s*0.5,fenceBot-fenceTop);
      }
      // Rails
      ctx.fillStyle=C.WOOD;
      ctx.fillRect(fenceLeft,fenceTop+s,fenceRight-fenceLeft,s*0.4);
      ctx.fillRect(fenceLeft,fenceBot-s*2,fenceRight-fenceLeft,s*0.4);
      // Gate opening (front)
      ctx.fillStyle=C.DIRT;
      ctx.fillRect(cropX+s*6,fenceBot-s*2.5,s*3,s*3);

      // Stone well along the south path
      const wellX=0.45*w,wellY=0.60*h;
      // Well base
      ctx.fillStyle=C.STONE;
      ctx.beginPath();ctx.arc(wellX,wellY,s*2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=C.STONE_D;
      ctx.beginPath();ctx.arc(wellX,wellY,s*1.5,0,Math.PI*2);ctx.fill();
      // Water inside
      ctx.fillStyle=C.WATER1;
      ctx.beginPath();ctx.arc(wellX,wellY,s,0,Math.PI*2);ctx.fill();
      // Frame
      ctx.fillStyle=C.TRUNK;
      ctx.fillRect(wellX-s*2,wellY-s*2.5,s*0.4,s*2.5);
      ctx.fillRect(wellX+s*1.5,wellY-s*2.5,s*0.4,s*2.5);
      ctx.fillRect(wellX-s*2,wellY-s*2.5,s*3.8,s*0.4);
      // Bucket rope
      ctx.strokeStyle='#8a7a5a';ctx.lineWidth=s*0.2;
      ctx.beginPath();ctx.moveTo(wellX,wellY-s*2.3);ctx.lineTo(wellX,wellY-s);ctx.stroke();
      // Bucket
      ctx.fillStyle='#6a4a2a';
      ctx.fillRect(wellX-s*0.3,wellY-s*1.3,s*0.6,s*0.5);

      // Scarecrow in crop field
      const scX=cropX+s*7,scY=cropY-s*3;
      ctx.fillStyle=C.TRUNK;
      ctx.fillRect(scX+s*0.5,scY,s*0.5,s*5); // post
      ctx.fillRect(scX-s*1,scY+s*1.5,s*3.5,s*0.4); // arms
      // Head
      ctx.fillStyle='#cc9944';
      ctx.fillRect(scX-s*0.2,scY-s*1.5,s*1.5,s*1.5);
      // Hat
      ctx.fillStyle='#5a3a1a';
      ctx.fillRect(scX-s*0.5,scY-s*2,s*2,s*0.7);
      ctx.fillRect(scX,scY-s*2.5,s*1,s*0.7);
      // Eyes
      ctx.fillStyle='#222';
      ctx.fillRect(scX+s*0.1,scY-s*0.8,s*0.3,s*0.3);
      ctx.fillRect(scX+s*0.8,scY-s*0.8,s*0.3,s*0.3);
      // Shirt flapping
      const flapAngle=Math.sin(f*0.05)*s*0.5;
      ctx.fillStyle='#8a6644';
      ctx.fillRect(scX-s*0.5+flapAngle,scY+s*2,s*2,s*2);

      // Torches around buildings (not just paths)
      const bldgTorches: [number,number][] = [];
      LOCS.forEach(loc=>{
        if(loc.id==='castle') return; // castle has its own
        const lr=loc.r*Math.min(w,h);
        // Place 2 torches at entrance of each building
        bldgTorches.push([loc.x*w-lr*0.8,loc.y*h+lr*0.5]);
        bldgTorches.push([loc.x*w+lr*0.8,loc.y*h+lr*0.5]);
      });
      bldgTorches.forEach(([tx2,ty2])=>{
        ctx.fillStyle=C.TRUNK;
        ctx.fillRect(tx2,ty2,s,s*2);
        ctx.fillStyle=Math.sin(f*0.1+tx2*0.01)>0?C.FIRE1:C.FIRE2;
        ctx.fillRect(tx2-s*0.3,ty2-s,s*1.6,s);
        ctx.fillStyle=C.TORCH_GLOW;
        ctx.beginPath();ctx.arc(tx2+s*0.5,ty2,s*6,0,Math.PI*2);ctx.fill();
      });

      // Torches along paths near castle
      const torchSpots=[[0.42,0.42],[0.58,0.42],[0.42,0.58],[0.58,0.58],
                        [0.35,0.35],[0.65,0.35],[0.35,0.65],[0.65,0.65]];
      torchSpots.forEach(([tx,ty])=>{
        const txp=tx*w,typ=ty*h;
        // Post
        ctx.fillStyle=C.TRUNK;
        ctx.fillRect(txp,typ,s,s*3);
        // Flame
        const flicker=Math.sin(f*0.1+tx*100)>0;
        ctx.fillStyle=flicker?C.FIRE1:C.FIRE2;
        ctx.fillRect(txp-s*0.5,typ-s,s*2,s);
        ctx.fillStyle=C.FIRE3;
        ctx.fillRect(txp,typ-s*1.5,s,s);
        // Glow
        ctx.fillStyle=C.TORCH_GLOW;
        ctx.beginPath();ctx.arc(txp+s*0.5,typ,s*10,0,Math.PI*2);ctx.fill();
      });
    };

    // ── Features ─────────────────────────────────────────────
    const drawFeatures=(w:number,h:number,f:number)=>{
      const s=S();
      featRef.current.forEach(ft=>{
        const fx=ft.nx*w,fy=ft.ny*h;
        switch(ft.type){
          case 'tree': {
            // Shadow under tree
            ctx.fillStyle=C.TREE_SHADOW;
            ctx.beginPath();ctx.ellipse(fx+s*2,fy+s*5.5,s*4,s*2,0,0,Math.PI*2);ctx.fill();

            // Trunk with texture
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(fx+s,fy+s*3,s*2,s*3);
            ctx.fillStyle=C.TRUNK_L;
            ctx.fillRect(fx+s*2,fy+s*3.5,s,s*2);

            // Canopy — larger, rounder, multi-shade
            const colors=[C.TREE1,C.TREE2,C.TREE3,C.TREE4];
            const mainC=colors[(ft.seed*7)%4];
            const lightC=colors[((ft.seed*7)+1)%4];
            // Outer canopy
            ctx.fillStyle=mainC;
            ctx.fillRect(fx-s*2,fy-s,s*8,s);
            ctx.fillRect(fx-s*3,fy,s*10,s);
            ctx.fillRect(fx-s*3,fy+s,s*10,s);
            ctx.fillRect(fx-s*3,fy+s*2,s*10,s);
            ctx.fillRect(fx-s*2,fy+s*3,s*8,s);
            ctx.fillRect(fx-s,fy+s*4,s*6,s);
            // Light highlights (sun hitting top-left)
            ctx.fillStyle=lightC;
            ctx.fillRect(fx-s,fy-s,s*3,s);
            ctx.fillRect(fx-s*2,fy,s*4,s*2);
            // Dark shadows (bottom-right)
            ctx.fillStyle=C.TREE3;
            ctx.fillRect(fx+s*3,fy+s*2,s*3,s*2);
            ctx.fillRect(fx+s*2,fy+s*3,s*3,s);
            break;
          }
          case 'rock': {
            const oreColors=[C.COPPER,C.IRON,C.STONE,C.MITHRIL,C.ADAMANT];
            const rc=oreColors[(ft.seed*3)%oreColors.length];
            // Shadow
            ctx.fillStyle='rgba(0,0,0,0.1)';
            ctx.fillRect(fx+s,fy+s*3,s*3,s);
            // Rock body
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(fx,fy+s,s*4,s*2);
            ctx.fillRect(fx+s,fy,s*2,s);
            ctx.fillRect(fx+s,fy+s*3,s*2,s);
            // Highlight
            ctx.fillStyle=C.STONE_L;
            ctx.fillRect(fx+s,fy,s,s);
            // Ore vein
            ctx.fillStyle=rc;
            ctx.fillRect(fx+s,fy+s,s*1.5,s*1.5);
            break;
          }
          case 'bush': {
            // Shadow
            ctx.fillStyle='rgba(0,0,0,0.08)';
            ctx.fillRect(fx+s,fy+s*2.5,s*3,s);
            // Multi-tone bush
            ctx.fillStyle=C.BUSH3;
            ctx.fillRect(fx,fy+s,s*4,s*2);
            ctx.fillStyle=C.BUSH1;
            ctx.fillRect(fx,fy,s*4,s*2);
            ctx.fillStyle=C.BUSH2;
            ctx.fillRect(fx+s,fy,s*2,s);
            // Berry detail on some
            if(ft.seed%3===0){
              ctx.fillStyle='#cc3344';
              ctx.fillRect(fx+s*0.5,fy+s*0.5,s*0.5,s*0.5);
              ctx.fillRect(fx+s*2.5,fy+s,s*0.5,s*0.5);
            }
            break;
          }
          case 'flower': {
            // Stem
            ctx.fillStyle='#2a6a2a';
            ctx.fillRect(fx+s*0.8,fy+s,s*0.4,s*1.5);
            // Petals
            const fc=[C.FLOWER_PINK,C.FLOWER_YELLOW,C.FLOWER_BLUE,C.FLOWER_WHITE][(ft.seed*5)%4];
            ctx.fillStyle=fc;
            ctx.fillRect(fx,fy,s*0.6,s*0.6);
            ctx.fillRect(fx+s*1.2,fy,s*0.6,s*0.6);
            ctx.fillRect(fx+s*0.6,fy-s*0.4,s*0.6,s*0.6);
            ctx.fillRect(fx+s*0.6,fy+s*0.4,s*0.6,s*0.6);
            // Center
            ctx.fillStyle='#ffee88';
            ctx.fillRect(fx+s*0.6,fy,s*0.6,s*0.6);
            break;
          }
        }
      });

      // Fireflies (ambient) — little glowing dots that drift around
      for(let i=0;i<20;i++){
        const phase=i*2.3+f*0.008;
        const ffx=(0.05+((i*137)%90)/100*0.9)*w+Math.sin(phase)*s*10;
        const ffy=(0.05+((i*97)%90)/100*0.9)*h+Math.cos(phase*0.7)*s*8;
        const brightness=Math.sin(f*0.04+i*1.7);
        if(brightness>0.2){
          ctx.fillStyle=`rgba(200,255,100,${brightness*0.2})`;
          ctx.beginPath();ctx.arc(ffx,ffy,s*1.2,0,Math.PI*2);ctx.fill();
          ctx.fillStyle=`rgba(220,255,120,${brightness*0.6})`;
          ctx.fillRect(ffx-s*0.2,ffy-s*0.2,s*0.5,s*0.5);
        }
      }

      // Ambient birds on ground (near forest)
      for(let i=0;i<5;i++){
        const birdSeed=i*73+17;
        const bx=(0.7+((birdSeed*137)%20)/100*0.2)*w;
        const by_b=(0.1+((birdSeed*97)%20)/100*0.2)*h;
        const hop=Math.sin(f*0.03+i*2)>0.7?s:-0;
        // Body
        ctx.fillStyle='#554433';
        ctx.fillRect(bx,by_b-hop,s*1.5,s);
        // Head
        ctx.fillStyle='#665544';
        ctx.fillRect(bx+s*1.2,by_b-s*0.5-hop,s,s);
        // Beak
        ctx.fillStyle='#cc8844';
        ctx.fillRect(bx+s*2,by_b-s*0.3-hop,s*0.5,s*0.3);
        // Pecking animation
        if(Math.sin(f*0.05+i*3)>0.8){
          ctx.fillRect(bx+s*2,by_b+s*0.2-hop,s*0.3,s*0.5);
        }
      }

      // Ambient rabbits (near meadow areas)
      for(let i=0;i<3;i++){
        const rx=(0.3+((i*197)%40)/100*0.3)*w+Math.sin(f*0.01+i*5)*s*5;
        const ry=(0.5+((i*131)%30)/100*0.3)*h+Math.cos(f*0.012+i*3)*s*3;
        // Skip if too close to a building
        const nearBuilding=LOCS.some(l=>Math.hypot(rx/w-l.x,ry/h-l.y)<l.r+0.03);
        if(nearBuilding) continue;
        const hop2=Math.abs(Math.sin(f*0.04+i*4))*s*1.5;
        // Body
        ctx.fillStyle='#c4a878';
        ctx.fillRect(rx,ry-hop2,s*1.5,s*1.2);
        // Head
        ctx.fillStyle='#d4b888';
        ctx.fillRect(rx+s*1.2,ry-s*0.5-hop2,s,s);
        // Ears
        ctx.fillStyle='#c4a878';
        ctx.fillRect(rx+s*1.3,ry-s*1.5-hop2,s*0.3,s);
        ctx.fillRect(rx+s*1.7,ry-s*1.3-hop2,s*0.3,s*0.8);
        // Tail
        ctx.fillStyle='#eee';
        ctx.fillRect(rx-s*0.3,ry-hop2,s*0.5,s*0.5);
      }

      // Birds circling the mage tower
      for(let i=0;i<4;i++){
        const bAngle=f*0.02+i*Math.PI/2;
        const bRad=s*(8+Math.sin(f*0.01+i)*2);
        const birdX=0.88*w+Math.cos(bAngle)*bRad;
        const birdY=0.82*h+Math.sin(bAngle)*bRad*0.5-s*5;
        const wingUp=Math.sin(f*0.15+i*2)>0;
        ctx.fillStyle='#222';
        ctx.fillRect(birdX,birdY,s*0.8,s*0.5);
        ctx.fillRect(birdX+(wingUp?-s:s*0.5),birdY-s*0.3,s*0.5,s*0.3);
        ctx.fillRect(birdX+(wingUp?s*0.8:-s*0.5),birdY-s*0.3,s*0.5,s*0.3);
      }

      // Signposts at key path intersections
      const signs=[[0.38,0.45,'← Mine'],[0.62,0.45,'Forest →'],[0.50,0.35,'↑ Temple'],[0.50,0.62,'↓ Forge']];
      signs.forEach(([sx,sy,txt])=>{
        const spx=(sx as number)*w,spy=(sy as number)*h;
        // Post
        ctx.fillStyle=C.TRUNK;
        ctx.fillRect(spx,spy,s,s*3);
        // Sign board
        ctx.fillStyle=C.WOOD;
        const signW=ctx.measureText(txt as string).width+s*2||s*8;
        ctx.fillRect(spx-s,spy,Math.min(signW,s*10),s*1.8);
        ctx.fillStyle=C.WOOD_D;
        ctx.fillRect(spx-s,spy,Math.min(signW,s*10),s*0.3);
        // Text
        ctx.font=`${Math.max(5,s*1.2)}px "JetBrains Mono",monospace`;
        ctx.fillStyle='#2a1a0a';
        ctx.fillText(txt as string,spx,spy+s*0.5);
      });

      // Cloud shadows drifting across the map
      for(let i=0;i<4;i++){
        const cx=((f*0.15+i*250)%(w+200))-100;
        const cy=h*0.2+i*h*0.2;
        const cw=s*30+i*s*10;
        const ch=s*12+i*s*4;
        ctx.fillStyle='rgba(0,0,0,0.04)';
        ctx.beginPath();ctx.ellipse(cx,cy,cw,ch,0,0,Math.PI*2);ctx.fill();
      }

      // Fish jumping in river
      for(let i=0;i<3;i++){
        const fishPhase=f*0.015+i*2.5;
        const jumpTrigger=Math.sin(fishPhase);
        if(jumpTrigger>0.95){
          const fishIdx=Math.floor((fishPhase/(Math.PI*2))%RIVER.length);
          const rp=RIVER[Math.min(fishIdx,RIVER.length-1)];
          const fx2=rp.x*w+(Math.random()-0.5)*s*6;
          const fy2=rp.y*h;
          const jumpH=Math.sin((jumpTrigger-0.95)*20*Math.PI)*s*5;
          // Fish body
          ctx.fillStyle='#8899aa';
          ctx.fillRect(fx2,fy2-jumpH,s*2,s);
          // Tail
          ctx.fillStyle='#7788aa';
          ctx.fillRect(fx2-s,fy2-jumpH+s*0.3,s,s*0.5);
          // Splash ripples
          if(jumpH<s){
            pRef.current.push({
              x:fx2,y:fy2,vx:(Math.random()-0.5)*0.5,vy:-0.3,
              life:15,maxLife:15,color:'rgba(100,160,220,0.4)',size:s*1.5,type:'smoke',
            });
          }
        }
      }

      // Floating pollen/dust motes in the air
      for(let i=0;i<25;i++){
        const mPhase=f*0.003+i*1.7;
        const mx2=(0.02+((i*173)%96)/100*0.96)*w+Math.sin(mPhase)*s*12;
        const my2=(0.02+((i*113)%96)/100*0.96)*h+Math.cos(mPhase*0.8)*s*8;
        const mBright=Math.sin(f*0.02+i*2.1)*0.5+0.5;
        ctx.fillStyle=`rgba(255,250,200,${mBright*0.12})`;
        ctx.fillRect(mx2,my2,s*0.4,s*0.4);
      }

      // Falling leaves near forest (subtle)
      for(let i=0;i<8;i++){
        const lPhase=f*0.02+i*1.3;
        const lx=0.72*w+((i*137)%100)/100*0.2*w+Math.sin(lPhase)*s*4;
        const ly=((f*0.3+i*50)%(h*0.3))+0.05*h;
        const rot=Math.sin(lPhase*2)*0.3;
        ctx.fillStyle=i%3===0?'#8a6a30':i%3===1?'#6a8a30':'#aa8840';
        ctx.save();
        ctx.translate(lx,ly);
        ctx.rotate(rot);
        ctx.fillRect(-s*0.3,-s*0.2,s*0.7,s*0.4);
        ctx.restore();
      }

      // ── Wandering Merchant (crosses map periodically) ──
      const merchantCycle=1800; // frames per crossing
      const merchantPhase=(f%merchantCycle)/merchantCycle;
      if(merchantPhase<0.95){ // visible 95% of cycle
        const mx=merchantPhase*w*1.1-w*0.05;
        const my=0.42*h+Math.sin(merchantPhase*Math.PI*3)*s*8;
        // Donkey
        ctx.fillStyle='#8a7a6a';
        ctx.fillRect(mx-s*3,my+s,s*4,s*2);
        ctx.fillRect(mx-s*4,my,s*1.5,s*1.5); // head
        ctx.fillStyle='#7a6a5a';
        ctx.fillRect(mx-s*4.5,my-s,s*0.5,s*1); // ear
        ctx.fillRect(mx-s*3.5,my-s*0.5,s*0.5,s*0.8); // ear
        // Legs
        ctx.fillStyle='#6a5a4a';
        const donkeyWalk=Math.sin(f*0.15);
        ctx.fillRect(mx-s*2.5,my+s*3+donkeyWalk*s*0.3,s*0.5,s*1.5);
        ctx.fillRect(mx-s,my+s*3-donkeyWalk*s*0.3,s*0.5,s*1.5);
        ctx.fillRect(mx+s*0.5,my+s*3+donkeyWalk*s*0.3,s*0.5,s*1.5);
        // Packs on donkey
        ctx.fillStyle='#aa8855';
        ctx.fillRect(mx-s*2,my-s*0.5,s*3.5,s*2);
        ctx.fillStyle=C.WOOD_D;
        ctx.fillRect(mx-s*1.5,my-s*0.3,s*2.5,s*0.3);
        // Colorful goods poking out
        ctx.fillStyle='#ff6666';ctx.fillRect(mx-s,my-s*1,s*0.5,s*0.5);
        ctx.fillStyle='#66ff66';ctx.fillRect(mx,my-s*0.8,s*0.5,s*0.5);
        ctx.fillStyle='#6666ff';ctx.fillRect(mx+s*0.5,my-s*1.2,s*0.5,s*0.5);
        // Merchant walking beside
        const mWalk=Math.sin(f*0.2);
        ctx.fillStyle=C.SKIN;
        ctx.fillRect(mx+s*2,my-s-mWalk*s*0.2,s*1.5,s*1.5); // head
        ctx.fillStyle='#993366'; // purple robe
        ctx.fillRect(mx+s*1.5,my+s*0.5-mWalk*s*0.2,s*2.5,s*2.5);
        ctx.fillStyle='#cc9944'; // hat
        ctx.fillRect(mx+s*1.8,my-s*2-mWalk*s*0.2,s*2,s*1);
        ctx.fillRect(mx+s*1.2,my-s*1.2-mWalk*s*0.2,s*3,s*0.3);
        // Staff
        ctx.fillStyle=C.TRUNK;
        ctx.fillRect(mx+s*4.5,my-s*2,s*0.3,s*5);
        ctx.fillStyle=C.GOLD;
        ctx.beginPath();ctx.arc(mx+s*4.6,my-s*2.5,s*0.5,0,Math.PI*2);ctx.fill();
      }

      // ── Monster Silhouettes at Map Edges ──
      // Dark shapes lurking at the borders — more when higher combat levels
      const combatLvl=(state.skills?.attack?.level||1)+(state.skills?.strength?.level||1);
      const monsterCount=Math.min(Math.floor(combatLvl/15),5);
      for(let mi=0;mi<monsterCount;mi++){
        const edge=mi%4; // 0=top,1=right,2=bottom,3=left
        const breathe=Math.sin(f*0.015+mi*1.7)*s*1;
        let mx2:number,my2:number;
        switch(edge){
          case 0: mx2=(0.15+mi*0.18)*w;my2=s*3+breathe;break;
          case 1: mx2=w-s*5+breathe;my2=(0.3+mi*0.12)*h;break;
          case 2: mx2=(0.25+mi*0.2)*w;my2=h-s*4+breathe;break;
          default: mx2=s*3+breathe;my2=(0.2+mi*0.15)*h;break;
        }
        // Shadow creature
        ctx.fillStyle=`rgba(20,10,15,${0.15+Math.sin(f*0.02+mi)*0.05})`;
        ctx.beginPath();ctx.ellipse(mx2,my2,s*4+mi*s,s*3,0,0,Math.PI*2);ctx.fill();
        // Glowing eyes
        const eyeGlow=0.3+Math.sin(f*0.04+mi*2)*0.2;
        ctx.fillStyle=`rgba(255,40,40,${eyeGlow})`;
        ctx.fillRect(mx2-s*0.8,my2-s*0.3,s*0.4,s*0.3);
        ctx.fillRect(mx2+s*0.4,my2-s*0.3,s*0.4,s*0.3);
        // Red glow
        ctx.fillStyle=`rgba(255,20,20,${eyeGlow*0.15})`;
        ctx.beginPath();ctx.arc(mx2,my2,s*3,0,Math.PI*2);ctx.fill();
      }

      // ── Deer herd (peaceful, near meadow) ──
      for(let di=0;di<3;di++){
        const deerPhase=f*0.003+di*2.1;
        const dx2=(0.35+Math.sin(deerPhase)*0.08)*w;
        const dy2=(0.45+Math.cos(deerPhase*0.7)*0.06)*h;
        const nearBldg=LOCS.some(l=>Math.hypot(dx2/w-l.x,dy2/h-l.y)<l.r+0.04);
        if(nearBldg) continue;
        const isGrazing=Math.sin(f*0.01+di*3)>0.3;
        // Body
        ctx.fillStyle='#8a6a40';
        ctx.fillRect(dx2-s*1.5,dy2,s*3,s*1.8);
        // Head
        const headDip=isGrazing?s*1.5:0;
        ctx.fillStyle='#9a7a50';
        ctx.fillRect(dx2+s*1.5,dy2-s*0.5+headDip,s*1.2,s*1);
        // Antlers (on first deer)
        if(di===0){
          ctx.fillStyle='#7a5a3a';
          ctx.fillRect(dx2+s*1.8,dy2-s*1.5+headDip,s*0.2,s*1);
          ctx.fillRect(dx2+s*2.2,dy2-s*1.2+headDip,s*0.2,s*0.7);
          ctx.fillRect(dx2+s*1.5,dy2-s*1.2+headDip,s*0.6,s*0.2);
        }
        // Legs
        ctx.fillStyle='#7a5a30';
        const deerWalk=Math.sin(f*0.08+di);
        ctx.fillRect(dx2-s,dy2+s*1.8+deerWalk*s*0.3,s*0.3,s*1.2);
        ctx.fillRect(dx2,dy2+s*1.8-deerWalk*s*0.3,s*0.3,s*1.2);
        ctx.fillRect(dx2+s,dy2+s*1.8+deerWalk*s*0.3,s*0.3,s*1.2);
        // White tail
        ctx.fillStyle='#eee';
        ctx.fillRect(dx2-s*1.5,dy2+s*0.3,s*0.5,s*0.5);
      }

      // ── Weather: Rain particles (when frame in certain range) ──
      const weatherCycle=Math.sin(f*0.0005);
      if(weatherCycle>0.7){
        // Light rain
        const rainIntensity=(weatherCycle-0.7)*30;
        for(let ri=0;ri<Math.min(rainIntensity,15);ri++){
          const rx=Math.random()*w;
          const ry=Math.random()*h;
          ctx.fillStyle='rgba(120,160,200,0.15)';
          ctx.fillRect(rx,ry,s*0.15,s*1.5);
        }
        // Puddle ripples
        if(f%10<3){
          const rx=Math.random()*w,ry=Math.random()*h;
          ctx.strokeStyle='rgba(120,160,200,0.08)';ctx.lineWidth=s*0.1;
          ctx.beginPath();ctx.arc(rx,ry,s*1.5,0,Math.PI*2);ctx.stroke();
        }
      }

      // ── Aurora effect at night ──
      const nightPhase=Math.sin(f*0.001);
      if(nightPhase<-0.5){
        const auroraAlpha=(-nightPhase-0.5)*0.2;
        for(let ai=0;ai<5;ai++){
          const ax=ai*w*0.2+Math.sin(f*0.005+ai*0.8)*w*0.05;
          const ay=s*8+Math.sin(f*0.003+ai*1.2)*s*5;
          const aw=w*0.15;
          const ah=s*4+Math.sin(f*0.007+ai)*s*2;
          const colors=['rgba(40,255,120,','rgba(60,200,255,','rgba(180,60,255,','rgba(100,255,200,','rgba(255,100,200,'];
          ctx.fillStyle=`${colors[ai%5]}${auroraAlpha})`;
          ctx.beginPath();ctx.ellipse(ax,ay,aw,ah,Math.sin(f*0.002+ai)*0.3,0,Math.PI*2);ctx.fill();
        }
      }
    };

    // ── Buildings ────────────────────────────────────────────
    const drawBuildings=(w:number,h:number,f:number)=>{
      const s=S();
      LOCS.forEach(loc=>{
        const bx=loc.x*w,by=loc.y*h;

        // Building shadow
        if(loc.building!=='arena'){
          ctx.fillStyle='rgba(0,0,0,0.1)';
          ctx.beginPath();ctx.ellipse(bx+s*2,by+s*2,loc.r*Math.min(w,h)*0.7,loc.r*Math.min(w,h)*0.4,0,0,Math.PI*2);ctx.fill();
        }

        switch(loc.building){
          case 'castle': {
            const cw=s*20,ch=s*16;
            // Courtyard
            ctx.fillStyle=C.STONE_L;
            ctx.fillRect(bx-cw/2+s*2,by-ch/2+s*2,cw-s*4,ch-s*4);
            // Main walls
            ctx.fillStyle=C.CASTLE_W;
            ctx.fillRect(bx-cw/2,by-ch/2,cw,ch);
            // Inner court
            ctx.fillStyle=C.CASTLE_WD;
            ctx.fillRect(bx-cw/2+s*2,by-ch/2+s*2,cw-s*4,ch-s*4);
            // Wall borders with crenellations
            ctx.fillStyle=C.WALL_D;
            for(let cx=bx-cw/2;cx<bx+cw/2;cx+=s*2){
              if(((cx/s)%4)<2){
                ctx.fillRect(cx,by-ch/2,s*2,s);
                ctx.fillRect(cx,by+ch/2-s,s*2,s);
              }
            }
            ctx.fillRect(bx-cw/2,by-ch/2,s,ch);
            ctx.fillRect(bx+cw/2-s,by-ch/2,s,ch);
            // Corner towers (bigger, with detail)
            const tw=s*6;
            [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>{
              const tx=bx+dx*cw/2-tw/2,ty=by+dy*ch/2-tw/2;
              ctx.fillStyle=C.CASTLE_T;
              ctx.fillRect(tx,ty,tw,tw);
              ctx.fillStyle=C.CASTLE_TL;
              ctx.fillRect(tx+s,ty+s,tw-s*2,tw-s*2);
              // Crenellations on towers
              ctx.fillStyle=C.WALL_D;
              ctx.fillRect(tx,ty,tw,s);
              ctx.fillRect(tx+s*2,ty,s,s*2);
            });
            // Main gate with arch detail
            ctx.fillStyle='#1a1008';
            ctx.fillRect(bx-s*2.5,by+ch/2-s*4,s*5,s*4);
            ctx.fillStyle='#2a1a0a';
            ctx.fillRect(bx-s*2,by+ch/2-s*3.5,s*4,s*3.5);
            // Gold banner (animated flag waving)
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx,by-ch/2-s*5,s*0.5,s*3);
            for(let fy2=0;fy2<4;fy2++){
              const wave=Math.sin(f*0.06+fy2*0.5)*s*0.8;
              ctx.fillStyle=fy2%2===0?C.GOLD:C.GOLD_D;
              ctx.fillRect(bx+s+wave,by-ch/2-s*5+fy2*s,s*3+wave*0.3,s);
            }
            // Second flag on opposite tower
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx+cw/2-s*3,by-ch/2-s*4,s*0.5,s*2.5);
            for(let fy3=0;fy3<3;fy3++){
              const wave2=Math.sin(f*0.055+fy3*0.6+1)*s*0.6;
              ctx.fillStyle=fy3%2===0?'#cc3333':'#aa2222';
              ctx.fillRect(bx+cw/2-s*2.5+wave2,by-ch/2-s*4+fy3*s,s*2.5+wave2*0.3,s);
            }
            // Inner buildings
            ctx.fillStyle=C.ROOF;
            ctx.fillRect(bx-s*3,by-s*2,s*6,s*4);
            ctx.fillStyle=C.ROOF_D;
            ctx.fillRect(bx-s*3,by-s*2,s*6,s);
            // Window glow
            if(Math.sin(f*0.02)>-0.3){
              ctx.fillStyle='rgba(255,200,100,0.25)';
              ctx.fillRect(bx-s*2,by-s,s*1.5,s*1.5);
              ctx.fillRect(bx+s,by-s,s*1.5,s*1.5);
            }
            // Courtyard well
            ctx.fillStyle=C.STONE;
            ctx.beginPath();ctx.arc(bx-s*4,by+s*2,s*1.5,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=C.STONE_D;
            ctx.beginPath();ctx.arc(bx-s*4,by+s*2,s,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=C.WATER1;
            ctx.beginPath();ctx.arc(bx-s*4,by+s*2,s*0.5,0,Math.PI*2);ctx.fill();
            // Well frame
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx-s*5,by+s*0.5,s*0.5,s*3);
            ctx.fillRect(bx-s*3,by+s*0.5,s*0.5,s*3);
            ctx.fillRect(bx-s*5,by+s*0.5,s*2.5,s*0.5);
            // Garden patches in courtyard
            ctx.fillStyle='#3a6a2a';
            ctx.fillRect(bx+s*4,by+s,s*3,s*2);
            ctx.fillStyle='#ff6688';
            ctx.fillRect(bx+s*4.5,by+s,s*0.5,s*0.5);
            ctx.fillRect(bx+s*5.5,by+s*1.3,s*0.5,s*0.5);
            ctx.fillStyle='#ffdd44';
            ctx.fillRect(bx+s*5,by+s*0.5,s*0.5,s*0.5);
            ctx.fillRect(bx+s*6,by+s,s*0.5,s*0.5);
            // Torch by gate
            ctx.fillStyle=Math.sin(f*0.09)>0?C.FIRE1:C.FIRE2;
            ctx.fillRect(bx-s*4,by+ch/2-s*2,s,s);
            ctx.fillRect(bx+s*3,by+ch/2-s*2,s,s);
            ctx.fillStyle=C.TORCH_GLOW;
            ctx.beginPath();ctx.arc(bx-s*3.5,by+ch/2-s*1.5,s*4,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(bx+s*3.5,by+ch/2-s*1.5,s*4,0,Math.PI*2);ctx.fill();
            break;
          }
          case 'mine': {
            // Mountain/cliff face
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(bx-s*6,by-s*5,s*12,s*10);
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx-s*5,by-s*4,s*10,s*8);
            ctx.fillStyle=C.CAVE_L;
            ctx.fillRect(bx-s*4,by-s*3,s*8,s*6);
            // Cave entrance (dark)
            ctx.fillStyle='#0a0a0a';
            ctx.fillRect(bx-s*2.5,by-s*1.5,s*5,s*4);
            ctx.fillStyle='#151515';
            ctx.fillRect(bx-s*2,by-s,s*4,s*3);
            // Arch
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx-s*3,by-s*2,s*6,s);
            // Ore veins on cliff
            ctx.fillStyle=C.COPPER;ctx.fillRect(bx-s*5,by-s*3,s*1.5,s*1.5);
            ctx.fillStyle=C.IRON;ctx.fillRect(bx+s*3.5,by-s*4,s*1.5,s*1.5);
            ctx.fillStyle=C.MITHRIL;ctx.fillRect(bx-s*4,by+s*2,s*1.5,s*1.5);
            ctx.fillStyle=C.GOLD_ORE;ctx.fillRect(bx+s*4,by,s,s);
            // Mine cart tracks
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx-s*2,by+s*3,s*10,s*0.5);
            ctx.fillRect(bx-s*2,by+s*4,s*10,s*0.5);
            // Ties
            for(let tx3=bx-s*2;tx3<bx+s*8;tx3+=s*2){
              ctx.fillStyle=C.TRUNK;
              ctx.fillRect(tx3,by+s*2.5,s*1.5,s*2.5);
            }
            // Mine cart
            ctx.fillStyle='#555';
            ctx.fillRect(bx+s*5,by+s*1.5,s*3,s*2.5);
            ctx.fillStyle='#666';
            ctx.fillRect(bx+s*5.5,by+s*1,s*2,s*1);
            // Ore in cart
            ctx.fillStyle=C.COPPER;
            ctx.fillRect(bx+s*5.8,by+s*1.2,s*0.7,s*0.7);
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx+s*6.5,by+s*1.5,s*0.6,s*0.6);
            // Lanterns at entrance (both sides)
            ctx.fillStyle=Math.sin(f*0.08)>0?C.FIRE1:C.FIRE2;
            ctx.fillRect(bx-s*3.5,by-s*1.5,s,s);
            ctx.fillRect(bx+s*3,by-s*1.5,s,s);
            ctx.fillStyle=C.TORCH_GLOW;
            ctx.beginPath();ctx.arc(bx-s*3,by-s,s*6,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(bx+s*3.5,by-s,s*6,0,Math.PI*2);ctx.fill();
            // Support beams inside entrance
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx-s*2.5,by-s*1.5,s*0.5,s*4);
            ctx.fillRect(bx+s*2,by-s*1.5,s*0.5,s*4);
            ctx.fillRect(bx-s*2.5,by-s*1.5,s*5,s*0.5);
            // Pickaxe leaning against wall
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx+s*5,by-s*3,s*0.4,s*3);
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx+s*4.5,by-s*3.5,s*1.5,s);
            break;
          }
          case 'forge': {
            // Stone building
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(bx-s*6,by-s*4,s*12,s*8);
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx-s*5,by-s*3,s*10,s*6);
            // Roof detail
            ctx.fillStyle=C.ROOF_D;
            ctx.fillRect(bx-s*6,by-s*4,s*12,s*1.5);
            // Large chimney
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(bx+s*3,by-s*6,s*3,s*3);
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx+s*3.5,by-s*5.5,s*2,s*2);
            // Smoke
            if(f%4<2) pRef.current.push({x:bx+s*4.5,y:by-s*7,vx:(Math.random()-0.5)*0.3,vy:-0.5,life:50,maxLife:50,color:C.SMOKE,size:s*2,type:'smoke'});
            // Forge fire
            ctx.fillStyle=f%3<1?C.FIRE1:f%3<2?C.FIRE2:C.FIRE3;
            ctx.fillRect(bx-s*3,by-s,s*3,s*2);
            ctx.fillStyle=C.FIRE_GLOW;
            ctx.beginPath();ctx.arc(bx-s*1.5,by,s*8,0,Math.PI*2);ctx.fill();
            // Anvil
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx+s,by,s*3,s);
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(bx+s*1.5,by+s,s*2,s*2);
            // Water trough
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx-s*5,by+s*2,s*3,s*1.5);
            ctx.fillStyle=C.WATER1;
            ctx.fillRect(bx-s*4.5,by+s*2.3,s*2,s*0.8);
            // Metal ingots stacked
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx+s*4,by+s*2,s*2,s);
            ctx.fillRect(bx+s*4.3,by+s,s*1.4,s);
            ctx.fillStyle=C.COPPER;
            ctx.fillRect(bx+s*4,by+s*3,s*2,s);
            // Bellows
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx-s*4,by-s,s*1.5,s*2);
            ctx.fillStyle='#886644';
            ctx.fillRect(bx-s*3.5,by-s*0.5+Math.sin(f*0.08)*s*0.3,s*0.8,s);
            break;
          }
          case 'cabin': {
            // Wooden cabin with more detail
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx-s*5,by-s*3,s*10,s*6);
            ctx.fillStyle=C.WOOD_D;
            // Roof
            ctx.fillRect(bx-s*6,by-s*3,s*12,s*1.5);
            ctx.fillStyle=C.ROOF;
            ctx.fillRect(bx-s*6,by-s*4,s*12,s*1.5);
            // Wall borders
            ctx.fillStyle=C.WOOD_D;
            ctx.fillRect(bx-s*5,by-s*3,s,s*6);
            ctx.fillRect(bx+s*4,by-s*3,s,s*6);
            // Door
            ctx.fillStyle='#1a1008';
            ctx.fillRect(bx-s,by+s,s*2,s*2);
            // Windows
            ctx.fillStyle='#334455';
            ctx.fillRect(bx-s*3,by-s,s*1.5,s*1.5);
            ctx.fillRect(bx+s*2,by-s,s*1.5,s*1.5);
            // Window glow
            if(Math.sin(f*0.025+loc.x*10)>0){
              ctx.fillStyle='rgba(255,200,100,0.15)';
              ctx.fillRect(bx-s*3,by-s,s*1.5,s*1.5);
            }
            // Wood pile nearby
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx+s*5,by,s*2,s);
            ctx.fillRect(bx+s*5,by+s,s*2,s);
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx+s*5,by-s,s*2,s);
            break;
          }
          case 'dock': {
            // Longer dock with more detail
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx-s*3,by-s*1.5,s*12,s*4);
            // Plank lines
            ctx.fillStyle=C.WOOD_D;
            for(let dx=bx-s*3;dx<bx+s*9;dx+=s*2){
              ctx.fillRect(dx,by-s*1.5,s*0.5,s*4);
            }
            // Railing
            ctx.fillStyle=C.WOOD_L||C.WOOD;
            ctx.fillRect(bx-s*3,by-s*2.5,s*12,s);
            // Posts
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx-s*3,by+s*2,s,s*2);
            ctx.fillRect(bx+s*8,by+s*2,s,s*2);
            ctx.fillRect(bx+s*3,by+s*2,s,s*2);
            // Fishing nets (draped)
            ctx.fillStyle='rgba(150,130,100,0.25)';
            for(let nx=0;nx<4;nx++){
              const ny2=Math.sin(nx*0.8+f*0.02)*s*0.5;
              ctx.fillRect(bx+s*6+nx*s,by-s+ny2,s*0.5,s*2);
            }
            ctx.fillRect(bx+s*6,by,s*4,s*0.3);
            // Lantern
            ctx.fillStyle=Math.sin(f*0.07+0.5)>0?C.FIRE1:C.FIRE2;
            ctx.fillRect(bx-s*2,by-s*3,s,s);
            ctx.fillStyle=C.TORCH_GLOW;
            ctx.beginPath();ctx.arc(bx-s*1.5,by-s*2.5,s*5,0,Math.PI*2);ctx.fill();
            // Small boat moored
            ctx.fillStyle=C.WOOD_D;
            ctx.fillRect(bx+s*8,by+s*2,s*5,s*2);
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx+s*8.5,by+s*2.5,s*4,s);
            // Rope
            ctx.strokeStyle='#aa9966';ctx.lineWidth=s*0.3;
            ctx.beginPath();ctx.moveTo(bx+s*8,by+s*2);ctx.lineTo(bx+s*7,by+s);ctx.stroke();
            // Barrel on dock
            ctx.fillStyle='#6a4a2a';
            ctx.fillRect(bx+s*3,by-s*0.5,s*1.5,s*2);
            ctx.fillStyle='#5a3a1a';
            ctx.fillRect(bx+s*3,by-s*0.5,s*1.5,s*0.3);
            ctx.fillRect(bx+s*3,by+s*1,s*1.5,s*0.3);
            break;
          }
          case 'kitchen': {
            // Kitchen building — cozy inn/kitchen
            ctx.fillStyle=C.WALL;
            ctx.fillRect(bx-s*5,by-s*3.5,s*11,s*7);
            ctx.fillStyle=C.WALL_L;
            ctx.fillRect(bx-s*4,by-s*2.5,s*9,s*5);
            // Warm red roof
            ctx.fillStyle=C.ROOF;
            ctx.fillRect(bx-s*6,by-s*4,s*13,s*1.5);
            ctx.fillStyle=C.ROOF_D;
            ctx.fillRect(bx-s*6,by-s*4,s*13,s*0.5);
            // Chimney + smoke
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(bx+s*3,by-s*6,s*2.5,s*3);
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx+s*3.3,by-s*5.5,s*2,s*2);
            if(f%5<2) pRef.current.push({x:bx+s*4.2,y:by-s*7,vx:(Math.random()-0.5)*0.2,vy:-0.35,life:45,maxLife:45,color:C.SMOKE,size:s*1.5,type:'smoke'});
            // Door
            ctx.fillStyle='#2a1a0a';
            ctx.fillRect(bx-s,by+s*1.5,s*2,s*2);
            // Windows (both sides)
            ctx.fillStyle='#334455';
            ctx.fillRect(bx-s*3,by-s,s*1.5,s*1.5);
            ctx.fillRect(bx+s*2,by-s,s*1.5,s*1.5);
            // Window glow (warm kitchen light)
            ctx.fillStyle='rgba(255,180,80,0.2)';
            ctx.fillRect(bx-s*3,by-s,s*1.5,s*1.5);
            ctx.fillRect(bx+s*2,by-s,s*1.5,s*1.5);
            // Outdoor cooking area
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(bx-s*8,by+s,s*2.5,s*2);
            ctx.fillStyle=f%3<1?C.FIRE1:C.FIRE2;
            ctx.fillRect(bx-s*7.5,by+s*0.5,s*1.5,s);
            ctx.fillStyle=C.FIRE_GLOW;
            ctx.beginPath();ctx.arc(bx-s*6.5,by+s*1.5,s*4,0,Math.PI*2);ctx.fill();
            // Food crates
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx+s*6,by-s*1,s*2,s*1.5);
            ctx.fillRect(bx+s*6,by+s*1,s*2,s*1.5);
            ctx.fillStyle=C.WOOD_D;
            ctx.fillRect(bx+s*7,by-s*1,s*0.3,s*1.5);
            ctx.fillRect(bx+s*7,by+s*1,s*0.3,s*1.5);
            // Hanging sign
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx-s*0.5,by-s*4.5,s*0.3,s*1);
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx-s*2,by-s*5.5,s*4,s*1.5);
            ctx.fillStyle='#eeddaa';
            ctx.font=`${Math.max(4,s*1)}px "JetBrains Mono",monospace`;
            ctx.textAlign='center';
            ctx.fillText('INN',bx,by-s*4.5);
            ctx.textAlign='left';
            break;
          }
          case 'arena': {
            const ar=s*8;
            // Arena floor (sand)
            ctx.fillStyle=C.SAND;
            ctx.beginPath();ctx.arc(bx,by,ar-s*2,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=C.SAND2;
            ctx.beginPath();ctx.arc(bx,by,ar-s*4,0,Math.PI*2);ctx.fill();
            // Walls (double ring)
            ctx.strokeStyle=C.WOOD_D;ctx.lineWidth=s*2;
            ctx.beginPath();ctx.arc(bx,by,ar,0,Math.PI*2);ctx.stroke();
            ctx.strokeStyle=C.WOOD;ctx.lineWidth=s;
            ctx.beginPath();ctx.arc(bx,by,ar-s*0.5,0,Math.PI*2);ctx.stroke();
            // Gate openings
            ctx.fillStyle=C.SAND;
            ctx.fillRect(bx-s*2,by+ar-s*1.5,s*4,s*3);
            ctx.fillRect(bx-s*2,by-ar-s*1.5,s*4,s*3);
            // Torches at gates
            [[0,1],[0,-1]].forEach(([dx,dy])=>{
              const tx=bx+dx,ty=by+dy*ar;
              ctx.fillStyle=Math.sin(f*0.09+dx)>0?C.FIRE1:C.FIRE2;
              ctx.fillRect(tx-s*3.5,ty-s,s,s);
              ctx.fillRect(tx+s*3,ty-s,s,s);
            });
            // Training dummies (3 of them)
            [[-3,0],[2,-2],[0,3]].forEach(([dx,dy])=>{
              // Post
              ctx.fillStyle=C.TRUNK;
              ctx.fillRect(bx+dx*s,by+dy*s-s,s,s*3);
              // Arms
              ctx.fillStyle=C.WOOD;
              ctx.fillRect(bx+dx*s-s*1.5,by+dy*s,s*4,s*0.7);
              // Head (sack)
              ctx.fillStyle='#aa9966';
              ctx.fillRect(bx+dx*s-s*0.3,by+dy*s-s*2,s*1.5,s*1.5);
            });
            // Weapon rack
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx+s*4,by-s,s*0.5,s*4);
            ctx.fillRect(bx+s*5.5,by-s,s*0.5,s*4);
            ctx.fillRect(bx+s*4,by-s,s*2,s*0.5);
            // Weapons on rack
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx+s*4.3,by-s*0.5,s*0.3,s*3);
            ctx.fillRect(bx+s*5,by-s*0.5,s*0.3,s*3);
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx+s*4.7,by+s,s*0.3,s*2);
            // Blood stains on arena floor
            ctx.fillStyle='rgba(120,30,20,0.15)';
            ctx.beginPath();ctx.arc(bx-s,by+s,s*2,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(bx+s*2,by-s,s*1.5,0,Math.PI*2);ctx.fill();
            break;
          }
          case 'tower': case 'tower_mage': {
            const isMage=loc.building==='tower_mage';
            // Circular tower — bigger with more detail
            // Outer wall
            ctx.fillStyle=C.STONE;
            ctx.beginPath();ctx.arc(bx,by,s*5,0,Math.PI*2);ctx.fill();
            // Inner wall
            ctx.fillStyle=C.STONE_L;
            ctx.beginPath();ctx.arc(bx,by,s*4,0,Math.PI*2);ctx.fill();
            // Floor
            ctx.fillStyle=isMage?'#2a1a3a':C.STONE_D;
            ctx.beginPath();ctx.arc(bx,by,s*3,0,Math.PI*2);ctx.fill();
            // Crenellations
            for(let a=0;a<Math.PI*2;a+=Math.PI/5){
              ctx.fillStyle=C.STONE_D;
              ctx.fillRect(bx+Math.cos(a)*s*5-s*0.5,by+Math.sin(a)*s*5-s*0.5,s*1.2,s*1.2);
            }
            if(isMage){
              // Arcane glow
              const glow=0.1+Math.sin(f*0.025)*0.06;
              ctx.fillStyle=`rgba(120,60,220,${glow})`;
              ctx.beginPath();ctx.arc(bx,by,s*12,0,Math.PI*2);ctx.fill();
              // Inner arcane circle
              ctx.strokeStyle=`rgba(160,80,255,${0.2+Math.sin(f*0.03)*0.1})`;
              ctx.lineWidth=s*0.3;
              ctx.beginPath();ctx.arc(bx,by,s*2.5,0,Math.PI*2);ctx.stroke();
              // Rune symbols rotating
              for(let ri=0;ri<6;ri++){
                const ra=f*0.02+ri*Math.PI/3;
                ctx.fillStyle=`rgba(170,100,255,${0.4+Math.sin(f*0.04+ri)*0.2})`;
                ctx.fillRect(bx+Math.cos(ra)*s*2.5-s*0.3,by+Math.sin(ra)*s*2.5-s*0.3,s*0.6,s*0.6);
              }
              // Orbiting magic orbs (3)
              for(let oi=0;oi<3;oi++){
                const oa=f*0.03+oi*Math.PI*2/3;
                const oRad=s*(6+Math.sin(f*0.01+oi)*1);
                const ox=bx+Math.cos(oa)*oRad;
                const oy=by+Math.sin(oa)*oRad;
                ctx.fillStyle='#cc88ff';
                ctx.beginPath();ctx.arc(ox,oy,s*0.6,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='rgba(170,100,255,0.2)';
                ctx.beginPath();ctx.arc(ox,oy,s*1.5,0,Math.PI*2);ctx.fill();
              }
            } else {
              // Library tower — bookshelves inside
              ctx.fillStyle='#553322';
              ctx.fillRect(bx-s*2,by-s*2.5,s*4,s);
              ctx.fillRect(bx-s*2,by+s*1.5,s*4,s);
              // Books (colored spines)
              const bookColors=['#cc3333','#3333cc','#33aa33','#ccaa33','#aa33cc','#33aaaa'];
              for(let bi=0;bi<6;bi++){
                ctx.fillStyle=bookColors[bi];
                ctx.fillRect(bx-s*1.8+bi*s*0.6,by-s*2.3,s*0.5,s*0.7);
                ctx.fillRect(bx-s*1.8+bi*s*0.6,by+s*1.7,s*0.5,s*0.7);
              }
              // Reading desk
              ctx.fillStyle=C.WOOD;
              ctx.fillRect(bx-s,by-s*0.5,s*2,s*1.5);
              ctx.fillStyle='#eeddaa';
              ctx.fillRect(bx-s*0.5,by-s*0.3,s,s*0.8); // open book
              // Candle on desk
              ctx.fillStyle=Math.sin(f*0.09)>0?C.FIRE2:C.FIRE3;
              ctx.fillRect(bx+s*0.8,by-s*0.8,s*0.3,s*0.3);
            }
            break;
          }
          case 'temple': {
            // Grand temple with pillars — larger and more detailed
            // Outer platform
            ctx.fillStyle=C.STONE_LL;
            ctx.fillRect(bx-s*7,by-s*5,s*14,s*10);
            // Steps
            ctx.fillStyle=C.STONE_L;
            ctx.fillRect(bx-s*6,by-s*4,s*12,s*8);
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx-s*5,by-s*3,s*10,s*6);
            // Inner sanctum floor
            ctx.fillStyle='#8a8070';
            ctx.fillRect(bx-s*4,by-s*2,s*8,s*4);
            // Pillars (8 around edge) with capitals
            const pillarPositions=[[-5,-4],[4,-4],[-5,3],[4,3],[-5,-1],[4,-1],[-5,1.5],[4,1.5]];
            pillarPositions.forEach(([dx,dy])=>{
              // Base
              ctx.fillStyle=C.STONE_LL;
              ctx.fillRect(bx+dx*s-s*0.2,by+dy*s-s*0.2,s*2,s*2);
              // Column
              ctx.fillStyle=C.SPARK_W;
              ctx.fillRect(bx+dx*s,by+dy*s,s*1.5,s*1.5);
              // Capital
              ctx.fillStyle=C.GOLD_D;
              ctx.fillRect(bx+dx*s-s*0.1,by+dy*s-s*0.3,s*1.7,s*0.4);
            });
            // Grand altar in center
            ctx.fillStyle=C.GOLD_D;
            ctx.fillRect(bx-s*1.5,by-s*1.5,s*3,s*3);
            ctx.fillStyle=C.GOLD;
            ctx.fillRect(bx-s,by-s,s*2,s*2);
            // Sacred flame on altar
            const flameH=s*(2+Math.sin(f*0.08)*0.5);
            ctx.fillStyle=C.FIRE2;
            ctx.fillRect(bx-s*0.3,by-flameH,s*0.6,flameH);
            ctx.fillStyle=C.FIRE3;
            ctx.fillRect(bx-s*0.15,by-flameH*0.7,s*0.3,flameH*0.5);
            // Holy glow (pulsing)
            const holyGlow=0.08+Math.sin(f*0.025)*0.05;
            ctx.fillStyle=`rgba(220,200,120,${holyGlow})`;
            ctx.beginPath();ctx.arc(bx,by,s*12,0,Math.PI*2);ctx.fill();
            // Inner glow
            ctx.fillStyle=`rgba(255,240,180,${holyGlow*0.6})`;
            ctx.beginPath();ctx.arc(bx,by,s*5,0,Math.PI*2);ctx.fill();
            // Candles on pedestals
            [[-s*3,-s*2.5],[s*2,-s*2.5],[-s*3,s*1.5],[s*2,s*1.5]].forEach(([dx,dy])=>{
              // Pedestal
              ctx.fillStyle=C.STONE;
              ctx.fillRect(bx+dx-s*0.2,by+dy-s*0.2,s*1.2,s*1.2);
              // Candle
              ctx.fillStyle='#eeddaa';
              ctx.fillRect(bx+dx+s*0.1,by+dy-s*0.5,s*0.6,s*0.7);
              // Flame
              ctx.fillStyle=Math.sin(f*0.1+dx+dy)>0?C.FIRE2:C.FIRE3;
              ctx.fillRect(bx+dx+s*0.2,by+dy-s*1,s*0.4,s*0.5);
            });
            // Holy symbols on floor
            ctx.fillStyle=`rgba(212,169,67,${0.15+Math.sin(f*0.04)*0.05})`;
            ctx.beginPath();ctx.arc(bx,by,s*3,0,Math.PI*2);ctx.stroke();
            break;
          }
          case 'barracks': {
            // Military compound
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(bx-s*6,by-s*4,s*12,s*8);
            ctx.fillStyle=C.STONE;
            ctx.fillRect(bx-s*5,by-s*3,s*10,s*6);
            // Roof
            ctx.fillStyle='#444';
            ctx.fillRect(bx-s*6,by-s*4,s*12,s*1.5);
            // Door (reinforced)
            ctx.fillStyle='#1a1008';
            ctx.fillRect(bx-s*1.5,by+s,s*3,s*2.5);
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx-s*1.5,by+s,s*3,s*0.3);
            ctx.fillRect(bx-s*1.5,by+s*2,s*3,s*0.3);
            // Animated flag
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx+s*4,by-s*7,s*0.5,s*5);
            for(let fy=0;fy<3;fy++){
              const wave=Math.sin(f*0.06+fy*0.6)*s*0.6;
              ctx.fillStyle=fy%2===0?C.GENERAL:'#cc4444';
              ctx.fillRect(bx+s*4.5+wave,by-s*7+fy*s,s*2.5+wave*0.3,s);
            }
            // Weapon rack (bigger)
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx-s*5,by-s*1,s*0.5,s*3);
            ctx.fillRect(bx-s*3.5,by-s*1,s*0.5,s*3);
            ctx.fillRect(bx-s*5,by-s*1,s*2,s*0.4);
            // Weapons
            ctx.fillStyle=C.IRON;
            ctx.fillRect(bx-s*4.7,by-s*0.5,s*0.3,s*2);
            ctx.fillRect(bx-s*4.2,by-s*0.3,s*0.3,s*1.8);
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(bx-s*3.7,by,s*0.3,s*1.5);
            // Shield on wall
            ctx.fillStyle='#aa5533';
            ctx.beginPath();ctx.arc(bx+s*3,by-s*2,s*1.2,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=C.GOLD_D;
            ctx.beginPath();ctx.arc(bx+s*3,by-s*2,s*0.5,0,Math.PI*2);ctx.fill();
            // Training yard (fenced area to the side)
            ctx.strokeStyle=C.WOOD_D;ctx.lineWidth=s*0.5;
            ctx.strokeRect(bx-s*10,by-s*2,s*4,s*5);
            // Training dummy in yard
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(bx-s*8.5,by-s,s*0.5,s*3);
            ctx.fillStyle='#aa9966';
            ctx.fillRect(bx-s*9,by-s*1.5,s*1.5,s*1.5);
            break;
          }
        }

        // Labels
        const hasW=KINGDOM_WORKERS.some(wk=>loc.workerIds.includes(wk.id)&&(state.kingdom[wk.id]||0)>0);
        ctx.font=`${Math.max(7,s*2.2)}px "JetBrains Mono",monospace`;
        ctx.textAlign='center';ctx.textBaseline='top';
        ctx.fillStyle=hasW?'rgba(212,169,67,0.8)':'rgba(122,110,96,0.35)';
        ctx.fillText(loc.name,bx,by+loc.r*Math.min(w,h)+s*2);
        if(hasW){
          let cnt=0;loc.workerIds.forEach(wid=>{cnt+=(state.kingdom[wid]||0);});
          ctx.fillStyle=C.GOLD;
          ctx.font=`bold ${Math.max(6,s*1.8)}px "JetBrains Mono",monospace`;
          ctx.fillText(`${cnt}`,bx,by+loc.r*Math.min(w,h)+s*4.5);
        }
        ctx.textAlign='left';
      });
    };

    // ── Agent drawing (top-down) ─────────────────────────────
    const drawAgent=(ag:Agent,w:number,h:number,f:number)=>{
      const s=S();
      const ax=ag.nx*w, ay=ag.ny*h;
      const walking=ag.state==='goWork'||ag.state==='goHome';
      // Walking animation: alternate leg movement
      const walkPhase=Math.sin(f*0.2+ag.frame*0.3);
      const bobX=walking?walkPhase*s*0.4:0;
      const bobY=walking?Math.abs(Math.cos(f*0.2+ag.frame*0.3))*s*0.3:0;
      // Working bob
      const workBob=ag.state==='work'?Math.sin(f*0.12+ag.frame)*s*0.5:0;
      const bx=ax+bobX, by=ay-bobY+workBob;

      // Shadow (larger, softer)
      ctx.fillStyle='rgba(0,0,0,0.15)';
      ctx.beginPath();ctx.ellipse(bx+s*0.5,ay+s*4,s*2.5,s*1.2,0,0,Math.PI*2);ctx.fill();

      // Feet/legs (visible when walking)
      if(walking){
        ctx.fillStyle=ag.pants;
        const legOff=walkPhase*s*0.8;
        ctx.fillRect(bx-s*0.3,by+s*3+legOff,s,s);
        ctx.fillRect(bx+s*0.8,by+s*3-legOff,s,s);
        // Dust trail
        if(f%6===0){
          pRef.current.push({
            x:ax,y:ay+s*4,vx:(Math.random()-0.5)*0.3,vy:0.1,
            life:20,maxLife:20,color:'rgba(120,100,70,0.2)',size:s*1.2,type:'smoke',
          });
        }
      }

      // Body (shirt) — slightly bigger
      ctx.fillStyle=ag.shirt;
      ctx.fillRect(bx-s*1.2,by-s*0.2,s*3.4,s*3.4);
      // Shirt shading
      ctx.fillStyle='rgba(0,0,0,0.1)';
      ctx.fillRect(bx+s*1,by+s*1,s*1.2,s*2);

      // Arms
      const armSwing=walking?walkPhase*s*0.6:ag.state==='work'?Math.sin(f*0.15)*s*0.8:0;
      ctx.fillStyle=C.SKIN;
      ctx.fillRect(bx-s*1.8,by+s*0.5+armSwing,s*0.8,s*2);
      ctx.fillRect(bx+s*2.2,by+s*0.5-armSwing,s*0.8,s*2);

      // Head (bigger, rounder)
      ctx.fillStyle=C.SKIN;
      ctx.fillRect(bx-s*0.8,by-s*2.2,s*2.6,s*2.2);
      // Hair
      ctx.fillStyle=ag.hair;
      ctx.fillRect(bx-s*0.8,by-s*2.2,s*2.6,s);
      ctx.fillRect(bx-s*0.8,by-s*2.2,s*0.5,s*1.5);
      // Face direction (eyes)
      ctx.fillStyle='#2a1a10';
      const eyeSize=s*0.4;
      switch(ag.dir){
        case 0: // down — two eyes visible
          ctx.fillRect(bx-s*0.1,by-s*0.6,eyeSize,eyeSize);
          ctx.fillRect(bx+s*1.1,by-s*0.6,eyeSize,eyeSize);
          break;
        case 1: // left
          ctx.fillRect(bx-s*0.3,by-s*0.8,eyeSize,eyeSize);
          break;
        case 2: // right
          ctx.fillRect(bx+s*1.5,by-s*0.8,eyeSize,eyeSize);
          break;
        case 3: // up — no eyes, just back of head
          ctx.fillStyle=ag.hair;
          ctx.fillRect(bx-s*0.5,by-s*1.5,s*2,s*1.5);
          break;
      }

      // Carrying — bouncing resource with shine and trail
      if(ag.carrying&&ag.carryColor){
        const carryBob=Math.sin(f*0.12+ag.frame)*s*0.4;
        const cx2=bx+s*1.8,cy2=by-s*1.2+carryBob;
        // Glow behind resource
        ctx.fillStyle=`${ag.carryColor}22`;
        ctx.beginPath();ctx.arc(cx2+s,cy2+s*0.8,s*2,0,Math.PI*2);ctx.fill();
        // Resource block
        ctx.fillStyle=ag.carryColor;
        ctx.fillRect(cx2,cy2,s*2.2,s*2);
        // Shine highlight
        ctx.fillStyle='rgba(255,255,255,0.4)';
        ctx.fillRect(cx2,cy2,s*1.2,s*0.8);
        ctx.fillStyle='rgba(255,255,255,0.15)';
        ctx.fillRect(cx2+s*1.5,cy2+s*0.5,s*0.5,s*0.5);
        // Border
        ctx.strokeStyle='rgba(0,0,0,0.25)';ctx.lineWidth=s*0.15;
        ctx.strokeRect(cx2,cy2,s*2.2,s*2);
        // Sparkle trail while carrying
        if(walking&&f%8===0){
          pRef.current.push({
            x:ax-s,y:ay+s*2,vx:(Math.random()-0.5)*0.3,vy:-0.2,
            life:18,maxLife:18,color:ag.carryColor,size:s*0.4,type:'spark',
          });
        }
      }

      // Player marker — golden ring + bouncing arrow
      if(ag.isPlayer){
        const pulse=Math.sin(f*0.05)*s*0.6;
        // Outer glow
        ctx.fillStyle='rgba(212,169,67,0.06)';
        ctx.beginPath();ctx.arc(bx+s*0.5,by+s,s*8,0,Math.PI*2);ctx.fill();
        // Ring
        ctx.strokeStyle=C.GOLD;ctx.lineWidth=s*0.6;
        ctx.beginPath();ctx.arc(bx+s*0.5,by+s,s*4.5+pulse,0,Math.PI*2);ctx.stroke();
        // Arrow
        const arrowY=by-s*4-Math.sin(f*0.07)*s*1.2;
        ctx.fillStyle=C.GOLD;
        ctx.beginPath();
        ctx.moveTo(bx+s*0.5,arrowY+s*1.2);
        ctx.lineTo(bx-s*0.3,arrowY);
        ctx.lineTo(bx+s*1.3,arrowY);
        ctx.fill();
      }

      // Label
      if(ag.label&&(ag.isPlayer||ag.id.endsWith('_0'))){
        ctx.font=`${Math.max(6,s*1.8)}px "JetBrains Mono",monospace`;
        ctx.textAlign='center';ctx.textBaseline='bottom';
        const txt=ag.label;
        const tw=ctx.measureText(txt).width;
        // Background pill
        ctx.fillStyle=ag.isPlayer?'rgba(40,30,10,0.75)':'rgba(13,11,9,0.6)';
        const pillW=tw+s*3,pillH=s*2.2;
        const pillX=bx+s*0.5-pillW/2,pillY=by-s*6-pillH;
        ctx.beginPath();
        ctx.roundRect(pillX,pillY,pillW,pillH,s*0.8);
        ctx.fill();
        if(ag.isPlayer){
          ctx.strokeStyle='rgba(212,169,67,0.4)';ctx.lineWidth=0.5;
          ctx.beginPath();ctx.roundRect(pillX,pillY,pillW,pillH,s*0.8);ctx.stroke();
        }
        ctx.fillStyle=ag.isPlayer?C.GOLD:'#ccc8bb';
        ctx.fillText(txt,bx+s*0.5,by-s*5.5);
        ctx.textAlign='left';
      }

      // Worker count badge
      if(ag.workerId&&ag.id.endsWith('_0')){
        const cnt=state.kingdom[ag.workerId]||0;
        if(cnt>1){
          ctx.font=`bold ${Math.max(6,s*1.6)}px "JetBrains Mono",monospace`;
          ctx.textAlign='center';ctx.textBaseline='middle';
          // Circle badge
          const badgeX=bx+s*3.5,badgeY=by-s*2;
          ctx.fillStyle=C.GOLD_D;
          ctx.beginPath();ctx.arc(badgeX,badgeY,s*1.5,0,Math.PI*2);ctx.fill();
          ctx.fillStyle=C.SPARK_W;
          ctx.fillText(`${cnt}`,badgeX,badgeY);
          ctx.textAlign='left';
        }
      }
    };

    // ── Duration scaling helper ─────────────────────────────
    // Maps worker location to approximate action duration (in frames)
    // Higher-level workers = longer work animations = more satisfying
    const getWorkDuration=(workLoc:string):number=>{
      const durationMap:Record<string,number>={
        mine:150, forge:200, forest:120, workshop:180,
        river:160, kitchen:140, arena:250, library:100,
        temple:180, barracks:220, tower:280,
      };
      return durationMap[workLoc]||150;
    };
    // Walking speed scales with distance — further locations = slightly slower perceived
    const getWalkSpeed=(workLoc:string):number=>{
      const speedMap:Record<string,number>={
        mine:0.0014, forge:0.0013, forest:0.0014, workshop:0.0012,
        river:0.0011, kitchen:0.0014, arena:0.0013, library:0.0012,
        temple:0.0011, barracks:0.0013, tower:0.0010,
      };
      return speedMap[workLoc]||0.0012;
    };

    // ── Update agents ────────────────────────────────────────
    const updateAgents=(w:number,h:number)=>{

      aRef.current.forEach(ag=>{
        // Get target location
        const workLoc=LOCS.find(l=>l.id===ag.workLoc);
        const homeLoc=LOCS.find(l=>l.id===ag.homeLoc);
        if(!workLoc||!homeLoc) return;
        const speed=getWalkSpeed(ag.workLoc);

        switch(ag.state){
          case 'idle':
            ag.timer--;
            if(ag.timer<=0){
              ag.state='goWork';ag.carrying=false;
            }
            break;

          case 'goWork': {
            const tx=workLoc.x+ag.workOffX;
            const ty=workLoc.y+ag.workOffY;
            const dx=tx-ag.nx, dy=ty-ag.ny;
            const dist=Math.hypot(dx,dy);
            if(dist<speed*2){
              ag.nx=tx;ag.ny=ty;
              ag.state='work';
              // Duration-aware: harder locations take longer to work
              const baseDuration=getWorkDuration(ag.workLoc);
              ag.timer=baseDuration+Math.floor(Math.random()*baseDuration*0.4);
            } else {
              ag.nx+=dx/dist*speed;
              ag.ny+=dy/dist*speed;
              if(Math.abs(dx)>Math.abs(dy)) ag.dir=dx>0?2:1;
              else ag.dir=dy>0?0:3;
            }
            break;
          }

          case 'work':
            ag.timer--;ag.frame++;
            {
              const ax=ag.nx*w,ay=ag.ny*h;
              const s=S();
              const sparkColors:Record<string,string>={mine:C.SPARK,forge:C.FIRE1,forest:'#88cc44',
                river:C.WATER_LIGHT,kitchen:C.FIRE2,arena:C.DMG,temple:'#ccaa44',tower:'#aa66ff',
                library:'#6688cc',barracks:C.DMG,workshop:C.SPARK};
              const sc=sparkColors[ag.workLoc]||C.SPARK;

              // Frequent small sparks — constant activity feel
              if(ag.frame%12===0){
                for(let i=0;i<3;i++){
                  pRef.current.push({
                    x:ax+s*(Math.random()*8-4),y:ay-s*2,
                    vx:(Math.random()-0.5)*1.5,vy:-1-Math.random()*0.8,
                    life:20,maxLife:20,color:sc,size:s*(0.5+Math.random()*0.4),type:'spark',
                  });
                }
              }
              // Bigger burst every ~2 seconds — satisfying pulse
              if(ag.frame%50===0){
                for(let i=0;i<6;i++){
                  const a=(Math.PI*2*i)/6;
                  pRef.current.push({
                    x:ax,y:ay-s,vx:Math.cos(a)*1.8,vy:Math.sin(a)*1.8-0.5,
                    life:25,maxLife:25,color:sc,size:s*(0.8+Math.random()*0.5),type:'spark',
                  });
                }
              }
            }
            if(ag.timer<=0){
              ag.carrying=!!ag.carryColor;
              ag.state='goHome';
              const ax=ag.nx*w,ay=ag.ny*h;
              const s=S();
              // Color-coded resource notification
              const resData:Record<string,{label:string,color:string}>={
                mine:{label:'+1 🪨 Ore',color:C.COPPER},
                forge:{label:'+1 ⚒️ Bar',color:C.IRON},
                forest:{label:'+1 🪵 Logs',color:'#88cc44'},
                workshop:{label:'+1 🔨 Plank',color:'#aa7755'},
                river:{label:'+1 🐟 Fish',color:'#4488cc'},
                kitchen:{label:'+1 🍖 Food',color:C.FIRE2},
                arena:{label:'⚔️ Victory!',color:'#ff6644'},
                library:{label:'+1 📜 Scroll',color:'#6688cc'},
                temple:{label:'+1 ✨ Essence',color:C.GOLD},
                barracks:{label:'🛡️ Trained!',color:'#cc6644'},
                tower:{label:'+1 🔮 Rune',color:'#aa66ff'},
              };
              const res=resData[ag.workLoc];
              if(res){
                // Main resource text — big and color-coded
                pRef.current.push({
                  x:ax-s*4,y:ay-s*6,vx:0,vy:-0.8,
                  life:80,maxLife:80,color:res.color,size:3,type:'text',text:res.label,
                });
                // Celebratory burst around the agent
                for(let i=0;i<8;i++){
                  const a=(Math.PI*2*i)/8;
                  pRef.current.push({
                    x:ax,y:ay,vx:Math.cos(a)*2,vy:Math.sin(a)*2-0.5,
                    life:22,maxLife:22,color:res.color,size:s*0.7,type:'spark',
                  });
                }
                // Rising sparkle trail
                for(let i=0;i<4;i++){
                  pRef.current.push({
                    x:ax+(Math.random()-0.5)*s*6,y:ay-s*2,
                    vx:(Math.random()-0.5)*0.5,vy:-1.5-Math.random(),
                    life:35,maxLife:35,color:C.SPARK_W,size:s*0.4,type:'spark',
                  });
                }
              }
            }
            break;

          case 'goHome': {
            const tx=homeLoc.x+(Math.random()-0.5)*0.01;
            const ty=homeLoc.y+(Math.random()-0.5)*0.01;
            const dx=tx-ag.nx, dy=ty-ag.ny;
            const dist=Math.hypot(dx,dy);
            if(dist<speed*2){
              ag.nx=tx;ag.ny=ty;
              ag.state='deliver';ag.timer=30+Math.floor(Math.random()*30);
              if(ag.carrying&&ag.carryColor){
                const ax=ag.nx*w,ay=ag.ny*h;
                const s=S();
                // BIG delivery burst — Cookie Clicker style
                // Resource coins flying outward
                for(let i=0;i<10;i++){
                  const angle=(Math.PI*2*i)/10;
                  pRef.current.push({
                    x:ax,y:ay-s*2,vx:Math.cos(angle)*(1.5+Math.random()),vy:Math.sin(angle)*(1.5+Math.random())-1.5,
                    life:45,maxLife:45,color:ag.carryColor,size:s*(1+Math.random()*0.5),type:'coin',
                  });
                }
                // Gold coin shower rising up
                for(let i=0;i<8;i++){
                  pRef.current.push({
                    x:ax+(Math.random()-0.5)*s*12,y:ay-s*4,
                    vx:(Math.random()-0.5)*0.8,vy:-2-Math.random()*1.5,
                    life:50,maxLife:50,color:C.GOLD,size:s*(0.8+Math.random()*0.6),type:'coin',
                  });
                }
                // White sparkle explosion
                for(let i=0;i<12;i++){
                  const a=(Math.PI*2*i)/12;
                  pRef.current.push({
                    x:ax,y:ay-s*2,vx:Math.cos(a)*(2+Math.random()*2),vy:Math.sin(a)*(2+Math.random()*2),
                    life:20,maxLife:20,color:C.SPARK_W,size:s*0.5,type:'spark',
                  });
                }
                // GP amount text — BIG and golden
                const gpAmounts=['+5 GP','+10 GP','+25 GP','+15 GP','+8 GP'];
                const gpText=gpAmounts[Math.floor(Math.random()*gpAmounts.length)];
                pRef.current.push({
                  x:ax-s*3,y:ay-s*8,vx:0,vy:-0.9,
                  life:80,maxLife:80,color:C.GOLD_L,size:3,type:'text',text:gpText,
                });
                // Smaller secondary text
                pRef.current.push({
                  x:ax+s*2,y:ay-s*5,vx:0.3,vy:-0.6,
                  life:50,maxLife:50,color:C.SPARK_W,size:2,type:'text',text:'Delivered!',
                });
                // Gate sparkle at castle entrance
                const castleLoc2=LOCS.find(l=>l.id==='castle');
                if(castleLoc2){
                  const gx=castleLoc2.x*w,gy=castleLoc2.y*h+castleLoc2.r*Math.min(w,h);
                  for(let i=0;i<6;i++){
                    pRef.current.push({
                      x:gx+(Math.random()-0.5)*s*4,y:gy,
                      vx:(Math.random()-0.5)*1,vy:-1-Math.random()*0.5,
                      life:30,maxLife:30,color:C.GOLD,size:s*0.6,type:'spark',
                    });
                  }
                }
              }
            } else {
              ag.nx+=dx/dist*speed;
              ag.ny+=dy/dist*speed;
              if(Math.abs(dx)>Math.abs(dy)) ag.dir=dx>0?2:1;
              else ag.dir=dy>0?0:3;
            }
            break;
          }

          case 'deliver':
            ag.timer--;
            if(ag.timer<=0){
              ag.carrying=false;ag.state='idle';
              ag.timer=15+Math.floor(Math.random()*30);
            }
            break;
        }
      });
    };

    // ── Particles (Cookie Clicker-level feedback) ──────────
    const drawParticles=()=>{
      const s=S();
      pRef.current=pRef.current.filter(p=>p.life>0);
      pRef.current.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.life--;
        if(p.type==='spark'){p.vy+=0.035;p.vx*=0.98;}
        if(p.type==='coin'){p.vy+=0.025;p.vx*=0.97;}
        if(p.type==='smoke'){p.size+=0.025;}
        if(p.type==='text'){p.vy*=0.995;} // text slows down gracefully

        const alpha=p.life/p.maxLife;
        // Pop-in effect: scale up during first few frames
        const popScale=p.life>p.maxLife-5?0.5+(p.maxLife-p.life)/5*0.5:1;

        ctx.globalAlpha=alpha;

        if(p.type==='text'&&p.text){
          const fontSize=Math.max(9,s*2.8)*popScale;
          ctx.font=`bold ${fontSize}px "JetBrains Mono",monospace`;
          // Drop shadow
          ctx.fillStyle='rgba(0,0,0,0.5)';
          ctx.fillText(p.text,p.x+1,p.y+1);
          // Outline
          ctx.strokeStyle='rgba(0,0,0,0.7)';
          ctx.lineWidth=Math.max(2,s*0.4);
          ctx.lineCap='round';ctx.lineJoin='round';
          ctx.strokeText(p.text,p.x,p.y);
          // Main text
          ctx.fillStyle=p.color;
          ctx.fillText(p.text,p.x,p.y);
          // Glow effect for gold text
          if(p.color===C.GOLD||p.color===C.GOLD_L){
            ctx.globalAlpha=alpha*0.3;
            ctx.fillStyle=p.color;
            ctx.font=`bold ${fontSize+2}px "JetBrains Mono",monospace`;
            ctx.fillText(p.text,p.x,p.y);
          }
        } else if(p.type==='coin'){
          const coinSize=p.size*popScale;
          // Outer coin
          ctx.fillStyle=p.color;
          ctx.beginPath();ctx.arc(p.x,p.y,coinSize,0,Math.PI*2);ctx.fill();
          // Inner detail
          ctx.fillStyle=C.GOLD_D;
          ctx.beginPath();ctx.arc(p.x+coinSize*0.1,p.y+coinSize*0.1,coinSize*0.5,0,Math.PI*2);ctx.fill();
          // Shine
          ctx.globalAlpha=alpha*0.6;
          ctx.fillStyle='rgba(255,255,255,0.5)';
          ctx.beginPath();ctx.arc(p.x-coinSize*0.2,p.y-coinSize*0.2,coinSize*0.25,0,Math.PI*2);ctx.fill();
        } else if(p.type==='smoke'){
          ctx.fillStyle=p.color;
          ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
        } else {
          // Sparks — draw as small glowing dots
          const sparkSize=p.size*popScale;
          // Glow
          ctx.globalAlpha=alpha*0.3;
          ctx.fillStyle=p.color;
          ctx.beginPath();ctx.arc(p.x,p.y,sparkSize*2,0,Math.PI*2);ctx.fill();
          // Core
          ctx.globalAlpha=alpha;
          ctx.fillStyle=p.color;
          ctx.fillRect(p.x-sparkSize/2,p.y-sparkSize/2,sparkSize,sparkSize);
          // Bright center
          ctx.fillStyle='rgba(255,255,255,0.4)';
          ctx.fillRect(p.x-sparkSize/4,p.y-sparkSize/4,sparkSize/2,sparkSize/2);
        }
      });
      ctx.globalAlpha=1;
    };

    // ── HUD ──────────────────────────────────────────────────
    const drawHUD=(w:number,h:number)=>{
      const s=S();
      ctx.textBaseline='top';ctx.textAlign='left';
      const fnt=Math.max(7,s*2.2);

      // ── BIG GP COUNTER (Cookie Clicker style) — top center ──
      const gpText=`${state.gp.toLocaleString()} GP`;
      const gpFont=Math.max(14,s*4);
      ctx.font=`bold ${gpFont}px "Cinzel",serif`;
      ctx.textAlign='center';
      const gpW=ctx.measureText(gpText).width+s*8;
      const gpX=w/2,gpY=s*2;
      // Background panel
      ctx.fillStyle='rgba(13,11,9,0.85)';
      ctx.beginPath();ctx.roundRect(gpX-gpW/2,gpY,gpW,gpFont+s*3,s*1.5);ctx.fill();
      ctx.strokeStyle='rgba(212,169,67,0.35)';ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(gpX-gpW/2,gpY,gpW,gpFont+s*3,s*1.5);ctx.stroke();
      // GP number (golden, glowing)
      ctx.fillStyle='rgba(212,169,67,0.15)';
      ctx.fillText(gpText,gpX+1,gpY+s*1.5+1);
      ctx.fillStyle=C.GOLD;
      ctx.fillText(gpText,gpX,gpY+s*1.5);
      ctx.textAlign='left';

      // ── Kingdom info (top-left) with tier ──
      const tierNames=['','Frontier','Established','Fortified','Grand','Legendary'];
      const tierColors=['','#7A6E60','#88aa66','#66aacc','#D4A943','#00ddff'];
      ctx.font=`${fnt}px "JetBrains Mono",monospace`;
      const tierLabel=tierNames[kingdomTier]||'';
      const label=totalW>0?`KINGDOM · ${tierLabel} · ${totalW} workers`:`KINGDOM · ${tierLabel}`;
      const pw=Math.max(s*32,ctx.measureText(label).width+s*6);
      ctx.fillStyle='rgba(13,11,9,0.85)';
      ctx.beginPath();ctx.roundRect(s*2,s*2,pw,s*5,s);ctx.fill();
      ctx.strokeStyle=tierColors[kingdomTier]||'rgba(212,169,67,0.25)';ctx.lineWidth=1;
      ctx.beginPath();ctx.roundRect(s*2,s*2,pw,s*5,s);ctx.stroke();
      ctx.fillStyle=tierColors[kingdomTier]||C.GOLD;ctx.fillText(label,s*4,s*3);

      // Zoom indicator (top-right)
      const cam=camRef.current;
      if(cam.zoom>1.05){
        const zoomPct=Math.round(cam.zoom*100);
        ctx.font=`${Math.max(6,s*1.5)}px "JetBrains Mono",monospace`;
        ctx.textAlign='right';
        const zt=`🔍 ${zoomPct}% · Scroll to zoom · Drag to pan · Dbl-click to reset`;
        const ztw=ctx.measureText(zt).width+s*4;
        ctx.fillStyle='rgba(13,11,9,0.85)';
        ctx.beginPath();ctx.roundRect(w-ztw-s*2,s*2,ztw,s*4,s);ctx.fill();
        ctx.strokeStyle='rgba(100,180,255,0.3)';ctx.lineWidth=0.5;
        ctx.beginPath();ctx.roundRect(w-ztw-s*2,s*2,ztw,s*4,s);ctx.stroke();
        ctx.fillStyle='#88bbff';
        ctx.fillText(zt,w-s*3,s*4.5);
        ctx.textAlign='left';
      }

      // Mini-map (bottom-right corner)
      const mmW=s*30,mmH=s*22;
      const mmX=w-mmW-s*3,mmY=h-mmH-s*3;
      // Background
      ctx.fillStyle='rgba(13,11,9,0.8)';
      ctx.beginPath();ctx.roundRect(mmX-s,mmY-s,mmW+s*2,mmH+s*2,s);ctx.fill();
      ctx.strokeStyle='rgba(212,169,67,0.2)';ctx.lineWidth=0.5;
      ctx.beginPath();ctx.roundRect(mmX-s,mmY-s,mmW+s*2,mmH+s*2,s);ctx.stroke();
      // Green base
      ctx.fillStyle='#2a4a22';
      ctx.fillRect(mmX,mmY,mmW,mmH);
      // River on mini-map
      ctx.fillStyle=C.WATER1;
      ctx.fillRect(mmX+mmW*0.8,mmY,mmW*0.06,mmH);
      // Location dots
      LOCS.forEach(loc=>{
        const dx=mmX+loc.x*mmW;
        const dy=mmY+loc.y*mmH;
        const hasWk=KINGDOM_WORKERS.some(wk=>loc.workerIds.includes(wk.id)&&(state.kingdom[wk.id]||0)>0);
        ctx.fillStyle=loc.id==='castle'?C.GOLD:hasWk?'#88cc88':'#555';
        ctx.fillRect(dx-s*0.5,dy-s*0.5,s,s);
      });
      // Viewport rectangle on minimap when zoomed
      if(cam.zoom>1.05){
        const vpW=mmW/cam.zoom;
        const vpH=mmH/cam.zoom;
        const vpX=mmX+cam.panX*mmW-vpW/2;
        const vpY=mmY+cam.panY*mmH-vpH/2;
        ctx.strokeStyle='rgba(100,180,255,0.6)';ctx.lineWidth=s*0.3;
        ctx.strokeRect(vpX,vpY,vpW,vpH);
        ctx.fillStyle='rgba(100,180,255,0.05)';
        ctx.fillRect(vpX,vpY,vpW,vpH);
      }
      // Player dot on mini-map
      const player=aRef.current.find(a=>a.isPlayer);
      if(player){
        ctx.fillStyle=C.GOLD;
        const px=mmX+player.nx*mmW,py=mmY+player.ny*mmH;
        const pulse=Math.sin(fRef.current*0.08)*s*0.3;
        ctx.beginPath();ctx.arc(px,py,s*0.8+pulse,0,Math.PI*2);ctx.fill();
      }
      // Label
      ctx.font=`${Math.max(5,s*1.2)}px "JetBrains Mono",monospace`;
      ctx.fillStyle='rgba(212,169,67,0.5)';
      ctx.textAlign='center';
      ctx.fillText('MAP',mmX+mmW/2,mmY-s*0.5);
      ctx.textAlign='left';

      // Active workers summary (bottom-left)
      const activeWorkers=KINGDOM_WORKERS.filter(wk=>(state.kingdom[wk.id]||0)>0);
      if(activeWorkers.length>0){
        const sumH=s*(activeWorkers.length*2.5+2);
        const sumW=s*28;
        const sumX=s*3,sumY=h-sumH-s*3;
        ctx.fillStyle='rgba(13,11,9,0.75)';
        ctx.beginPath();ctx.roundRect(sumX,sumY,sumW,sumH,s);ctx.fill();
        ctx.strokeStyle='rgba(212,169,67,0.15)';ctx.lineWidth=0.5;
        ctx.beginPath();ctx.roundRect(sumX,sumY,sumW,sumH,s);ctx.stroke();
        ctx.font=`${Math.max(5,s*1.3)}px "JetBrains Mono",monospace`;
        ctx.fillStyle='rgba(212,169,67,0.5)';
        ctx.fillText('WORKERS',sumX+s*2,sumY+s);
        activeWorkers.forEach((wk,i)=>{
          const wy=sumY+s*2.5+i*s*2.5;
          const cnt=state.kingdom[wk.id]||0;
          const name=wk.name.replace('Kingdom ','').replace('Royal ','').replace('Imperial ','');
          ctx.fillStyle='#888';
          ctx.fillText(name,sumX+s*2,wy);
          ctx.fillStyle=C.GOLD;
          ctx.fillText(`${cnt}`,sumX+sumW-s*4,wy);
        });
      }
    };

    // ── Kingdom Tier Visual Overlays ─────────────────────────
    // Transforms paths, adds decorations based on progression tier
    const drawKingdomTierEffects=(w:number,h:number,f:number)=>{
      const s=S();
      const tier=kingdomTier;
      const castle=LOCS.find(l=>l.id==='castle')!;
      const cx=castle.x*w,cy=castle.y*h;

      if(tier>=2){
        // Stone path upgrade — draw over dirt paths
        PATHS.forEach(([a,b])=>{
          const la=LOCS.find(l=>l.id===a),lb=LOCS.find(l=>l.id===b);
          if(!la||!lb) return;
          const steps=60;
          for(let t=0;t<=steps;t++){
            const frac=t/steps;
            const px=la.x*w+(lb.x*w-la.x*w)*frac;
            const py=la.y*h+(lb.y*h-la.y*h)*frac;
            const curve=Math.sin(frac*Math.PI)*s*5;
            const perpX=-(lb.y-la.y),perpY=lb.x-la.x;
            const len=Math.hypot(perpX,perpY)||1;
            // Cobblestone pattern
            for(let dw=-s*1.5;dw<=s*1.5;dw+=s){
              const stoneShade=((Math.floor(px+py+dw)*11)%10)/10;
              ctx.fillStyle=tier>=4?`rgba(180,160,120,${0.3+stoneShade*0.15})`
                :tier>=3?`rgba(150,140,130,${0.25+stoneShade*0.1})`
                :`rgba(130,120,110,${0.2+stoneShade*0.08})`;
              ctx.fillRect(px+perpX/len*curve+perpX/len*dw,py+perpY/len*curve+perpY/len*dw,s,s);
            }
          }
        });
        // Market stalls near castle
        const stallPositions=[[cx+s*16,cy-s*3],[cx+s*18,cy+s*3]];
        stallPositions.forEach(([sx,sy],si)=>{
          // Stall frame
          ctx.fillStyle=C.WOOD;
          ctx.fillRect(sx-s*3,sy-s*2,s*6,s*0.5); // roof beam
          ctx.fillRect(sx-s*3,sy-s*2,s*0.5,s*4);  // left post
          ctx.fillRect(sx+s*2.5,sy-s*2,s*0.5,s*4); // right post
          // Awning
          ctx.fillStyle=si===0?'#cc4444':'#4444cc';
          ctx.fillRect(sx-s*3.5,sy-s*2.5,s*7,s*1);
          ctx.fillStyle=si===0?'#aa3333':'#3333aa';
          for(let stripe=0;stripe<7;stripe+=2){
            ctx.fillRect(sx-s*3.5+stripe*s,sy-s*2.5,s,s);
          }
          // Goods on counter
          ctx.fillStyle=C.WOOD_D;
          ctx.fillRect(sx-s*2.5,sy+s,s*5,s*1);
          // Items
          const items=si===0?[C.COPPER,C.IRON,C.GOLD_ORE]:['#ff4444','#44ff44','#4444ff'];
          items.forEach((c,ii)=>{
            ctx.fillStyle=c;
            ctx.fillRect(sx-s*2+ii*s*1.8,sy+s*0.2,s*1.2,s*0.8);
          });
        });
      }

      if(tier>=3){
        // Outer walls around the kingdom
        const wallR=Math.min(w,h)*0.38;
        ctx.strokeStyle='rgba(100,90,80,0.3)';
        ctx.lineWidth=s*2;
        ctx.beginPath();ctx.arc(cx,cy,wallR,0,Math.PI*2);ctx.stroke();
        // Guard towers at cardinal points
        [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{
          const tx=cx+Math.cos(a)*wallR;
          const ty=cy+Math.sin(a)*wallR;
          ctx.fillStyle=C.STONE_D;
          ctx.fillRect(tx-s*3,ty-s*3,s*6,s*6);
          ctx.fillStyle=C.STONE;
          ctx.fillRect(tx-s*2,ty-s*2,s*4,s*4);
          // Crenellations
          for(let ci=0;ci<4;ci++){
            ctx.fillStyle=C.STONE_D;
            ctx.fillRect(tx-s*3+ci*s*2,ty-s*3.5,s*1.2,s*1.2);
          }
          // Torch
          ctx.fillStyle=Math.sin(f*0.08+a)>0?C.FIRE1:C.FIRE2;
          ctx.fillRect(tx-s*0.3,ty-s*4,s*0.6,s*0.6);
          ctx.fillStyle=C.TORCH_GLOW;
          ctx.beginPath();ctx.arc(tx,ty-s*3.5,s*4,0,Math.PI*2);ctx.fill();
        });
        // Banners on castle walls
        for(let bi=0;bi<6;bi++){
          const ba=bi*Math.PI/3+Math.PI/6;
          const bx=cx+Math.cos(ba)*(castle.r*Math.min(w,h)+s*4);
          const by=cy+Math.sin(ba)*(castle.r*Math.min(w,h)*0.85+s*4);
          ctx.fillStyle=C.TRUNK;
          ctx.fillRect(bx,by-s*4,s*0.4,s*3);
          for(let fi=0;fi<3;fi++){
            const wave=Math.sin(f*0.06+fi*0.5+bi)*s*0.5;
            ctx.fillStyle=fi%2===0?C.GOLD:'#882222';
            ctx.fillRect(bx+s*0.5+wave,by-s*4+fi*s,s*2+wave*0.3,s);
          }
        }
      }

      if(tier>=4){
        // Fountain in front of castle
        const fntX=cx,fntY=cy+s*14;
        ctx.fillStyle=C.STONE_L;
        ctx.beginPath();ctx.arc(fntX,fntY,s*4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=C.STONE;
        ctx.beginPath();ctx.arc(fntX,fntY,s*3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=C.WATER1;
        ctx.beginPath();ctx.arc(fntX,fntY,s*2.5,0,Math.PI*2);ctx.fill();
        // Center pillar
        ctx.fillStyle=C.STONE_L;
        ctx.fillRect(fntX-s*0.5,fntY-s*3,s,s*3);
        // Water spray
        for(let wi=0;wi<4;wi++){
          const wa=wi*Math.PI/2+f*0.02;
          const wdist=s*(1.5+Math.sin(f*0.04+wi)*0.3);
          const wx=fntX+Math.cos(wa)*wdist;
          const wy=fntY+Math.sin(wa)*wdist*0.6-s;
          ctx.fillStyle='rgba(100,180,255,0.3)';
          ctx.beginPath();ctx.arc(wx,wy,s*0.4,0,Math.PI*2);ctx.fill();
        }
        // Statues flanking castle gate
        [[-1,1],[1,1]].forEach(([dx])=>{
          const stx=cx+dx*s*14,sty=cy+s*8;
          ctx.fillStyle=C.STONE;
          ctx.fillRect(stx-s,sty-s*5,s*2,s*5);
          ctx.fillStyle=C.STONE_L;
          ctx.fillRect(stx-s*0.5,sty-s*6.5,s*1,s*1.5);
          // Sword held
          ctx.fillStyle=C.GOLD;
          ctx.fillRect(stx+dx*s,sty-s*4,s*0.3,s*3);
          // Base
          ctx.fillStyle=C.STONE_D;
          ctx.fillRect(stx-s*1.5,sty,s*3,s*1);
        });
        // Golden path trim
        PATHS.forEach(([a,b])=>{
          if(a!=='castle') return;
          const la=LOCS.find(l=>l.id===a)!,lb=LOCS.find(l=>l.id===b)!;
          for(let t=0;t<15;t++){
            const frac=t/60;
            const px=la.x*w+(lb.x*w-la.x*w)*frac;
            const py=la.y*h+(lb.y*h-la.y*h)*frac;
            ctx.fillStyle=`rgba(212,169,67,${0.08+Math.sin(f*0.03+t)*0.03})`;
            ctx.fillRect(px-s*2,py-s*2,s*4,s*4);
          }
        });
      }

      if(tier>=5){
        // Crystal formations along paths
        const crystalSpots=[[0.30,0.40],[0.65,0.40],[0.40,0.65],[0.60,0.65]];
        crystalSpots.forEach(([cx2,cy2],ci)=>{
          const crx=cx2*w,cry=cy2*h;
          const heights=[s*4,s*6,s*3,s*5,s*3.5];
          heights.forEach((ch,hi)=>{
            const angle=(hi/heights.length)*Math.PI-Math.PI/2+ci*0.3;
            const bx=crx+Math.cos(angle)*s*2;
            const glow=0.3+Math.sin(f*0.03+ci+hi)*0.15;
            // Crystal body
            ctx.fillStyle=`rgba(100,200,255,${glow})`;
            ctx.beginPath();
            ctx.moveTo(bx,cry);
            ctx.lineTo(bx-s*0.5,cry);
            ctx.lineTo(bx-s*0.2,cry-ch);
            ctx.lineTo(bx+s*0.2,cry-ch);
            ctx.lineTo(bx+s*0.5,cry);
            ctx.closePath();ctx.fill();
            // Glow
            ctx.fillStyle=`rgba(100,200,255,${glow*0.15})`;
            ctx.beginPath();ctx.arc(bx,cry-ch/2,s*2,0,Math.PI*2);ctx.fill();
          });
        });
        // Glowing path lines
        PATHS.forEach(([a,b])=>{
          const la=LOCS.find(l=>l.id===a),lb=LOCS.find(l=>l.id===b);
          if(!la||!lb) return;
          const glowPhase=f*0.005;
          for(let t=0;t<1;t+=0.05){
            const glow=0.05+Math.sin(glowPhase+t*10)*0.03;
            const px=la.x*w+(lb.x*w-la.x*w)*t;
            const py=la.y*h+(lb.y*h-la.y*h)*t;
            ctx.fillStyle=`rgba(100,200,255,${glow})`;
            ctx.beginPath();ctx.arc(px,py,s*2,0,Math.PI*2);ctx.fill();
          }
        });
      }

      // Tier label on HUD (drawn later in drawHUD but we calculate here)
    };

    // ── Work Site Resource Accumulation ──────────────────────
    // Draws visible production at each work location based on worker count
    const drawWorkSiteProduction=(w:number,h:number,f:number)=>{
      const s=S();
      const prod=siteProduction;

      // Mine — ore pile outside entrance grows with workers
      const mineCount=prod['mine']||0;
      if(mineCount>0){
        const mineLoc=LOCS.find(l=>l.id==='mine')!;
        const mx=mineLoc.x*w+s*8,my=mineLoc.y*h+s*3;
        const layers=Math.min(mineCount,6);
        for(let layer=0;layer<layers;layer++){
          const ores=[C.COPPER,C.IRON,C.MITHRIL,C.ADAMANT,C.GOLD_ORE];
          const count=4-Math.floor(layer*0.5);
          for(let oi=0;oi<count;oi++){
            ctx.fillStyle=ores[(layer+oi)%5];
            ctx.fillRect(mx+oi*s*1.5-count*s*0.7,my-layer*s*1.2,s*1.2,s);
            ctx.fillStyle='rgba(255,255,255,0.15)';
            ctx.fillRect(mx+oi*s*1.5-count*s*0.7,my-layer*s*1.2,s*0.4,s*0.3);
          }
        }
        // Mine cart fills up
        if(mineCount>=3){
          ctx.fillStyle=C.COPPER;
          ctx.fillRect(mineLoc.x*w+s*5.8,mineLoc.y*h+s*0.8,s*1.5,s*0.8);
          ctx.fillStyle=C.IRON;
          ctx.fillRect(mineLoc.x*w+s*6.5,mineLoc.y*h+s*1,s*0.8,s*0.5);
        }
      }

      // Forest — log stacks in clearing
      const forestCount=prod['forest']||0;
      if(forestCount>0){
        const fLoc=LOCS.find(l=>l.id==='forest')!;
        const fx=fLoc.x*w-s*8,fy=fLoc.y*h+s*4;
        const stacks=Math.min(forestCount,5);
        for(let si=0;si<stacks;si++){
          const logs=3-Math.floor(si*0.4);
          for(let li=0;li<logs;li++){
            ctx.fillStyle=si%2===0?C.TRUNK:C.WOOD;
            ctx.fillRect(fx+si*s*3-s,fy-li*s*1.1,s*2.5,s*0.9);
            ctx.fillStyle='#8a6a44';
            ctx.beginPath();ctx.arc(fx+si*s*3-s,fy-li*s*1.1+s*0.45,s*0.35,0,Math.PI*2);ctx.fill();
          }
        }
        // Sawdust pile
        if(forestCount>=3){
          ctx.fillStyle='rgba(170,150,100,0.3)';
          ctx.beginPath();ctx.ellipse(fx+s*2,fy+s*2,s*4,s*1.5,0,0,Math.PI*2);ctx.fill();
        }
      }

      // Forge — ingot stacks on workbench
      const forgeCount=prod['forge']||0;
      if(forgeCount>0){
        const fgLoc=LOCS.find(l=>l.id==='forge')!;
        const fgx=fgLoc.x*w+s*6,fgy=fgLoc.y*h-s*2;
        const stacks=Math.min(forgeCount,4);
        for(let si=0;si<stacks;si++){
          const bars=3;
          for(let bi=0;bi<bars;bi++){
            const metalColors=[C.COPPER,C.IRON,C.MITHRIL,C.GOLD_ORE];
            ctx.fillStyle=metalColors[si%4];
            ctx.fillRect(fgx+si*s*2,fgy-bi*s*0.8,s*1.5,s*0.6);
            ctx.fillStyle='rgba(255,255,255,0.2)';
            ctx.fillRect(fgx+si*s*2,fgy-bi*s*0.8,s*0.4,s*0.2);
          }
        }
        // Hot metal glow
        if(forgeCount>=4){
          ctx.fillStyle='rgba(255,100,20,0.06)';
          ctx.beginPath();ctx.arc(fgLoc.x*w,fgLoc.y*h,s*12,0,Math.PI*2);ctx.fill();
        }
      }

      // River — fish baskets on dock
      const riverCount=prod['river']||0;
      if(riverCount>0){
        const rLoc=LOCS.find(l=>l.id==='river')!;
        const rx=rLoc.x*w+s*2,ry=rLoc.y*h-s*3;
        const baskets=Math.min(riverCount,4);
        for(let bi=0;bi<baskets;bi++){
          ctx.fillStyle='#8a7a5a';
          ctx.beginPath();ctx.arc(rx+bi*s*2.5,ry,s*1,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle='#6a5a3a';ctx.lineWidth=s*0.15;
          ctx.beginPath();ctx.arc(rx+bi*s*2.5,ry,s*0.9,0,Math.PI*2);ctx.stroke();
          // Fish tails poking out
          ctx.fillStyle='#8899aa';
          ctx.fillRect(rx+bi*s*2.5-s*0.3,ry-s*1.2,s*0.4,s*0.5);
          if(bi<riverCount-1){
            ctx.fillRect(rx+bi*s*2.5+s*0.2,ry-s*1,s*0.3,s*0.4);
          }
        }
        // Drying rack for fish
        if(riverCount>=3){
          const drx=rLoc.x*w-s*4,dry=rLoc.y*h-s*5;
          ctx.fillStyle=C.TRUNK;
          ctx.fillRect(drx,dry,s*0.3,s*4);
          ctx.fillRect(drx+s*5,dry,s*0.3,s*4);
          ctx.fillRect(drx,dry,s*5.3,s*0.3);
          // Hanging fish
          for(let fi=0;fi<3;fi++){
            ctx.fillStyle='#8899aa';
            ctx.fillRect(drx+s+fi*s*1.5,dry+s*0.5,s*0.5,s*1.5);
            ctx.fillStyle='#7788aa';
            ctx.fillRect(drx+s+fi*s*1.5-s*0.2,dry+s*1.8,s*0.9,s*0.3);
          }
        }
      }

      // Kitchen — hanging meats, bread baskets
      const kitchenCount=prod['kitchen']||0;
      if(kitchenCount>0){
        const kLoc=LOCS.find(l=>l.id==='kitchen')!;
        const kx=kLoc.x*w-s*7,ky=kLoc.y*h+s*4;
        // Bread basket
        ctx.fillStyle='#8a7a5a';
        ctx.fillRect(kx,ky,s*3,s*1.5);
        const breads=Math.min(kitchenCount,4);
        for(let bi=0;bi<breads;bi++){
          ctx.fillStyle='#cc9944';
          ctx.beginPath();ctx.arc(kx+s*0.7+bi*s*0.7,ky-s*0.3,s*0.5,0,Math.PI*2);ctx.fill();
        }
        // Hanging meats
        if(kitchenCount>=2){
          for(let mi=0;mi<Math.min(kitchenCount-1,3);mi++){
            ctx.fillStyle='#884433';
            ctx.fillRect(kx+s*5+mi*s*1.5,ky-s*2,s*0.8,s*2.5);
            ctx.fillStyle='#aa6644';
            ctx.fillRect(kx+s*5+mi*s*1.5,ky-s*2,s*0.8,s*0.4);
          }
        }
        // Smoke from cooking
        if(kitchenCount>=3&&f%10<3){
          pRef.current.push({
            x:kLoc.x*w,y:kLoc.y*h-s*5,vx:(Math.random()-0.5)*0.15,vy:-0.25,
            life:30,maxLife:30,color:'rgba(180,160,140,0.15)',size:s*1.5,type:'smoke',
          });
        }
      }

      // Arena — trophy rack, defeated monster trophies
      const arenaCount=prod['arena']||0;
      if(arenaCount>0){
        const aLoc=LOCS.find(l=>l.id==='arena')!;
        const ax=aLoc.x*w+s*10,ay=aLoc.y*h-s*2;
        // Trophy post
        ctx.fillStyle=C.TRUNK;
        ctx.fillRect(ax,ay-s*3,s*0.5,s*5);
        ctx.fillRect(ax+s*3,ay-s*3,s*0.5,s*5);
        ctx.fillRect(ax,ay-s*3,s*3.5,s*0.3);
        // Skulls/trophies
        const trophies=Math.min(arenaCount,5);
        for(let ti=0;ti<trophies;ti++){
          ctx.fillStyle='#ddccbb';
          ctx.beginPath();ctx.arc(ax+s*0.5+ti*s*0.7,ay-s*2,s*0.4,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#111';
          ctx.fillRect(ax+s*0.3+ti*s*0.7,ay-s*2.1,s*0.15,s*0.15);
          ctx.fillRect(ax+s*0.55+ti*s*0.7,ay-s*2.1,s*0.15,s*0.15);
        }
        // Blood stains grow with kills
        for(let bi=0;bi<Math.min(arenaCount,3);bi++){
          ctx.fillStyle=`rgba(120,20,20,${0.05+bi*0.03})`;
          ctx.beginPath();ctx.arc(aLoc.x*w+bi*s*3-s*3,aLoc.y*h+bi*s*2,s*(2+bi),0,Math.PI*2);ctx.fill();
        }
      }

      // Temple — offering pile grows
      const templeCount=prod['temple']||0;
      if(templeCount>0){
        const tLoc=LOCS.find(l=>l.id==='temple')!;
        const tx=tLoc.x*w-s*8,ty=tLoc.y*h+s*3;
        const offerings=Math.min(templeCount,5);
        for(let oi=0;oi<offerings;oi++){
          ctx.fillStyle=C.GOLD;
          ctx.beginPath();ctx.arc(tx+oi*s*1.2,ty-oi*s*0.3,s*0.5,0,Math.PI*2);ctx.fill();
        }
        // Holy glow intensifies
        const glow=0.03+templeCount*0.01;
        ctx.fillStyle=`rgba(255,240,180,${glow})`;
        ctx.beginPath();ctx.arc(tLoc.x*w,tLoc.y*h,s*(10+templeCount*2),0,Math.PI*2);ctx.fill();
      }

      // Library — scroll stacks grow
      const libCount=prod['library']||0;
      if(libCount>0){
        const lLoc=LOCS.find(l=>l.id==='library')!;
        const lx=lLoc.x*w+s*6,ly=lLoc.y*h;
        const scrolls=Math.min(libCount*3,12);
        for(let si=0;si<scrolls;si++){
          const sx2=lx+(si%4)*s*1.2;
          const sy2=ly+Math.floor(si/4)*s*1;
          ctx.fillStyle='#eeddaa';
          ctx.fillRect(sx2,sy2,s*0.8,s*0.4);
          ctx.fillStyle='#cc8844';
          ctx.beginPath();ctx.arc(sx2,sy2+s*0.2,s*0.2,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.arc(sx2+s*0.8,sy2+s*0.2,s*0.2,0,Math.PI*2);ctx.fill();
        }
      }

      // Mage Tower — crystal collection grows
      const towerCount=prod['tower']||0;
      if(towerCount>0){
        const mLoc=LOCS.find(l=>l.id==='tower')!;
        const crystals=Math.min(towerCount,6);
        for(let ci=0;ci<crystals;ci++){
          const angle=ci*Math.PI*2/crystals;
          const dist=s*7;
          const crx=mLoc.x*w+Math.cos(angle)*dist;
          const cry=mLoc.y*h+Math.sin(angle)*dist;
          const glow=0.3+Math.sin(f*0.03+ci)*0.15;
          ctx.fillStyle=`rgba(170,100,255,${glow})`;
          ctx.beginPath();
          ctx.moveTo(crx,cry-s*2);
          ctx.lineTo(crx+s*0.5,cry);
          ctx.lineTo(crx-s*0.5,cry);
          ctx.closePath();ctx.fill();
          ctx.fillStyle=`rgba(170,100,255,${glow*0.2})`;
          ctx.beginPath();ctx.arc(crx,cry-s,s*1.5,0,Math.PI*2);ctx.fill();
        }
        // Arcane circle on ground intensifies
        if(towerCount>=4){
          ctx.strokeStyle=`rgba(170,100,255,${0.15+Math.sin(f*0.02)*0.05})`;
          ctx.lineWidth=s*0.4;
          ctx.beginPath();ctx.arc(mLoc.x*w,mLoc.y*h,s*8,0,Math.PI*2);ctx.stroke();
        }
      }

      // Workshop — crate stacks grow
      const wsCount=prod['workshop']||0;
      if(wsCount>0){
        const wLoc=LOCS.find(l=>l.id==='workshop')!;
        const wx=wLoc.x*w-s*8,wy=wLoc.y*h-s*1;
        const crates=Math.min(wsCount*2,8);
        for(let ci=0;ci<crates;ci++){
          const col=ci%3;
          const row=Math.floor(ci/3);
          ctx.fillStyle=C.WOOD;
          ctx.fillRect(wx+col*s*2.2,wy-row*s*2,s*2,s*1.8);
          ctx.fillStyle=C.WOOD_D;
          ctx.fillRect(wx+col*s*2.2,wy-row*s*2,s*2,s*0.3);
          ctx.fillRect(wx+col*s*2.2+s,wy-row*s*2,s*0.2,s*1.8);
        }
      }

      // Barracks — armor stands filling up
      const barCount=prod['barracks']||0;
      if(barCount>0){
        const bLoc=LOCS.find(l=>l.id==='barracks')!;
        const bx=bLoc.x*w+s*7,by=bLoc.y*h-s*3;
        const stands=Math.min(barCount,4);
        for(let si=0;si<stands;si++){
          const sx2=bx+si*s*3;
          // Stand
          ctx.fillStyle=C.TRUNK;
          ctx.fillRect(sx2+s*0.5,by,s*0.3,s*4);
          ctx.fillRect(sx2-s*0.3,by+s,s*2,s*0.3);
          // Armor
          ctx.fillStyle=C.IRON;
          ctx.fillRect(sx2-s*0.5,by+s*0.5,s*2,s*2);
          // Helmet
          ctx.fillStyle=C.STONE;
          ctx.beginPath();ctx.arc(sx2+s*0.5,by,s*0.7,0,Math.PI*2);ctx.fill();
        }
      }
    };

    // ── Castle Stockpile Visuals ──────────────────────────────
    const drawStockpiles=(w:number,h:number,f:number)=>{
      const s=S();
      const castle=LOCS.find(l=>l.id==='castle')!;
      const cx=castle.x*w, cy=castle.y*h;
      const inv=state.inventory;
      const getQty=(pattern:string)=>{
        let total=0;
        inv.forEach(it=>{if(it.itemId.includes(pattern))total+=it.quantity;});
        return total;
      };

      // ── Ore Pile (left side of castle) ──
      const oreCount=getQty('ore');
      if(oreCount>0){
        const pileSize=Math.min(Math.log2(oreCount+1)*2,12);
        const ox=cx-s*12,oy=cy+s*2;
        // Base pile
        for(let layer=0;layer<Math.min(pileSize,6);layer++){
          const lw=s*(6-layer*0.8);
          const ly=oy-layer*s*1.2;
          const ores=[C.COPPER,C.IRON,C.MITHRIL,C.ADAMANT,C.GOLD_ORE];
          for(let bx2=ox-lw/2;bx2<ox+lw/2;bx2+=s*1.2){
            ctx.fillStyle=ores[Math.floor((bx2*3+layer*7)%5)];
            ctx.fillRect(bx2,ly,s,s);
            // Shine
            if((bx2+layer*s)%4<1){
              ctx.fillStyle='rgba(255,255,255,0.2)';
              ctx.fillRect(bx2,ly,s*0.4,s*0.4);
            }
          }
        }
        // Sparkle on ore pile
        if(f%20<2&&pileSize>3){
          pRef.current.push({
            x:ox+(Math.random()-0.5)*s*6,y:oy-pileSize*s*0.6,
            vx:0,vy:-0.3,life:25,maxLife:25,color:C.SPARK,size:s*0.4,type:'spark',
          });
        }
        // Count label
        ctx.font=`bold ${Math.max(5,s*1.2)}px "JetBrains Mono",monospace`;
        ctx.textAlign='center';
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillText(`${oreCount}`,ox+1,oy+s*2.5+1);
        ctx.fillStyle=C.COPPER;ctx.fillText(`🪨 ${oreCount}`,ox,oy+s*2.5);
        ctx.textAlign='left';
      }

      // ── Wood Stack (right side of castle) ──
      const woodCount=getQty('log')+getQty('plank');
      if(woodCount>0){
        const stackH=Math.min(Math.log2(woodCount+1)*1.5,8);
        const wx=cx+s*12,wy=cy+s*2;
        for(let layer=0;layer<Math.min(stackH,6);layer++){
          const logCount=Math.max(2,5-layer);
          for(let li=0;li<logCount;li++){
            const lx=wx-logCount*s*0.8+li*s*1.6;
            const ly=wy-layer*s*1.3;
            ctx.fillStyle=layer%2===0?C.TRUNK:C.WOOD;
            ctx.fillRect(lx,ly,s*1.5,s);
            // Wood grain
            ctx.fillStyle=C.TRUNK_L;
            ctx.fillRect(lx+s*0.3,ly+s*0.2,s*0.8,s*0.3);
            // End circle
            ctx.fillStyle='#8a6a44';
            ctx.beginPath();ctx.arc(lx,ly+s*0.5,s*0.4,0,Math.PI*2);ctx.fill();
          }
        }
        ctx.font=`bold ${Math.max(5,s*1.2)}px "JetBrains Mono",monospace`;
        ctx.textAlign='center';
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillText(`${woodCount}`,wx+1,wy+s*2.5+1);
        ctx.fillStyle='#88cc44';ctx.fillText(`🪵 ${woodCount}`,wx,wy+s*2.5);
        ctx.textAlign='left';
      }

      // ── Gold Pile (center-front of castle) ──
      const gpDisplay=state.gp;
      if(gpDisplay>100){
        const pileH=Math.min(Math.log10(gpDisplay)*2,10);
        const gx=cx,gy=cy+s*8;
        // Coin pile
        for(let layer=0;layer<Math.min(pileH,5);layer++){
          const coins=Math.max(3,6-layer);
          for(let ci=0;ci<coins;ci++){
            const coinX=gx-coins*s*0.6+ci*s*1.2;
            const coinY=gy-layer*s;
            ctx.fillStyle=C.GOLD;
            ctx.beginPath();ctx.arc(coinX,coinY,s*0.5,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=C.GOLD_D;
            ctx.beginPath();ctx.arc(coinX+s*0.1,coinY+s*0.1,s*0.25,0,Math.PI*2);ctx.fill();
          }
        }
        // Gold shimmer
        if(f%8<2){
          const shimX=gx+(Math.random()-0.5)*s*4;
          const shimY=gy-Math.random()*pileH*s;
          ctx.fillStyle=`rgba(255,215,0,${0.3+Math.random()*0.4})`;
          ctx.fillRect(shimX,shimY,s*0.3,s*0.3);
        }
      }

      // ── Fish Barrels (near dock path) ──
      const fishCount=getQty('fish')+getQty('shark')+getQty('lobster');
      if(fishCount>0){
        const barrels=Math.min(Math.ceil(fishCount/10),4);
        const fx=cx+s*8,fy=cy-s*5;
        for(let bi=0;bi<barrels;bi++){
          const bx2=fx+bi*s*2.5;
          ctx.fillStyle='#6a4a2a';
          ctx.beginPath();ctx.arc(bx2,fy,s*1,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle='#444';ctx.lineWidth=s*0.15;
          ctx.beginPath();ctx.arc(bx2,fy,s*0.9,0,Math.PI*2);ctx.stroke();
          // Fish tail sticking out
          if(bi<fishCount){
            ctx.fillStyle='#8899aa';
            ctx.fillRect(bx2-s*0.3,fy-s*1.2,s*0.6,s*0.5);
          }
          // Water drip
          if(f%30===bi*7){
            pRef.current.push({
              x:bx2,y:fy+s,vx:0,vy:0.2,life:15,maxLife:15,
              color:'rgba(80,140,200,0.4)',size:s*0.3,type:'smoke',
            });
          }
        }
      }

      // ── Food Stores (near kitchen path) ──
      const foodCount=getQty('cooked')+getQty('bread')+getQty('stew')+getQty('pie');
      if(foodCount>0){
        const crates=Math.min(Math.ceil(foodCount/5),5);
        const fdx=cx-s*9,fdy=cy-s*5;
        for(let ci=0;ci<crates;ci++){
          const bx2=fdx+ci*s*2.2;
          ctx.fillStyle=C.WOOD;
          ctx.fillRect(bx2-s*0.8,fdy-s*0.8,s*1.6,s*1.6);
          ctx.fillStyle=C.WOOD_D;
          ctx.fillRect(bx2-s*0.8,fdy-s*0.8,s*1.6,s*0.3);
          ctx.fillRect(bx2,fdy-s*0.8,s*0.2,s*1.6);
          // Steam from fresh food
          if(ci<2&&f%15===ci*5){
            pRef.current.push({
              x:bx2,y:fdy-s,vx:(Math.random()-0.5)*0.1,vy:-0.2,
              life:20,maxLife:20,color:'rgba(255,255,255,0.15)',size:s*0.8,type:'smoke',
            });
          }
        }
      }

      // ── Potion Rack (near library path) ──
      const potionCount=getQty('potion');
      if(potionCount>0){
        const bottles=Math.min(potionCount,8);
        const px=cx+s*5,py=cy-s*8;
        // Shelf
        ctx.fillStyle=C.WOOD;
        ctx.fillRect(px-s,py+s*0.5,s*(bottles*1.2+1),s*0.4);
        for(let bi=0;bi<bottles;bi++){
          const bx2=px+bi*s*1.2;
          const potColors=['#ff4444','#4488ff','#44ff88','#ffaa44','#ff44ff','#44ffff','#ffff44','#aa44ff'];
          // Bottle body
          ctx.fillStyle=potColors[bi%potColors.length];
          ctx.fillRect(bx2,py-s*0.5,s*0.8,s*1);
          // Bottle neck
          ctx.fillStyle=potColors[bi%potColors.length];
          ctx.fillRect(bx2+s*0.2,py-s*0.8,s*0.4,s*0.4);
          // Cork
          ctx.fillStyle='#aa8855';
          ctx.fillRect(bx2+s*0.2,py-s*1,s*0.4,s*0.2);
          // Glow
          ctx.fillStyle=`${potColors[bi%potColors.length]}22`;
          ctx.beginPath();ctx.arc(bx2+s*0.4,py,s*1.2,0,Math.PI*2);ctx.fill();
        }
      }

      // ── Gem Display (sparkly pile near gold) ──
      const gemCount=getQty('gem')+getQty('sapphire')+getQty('ruby')+getQty('emerald')+getQty('diamond');
      if(gemCount>0){
        const gems=Math.min(gemCount,12);
        const gx2=cx+s*3,gy2=cy+s*7;
        const gemColors=['#4488ff','#ff4444','#44ff44','#ffffff','#ff8800','#ff44ff'];
        for(let gi=0;gi<gems;gi++){
          const angle=gi*0.8+gi*0.3;
          const dist=s*(1+gi*0.3);
          const gxx=gx2+Math.cos(angle)*dist*0.4;
          const gyy=gy2+Math.sin(angle)*dist*0.3;
          ctx.fillStyle=gemColors[gi%gemColors.length];
          // Diamond shape
          ctx.beginPath();
          ctx.moveTo(gxx,gyy-s*0.5);
          ctx.lineTo(gxx+s*0.4,gyy);
          ctx.lineTo(gxx,gyy+s*0.5);
          ctx.lineTo(gxx-s*0.4,gyy);
          ctx.closePath();ctx.fill();
          // Sparkle
          if(f%12===gi%12){
            ctx.fillStyle='rgba(255,255,255,0.8)';
            ctx.fillRect(gxx-s*0.1,gyy-s*0.1,s*0.2,s*0.2);
          }
        }
      }
    };

    // ── Resource Flow Trails ─────────────────────────────────
    const updateFlowParticles=(w:number,h:number,f:number)=>{
      const castle=LOCS.find(l=>l.id==='castle')!;
      // Spawn new flow particles from active work locations
      if(f%40===0){
        aRef.current.forEach(ag=>{
          if(ag.state==='goHome'&&ag.carrying&&ag.carryColor){
            const wl=LOCS.find(l=>l.id===ag.workLoc);
            if(!wl) return;
            flowRef.current.push({
              x:wl.x*w,y:wl.y*h,
              tx:castle.x*w,ty:castle.y*h,
              progress:0,color:ag.carryColor,size:S()*0.6,fromLoc:ag.workLoc,
            });
          }
        });
      }
      // Update flow particles
      const s=S();
      flowRef.current=flowRef.current.filter(fp=>{
        fp.progress+=0.008;
        if(fp.progress>=1) return false;
        const t=fp.progress;
        // Curved path with sine wave
        const midX=(fp.x+fp.tx)/2+(fp.y-fp.ty)*0.15;
        const midY=(fp.y+fp.ty)/2-(fp.x-fp.tx)*0.15;
        const px=(1-t)*(1-t)*fp.x+2*(1-t)*t*midX+t*t*fp.tx;
        const py=(1-t)*(1-t)*fp.y+2*(1-t)*t*midY+t*t*fp.ty;
        // Draw as glowing orb
        const alpha=t<0.1?t*10:t>0.9?(1-t)*10:1;
        ctx.globalAlpha=alpha*0.6;
        ctx.fillStyle=fp.color;
        ctx.beginPath();ctx.arc(px,py,fp.size,0,Math.PI*2);ctx.fill();
        // Glow
        ctx.globalAlpha=alpha*0.15;
        ctx.beginPath();ctx.arc(px,py,fp.size*3,0,Math.PI*2);ctx.fill();
        // Trail
        ctx.globalAlpha=alpha*0.3;
        for(let ti=1;ti<4;ti++){
          const tt=Math.max(0,t-ti*0.015);
          const trx=(1-tt)*(1-tt)*fp.x+2*(1-tt)*tt*midX+tt*tt*fp.tx;
          const try2=(1-tt)*(1-tt)*fp.y+2*(1-tt)*tt*midY+tt*tt*fp.ty;
          ctx.fillStyle=fp.color;
          ctx.beginPath();ctx.arc(trx,try2,fp.size*(1-ti*0.2),0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
        return true;
      });
    };

    // ── Zone-Specific Work Animations ────────────────────────
    const drawWorkEffects=(w:number,h:number,f:number)=>{
      const s=S();
      aRef.current.forEach(ag=>{
        if(ag.state!=='work') return;
        const ax=ag.nx*w,ay=ag.ny*h;

        switch(ag.workLoc){
          case 'mine': {
            // Pickaxe swing with rock fragments
            const swingPhase=Math.sin(f*0.15+ag.frame*0.1);
            const pickX=ax-s*2+swingPhase*s*3;
            const pickY=ay-s*2+Math.abs(swingPhase)*s*2;
            // Pickaxe handle
            ctx.fillStyle=C.TRUNK;
            ctx.save();ctx.translate(pickX,pickY);ctx.rotate(swingPhase*0.5);
            ctx.fillRect(0,0,s*0.4,s*2.5);
            // Pick head
            ctx.fillStyle=C.IRON;
            ctx.fillRect(-s*0.5,-s*0.3,s*1.5,s*0.6);
            ctx.restore();
            // Rock fragments on impact
            if(swingPhase>0.9&&ag.frame%4===0){
              for(let i=0;i<3;i++){
                pRef.current.push({
                  x:ax+s*1,y:ay,vx:(Math.random()-0.5)*3,vy:-1.5-Math.random()*2,
                  life:15,maxLife:15,color:[C.STONE,C.STONE_D,C.COPPER][i],size:s*0.4,type:'spark',
                });
              }
            }
            break;
          }
          case 'forest': {
            // Axe chop with wood chips
            const chopPhase=Math.sin(f*0.12+ag.frame*0.1);
            const axeX=ax+s*2;
            const axeY=ay-s+chopPhase*s*2;
            ctx.fillStyle=C.TRUNK;
            ctx.save();ctx.translate(axeX,axeY);ctx.rotate(-0.5+chopPhase*0.8);
            ctx.fillRect(0,0,s*0.3,s*2);
            ctx.fillStyle=C.IRON;
            ctx.fillRect(-s*0.4,-s*0.2,s*1,s*0.5);
            ctx.restore();
            // Wood chips
            if(chopPhase>0.8&&ag.frame%6===0){
              for(let i=0;i<2;i++){
                pRef.current.push({
                  x:ax+s*3,y:ay+s,vx:1+Math.random()*2,vy:-1-Math.random()*1.5,
                  life:18,maxLife:18,color:[C.WOOD,C.TRUNK,'#88cc44'][i%3],size:s*0.3,type:'spark',
                });
              }
            }
            break;
          }
          case 'forge': {
            // Hammer strikes on anvil with sparks + heat glow
            const hammerPhase=Math.sin(f*0.18+ag.frame*0.1);
            const hamY=ay-s*3+Math.abs(hammerPhase)*s*3;
            ctx.fillStyle=C.IRON;
            ctx.fillRect(ax+s,hamY,s*1.2,s*0.8);
            ctx.fillStyle=C.TRUNK;
            ctx.fillRect(ax+s*1.3,hamY+s*0.8,s*0.5,s*1.5);
            // Heat glow on workpiece
            const heatGlow=0.15+Math.sin(f*0.04)*0.08;
            ctx.fillStyle=`rgba(255,100,20,${heatGlow})`;
            ctx.beginPath();ctx.arc(ax+s*1.5,ay+s,s*4,0,Math.PI*2);ctx.fill();
            // Big sparks on hammer contact
            if(hammerPhase>0.85&&ag.frame%3===0){
              for(let i=0;i<5;i++){
                const a=Math.random()*Math.PI*2;
                pRef.current.push({
                  x:ax+s*1.5,y:ay,vx:Math.cos(a)*2.5,vy:Math.sin(a)*2.5-1,
                  life:12,maxLife:12,color:[C.FIRE1,C.FIRE2,C.SPARK][i%3],size:s*0.5,type:'spark',
                });
              }
            }
            break;
          }
          case 'river': {
            // Fishing line cast/reel
            const castPhase=(f*0.008+ag.frame*0.001)%1;
            const lineEndX=ax+s*8;
            const lineEndY=ay+s*2+Math.sin(castPhase*Math.PI*2)*s*1.5;
            // Rod
            ctx.strokeStyle=C.TRUNK;ctx.lineWidth=s*0.2;
            ctx.beginPath();ctx.moveTo(ax+s,ay-s);ctx.lineTo(ax+s*5,ay-s*3);ctx.stroke();
            // Line
            ctx.strokeStyle='rgba(200,200,200,0.4)';ctx.lineWidth=s*0.08;
            ctx.beginPath();ctx.moveTo(ax+s*5,ay-s*3);
            ctx.quadraticCurveTo(ax+s*7,ay-s,lineEndX,lineEndY);ctx.stroke();
            // Bobber
            ctx.fillStyle='#ff4444';
            ctx.beginPath();ctx.arc(lineEndX,lineEndY,s*0.5,0,Math.PI*2);ctx.fill();
            // Ripples around bobber
            const ripR=s*(1.5+Math.sin(f*0.06)*0.5);
            ctx.strokeStyle=`rgba(100,180,255,${0.2+Math.sin(f*0.04)*0.1})`;
            ctx.lineWidth=s*0.1;
            ctx.beginPath();ctx.arc(lineEndX,lineEndY,ripR,0,Math.PI*2);ctx.stroke();
            // Splash on catch
            if(castPhase>0.95){
              for(let i=0;i<3;i++){
                pRef.current.push({
                  x:lineEndX,y:lineEndY,vx:(Math.random()-0.5)*2,vy:-1.5-Math.random(),
                  life:15,maxLife:15,color:C.WATER_LIGHT,size:s*0.5,type:'spark',
                });
              }
            }
            break;
          }
          case 'kitchen': {
            // Stirring pot with steam
            const stirPhase=f*0.05+ag.frame*0.01;
            // Pot
            ctx.fillStyle=C.STONE_D;
            ctx.beginPath();ctx.arc(ax-s*2,ay+s,s*1.5,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#553322';
            ctx.beginPath();ctx.arc(ax-s*2,ay+s,s*1.2,0,Math.PI,false);ctx.fill();
            // Ladle stirring
            const lx=ax-s*2+Math.cos(stirPhase)*s;
            const ly=ay+s+Math.sin(stirPhase)*s*0.5;
            ctx.fillStyle=C.WOOD;
            ctx.fillRect(lx-s*0.15,ly-s*2,s*0.3,s*2);
            // Steam
            if(f%8<2){
              pRef.current.push({
                x:ax-s*2+(Math.random()-0.5)*s*2,y:ay-s,
                vx:(Math.random()-0.5)*0.15,vy:-0.4,
                life:25,maxLife:25,color:'rgba(255,255,255,0.12)',size:s*1.2,type:'smoke',
              });
            }
            break;
          }
          case 'tower': {
            // Spell circle + arcane beams
            const spellPhase=f*0.03+ag.frame*0.01;
            const circleR=s*(3+Math.sin(spellPhase)*0.5);
            ctx.strokeStyle=`rgba(160,80,255,${0.3+Math.sin(f*0.04)*0.15})`;
            ctx.lineWidth=s*0.25;
            ctx.beginPath();ctx.arc(ax,ay,circleR,spellPhase,spellPhase+Math.PI*1.5);ctx.stroke();
            // Inner runes
            for(let ri=0;ri<4;ri++){
              const ra=spellPhase*1.5+ri*Math.PI/2;
              ctx.fillStyle=`rgba(200,140,255,${0.4+Math.sin(f*0.05+ri)*0.2})`;
              ctx.fillRect(ax+Math.cos(ra)*circleR*0.6-s*0.2,ay+Math.sin(ra)*circleR*0.6-s*0.2,s*0.4,s*0.4);
            }
            // Arcane beam upward
            if(ag.frame%60>40){
              const beamAlpha=(ag.frame%60-40)/20*0.3;
              ctx.fillStyle=`rgba(170,100,255,${beamAlpha})`;
              ctx.fillRect(ax-s*0.5,ay-s*20,s,s*18);
              ctx.fillStyle=`rgba(200,160,255,${beamAlpha*0.5})`;
              ctx.fillRect(ax-s*1.5,ay-s*15,s*3,s*12);
            }
            break;
          }
          case 'arena': {
            // Sword clashes + damage numbers
            const fightPhase=Math.sin(f*0.2+ag.frame*0.15);
            // Sword slash arc
            ctx.strokeStyle=`rgba(200,200,210,${0.3+Math.abs(fightPhase)*0.4})`;
            ctx.lineWidth=s*0.3;
            ctx.beginPath();
            ctx.arc(ax+fightPhase*s*2,ay-s,s*2,fightPhase-0.5,fightPhase+1);
            ctx.stroke();
            // Impact sparks
            if(Math.abs(fightPhase)>0.9&&ag.frame%5===0){
              for(let i=0;i<3;i++){
                pRef.current.push({
                  x:ax+s,y:ay-s,vx:(Math.random()-0.5)*3,vy:-1-Math.random()*2,
                  life:10,maxLife:10,color:[C.SPARK,'#ff6644','#fff'][i],size:s*0.4,type:'spark',
                });
              }
            }
            // Damage number
            if(ag.frame%80===0){
              const dmg=Math.floor(5+Math.random()*20);
              pRef.current.push({
                x:ax+s*2,y:ay-s*3,vx:0.5,vy:-1,
                life:40,maxLife:40,color:C.DMG,size:2.5,type:'text',text:`${dmg}`,
              });
            }
            break;
          }
          case 'temple': {
            // Prayer aura + holy light
            const prayPhase=f*0.02+ag.frame*0.005;
            // Kneeling aura
            const auraR=s*(2+Math.sin(prayPhase)*0.8);
            ctx.fillStyle=`rgba(220,200,120,${0.05+Math.sin(prayPhase)*0.03})`;
            ctx.beginPath();ctx.arc(ax,ay,auraR,0,Math.PI*2);ctx.fill();
            // Rising light motes
            if(f%12===0){
              pRef.current.push({
                x:ax+(Math.random()-0.5)*s*3,y:ay,
                vx:0,vy:-0.8,life:40,maxLife:40,
                color:`rgba(255,240,180,0.4)`,size:s*0.3,type:'spark',
              });
            }
            break;
          }
          case 'library': {
            // Page turning + reading particles
            const readPhase=f*0.01+ag.frame*0.005;
            // Book glow
            ctx.fillStyle=`rgba(100,130,200,${0.05+Math.sin(readPhase*2)*0.03})`;
            ctx.beginPath();ctx.arc(ax,ay,s*3,0,Math.PI*2);ctx.fill();
            // Knowledge sparkles rising
            if(f%20===0){
              pRef.current.push({
                x:ax+(Math.random()-0.5)*s*2,y:ay-s,
                vx:(Math.random()-0.5)*0.3,vy:-0.5,
                life:35,maxLife:35,color:'#6688cc',size:s*0.3,type:'spark',
              });
            }
            break;
          }
          case 'barracks': {
            // Training drill — shield bash
            const drillPhase=Math.sin(f*0.14+ag.frame*0.12);
            // Shield
            ctx.fillStyle='#aa5533';
            ctx.beginPath();ctx.arc(ax-s+drillPhase*s,ay,s*1,0,Math.PI*2);ctx.fill();
            ctx.fillStyle=C.GOLD_D;
            ctx.beginPath();ctx.arc(ax-s+drillPhase*s,ay,s*0.4,0,Math.PI*2);ctx.fill();
            // Dust on impact
            if(drillPhase>0.85&&ag.frame%4===0){
              pRef.current.push({
                x:ax+s,y:ay+s,vx:0.5,vy:-0.3,
                life:15,maxLife:15,color:'rgba(160,140,100,0.3)',size:s*1,type:'smoke',
              });
            }
            break;
          }
          case 'workshop': {
            // Sawing/crafting
            const sawPhase=Math.sin(f*0.2+ag.frame*0.1);
            // Saw motion
            ctx.fillStyle=C.IRON;
            ctx.fillRect(ax+s+sawPhase*s*2,ay-s*0.5,s*2,s*0.3);
            // Sawdust
            if(ag.frame%8===0){
              pRef.current.push({
                x:ax+s*2,y:ay,vx:0.5+Math.random(),vy:-0.3,
                life:12,maxLife:12,color:'#aa9966',size:s*0.25,type:'spark',
              });
            }
            break;
          }
        }
      });
    };

    // ── Stockpile Organizer Agent ────────────────────────────
    // Draws a special NPC at castle moving between stockpiles
    const drawOrganizer=(w:number,h:number,f:number)=>{
      const s=S();
      const castle=LOCS.find(l=>l.id==='castle')!;
      const cx=castle.x*w,cy=castle.y*h;
      // Only show if there's stuff to organize
      const hasItems=state.inventory.length>0||state.gp>100;
      if(!hasItems) return;

      // Organizer walks in a circuit around the stockpile areas
      const circuit=[
        [cx-s*12,cy+s*2],  // ore pile
        [cx-s*9,cy-s*5],   // food stores
        [cx,cy+s*8],        // gold pile
        [cx+s*12,cy+s*2],  // wood stack
        [cx+s*8,cy-s*5],   // fish barrels
        [cx+s*5,cy-s*8],   // potions
      ];
      const totalTime=600; // frames per circuit
      const phase=(f%totalTime)/totalTime;
      const segCount=circuit.length;
      const segIdx=Math.floor(phase*segCount);
      const segProgress=(phase*segCount)%1;
      const from=circuit[segIdx];
      const to=circuit[(segIdx+1)%segCount];

      // Smooth position
      const ox=from[0]+(to[0]-from[0])*segProgress;
      const oy=from[1]+(to[1]-from[1])*segProgress;

      // Determine direction
      const dx=to[0]-from[0];
      const dy=to[1]-from[1];
      const dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3);

      // Walking animation
      const walkPhase=Math.sin(f*0.2);
      const bobX=walkPhase*s*0.3;
      const bobY=Math.abs(Math.cos(f*0.2))*s*0.2;

      // Shadow
      ctx.fillStyle='rgba(0,0,0,0.12)';
      ctx.beginPath();ctx.ellipse(ox+s*0.5,oy+s*4,s*2,s*1,0,0,Math.PI*2);ctx.fill();

      // Legs
      ctx.fillStyle='#4a3a2a';
      ctx.fillRect(ox-s*0.3+bobX,oy+s*3+walkPhase*s*0.5-bobY,s,s);
      ctx.fillRect(ox+s*0.8+bobX,oy+s*3-walkPhase*s*0.5-bobY,s,s);

      // Body (apron/work clothes)
      ctx.fillStyle='#8a7a5a';
      ctx.fillRect(ox-s*1+bobX,oy-s*0.2-bobY,s*3,s*3.2);
      // Apron
      ctx.fillStyle='#ccbbaa';
      ctx.fillRect(ox-s*0.5+bobX,oy+s*0.5-bobY,s*2,s*2);

      // Arms (carrying clipboard/broom)
      ctx.fillStyle=C.SKIN;
      ctx.fillRect(ox-s*1.5+bobX,oy+s*0.5+walkPhase*s*0.3-bobY,s*0.6,s*1.5);
      ctx.fillRect(ox+s*2+bobX,oy+s*0.5-walkPhase*s*0.3-bobY,s*0.6,s*1.5);

      // Clipboard in hand
      ctx.fillStyle=C.WOOD;
      ctx.fillRect(ox+s*2.5+bobX,oy-bobY,s*1.2,s*1.5);
      ctx.fillStyle='#eeddcc';
      ctx.fillRect(ox+s*2.6+bobX,oy+s*0.1-bobY,s*0.9,s*1.2);
      // Writing on clipboard
      ctx.fillStyle='#333';
      for(let li=0;li<3;li++){
        ctx.fillRect(ox+s*2.7+bobX,oy+s*(0.3+li*0.3)-bobY,s*0.6,s*0.05);
      }

      // Head
      ctx.fillStyle=C.SKIN;
      ctx.fillRect(ox-s*0.6+bobX,oy-s*2.2-bobY,s*2.2,s*2);
      // Hair (gray — old quartermaster)
      ctx.fillStyle='#999';
      ctx.fillRect(ox-s*0.6+bobX,oy-s*2.2-bobY,s*2.2,s*0.7);
      ctx.fillRect(ox-s*0.6+bobX,oy-s*2.2-bobY,s*0.4,s*1.2);
      // Eyes
      ctx.fillStyle='#2a1a10';
      if(dir===0){
        ctx.fillRect(ox+bobX,oy-s*0.8-bobY,s*0.3,s*0.3);
        ctx.fillRect(ox+s+bobX,oy-s*0.8-bobY,s*0.3,s*0.3);
      } else if(dir===1){
        ctx.fillRect(ox-s*0.2+bobX,oy-s-bobY,s*0.3,s*0.3);
      } else if(dir===2){
        ctx.fillRect(ox+s*1.3+bobX,oy-s-bobY,s*0.3,s*0.3);
      }
      // Glasses
      ctx.strokeStyle='#666';ctx.lineWidth=s*0.1;
      if(dir===0){
        ctx.beginPath();ctx.arc(ox+s*0.15+bobX,oy-s*0.65-bobY,s*0.4,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.arc(ox+s*1.15+bobX,oy-s*0.65-bobY,s*0.4,0,Math.PI*2);ctx.stroke();
      }

      // Label
      ctx.font=`${Math.max(5,s*1.3)}px "JetBrains Mono",monospace`;
      ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.fillStyle='rgba(13,11,9,0.6)';
      const pillW2=ctx.measureText('Quartermaster').width+s*2;
      ctx.beginPath();ctx.roundRect(ox+s*0.5-pillW2/2,oy-s*5-s*2,pillW2,s*2,s*0.5);ctx.fill();
      ctx.fillStyle='#aa9977';
      ctx.fillText('Quartermaster',ox+s*0.5,oy-s*4.5);
      ctx.textAlign='left';

      // Sorting particles when near a stockpile
      if(segProgress>0.4&&segProgress<0.6&&f%15===0){
        pRef.current.push({
          x:ox,y:oy-s*2,vx:(Math.random()-0.5)*0.5,vy:-0.5,
          life:20,maxLife:20,color:C.SPARK,size:s*0.3,type:'spark',
        });
      }
    };

    // ── Loop ─────────────────────────────────────────────────
    let running=true;
    const loop=()=>{
      if(!running) return;
      const f=fRef.current++;
      const w=cv.width,h=cv.height;
      ctx.clearRect(0,0,w,h);

      // Smooth camera interpolation
      const cam=camRef.current;
      cam.zoom+=(cam.targetZoom-cam.zoom)*0.08;
      cam.panX+=(cam.targetPanX-cam.panX)*0.08;
      cam.panY+=(cam.targetPanY-cam.panY)*0.08;

      // Apply camera transform
      ctx.save();
      if(cam.zoom>1.01){
        const cx=cam.panX*w;
        const cy=cam.panY*h;
        ctx.translate(w/2,h/2);
        ctx.scale(cam.zoom,cam.zoom);
        ctx.translate(-cx,-cy);
      }

      drawTerrain(w,h,f);
      drawKingdomTierEffects(w,h,f);
      drawFeatures(w,h,f);
      drawBuildings(w,h,f);
      drawWorkSiteProduction(w,h,f);
      drawStockpiles(w,h,f);
      drawWorkEffects(w,h,f);
      updateAgents(w,h);
      const sorted=[...aRef.current].sort((a,b)=>a.ny-b.ny);
      sorted.forEach(ag=>drawAgent(ag,w,h,f));
      drawOrganizer(w,h,f);
      updateFlowParticles(w,h,f);
      drawParticles();

      // Subtle day cycle
      const dayPhase=Math.sin(f*0.001)*0.5+0.5;
      const tintR=Math.floor(40-dayPhase*20);
      const tintG=Math.floor(30-dayPhase*15);
      const tintB=Math.floor(10+dayPhase*5);
      ctx.fillStyle=`rgba(${tintR},${tintG},${tintB},0.05)`;
      ctx.fillRect(cam.zoom>1.01?cam.panX*w-w:0,cam.zoom>1.01?cam.panY*h-h:0,w*3,h*3);

      // Vignette (always in screen space)
      ctx.restore(); // back to screen space for HUD + vignette

      const vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.35,w/2,h/2,Math.max(w,h)*0.65);
      vg.addColorStop(0,'rgba(0,0,0,0)');
      vg.addColorStop(1,'rgba(0,0,0,0.22)');
      ctx.fillStyle=vg;
      ctx.fillRect(0,0,w,h);

      drawHUD(w,h);
      rafRef.current=requestAnimationFrame(loop);
    };
    loop();

    return()=>{running=false;cancelAnimationFrame(rafRef.current);window.removeEventListener('resize',resize);};
  },[collapsed,totalW,activeSkill,state.activeAction,activeAct,state.kingdom]);

  // Fullscreen container classes
  const containerClass=fullscreen
    ?'fixed inset-0 z-[60] bg-[#0D0B09]'
    :'relative w-full mb-3';

  return (
    <div className={containerClass} style={{fontFamily:"'JetBrains Mono',monospace"}}>
      {/* Control buttons */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {!collapsed&&(
          <button onClick={()=>{setFullscreen(!fullscreen);if(!fullscreen)setCollapsed(false);}}
            className="text-[9px] uppercase tracking-widest px-3 py-1.5 rounded bg-[#0D0B09]/90 text-[#7A6E60] hover:text-[#D4A943] border border-[#3D3328]/50 transition-colors hover:border-[#D4A943]/50">
            {fullscreen?'✕ EXIT':'⛶ FULLSCREEN'}
          </button>
        )}
        {!fullscreen&&(
          <button onClick={()=>setCollapsed(!collapsed)}
            className="text-[9px] uppercase tracking-widest px-2 py-1.5 rounded bg-[#0D0B09]/90 text-[#7A6E60] hover:text-[#D4A943] border border-[#3D3328]/50 transition-colors">
            {collapsed?'▼ WORLD':'▲ HIDE'}
          </button>
        )}
      </div>
      {/* Fullscreen keyboard hint */}
      {fullscreen&&(
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-[9px] uppercase tracking-widest px-4 py-2 rounded-full bg-[#0D0B09]/80 text-[#7A6E60] border border-[#3D3328]/30 pointer-events-none opacity-60">
          Scroll to zoom · Drag to pan · Double-click to focus · ESC to exit
        </div>
      )}
      {!collapsed?(
        <div className="w-full border border-[#3D3328]/50 rounded-lg overflow-hidden bg-[#0D0B09]"
          style={{height:fullscreen?'100vh':'65vh',minHeight:fullscreen?'100vh':'400px'}}>
          <canvas ref={cvRef} className="w-full h-full" style={{imageRendering:'pixelated',cursor:camRef.current.zoom>1.05?'grab':'default'}}/>
        </div>
      ):(
        <div className="w-full h-7 border border-[#3D3328]/30 rounded-lg bg-[#0D0B09]/50 flex items-center justify-center cursor-pointer" onClick={()=>setCollapsed(false)}>
          <span className="text-[9px] uppercase tracking-widest text-[#7A6E60]">
            KINGDOM MAP {totalW>0?`· ${totalW} workers`:''}
          </span>
        </div>
      )}
    </div>
  );
}
