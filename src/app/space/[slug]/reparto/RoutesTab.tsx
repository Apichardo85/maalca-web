'use client';

import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { formatDate, readApiError } from '@/lib/receivables';
import type { AdminRoute, DriverOption, Vehicle } from '@/lib/delivery';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

interface Props {
  slug: string;
  routes: AdminRoute[];
  vehicles: Vehicle[];
  drivers: DriverOption[];
  customers: Customer[];
  onChange: () => Promise<void>;
  notify: { success: (m: string) => void; error: (m: string) => void };
}

interface Form {
  id: string | null;
  name: string;
  date: string;
  vehicleId: string;
  driverId: string;
  stops: string[]; // customerIds en orden de visita
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const today = () => new Date().toLocaleDateString('en-CA');

export function RoutesTab({ slug, routes, vehicles, drivers, customers, onChange, notify }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [form, setForm] = useState<Form | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const byId = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
  const statusLabel: Record<string, string> = {
    planned: getText('Planificada', 'Planned'),
    loading: getText('Cargando', 'Loading'),
    in_progress: getText('En ruta', 'In progress'),
    completed: getText('Completada', 'Completed'),
    cancelled: getText('Cancelada', 'Cancelled'),
  };

  const matches = useMemo(() => {
    const q = norm(query.trim());
    if (!form || q.length < 2) return [];
    return customers.filter((c) => !form.stops.includes(c.id) && (norm(c.name).includes(q) || (c.phone ?? '').replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§'))).slice(0, 8);
  }, [customers, form, query]);

  function move(i: number, dir: -1 | 1) {
    if (!form) return;
    const j = i + dir;
    if (j < 0 || j >= form.stops.length) return;
    const stops = [...form.stops];
    [stops[i], stops[j]] = [stops[j], stops[i]];
    setForm({ ...form, stops });
  }

  function pickVehicle(vehicleId: string) {
    if (!form) return;
    const v = vehicles.find((x) => x.id === vehicleId);
    setForm({ ...form, vehicleId, driverId: v?.driverId && !form.driverId ? v.driverId : form.driverId });
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim()) {
      notify.error(getText('Ponle un nombre a la ruta.', 'Give the route a name.'));
      return;
    }
    if (form.stops.length === 0) {
      notify.error(getText('Agrega al menos una parada.', 'Add at least one stop.'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(form.id ? `/api/space/${slug}/routes/${form.id}` : `/api/space/${slug}/routes`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          routeDate: form.date,
          vehicleId: form.vehicleId || null,
          driverId: form.driverId || null,
          customerIds: form.stops,
        }),
      });
      if (!res.ok) {
        notify.error(await readApiError(res, getText('No se pudo guardar la ruta.', "Couldn't save the route.")));
        return;
      }
      notify.success(getText('Ruta guardada.', 'Route saved.'));
      setForm(null);
      setQuery('');
      await onChange();
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  async function cancel(r: AdminRoute) {
    if (!window.confirm(getText(`¿Cancelar la ruta "${r.name}"?`, `Cancel route "${r.name}"?`))) return;
    try {
      const res = await fetch(`/api/space/${slug}/routes/${r.id}/cancel`, { method: 'POST' });
      if (!res.ok) {
        notify.error(await readApiError(res, getText('No se pudo cancelar la ruta.', "Couldn't cancel the route.")));
        return;
      }
      notify.success(getText('Ruta cancelada.', 'Route cancelled.'));
      await onChange();
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{getText('Rutas', 'Routes')}</h2>
        <button type="button" onClick={() => setForm({ id: null, name: '', date: today(), vehicleId: '', driverId: '', stops: [] })} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
          {getText('Nueva ruta', 'New route')}
        </button>
      </div>

      {form && (
        <div className="mt-3 space-y-3 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={input} placeholder={getText('Nombre (ej. Ruta Azua centro)', 'Name (e.g. Downtown route)')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select className={input} value={form.vehicleId} onChange={(e) => pickVehicle(e.target.value)}>
              <option value="">{getText('Vehículo', 'Vehicle')}</option>
              {vehicles.filter((v) => v.isActive).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate}
                  {v.name ? ` · ${v.name}` : ''}
                </option>
              ))}
            </select>
            <select className={input} value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
              <option value="">{getText('Conductor', 'Driver')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          {drivers.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {getText('Aún no hay conductores. Agrégalos en ', 'No drivers yet. Add them in ')}
              <a href={`/space/${slug}/equipo`} className="font-semibold underline">{getText('Equipo', 'Team')}</a>
              {getText(' (rol Conductor) y dales acceso al dashboard.', ' (Driver role) and give them dashboard access.')}
            </p>
          )}

          <div>
            <p className="text-sm font-semibold">
              {getText('Paradas', 'Stops')} ({form.stops.length})
            </p>
            <ol className="mt-2 space-y-1">
              {form.stops.map((id, i) => (
                <li key={id} className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-neutral-900 px-2 py-1.5 text-sm">
                  <span className="w-6 shrink-0 text-center text-gray-500 dark:text-neutral-400">{i + 1}</span>
                  <span className="min-w-0 flex-1 break-words">{byId.get(id)?.name ?? id}</span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={getText('Subir', 'Move up')} className="h-8 w-8 rounded border border-gray-300 dark:border-neutral-700 disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === form.stops.length - 1} aria-label={getText('Bajar', 'Move down')} className="h-8 w-8 rounded border border-gray-300 dark:border-neutral-700 disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => setForm({ ...form, stops: form.stops.filter((s) => s !== id) })} aria-label={getText('Quitar', 'Remove')} className="h-8 w-8 rounded border border-gray-300 dark:border-neutral-700">✕</button>
                </li>
              ))}
            </ol>
            <input className={`${input} mt-2`} placeholder={getText('Buscar cliente para agregar…', 'Search a customer to add…')} value={query} onChange={(e) => setQuery(e.target.value)} />
            {matches.length > 0 && (
              <ul className="mt-1 overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setForm({ ...form, stops: [...form.stops, c.id] }); setQuery(''); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">
                      {c.name}
                      {c.phone ? <span className="ml-2 text-xs text-gray-500 dark:text-neutral-400">{c.phone}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => { setForm(null); setQuery(''); }} disabled={saving} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
              {getText('Cancelar', 'Cancel')}
            </button>
            <button type="button" onClick={save} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar ruta', 'Save route')}
            </button>
          </div>
        </div>
      )}

      {routes.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no hay rutas.', 'No routes yet.')}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {routes.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {formatDate(r.routeDate)} · {statusLabel[r.status] ?? r.status} · {r.stopsDone}/{r.stopsTotal} {getText('paradas', 'stops')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {r.vehiclePlate ?? getText('Sin vehículo', 'No vehicle')} · {r.driverName ?? getText('Sin conductor', 'No driver')}
                  </p>
                </div>
                {r.status === 'planned' && (
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => setForm({ id: r.id, name: r.name, date: r.routeDate.slice(0, 10), vehicleId: r.vehicleId ?? '', driverId: r.driverId ?? '', stops: r.stops.map((s) => s.customerId) })} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
                      {getText('Editar', 'Edit')}
                    </button>
                    <button type="button" onClick={() => cancel(r)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold">
                      {getText('Cancelar', 'Cancel')}
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
