'use client';
// src/components/public/dealer/CompareSheet.tsx
//
// Comparador de hasta 3 vehículos lado a lado. Resalta el mejor valor de precio (menor), año (mayor) y
// millaje (menor, normalizado a la misma unidad) solo cuando hay diferencia real. Las filas vacías en todos
// los vehículos se ocultan. Los textos y el formato salen de lib/dealer.ts, igual que la tarjeta y la ficha.
import { useEffect } from 'react';
import type { DealerPublicSettings, PublicVehicle } from '@/lib/templates/registry';
import {
  BODY_LABELS, CONDITION_LABELS, DRIVETRAIN_LABELS, FUEL_LABELS, ORIGIN_LABELS, TRANSMISSION_LABELS,
  convertMileage, formatMileage, formatVehiclePrices, label, vehicleTitle,
} from '@/lib/dealer';

interface Props {
  vehicles: PublicVehicle[];
  lang: 'es' | 'en';
  baseCurrency: 'USD' | 'DOP';
  settings: DealerPublicSettings;
  accentText: string;
  accentFill: string;
  onAccent: string;
  onRemove: (id: string) => void;
  onOpen: (id: string) => void;
  onClose: () => void;
}

const PAPER = 'var(--dl-bg, #F7F8FA)';
const SURFACE = 'var(--dl-surface, #FFFFFF)';
const BORDER = 'var(--dl-border, #E3E6EC)';
const INK = 'var(--dl-ink, #161A22)';
const MUTED = 'var(--dl-muted, #5B6472)';

interface Row {
  name: string;
  values: Array<string | null>;
  /** Índices ganadores (se marcan con ✓); vacío = sin ganador claro. */
  best?: number[];
}

function bestIndexes(nums: Array<number | null>, prefer: 'min' | 'max'): number[] {
  const present = nums.filter((n): n is number => n != null);
  if (present.length < 2) return [];
  const target = prefer === 'min' ? Math.min(...present) : Math.max(...present);
  if (present.every((n) => n === target)) return [];
  return nums.flatMap((n, i) => (n === target ? [i] : []));
}

export function CompareSheet({
  vehicles, lang, baseCurrency, settings, accentText, accentFill, onAccent, onRemove, onOpen, onClose,
}: Props) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const unit = settings.mileageUnit;
  const rows: Row[] = [
    {
      name: t('Precio', 'Price'),
      values: vehicles.map((v) => formatVehiclePrices(v.price, baseCurrency, settings).join(' / ')),
      best: bestIndexes(vehicles.map((v) => v.price), 'min'),
    },
    { name: t('Año', 'Year'), values: vehicles.map((v) => String(v.year)), best: bestIndexes(vehicles.map((v) => v.year), 'max') },
    {
      name: t('Millaje', 'Mileage'),
      values: vehicles.map((v) => formatMileage(v, unit, lang)),
      best: bestIndexes(vehicles.map((v) => (v.mileage == null ? null : Math.round(convertMileage(v.mileage, v.mileageUnit, unit)))), 'min'),
    },
    { name: t('Condición', 'Condition'), values: vehicles.map((v) => label(CONDITION_LABELS, v.condition, lang)) },
    { name: t('Transmisión', 'Transmission'), values: vehicles.map((v) => label(TRANSMISSION_LABELS, v.transmission, lang)) },
    { name: t('Combustible', 'Fuel'), values: vehicles.map((v) => label(FUEL_LABELS, v.fuelType, lang)) },
    { name: t('Carrocería', 'Body'), values: vehicles.map((v) => label(BODY_LABELS, v.bodyType, lang)) },
    { name: t('Tracción', 'Drivetrain'), values: vehicles.map((v) => label(DRIVETRAIN_LABELS, v.drivetrain, lang)) },
    { name: t('Motor', 'Engine'), values: vehicles.map((v) => v.engine ?? null) },
    { name: t('Color exterior', 'Exterior color'), values: vehicles.map((v) => v.exteriorColor ?? null) },
    { name: t('Color interior', 'Interior color'), values: vehicles.map((v) => v.interiorColor ?? null) },
    { name: t('Pasajeros', 'Passengers'), values: vehicles.map((v) => (v.passengers != null ? String(v.passengers) : null)) },
    { name: t('Procedencia', 'Origin'), values: vehicles.map((v) => label(ORIGIN_LABELS, v.importOrigin, lang)) },
  ].filter((r) => r.values.some(Boolean));

  const cols = `minmax(110px,150px) repeat(${vehicles.length}, minmax(170px,1fr))`;

  return (
    <div role="dialog" aria-modal="true" aria-label={t('Comparar vehículos', 'Compare vehicles')}
      className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: PAPER, color: INK }}>
      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-4">
        <button type="button" onClick={onClose} className="mb-4 text-sm font-semibold underline-offset-2 hover:underline"
          style={{ color: accentText }}>
          ← {t('Volver al inventario', 'Back to inventory')}
        </button>
        <h2 className="text-xl font-bold">{t('Comparar vehículos', 'Compare vehicles')}</h2>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          {t('✓ marca el mejor valor en precio, año y millaje.', '✓ marks the best value for price, year and mileage.')}
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
          <div className="grid min-w-[560px]" style={{ gridTemplateColumns: cols }}>
            <div className="border-b p-3" style={{ borderColor: BORDER }} />
            {vehicles.map((v) => (
              <div key={v.id} className="border-b border-l p-3" style={{ borderColor: BORDER }}>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg" style={{ backgroundColor: BORDER }}>
                  {v.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.imageUrl} alt={vehicleTitle(v)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl" aria-hidden>🚗</div>
                  )}
                  <button type="button" onClick={() => onRemove(v.id)} aria-label={`${t('Quitar', 'Remove')} ${vehicleTitle(v)}`}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/65 px-2 py-0.5 text-xs text-white">✕</button>
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug">{vehicleTitle(v)}</p>
                <button type="button" onClick={() => onOpen(v.id)} className="mt-2 rounded-lg px-3 py-1.5 text-xs font-bold"
                  style={{ backgroundColor: accentFill, color: onAccent }}>
                  {t('Ver ficha', 'View details')}
                </button>
              </div>
            ))}

            {rows.map((r) => (
              <div key={r.name} className="contents">
                <div className="border-b p-3 text-sm" style={{ borderColor: BORDER, color: MUTED }}>{r.name}</div>
                {r.values.map((val, i) => {
                  const win = r.best?.includes(i);
                  return (
                    <div key={i} className="border-b border-l p-3 text-sm" style={{ borderColor: BORDER, fontWeight: win ? 700 : 500, color: win ? accentText : INK }}>
                      {val ?? '—'}{win ? ' ✓' : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
