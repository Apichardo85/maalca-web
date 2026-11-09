'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { ModuleIntro } from '@/components/space/ModuleIntro';
import type { RouteSummary, RouteStatus } from '@/lib/delivery';

const STATUS_ES: Record<RouteStatus, [string, string]> = {
  planned: ['Por salir', 'Not started'],
  loading: ['Cargando', 'Loading'],
  in_progress: ['En curso', 'In progress'],
  completed: ['Cerrada', 'Closed'],
  cancelled: ['Cancelada', 'Cancelled'],
};

const REFRESH_MS = 30_000;

export function RutaContent({ slug, routes: initialRoutes }: { slug: string; routes: RouteSummary[] }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  // La pantalla queda abierta toda la mañana mientras el que planifica asigna o cierra rutas: sin refresco el
  // conductor veía la foto de cuando cargó la página. Se refresca sola y, si falla, se queda con lo último bueno.
  const [routes, setRoutes] = useState(initialRoutes);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/space/${slug}/routes/mine`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setRoutes(await res.json());
      setUpdatedAt(new Date());
      setOffline(false);
    } catch {
      // Sin señal en la calle es lo normal: se avisa y se reintenta al siguiente ciclo.
      setOffline(true);
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    const timer = setInterval(refresh, REFRESH_MS);
    // Volver a la pestaña después de un rato es justo cuando lo de pantalla está más viejo.
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const updatedLabel = updatedAt
    ? updatedAt.toLocaleTimeString(language === 'es' ? 'es-DO' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="px-4 py-6 max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
        {getText('Reparto', 'Delivery')}
      </p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{getText('Mis rutas de hoy', "Today's routes")}</h1>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="mt-1 shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50 dark:border-neutral-700"
        >
          {refreshing ? getText('Actualizando…', 'Refreshing…') : getText('Actualizar', 'Refresh')}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        {offline
          ? getText('Sin conexión — mostrando lo último que se pudo cargar.', 'Offline — showing the last data loaded.')
          : updatedLabel
            ? getText(`Actualizado a las ${updatedLabel}`, `Updated at ${updatedLabel}`)
            : getText('Se actualiza sola cada 30 segundos.', 'Refreshes by itself every 30 seconds.')}
      </p>

      <ModuleIntro
        id="mis-rutas"
        className="mt-4"
        summary={getText('Estas son las rutas que te asignaron para hoy.', 'These are the routes assigned to you today.')}
        steps={[
          getText('Abre una ruta para ver sus paradas.', 'Open a route to see its stops.'),
          getText('En cada parada anota lo entregado y lo cobrado.', 'At each stop record what you delivered and collected.'),
          getText('Si no hay señal, sigue trabajando: se envía solo al volver.', 'If there is no signal, keep working: it sends by itself when back online.'),
        ]}
      />

      {routes.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'No tienes rutas asignadas para hoy. Si esperabas una, pídele a quien planifica que te la asigne como conductor.',
            "You have no routes assigned for today. If you expected one, ask whoever plans routes to assign you as the driver.",
          )}
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {routes.map((r) => (
            <li key={r.id}>
              <Link
                href={`/space/${slug}/ruta/${r.id}`}
                className="block rounded-2xl border border-gray-200 dark:border-neutral-800 p-4 active:bg-gray-50 dark:active:bg-neutral-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="break-words text-base font-semibold">{r.name}</p>
                  <span className="shrink-0 rounded-full bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold">
                    {getText(STATUS_ES[r.status][0], STATUS_ES[r.status][1])}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
                  {r.vehiclePlate ?? getText('Sin vehículo', 'No vehicle')} · {r.stopsDone}/{r.stopsTotal} {getText('paradas', 'stops')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
