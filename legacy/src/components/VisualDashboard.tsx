// ═══════════════════════════════════════════════════════════════
//  Visual Dashboard — PixiJS v8 + Miniplex ECS agent renderer
//  Decoupled "dumb observer" layer over useGame state.
//  Tasks 1-4: Canvas, ECS sync, AgentSprite, FloatingText
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Application, extend, useTick, useApplication } from '@pixi/react';
import {
  Container,
  Graphics,
  Text,
  TextStyle,
  Sprite,
  Rectangle,
  FederatedPointerEvent,
} from 'pixi.js';

import { PlayerState } from '../types';
import { GameEvent } from '../useGame';
import {
  ecsWorld,
  syncFromGameState,
  tickAgents,
  drainWorkEvents,
  resetECS,
  allAgents,
  TILE_SIZE,
  WORLD_W,
  WORLD_H,
  LOCATIONS,
  AgentEntity,
} from '../ecs/world';
import { AgentSprite } from './AgentSprite';
import { FloatingText, FloatingTextData } from './FloatingText';

// ── Register Pixi components for the JSX pragma ─────────────
extend({ Container, Graphics, Text, Sprite });

// ── Props ───────────────────────────────────────────────────
interface VisualDashboardProps {
  state: PlayerState;
  events: GameEvent[];
}

// ── Constants ───────────────────────────────────────────────
const CANVAS_W = 960;
const CANVAS_H = 640;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.15;

const GRID_COLOR = 0x2a2a2a;
const GRID_ALPHA = 0.35;
const BG_COLOR = 0x1a1612;

// Floating text color per bonus type
const BONUS_COLORS: Record<string, number> = {
  gp: 0xd4a943,
  xp: 0x00ff88,
  celestial_essence: 0xbb77ff,
};

// Max floating texts alive at once (prevent runaway with many workers)
const MAX_FLOATS = 40;

// ── Camera state (mutable ref, not React state) ─────────────
interface CameraState {
  x: number;
  y: number;
  zoom: number;
  dragging: boolean;
  dragStartX: number;
  dragStartY: number;
  camStartX: number;
  camStartY: number;
}

