'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import type { LiveRoute } from '@/lib/delivery';

// Camiones en ruta: parada actual, progreso y última ubicación del teléfono del conductor. Se actualiza solo cada 15 s.
const POLL_MS = 15000;
const STALE_SECONDS = 120;

function ago(seconds: number, es: boolean): string {
  if (seconds < 60) return es ? `hace ${seconds} s` : `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return es ? `hace ${m} min` : `${m} min ago`;
  const h = Math.floor(m / 60);
  return es ? `hace ${h} h` : `${h} h ago`;
}

export function LiveTab({ slug }: { slug: string }) {
  const { language } = useSimpleLanguage();
  const es = language === 'es';
  const getText = (a: string, b: string) => (es ? a : b);
  const [routes, setRoutes] = useState<LiveRoute[] | null>(null);
  const [error, setError] = useState(false);
  const [mapOpen, setMapOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/space/${slug}/routes/live`, { cache: 'no-store' });
        if (!alive) return;
        if (res.ok) {
          setRoutes(await res.json());
          setError(false);
        } else setError(true);
      } catch {
        if (alive) setError(true);
      }
    };
    void load();
    const t = setInterval(() => void load(), POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [slug]);

  if (routes === null) {
    return <p className="text-sm text-gray-500 dark:text-neutral-400">{error ? getText('No se pudo cargar. Reintentando…', "Couldn't load. Retrying…") : '…'}</p>;
  }

  if (routes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-neutral-400">
        {getText('No hay camiones en ruta ahora. Cuando un conductor inicie su ruta aparecerá aquí.', 'No trucks on the road right now. When a driver starts a route it will show up here.')}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {routes.map((r) => {
        const hasPos = r.lat != null && r.lng != null;
        const stale = r.secondsSincePosition != null && r.secondsSincePosition > STALE_SECONDS;
        const pct = r.stopsTotal ? Math.round((r.stopsDone / r.stopsTotal) * 100) : 0;
        return (
          <li key={r.routeId} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">
                {r.name}
                {r.vehiclePlate ? ` · ${r.vehiclePlate}` : ''}
              </p>
              <span className="text-xs text-gray-500 dark:text-neutral-400">{r.driverName ?? getText('Sin conductor', 'No driver')}</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800">
              <div className="h-full" style={{ width: `${pct}%`, backgroundColor: 'var(--brand-primary, #045AFE)' }} />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
              {r.stopsDone}/{r.stopsTotal} {getText('paradas', 'stops')}
            </p>

            <p className="mt-2">
              {r.currentStopCustomer ? (
                <>
                  {r.currentStopArrivedAt ? getText('En la parada: ', 'At stop: ') : getText('Próxima parada: ', 'Next stop: ')}
                  <strong>{r.currentStopCustomer}</strong>
                  {r.currentStopArrivedAt && ` · ${getText('llegó', 'arrived')} ${new Date(r.currentStopArrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </>
              ) : (
                getText('Sin paradas pendientes.', 'No pending stops.')
              )}
            </p>

            <p className={`mt-1 text-xs ${hasPos && !stale ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-300'}`}>
              {hasPos
                ? `${getText('Ubicación', 'Location')} ${ago(r.secondsSincePosition ?? 0, es)}${stale ? ` · ${getText('sin señal reciente', 'no recent signal')}` : ''}`
                : getText('El teléfono aún no ha enviado ubicación.', "The phone hasn't sent a location yet.")}
            </p>

            {hasPos && (
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => setMapOpen(mapOpen === r.routeId ? null : r.routeId)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
                  {mapOpen === r.routeId ? getText('Ocultar mapa', 'Hide map') : getText('Ver mapa', 'View map')}
                </button>
                <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
                  {getText('Abrir en Maps', 'Open in Maps')}
                </a>
              </div>
            )}
            {hasPos && mapOpen === r.routeId && (
              <iframe
                title={r.name}
                className="mt-2 h-64 w-full rounded-lg border border-gray-200 dark:border-neutral-800"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${r.lat},${r.lng}&z=15&output=embed`}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
