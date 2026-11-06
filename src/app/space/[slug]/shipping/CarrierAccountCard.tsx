'use client';

// Etiquetas con United Bridge: el negocio pega su API key (se guarda cifrada en el servidor y no se vuelve a mostrar),
// elige el servicio y la caja por defecto y escribe su dirección de origen. Con esto, en Pedidos aparece "Comprar etiqueta".
import { useEffect, useState } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';

interface Account {
  hasKey: boolean;
  keyLast4: string | null;
  service: string;
  package: string;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  boxWeightOz: number;
  fromName: string | null;
  fromPhone: string | null;
  fromAddress1: string | null;
  fromAddress2: string | null;
  fromCity: string | null;
  fromState: string | null;
  fromZip: string | null;
  isActive: boolean;
}

const inputCls = 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary';

const SERVICES = [
  { value: 'UPS_GROUND', es: 'UPS Ground (terrestre, acepta perfumes)', en: 'UPS Ground (accepts perfumes)' },
  { value: 'USPS_UB_GA', es: 'USPS Ground Advantage (terrestre)', en: 'USPS Ground Advantage' },
  { value: 'FEDEX_HOME_DELIVERY', es: 'FedEx Home Delivery (terrestre)', en: 'FedEx Home Delivery' },
  { value: 'BEST_UB_SERVICE', es: 'El más barato (lo elige United Bridge)', en: 'Cheapest (chosen by United Bridge)' },
];

export function CarrierAccountCard({ slug }: { slug: string }) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const toast = useToast();
  const [acc, setAcc] = useState<Account | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/space/${slug}/carrier-account`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && d) setAcc(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  if (!acc) return null;

  const set = <K extends keyof Account>(k: K, v: Account[K]) => setAcc((a) => (a ? { ...a, [k]: v } : a));
  const num = (v: string) => (v === '' ? 0 : Number(v));

  async function save() {
    if (!acc) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/space/${slug}/carrier-account`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...acc, apiKey: apiKey.trim() || null }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setAcc(data);
        setApiKey('');
        toast.success(getText('Etiquetas guardadas.', 'Labels saved.'));
      } else {
        toast.error(data?.error?.message ?? getText('No se pudo guardar.', "Couldn't save."));
      }
    } catch {
      toast.error(getText('No se pudo guardar.', "Couldn't save."));
    } finally {
      setSaving(false);
    }
  }

  const ready = acc.hasKey && acc.isActive && !!acc.fromAddress1 && !!acc.fromCity && !!acc.fromState && !!acc.fromZip && !!acc.fromName;

  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <h2 className="text-base font-semibold text-text-primary">🏷️ {getText('Etiquetas de envío (United Bridge)', 'Shipping labels (United Bridge)')}</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {ready
              ? getText(`Conectado (clave ····${acc.keyLast4 ?? ''}). En Pedidos verás "Comprar etiqueta".`, `Connected (key ····${acc.keyLast4 ?? ''}). Orders will show "Buy label".`)
              : getText('Conecta tu cuenta para comprar etiquetas desde el pedido, sin salir de aquí.', 'Connect your account to buy labels from the order.')}
          </p>
        </div>
        <span className="text-sm text-brand-primary">{open ? getText('Cerrar', 'Close') : getText('Configurar', 'Set up')}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('API key de United Bridge', 'United Bridge API key')}</label>
            <input
              className={inputCls}
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={acc.hasKey ? `···· ${acc.keyLast4 ?? ''} — ${getText('déjalo vacío para conservarla', 'leave empty to keep it')}` : getText('Pega aquí la clave', 'Paste the key here')}
            />
            <p className="mt-1 text-xs text-text-muted">
              {getText(
                'United Bridge → Account → API Keys. Se guarda cifrada y no se vuelve a mostrar. Las etiquetas se descuentan del saldo de tu cuenta de United Bridge.',
                'United Bridge → Account → API Keys. Stored encrypted and never shown again. Labels are charged to your United Bridge balance.',
              )}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Servicio', 'Service')}</label>
              <select className={inputCls} value={SERVICES.some((s) => s.value === acc.service) ? acc.service : ''} onChange={(e) => set('service', e.target.value)}>
                {!SERVICES.some((s) => s.value === acc.service) && <option value="">{acc.service}</option>}
                {SERVICES.map((s) => <option key={s.value} value={s.value}>{getText(s.es, s.en)}</option>)}
              </select>
              <p className="mt-1 text-xs text-text-muted">{getText('Con perfumes usa un servicio terrestre.', 'With perfumes use a ground service.')}</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">{getText('Empaque', 'Package')}</label>
              <input className={inputCls} value={acc.package} onChange={(e) => set('package', e.target.value)} maxLength={40} />
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-text-secondary">{getText('Caja por defecto (pulgadas) y peso de la caja vacía (oz)', 'Default box (inches) and empty box weight (oz)')}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input className={inputCls} type="number" min="0" step="0.5" value={acc.lengthIn} onChange={(e) => set('lengthIn', num(e.target.value))} placeholder={getText('Largo', 'Length')} />
              <input className={inputCls} type="number" min="0" step="0.5" value={acc.widthIn} onChange={(e) => set('widthIn', num(e.target.value))} placeholder={getText('Ancho', 'Width')} />
              <input className={inputCls} type="number" min="0" step="0.5" value={acc.heightIn} onChange={(e) => set('heightIn', num(e.target.value))} placeholder={getText('Alto', 'Height')} />
              <input className={inputCls} type="number" min="0" step="0.5" value={acc.boxWeightOz} onChange={(e) => set('boxWeightOz', num(e.target.value))} placeholder={getText('Peso caja oz', 'Box oz')} />
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-text-secondary">{getText('Dirección de origen (de dónde sale el paquete)', 'Ship-from address')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={inputCls} value={acc.fromName ?? ''} onChange={(e) => set('fromName', e.target.value)} maxLength={80} placeholder={getText('Nombre o negocio', 'Name or business')} />
              <input className={inputCls} value={acc.fromPhone ?? ''} onChange={(e) => set('fromPhone', e.target.value)} maxLength={30} placeholder={getText('Teléfono', 'Phone')} />
              <input className={inputCls} value={acc.fromAddress1 ?? ''} onChange={(e) => set('fromAddress1', e.target.value)} maxLength={120} placeholder={getText('Dirección', 'Address')} />
              <input className={inputCls} value={acc.fromAddress2 ?? ''} onChange={(e) => set('fromAddress2', e.target.value)} maxLength={120} placeholder={getText('Apto / local (opcional)', 'Apt / suite (optional)')} />
              <input className={inputCls} value={acc.fromCity ?? ''} onChange={(e) => set('fromCity', e.target.value)} maxLength={80} placeholder={getText('Ciudad', 'City')} />
              <div className="grid grid-cols-2 gap-3">
                <input className={inputCls} value={acc.fromState ?? ''} onChange={(e) => set('fromState', e.target.value.toUpperCase())} maxLength={2} placeholder="NJ" />
                <input className={inputCls} value={acc.fromZip ?? ''} onChange={(e) => set('fromZip', e.target.value)} maxLength={10} placeholder="ZIP" />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" checked={acc.isActive} onChange={(e) => set('isActive', e.target.checked)} />
            {getText('Etiquetas activas', 'Labels enabled')}
          </label>

          <button type="button" onClick={save} disabled={saving} className="min-h-11 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
          </button>
        </div>
      )}
    </div>
  );
}
