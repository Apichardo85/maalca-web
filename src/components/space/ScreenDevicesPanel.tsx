'use client';

import { useCallback, useEffect, useState } from 'react';
import { STATUS_META, deviceLabel, timeAgo, type ScreenDevice } from '@/lib/screen-devices';

/**
 * "¿Qué TVs están mostrando cada pantalla?" — lista de aparatos con su última señal de vida.
 * mode="owner": panel del negocio (Pantalla), con Identificar / Recargar / Retirar.
 * mode="ops":   /ops/pantallas, todas las TVs de todos los negocios (solo lectura).
 * Se refresca solo cada 30 s. Ver src/lib/screen-devices.ts.
 */
export function ScreenDevicesPanel({
  mode, slug, lang, getText,
}: {
  mode: 'owner' | 'ops';
  slug?: string;
  lang: 'es' | 'en';
  getText: (es: string, en: string) => string;
}) {
  const [devices, setDevices] = useState<ScreenDevice[] | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [, setTick] = useState(0);

  const base = mode === 'owner' ? `/api/space/${slug}/screen-devices` : '/api/ops/screen-devices';

  const load = useCallback(async () => {
    try {
      const res = await fetch(base, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      setDevices(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  }, [base]);

  useEffect(() => {
    void load();
    const poll = setInterval(load, 30_000);
    const clock = setInterval(() => setTick((t) => t + 1), 10_000); // re-pinta "hace X"
    return () => { clearInterval(poll); clearInterval(clock); };
  }, [load]);

  async function command(d: ScreenDevice, cmd: 'reload' | 'identify') {
    setBusy(d.id + cmd);
    await fetch(`${base}/${d.id}/command`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: cmd }),
    }).catch(() => {});
    setBusy(null);
    void load();
  }

  async function archive(d: ScreenDevice, archived: boolean) {
    setBusy(d.id + 'arch');
    await fetch(`${base}/${d.id}/archived`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived }),
    }).catch(() => {});
    setBusy(null);
    void load();
  }

  const list = (devices ?? []).filter((d) => showArchived || !d.archived);
  const archivedCount = (devices ?? []).filter((d) => d.archived).length;
  const counts = (devices ?? []).filter((d) => !d.archived).reduce(
    (acc, d) => ({ ...acc, [d.status]: (acc[d.status] ?? 0) + 1 }), {} as Record<string, number>,
  );
  const btn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-medium hover:border-brand-primary hover:text-brand-primary disabled:opacity-50';
  const showingText = (d: ScreenDevice) => {
    const kind = d.showingKind === 'ad' ? getText('Comercial', 'Ad') : d.showingKind === 'combo' ? getText('Combo', 'Combo') : d.showingKind === 'menu' ? getText('Menú', 'Menu') : null;
    return [kind, d.showingLabel].filter(Boolean).join(': ');
  };

  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">{getText('Estado de las TVs', 'TV status')}</h2>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-neutral-400">
          {(['online', 'stale', 'offline'] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
              {counts[s] ?? 0} {lang === 'es' ? STATUS_META[s].es : STATUS_META[s].en}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          'Cada TV con la pantalla abierta avisa cada minuto que sigue viva y qué está mostrando. Si una se cae en horario de atención, MaalCa recibe un aviso.',
          'Every TV with the screen open reports every minute that it is alive and what it shows. If one goes down during business hours, MaalCa gets an alert.',
        )}
      </p>

      {error && <p className="mt-3 text-xs text-red-500">{getText('No se pudo cargar el estado.', 'Could not load status.')}</p>}
      {devices && list.length === 0 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">
          {getText(
            'Todavía ninguna TV ha reportado. Aparecen aquí al minuto de abrir la pantalla (con la versión nueva del board).',
            'No TV has reported yet. They show up here a minute after opening the screen (with the new board version).',
          )}
        </p>
      )}

      <ul className="mt-3 divide-y divide-gray-100 dark:divide-neutral-800">
        {list.map((d) => (
          <li key={d.id} className={`flex flex-wrap items-center justify-between gap-3 py-3 ${d.archived ? 'opacity-50' : ''}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_META[d.status].dot}`} />
                {mode === 'ops' && d.affiliateName && <span>{d.affiliateName} ·</span>}
                <span>{d.screenName}</span>
                {d.alertOpen && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">{getText('Aviso enviado', 'Alert sent')}</span>}
                {!d.visible && d.status === 'online' && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{getText('Página tapada', 'Page hidden')}</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                {deviceLabel(d)} · {lang === 'es' ? STATUS_META[d.status].es : STATUS_META[d.status].en} {timeAgo(d.lastSeenAt, lang)}
                {d.viewport ? ` · ${d.viewport}` : ''}
              </p>
              {showingText(d) && (
                <p className="mt-0.5 truncate text-xs text-gray-600 dark:text-neutral-300">
                  {getText('Mostrando', 'Showing')}: {showingText(d)}
                </p>
              )}
            </div>
            {mode === 'owner' && (
              <div className="flex flex-wrap gap-1.5">
                {!d.archived && (
                  <>
                    <button type="button" className={btn} disabled={busy !== null} onClick={() => command(d, 'identify')}
                      title={getText('Muestra el nombre de la pantalla en grande en esa TV por 15 s', 'Shows the screen name big on that TV for 15 s')}>
                      {d.pendingCommand === 'identify' ? getText('Enviado…', 'Sent…') : getText('Identificar', 'Identify')}
                    </button>
                    <button type="button" className={btn} disabled={busy !== null} onClick={() => command(d, 'reload')}>
                      {d.pendingCommand === 'reload' ? getText('Enviado…', 'Sent…') : getText('Recargar', 'Reload')}
                    </button>
                  </>
                )}
                <button type="button" className={btn} disabled={busy !== null} onClick={() => archive(d, !d.archived)}
                  title={getText('Una TV retirada no se vigila ni genera avisos', 'A retired TV is not monitored and raises no alerts')}>
                  {d.archived ? getText('Reactivar', 'Restore') : getText('Retirar', 'Retire')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {archivedCount > 0 && (
        <button type="button" onClick={() => setShowArchived((v) => !v)} className="mt-2 text-xs font-medium text-brand-primary">
          {showArchived
            ? getText('Ocultar TVs retiradas', 'Hide retired TVs')
            : getText(`Ver TVs retiradas (${archivedCount})`, `Show retired TVs (${archivedCount})`)}
        </button>
      )}
    </div>
  );
}
