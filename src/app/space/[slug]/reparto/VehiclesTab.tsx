'use client';

import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { readApiError } from '@/lib/receivables';
import type { DriverOption, Vehicle } from '@/lib/delivery';

interface Props {
  slug: string;
  vehicles: Vehicle[];
  drivers: DriverOption[];
  onChange: () => Promise<void>;
  notify: { success: (m: string) => void; error: (m: string) => void };
}

interface Form {
  id: string | null;
  plate: string;
  name: string;
  capacity: string;
  driverId: string;
  isActive: boolean;
}

const EMPTY: Form = { id: null, plate: '', name: '', capacity: '', driverId: '', isActive: true };

export function VehiclesTab({ slug, vehicles, drivers, onChange, notify }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';

  async function save() {
    if (!form) return;
    if (!form.plate.trim()) {
      notify.error(getText('Escribe la placa.', 'Enter the plate.'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(form.id ? `/api/space/${slug}/vehicles/${form.id}` : `/api/space/${slug}/vehicles`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate: form.plate.trim(),
          name: form.name.trim() || null,
          capacityContainers: Math.max(0, Math.floor(Number(form.capacity) || 0)),
          driverId: form.driverId || null,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) {
        notify.error(await readApiError(res, getText('No se pudo guardar el vehículo.', "Couldn't save the vehicle.")));
        return;
      }
      notify.success(getText('Vehículo guardado.', 'Vehicle saved.'));
      setForm(null);
      await onChange();
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{getText('Vehículos', 'Vehicles')}</h2>
        <button type="button" onClick={() => setForm(EMPTY)} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
          {getText('Nuevo vehículo', 'New vehicle')}
        </button>
      </div>

      {form && (
        <div className="mt-3 space-y-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={input} placeholder={getText('Placa', 'Plate')} value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
            <input className={input} placeholder={getText('Nombre (opcional)', 'Name (optional)')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={input} type="number" inputMode="numeric" min="0" placeholder={getText('Capacidad (botellones)', 'Capacity (bottles)')} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            <select className={input} value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
              <option value="">{getText('Sin conductor fijo', 'No fixed driver')}</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            {getText('Activo', 'Active')}
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(null)} disabled={saving} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
              {getText('Cancelar', 'Cancel')}
            </button>
            <button type="button" onClick={save} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--brand-primary, #045AFE)' }}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </div>
      )}

      {vehicles.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no hay vehículos.', 'No vehicles yet.')}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {vehicles.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold">
                  {v.plate}
                  {v.name ? ` · ${v.name}` : ''}
                  {!v.isActive && <span className="ml-2 text-xs text-gray-500 dark:text-neutral-400">({getText('inactivo', 'inactive')})</span>}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {v.driverName ?? getText('Sin conductor fijo', 'No fixed driver')} · {v.capacityContainers} {getText('botellones', 'bottles')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ id: v.id, plate: v.plate, name: v.name ?? '', capacity: String(v.capacityContainers), driverId: v.driverId ?? '', isActive: v.isActive })}
                className="shrink-0 rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold"
              >
                {getText('Editar', 'Edit')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
