// Reloj compartido entre pantallas (Pantallas sincronizadas — Fase 1).
//
// Idea (NTP simplificado): t0 = antes del request, t1 = al recibir, ts = hora del servidor.
// Asumiendo ida ≈ vuelta, el servidor marcó ts en el punto medio (t0+t1)/2, así que
//   offset = ts - (t0 + t1) / 2      y      hora del muro = performance.now() + offset
// El error máximo es RTT/2 (si la ida y la vuelta no son simétricas), por eso nos quedamos con
// la muestra de MENOR RTT de una ventana reciente: es la que menos margen de error tiene.
//
// Se ancla a performance.now() (reloj monotónico) y no a Date.now(): si el TV ajusta su reloj
// del sistema a mitad del día, Date.now() salta y la sincronización se rompería; performance.now()
// nunca salta.

type Sample = { offset: number; rtt: number; at: number };

export type WallClockStats = {
  ready: boolean;
  /** Error máximo estimado (ms) = mejor RTT / 2. */
  errorMs: number;
  bestRttMs: number;
  samples: number;
  /** Cuánto está desfasado el reloj del sistema de ESTE dispositivo respecto al muro (ms). */
  deviceSkewMs: number;
  lastSyncAt: number;
};

const WINDOW_MS = 5 * 60_000; // muestras más viejas se descartan (el reloj local deriva)
const MAX_SAMPLES = 40;
const BURST = 8;
const RESYNC_MS = 30_000;

export class WallClock {
  private samples: Sample[] = [];
  private offset = 0;
  private best: Sample | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(s: WallClockStats) => void>();

  constructor(private url = '/api/time') {}

  /** Hora del muro en ms epoch. Antes de la primera muestra cae al reloj local. */
  now(): number {
    return this.best ? performance.now() + this.offset : Date.now();
  }

  get ready() {
    return this.best !== null;
  }

  stats(): WallClockStats {
    return {
      ready: this.ready,
      errorMs: this.best ? this.best.rtt / 2 : Infinity,
      bestRttMs: this.best?.rtt ?? Infinity,
      samples: this.samples.length,
      deviceSkewMs: this.best ? Date.now() - this.now() : 0,
      lastSyncAt: this.best ? this.samples[this.samples.length - 1].at : 0,
    };
  }

  subscribe(fn: (s: WallClockStats) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  start() {
    if (this.timer) return;
    void this.burst(BURST);
    this.timer = setInterval(() => void this.burst(2), RESYNC_MS);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisible);
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisible);
    }
  }

  // Al volver de segundo plano el reloj monotónico pudo pausarse: re-medimos fuerte.
  private onVisible = () => {
    if (document.visibilityState === 'visible') {
      this.samples = [];
      void this.burst(BURST);
    }
  };

  private async sampleOnce(): Promise<Sample | null> {
    try {
      const t0 = performance.now();
      const res = await fetch(`${this.url}?_=${t0}`, { cache: 'no-store' });
      const t1 = performance.now();
      if (!res.ok) return null;
      const { t } = (await res.json()) as { t: number };
      return { offset: t - (t0 + t1) / 2, rtt: t1 - t0, at: t1 };
    } catch {
      return null; // falla abierto: seguimos con la última estimación
    }
  }

  private async burst(n: number) {
    for (let i = 0; i < n; i++) {
      const s = await this.sampleOnce();
      if (s) {
        this.samples.push(s);
        this.recompute();
      }
      // Pequeña pausa: muestras pegadas suelen compartir el mismo pico de latencia.
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  private recompute() {
    const now = performance.now();
    this.samples = this.samples.filter((s) => now - s.at < WINDOW_MS).slice(-MAX_SAMPLES);
    this.best = this.samples.reduce<Sample | null>(
      (b, s) => (!b || s.rtt < b.rtt ? s : b),
      null,
    );
    if (this.best) this.offset = this.best.offset;
    const st = this.stats();
    this.listeners.forEach((fn) => fn(st));
  }
}

// Una sola instancia por pestaña: todas las vistas del board comparten el mismo reloj.
let shared: WallClock | null = null;
export function getWallClock(): WallClock {
  if (!shared) shared = new WallClock();
  return shared;
}
