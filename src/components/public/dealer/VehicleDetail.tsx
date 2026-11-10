'use client';
// src/components/public/dealer/VehicleDetail.tsx
//
// Ficha completa de un vehículo (galería + especificaciones + contacto). Se abre como hoja a pantalla
// completa encima de la vitrina Dealer; la URL pasa a /{slug}/v/{id} (compartible) sin recargar. Si el
// enlace apunta a un vehículo que ya no está público (vendido u oculto) se muestra un aviso amable, no un 404.
// Todo el texto de precio/millaje sale de lib/dealer.ts para que coincida con la tarjeta de la vitrina.
import { useEffect, useState } from 'react';
import type { DealerPublicSettings, PublicVehicle } from '@/lib/templates/registry';
import {
  BODY_LABELS, CONDITION_LABELS, DRIVETRAIN_LABELS, FUEL_LABELS, ORIGIN_LABELS, STATUS_LABELS,
  TRANSMISSION_LABELS, formatMileage, formatVehiclePrices, label, vehicleDescription, vehicleTitle,
  vehicleWhatsAppLink,
} from '@/lib/dealer';
import { FinancingCalculator, InquiryForm, TestDriveForm } from '@/components/public/dealer/LeadForms';

interface Props {
  slug: string;
  isFav: boolean;
  onToggleFav: () => void;
  vehicle: PublicVehicle | null;      // null = el enlace apunta a un vehículo que ya no está público
  lang: 'es' | 'en';
  baseCurrency: 'USD' | 'DOP';
  settings: DealerPublicSettings;
  whatsapp?: string | null;
  businessName: string;
  shareUrl: string;
  accentText: string;
  accentFill: string;
  onAccent: string;
  onClose: () => void;
}

const PAPER = 'var(--dl-bg, #F7F8FA)';
const SURFACE = 'var(--dl-surface, #FFFFFF)';
const BORDER = 'var(--dl-border, #E3E6EC)';
const INK = 'var(--dl-ink, #161A22)';
const MUTED = 'var(--dl-muted, #5B6472)';
const AMBER = 'var(--dl-amber, #B4740E)';
const AMBER_BG = 'var(--dl-amber-bg, #FBF1DF)';

