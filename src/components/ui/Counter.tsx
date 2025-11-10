"use client";

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
}

export function Counter({ from = 0, to, duration = 2 }: CounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration });
    return controls.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
}
