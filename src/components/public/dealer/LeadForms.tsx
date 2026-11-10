'use client';
// src/components/public/dealer/LeadForms.tsx
//
// Formularios de conversión de la vitrina Dealer (Fase 2): calculadora de financiamiento, prueba de manejo,
// consulta general y "vendo mi carro" (trade-in). Todos publican en /api/public/affiliates/{slug}/dealer-leads
// (VehicleLeadService en el API). El API valida contra la configuración del dueño y calcula la cuota: el
// número que se ve aquí es una estimación en pantalla, no lo que se confía. Colores vía variables --dl-*.
import { useState } from 'react';
import type { DealerPublicSettings, PublicVehicle } from '@/lib/templates/registry';
import { formatPrice } from '@/lib/currency';
import { formatPhoneInput, isValidPhone, normalizePhone, PHONE_INPUT_PROPS } from '@/lib/phone';
import {
  fromPrimary, monthlyPayment, primaryCurrency, toPrimary, vehicleTitle, vehicleWhatsAppLink,
} from '@/lib/dealer';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const SURFACE = 'var(--dl-surface, #FFFFFF)';
const BORDER = 'var(--dl-border, #E3E6EC)';
const INK = 'var(--dl-ink, #161A22)';
const MUTED = 'var(--dl-muted, #5B6472)';

type Lang = 'es' | 'en';
type Currency = 'USD' | 'DOP';
type Kind = 'financing' | 'tradein' | 'inquiry' | 'testdrive';

interface Colors { accentText: string; accentFill: string; onAccent: string }

interface LeadPayload {
  kind: Kind;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  vehicleId?: string;
  downPayment?: number;
  termMonths?: number;
  tradeMake?: string;
  tradeModel?: string;
  tradeYear?: number;
  tradeMileage?: number;
  tradeMileageUnit?: 'km' | 'mi';
  tradeCondition?: string;
  preferredAt?: string;
}

async function postLead(slug: string, payload: LeadPayload, fallback: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/dealer-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => null);
    return { ok: false, error: data?.error?.message ?? fallback };
  } catch {
    return { ok: false, error: fallback };
  }
}

const inputCls = 'w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2';
const inputStyle: React.CSSProperties = { borderColor: BORDER, backgroundColor: SURFACE, color: INK };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium" style={{ color: MUTED }}>{label}</span>
      {children}
    </label>
  );
}

/** Nombre + teléfono/correo + honeypot. El estado vive en el padre para poder validar y enviar. */
interface Contact { name: string; phone: string; email: string; website: string }
const EMPTY_CONTACT: Contact = { name: '', phone: '', email: '', website: '' };

function contactValid(c: Contact): boolean {
  const phoneFilled = c.phone.trim().length > 0;
  return c.name.trim().length > 0
    && (phoneFilled || c.email.trim().length > 0)
    && (!phoneFilled || isValidPhone(c.phone));
}

function ContactFields({ value, onChange, lang }: { value: Contact; onChange: (c: Contact) => void; lang: Lang }) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const phoneFilled = value.phone.trim().length > 0;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={t('Nombre', 'Name')}>
        <input className={inputCls} style={inputStyle} value={value.name} maxLength={100} autoComplete="name"
          onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </Field>
      <Field label={t('Teléfono / WhatsApp', 'Phone / WhatsApp')}>
        <input className={inputCls} style={inputStyle} value={value.phone} {...PHONE_INPUT_PROPS}
          onChange={(e) => onChange({ ...value, phone: formatPhoneInput(e.target.value) })} />
        {phoneFilled && !isValidPhone(value.phone) && (
          <span className="mt-1 block text-xs text-red-600">{t('Escribe 10 dígitos.', 'Enter 10 digits.')}</span>
        )}
      </Field>
      <div className="sm:col-span-2">
        <Field label={t('Correo (opcional si dejas teléfono)', 'Email (optional if you leave a phone)')}>
          <input type="email" className={inputCls} style={inputStyle} value={value.email} maxLength={200} autoComplete="email"
            onChange={(e) => onChange({ ...value, email: e.target.value })} />
        </Field>
      </div>
      {/* Honeypot: un humano no lo ve ni lo llena. */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={value.website}
        onChange={(e) => onChange({ ...value, website: e.target.value })} />
    </div>
  );
}

function contactPayload(c: Contact) {
  return {
    name: c.name.trim(),
    phone: c.phone.trim() ? normalizePhone(c.phone) : undefined,
    email: c.email.trim() || undefined,
  };
}

function SubmitButton({ sending, disabled, children, colors }: { sending: boolean; disabled: boolean; children: React.ReactNode; colors: Colors }) {
  return (
    <button type="submit" disabled={disabled || sending}
      className="rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50"
      style={{ backgroundColor: colors.accentFill, color: colors.onAccent }}>
      {children}
    </button>
  );
}

