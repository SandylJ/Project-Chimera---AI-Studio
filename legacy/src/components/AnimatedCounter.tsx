import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  prefix?: string;
  suffix?: string;
  flashColor?: string;
  flashDownColor?: string;
}

export function AnimatedCounter({
  value,
  duration = 400,
  className = '',
  style,
  prefix = '',
  suffix = '',
  flashColor = 'rgba(212, 169, 67, 0.6)',
  flashDownColor = 'rgba(239, 68, 68, 0.4)',
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prev = prevRef.current;
    const diff = value - prev;
    if (diff === 0) return;

    // Flash direction
    setFlash(diff > 0 ? 'up' : 'down');
    const flashTimer = setTimeout(() => setFlash(null), 500);

    // Animate count
    const startTime = performance.now();
    const startValue = prev;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    prevRef.current = value;

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(flashTimer);
    };
  }, [value, duration]);

  return (
    <span
      className={className}
      style={{
        ...style,
        transition: 'text-shadow 300ms ease',
        textShadow: flash === 'up'
          ? `0 0 12px ${flashColor}, 0 0 4px ${flashColor}`
          : flash === 'down'
          ? `0 0 8px ${flashDownColor}`
          : 'none',
      }}
    >
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
