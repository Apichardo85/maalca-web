"use client";

import { useEffect, useState, useRef } from 'react';

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
}

export function Counter({ from = 0, to, duration = 2 }: CounterProps) {
  const [value, setValue] = useState(from);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = from;
    const endValue = to;

    const step = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startValue + (endValue - startValue) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [from, to, duration]);

  return <span>{value}</span>;
}
