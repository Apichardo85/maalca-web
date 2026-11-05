'use client';

// Envíos a domicilio: métodos con costo fijo, gratis desde un monto y días estimados. Sin agregador todavía:
// el negocio compra la etiqueta por su cuenta y, en Pedidos, anota paquetería + número de rastreo.
// "Terrestre" = puede llevar perfumes (material inflamable en cantidad limitada): con perfumes en el carrito,
// el checkout solo ofrece estos métodos.
import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { deliveryDaysLabel, type ShippingMethodRow } from '@/lib/commerce';

interface Props {
  slug: string;
  initialMethods: ShippingMethodRow[];
  currency: 'USD' | 'DOP';
}

const emptyForm = () => ({
  name: '',
  nameEn: '',
  price: '',
  freeOverAmount: '',
  minDays: '',
  maxDays: '',
  allowsHazmat: true,
  isActive: true,
  weightRates: '',
  states: '',
});

const inputCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary';

export function ShippingContent({ slug, initialMethods, currency }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  const [methods, setMethods] = useState<ShippingMethodRow[]>(initialMethods);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ReturnType<typeof emptyForm>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function startEdit(m: ShippingMethodRow) {
    setEditingId(m.id);
    setForm({
      name: m.name,
      nameEn: m.nameEn ?? '',
      price: String(m.price),
      freeOverAmount: m.freeOverAmount != null ? String(m.freeOverAmount) : '',
      minDays: m.minDays != null ? String(m.minDays) : '',
      maxDays: m.maxDays != null ? String(m.maxDays) : '',
      allowsHazmat: m.allowsHazmat,
      isActive: m.isActive,
      weightRates: m.weightRates ?? '',
      states: m.states ?? '',
    });
    setShowForm(true);
  }

  function payloadFrom(f: ReturnType<typeof emptyForm>, sortOrder: number) {
    const num = (v: string) => (v.trim() === '' ? null : Number(v));
    return {
      name: f.name.trim(),
      nameEn: f.nameEn.trim() || null,
      price: Number(f.price || 0),
      freeOverAmount: num(f.freeOverAmount),
      minDays: num(f.minDays),
      maxDays: num(f.maxDays),
      allowsHazmat: f.allowsHazmat,
      isActive: f.isActive,
      weightRates: f.weightRates.trim() || null,
      states: f.states.trim() || null,
      sortOrder,
    };
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error(getText('Ponle un nombre al método.', 'Give the method a name.'));
      return;
    }
    setSaving(true);
    try {
      const existing = editingId ? methods.find((m) => m.id === editingId) : null;
      const res = await fetch(editingId ? `/api/space/${slug}/shipping-methods/${editingId}` : `/api/space/${slug}/shipping-methods`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadFrom(form, existing?.sortOrder ?? methods.length)),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error?.message ?? getText('No se pudo guardar.', "Couldn't save."));
        return;
      }
      setMethods((prev) => (editingId ? prev.map((m) => (m.id === editingId ? data : m)) : [...prev, data]));
      setShowForm(false);
      toast.success(getText('Método guardado.', 'Method saved.'));
    } catch {
      toast.error(getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(m: ShippingMethodRow) {
    const res = await fetch(`/api/space/${slug}/shipping-methods/${m.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...m, isActive: !m.isActive }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data) setMethods((prev) => prev.map((x) => (x.id === m.id ? data : x)));
    else toast.error(data?.error?.message ?? getText('No se pudo actualizar.', "Couldn't update."));
  }

  async function remove(m: ShippingMethodRow) {
    if (!window.confirm(getText(`¿Eliminar "${m.name}"? Los pedidos ya hechos conservan su envío.`, `Delete "${m.name}"? Existing orders keep their shipping.`))) return;
    const res = await fetch(`/api/space/${slug}/shipping-methods/${m.id}`, { method: 'DELETE' });
    if (res.ok) setMethods((prev) => prev.filter((x) => x.id !== m.id));
    else toast.error(getText('No se pudo eliminar.', "Couldn't delete."));
  }

  const hasGround = methods.some((m) => m.isActive && m.allowsHazmat);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text-primary">{getText('Envíos a domicilio', 'Home delivery')}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {getText(
              'Tus clientes eligen "Envío a domicilio" al pagar con tarjeta. Tú compras la etiqueta con tu paquetería y en Pedidos anotas el número de rastreo: el cliente lo ve en su enlace de seguimiento.',
              'Customers choose "Ship to me" when paying by card. You buy the label with your carrier and add the tracking number in Orders: the customer sees it on their tracking link.',
            )}
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={startCreate}
            className="min-h-11 shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
          >
            {getText('+ Nuevo método', '+ New method')}
          </button>
        )}
      </div>

      <p className="mt-4 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-secondary">
        {getText(
          'El envío solo aparece en tu tienda si cobras con tarjeta (Stripe conectado): un envío se paga antes de despacharse.',
          'Shipping only shows on your store if you take card payments (Stripe connected): shipments are paid before they go out.',
        )}
        {methods.length > 0 && !hasGround && (
          <span className="mt-1 block font-semibold text-amber-600 dark:text-amber-400">
            {getText(
              '⚠ Ningún método activo es terrestre: los pedidos con perfumes no podrán enviarse.',
              '⚠ No active method is ground: orders with perfumes cannot be shipped.',
            )}
          </span>
        )}
      </p>

      {showForm && (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">
            {editingId ? getText('Editar método', 'Edit method') : getText('Nuevo método', 'New method')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Nombre', 'Name')}</label>
              <input className={inputCls} value={form.name} onChange={set('name')} maxLength={120} placeholder={getText('Ej. Envío estándar (USPS Ground)', 'E.g. Standard (USPS Ground)')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Nombre en inglés (opcional)', 'English name (optional)')}</label>
              <input className={inputCls} value={form.nameEn} onChange={set('nameEn')} maxLength={120} placeholder="Standard shipping" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Costo', 'Cost')}</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.price} onChange={set('price')} placeholder="8.99" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Gratis desde (opcional)', 'Free over (optional)')}</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.freeOverAmount} onChange={set('freeOverAmount')} placeholder="75" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Días hábiles (mínimo)', 'Business days (min)')}</label>
              <input type="number" min="0" step="1" className={inputCls} value={form.minDays} onChange={set('minDays')} placeholder="3" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Días hábiles (máximo)', 'Business days (max)')}</label>
              <input type="number" min="0" step="1" className={inputCls} value={form.maxDays} onChange={set('maxDays')} placeholder="5" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Tarifa por peso (opcional)', 'Rate by weight (optional)')}</label>
              <input className={inputCls} value={form.weightRates} onChange={set('weightRates')} placeholder="1:6.50; 3:9.99; 10:18.00" />
              <p className="mt-1 text-xs text-text-muted">
                {getText(
                  'Cada par es "hasta N libras : precio". Ej.: hasta 1 lb $6.50, hasta 3 lb $9.99, hasta 10 lb $18. Pasado el último tope se cobra el último precio. Usa el peso de cada producto (Catálogo); si un producto no tiene peso, se cobra el costo fijo de arriba.',
                  'Each pair is "up to N lb : price". E.g. up to 1 lb $6.50, up to 3 lb $9.99, up to 10 lb $18. Past the last tier the last price applies. Uses each product\'s weight (Catalog); if a product has no weight, the fixed cost above applies.',
                )}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Estados a los que llega (opcional)', 'States it ships to (optional)')}</label>
              <input className={inputCls} value={form.states} onChange={set('states')} placeholder="NJ, NY, PA" />
              <p className="mt-1 text-xs text-text-muted">
                {getText(
                  'Códigos de 2 letras separados por coma. Vacío = todo el país. Para cobrar distinto por zona, crea un método por zona (ej. "Zona cercana" NJ, NY, PA y "Resto del país" sin estados).',
                  'Two-letter codes separated by commas. Empty = nationwide. To charge by zone, create one method per zone (e.g. "Nearby" NJ, NY, PA and "Rest of US" with no states).',
                )}
              </p>
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-text-primary">
            <input type="checkbox" className="mt-0.5" checked={form.allowsHazmat} onChange={set('allowsHazmat')} />
            <span>
              {getText('Terrestre — puede llevar perfumes', 'Ground — can carry perfumes')}
              <span className="block text-xs text-text-muted">
                {getText(
                  'Márcalo si es USPS Ground Advantage, UPS Ground o FedEx Ground. Priority, Express y aéreos no pueden llevar perfume.',
                  'Check it for USPS Ground Advantage, UPS Ground or FedEx Ground. Priority, Express and air services cannot carry perfume.',
                )}
              </span>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
            {getText('Activo en la tienda', 'Active on the store')}
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="min-h-11 rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50"
            >
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="min-h-11 px-3 text-sm text-text-muted underline">
              {getText('Cancelar', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {methods.length === 0 && !showForm ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-text-muted">
            {getText('Todavía no tienes métodos de envío. Mientras no haya ninguno activo, tu tienda solo ofrece recoger.', "You don't have shipping methods yet. Until one is active, your store only offers pickup.")}
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {methods.map((m) => {
            const days = deliveryDaysLabel(m, getText);
            return (
              <li key={m.id} className={`rounded-xl border border-border bg-surface p-4 ${m.isActive ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{m.name}</p>
                    <p className="mt-0.5 text-sm text-text-secondary">
                      {m.price === 0 ? getText('Gratis', 'Free') : fmt.format(m.price)}
                      {m.freeOverAmount ? ` · ${getText('gratis desde', 'free over')} ${fmt.format(m.freeOverAmount)}` : ''}
                      {days ? ` · ${days}` : ''}
                    </p>
                    {(m.weightRates || m.states) && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        {m.weightRates ? `⚖️ ${m.weightRates}` : ''}
                        {m.weightRates && m.states ? ' · ' : ''}
                        {m.states ? `📍 ${m.states}` : ''}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">
                      {m.allowsHazmat ? `🚛 ${getText('Terrestre (acepta perfumes)', 'Ground (accepts perfumes)')}` : `✈️ ${getText('No acepta perfumes', 'No perfumes')}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => toggleActive(m)} className="min-h-9 rounded-full border border-border px-3 text-xs font-medium text-text-primary hover:border-brand-primary">
                      {m.isActive ? getText('Pausar', 'Pause') : getText('Activar', 'Activate')}
                    </button>
                    <button type="button" onClick={() => startEdit(m)} className="min-h-9 rounded-full border border-border px-3 text-xs font-medium text-text-primary hover:border-brand-primary">
                      {getText('Editar', 'Edit')}
                    </button>
                    <button type="button" onClick={() => remove(m)} className="min-h-9 rounded-full border border-red-300 px-3 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-950">
                      {getText('Eliminar', 'Delete')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
