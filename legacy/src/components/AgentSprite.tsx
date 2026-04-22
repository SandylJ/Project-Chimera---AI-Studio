// ═══════════════════════════════════════════════════════════════
//  AgentSprite — Per-agent Pixi component synced from ECS entity
//  Uses useTick to imperatively move the Container each frame.
//  Never mutates React state — all visuals via Pixi refs.
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useCallback } from 'react';
import { useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { AgentEntity, AgentVisualState } from '../ecs/world';

interface AgentSpriteProps {
  entity: AgentEntity;
}

// ── Agent body radius by type ───────────────────────────────
const RADIUS = 6;

// ── Walk bob amplitude ──────────────────────────────────────
const BOB_AMP = 1.2;
const BOB_SPEED = 8;

// ── Work pulse ──────────────────────────────────────────────
const PULSE_SPEED = 4;

export function AgentSprite({ entity }: AgentSpriteProps) {
  const containerRef = useRef<Container | null>(null);
  const dirDotRef = useRef<Graphics | null>(null);
  const timeRef = useRef(0);
  const lastStateRef = useRef<AgentVisualState>(entity.visualState);

  // ── useTick: sync container position from ECS entity ─────
  useTick((ticker) => {
    const c = containerRef.current;
    if (!c) return;

    const dt = ticker.deltaTime / 60;
    timeRef.current += dt;

    // Smooth position sync — the ECS already lerps, so we
    // just apply the position directly. Add walk bob on y.
    let yOffset = 0;
    if (entity.visualState === 'walking') {
      yOffset = Math.sin(timeRef.current * BOB_SPEED) * BOB_AMP;
    }

    c.position.set(entity.position.x, entity.position.y + yOffset);

    // Scale pulse when working
    if (entity.visualState === 'working') {
      const pulse = 1.0 + Math.sin(timeRef.current * PULSE_SPEED) * 0.06;
      c.scale.set(pulse);
    } else {
      c.scale.set(1.0);
    }

    // Draw walking direction dot imperatively (avoids callback recreation)
    const dot = dirDotRef.current;
    if (dot) {
      dot.clear();
      if (entity.visualState === 'walking') {
        const dx = entity.target.x - entity.position.x;
        const dy = entity.target.y - entity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const nx = dx / dist;
          const ny = dy / dist;
          dot.circle(nx * (RADIUS + 3), ny * (RADIUS + 3), 1.5)
            .fill({ color: 0xffffff, alpha: 0.5 });
        }
      }
    }

    // Reset time accumulator on state change to avoid jump
    if (entity.visualState !== lastStateRef.current) {
      timeRef.current = 0;
      lastStateRef.current = entity.visualState;
    }
  });

  // ── Draw the agent body ──────────────────────────────────
  const drawBody = useCallback((g: Graphics) => {
    g.clear();

    const color = entity.color;

    // Drop shadow
    g.circle(1, 2, RADIUS).fill({ color: 0x000000, alpha: 0.25 });

    // Body circle
    g.circle(0, 0, RADIUS).fill({ color });

    // Inner highlight (top-left)
    g.circle(-1.5, -1.5, RADIUS * 0.4).fill({ color: 0xffffff, alpha: 0.15 });

    // Feet dots (gives a "character" feel)
    g.circle(-2, RADIUS - 1, 1.5).fill({ color: color - 0x222222, alpha: 0.8 });
    g.circle(2, RADIUS - 1, 1.5).fill({ color: color - 0x222222, alpha: 0.8 });
  }, [entity.color]);

  // ── Draw state-dependent overlay ─────────────────────────
  // NOTE: Direction dot for walking is handled in useTick via
  // a separate Graphics ref to avoid recreating this callback
  // every frame (position/target mutate at 60fps).
  const drawOverlay = useCallback((g: Graphics) => {
    g.clear();

    if (entity.visualState === 'working') {
      // Spark above head
      g.star(0, -RADIUS - 5, 4, 3, 1.5).fill({ color: 0xffd700, alpha: 0.9 });
      g.circle(0, -RADIUS - 5, 4).stroke({
        color: 0xffd700,
        width: 1,
        alpha: 0.3,
        pixelLine: true,
      });
    } else if (entity.visualState === 'idle') {
      // Subtle "zzz" indicator
      g.circle(RADIUS + 2, -RADIUS, 1).fill({ color: 0xaaaaaa, alpha: 0.3 });
      g.circle(RADIUS + 4, -RADIUS - 3, 0.8).fill({ color: 0xaaaaaa, alpha: 0.2 });
    }
    // Walking direction dot drawn imperatively in useTick below
  }, [entity.visualState]);

  // ── Draw selection/highlight ring ────────────────────────
  const drawRing = useCallback((g: Graphics) => {
    g.clear();

    // Type-colored ring at feet (like an RTS selection circle)
    g.ellipse(0, RADIUS - 1, RADIUS + 2, 3).stroke({
      color: entity.color,
      width: 1,
      alpha: 0.3,
      pixelLine: true,
    });
  }, [entity.color]);

  return (
    <pixiContainer ref={(ref: Container | null) => { containerRef.current = ref; }}>
      {/* Layer 0: Selection ring (below body) */}
      <pixiGraphics draw={drawRing} />

      {/* Layer 1: Agent body */}
      <pixiGraphics draw={drawBody} />

      {/* Layer 2: State overlay (spark/zzz — static per state) */}
      <pixiGraphics draw={drawOverlay} />

      {/* Layer 3: Walking direction dot (redrawn imperatively in useTick) */}
      <pixiGraphics
        draw={() => {}}
        ref={(ref: Graphics | null) => { dirDotRef.current = ref; }}
      />
    </pixiContainer>
  );
}
