'use client';

// Impuesto de venta del negocio. Sin tasa = como siempre (sin impuesto calculado). Con tasa, el API calcula el
// impuesto de cada pedido online (tienda, menú y kiosko) y la página muestra el mismo cálculo antes de pagar.
// Las listas de precio marcadas "exentas" (reventa) no pagan impuesto.
import { useState } from 'react';

export interface TaxSettings {
  rate: number | null;
  taxShipping: boolean;
  /** Estado donde cobra impuesto (2 letras). Envíos a otro estado van sin impuesto. */
  state?: string | null;
}

export function TaxSettingsCard({
  slug, initial, getText, toast,
}: {
  slug: string;
  initial: TaxSettings | null;
  getText: (es: string, en: string) => string;
  toast: { success: (m: string) => void; error: (m: string) => void };
}) {
  const [settings, setSettings] = useState<TaxSettings>(initial ?? { rate: null, taxShipping: true });
  const [rateText, setRateText] = useState(initial?.rate != null ? String(initial.rate) : '');
  const [stateText, setStateText] = useState(initial?.state ?? '');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    const rate = rateText.trim() === '' ? null : Number(rateText);
    if (rate != null && (Number.isNaN(rate) || rate < 0 || rate > 25)) {
      toast.error(getText('La tasa debe estar entre 0 y 25%.', 'The rate must be between 0 and 25%.'));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/tax-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate, taxShipping: settings.taxShipping, state: stateText.trim().toUpperCase() || null }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error?.message);
      setSettings({ rate: data.rate ?? null, taxShipping: data.taxShipping !== false, state: data.state ?? null });
      setStateText(data.state ?? '');
      setRateText(data.rate != null ? String(data.rate) : '');
      toast.success(getText('Impuesto guardado.', 'Tax saved.'));
    } catch (e) {
      toast.error((e as Error).message || getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSaving(false);
    }
  }

  const summary = settings.rate
    ? `${settings.rate}%${settings.state ? ` ${getText('en', 'in')} ${settings.state}` : ''}${settings.taxShipping ? getText(' · también sobre el envío', ' · also on shipping') : ''}`
    : getText('sin configurar — no se cobra impuesto', 'not set — no tax charged');

  return (
    <div className="mt-4 max-w-3xl rounded-2xl border border-gray-200/70 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <h2 className="text-sm font-semibold">🧾 {getText('Impuesto de venta', 'Sales tax')}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">{summary}</p>
        </div>
        <span className="text-xs font-medium text-brand-primary">{open ? getText('Cerrar', 'Close') : getText('Configurar', 'Configure')}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-neutral-300">{getText('Tasa combinada (%)', 'Combined rate (%)')}</label>
            <input
              type="number"
              min="0"
              max="25"
              step="0.001"
              value={rateText}
              onChange={(e) => setRateText(e.target.value)}
              placeholder="8"
              className="w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
              {getText(
                'Estatal + local de donde vendes (NJ: 6.625%; NY: según el condado, en tax.ny.gov). Vacío = no se cobra impuesto.',
                'State + local rate where you sell (NJ: 6.625%; NY: by county, at tax.ny.gov). Empty = no tax charged.',
              )}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-neutral-300">{getText('Estado donde cobras impuesto', 'State where you collect tax')}</label>
            <input
              value={stateText}
              onChange={(e) => setStateText(e.target.value.toUpperCase().slice(0, 2))}
              maxLength={2}
              placeholder="NJ"
              className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm uppercase dark:border-neutral-700 dark:bg-neutral-900"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
              {getText(
                'Los envíos a otro estado van sin impuesto. Recoger en tienda y envíos dentro del estado sí lo pagan.',
                'Shipments to another state carry no tax. Store pickup and in-state shipments do.',
              )}
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5" checked={settings.taxShipping} onChange={(e) => setSettings({ ...settings, taxShipping: e.target.checked })} />
            <span>
              {getText('El envío también paga impuesto', 'Shipping is also taxed')}
              <span className="block text-xs text-gray-500 dark:text-neutral-400">
                {getText('En NY el cargo de envío de productos gravables también se grava.', 'In NY, delivery charges on taxable goods are also taxable.')}
              </span>
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {getText(
              'Mayoristas con certificado de reventa: marca su lista como "Exenta de impuesto" en Listas de precio. Guarda copia del certificado.',
              'Wholesalers with a resale certificate: mark their list as "Tax exempt" in Price lists. Keep a copy of the certificate.',
            )}
          </p>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="min-h-10 rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
          </button>
        </div>
      )}
    </div>
  );
}
