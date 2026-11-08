'use client';

// Rutas (admin): lista agrupada por día, detalle desplegable de cada ruta (paradas con dirección y estado, cuadre de lo
// cargado/entregado/cobrado) y edición mientras la ruta no haya salido. La edición de paradas la limita el API
// ("planned"/"loading"); una ruta en curso o cerrada se puede mirar completa, no modificar.
import { useMemo, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { formatDate, readApiError } from '@/lib/receivables';
import type { AdminRoute, DriverOption, Reconciliation, RouteStop, Vehicle } from '@/lib/delivery';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address?: string | null;
}

interface Props {
  slug: string;
  currency?: 'USD' | 'DOP';
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

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const today = () => new Date().toLocaleDateString('en-CA');
const canEdit = (status: string) => status === 'planned' || status === 'loading';

const STATUS_CHIP: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  loading: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  in_progress: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  completed: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

const STOP_CHIP: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300',
  visited: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  skipped: 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-neutral-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

export function RoutesTab({ slug, currency = 'DOP', routes, vehicles, drivers, customers, onChange, notify }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [form, setForm] = useState<Form | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [recon, setRecon] = useState<Record<string, Reconciliation | 'loading' | 'error'>>({});
  // El listado del API no trae las paradas: se piden al abrir una ruta (o al editarla).
  const [details, setDetails] = useState<Record<string, AdminRoute | 'loading' | 'error'>>({});

  const byId = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
  const outlineBtn = 'rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800';
  const statusLabel: Record<string, string> = {
    planned: getText('Planificada', 'Planned'),
    loading: getText('Cargando', 'Loading'),
    in_progress: getText('En ruta', 'In progress'),
    completed: getText('Completada', 'Completed'),
    cancelled: getText('Cancelada', 'Cancelled'),
  };
  const stopLabel: Record<string, string> = {
    pending: getText('Pendiente', 'Pending'),
    visited: getText('Visitada', 'Visited'),
    skipped: getText('Omitida', 'Skipped'),
    failed: getText('No se pudo', 'Failed'),
  };
  const money = (n: number) => `${currency === 'USD' ? 'US$' : 'RD$'} ${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const time = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleTimeString(language === 'en' ? 'en-US' : 'es', { hour: 'numeric', minute: '2-digit' }) : null;

  const matches = useMemo(() => {
    const q = norm(query.trim());
    if (!form || q.length < 2) return [];
    return customers
      .filter((c) => !form.stops.includes(c.id) && (norm(c.name).includes(q) || (c.phone ?? '').replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§')))
      .slice(0, 8);
  }, [customers, form, query]);

  // Rutas agrupadas por día: hoy, próximas (la más cercana primero) y anteriores (la más reciente primero).
  const groups = useMemo(() => {
    const t = today();
    const day = (r: AdminRoute) => r.routeDate.slice(0, 10);
    const sortAsc = (a: AdminRoute, b: AdminRoute) => day(a).localeCompare(day(b)) || a.name.localeCompare(b.name);
    return [
      { key: 'today', title: getText('Hoy', 'Today'), items: routes.filter((r) => day(r) === t).sort(sortAsc) },
      { key: 'next', title: getText('Próximas', 'Upcoming'), items: routes.filter((r) => day(r) > t).sort(sortAsc) },
      { key: 'past', title: getText('Anteriores', 'Past'), items: routes.filter((r) => day(r) < t).sort((a, b) => sortAsc(b, a)) },
    ].filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes, language]);

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

  async function loadDetail(id: string): Promise<AdminRoute | null> {
    const cached = details[id];
    if (cached && typeof cached !== 'string') return cached;
    setDetails((prev) => ({ ...prev, [id]: 'loading' }));
    try {
      const res = await fetch(`/api/space/${slug}/routes/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('detail');
      const data: AdminRoute = await res.json();
      setDetails((prev) => ({ ...prev, [id]: data }));
      return data;
    } catch {
      setDetails((prev) => ({ ...prev, [id]: 'error' }));
      return null;
    }
  }

  async function toggle(r: AdminRoute) {
    if (openId === r.id) {
      setOpenId(null);
      return;
    }
    setOpenId(r.id);
    void loadDetail(r.id);
    if ((r.status === 'in_progress' || r.status === 'completed') && !recon[r.id]) {
      setRecon((prev) => ({ ...prev, [r.id]: 'loading' }));
      try {
        const res = await fetch(`/api/space/${slug}/routes/${r.id}/reconciliation`, { cache: 'no-store' });
        if (!res.ok) throw new Error('recon');
        const data: Reconciliation = await res.json();
        setRecon((prev) => ({ ...prev, [r.id]: data }));
      } catch {
        setRecon((prev) => ({ ...prev, [r.id]: 'error' }));
      }
    }
  }

  async function startEdit(r: AdminRoute) {
    const full = await loadDetail(r.id);
    if (!full) {
      notify.error(getText('No se pudieron cargar las paradas de la ruta.', "Couldn't load the route's stops."));
      return;
    }
    setForm({
      id: r.id,
      name: r.name,
      date: r.routeDate.slice(0, 10),
      vehicleId: r.vehicleId ?? '',
      driverId: r.driverId ?? '',
      stops: [...full.stops].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.customerId),
    });
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addressOf(s: RouteStop): string | null {
    return s.customerAddress || byId.get(s.customerId)?.address || null;
  }

  function mapsUrl(s: RouteStop): string | null {
    if (s.customerLat != null && s.customerLng != null) return `https://www.google.com/maps/dir/?api=1&destination=${s.customerLat},${s.customerLng}`;
    const a = addressOf(s);
    return a ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}` : null;
  }

  function renderRoute(r: AdminRoute) {
    const open = openId === r.id;
    const det = details[r.id];
    const full = det && typeof det !== 'string' ? det : null;
    const stops = [...(full?.stops ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const pct = r.stopsTotal > 0 ? Math.round((r.stopsDone / r.stopsTotal) * 100) : 0;
    const noAddr = stops.filter((st) => !addressOf(st)).length;
    const rc = recon[r.id];
    return (
      <li key={r.id} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800">
        <button type="button" onClick={() => toggle(r)} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-neutral-900/60">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">{r.name}</p>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_CHIP[r.status] ?? STATUS_CHIP.completed}`}>{statusLabel[r.status] ?? r.status}</span>
              {noAddr > 0 && canEdit(r.status) && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  {noAddr} {getText('sin dirección', 'no address')}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
              {formatDate(r.routeDate)} · 🚚 {r.vehiclePlate ?? getText('Sin vehículo', 'No vehicle')} · 👤 {r.driverName ?? getText('Sin conductor', 'No driver')}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="shrink-0 text-xs text-gray-500 dark:text-neutral-400">
                {r.stopsDone}/{r.stopsTotal} {getText('paradas', 'stops')}
              </span>
            </div>
          </div>
          <span aria-hidden="true" className={`mt-1 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>

        {open && (
          <div className="space-y-4 border-t border-gray-200 p-4 dark:border-neutral-800">
            <div className="flex flex-wrap gap-2">
              <a href={`/space/${slug}/ruta/${r.id}`} className={outlineBtn}>
                {getText('Abrir hoja de reparto', 'Open delivery sheet')}
              </a>
              {canEdit(r.status) && (
                <>
                  <button type="button" onClick={() => startEdit(r)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
                    {getText('Editar ruta', 'Edit route')}
                  </button>
                  <button type="button" onClick={() => cancel(r)} className={outlineBtn}>
                    {getText('Cancelar ruta', 'Cancel route')}
                  </button>
                </>
              )}
            </div>
            {!canEdit(r.status) && r.status !== 'cancelled' && (
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                {getText('La ruta ya salió o está cerrada: se puede ver completa, pero no modificar.', 'The route has left or is closed: you can view it in full but not change it.')}
              </p>
            )}

            {/* Cuadre: solo cuando la ruta ya salió */}
            {(r.status === 'in_progress' || r.status === 'completed') && (
              <div>
                <h3 className="text-sm font-semibold">{getText('Cuadre', 'Reconciliation')}</h3>
                {rc === 'loading' || rc === undefined ? (
                  <p className="mt-1 text-xs text-gray-500">{getText('Cargando…', 'Loading…')}</p>
                ) : rc === 'error' ? (
                  <p className="mt-1 text-xs text-red-600">{getText('No se pudo cargar el cuadre.', "Couldn't load the reconciliation.")}</p>
                ) : (
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                    {[
                      [getText('Cargados', 'Loaded'), rc.loadedFull ?? '—'],
                      [getText('Entregados', 'Delivered'), rc.deliveredFull],
                      [getText('Vacíos recogidos', 'Empties back'), rc.returnedEmpty],
                      [getText('Por volver llenos', 'Full to return'), rc.fullRemaining ?? '—'],
                      [getText('Vendido', 'Sales'), money(rc.salesTotal)],
                      [getText('Cobrado en efectivo', 'Cash collected'), money(rc.collectedCash)],
                      [getText('Cobrado por transferencia', 'Transfers collected'), money(rc.collectedTransfer)],
                      [getText('Dañados', 'Damaged'), rc.damaged],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-xl bg-gray-50 p-2 dark:bg-neutral-900">
                        <dt className="text-[11px] text-gray-500 dark:text-neutral-400">{label}</dt>
                        <dd className="mt-0.5 text-sm font-bold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}

            {/* Paradas */}
            <div>
              <h3 className="text-sm font-semibold">
                {getText('Paradas', 'Stops')} ({stops.length})
              </h3>
              {det === undefined || det === 'loading' ? (
                <p className="mt-1 text-xs text-gray-500">{getText('Cargando paradas…', 'Loading stops…')}</p>
              ) : det === 'error' ? (
                <p className="mt-1 text-xs text-red-600">{getText('No se pudieron cargar las paradas.', "Couldn't load the stops.")}</p>
              ) : stops.length === 0 ? (
                <p className="mt-1 text-xs text-gray-500">{getText('Esta ruta no tiene paradas.', 'This route has no stops.')}</p>
              ) : (
                <ol className="mt-2 space-y-2">
                  {stops.map((s, i) => {
                    const addr = addressOf(s);
                    const url = mapsUrl(s);
                    const arrived = time(s.arrivedAt);
                    const visited = time(s.visitedAt);
                    return (
                      <li key={s.id} className="flex gap-3 rounded-xl bg-gray-50 p-3 dark:bg-neutral-900">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-600 shadow-sm dark:bg-neutral-800 dark:text-neutral-300">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-words text-sm font-medium">{s.customerName}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STOP_CHIP[s.status] ?? STOP_CHIP.pending}`}>{stopLabel[s.status] ?? s.status}</span>
                          </div>
                          {addr ? (
                            <p className="mt-0.5 break-words text-xs text-gray-500 dark:text-neutral-400">
                              📍 {addr}
                              {url && (
                                <a href={url} target="_blank" rel="noopener noreferrer" className="ml-2 font-semibold underline">
                                  {getText('Ver en el mapa', 'View on map')}
                                </a>
                              )}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                              📍 {getText('Sin dirección.', 'No address.')}{' '}
                              <a href={`/space/${slug}/clientes`} className="underline">{getText('Agrégala en Clientes', 'Add it in Customers')}</a>
                            </p>
                          )}
                          {(s.customerPhone || arrived || visited) && (
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                              {[s.customerPhone ? `📞 ${s.customerPhone}` : null, arrived ? `${getText('Llegó', 'Arrived')} ${arrived}` : null, visited ? `${getText('Atendida', 'Served')} ${visited}` : null].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {s.notes && <p className="mt-0.5 break-words text-xs italic text-gray-500 dark:text-neutral-400">{s.notes}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        )}
      </li>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{getText('Rutas', 'Routes')}</h2>
          <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Toca una ruta para ver sus paradas y su cuadre.', 'Tap a route to see its stops and reconciliation.')}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm({ id: null, name: '', date: today(), vehicleId: '', driverId: '', stops: [] });
            setQuery('');
          }}
          className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}
        >
          + {getText('Nueva ruta', 'New route')}
        </button>
      </div>

      {form && (
        <div className="mt-3 space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-neutral-800">
          <h3 className="text-sm font-semibold">{form.id ? getText('Editar ruta', 'Edit route') : getText('Nueva ruta', 'New route')}</h3>
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
              {form.stops.map((id, i) => {
                const c = byId.get(id);
                return (
                  <li key={id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 text-sm dark:bg-neutral-900">
                    <span className="w-6 shrink-0 text-center text-gray-500 dark:text-neutral-400">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words">{c?.name ?? id}</span>
                      {c && !c.address && <span className="block text-[11px] font-medium text-amber-700 dark:text-amber-400">{getText('Sin dirección', 'No address')}</span>}
                    </span>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={getText('Subir', 'Move up')} className="h-8 w-8 rounded border border-gray-300 disabled:opacity-30 dark:border-neutral-700">↑</button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === form.stops.length - 1} aria-label={getText('Bajar', 'Move down')} className="h-8 w-8 rounded border border-gray-300 disabled:opacity-30 dark:border-neutral-700">↓</button>
                    <button type="button" onClick={() => setForm({ ...form, stops: form.stops.filter((s) => s !== id) })} aria-label={getText('Quitar', 'Remove')} className="h-8 w-8 rounded border border-gray-300 dark:border-neutral-700">✕</button>
                  </li>
                );
              })}
            </ol>
            <input className={`${input} mt-2`} placeholder={getText('Buscar cliente para agregar…', 'Search a customer to add…')} value={query} onChange={(e) => setQuery(e.target.value)} />
            {matches.length > 0 && (
              <ul className="mt-1 overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700">
                {matches.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setForm({ ...form, stops: [...form.stops, c.id] }); setQuery(''); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">
                      {c.name}
                      {c.phone ? <span className="ml-2 text-xs text-gray-500 dark:text-neutral-400">{c.phone}</span> : null}
                      {!c.address && <span className="ml-2 text-xs font-medium text-amber-700 dark:text-amber-400">{getText('sin dirección', 'no address')}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => { setForm(null); setQuery(''); }} disabled={saving} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-neutral-700">
              {getText('Cancelar', 'Cancel')}
            </button>
            <button type="button" onClick={save} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar ruta', 'Save route')}
            </button>
          </div>
        </div>
      )}

      {routes.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-neutral-700">
          <p className="text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no hay rutas. Crea la primera con "Nueva ruta".', 'No routes yet. Create the first one with "New route".')}</p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="mt-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
              {g.title} <span className="font-normal">({g.items.length})</span>
            </h3>
            <ul className="space-y-2">
              {g.items.map((r) => (
                renderRoute(r)
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
