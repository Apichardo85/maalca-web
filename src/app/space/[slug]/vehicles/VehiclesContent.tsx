'use client';

// src/app/space/[slug]/vehicles/VehiclesContent.tsx
// Dealer (autoventa): inventario de vehiculos + configuracion de la vitrina (moneda, millaje, reservados).
// Mismo patron de pagina propia que ProgramsContent.tsx. Todo lo que la vitrina publica depende de lo que el
// dueno decide aca: la moneda y el millaje se aplican en lib/dealer.ts, y "mostrar reservados" lo hace cumplir
// el API (un vehiculo oculto nunca viaja en el JSON publico), no la web.
import { useState } from 'react';
import Link from 'next/link';
import type { ChangeEvent, FormEvent } from 'react';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/currency';
import {
  BODY_LABELS, CONDITION_LABELS, DRIVETRAIN_LABELS, FUEL_LABELS, ORIGIN_LABELS, STATUS_LABELS,
  TRANSMISSION_LABELS, label, type Currency,
} from '@/lib/dealer';
import type { DealerSettings, VehicleListing, VehicleStatus } from './types';

interface Props {
  slug: string;
  currency: Currency;
  initialVehicles: VehicleListing[];
  initialSettings: DealerSettings;
}

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm';
const labelClass = 'mb-1 block text-xs font-medium text-gray-500 dark:text-neutral-400';
const cardClass =
  'rounded-2xl border border-gray-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4';
const primaryBtn =
  'rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryBtn =
  'rounded-full border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-300';

const MAX_PHOTOS = 20;

