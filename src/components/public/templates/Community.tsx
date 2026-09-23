'use client';
// src/components/public/templates/Community.tsx
//
// Vitrina pública para MaalCa Comunidad (comedores, bancos de alimentos, causas
// comunitarias) — Fase 2 del backlog (WEB-COM-001/002/003). Sigue el mismo patrón de
// composición de los otros 3 templates (hero → descripción → bloques propios →
// PublicFooter), pero deliberadamente más simple/institucional: esto no vende un
// producto, muestra impacto real y cómo ayudar.
//
// Identidad visual: usa el azul de marca de MaalCa (--brand-primary en globals.css,
// #045AFE) como acento por defecto — no se definió paleta nueva para este template. Si
// el afiliado configuró su propio primary_color, ese gana (mismo patrón que los otros
// templates: business.primary_color ?? fallback).
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { AboutSection } from '@/components/public/AboutSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import { formatPrice } from '@/lib/currency';

const MAALCA_BLUE = '#045AFE';
const PAPER = '#F7F8FA';
const INK = '#161A22';
const MUTED = '#5B6472';

function BowlIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18a9 9 0 0 1-18 0Z" />
      <path d="M12 3v3" />
    </svg>
  );
}

function HandsIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 11V6a2 2 0 1 1 4 0v4" />
      <path d="M11 10V4a2 2 0 1 1 4 0v7" />
      <path d="M15 10V6a2 2 0 1 1 4 0v7c0 3.9-2.7 7-7 7-2.4 0-4-1-5.5-2.8L3 13.5a1.6 1.6 0 0 1 2.6-1.8L7 13" />
    </svg>
  );
}

function BoxIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8l9 5 9-5Z" />
      <path d="M3 8v9l9 5 9-5V8" />
      <path d="M12 13v9" />
    </svg>
  );
}

