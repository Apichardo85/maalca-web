// Pantallas sincronizadas (Fases 2-3) — lógica pura del timeline, sin React.
//
// Se activa por URL (lo que se configura una vez en Fully Kiosk), sin cambios de backend:
//   ?sync=1                  todas las TVs con el mismo contenido cambian de slide al mismo instante
//   ?wall=3x1&pos=0          muro de 3 TVs; esta es la de la izquierda (pos=col o col,row)
//   &bezel=24                (opcional) px de marco entre TVs, para que la imagen "salte" el marco
//
// Clave del diseño: el timeline es DETERMINISTA. Cada TV calcula sola, con el reloj compartido
// (src/lib/wall-clock.ts), qué toca mostrar ahora: posición = hora del muro mod duración total.
// No hay "director" que mande órdenes: si una TV se reinicia, vuelve sola al punto correcto.

export type WallLayout = { cols: number; rows: number; col: number; row: number; bezel: number };
export type SyncParams = { wall: WallLayout | null };

const clampInt = (v: string | null | undefined, min: number, max: number, fallback: number) => {
  const n = parseInt(v ?? '', 10);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

/** Config del muro tal como la manda el catálogo público (maalca-api PublicWallDto) para
 *  ESTA TV — se configura desde el dashboard (Pantallas → Muros sincronizados). */
export type ApiWall = {
  mode: 'Mirror' | 'Span' | string;
  cols: number;
  rows: number;
  col: number;
  row: number;
  bezelPx: number;
  calibrate: boolean;
};

/** Config del dashboard → parámetros de sincronización. Espejo = todas iguales y alineadas
 *  (sin reparto); Muro = reparto de slides + comerciales estirados. */
export function syncParamsFromApi(w: ApiWall | null | undefined): SyncParams | null {
  if (!w) return null;
  if (w.mode !== 'Span' || w.cols * w.rows <= 1) return { wall: null };
  const cols = Math.max(1, Math.min(8, w.cols));
  const rows = Math.max(1, Math.min(4, w.rows));
  return {
    wall: {
      cols,
      rows,
      col: Math.max(0, Math.min(cols - 1, w.col)),
      row: Math.max(0, Math.min(rows - 1, w.row)),
      bezel: Math.max(0, Math.min(400, w.bezelPx)),
    },
  };
}

/** Parámetros de URL (?sync / ?wall) — quedan solo como override de prueba; lo normal es que la
 *  config venga del dashboard vía syncParamsFromApi. null = sin override en la URL. */
export function parseSyncParams(search: string): SyncParams | null {
  const p = new URLSearchParams(search);
  const m = /^(\d)x(\d)$/i.exec(p.get('wall') ?? '');
  if (m) {
    const cols = clampInt(m[1], 1, 8, 1);
    const rows = clampInt(m[2], 1, 4, 1);
    const [c, r] = (p.get('pos') ?? '0').split(',');
    const wall: WallLayout = {
      cols,
      rows,
      col: clampInt(c, 0, cols - 1, 0),
      row: clampInt(r, 0, rows - 1, 0),
      bezel: clampInt(p.get('bezel'), 0, 400, 0),
    };
    return { wall: cols * rows > 1 ? wall : null };
  }
  return p.get('sync') === '1' ? { wall: null } : null;
}

/** Un "frame" es lo que el muro entero muestra al mismo tiempo:
 *  - slides: una slide distinta por TV (indices[i] = slide de la TV i), cambian todas juntas.
 *  - span: una sola slide (comercial) estirada sobre todas las TVs como una sola pantalla. */
export type Frame =
  | { kind: 'slides'; indices: number[]; durationMs: number }
  | { kind: 'span'; index: number; durationMs: number };

export function buildFrames(
  slides: Array<{ span: boolean; durationMs: number }>,
  screens: number,
): Frame[] {
  const frames: Frame[] = [];
  let group: number[] = [];
  const flush = () => {
    if (group.length === 0) return;
    frames.push({
      kind: 'slides',
      indices: group,
      // El frame dura lo que la slide más larga del grupo: ninguna TV se corta antes de tiempo.
      durationMs: Math.max(...group.map((i) => slides[i].durationMs)),
    });
    group = [];
  };
  slides.forEach((s, i) => {
    if (s.span && screens > 1) {
      flush();
      frames.push({ kind: 'span', index: i, durationMs: s.durationMs });
    } else {
      group.push(i);
      if (group.length === screens) flush();
    }
  });
  flush();
  return frames;
}

/** Qué frame toca a la hora `nowMs`. El ciclo se ancla al epoch Unix, así que cualquier TV
 *  con el mismo contenido llega exactamente al mismo frame sin coordinarse con nadie. */
export function locateFrame(frames: Frame[], nowMs: number) {
  const total = frames.reduce((s, f) => s + f.durationMs, 0);
  if (frames.length === 0 || total <= 0) return null;
  let t = Math.floor(nowMs / total) * total;
  for (let i = 0; i < frames.length; i++) {
    const end = t + frames[i].durationMs;
    if (nowMs < end) return { frameIdx: i, frameStart: t, frameEnd: end };
    t = end;
  }
  const last = frames.length - 1;
  return { frameIdx: last, frameStart: t - frames[last].durationMs, frameEnd: t };
}

/** Slide que muestra la TV `screenIndex` dentro de un frame. Si el último grupo trae menos
 *  slides que TVs, las que sobran repiten (nunca quedan en negro). */
export function slideForScreen(frame: Frame, screenIndex: number): number {
  return frame.kind === 'span' ? frame.index : frame.indices[screenIndex % frame.indices.length];
}
