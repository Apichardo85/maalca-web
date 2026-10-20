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

export type MediaInfo = { durationMs?: number; aspect?: number };

/** Duración (videos) y proporción ancho/alto (videos e imágenes) de los comerciales.
 *  - Duración: en modo sincronizado no se puede avanzar "cuando termine el video" (cada TV
 *    terminaría en otro momento); el timeline necesita saberla de antemano, y todas las TVs leen
 *    el mismo valor del mismo archivo.
 *  - Proporción: decide si un comercial se estira sobre el muro o se repite en cada TV
 *    (ver shouldSpan). */
export function useMediaInfo(
  media: Array<{ url: string; type: 'Image' | 'Video' }>,
  enabled: boolean,
): Record<string, MediaInfo> {
  const [info, setInfo] = useState<Record<string, MediaInfo>>({});
  const key = media.map((m) => `${m.type}:${m.url}`).join('|');

  useEffect(() => {
    if (!enabled || !key) return;
    const save = (url: string, next: MediaInfo) =>
      setInfo((prev) => {
        const cur = prev[url];
        return cur && cur.durationMs === next.durationMs && cur.aspect === next.aspect ? prev : { ...prev, [url]: next };
      });
    const cleanups: Array<() => void> = [];
    for (const entry of key.split('|')) {
      const sep = entry.indexOf(':');
      const type = entry.slice(0, sep);
      const url = entry.slice(sep + 1);
      if (type === 'Video') {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.muted = true;
        v.onloadedmetadata = () => {
          const ms = v.duration * 1000;
          save(url, {
            durationMs: Number.isFinite(ms) && ms > 0 ? ms : undefined,
            aspect: v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : undefined,
          });
          v.removeAttribute('src');
          v.load();
        };
        v.src = url;
        cleanups.push(() => { v.onloadedmetadata = null; v.removeAttribute('src'); });
      } else {
        const img = new Image();
        img.onload = () => {
          if (img.naturalWidth && img.naturalHeight) save(url, { aspect: img.naturalWidth / img.naturalHeight });
        };
        img.src = url;
        cleanups.push(() => { img.onload = null; });
      }
    }
    return () => cleanups.forEach((fn) => fn());
  }, [key, enabled]);

  return info;
}

/** ¿El comercial se estira sobre todo el muro, o va completo (y sincronizado) en cada TV?
 *  Se estira si su proporción se parece MÁS a la del muro que a la de una sola pantalla
 *  (comparación en escala logarítmica, o sea respecto del punto medio geométrico): un 48:9 o
 *  32:9 cruza el muro; un 16:9 normal, un video vertical del celular o un logo cuadrado se
 *  repiten en cada TV. Antes exigía ±25 % de la proporción exacta del muro: con pantallas de
 *  forma distinta (ventanas verticales de prueba, TVs con la barra del sistema) un 48:9 quedaba
 *  fuera y se repetía en vez de cruzar. Sin proporción conocida aún → repetir. */
export function shouldSpan(mediaAspect: number | undefined, wall: WallLayout, screenAspect: number): boolean {
  if (!mediaAspect || !screenAspect) return false;
  const wallAspect = (wall.cols * screenAspect) / wall.rows;
  if (wall.cols * wall.rows <= 1) return false;
  return Math.abs(Math.log(mediaAspect / wallAspect)) < Math.abs(Math.log(mediaAspect / screenAspect));
}

/** Muro de 1 TV: el comercial ocupa la pantalla completa de cada TV (modo "repetir"). */
export const SINGLE_SCREEN: WallLayout = { cols: 1, rows: 1, col: 0, row: 0, bezel: 0 };