function DoneBox({ title, body, whatsappHref, lang }: { title: string; body?: string; whatsappHref?: string | null; lang: Lang }) {
  return (
    <div role="status" className="rounded-xl border p-4 text-sm" style={{ borderColor: BORDER, backgroundColor: SURFACE, color: INK }}>
      <p className="font-semibold">✓ {title}</p>
      {body && <p className="mt-1" style={{ color: MUTED }}>{body}</p>}
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline underline-offset-2">
          {lang === 'es' ? 'Escribir por WhatsApp' : 'Message on WhatsApp'}
        </a>
      )}
    </div>
  );
}

/** Estado común de envío: idle -> sending -> done, con el error del API tal cual. */
function useSubmit(slug: string, lang: Lang) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fallback = lang === 'es' ? 'No pudimos enviar tu solicitud. Intenta de nuevo.' : "We couldn't send your request. Please try again.";
  async function send(payload: LeadPayload, honeypot: string) {
    if (honeypot.trim()) { setState('done'); return; } // bot: se finge éxito sin enviar
    setState('sending');
    setError(null);
    const r = await postLead(slug, payload, fallback);
    if (r.ok) setState('done');
    else { setError(r.error); setState('idle'); }
  }
  return { state, error, send };
}

// ── Calculadora de financiamiento ───────────────────────────────────────────────

const DEFAULT_TERMS = [24, 36, 48, 60, 72];
const MAX_DOWN_PCT = 90;

