'use client';

import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { readApiError } from '@/lib/receivables';

interface Settings {
  agingBasis: 'issue' | 'due';
  taxMode: 'none' | 'added' | 'included';
  taxRate: number;
  taxLabel: string;
}

// Cobros e impuestos de las facturas de reparto y contratos. Vive en Configuración porque es una regla del negocio,
// no un dato de cada factura: cambia cómo se calculan facturas nuevas y cómo se leen los saldos (no reescribe las ya emitidas).
export function ReceivablesSettingsCard({ slug }: { slug: string }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rate, setRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/space/${slug}/receivables-settings`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const s: Settings = await res.json();
        setSettings(s);
        setRate(s.taxRate > 0 ? String(s.taxRate) : '');
      } catch {
        /* la tarjeta no se muestra si no carga */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!settings) return null;

  async function save() {
    if (!settings) return;
    const parsed = Number(rate);
    const taxRate = settings.taxMode === 'none' ? 0 : parsed;
    if (settings.taxMode !== 'none' && (!Number.isFinite(parsed) || parsed <= 0)) {
      setMessage({ ok: false, text: getText('Escribe la tasa del impuesto (ej. 18).', 'Enter the tax rate (e.g. 18).') });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/space/${slug}/receivables-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, taxRate, taxLabel: settings.taxLabel.trim() || 'ITBIS' }),
      });
      if (!res.ok) {
        setMessage({ ok: false, text: await readApiError(res, getText('No se pudo guardar.', "Couldn't save.")) });
        return;
      }
      setMessage({ ok: true, text: getText('Guardado.', 'Saved.') });
    } catch {
      setMessage({ ok: false, text: getText('Sin conexión. Intenta de nuevo.', 'No connection. Try again.') });
    } finally {
      setSaving(false);
    }
  }

  const input = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm disabled:opacity-50';
  const label = settings.taxLabel.trim() || 'ITBIS';

  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
      <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-neutral-500">{getText('Cobros e impuestos', 'Collections & taxes')}</p>

      <label className="mt-4 block text-sm font-medium text-gray-700 dark:text-neutral-300">{getText('Antigüedad de saldos', 'Receivables aging')}</label>
      <select value={settings.agingBasis} onChange={(e) => setSettings({ ...settings, agingBasis: e.target.value as Settings['agingBasis'] })} disabled={saving} className={`${input} mt-1`}>
        <option value="issue">{getText('Días desde la emisión de la factura', 'Days since the invoice date')}</option>
        <option value="due">{getText('Días desde el vencimiento (lo que no ha vencido cuenta como al día)', 'Days since the due date (not-yet-due counts as current)')}</option>
      </select>
      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        {getText(
          'Con crédito a 15 o 30 días, contar desde el vencimiento muestra quién está realmente atrasado.',
          'With 15 or 30 day credit, counting from the due date shows who is actually late.',
        )}
      </p>

      <label className="mt-5 block text-sm font-medium text-gray-700 dark:text-neutral-300">{getText('Impuesto en las facturas', 'Tax on invoices')}</label>
      <select value={settings.taxMode} onChange={(e) => setSettings({ ...settings, taxMode: e.target.value as Settings['taxMode'] })} disabled={saving} className={`${input} mt-1`}>
        <option value="none">{getText('Sin impuesto', 'No tax')}</option>
        <option value="added">{getText(`Mis precios no incluyen ${label}: se suma a la factura`, `My prices exclude ${label}: added to the invoice`)}</option>
        <option value="included">{getText(`Mis precios ya incluyen ${label}: se separa en la factura`, `My prices include ${label}: shown separately on the invoice`)}</option>
      </select>
      {settings.taxMode !== 'none' && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input value={settings.taxLabel} onChange={(e) => setSettings({ ...settings, taxLabel: e.target.value })} maxLength={20} placeholder={getText('Nombre (ITBIS)', 'Name (ITBIS)')} disabled={saving} className={input} />
          <input type="number" inputMode="decimal" min="0" max="30" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={getText('Tasa % (ej. 18)', 'Rate % (e.g. 18)')} disabled={saving} className={input} />
        </div>
      )}
      <p className="mt-1 text-xs text-gray-400 dark:text-neutral-500">
        {getText(
          'Aplica a las facturas nuevas del reparto y los contratos. Las ya emitidas no cambian. Aún no genera NCF/e-CF.',
          'Applies to new delivery and contract invoices. Issued invoices do not change. It does not generate NCF/e-CF yet.',
        )}
      </p>

      <button onClick={save} disabled={saving} className="mt-4 w-full rounded-full border border-gray-300 dark:border-neutral-700 py-2.5 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:border-gray-400 disabled:opacity-50">
        {saving ? getText('Guardando...', 'Saving...') : getText('Guardar', 'Save')}
      </button>
      {message && <p className={`mt-2 text-xs ${message.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message.text}</p>}
    </div>
  );
}
