'use client';

import { useEffect, useState } from 'react';
import { getWallClock, type WallClock, type WallClockStats } from '@/lib/wall-clock';

/** Arranca el reloj compartido y expone sus métricas (se actualizan tras cada medición).
 *  Para animar, NO uses estas stats por frame: llama clock.now() dentro de requestAnimationFrame. */
export function useWallClock(enabled = true): { clock: WallClock; stats: WallClockStats } {
  const clock = getWallClock();
  const [stats, setStats] = useState<WallClockStats>(() => clock.stats());

  useEffect(() => {
    // Desactivado = cero requests a /api/time (un board normal no paga nada por esta función).
    if (!enabled) return;
    const unsub = clock.subscribe(setStats);
    clock.start();
    return () => {
      unsub();
    };
  }, [clock, enabled]);

  return { clock, stats };
}
