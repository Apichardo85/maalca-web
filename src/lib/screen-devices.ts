/**
 * Monitoreo de pantallas (TVs). Cada TV con el board abierto manda una señal de vida por minuto
 * (MenuBoard → POST {API}/api/public/affiliates/{slug}/screen-heartbeat) y maalca-api guarda una
 * fila por aparato (ScreenDevice). El panel (Pantalla) y /ops/pantallas muestran el estado; si una
 * TV se cae en horario de atención, maalca-api avisa a MaalCa por email (ScreenMonitorWorker →
 * /api/internal/notifications/screen-alert).
 */
export type ScreenDeviceStatus = 'online' | 'stale' | 'offline';

export interface ScreenDevice {
  id: string;
  affiliateId: string;
  affiliateName: string | null;
  affiliateSlug: string | null;
  screenId: string | null;
  screenName: string;
  deviceId: string;
  status: ScreenDeviceStatus;
  firstSeenAt: string;
  lastSeenAt: string;
  visible: boolean;
  showingKind: 'menu' | 'combo' | 'ad' | null;
  showingLabel: string | null;
  viewport: string | null;
  userAgent: string | null;
  appVersion: string | null;
  archived: boolean;
  alertOpen: boolean;
  pendingCommand: string | null;
}

export const STATUS_META: Record<ScreenDeviceStatus, { es: string; en: string; dot: string }> = {
  online: { es: 'En línea', en: 'Online', dot: 'bg-emerald-500' },
  stale: { es: 'Intermitente', en: 'Flaky', dot: 'bg-amber-400' },
  offline: { es: 'Sin señal', en: 'No signal', dot: 'bg-red-500' },
};

/** "hace 30 s", "hace 4 min", "hace 2 h", "hace 3 d". */
export function timeAgo(iso: string, lang: 'es' | 'en'): string {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const [n, u] =
    s < 60 ? [s, 's'] : s < 3600 ? [Math.round(s / 60), 'min'] : s < 86400 ? [Math.round(s / 3600), 'h'] : [Math.round(s / 86400), 'd'];
  return lang === 'es' ? `hace ${n} ${u}` : `${n} ${u} ago`;
}

/** Nombre corto del aparato a partir del user agent (Fully / Android TV / navegador). */
export function deviceLabel(d: Pick<ScreenDevice, 'userAgent' | 'deviceId'>): string {
  const ua = d.userAgent ?? '';
  const short = d.deviceId.slice(0, 6).toUpperCase();
  if (/Fully/i.test(ua)) return `Fully Kiosk · ${short}`;
  if (/Android/i.test(ua)) return `Android · ${short}`;
  if (/Windows/i.test(ua)) return `Windows · ${short}`;
  if (/Mac OS/i.test(ua)) return `Mac · ${short}`;
  return `TV · ${short}`;
}
