'use client';

// Listas de precio (Miembro, Mayorista…): un descuento general sobre el precio público y, si hace falta, un
// precio fijo por producto. El precio final lo calcula el API (PriceListPricing) — la vista previa de abajo usa
// ese mismo cálculo, así lo que ves aquí es lo que se cobra.
// Quién compra con qué lista lo decide la cuenta de cliente de la tienda (MembersPanel, abajo): un invitado siempre
// paga el precio público.
import { useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { MembersPanel, type StoreCustomerRow, type StoreSettings } from './MembersPanel';

export interface PriceListRow {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number;
  minOrderAmount: number | null;
  isActive: boolean;
  sortOrder: number;
  items: { itemId: string; price: number }[];
  taxExempt?: boolean;
}

interface PreviewLine {
  itemId: string;
  name: string;
  variantLabel: string | null;
  publicPrice: number;
  fixedPrice: number | null;
  finalPrice: number;
}

interface Props {
  slug: string;
  initialLists: PriceListRow[];
  currency: 'USD' | 'DOP';
  initialMembers: StoreCustomerRow[];
  initialSettings: StoreSettings | null;
}

const emptyForm = () => ({ name: '', description: '', discountPercent: '', minOrderAmount: '', isActive: true, taxExempt: false });
const inputCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary';

/** Mismo cálculo que PriceListPricing.Resolve en el API, para ver el efecto mientras se escribe. */
function resolvePrice(publicPrice: number, discountPercent: number, fixed: string): number {
  if (fixed.trim() !== '' && !Number.isNaN(Number(fixed))) return Math.round(Number(fixed) * 100) / 100;
  const pct = Math.min(100, Math.max(0, discountPercent || 0));
  return Math.round(publicPrice * (1 - pct / 100) * 100) / 100;
}

export function PriceListsContent({ slug, initialLists, currency, initialMembers, initialSettings }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  const [lists, setLists] = useState<PriceListRow[]>(initialLists);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [preview, setPreview] = useState<PreviewLine[] | null>(null);
  // Precio fijo por producto (texto del input); vacío = usa el descuento general.
  const [fixed, setFixed] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ReturnType<typeof emptyForm>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setPreview(null);
    setFixed({});
    setShowForm(true);
  }

  async function startEdit(l: PriceListRow) {
    setEditingId(l.id);
    setForm({
      name: l.name,
      description: l.description ?? '',
      discountPercent: String(l.discountPercent),
      minOrderAmount: l.minOrderAmount != null ? String(l.minOrderAmount) : '',
      isActive: l.isActive,
      taxExempt: l.taxExempt === true,
    });
    setFixed(Object.fromEntries(l.items.map((i) => [i.itemId, String(i.price)])));
    setPreview(null);
    setShowForm(true);
    try {
      const res = await fetch(`/api/space/${slug}/price-lists/${l.id}/preview`);
      if (res.ok) setPreview(await res.json());
    } catch {
      // Sin vista previa: se puede guardar igual el descuento general.
    }
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error(getText('Ponle un nombre a la lista.', 'Give the list a name.'));
      return;
    }
    setSaving(true);
    try {
      const existing = editingId ? lists.find((l) => l.id === editingId) : null;
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        discountPercent: Number(form.discountPercent || 0),
        minOrderAmount: form.minOrderAmount.trim() === '' ? null : Number(form.minOrderAmount),
        isActive: form.isActive,
        taxExempt: form.taxExempt,
        sortOrder: existing?.sortOrder ?? lists.length,
        // Al crear todavía no hay vista previa: los precios fijos se ponen después, al editar.
        items: editingId
          ? Object.entries(fixed)
              .filter(([, v]) => v.trim() !== '' && !Number.isNaN(Number(v)))
              .map(([itemId, v]) => ({ itemId, price: Number(v) }))
          : null,
      };
      const res = await fetch(editingId ? `/api/space/${slug}/price-lists/${editingId}` : `/api/space/${slug}/price-lists`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error?.message ?? getText('No se pudo guardar.', "Couldn't save."));
        return;
      }
      setLists((prev) => (editingId ? prev.map((l) => (l.id === editingId ? data : l)) : [...prev, data]));
      toast.success(getText('Lista guardada.', 'List saved.'));
      if (editingId) setShowForm(false);
      else await startEdit(data); // recién creada: abre la edición con la vista previa por producto
    } catch {
      toast.error(getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(l: PriceListRow) {
    if (!window.confirm(getText(`¿Eliminar la lista "${l.name}"? Los pedidos ya hechos no cambian.`, `Delete the "${l.name}" list? Existing orders don't change.`))) return;
    const res = await fetch(`/api/space/${slug}/price-lists/${l.id}`, { method: 'DELETE' });
    if (res.ok) {
      setLists((prev) => prev.filter((x) => x.id !== l.id));
      if (editingId === l.id) setShowForm(false);
    } else toast.error(getText('No se pudo eliminar.', "Couldn't delete."));
  }

  const pct = Number(form.discountPercent || 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text-primary">{getText('Listas de precio', 'Price lists')}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {getText(
              'Precios para miembros y mayoristas: un descuento general sobre tu precio público o un precio fijo por producto, con pedido mínimo opcional.',
              'Member and wholesale pricing: an overall discount on your public price or a fixed price per product, with an optional minimum order.',
            )}
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={startCreate}
            className="min-h-11 shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary-hover"
          >
            {getText('+ Nueva lista', '+ New list')}
          </button>
        )}
      </div>


      {showForm && (
        <div className="mt-5 rounded-xl border border-border bg-surface p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">
            {editingId ? getText('Editar lista', 'Edit list') : getText('Nueva lista', 'New list')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Nombre', 'Name')}</label>
              <input className={inputCls} value={form.name} onChange={set('name')} maxLength={120} placeholder={getText('Ej. Mayorista', 'E.g. Wholesale')} />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Descripción (opcional)', 'Description (optional)')}</label>
              <input className={inputCls} value={form.description} onChange={set('description')} maxLength={500} placeholder={getText('Ej. Para tiendas que revenden', 'E.g. For stores that resell')} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Descuento general (%)', 'Overall discount (%)')}</label>
              <input type="number" min="0" max="100" step="0.5" className={inputCls} value={form.discountPercent} onChange={set('discountPercent')} placeholder="30" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Pedido mínimo (opcional)', 'Minimum order (optional)')}</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.minOrderAmount} onChange={set('minOrderAmount')} placeholder="300" />
            </div>
            <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-text-primary">
              <input type="checkbox" checked={form.isActive} onChange={set('isActive')} />
              {getText('Activa', 'Active')}
            </label>
            <label className="sm:col-span-3 flex items-start gap-2 text-sm text-text-primary">
              <input type="checkbox" className="mt-0.5" checked={form.taxExempt} onChange={set('taxExempt')} />
              <span>
                {getText('Exenta de impuesto de venta (reventa)', 'Sales-tax exempt (resale)')}
                <span className="block text-xs text-text-muted">
                  {getText('Solo para clientes con certificado de reventa (en NY, formulario ST-120). Guarda copia del certificado.', 'Only for customers with a resale certificate (in NY, form ST-120). Keep a copy of the certificate.')}
                </span>
              </span>
            </label>
          </div>

          {editingId && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-text-secondary">
                {getText('Precio por producto — vacío = usa el descuento general', 'Price per product — empty = uses the overall discount')}
              </p>
              {preview === null ? (
                <p className="mt-2 text-xs text-text-muted">{getText('Cargando productos…', 'Loading products…')}</p>
              ) : preview.length === 0 ? (
                <p className="mt-2 text-xs text-text-muted">{getText('Todavía no tienes productos en tu catálogo.', 'You have no products in your catalog yet.')}</p>
              ) : (
                <div className="mt-2 max-h-[420px] overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-surface-elevated text-xs text-text-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">{getText('Producto', 'Product')}</th>
                        <th className="px-3 py-2 text-right font-medium">{getText('Público', 'Public')}</th>
                        <th className="px-3 py-2 text-right font-medium">{getText('Precio fijo', 'Fixed price')}</th>
                        <th className="px-3 py-2 text-right font-medium">{getText('Final', 'Final')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p) => {
                        const v = fixed[p.itemId] ?? '';
                        const final = resolvePrice(p.publicPrice, pct, v);
                        return (
                          <tr key={p.itemId} className="border-t border-border">
                            <td className="px-3 py-2 text-text-primary">
                              {p.name}
                              {p.variantLabel && <span className="ml-1 text-xs text-text-muted">· {p.variantLabel}</span>}
                            </td>
                            <td className="px-3 py-2 text-right text-text-muted">{fmt.format(p.publicPrice)}</td>
                            <td className="px-3 py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={v}
                                onChange={(e) => setFixed((f) => ({ ...f, [p.itemId]: e.target.value }))}
                                className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-right text-sm text-text-primary"
                                aria-label={getText(`Precio fijo de ${p.name}`, `Fixed price for ${p.name}`)}
                              />
                            </td>
                            <td className={`px-3 py-2 text-right font-semibold ${final > p.publicPrice ? 'text-amber-600' : 'text-text-primary'}`}>
                              {fmt.format(final)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="min-h-11 rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-50"
            >
              {saving ? getText('Guardando…', 'Saving…') : editingId ? getText('Guardar', 'Save') : getText('Crear y poner precios', 'Create and set prices')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="min-h-11 px-3 text-sm text-text-muted underline">
              {getText('Cancelar', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {lists.length === 0 && !showForm ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-text-muted">
            {getText('Todavía no tienes listas. Empieza con "Miembro" o "Mayorista".', 'No lists yet. Start with "Member" or "Wholesale".')}
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {lists.map((l) => (
            <li key={l.id} className={`rounded-xl border border-border bg-surface p-4 ${l.isActive ? '' : 'opacity-60'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary">
                    🏷️ {l.name}
                    {!l.isActive && <span className="ml-2 text-xs font-normal text-text-muted">({getText('pausada', 'paused')})</span>}
                  </p>
                  {l.description && <p className="mt-0.5 text-sm text-text-muted">{l.description}</p>}
                  <p className="mt-1 text-sm text-text-secondary">
                    {l.discountPercent > 0 ? getText(`${l.discountPercent}% menos`, `${l.discountPercent}% off`) : getText('Sin descuento general', 'No overall discount')}
                    {l.items.length > 0 && ` · ${getText(`${l.items.length} precio(s) fijo(s)`, `${l.items.length} fixed price(s)`)}`}
                    {l.minOrderAmount ? ` · ${getText('mínimo', 'min.')} ${fmt.format(l.minOrderAmount)}` : ''}
                    {l.taxExempt ? ` · ${getText('sin impuesto', 'tax exempt')}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(l)} className="min-h-9 rounded-full border border-border px-3 text-xs font-medium text-text-primary hover:border-brand-primary">
                    {getText('Editar precios', 'Edit prices')}
                  </button>
                  <button type="button" onClick={() => remove(l)} className="min-h-9 rounded-full border border-red-300 px-3 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-950">
                    {getText('Eliminar', 'Delete')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <MembersPanel
        slug={slug}
        lists={lists}
        initialMembers={initialMembers}
        initialSettings={initialSettings}
        getText={getText}
        language={language}
        onError={(m) => toast.error(m)}
        onSuccess={(m) => toast.success(m)}
      />
    </div>
  );
}
