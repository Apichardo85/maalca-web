'use client';

// Rutas fijas (admin): una ruta que se repite sola los días marcados. Cada día el API crea la ruta del día con este camión,
// chofer y paradas. Cambiar el chofer de la ruta de un día (pestaña Rutas) no toca la ruta fija; para cambiarlo siempre, se edita aquí.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { readApiError } from '@/lib/receivables';
import type { DriverOption, RouteTemplate, Vehicle } from '@/lib/delivery';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address?: string | null;
}

interface Props {
  slug: string;
  vehicles: Vehicle[];
  drivers: DriverOption[];
  customers: Customer[];
  /** Refresca la lista de rutas (el API crea las del día al listar). */
  onRoutesChange: () => Promise<void>;
  notify: { success: (m: string) => void; error: (m: string) => void };
}

interface Form {
  id: string | null;
  name: string;
  vehicleId: string;
  driverId: string;
  days: number[];
  isActive: boolean;
  stops: string[]; // customerIds en orden de visita
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Orden de la semana de lunes a domingo; el valor es Date.getDay() (domingo = 0).
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const EMPTY: Form = { id: null, name: '', vehicleId: '', driverId: '', days: [1, 2, 3, 4, 5], isActive: true, stops: [] };

export function TemplatesTab({ slug, vehicles, drivers, customers, onRoutesChange, notify }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [templates, setTemplates] = useState<RouteTemplate[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const byId = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
  const outlineBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800';
  const dayShort = (d: number) =>
    language === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d];

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/space/${slug}/route-templates?includeInactive=true`, { cache: 'no-store' });
      if (res.ok) setTemplates(await res.json());
      else setTemplates((t) => t ?? []);
    } catch {
      setTemplates((t) => t ?? []);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const matches = useMemo(() => {
    const q = norm(query.trim());
    if (!form || q.length < 2) return [];
    return customers
      .filter((c) => !form.stops.includes(c.id) && (norm(c.name).includes(q) || (c.phone ?? '').replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§')))
      .slice(0, 8);
  }, [customers, form, query]);

  function pickVehicle(vehicleId: string) {
    if (!form) return;
    const v = vehicles.find((x) => x.id === vehicleId);
    setForm({ ...form, vehicleId, driverId: v?.driverId && !form.driverId ? v.driverId : form.driverId });
  }

  function toggleDay(d: number) {
    if (!form) return;
    setForm({ ...form, days: form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d] });
  }

  function move(i: number, dir: -1 | 1) {
    if (!form) return;
    const j = i + dir;
    if (j < 0 || j >= form.stops.length) return;
    const stops = [...form.stops];
    [stops[i], stops[j]] = [stops[j], stops[i]];
    setForm({ ...form, stops });
  }

  function startEdit(t: RouteTemplate) {
    setQuery('');
    setForm({
      id: t.id,
      name: t.name,
      vehicleId: t.vehicleId ?? '',
      driverId: t.driverId ?? '',
      days: t.days,
      isActive: t.isActive,
      stops: [...t.stops].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.customerId),
    });
  }

  async function send(f: Form, successMsg: string) {
    const res = await fetch(f.id ? `/api/space/${slug}/route-templates/${f.id}` : `/api/space/${slug}/route-templates`, {
      method: f.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.name.trim(),
        vehicleId: f.vehicleId || null,
        driverId: f.driverId || null,
        days: f.days,
        isActive: f.isActive,
        customerIds: f.stops,
      }),
    });
    if (!res.ok) {
      notify.error(await readApiError(res, getText('No se pudo guardar la ruta fija.', "Couldn't save the fixed route.")));
      return false;
    }
    notify.success(successMsg);
    await load();
    await onRoutesChange();
    return true;
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim()) {
      notify.error(getText('Ponle un nombre a la ruta.', 'Give the route a name.'));
      return;
    }
    if (form.days.length === 0) {
      notify.error(getText('Marca al menos un día.', 'Pick at least one day.'));
      return;
    }
    if (form.stops.length === 0) {
      notify.error(getText('Agrega al menos una parada.', 'Add at least one stop.'));
      return;
    }
    setSaving(true);
    try {
      if (await send(form, getText('Ruta fija guardada.', 'Fixed route saved.'))) setForm(null);
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(t: RouteTemplate) {
    setSaving(true);
    try {
      await send(
        {
          id: t.id,
          name: t.name,
          vehicleId: t.vehicleId ?? '',
          driverId: t.driverId ?? '',
          days: t.days,
          isActive: !t.isActive,
          stops: [...t.stops].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.customerId),
        },
        t.isActive ? getText('Ruta fija en pausa.', 'Fixed route paused.') : getText('Ruta fija activada.', 'Fixed route activated.'),
      );
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{getText('Rutas fijas', 'Fixed routes')}</h2>
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setForm(EMPTY);
          }}
          className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold"
        >
          {getText('Nueva ruta fija', 'New fixed route')}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
        {getText(
          'Arma la ruta una vez y se crea sola cada día marcado, con su camión, chofer y paradas. Si un día cambia el chofer, lo cambias en esa ruta (pestaña Rutas) y la ruta fija no se toca.',
          'Build the route once and it creates itself on each chosen day with its truck, driver and stops. If the driver changes for a day, change it on that route (Routes tab) and the fixed route stays as is.',
        )}
      </p>

      {form && (
        <div className="mt-3 space-y-3 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
          <input className={input} placeholder={getText('Nombre (ej. Ruta Centro)', 'Name (e.g. Downtown route)')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div>
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-neutral-300">{getText('Días que sale', 'Days it runs')}</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEK.map((d) => {
                const on = form.days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    aria-pressed={on}
                    className={`h-10 min-w-[3rem] rounded-full border px-3 text-sm font-semibold ${on ? 'border-transparent text-white' : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'}`}
                    style={on ? { backgroundColor: 'var(--brand-primary, #045AFE)' } : undefined}
                  >
                    {dayShort(d)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <select className={input} value={form.vehicleId} onChange={(e) => pickVehicle(e.target.value)}>
              <option value="">{getText('Sin camión', 'No truck')}</option>
              {vehicles.filter((v) => v.isActive).map((v) => (
                <option key={v.id} value={v.id}>{v.name ? `${v.name} · ${v.plate}` : v.plate}</option>
              ))}
            </select>
            <select className={input} value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
              <option value="">{getText('Chofer del camión / sin chofer', 'Truck’s driver / none')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-neutral-300">
              {getText('Paradas en orden de visita', 'Stops in visiting order')} ({form.stops.length})
            </p>
            <input className={input} placeholder={getText('Buscar cliente por nombre o teléfono…', 'Search customer by name or phone…')} value={query} onChange={(e) => setQuery(e.target.value)} />
            {matches.length > 0 && (
              <ul className="mt-1 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 dark:divide-neutral-800 dark:border-neutral-800">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, stops: [...form.stops, c.id] });
                        setQuery('');
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-900"
                    >
                      <span className="min-w-0 break-words">{c.name}</span>
                      <span className="shrink-0 text-xs font-semibold text-brand-primary">+ {getText('Agregar', 'Add')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {form.stops.length > 0 && (
              <ol className="mt-2 space-y-1.5">
                {form.stops.map((cid, i) => (
                  <li key={cid} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-neutral-900">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">{i + 1}</span>
                    <span className="min-w-0 flex-1 break-words text-sm">{byId.get(cid)?.name ?? '—'}</span>
                    <button type="button" aria-label={getText('Subir', 'Move up')} disabled={i === 0} onClick={() => move(i, -1)} className="h-8 w-8 rounded-full text-sm disabled:opacity-30">↑</button>
                    <button type="button" aria-label={getText('Bajar', 'Move down')} disabled={i === form.stops.length - 1} onClick={() => move(i, 1)} className="h-8 w-8 rounded-full text-sm disabled:opacity-30">↓</button>
                    <button type="button" aria-label={getText('Quitar', 'Remove')} onClick={() => setForm({ ...form, stops: form.stops.filter((x) => x !== cid) })} className="h-8 w-8 rounded-full text-sm text-red-600">✕</button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            {getText('Activa (se crea sola)', 'Active (creates itself)')}
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(null)} disabled={saving} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
              {getText('Cancelar', 'Cancel')}
            </button>
            <button type="button" onClick={save} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
          {form.id && (
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {getText('Los cambios aplican a las rutas que se creen de ahora en adelante; las ya creadas no cambian.', 'Changes apply to routes created from now on; ones already created stay as they are.')}
            </p>
          )}
        </div>
      )}

      {templates === null ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{getText('Cargando…', 'Loading…')}</p>
      ) : templates.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">
          {getText('Aún no hay rutas fijas. Crea una y desde mañana aparece sola cada día.', 'No fixed routes yet. Create one and it shows up on its own each day.')}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {templates.map((t) => (
            <li key={t.id} className={`rounded-xl border border-gray-200 p-3 dark:border-neutral-800 ${t.isActive ? '' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">
                    {t.name}
                    {!t.isActive && <span className="ml-2 text-xs font-normal text-gray-500 dark:text-neutral-400">({getText('en pausa', 'paused')})</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                    {WEEK.filter((d) => t.days.includes(d)).map(dayShort).join(' · ') || getText('Sin días', 'No days')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    🚚 {t.vehiclePlate ?? getText('Sin camión', 'No truck')} · 👤 {t.driverName ?? getText('Chofer del camión', 'Truck’s driver')} · {t.stopsTotal} {getText('paradas', 'stops')}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button type="button" onClick={() => startEdit(t)} className={outlineBtn}>{getText('Editar', 'Edit')}</button>
                  <button type="button" disabled={saving} onClick={() => toggleActive(t)} className={outlineBtn}>
                    {t.isActive ? getText('Pausar', 'Pause') : getText('Activar', 'Activate')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