// ═════════════════════════════════════════════════════════════
//  Inner scene — rendered inside <Application>
// ═════════════════════════════════════════════════════════════
function WorldScene({ state }: { state: PlayerState }) {
  const { app } = useApplication();
  const cameraRef = useRef<CameraState>({
    x: WORLD_W / 2 - CANVAS_W / 2,
    y: WORLD_H / 2 - CANVAS_H / 2,
    zoom: 1.0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    camStartX: 0,
    camStartY: 0,
  });

  const worldContainerRef = useRef<Container | null>(null);

  // ── Floating text state (React-managed for mount/unmount) ─
  const [floats, setFloats] = useState<FloatingTextData[]>([]);

  const removeFloat = useCallback((id: string) => {
    setFloats(prev => prev.filter(f => f.id !== id));
  }, []);

  // ── Agent snapshot for React rendering ────────────────────
  // Polled via setInterval (not useTick) to avoid stale closures.
  const [agentSnapshot, setAgentSnapshot] = useState<AgentEntity[]>([]);

  // ── Sync ECS from game state on change ───────────────────
  useEffect(() => {
    syncFromGameState(state);
    // Immediately snapshot after sync
    setAgentSnapshot([...allAgents.entities]);
  }, [state.kingdom]);

  // ── Poll for entity list changes (mount/unmount agents) ──
  useEffect(() => {
    const interval = setInterval(() => {
      const current = allAgents.entities;
      setAgentSnapshot(prev =>
        prev.length !== current.length ? [...current] : prev
      );
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // ── Pending float queue — accumulated in useTick, flushed via ref callback
  const pendingFloatsRef = useRef<FloatingTextData[]>([]);

  // ── Tick: move agents + camera + drain events ────────────
  useTick((ticker) => {
    const dt = ticker.deltaTime / 60;
    tickAgents(dt);

    // Apply camera to world container
    const wc = worldContainerRef.current;
    if (wc) {
      const cam = cameraRef.current;
      wc.scale.set(cam.zoom);
      wc.position.set(-cam.x * cam.zoom, -cam.y * cam.zoom);
    }

    // Drain work-completion events into pending queue
    const events = drainWorkEvents();
    if (events.length > 0) {
      for (const evt of events) {
        pendingFloatsRef.current.push({
          id: `float_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          text: evt.label,
          x: evt.x,
          y: evt.y - 12,
          color: BONUS_COLORS[evt.bonusType] || 0xffffff,
        });
      }
    }
  });

  // ── Flush pending floats into React state at controlled rate ─
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingFloatsRef.current.length === 0) return;
      const batch = pendingFloatsRef.current.splice(0, pendingFloatsRef.current.length);
      setFloats(prev => {
        const combined = [...prev, ...batch];
        return combined.length > MAX_FLOATS
          ? combined.slice(combined.length - MAX_FLOATS)
          : combined;
      });
    }, 100); // flush 10x/sec, not 60x
    return () => clearInterval(interval);
  }, []);

  // ── Mouse/touch handlers for pan & zoom ──────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const dir = e.deltaY < 0 ? 1 : -1;
    const oldZoom = cam.zoom;
    cam.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom + dir * ZOOM_STEP));

    if (oldZoom > 0 && cam.zoom > 0) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const worldX = cam.x + mx / oldZoom;
      const worldY = cam.y + my / oldZoom;
      cam.x = worldX - mx / cam.zoom;
      cam.y = worldY - my / cam.zoom;
    }
  }, []);

  const onPointerDown = useCallback((e: FederatedPointerEvent) => {
    const cam = cameraRef.current;
    cam.dragging = true;
    cam.dragStartX = e.globalX;
    cam.dragStartY = e.globalY;
    cam.camStartX = cam.x;
    cam.camStartY = cam.y;
  }, []);

  const onPointerMove = useCallback((e: FederatedPointerEvent) => {
    const cam = cameraRef.current;
    if (!cam.dragging) return;
    const dx = e.globalX - cam.dragStartX;
    const dy = e.globalY - cam.dragStartY;
    cam.x = cam.camStartX - dx / cam.zoom;
    cam.y = cam.camStartY - dy / cam.zoom;
  }, []);

  const onPointerUp = useCallback(() => {
    cameraRef.current.dragging = false;
  }, []);

  // Store onWheel in ref so the listener doesn't need re-registration
  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;

  useEffect(() => {
    const canvas = app?.canvas;
    if (!canvas) return;
    const handler = (e: WheelEvent) => onWheelRef.current(e);
    canvas.addEventListener('wheel', handler, { passive: false });
    return () => canvas.removeEventListener('wheel', handler);
  }, [app]);

  // ── Draw the 32×32 tile grid (pixelLine) ─────────────────
  const drawGrid = useCallback((g: Graphics) => {
    g.clear();
    for (let col = 0; col <= WORLD_W / TILE_SIZE; col++) {
      const x = col * TILE_SIZE;
      g.moveTo(x, 0).lineTo(x, WORLD_H).stroke({
        color: GRID_COLOR, width: 1, alpha: GRID_ALPHA, pixelLine: true,
      });
    }
    for (let row = 0; row <= WORLD_H / TILE_SIZE; row++) {
      const y = row * TILE_SIZE;
      g.moveTo(0, y).lineTo(WORLD_W, y).stroke({
        color: GRID_COLOR, width: 1, alpha: GRID_ALPHA, pixelLine: true,
      });
    }
    g.rect(0, 0, WORLD_W, WORLD_H).stroke({
      color: 0x555555, width: 2, pixelLine: true,
    });
  }, []);

  // ── Draw terrain ─────────────────────────────────────────
  const drawTerrain = useCallback((g: Graphics) => {
    g.clear();
    g.rect(0, 0, WORLD_W, WORLD_H).fill({ color: 0x3a6030 });
    // Darker border bands
    g.rect(0, 0, WORLD_W, 8).fill({ color: 0x2a4a20 });
    g.rect(0, WORLD_H - 8, WORLD_W, 8).fill({ color: 0x2a4a20 });
    g.rect(0, 0, 8, WORLD_H).fill({ color: 0x2a4a20 });
    g.rect(WORLD_W - 8, 0, 8, WORLD_H).fill({ color: 0x2a4a20 });
  }, []);

  // ── Draw location markers ────────────────────────────────
  const locationMarkers = useMemo(() => {
    return Object.values(LOCATIONS) as Array<{ id: string; cx: number; cy: number; radius: number }>;
  }, []);

  const drawLocations = useCallback((g: Graphics) => {
    g.clear();
    for (const loc of locationMarkers) {
      // Zone circle
      g.circle(loc.cx, loc.cy, loc.radius).stroke({
        color: 0x888866, width: 1, alpha: 0.2, pixelLine: true,
      });
      // Center dot
      g.circle(loc.cx, loc.cy, 2).fill({ color: 0xaa9977, alpha: 0.4 });
    }
  }, [locationMarkers]);

  return (
    <pixiContainer
      eventMode="static"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerUpOutside={onPointerUp}
      hitArea={new Rectangle(0, 0, CANVAS_W, CANVAS_H)}
    >
      {/* World container — camera-transformed */}
      <pixiContainer ref={(ref: Container | null) => { worldContainerRef.current = ref; }}>
        {/* Layer 0: Terrain */}
        <pixiGraphics draw={drawTerrain} />

        {/* Layer 1: Grid */}
        <pixiGraphics draw={drawGrid} />

        {/* Layer 2: Location zones */}
        <pixiGraphics draw={drawLocations} />

        {/* Layer 2.5: Location name labels */}
        {locationMarkers.map(loc => (
          <pixiText
            key={loc.id}
            ref={(ref: any) => {
              if (ref) {
                ref.text = loc.id.toUpperCase();
                ref.position.set(loc.cx, loc.cy + loc.radius + 6);
                ref.anchor.set(0.5, 0);
                ref.style = new TextStyle({
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 8,
                  fill: 0x7a6e60,
                  letterSpacing: 1.5,
                });
              }
            }}
          />
        ))}

        {/* Layer 3: Agent sprites (individual per-entity components) */}
        {agentSnapshot.map(agent => (
          <AgentSprite key={agent.id} entity={agent} />
        ))}

        {/* Layer 4: Floating text (GSAP-tweened reward popups) */}
        {floats.map(f => (
          <FloatingText key={f.id} data={f} onComplete={removeFloat} />
        ))}
      </pixiContainer>
    </pixiContainer>
  );
}

// ═════════════════════════════════════════════════════════════
//  Outer wrapper — mounts the Pixi <Application>
// ═════════════════════════════════════════════════════════════
export function VisualDashboard({ state, events }: VisualDashboardProps) {
  // Reset ECS on unmount (handles HMR and tab switching cleanly)
  useEffect(() => {
    return () => resetECS();
  }, []);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-[#3D3328]"
      style={{
        height: CANVAS_H,
        maxWidth: CANVAS_W,
        background: `#${BG_COLOR.toString(16).padStart(6, '0')}`,
      }}
    >
      <Application
        width={CANVAS_W}
        height={CANVAS_H}
        background={BG_COLOR}
        antialias={false}
        resolution={window.devicePixelRatio || 1}
        autoDensity={true}
        className="w-full h-full"
      >
        <WorldScene state={state} />
      </Application>

      {/* HUD overlay */}
      <div
        className="absolute top-2 left-3 text-[10px] text-[#7A6E60] uppercase tracking-widest pointer-events-none select-none"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        agents: {ecsWorld.entities.length}
      </div>
      <div
        className="absolute bottom-2 right-3 text-[9px] text-[#5A5040] pointer-events-none select-none"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        scroll to zoom &middot; drag to pan
      </div>
    </div>
  );
}
