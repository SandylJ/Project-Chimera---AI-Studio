// ═══════════════════════════════════════════════════════════════
//  FloatingText — GSAP-tweened "+1 Iron" style reward popups
//  Spawns at world coords, rises 50px, fades out over 1.5s,
//  then calls onComplete so the parent can unmount it.
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useEffect } from 'react';
import { Container, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';

export interface FloatingTextData {
  id: string;
  text: string;
  x: number;
  y: number;
  color: number;
}

interface FloatingTextProps {
  data: FloatingTextData;
  onComplete: (id: string) => void;
}

// Shared text style — pixel-crisp bitmap feel
const FLOAT_STYLE = new TextStyle({
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 11,
  fontWeight: '700',
  fill: 0xffffff, // overridden per-instance via tint
  letterSpacing: 0.5,
  dropShadow: {
    color: 0x000000,
    blur: 0,
    distance: 1,
    angle: Math.PI / 2,
    alpha: 0.6,
  },
});

export function FloatingText({ data, onComplete }: FloatingTextProps) {
  const containerRef = useRef<Container | null>(null);
  const textRef = useRef<Text | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    // Position at spawn point
    container.position.set(data.x, data.y);
    container.alpha = 1;

    // Color the text
    text.style.fill = data.color;

    // Slight random x drift so overlapping texts spread out
    const drift = (Math.random() - 0.5) * 24;

    // GSAP tween via proxy object — avoids Pixi getter/setter issues.
    // onUpdate syncs the proxy values back to the Pixi Container.
    const proxy = { x: data.x, y: data.y, alpha: 1 };

    tweenRef.current = gsap.to(proxy, {
      x: data.x + drift,
      y: data.y - 50,
      alpha: 0,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        container.position.set(proxy.x, proxy.y);
        container.alpha = proxy.alpha;
      },
      onComplete: () => {
        onCompleteRef.current(data.id);
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [data.id]); // only run once per instance — onComplete via ref

  return (
    <pixiContainer ref={(ref: Container | null) => { containerRef.current = ref; }}>
      <pixiText
        ref={(ref: any) => {
          textRef.current = ref;
          if (ref) {
            ref.text = data.text;
            ref.anchor.set(0.5, 1);
            ref.style = FLOAT_STYLE;
          }
        }}
      />
    </pixiContainer>
  );
}
