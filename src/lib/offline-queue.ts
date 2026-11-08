// Cola de acciones del conductor sin conexión (entregas y paradas omitidas).
//
// Cómo funciona: si el envío falla por red (sin señal, tiempo agotado), la acción se guarda en el teléfono
// (localStorage, por ruta) y se reenvía sola al volver la señal. Cada entrega lleva su idempotencyKey, así que
// si la primera petición sí llegó y solo se perdió la respuesta, el API contesta "duplicada" y no repite nada.
// Una acción que el servidor rechaza (parada ya atendida, ruta cerrada…) queda marcada con su error para que
// la persona la revise; nunca se descarta sola.

import type { DriverSheet } from '@/lib/delivery';

export interface QueuedAction {
  id: string;
  kind: 'delivery' | 'skip';
  stopId: string;
  url: string;
  body: unknown;
  /** Texto corto para mostrar ("PRUEBA Colmado"). */
  label: string;
  createdAt: number;
  /** Solo para kind=skip: el estado final de la parada. */
  skipStatus?: 'skipped' | 'failed';
  /** Motivo por el que el servidor la rechazó; sin error = pendiente de envío. */
  error?: string;
}

export interface FlushResult {
  sent: number;
  failed: number;
  remaining: number;
}

export type PostOrQueueResult = { queued: true; action: QueuedAction } | { queued: false; res: Response };

const EVENT = 'maalca-route-queue';
const keyOf = (routeId: string) => `maalca:route-queue:${routeId}`;
const flushing = new Set<string>();

export function readQueue(routeId: string): QueuedAction[] {
  try {
    const raw = localStorage.getItem(keyOf(routeId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as QueuedAction[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(routeId: string, list: QueuedAction[]) {
  try {
    if (list.length === 0) localStorage.removeItem(keyOf(routeId));
    else localStorage.setItem(keyOf(routeId), JSON.stringify(list));
  } catch {
    // Sin almacenamiento (modo privado, lleno): la acción no se puede guardar; el llamador ya mostró el error.
  }
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { routeId } }));
  } catch {
    // Sin window (pruebas): nada que avisar.
  }
}

export function onQueueChange(routeId: string, handler: () => void): () => void {
  const listener = (e: Event) => {
    if ((e as CustomEvent).detail?.routeId === routeId) handler();
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function enqueueAction(routeId: string, a: Omit<QueuedAction, 'id' | 'createdAt'>): QueuedAction {
  const action: QueuedAction = { ...a, id: crypto.randomUUID(), createdAt: Date.now() };
  writeQueue(routeId, [...readQueue(routeId), action]);
  return action;
}

export function removeAction(routeId: string, id: string) {
  writeQueue(routeId, readQueue(routeId).filter((a) => a.id !== id));
}

function patchAction(routeId: string, id: string, patch: Partial<QueuedAction>) {
  writeQueue(routeId, readQueue(routeId).map((a) => (a.id === id ? { ...a, ...patch } : a)));
}

export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 10000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

const postInit = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/** Envía ahora; si no hay red, guarda la acción en la cola y lo avisa. Una respuesta del servidor (aunque sea error) nunca se encola. */
export async function postOrQueue(
  routeId: string,
  a: Omit<QueuedAction, 'id' | 'createdAt'>,
  timeoutMs = 10000,
): Promise<PostOrQueueResult> {
  try {
    const res = await fetchWithTimeout(a.url, postInit(a.body), timeoutMs);
    return { queued: false, res };
  } catch {
    return { queued: true, action: enqueueAction(routeId, a) };
  }
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    // El API responde { error: { code, message } }; se aceptan también las formas planas.
    const msg = data?.error?.message ?? (typeof data?.error === 'string' ? data.error : undefined) ?? data?.message ?? data?.detail ?? data?.title;
    if (typeof msg === 'string' && msg) return msg;
  } catch {
    // cuerpo no JSON
  }
  return `Error ${res.status}`;
}

/** Reenvía en orden lo pendiente. Se detiene si falla la red, la sesión o el servidor (5xx); los rechazos 4xx quedan con su error. */
export async function flushQueue(routeId: string): Promise<FlushResult> {
  if (flushing.has(routeId)) return { sent: 0, failed: 0, remaining: readQueue(routeId).length };
  flushing.add(routeId);
  let sent = 0;
  let failed = 0;
  try {
    for (const action of readQueue(routeId)) {
      if (action.error) continue;
      let res: Response;
      try {
        res = await fetchWithTimeout(action.url, postInit(action.body), 15000);
      } catch {
        break; // sigue sin red
      }
      if (res.ok) {
        removeAction(routeId, action.id);
        sent++;
        continue;
      }
      if (res.status === 401 || res.status === 403 || res.status >= 500) break; // sesión vencida o servidor caído: se reintenta luego
      if (action.kind === 'skip' && res.status === 409) {
        removeAction(routeId, action.id); // esa parada ya estaba atendida: nada más que hacer
        sent++;
        continue;
      }
      patchAction(routeId, action.id, { error: await readError(res) });
      failed++;
    }
  } finally {
    flushing.delete(routeId);
  }
  return { sent, failed, remaining: readQueue(routeId).length };
}

/** Marca en la hoja las paradas con acciones en cola (visitada / omitida), para que el conductor vea su avance real. */
export function applyQueueToSheet(sheet: DriverSheet, queue: QueuedAction[]): DriverSheet {
  // Solo lo pendiente de envío cuenta como avance; lo que el servidor rechazó no se pinta como hecho.
  const pending = queue.filter((a) => !a.error);
  if (pending.length === 0) return sheet;
  const byStop = new Map(pending.map((a) => [a.stopId, a]));
  return {
    ...sheet,
    stops: sheet.stops.map((s) => {
      const a = byStop.get(s.stop.id);
      if (!a || s.stop.status !== 'pending') return s;
      const status = a.kind === 'delivery' ? 'visited' : (a.skipStatus ?? 'skipped');
      return { ...s, stop: { ...s.stop, status } };
    }),
  };
}

const sheetKey = (routeId: string) => `maalca:route-sheet:${routeId}`;

export function saveSheetSnapshot(routeId: string, sheet: DriverSheet) {
  try {
    localStorage.setItem(sheetKey(routeId), JSON.stringify({ savedAt: Date.now(), sheet }));
  } catch {
    // sin almacenamiento: se sigue sin copia local
  }
}

export function readSheetSnapshot(routeId: string): { savedAt: number; sheet: DriverSheet } | null {
  try {
    const raw = localStorage.getItem(sheetKey(routeId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
