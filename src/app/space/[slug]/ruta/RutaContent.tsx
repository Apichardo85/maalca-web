'use client';

import Link from 'next/link';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import type { RouteSummary, RouteStatus } from '@/lib/delivery';

const STATUS_ES: Record<RouteStatus, [string, string]> = {
  planned: ['Por salir', 'Not started'],
  loading: ['Cargando', 'Loading'],
  in_progress: ['En curso', 'In progress'],
  completed: ['Cerrada', 'Closed'],
  cancelled: ['Cancelada', 'Cancelled'],
};

export function RutaContent({ slug, routes }: { slug: string; routes: RouteSummary[] }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  return (
    <div className="px-4 py-6 max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-500">
        {getText('Reparto', 'Delivery')}
      </p>
      <h1 className="mt-1 text-2xl font-bold">{getText('Mis rutas de hoy', "Today's routes")}</h1>

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