export function FinancingCalculator({ slug, vehicle, baseCurrency, settings, lang, colors, whatsapp }: {
  slug: string;
  vehicle: PublicVehicle;
  baseCurrency: Currency;
  settings: DealerPublicSettings;
  lang: Lang;
  colors: Colors;
  whatsapp?: string | null;
}) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const rate = settings.financingRate ?? 0;
  const terms = settings.financingTerms && settings.financingTerms.length > 0 ? settings.financingTerms : DEFAULT_TERMS;
  const minPct = Math.min(settings.minDownPercent ?? 20, MAX_DOWN_PCT);
  const cur = primaryCurrency(baseCurrency, settings);
  const price = toPrimary(vehicle.price, baseCurrency, settings);

  const [downPct, setDownPct] = useState(Math.min(Math.max(minPct, 20), MAX_DOWN_PCT));
  const [term, setTerm] = useState(terms.includes(60) ? 60 : terms[Math.floor(terms.length / 2)]);
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const { state, error, send } = useSubmit(slug, lang);

  const money = (n: number) => formatPrice(Math.round(n), cur).replace(/\.00$/, '');
  const down = (price * downPct) / 100;
  const monthly = monthlyPayment(price - down, rate, term);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactValid(contact)) return;
    const downBase = Math.round(fromPrimary(down, baseCurrency, settings) * 100) / 100;
    await send({
      kind: 'financing', vehicleId: vehicle.id, downPayment: downBase, termMonths: term, ...contactPayload(contact),
    }, contact.website);
  }

  return (
    <section className="mt-8 rounded-2xl border p-5" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
      <h3 className="text-base font-semibold">{t('Calcula tu cuota', 'Estimate your payment')}</h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm">
              <span style={{ color: MUTED }}>{t('Inicial', 'Down payment')} ({downPct}%)</span>
              <span className="font-semibold">{money(down)}</span>
            </div>
            <input type="range" min={minPct} max={MAX_DOWN_PCT} step={1} value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))} className="mt-2 w-full"
              aria-label={t('Porcentaje de inicial', 'Down payment percentage')} />
            <p className="mt-1 text-xs" style={{ color: MUTED }}>
              {t(`Mínimo ${minPct}% del precio.`, `Minimum ${minPct}% of the price.`)}
            </p>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium" style={{ color: MUTED }}>{t('Plazo', 'Term')}</span>
            <div className="flex flex-wrap gap-2">
              {terms.map((m) => (
                <button key={m} type="button" onClick={() => setTerm(m)} aria-pressed={m === term}
                  className="rounded-lg border px-3 py-1.5 text-sm font-semibold"
                  style={m === term
                    ? { backgroundColor: colors.accentFill, color: colors.onAccent, borderColor: colors.accentFill }
                    : { borderColor: BORDER, color: INK }}>
                  {m} {t('meses', 'mo')}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}` }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>{t('Cuota mensual estimada', 'Estimated monthly payment')}</p>
          <p className="mt-1 text-3xl font-bold" style={{ color: colors.accentText }}>{money(monthly)}</p>
          <p className="mt-2 text-xs" style={{ color: MUTED }}>
            {t('Financiado', 'Financed')}: {money(price - down)} · {rate > 0 ? `${rate}% ${t('anual', 'APR')}` : t('sin interés', '0% interest')}
          </p>
          <p className="mt-2 text-xs" style={{ color: MUTED }}>
            {t('Estimación referencial, sujeta a aprobación.', 'Reference estimate, subject to approval.')}
          </p>
        </div>
      </div>

      {state === 'done' ? (
        <div className="mt-4">
          <DoneBox lang={lang}
            title={t('¡Recibimos tu solicitud!', 'We got your request!')}
            body={t('Un asesor te contactará para continuar con el financiamiento.', 'An advisor will contact you to continue with the financing.')}
            whatsappHref={vehicleWhatsAppLink(whatsapp, t(
              `Hola, acabo de pedir financiamiento para el ${vehicleTitle(vehicle)}.`,
              `Hi, I just requested financing for the ${vehicleTitle(vehicle)}.`,
            ))} />
        </div>
      ) : !open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-4 rounded-xl px-5 py-3 text-sm font-bold"
          style={{ backgroundColor: colors.accentFill, color: colors.onAccent }}>
          {t('Quiero este financiamiento', 'I want this financing')}
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <ContactFields value={contact} onChange={setContact} lang={lang} />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <SubmitButton sending={state === 'sending'} disabled={!contactValid(contact)} colors={colors}>
            {state === 'sending' ? t('Enviando…', 'Sending…') : t('Enviar solicitud', 'Send request')}
          </SubmitButton>
        </form>
      )}
    </section>
  );
}

// ── Prueba de manejo + consulta (paneles de la ficha) ──────────────────────────

export function TestDriveForm({ slug, vehicle, lang, colors, whatsapp }: {
  slug: string; vehicle: PublicVehicle; lang: Lang; colors: Colors; whatsapp?: string | null;
}) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [when, setWhen] = useState('');
  const [notes, setNotes] = useState('');
  const { state, error, send } = useSubmit(slug, lang);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactValid(contact)) return;
    const d = when ? new Date(when) : null;
    await send({
      kind: 'testdrive', vehicleId: vehicle.id, ...contactPayload(contact),
      preferredAt: d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined,
      message: notes.trim() || undefined,
    }, contact.website);
  }

  if (state === 'done') {
    return <DoneBox lang={lang} title={t('¡Prueba de manejo solicitada!', 'Test drive requested!')}
      body={t('Te contactaremos para confirmar el horario.', 'We will contact you to confirm the time.')}
      whatsappHref={vehicleWhatsAppLink(whatsapp, t(`Hola, pedí una prueba de manejo del ${vehicleTitle(vehicle)}.`, `Hi, I requested a test drive of the ${vehicleTitle(vehicle)}.`))} />;
  }
  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border p-4" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
      <p className="text-sm font-semibold">{t('Agenda tu prueba de manejo', 'Book your test drive')}</p>
      <ContactFields value={contact} onChange={setContact} lang={lang} />
      <Field label={t('Fecha y hora preferida (opcional)', 'Preferred date and time (optional)')}>
        <input type="datetime-local" className={inputCls} style={inputStyle} value={when} onChange={(e) => setWhen(e.target.value)} />
      </Field>
      <Field label={t('Comentarios (opcional)', 'Comments (optional)')}>
        <textarea className={inputCls} style={inputStyle} rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <SubmitButton sending={state === 'sending'} disabled={!contactValid(contact)} colors={colors}>
        {state === 'sending' ? t('Enviando…', 'Sending…') : t('Solicitar prueba', 'Request test drive')}
      </SubmitButton>
    </form>
  );
}

export function InquiryForm({ slug, vehicle, lang, colors }: {
  slug: string; vehicle: PublicVehicle; lang: Lang; colors: Colors;
}) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [message, setMessage] = useState('');
  const { state, error, send } = useSubmit(slug, lang);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactValid(contact)) return;
    await send({ kind: 'inquiry', vehicleId: vehicle.id, ...contactPayload(contact), message: message.trim() || undefined }, contact.website);
  }

  if (state === 'done') {
    return <DoneBox lang={lang} title={t('¡Gracias! Recibimos tus datos.', 'Thanks! We got your details.')}
      body={t('Te contactaremos muy pronto.', 'We will contact you very soon.')} />;
  }
  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border p-4" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
      <p className="text-sm font-semibold">{t('Déjanos tus datos y te contactamos', 'Leave your details and we will contact you')}</p>
      <ContactFields value={contact} onChange={setContact} lang={lang} />
      <Field label={t('Mensaje (opcional)', 'Message (optional)')}>
        <textarea className={inputCls} style={inputStyle} rows={2} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <SubmitButton sending={state === 'sending'} disabled={!contactValid(contact)} colors={colors}>
        {state === 'sending' ? t('Enviando…', 'Sending…') : t('Enviar', 'Send')}
      </SubmitButton>
    </form>
  );
}

// ── Vendo mi carro (trade-in) ───────────────────────────────────────────────────

const TRADE_CONDITIONS: Array<[string, string, string]> = [
  ['excellent', 'Excelente', 'Excellent'],
  ['good', 'Bueno', 'Good'],
  ['fair', 'Regular', 'Fair'],
  ['poor', 'Necesita trabajo', 'Needs work'],
];

export function TradeInModal({ slug, settings, lang, colors, whatsapp, businessName, onClose }: {
  slug: string; settings: DealerPublicSettings; lang: Lang; colors: Colors;
  whatsapp?: string | null; businessName: string; onClose: () => void;
}) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const unit = settings.mileageUnit;
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const { state, error, send } = useSubmit(slug, lang);

  const yearNum = Number(year);
  const maxYear = new Date().getFullYear() + 1;
  const valid = contactValid(contact) && make.trim().length > 0 && model.trim().length > 0
    && Number.isInteger(yearNum) && yearNum >= 1950 && yearNum <= maxYear;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const m = mileage.trim() ? Math.round(Number(mileage.replace(/[^\d.]/g, ''))) : NaN;
    await send({
      kind: 'tradein', ...contactPayload(contact),
      tradeMake: make.trim(), tradeModel: model.trim(), tradeYear: yearNum,
      tradeMileage: Number.isFinite(m) ? m : undefined, tradeMileageUnit: Number.isFinite(m) ? unit : undefined,
      tradeCondition: condition || undefined, message: notes.trim() || undefined,
    }, contact.website);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={t('Vende o cambia tu carro', 'Sell or trade in your car')}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-2xl p-5 sm:rounded-2xl"
        style={{ backgroundColor: 'var(--dl-bg, #F7F8FA)', color: INK }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{t('Vende o cambia tu carro', 'Sell or trade in your car')}</h2>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              {t(`Cuéntanos de tu vehículo y ${businessName} te hace una oferta.`, `Tell us about your vehicle and ${businessName} will make you an offer.`)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('Cerrar', 'Close')} className="rounded-full px-3 py-1 text-lg">✕</button>
        </div>

        {state === 'done' ? (
          <div className="mt-4">
            <DoneBox lang={lang} title={t('¡Recibimos los datos de tu vehículo!', 'We got your vehicle details!')}
              body={t('Te contactaremos con una oferta. Si quieres, envíanos fotos por WhatsApp para valorarlo más rápido.', 'We will reach out with an offer. If you like, send us photos on WhatsApp so we can appraise it faster.')}
              whatsappHref={vehicleWhatsAppLink(whatsapp, t(
                `Hola ${businessName}, te escribo por mi ${year} ${make} ${model} que quiero vender/cambiar. Te envío fotos.`,
                `Hi ${businessName}, I'm writing about my ${year} ${make} ${model} that I'd like to sell/trade in. Sending photos.`,
              ))} />
            <button type="button" onClick={onClose} className="mt-3 text-sm font-semibold underline underline-offset-2" style={{ color: colors.accentText }}>
              {t('Cerrar', 'Close')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('Marca', 'Make')}>
                <input className={inputCls} style={inputStyle} value={make} maxLength={60} onChange={(e) => setMake(e.target.value)} />
              </Field>
              <Field label={t('Modelo', 'Model')}>
                <input className={inputCls} style={inputStyle} value={model} maxLength={80} onChange={(e) => setModel(e.target.value)} />
              </Field>
              <Field label={t('Año', 'Year')}>
                <input inputMode="numeric" className={inputCls} style={inputStyle} value={year} maxLength={4}
                  onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} />
              </Field>
              <Field label={`${t('Millaje', 'Mileage')} (${unit})`}>
                <input inputMode="numeric" className={inputCls} style={inputStyle} value={mileage} maxLength={8}
                  onChange={(e) => setMileage(e.target.value.replace(/\D/g, ''))} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t('Estado', 'Condition')}>
                  <select className={inputCls} style={inputStyle} value={condition} onChange={(e) => setCondition(e.target.value)}>
                    <option value="">{t('Selecciona…', 'Select…')}</option>
                    {TRADE_CONDITIONS.map(([v, es, en]) => <option key={v} value={v}>{t(es, en)}</option>)}
                  </select>
                </Field>
              </div>
            </div>
            <ContactFields value={contact} onChange={setContact} lang={lang} />
            <Field label={t('Comentarios (opcional)', 'Comments (optional)')}>
              <textarea className={inputCls} style={inputStyle} rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <SubmitButton sending={state === 'sending'} disabled={!valid} colors={colors}>
              {state === 'sending' ? t('Enviando…', 'Sending…') : t('Quiero mi oferta', 'Get my offer')}
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