async function api<T>(url: string, init?: RequestInit): Promise<{ ok: boolean; data: T | null; error?: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (res.status === 204) return { ok: true, data: null };
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, data: null, error: data?.error?.message ?? data?.message ?? (typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`) };
    return { ok: true, data };
  } catch {
    return { ok: false, data: null, error: 'network' };
  }
}

const emptyForm = {
  make: '', model: '', trim: '', year: String(new Date().getFullYear()), condition: 'used',
  price: '', compareAtPrice: '', mileage: '', mileageUnit: 'km' as 'km' | 'mi',
  transmission: '', fuelType: '', bodyType: '', drivetrain: '',
  exteriorColor: '', interiorColor: '', engine: '', doors: '', passengers: '',
  vin: '', stockNumber: '', importOrigin: '', status: 'available' as VehicleStatus,
  featured: false, isPubliclyVisible: true,
  images: [] as string[], description: '', descriptionEn: '',
};
type FormState = typeof emptyForm;

const numOrNull = (s: string) => (s.trim() ? Number(s) : null);
const strOrNull = (s: string) => s.trim() || null;

function toPayload(f: FormState, sortOrder = 0) {
  return {
    make: f.make.trim(), model: f.model.trim(), trim: strOrNull(f.trim),
    year: Number(f.year), condition: f.condition,
    price: Number(f.price), compareAtPrice: numOrNull(f.compareAtPrice),
    mileage: numOrNull(f.mileage), mileageUnit: f.mileageUnit,
    transmission: strOrNull(f.transmission), fuelType: strOrNull(f.fuelType),
    bodyType: strOrNull(f.bodyType), drivetrain: strOrNull(f.drivetrain),
    exteriorColor: strOrNull(f.exteriorColor), interiorColor: strOrNull(f.interiorColor),
    engine: strOrNull(f.engine), doors: numOrNull(f.doors), passengers: numOrNull(f.passengers),
    vin: strOrNull(f.vin), stockNumber: strOrNull(f.stockNumber), importOrigin: strOrNull(f.importOrigin),
    status: f.status, featured: f.featured, isPubliclyVisible: f.isPubliclyVisible, sortOrder,
    images: f.images, description: strOrNull(f.description), descriptionEn: strOrNull(f.descriptionEn),
  };
}

function formFrom(v: VehicleListing): FormState {
  return {
    make: v.make, model: v.model, trim: v.trim ?? '', year: String(v.year), condition: v.condition,
    price: String(v.price), compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice) : '',
    mileage: v.mileage != null ? String(v.mileage) : '', mileageUnit: v.mileageUnit,
    transmission: v.transmission ?? '', fuelType: v.fuelType ?? '', bodyType: v.bodyType ?? '', drivetrain: v.drivetrain ?? '',
    exteriorColor: v.exteriorColor ?? '', interiorColor: v.interiorColor ?? '', engine: v.engine ?? '',
    doors: v.doors != null ? String(v.doors) : '', passengers: v.passengers != null ? String(v.passengers) : '',
    vin: v.vin ?? '', stockNumber: v.stockNumber ?? '', importOrigin: v.importOrigin ?? '', status: v.status,
    featured: v.featured, isPubliclyVisible: v.isPubliclyVisible,
    images: v.images ?? [], description: v.description ?? '', descriptionEn: v.descriptionEn ?? '',
  };
}

export function VehiclesContent({ slug, currency, initialVehicles, initialSettings }: Props) {
  const { language } = useSimpleLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const getText = (es: string, en: string) => (lang === 'es' ? es : en);
  const toast = useToast();
  const base = `/api/space/${slug}/dealer-vehicles`;

  const [vehicles, setVehicles] = useState<VehicleListing[]>(initialVehicles);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');

  // ── Configuracion del dealer ─────────────────────────────────────────────────
  const [settings, setSettings] = useState<DealerSettings>(initialSettings);
  const [rateText, setRateText] = useState(initialSettings.usdToDop != null ? String(initialSettings.usdToDop) : '');
  const [finRateText, setFinRateText] = useState(initialSettings.financingRate != null ? String(initialSettings.financingRate) : '');
  const [termsText, setTermsText] = useState((initialSettings.financingTerms ?? []).join(', '));
  const [minDownText, setMinDownText] = useState(String(initialSettings.minDownPercent ?? 20));
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  async function saveSettings() {
    const rate = rateText.trim() ? Number(rateText) : null;
    if (settings.priceDisplay !== 'base' && (rate == null || !Number.isFinite(rate))) {
      toast.error(getText('Escribe cuántos pesos vale un dólar para mostrar los precios en otra moneda.', 'Enter how many pesos one dollar is worth to show prices in another currency.'));
      return;
    }
    const finRate = finRateText.trim() ? Number(finRateText.replace(',', '.')) : null;
    if (settings.financingEnabled && (finRate == null || !Number.isFinite(finRate) || finRate < 0 || finRate > 100)) {
      toast.error(getText('Para ofrecer financiamiento escribe la tasa anual (0 a 100).', 'To offer financing enter the annual rate (0 to 100).'));
      return;
    }
    const terms = termsText.split(/[,\s]+/).filter(Boolean).map(Number);
    if (terms.some((n) => !Number.isInteger(n) || n < 6 || n > 120)) {
      toast.error(getText('Los plazos son meses enteros entre 6 y 120, separados por coma.', 'Terms are whole months between 6 and 120, separated by commas.'));
      return;
    }
    const minDown = minDownText.trim() ? Number(minDownText.replace(',', '.')) : 20;
    if (!Number.isFinite(minDown) || minDown < 0 || minDown > 90) {
      toast.error(getText('El inicial mínimo va de 0% a 90%.', 'The minimum down payment is 0% to 90%.'));
      return;
    }
    setSavingSettings(true);
    // El PUT reemplaza toda la config "dealer": se mandan todos los campos.
    const res = await api<DealerSettings>(`/api/space/${slug}/dealer-settings`, {
      method: 'PUT',
      body: JSON.stringify({
        ...settings, usdToDop: rate,
        financingRate: finRate, financingTerms: terms, minDownPercent: minDown,
      }),
    });
    setSavingSettings(false);
    if (!res.ok || !res.data) {
      toast.error(res.error && res.error !== 'network' ? res.error : getText('No se pudo guardar la configuración.', 'Could not save the settings.'));
      return;
    }
    setSettings(res.data);
    setFinRateText(res.data.financingRate != null ? String(res.data.financingRate) : '');
    setTermsText((res.data.financingTerms ?? []).join(', '));
    setMinDownText(String(res.data.minDownPercent ?? 20));
    toast.success(getText('Configuración guardada.', 'Settings saved.'));
  }

  // ── Formulario ───────────────────────────────────────────────────────────────
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function startCreate() {
    setEditingId(null);
    // El millaje arranca en la unidad que el dueno eligio para su vitrina.
    setForm({ ...emptyForm, mileageUnit: settings.mileageUnit });
    setShowForm(true);
  }

  function startEdit(v: VehicleListing) {
    setEditingId(v.id);
    setForm(formFrom(v));
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handlePhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    const room = MAX_PHOTOS - form.images.length;
    if (room <= 0) {
      toast.error(getText(`Máximo ${MAX_PHOTOS} fotos por vehículo.`, `Up to ${MAX_PHOTOS} photos per vehicle.`));
      return;
    }
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of files.slice(0, room)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('itemId', editingId ?? 'new');
        const res = await fetch(`/api/space/${slug}/catalog/upload-image`, { method: 'POST', body: fd });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.url) throw new Error(data?.error ?? getText('No pudimos subir la foto.', "We couldn't upload the photo."));
        added.push(data.url);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : getText('No pudimos subir la foto.', "We couldn't upload the photo."));
    } finally {
      if (added.length > 0) setForm((f) => ({ ...f, images: [...f.images, ...added] }));
      setUploading(false);
    }
  }

  const removePhoto = (i: number) => set('images', form.images.filter((_, idx) => idx !== i));
  const makeCover = (i: number) => set('images', [form.images[i], ...form.images.filter((_, idx) => idx !== i)]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim()) {
      toast.error(getText('Marca y modelo son obligatorios.', 'Make and model are required.'));
      return;
    }
    if (!form.price.trim() || Number(form.price) < 0 || !Number.isFinite(Number(form.price))) {
      toast.error(getText('Escribe un precio válido.', 'Enter a valid price.'));
      return;
    }
    setSaving(true);
    const current = editingId ? vehicles.find((v) => v.id === editingId) : null;
    const payload = toPayload(form, current?.sortOrder ?? 0);
    const res = editingId
      ? await api<VehicleListing>(`${base}/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await api<VehicleListing>(base, { method: 'POST', body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok || !res.data) {
      toast.error(res.error && res.error !== 'network' ? res.error : getText('No se pudo guardar el vehículo.', 'Could not save the vehicle.'));
      return;
    }
    if (editingId) {
      setVehicles((prev) => prev.map((v) => (v.id === editingId ? res.data! : v)));
      toast.success(getText('Vehículo actualizado.', 'Vehicle updated.'));
    } else {
      setVehicles((prev) => [res.data!, ...prev]);
      toast.success(getText('Vehículo agregado.', 'Vehicle added.'));
    }
    cancelForm();
  }

  // Cambio rapido de estado (disponible / reservado / vendido) desde la lista: el PUT reemplaza todos los campos
  // editables, asi que se manda el vehiculo completo con el estado nuevo.
  async function changeStatus(v: VehicleListing, status: VehicleStatus) {
    const res = await api<VehicleListing>(`${base}/${v.id}`, {
      method: 'PUT',
      body: JSON.stringify(toPayload({ ...formFrom(v), status }, v.sortOrder)),
    });
    if (!res.ok || !res.data) {
      toast.error(getText('No se pudo cambiar el estado.', 'Could not change the status.'));
      return;
    }
    setVehicles((prev) => prev.map((x) => (x.id === v.id ? res.data! : x)));
  }

  async function handleDelete(id: string) {
    const res = await api(`${base}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error(getText('No se pudo eliminar el vehículo.', 'Could not delete the vehicle.'));
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setConfirmingDeleteId(null);
    toast.success(getText('Vehículo eliminado.', 'Vehicle deleted.'));
  }

  // ── Lista ────────────────────────────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const searched = vehicles.filter(
    (v) => !q || `${v.year} ${v.make} ${v.model} ${v.trim ?? ''} ${v.stockNumber ?? ''} ${v.vin ?? ''}`.toLowerCase().includes(q),
  );
  const shown = searched.filter((v) => statusFilter === 'all' || v.status === statusFilter);
  const count = (s: VehicleStatus) => searched.filter((v) => v.status === s).length;

  const options = (dict: Record<string, { es: string; en: string }>) =>
    Object.keys(dict).map((k) => (
      <option key={k} value={k}>{dict[k][lang]}</option>
    ));

  const field = (text: string, children: React.ReactNode, hint?: string) => (
    <div>
      <label className={labelClass}>{text}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">{hint}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Toast toasts={toast.toasts} onRemove={toast.remove} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">{getText('Vehículos', 'Vehicles')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">
            {getText(
              'Tu inventario. Lo disponible y lo reservado se muestra en tu página pública; lo vendido se oculta solo.',
              'Your inventory. Available and reserved vehicles show on your public page; sold ones hide automatically.',
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/space/${slug}/vehicles/leads`} className={`${secondaryBtn} min-h-11 inline-flex items-center`}>
            {getText('Interesados', 'Leads')}
          </Link>
          {!showForm && (
            <button type="button" onClick={startCreate} className={`${primaryBtn} min-h-11`}>
              {getText('+ Nuevo vehículo', '+ New vehicle')}
            </button>
          )}
        </div>
      </div>

      {/* Configuracion de la vitrina */}
      <div className={`${cardClass} mb-6`}>
        <button type="button" onClick={() => setSettingsOpen((o) => !o)} aria-expanded={settingsOpen}
          className="flex w-full items-center justify-between text-left">
          <span>
            <span className="block text-sm font-semibold">{getText('Configuración de la vitrina', 'Storefront settings')}</span>
            <span className="block text-xs text-gray-500 dark:text-neutral-400">
              {getText('Moneda, millaje, reservados, financiamiento, trade-in y pruebas de manejo', 'Currency, mileage, reserved, financing, trade-in and test drives')}
            </span>
          </span>
          <span aria-hidden>{settingsOpen ? '▾' : '▸'}</span>
        </button>

        {settingsOpen && (
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {field(getText('Mostrar precios en', 'Show prices in'),
                <select className={inputClass} value={settings.priceDisplay}
                  onChange={(e) => setSettings((s) => ({ ...s, priceDisplay: e.target.value as DealerSettings['priceDisplay'] }))}>
                  <option value="base">{getText(`Solo ${currency} (como los guardas)`, `${currency} only (as you store them)`)}</option>
                  <option value="usd">{getText('Dólares (USD)', 'US dollars (USD)')}</option>
                  <option value="dop">{getText('Pesos (DOP)', 'Pesos (DOP)')}</option>
                  <option value="both">{getText('Ambas: USD y DOP', 'Both: USD and DOP')}</option>
                </select>,
                getText(`Tus precios se guardan en ${currency}.`, `Your prices are stored in ${currency}.`))}
              {field(getText('Pesos por dólar', 'Pesos per dollar'),
                <input className={inputClass} inputMode="decimal" value={rateText}
                  disabled={settings.priceDisplay === 'base'}
                  onChange={(e) => setRateText(e.target.value)} placeholder="ej. 60.5" />,
                getText('Tú decides la tasa; no se actualiza sola. Hace falta para convertir.', 'You set the rate; it does not update itself. Needed to convert.'))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {field(getText('Millaje en', 'Mileage in'),
                <select className={inputClass} value={settings.mileageUnit}
                  onChange={(e) => setSettings((s) => ({ ...s, mileageUnit: e.target.value as 'km' | 'mi' }))}>
                  <option value="km">{getText('Kilómetros (km)', 'Kilometers (km)')}</option>
                  <option value="mi">{getText('Millas (mi)', 'Miles (mi)')}</option>
                </select>,
                getText('Se convierte automáticamente si un vehículo está en otra unidad.', 'Converted automatically if a vehicle uses the other unit.'))}
              <label className="flex items-start gap-2 pt-5 text-sm text-gray-600 dark:text-neutral-300">
                <input type="checkbox" className="mt-0.5" checked={settings.showReserved}
                  onChange={(e) => setSettings((s) => ({ ...s, showReserved: e.target.checked }))} />
                <span>
                  {getText('Mostrar vehículos reservados', 'Show reserved vehicles')}
                  <span className="block text-[11px] text-gray-400 dark:text-neutral-500">
                    {getText('Apagado: los reservados desaparecen de tu página hasta que se liberen.', 'Off: reserved vehicles disappear from your page until released.')}
                  </span>
                </span>
              </label>
            </div>
            <div className="space-y-3 border-t border-gray-200/70 pt-3 dark:border-neutral-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-neutral-400">
                {getText('Conversión: lo que tus clientes pueden pedir en línea', 'Conversion: what your customers can request online')}
              </p>
              <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-neutral-300">
                <input type="checkbox" className="mt-0.5" checked={settings.financingEnabled}
                  onChange={(e) => setSettings((s) => ({ ...s, financingEnabled: e.target.checked }))} />
                <span>
                  {getText('Calculadora de financiamiento', 'Financing calculator')}
                  <span className="block text-[11px] text-gray-400 dark:text-neutral-500">
                    {getText('El cliente calcula su cuota en cada vehículo y te deja su solicitud.', 'Customers estimate their payment on each vehicle and send you a request.')}
                  </span>
                </span>
              </label>
              {settings.financingEnabled && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {field(getText('Tasa anual (%)', 'Annual rate (%)'),
                    <input className={inputClass} inputMode="decimal" value={finRateText} placeholder="ej. 12.5"
                      onChange={(e) => setFinRateText(e.target.value)} />)}
                  {field(getText('Plazos (meses)', 'Terms (months)'),
                    <input className={inputClass} value={termsText} placeholder="24, 36, 48, 60, 72"
                      onChange={(e) => setTermsText(e.target.value)} />)}
                  {field(getText('Inicial mínimo (%)', 'Minimum down payment (%)'),
                    <input className={inputClass} inputMode="decimal" value={minDownText}
                      onChange={(e) => setMinDownText(e.target.value)} />)}
                </div>
              )}
              <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-neutral-300">
                <input type="checkbox" className="mt-0.5" checked={settings.tradeInEnabled}
                  onChange={(e) => setSettings((s) => ({ ...s, tradeInEnabled: e.target.checked }))} />
                <span>
                  {getText('Vendo mi carro (trade-in)', 'Sell my car (trade-in)')}
                  <span className="block text-[11px] text-gray-400 dark:text-neutral-500">
                    {getText('Muestra un formulario para que te ofrezcan su vehículo.', 'Shows a form so people can offer you their vehicle.')}
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-neutral-300">
                <input type="checkbox" className="mt-0.5" checked={settings.testDriveEnabled}
                  onChange={(e) => setSettings((s) => ({ ...s, testDriveEnabled: e.target.checked }))} />
                <span>
                  {getText('Pruebas de manejo', 'Test drives')}
                  <span className="block text-[11px] text-gray-400 dark:text-neutral-500">
                    {getText('Cada vehículo muestra un botón para agendar una prueba.', 'Each vehicle shows a button to book a test drive.')}
                  </span>
                </span>
              </label>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={saveSettings} disabled={savingSettings} className={primaryBtn}>
                {savingSettings ? getText('Guardando…', 'Saving…') : getText('Guardar configuración', 'Save settings')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${cardClass} mb-6 space-y-4`}>
          <h2 className="text-sm font-semibold">{editingId ? getText('Editar vehículo', 'Edit vehicle') : getText('Nuevo vehículo', 'New vehicle')}</h2>

          <div className="grid gap-3 sm:grid-cols-4">
            {field(getText('Marca *', 'Make *'), <input className={inputClass} value={form.make} onChange={(e) => set('make', e.target.value)} placeholder="Toyota" />)}
            {field(getText('Modelo *', 'Model *'), <input className={inputClass} value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="RAV4" />)}
            {field(getText('Versión', 'Trim'), <input className={inputClass} value={form.trim} onChange={(e) => set('trim', e.target.value)} placeholder="XLE" />)}
            {field(getText('Año *', 'Year *'), <input className={inputClass} inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} />)}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {field(`${getText('Precio *', 'Price *')} (${currency})`, <input className={inputClass} inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} />)}
            {field(getText('Precio anterior (tachado)', 'Previous price (struck)'), <input className={inputClass} inputMode="decimal" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} />)}
            {field(getText('Millaje', 'Mileage'), <input className={inputClass} inputMode="numeric" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />)}
            {field(getText('Unidad', 'Unit'),
              <select className={inputClass} value={form.mileageUnit} onChange={(e) => set('mileageUnit', e.target.value as 'km' | 'mi')}>
                <option value="km">km</option><option value="mi">mi</option>
              </select>)}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {field(getText('Condición', 'Condition'), <select className={inputClass} value={form.condition} onChange={(e) => set('condition', e.target.value)}>{options(CONDITION_LABELS)}</select>)}
            {field(getText('Carrocería', 'Body type'), <select className={inputClass} value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)}><option value="">—</option>{options(BODY_LABELS)}</select>)}
            {field(getText('Transmisión', 'Transmission'), <select className={inputClass} value={form.transmission} onChange={(e) => set('transmission', e.target.value)}><option value="">—</option>{options(TRANSMISSION_LABELS)}</select>)}
            {field(getText('Combustible', 'Fuel'), <select className={inputClass} value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)}><option value="">—</option>{options(FUEL_LABELS)}</select>)}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {field(getText('Tracción', 'Drivetrain'), <select className={inputClass} value={form.drivetrain} onChange={(e) => set('drivetrain', e.target.value)}><option value="">—</option>{options(DRIVETRAIN_LABELS)}</select>)}
            {field(getText('Motor', 'Engine'), <input className={inputClass} value={form.engine} onChange={(e) => set('engine', e.target.value)} placeholder="2.5L 4 cil." />)}
            {field(getText('Color exterior', 'Exterior color'), <input className={inputClass} value={form.exteriorColor} onChange={(e) => set('exteriorColor', e.target.value)} />)}
            {field(getText('Color interior', 'Interior color'), <input className={inputClass} value={form.interiorColor} onChange={(e) => set('interiorColor', e.target.value)} />)}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {field(getText('Puertas', 'Doors'), <input className={inputClass} inputMode="numeric" value={form.doors} onChange={(e) => set('doors', e.target.value)} />)}
            {field(getText('Pasajeros', 'Passengers'), <input className={inputClass} inputMode="numeric" value={form.passengers} onChange={(e) => set('passengers', e.target.value)} />)}
            {field(getText('Procedencia', 'Origin'), <select className={inputClass} value={form.importOrigin} onChange={(e) => set('importOrigin', e.target.value)}><option value="">—</option>{options(ORIGIN_LABELS)}</select>)}
            {field(getText('Stock #', 'Stock #'), <input className={inputClass} value={form.stockNumber} onChange={(e) => set('stockNumber', e.target.value)} />)}
          </div>

          {field('VIN', <input className={inputClass} value={form.vin} onChange={(e) => set('vin', e.target.value)} />,
            getText('Solo lo ves tú; no se muestra en la página pública.', 'Only you see it; it is not shown on the public page.'))}

          {/* Fotos */}
          <div>
            <label className={labelClass}>{getText('Fotos', 'Photos')} ({form.images.length}/{MAX_PHOTOS})</label>
            {form.images.length > 0 && (
              <ul className="mb-2 flex flex-wrap gap-2">
                {form.images.map((src, i) => (
                  <li key={src + i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-20 w-24 rounded-lg object-cover" />
                    {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">{getText('Portada', 'Cover')}</span>}
                    <div className="mt-1 flex gap-1 text-[11px]">
                      {i > 0 && <button type="button" onClick={() => makeCover(i)} className="underline">{getText('Portada', 'Cover')}</button>}
                      <button type="button" onClick={() => removePhoto(i)} className="text-red-600 underline">{getText('Quitar', 'Remove')}</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handlePhotos} disabled={uploading} className="text-xs" />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-neutral-500">
              {uploading ? getText('Subiendo…', 'Uploading…') : getText('La primera foto es la portada. Puedes elegir varias a la vez.', 'The first photo is the cover. You can pick several at once.')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {field(getText('Descripción (español)', 'Description (Spanish)'), <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />)}
            {field(getText('Descripción (inglés, opcional)', 'Description (English, optional)'), <textarea className={inputClass} rows={3} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} />)}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {field(getText('Estado', 'Status'), <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as VehicleStatus)}>{options(STATUS_LABELS)}</select>)}
            <label className="flex items-center gap-2 pt-5 text-sm text-gray-600 dark:text-neutral-300">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              {getText('Destacado (sale primero)', 'Featured (shown first)')}
            </label>
            <label className="flex items-center gap-2 pt-5 text-sm text-gray-600 dark:text-neutral-300">
              <input type="checkbox" checked={form.isPubliclyVisible} onChange={(e) => set('isPubliclyVisible', e.target.checked)} />
              {getText('Visible en la página pública', 'Visible on the public page')}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={cancelForm} className={secondaryBtn}>{getText('Cancelar', 'Cancel')}</button>
            <button type="submit" disabled={saving || uploading} className={primaryBtn}>
              {saving ? getText('Guardando…', 'Saving…') : getText('Guardar', 'Save')}
            </button>
          </div>
        </form>
      )}

      {vehicles.length === 0 && !showForm && (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
          {getText('Todavía no has agregado vehículos.', "You haven't added any vehicles yet.")}
        </div>
      )}

      {vehicles.length > 0 && (
        <div className="mb-3 space-y-2">
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={getText('Buscar por marca, modelo, stock o VIN…', 'Search by make, model, stock or VIN…')} className={inputClass} />
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', getText('Todos', 'All'), searched.length],
                ['available', STATUS_LABELS.available[lang], count('available')],
                ['reserved', STATUS_LABELS.reserved[lang], count('reserved')],
                ['sold', STATUS_LABELS.sold[lang], count('sold')],
              ] as ['all' | VehicleStatus, string, number][]
            ).map(([key, text, n]) => (
              <button key={key} type="button" onClick={() => setStatusFilter(key)} aria-pressed={statusFilter === key}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === key
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                    : 'border-gray-300 text-gray-600 dark:border-neutral-700 dark:text-neutral-300'
                }`}>
                {text} ({n})
              </button>
            ))}
          </div>
        </div>
      )}

      {vehicles.length > 0 && shown.length === 0 && (
        <div className={`${cardClass} text-center text-sm text-gray-500 dark:text-neutral-400`}>
          {getText('Ningún vehículo coincide con los filtros.', 'No vehicles match the filters.')}
        </div>
      )}

      <div className="space-y-2">
        {shown.map((v) => (
          <div key={v.id} className={`${cardClass} flex flex-wrap items-start justify-between gap-3`}>
            <div className="flex min-w-0 items-start gap-3">
              {v.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.imageUrl} alt="" className="h-14 w-20 flex-shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl dark:bg-neutral-800" aria-hidden>🚗</div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{[v.year, v.make, v.model, v.trim].filter(Boolean).join(' ')}</span>
                  {v.isDemo && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{getText('Ejemplo', 'Sample')}</span>}
                  {v.featured && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">{getText('Destacado', 'Featured')}</span>}
                  {!v.isPubliclyVisible && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-neutral-800 dark:text-neutral-400">{getText('Oculto', 'Hidden')}</span>}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-neutral-400">
                  {[
                    formatPrice(v.price, currency),
                    v.mileage != null ? `${v.mileage.toLocaleString(lang === 'es' ? 'es-DO' : 'en-US')} ${v.mileageUnit}` : null,
                    label(BODY_LABELS, v.bodyType, lang),
                    v.stockNumber ? `#${v.stockNumber}` : null,
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label={getText('Estado', 'Status')} value={v.status}
                onChange={(e) => changeStatus(v, e.target.value as VehicleStatus)}
                className="min-h-11 rounded-full border border-gray-300 bg-transparent px-3 text-sm dark:border-neutral-700">
                {options(STATUS_LABELS)}
              </select>
              <button type="button" onClick={() => startEdit(v)} className={`${secondaryBtn} min-h-11`}>{getText('Editar', 'Edit')}</button>
              {confirmingDeleteId === v.id ? (
                <>
                  <button type="button" onClick={() => handleDelete(v.id)}
                    className="min-h-11 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                    {getText('Confirmar', 'Confirm')}
                  </button>
                  <button type="button" onClick={() => setConfirmingDeleteId(null)} className={`${secondaryBtn} min-h-11`}>{getText('Cancelar', 'Cancel')}</button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmingDeleteId(v.id)} className={`${secondaryBtn} min-h-11`}>{getText('Eliminar', 'Delete')}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
