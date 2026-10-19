'use client';

// Página de diagnóstico a pantalla completa para TV (Fully Kiosk / onn Google TV).
// Colores fijos a propósito: es una vista de calibración, no sigue el tema claro/oscuro.
//
// Todo lo que se mueve se escribe directo al DOM desde requestAnimationFrame (sin setState por
// frame) para no castigar el CPU del TV: React solo re-renderiza cuando cambian las métricas.

import { useEffect, useRef } from 'react';
import { useWallClock } from '@/hooks/useWallClock';

const COLORS = ['#045AFE', '#E11D48', '#16A34A', '#F59E0B', '#9333EA', '#0891B2'];
const SWEEP_MS = 4000; // la barra cruza todo el muro en 4 s
const FLASH_MS = 80;

export default function SyncTestClient({ cols, col, label }: { cols: number; col: number; label?: string }) {
  const { clock, stats } = useWallClock();
  const bgRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = clock.now();
      const sec = Math.floor(t / 1000);
      const ms = t - sec * 1000;

      if (bgRef.current) bgRef.current.style.background = COLORS[sec % COLORS.length];
      if (flashRef.current) flashRef.current.style.opacity = ms < FLASH_MS ? '1' : '0';

      // Lienzo virtual de `cols` pantallas de ancho; esta TV muestra solo su tramo.
      // x en unidades de "ancho de pantalla" (vw): 0 .. cols
      if (barRef.current) {
        const x = ((t % SWEEP_MS) / SWEEP_MS) * cols - col;
        barRef.current.style.transform = `translateX(${x * 100}vw)`;
      }

      if (timeRef.current) {
        const d = new Date(t);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        timeRef.current.textContent = `${hh}:${mm}:${ss}.${String(Math.floor(ms)).padStart(3, '0')}`;
      }
      if (secRef.current) secRef.current.textContent = String(sec % 100).padStart(2, '0');

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clock, cols, col]);

  const fmt = (n: number) => (Number.isFinite(n) ? `${n.toFixed(1)} ms` : '—');
  const quality = !stats.ready
    ? { label: 'Sincronizando…', color: '#9CA3AF' }
    : stats.errorMs <= 16
      ? { label: 'Excelente (video OK)', color: '#22C55E' }
      : stats.errorMs <= 40
        ? { label: 'Buena (slides OK)', color: '#EAB308' }
        : { label: 'Débil (red lenta)', color: '#EF4444' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', color: '#fff', cursor: 'none',
               fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
    >
      <div ref={bgRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Barra que cruza el muro completo: si salta o se duplica en el borde, hay desfase */}
      <div
        ref={barRef}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '6vw',
                 background: '#000', willChange: 'transform' }}
      />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '2vh',
                    textShadow: '0 0 1.2vw rgba(0,0,0,.6)' }}>
        <div ref={secRef} style={{ fontSize: '28vh', lineHeight: 1, fontWeight: 800 }}>--</div>
        <div ref={timeRef} style={{ fontSize: '9vh', fontWeight: 700 }}>--:--:--.---</div>
        <div style={{ fontSize: '4vh', opacity: 0.85 }}>
          {label ?? `Pantalla ${col + 1} de ${cols}`}
        </div>
      </div>

      <div style={{ position: 'absolute', left: '2vw', bottom: '2vh', fontSize: '2.2vh',
                    background: 'rgba(0,0,0,.55)', padding: '1.2vh 1.4vw', borderRadius: 8,
                    lineHeight: 1.5 }}>
        <div style={{ color: quality.color, fontWeight: 700 }}>● {quality.label}</div>
        <div>Error máx. ±{fmt(stats.errorMs)} · RTT {fmt(stats.bestRttMs)}</div>
        <div>Reloj del TV desfasado: {stats.ready ? `${(stats.deviceSkewMs / 1000).toFixed(3)} s` : '—'}</div>
        <div>Muestras: {stats.samples}</div>
      </div>

      {/* Destello blanco al inicio de cada segundo: en la foto, todas deben estar igual */}
      <div ref={flashRef}
           style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}