export function CommunityTemplate({ business, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? MAALCA_BLUE;
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const currency = business.currency ?? 'USD';

  const metrics = business.communityMetrics;
  const mealsServed = metrics?.mealsServedThisMonth;
  const avgCostPerPlate = metrics?.avgCostPerPlate ?? null;

  // Módulo — no todo trial comunitario acepta donaciones en dinero (ver comentario en
  // registry.ts). Clave ausente = visible, mismo default que el resto de sectionVisibility.
  const monetaryDonationsEnabled = business.sectionVisibility?.monetaryDonations ?? true;

  return (
    <div style={{ backgroundColor: PAPER, color: INK, minHeight: '100vh' }} className="font-sans">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: accent }} className="relative overflow-hidden">
        <div className="absolute right-4 top-4 z-10">
          <SimpleLanguageToggle variant="dark" />
        </div>
        <div className="mx-auto max-w-[860px] px-4 pb-12 pt-14 text-center text-white sm:pt-16">
          {business.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              className="mx-auto mb-5 h-20 w-20 rounded-2xl border-2 border-white/40 bg-white object-contain p-2 shadow-lg"
            />
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
            🤝 {getText('Espacio comunitario', 'Community space')}
          </span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{business.name}</h1>
          {business.address && (
            <p className="mt-2 text-sm text-white/80">📍 {business.address}</p>
          )}
        </div>
      </header>

      <AboutSection
        description={business.description}
        descriptionEn={business.descriptionEn}
        maxWidthClassName="max-w-[860px]"
        language={language}
      />

      {/* ── Métricas de impacto (WEB-COM-002) ───────────────────────────── */}
      {typeof mealsServed === 'number' && (
        <section className="mx-auto mt-10 max-w-[860px] px-4">
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border p-6 text-center sm:flex-row sm:justify-center sm:gap-10"
            style={{ borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' }}
          >
            <div>
              <p className="text-3xl font-bold" style={{ color: accent }}>
                {mealsServed.toLocaleString(language === 'es' ? 'es-DO' : 'en-US')}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>
                {getText('Comidas servidas este mes', 'Meals served this month')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Programas (placeholder estático — Activity todavía no existe) ── */}
      <section className="mx-auto mt-10 max-w-[860px] px-4">
        <h2 className="text-lg font-semibold" style={{ color: INK }}>
          {getText('Cómo trabajamos', 'How we work')}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { Icon: BowlIcon, es: 'Comidas preparadas con lo que tenemos disponible', en: 'Meals prepared from what we have on hand' },
            { Icon: HandsIcon, es: 'Voluntarios que dan su tiempo', en: 'Volunteers who give their time' },
            { Icon: BoxIcon, es: 'Donaciones monetarias y en especie', en: 'Monetary and in-kind donations' },
          ].map(({ Icon, es, en }, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' }}>
              <Icon className="h-6 w-6" style={{ color: accent }} />
              <p className="mt-2 text-sm" style={{ color: MUTED }}>{getText(es, en)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculadora de impacto + Donar (WEB-COM-003) — módulo "monetaryDonations":
           todo el bloque depende de que el afiliado acepte dinero, no solo el botón. Sin esto
           activado, mostrar una calculadora de "cuánto donar" no tiene sentido. */}
      {monetaryDonationsEnabled && (
        <section className="mx-auto mt-10 max-w-[860px] px-4">
          <div className="rounded-2xl border p-5 sm:p-6" style={{ borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' }}>
            <h2 className="text-lg font-semibold" style={{ color: INK }}>
              {getText('Calculadora de impacto', 'Impact calculator')}
            </h2>
            {avgCostPerPlate && avgCostPerPlate > 0 ? (
              <ImpactCalculator accent={accent} costPerPlate={avgCostPerPlate} currency={currency} language={language} getText={getText} />
            ) : (
              <p className="mt-3 text-sm" style={{ color: MUTED }}>
                {getText('Aún no hay datos de costo — vuelve pronto.', "There's no cost data yet — check back soon.")}
              </p>
            )}
            <button
              type="button"
              disabled
              title={getText('Próximamente', 'Coming soon')}
              className="mt-5 w-full cursor-not-allowed rounded-full px-4 py-3 text-sm font-semibold text-white opacity-60"
              style={{ backgroundColor: accent }}
            >
              {getText('Donar — próximamente', 'Donate — coming soon')}
            </button>
          </div>
        </section>
      )}

      <div className="h-10" />
      <PublicFooter business={business} capabilities={capabilities} language={language} />
    </div>
  );
}

function ImpactCalculator({
  accent,
  costPerPlate,
  currency,
  language,
  getText,
}: {
  accent: string;
  costPerPlate: number;
  currency: 'USD' | 'DOP';
  language: 'es' | 'en';
  getText: (es: string, en: string) => string;
}) {
  const min = 5;
  const max = 500;
  const step = 5;
  const [amount, setAmount] = useState(25);

  const plates = Math.max(0, Math.floor(amount / costPerPlate));

  // Mensaje corto según el monto — breve, sin exagerar. Los umbrales son arbitrarios (no
  // vienen de ningún dato real), solo cambian el tono del texto, nunca la cifra de platos.
  const tone =
    amount >= 200
      ? getText('¡Eso es un impacto enorme!', "That's a huge impact!")
      : amount >= 75
        ? getText('Eso alimenta a varias familias.', 'That feeds several families.')
        : getText('Cada plato cuenta.', 'Every plate counts.');

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold" style={{ color: accent }}>
          {formatPrice(amount, currency)}
        </span>
        <span className="text-sm" style={{ color: MUTED }}>
          {getText('monto de donación', 'donation amount')}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-3 w-full accent-current"
        style={{ color: accent }}
        aria-label={getText('Monto de donación', 'Donation amount')}
      />
      <p className="mt-4 text-sm" style={{ color: MUTED }}>
        {getText('Eso son aproximadamente', 'That is approximately')}{' '}
        <span className="font-semibold" style={{ color: INK }}>
          {plates} {getText(plates === 1 ? 'plato servido' : 'platos servidos', plates === 1 ? 'meal served' : 'meals served')}
        </span>
        . {tone}
      </p>
    </div>
  );
}
