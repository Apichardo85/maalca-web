'use client';

import { useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { readApiError } from '@/lib/receivables';
import { ANAQUEL_STATUSES, type Anaquel, type ContainerType } from '@/lib/delivery';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

interface Props {
  slug: string;
  types: ContainerType[];
  anaqueles: Anaquel[];
  customers: Customer[];
  businessName?: string;
  onChange: () => Promise<void>;
  notify: { success: (m: string) => void; error: (m: string) => void };
}

interface TypeForm {
  id: string | null;
  name: string;
  liters: string;
  deposit: string;
  isActive: boolean;
}

interface RackForm {
  id: string | null;
  customerId: string;
  label: string;
  location: string;
  capacity: string;
  status: string;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export function EnvasesTab({ slug, types, anaqueles, customers, businessName, onChange, notify }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [typeForm, setTypeForm] = useState<TypeForm | null>(null);
  const [rackForm, setRackForm] = useState<RackForm | null>(null);
  const [custQuery, setCustQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
  const ghost = 'rounded-full border border-gray-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-semibold';
  const brand = { backgroundColor: 'var(--brand-primary, #045AFE)' };
  const statusLabel: Record<string, string> = {
    disponible: getText('Disponible', 'Available'),
    activo: getText('Activo', 'Active'),
    pendiente_reposicion: getText('Pendiente de reposición', 'Needs restock'),
    completo: getText('Completo', 'Full'),
    danado: getText('Dañado', 'Damaged'),
    fuera_servicio: getText('Fuera de servicio', 'Out of service'),
  };

  const custMatches = useMemo(() => {
    const q = norm(custQuery.trim());
    if (q.length < 2) return [];
    return customers.filter((c) => norm(c.name).includes(q)).slice(0, 8);
  }, [customers, custQuery]);
  const custName = (id: string) => customers.find((c) => c.id === id)?.name ?? '';

  const shownRacks = useMemo(() => {
    const q = norm(filter.trim());
    if (!q) return anaqueles;
    return anaqueles.filter((a) => norm(`${a.customerName ?? ''} ${a.label ?? ''} ${a.location ?? ''} ${a.qrCode}`).includes(q));
  }, [anaqueles, filter]);

  async function send(url: string, method: 'POST' | 'PUT', body: unknown, okMsg: string, errMsg: string): Promise<boolean> {
    setSaving(true);
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        notify.error(await readApiError(res, errMsg));
        return false;
      }
      notify.success(okMsg);
      await onChange();
      return true;
    } catch {
      notify.error(getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.'));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveType() {
    if (!typeForm) return;
    if (!typeForm.name.trim()) {
      notify.error(getText('Escribe el nombre del envase.', 'Enter the container name.'));
      return;
    }
    const liters = typeForm.liters.trim() === '' ? null : Number(typeForm.liters);
    const ok = await send(
      typeForm.id ? `/api/space/${slug}/container-types/${typeForm.id}` : `/api/space/${slug}/container-types`,
      typeForm.id ? 'PUT' : 'POST',
      { name: typeForm.name.trim(), capacityLiters: liters !== null && Number.isFinite(liters) ? liters : null, deposit: Math.max(0, Number(typeForm.deposit) || 0), isActive: typeForm.isActive },
      getText('Envase guardado.', 'Container saved.'),
      getText('No se pudo guardar el envase.', "Couldn't save the container."),
    );
    if (ok) setTypeForm(null);
  }

  async function saveRack() {
    if (!rackForm) return;
    const ok = await send(
      rackForm.id ? `/api/space/${slug}/anaqueles/${rackForm.id}` : `/api/space/${slug}/anaqueles`,
      rackForm.id ? 'PUT' : 'POST',
      {
        customerId: rackForm.customerId || null,
        label: rackForm.label.trim() || null,
        location: rackForm.location.trim() || null,
        capacity: Math.max(0, Math.floor(Number(rackForm.capacity) || 0)),
        status: rackForm.status || null,
      },
      getText('Anaquel guardado.', 'Rack saved.'),
      getText('No se pudo guardar el anaquel.', "Couldn't save the rack."),
    );
    if (ok) {
      setRackForm(null);
      setCustQuery('');
    }
  }

  // Etiquetas imprimibles: una ventana con los QR (el código es el que el escáner del conductor resuelve).
  async function printLabels(list: Anaquel[]) {
    if (list.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) {
      notify.error(getText('El navegador bloqueó la ventana de impresión.', 'The browser blocked the print window.'));
      return;
    }
    const cards = await Promise.all(
      list.map(async (a) => {
        const img = await QRCode.toDataURL(a.qrCode, { width: 300, margin: 1, errorCorrectionLevel: 'M' });
        return `<div class="c"><img src="${img}"/><div class="n">${esc(a.customerName ?? getText('Sin asignar', 'Unassigned'))}</div><div class="s">${esc([a.label, a.location].filter(Boolean).join(' · '))}</div><div class="k">${esc(a.qrCode)}</div></div>`;
      }),
    );
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${esc(businessName ?? 'QR')}</title><style>body{font-family:sans-serif;margin:12px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.c{border:1px dashed #999;padding:10px;text-align:center;break-inside:avoid}.c img{width:100%;max-width:200px}.n{font-weight:700;font-size:14px}.s{font-size:12px;color:#444}.k{font:11px monospace;margin-top:4px}</style></head><body><div class="g">${cards.join('')}</div><script>window.onload=function(){window.print()}</script></body></html>`,
    );
    w.document.close();
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{getText('Tipos de envase', 'Container types')}</h2>
          <button type="button" onClick={() => setTypeForm({ id: null, name: '', liters: '', deposit: '', isActive: true })} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
            {getText('Nuevo tipo', 'New type')}
          </button>
        </div>
        {typeForm && (
          <div className="mt-3 space-y-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <input className={input} placeholder={getText('Nombre (ej. Botellón 5 gal)', 'Name (e.g. 5 gal bottle)')} value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} />
              <input className={input} type="number" inputMode="decimal" min="0" placeholder={getText('Litros (opcional)', 'Liters (optional)')} value={typeForm.liters} onChange={(e) => setTypeForm({ ...typeForm, liters: e.target.value })} />
              <input className={input} type="number" inputMode="decimal" min="0" placeholder={getText('Depósito', 'Deposit')} value={typeForm.deposit} onChange={(e) => setTypeForm({ ...typeForm, deposit: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={typeForm.isActive} onChange={(e) => setTypeForm({ ...typeForm, isActive: e.target.checked })} />
              {getText('Activo', 'Active')}
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTypeForm(null)} disabled={saving} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">{getText('Cancelar', 'Cancel')}</button>
              <button type="button" onClick={saveType} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={brand}>{getText('Guardar', 'Save')}</button>
            </div>
          </div>
        )}
        {types.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">{getText('Aún no hay tipos de envase. Crea al menos uno (ej. Botellón).', 'No container types yet. Create at least one (e.g. Bottle).')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {types.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
                <p className="min-w-0 break-words text-sm font-semibold">
                  {t.name}
                  <span className="ml-2 text-xs font-normal text-gray-500 dark:text-neutral-400">
                    {t.capacityLiters ? `${t.capacityLiters} L` : ''}{t.deposit > 0 ? ` · ${getText('depósito', 'deposit')} ${t.deposit}` : ''}{!t.isActive ? ` · ${getText('inactivo', 'inactive')}` : ''}
                  </span>
                </p>
                <button type="button" onClick={() => setTypeForm({ id: t.id, name: t.name, liters: t.capacityLiters?.toString() ?? '', deposit: t.deposit ? String(t.deposit) : '', isActive: t.isActive })} className={ghost}>
                  {getText('Editar', 'Edit')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{getText('Anaqueles', 'Racks')}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => printLabels(shownRacks)} disabled={shownRacks.length === 0} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold disabled:opacity-50">
              {getText('Imprimir QR', 'Print QR')} ({shownRacks.length})
            </button>
            <button type="button" onClick={() => setRackForm({ id: null, customerId: '', label: '', location: '', capacity: '', status: '' })} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">
              {getText('Nuevo anaquel', 'New rack')}
            </button>
          </div>
        </div>

        {rackForm && (
          <div className="mt-3 space-y-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-400">{getText('Cliente', 'Customer')}: <span className="font-semibold">{rackForm.customerId ? custName(rackForm.customerId) || '…' : getText('sin asignar', 'unassigned')}</span></p>
              <input className={`${input} mt-1`} placeholder={getText('Buscar cliente…', 'Search customer…')} value={custQuery} onChange={(e) => setCustQuery(e.target.value)} />
              {(custMatches.length > 0 || rackForm.customerId) && (
                <ul className="mt-1 overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700">
                  {rackForm.customerId && (
                    <li><button type="button" onClick={() => { setRackForm({ ...rackForm, customerId: '' }); setCustQuery(''); }} className="w-full px-3 py-2 text-left text-sm text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800">{getText('Quitar cliente', 'Clear customer')}</button></li>
                  )}
                  {custMatches.map((c) => (
                    <li key={c.id}><button type="button" onClick={() => { setRackForm({ ...rackForm, customerId: c.id }); setCustQuery(''); }} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-neutral-800">{c.name}</button></li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className={input} placeholder={getText('Etiqueta (ej. A-1)', 'Label (e.g. A-1)')} value={rackForm.label} onChange={(e) => setRackForm({ ...rackForm, label: e.target.value })} />
              <input className={input} placeholder={getText('Ubicación (ej. pasillo atrás)', 'Location (e.g. back hall)')} value={rackForm.location} onChange={(e) => setRackForm({ ...rackForm, location: e.target.value })} />
              <input className={input} type="number" inputMode="numeric" min="0" placeholder={getText('Capacidad (botellones)', 'Capacity (bottles)')} value={rackForm.capacity} onChange={(e) => setRackForm({ ...rackForm, capacity: e.target.value })} />
              <select className={input} value={rackForm.status} onChange={(e) => setRackForm({ ...rackForm, status: e.target.value })}>
                <option value="">{getText('Estado (automático)', 'Status (automatic)')}</option>
                {ANAQUEL_STATUSES.map((s) => (<option key={s} value={s}>{statusLabel[s]}</option>))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setRackForm(null); setCustQuery(''); }} disabled={saving} className="rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-semibold">{getText('Cancelar', 'Cancel')}</button>
              <button type="button" onClick={saveRack} disabled={saving} className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={brand}>{getText('Guardar', 'Save')}</button>
            </div>
          </div>
        )}

        <input className={`${input} mt-3`} placeholder={getText('Filtrar por cliente, etiqueta o código…', 'Filter by customer, label or code…')} value={filter} onChange={(e) => setFilter(e.target.value)} />
        {shownRacks.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500 dark:text-neutral-400">{getText('No hay anaqueles.', 'No racks.')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {shownRacks.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">{a.customerName ?? getText('Sin asignar', 'Unassigned')}</p>
                  <p className="break-words text-xs text-gray-500 dark:text-neutral-400">
                    {[a.label, a.location].filter(Boolean).join(' · ')}{a.label || a.location ? ' · ' : ''}{statusLabel[a.status] ?? a.status} · {a.qrCode}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => printLabels([a])} className={ghost}>QR</button>
                  <button type="button" onClick={() => setRackForm({ id: a.id, customerId: a.customerId ?? '', label: a.label ?? '', location: a.location ?? '', capacity: a.capacity ? String(a.capacity) : '', status: a.status })} className={ghost}>
                    {getText('Editar', 'Edit')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
