'use client';

// Piezas visuales de las pantallas sincronizadas (ver src/lib/wall-sync.ts).

import { useEffect, useRef, useState } from 'react';
import type { WallClock } from '@/lib/wall-clock';
import type { WallLayout } from '@/lib/wall-sync';

/** Video anclado al reloj del muro: en cada TV, `currentTime` debe ser (ahora - inicio) mod
 *  duración. Los <video> derivan con el tiempo (decodificación, buffering), así que cada 500 ms
 *  se corrige:
 *   - desfase > 300 ms → salto directo (seek)
 *   - desfase 30–300 ms → se acelera/frena hasta ±5 % (playbackRate), sin salto visible
 *  Siempre en loop: si el frame dura más que el video, sigue alineado al dar la vuelta. */
export function SyncedVideo({
  src, startAt, clock, className,
}: { src: string; startAt: number; clock: WallClock; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const correct = () => {
      const dur = v.duration;
      if (!dur || !Number.isFinite(dur)) return;
      const expected = ((((clock.now() - startAt) / 1000) % dur) + dur) % dur;
      let diff = v.currentTime - expected;
      // Cerca del punto de loop, 0.1 s y dur-0.1 s están "pegados": medir por el camino corto.
      if (diff > dur / 2) diff -= dur;
      if (diff < -dur / 2) diff += dur;
      if (Math.abs(diff) > 0.3) {
        v.currentTime = expected;
        v.playbackRate = 1;
      } else if (Math.abs(diff) > 0.03) {
        v.playbackRate = Math.min(1.05, Math.max(0.95, 1 - diff));
      } else {
        v.playbackRate = 1;
      }
      if (v.paused) v.play().catch(() => {});
    };
    v.addEventListener('loadedmetadata', correct);
    const id = setInterval(correct, 500);
    return () => {
      clearInterval(id);
      v.removeEventListener('loadedmetadata', correct);
    };
  }, [src, startAt, clock]);

  return <video ref={ref} src={src} className={className} autoPlay muted loop playsInline preload="auto" />;
}

/** Lienzo virtual del muro completo (cols × rows pantallas + marcos); esta TV muestra solo su
 *  tramo. El contenido se dibuja UNA vez a tamaño muro y se desplaza: cada TV recorta su parte. */
export function SpanFrame({
  wall, background, children,
}: { wall: WallLayout; background: string; children: React.ReactNode }) {
  const { cols, rows, col, row, bezel } = wall;
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background }}>
      <div
        style={{
          position: 'absolute',
          width: `calc(${cols} * 100vw + ${(cols - 1) * bezel}px)`,
          height: `calc(${rows} * 100vh + ${(rows - 1) * bezel}px)`,
          left: `calc(${-col} * (100vw + ${bezel}px))`,
          top: `calc(${-row} * (100vh + ${bezel}px))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Duración real (ms) de los videos de comerciales. En modo sincronizado no se puede avanzar
 *  "cuando termine el video" (cada TV terminaría en un momento distinto): el timeline necesita
 *  conocer la duración de antemano, y todas las TVs leen el mismo valor del mismo archivo. */
export function useVideoDurations(urls: string[], enabled: boolean): Record<string, number> {
  const [durations, setDurations] = useState<Record<string, number>>({});
  const key = urls.join('|');

  useEffect(() => {
    if (!enabled || !key) return;
    const probes: HTMLVideoElement[] = [];
    for (const url of key.split('|')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.onloadedmetadata = () => {
        const ms = v.duration * 1000;
        if (Number.isFinite(ms) && ms > 0) {
          setDurations((prev) => (prev[url] === ms ? prev : { ...prev, [url]: ms }));
        }
        v.removeAttribute('src');
        v.load();
      };
      v.src = url;
      probes.push(v);
    }
    return () => probes.forEach((v) => { v.onloadedmetadata = null; v.removeAttribute('src'); });
  }, [key, enabled]);

  return durations;
}