export function VehicleDetail({
  slug, isFav, onToggleFav, vehicle, lang, baseCurrency, settings, whatsapp, businessName, shareUrl, accentText, accentFill, onAccent, onClose,
}: Props) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const [photo, setPhoto] = useState(0);
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState<'testdrive' | 'inquiry' | null>(null);

  // Escape cierra y el fondo no se desplaza mientras la ficha está abierta.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const shell = (children: React.ReactNode) => (
    <div role="dialog" aria-modal="true" aria-label={vehicle ? vehicleTitle(vehicle) : t('Vehículo', 'Vehicle')}
      className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: PAPER, color: INK }}>
      <div className="mx-auto max-w-[1000px] px-4 pb-28 pt-4">
        <button type="button" onClick={onClose} className="mb-4 text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: accentText }}>
          ← {t('Volver al inventario', 'Back to inventory')}
        </button>
        {children}
      </div>
    </div>
  );

  if (!vehicle) {
    return shell(
      <div className="rounded-2xl border p-10 text-center" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
        <p className="text-3xl" aria-hidden>🚗</p>
        <p className="mt-2 font-semibold">{t('Este vehículo ya no está disponible', 'This vehicle is no longer available')}</p>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          {t('Mira el resto del inventario, quizá tenemos algo parecido.', 'Browse the rest of the inventory, we may have something similar.')}
        </p>
      </div>,
    );
  }

  const v = vehicle;
  const title = vehicleTitle(v);
  const images = (v.images && v.images.length > 0 ? v.images : v.imageUrl ? [v.imageUrl] : []).filter(Boolean);
  const current = images[Math.min(photo, Math.max(images.length - 1, 0))];
  const prices = formatVehiclePrices(v.price, baseCurrency, settings);
  const was = v.compareAtPrice && v.compareAtPrice > v.price
    ? formatVehiclePrices(v.compareAtPrice, baseCurrency, settings)[0] : null;
  const description = vehicleDescription(v, lang);
  const reserved = v.status === 'reserved';
  const colors = { accentText, accentFill, onAccent };
  const canFinance = !!settings.financingEnabled && (settings.financingRate ?? null) !== null;

  const specs: Array<[string, string | null]> = [
    [t('Año', 'Year'), String(v.year)],
    [t('Marca', 'Make'), v.make],
    [t('Modelo', 'Model'), v.model],
    [t('Versión', 'Trim'), v.trim ?? null],
    [t('Condición', 'Condition'), label(CONDITION_LABELS, v.condition, lang)],
    [t('Millaje', 'Mileage'), formatMileage(v, settings.mileageUnit, lang)],
    [t('Transmisión', 'Transmission'), label(TRANSMISSION_LABELS, v.transmission, lang)],
    [t('Combustible', 'Fuel'), label(FUEL_LABELS, v.fuelType, lang)],
    [t('Carrocería', 'Body'), label(BODY_LABELS, v.bodyType, lang)],
    [t('Tracción', 'Drivetrain'), label(DRIVETRAIN_LABELS, v.drivetrain, lang)],
    [t('Motor', 'Engine'), v.engine ?? null],
    [t('Color exterior', 'Exterior color'), v.exteriorColor ?? null],
    [t('Color interior', 'Interior color'), v.interiorColor ?? null],
    [t('Puertas', 'Doors'), v.doors != null ? String(v.doors) : null],
    [t('Pasajeros', 'Passengers'), v.passengers != null ? String(v.passengers) : null],
    [t('Procedencia', 'Origin'), label(ORIGIN_LABELS, v.importOrigin, lang)],
    [t('Stock #', 'Stock #'), v.stockNumber ?? null],
  ];

  const message = t(
    `Hola ${businessName}, me interesa el ${title} (${prices.join(' / ')}). ${shareUrl}`,
    `Hi ${businessName}, I'm interested in the ${title} (${prices.join(' / ')}). ${shareUrl}`,
  );
  const waLink = vehicleWhatsAppLink(whatsapp, message);

  async function share() {
    try {
      if (navigator.share) { await navigator.share({ title, url: shareUrl }); return; }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* el usuario canceló el menú de compartir */ }
  }

  return shell(
    <>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Galería */}
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border" style={{ borderColor: BORDER, backgroundColor: BORDER }}>
            {current ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current} alt={`${title} (${photo + 1}/${images.length})`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>🚗</div>
            )}
            {images.length > 1 && (
              <>
                <button type="button" aria-label={t('Foto anterior', 'Previous photo')}
                  onClick={() => setPhoto((p) => (p - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white">‹</button>
                <button type="button" aria-label={t('Foto siguiente', 'Next photo')}
                  onClick={() => setPhoto((p) => (p + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-white">›</button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <ul className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <li key={src + i} className="shrink-0">
                  <button type="button" onClick={() => setPhoto(i)} aria-label={`${t('Foto', 'Photo')} ${i + 1}`}
                    className="h-16 w-20 overflow-hidden rounded-lg border-2"
                    style={{ borderColor: i === photo ? accentFill : BORDER }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Precio + contacto */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {reserved && (
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: AMBER_BG, color: AMBER }}>
                {label(STATUS_LABELS, 'reserved', lang)}
              </span>
            )}
            {v.featured && (
              <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: accentFill, color: onAccent }}>
                {t('Destacado', 'Featured')}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-2xl font-bold leading-tight">{title}</h2>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold" style={{ color: accentText }}>{prices[0]}</span>
            {prices[1] && <span className="text-lg font-medium" style={{ color: MUTED }}>{prices[1]}</span>}
            {was && <span className="text-sm line-through" style={{ color: MUTED }}>{was}</span>}
          </div>
          {reserved && (
            <p className="mt-2 text-sm" style={{ color: AMBER }}>
              {t('Este vehículo está reservado. Escríbenos por si se libera.', 'This vehicle is reserved. Message us in case it frees up.')}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="rounded-xl px-5 py-3 text-sm font-bold"
                style={{ backgroundColor: accentFill, color: onAccent }}>
                {t('Preguntar por WhatsApp', 'Ask on WhatsApp')}
              </a>
            )}
            <button type="button" onClick={onToggleFav} aria-pressed={isFav} className="rounded-xl border px-5 py-3 text-sm font-semibold"
              style={{ borderColor: BORDER, backgroundColor: SURFACE, color: isFav ? accentText : INK }}>
              {isFav ? `♥ ${t('Guardado', 'Saved')}` : `♡ ${t('Guardar', 'Save')}`}
            </button>
            <button type="button" onClick={share} className="rounded-xl border px-5 py-3 text-sm font-semibold"
              style={{ borderColor: BORDER, backgroundColor: SURFACE, color: INK }}>
              {copied ? t('¡Enlace copiado!', 'Link copied!') : t('Compartir', 'Share')}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {settings.testDriveEnabled && (
              <button type="button" aria-expanded={panel === 'testdrive'} onClick={() => setPanel(panel === 'testdrive' ? null : 'testdrive')}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: BORDER, backgroundColor: SURFACE, color: INK }}>
                {t('Prueba de manejo', 'Test drive')}
              </button>
            )}
            <button type="button" aria-expanded={panel === 'inquiry'} onClick={() => setPanel(panel === 'inquiry' ? null : 'inquiry')}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold" style={{ borderColor: BORDER, backgroundColor: SURFACE, color: INK }}>
              {t('Que me contacten', 'Contact me')}
            </button>
          </div>
          {panel === 'testdrive' && <TestDriveForm slug={slug} vehicle={v} lang={lang} colors={colors} whatsapp={whatsapp} />}
          {panel === 'inquiry' && <InquiryForm slug={slug} vehicle={v} lang={lang} colors={colors} />}
        </div>
      </div>

      {canFinance && (
        <FinancingCalculator slug={slug} vehicle={v} baseCurrency={baseCurrency} settings={settings}
          lang={lang} colors={colors} whatsapp={whatsapp} />
      )}

      {/* Especificaciones */}
      <section className="mt-8 rounded-2xl border p-5" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
        <h3 className="text-base font-semibold">{t('Especificaciones', 'Specifications')}</h3>
        <dl className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {specs.filter(([, val]) => !!val).map(([k, val]) => (
            <div key={k} className="flex justify-between gap-4 border-b py-2 text-sm" style={{ borderColor: BORDER }}>
              <dt style={{ color: MUTED }}>{k}</dt>
              <dd className="text-right font-medium">{val}</dd>
            </div>
          ))}
        </dl>
      </section>

      {description && (
        <section className="mt-4 rounded-2xl border p-5" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
          <h3 className="text-base font-semibold">{t('Descripción', 'Description')}</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed" style={{ color: MUTED }}>{description}</p>
        </section>
      )}
    </>,
  );
}
