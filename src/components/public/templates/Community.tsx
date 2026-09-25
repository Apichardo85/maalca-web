'use client';
// src/components/public/templates/Community.tsx
//
// Vitrina pública para MaalCa Comunidad (comedores, bancos de alimentos, causas
// comunitarias) — Fase 2-4 del backlog (WEB-COM-001/002/003/004). Sigue el mismo patrón de
// composición de los otros 3 templates (hero → descripción → bloques propios →
// PublicFooter), pero deliberadamente más simple/institucional: esto no vende un
// producto, muestra impacto real y cómo ayudar.
//
// Identidad visual: usa el azul de marca de MaalCa (--brand-primary en globals.css,
// #045AFE) como acento por defecto — no se definió paleta nueva para este template. Si
// el afiliado configuró su propio primary_color, ese gana (mismo patrón que los otros
// templates: business.primary_color ?? fallback).
//
// Causas / Punto de Entrega / meta de recaudación: esto es contenido real, editable por el
// afiliado desde Dashboard > Contenido (ver ContenidoTab.tsx) — nunca datos de muestra
// fabricados, porque esta plantilla renderiza páginas públicas reales (ej.
// maalca.com/neighborhood-transformation-center). Causas es tabla propia desde 2026-09-25
// (Causa.cs, antes columna JSON) -- se lee via /api/public/affiliates/{slug}/causas.
// "Recaudado este mes" es lo que el afiliado REPORTA a mano (no existe integración de
// donaciones vía Stripe Connect todavía — Fase 3 del backlog), por eso el copy dice
// "Recaudado este mes" y no "en vivo": sería engañoso implicar
// un contador automático que no existe. Eventos/Actividades (2026-09-25) sí se renderiza acá
// ahora ("Próximos eventos") — entidad propia y transversal (Activity.cs, ver registry.ts),
// pero el nav del dashboard que lo alimenta solo está habilitado para Community por ahora.
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { AboutSection } from '@/components/public/AboutSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import { formatPrice } from '@/lib/currency';
import { googleMapsUrl } from '@/lib/maps';

const MAALCA_BLUE = '#045AFE';
const PAPER = '#F7F8FA';
const INK = '#161A22';
const MUTED = '#5B6472';
const GREEN = '#1A8A5C';
const GREEN_BG = '#E8F6EF';
const AMBER = '#B4740E';
const AMBER_BG = '#FBF1DF';
const BLUE_BG = '#E8F0FE';

type Causa = NonNullable<PublicTemplateProps['business']['causas']>[number];
type CommunityImpact = NonNullable<PublicTemplateProps['business']['communityImpact']>;

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

function HeartIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.5-1.5 3-3.2 3-5.5A4.5 4.5 0 0 0 13.5 5 4.5 4.5 0 0 0 5 8.5C5 13 12 19 12 19s3.7-3.1 7-5" />
      <path d="M12 19s-7-6-7-10.5" />
    </svg>
  );
}

function TruckIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="17.5" cy="18" r="1.5" />
    </svg>
  );
}

function CalendarIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

const CAUSA_META: Record<Causa['type'], { icon: typeof HeartIcon; color: string; bg: string; es: string; en: string }> = {
  money: { icon: HeartIcon, color: GREEN, bg: GREEN_BG, es: 'Dinero', en: 'Money' },
  time: { icon: HandsIcon, color: '#2E5BFF', bg: BLUE_BG, es: 'Tiempo', en: 'Time' },
  in_kind: { icon: BoxIcon, color: AMBER, bg: AMBER_BG, es: 'Especie', en: 'In-kind' },
};

function whatsappDonateLink(
  whatsapp: string | null | undefined,
  businessName: string,
  getText: (es: string, en: string) => string,
  causaTitle?: string,
): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/[^\d]/g, '');
  if (!digits) return null;
  // Misma cuenta de WhatsApp del negocio para todas las causas de dinero — no hay Stripe
  // Connect por causa todavia (Fase 3), asi que la causa solo cambia el TEXTO del mensaje
  // para que el afiliado sepa a que quiere destinar la donacion.
  const message = causaTitle
    ? getText(
        `Hola, quiero donar a ${businessName} para: ${causaTitle}`,
        `Hi, I'd like to donate to ${businessName} for: ${causaTitle}`,
      )
    : getText(
        `Hola, quiero donar a ${businessName}`,
        `Hi, I'd like to donate to ${businessName}`,
      );
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Correo directo al negocio para causas de tipo "tiempo" (voluntariado) -- todavia no hay
// un canal de inscripcion propio (ver comentario junto a expandedCausaId mas arriba), asi
// que el mailto lleva un asunto/cuerpo pre-armado que menciona la causa especifica, para que
// el afiliado sepa de inmediato a que se refiere el interesado.
function volunteerMailtoLink(
  email: string,
  businessName: string,
  getText: (es: string, en: string) => string,
  causaTitle: string,
): string {
  const subject = getText(`Voluntariado: ${causaTitle}`, `Volunteering: ${causaTitle}`);
  const body = getText(
    `Hola, quiero ser voluntario/a en ${businessName} para: ${causaTitle}. ¿Como puedo ayudar?`,
    `Hi, I'd like to volunteer with ${businessName} for: ${causaTitle}. How can I help?`,
  );
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function CommunityTemplate({ business, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? MAALCA_BLUE;
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const currency = business.currency ?? 'USD';
  const locale = language === 'es' ? 'es-DO' : 'en-US';

  const metrics = business.communityMetrics;
  const mealsServed = metrics?.mealsServedThisMonth;
  const avgCostPerPlate = metrics?.avgCostPerPlate ?? null;

  const causas = (business.causas ?? []).filter((c) => c.title?.trim());
  const impact: CommunityImpact | null = business.communityImpact ?? null;
  // Ya vienen filtrados a "proximos" y ordenados por fecha desde el endpoint publico (ver
  // getActivities en app/[slug]/page.tsx) -- solo se descarta un titulo vacio, igual que causas.
  const activities = (business.activities ?? []).filter((a) => a.title?.trim());

  // Causas de tipo 'time' (voluntariado) todavia no tienen canal de inscripcion propio --
  // al hacer clic solo se expande la tarjeta para mostrar el contacto del negocio (mismo
  // WhatsApp que Dinero, pero SIN generar un link de donacion: aqui es solo informativo
  // hasta que se decida un canal real de voluntariado).
  const [expandedCausaId, setExpandedCausaId] = useState<string | null>(null);

  // Módulos — no todo trial comunitario acepta donaciones en dinero ni publicó causas/punto de
  // entrega todavía. Clave ausente = visible, mismo default que el resto de sectionVisibility.
  const monetaryDonationsEnabled = business.sectionVisibility?.monetaryDonations ?? true;
  const causasVisible = business.sectionVisibility?.causas ?? true;
  const puntoDeEntregaVisible = business.sectionVisibility?.puntoDeEntrega ?? true;

  const hasFundraisingGoal =
    monetaryDonationsEnabled &&
    impact != null &&
    (impact.fundraisingGoalAmount != null || impact.fundraisingCurrentAmount != null);

  const showCausas = causasVisible && causas.length > 0;
  const showPuntoDeEntrega =
    puntoDeEntregaVisible && !!(impact?.deliverySchedule?.trim() || impact?.deliveryAcceptedItems?.trim() || business.address);

  const donateLink = whatsappDonateLink(business.whatsapp, business.name, getText);

  // Segundo stat del grid: solo si hay algo real que mostrar además de comidas servidas — nunca
  // un número inventado para llenar la cuadrícula. Prioridad: recaudado este mes > causas activas.
  const secondStat =
    monetaryDonationsEnabled && impact?.fundraisingCurrentAmount != null
      ? { value: formatPrice(impact.fundraisingCurrentAmount, currency), label: getText('recaudado este mes', 'raised this month') }
      : causas.length > 0
        ? { value: String(causas.length), label: getText(causas.length === 1 ? 'causa activa' : 'causas activas', causas.length === 1 ? 'active cause' : 'active causes') }
        : null;

  return (
    <div style={{ backgroundColor: PAPER, color: INK, minHeight: '100vh' }} className="font-sans">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: accent }} className="relative overflow-hidden">
        {business.cover_image_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.cover_image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} />
          </>
        )}
        <div className="absolute right-4 top-4 z-10">
          <SimpleLanguageToggle variant="dark" />
        </div>
        <div className="relative z-10 mx-auto max-w-[860px] px-4 pb-12 pt-14 text-center text-white sm:pt-16">
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
            <p className="mt-2 text-sm text-white/80">
              <a
                href={googleMapsUrl(business.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/40 underline-offset-2 hover:decoration-white"
              >
                📍 {business.address}
              </a>
            </p>
          )}
        </div>
      </header>

      <AboutSection
        description={business.description}
        descriptionEn={business.descriptionEn}
        maxWidthClassName="max-w-[860px]"
        language={language}
      />

      {/* ── Métricas de impacto (WEB-COM-002) — grid de 1 o 2 stats, nunca relleno inventado ── */}
      {typeof mealsServed === 'number' && (
        <section className="mx-auto mt-10 max-w-[860px] px-4">
          {/* grid-cols-1 en mobile — un número grande (ej. "$1,240,000.00") no cabe en la
              mitad de una pantalla angosta a la vez que el label; a partir de sm ya hay
              espacio para las 2 tarjetas lado a lado. break-all + text-2xl/3xl responsivo
              son el respaldo para montos igual de largos incluso en la tarjeta completa. */}
          <div className={`grid gap-3 grid-cols-1 ${secondStat ? 'sm:grid-cols-2' : ''}`}>
            <div
              className="rounded-2xl border p-6 text-center"
              style={{ borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' }}
            >
              <p className="break-all text-2xl font-bold sm:text-3xl" style={{ color: accent }}>
                {mealsServed.toLocaleString(locale)}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>
                {getText('Comidas servidas este mes', 'Meals served this month')}
              </p>
            </div>
            {secondStat && (
              <div
                className="rounded-2xl border p-6 text-center"
                style={{ borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' }}
              >
                <p className="break-all text-2xl font-bold sm:text-3xl" style={{ color: accent }}>
                  {secondStat.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>
                  {secondStat.label}
                </p>
              </div>
            )}
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

      {/* ── Calculadora de impacto + meta de recaudación + Donar (WEB-COM-003/004) — todo el
           bloque depende de "monetaryDonations": un comedor sin cuenta de donaciones configurada
           no debe mostrar nada de esto, ni siquiera la meta del mes. */}
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

            {donateLink ? (
              <a
                href={donateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: accent }}
              >
                {getText('Donar ahora', 'Donate now')}
              </a>
            ) : (
              <button
                type="button"
                disabled
                title={getText('Próximamente', 'Coming soon')}
                className="mt-5 w-full cursor-not-allowed rounded-full px-4 py-3 text-sm font-semibold text-white opacity-60"
                style={{ backgroundColor: accent }}
              >
                {getText('Donar — próximamente', 'Donate — coming soon')}
              </button>
            )}
          </div>

          {/* Meta de recaudación — reportada a mano por el afiliado (ver comentario arriba del
               componente). "este mes", nunca "en vivo": sería implicar un contador automático
               que todavía no existe. */}
          {hasFundraisingGoal && (
            <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' }}>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GREEN }} />
                <span className="text-xs font-semibold" style={{ color: GREEN }}>
                  {getText('Recaudado este mes', 'Raised this month')}
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="break-all text-2xl font-bold" style={{ color: INK }}>
                  {formatPrice(impact?.fundraisingCurrentAmount ?? 0, currency)}
                </span>
                {impact?.fundraisingGoalAmount != null && (
                  <span className="text-sm" style={{ color: MUTED }}>
                    {getText('de', 'of')} {formatPrice(impact.fundraisingGoalAmount, currency)} {getText('meta', 'goal')}
                  </span>
                )}
              </div>
              {impact?.fundraisingGoalAmount != null && impact.fundraisingGoalAmount > 0 && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: PAPER }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.round(((impact.fundraisingCurrentAmount ?? 0) / impact.fundraisingGoalAmount) * 100))}%`,
                      backgroundColor: GREEN,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── Causas individuales — dinero/tiempo/especie, tabla propia (Causa.cs, backlog 2026-09-25) ── */}
      {showCausas && (
        <section className="mx-auto mt-10 max-w-[860px] px-4">
          <h2 className="text-lg font-semibold" style={{ color: INK }}>
            {getText('Formas de ayudar', 'Ways to help')}
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {causas.map((causa) => {
              const meta = CAUSA_META[causa.type] ?? CAUSA_META.in_kind;
              const Icon = meta.icon;
              const showProgress = causa.type === 'money' && causa.goalAmount != null && causa.goalAmount > 0;
              const pct = showProgress
                ? Math.min(100, Math.round(((causa.currentAmount ?? 0) / causa.goalAmount!) * 100))
                : null;
              const isExpanded = expandedCausaId === causa.id;

              // Cada causa se puede "accionar" segun su tipo (ver comentario junto a
              // whatsappDonateLink y expandedCausaId mas arriba en este archivo):
              //   - money: WhatsApp del negocio, mismo numero que el boton general de
              //     donar, pero con el texto del mensaje mencionando esta causa.
              //   - in_kind: salta a la seccion "Entrega en persona" (misma pagina).
              //   - time: todavia no hay canal de inscripcion para voluntariado, asi que
              //     solo se expande la tarjeta para mostrar el contacto del negocio.
              const causaDonateLink =
                causa.type === 'money' ? whatsappDonateLink(business.whatsapp, business.name, getText, causa.title) : null;

              const cardBody = (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 flex-shrink-0" style={{ color: meta.color }} />
                    <span className="flex-1 text-sm font-medium" style={{ color: INK }}>{causa.title}</span>
                    <span
                      className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ color: meta.color, backgroundColor: meta.bg }}
                    >
                      {getText(meta.es, meta.en)}
                    </span>
                  </div>
                  {causa.description && (
                    <p className="mt-1.5 text-xs" style={{ color: MUTED }}>{causa.description}</p>
                  )}
                  {pct !== null && (
                    <>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: PAPER }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
                      </div>
                      <p className="mt-1 text-[11px]" style={{ color: MUTED }}>
                        {formatPrice(causa.currentAmount ?? 0, currency)} {getText('de', 'of')} {formatPrice(causa.goalAmount!, currency)}
                      </p>
                    </>
                  )}
                  {causa.type === 'time' && isExpanded && (
                    <div className="mt-2.5 border-t pt-2.5 text-xs" style={{ borderColor: '#E3E6EC', color: MUTED }}>
                      <p>
                        {getText(
                          'Aun no hay un canal de inscripcion para voluntariado — escribe directo al negocio:',
                          "There's no volunteer sign-up channel yet — reach out to the business directly:",
                        )}
                      </p>
                      {business.contactEmail && (
                        <a
                          href={volunteerMailtoLink(business.contactEmail, business.name, getText, causa.title)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 block font-medium underline"
                          style={{ color: INK }}
                        >
                        {business.contactEmail}
                        </a>
                      )}
                      {business.whatsapp && <p className="mt-0.5 font-medium" style={{ color: INK }}>{business.whatsapp}</p>}
                      {!business.whatsapp && !business.contactEmail && (
                        <p className="mt-1">{getText('Contacto no disponible todavia.', 'Contact info not available yet.')}</p>
                      )}
                    </div>
                  )}
                </>
              );

              const cardClassName = 'rounded-xl border p-4 text-left w-full';
              const cardStyle = { borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' } as const;

              if (causa.type === 'money' && causaDonateLink) {
                return (
                  <a key={causa.id} href={causaDonateLink} target="_blank" rel="noopener noreferrer" className={cardClassName} style={cardStyle}>
                    {cardBody}
                  </a>
                );
              }

              if (causa.type === 'in_kind' && showPuntoDeEntrega) {
                return (
                  <a key={causa.id} href="#punto-de-entrega" className={cardClassName} style={cardStyle}>
                    {cardBody}
                  </a>
                );
              }

              if (causa.type === 'time') {
                return (
                  <div
                    key={causa.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedCausaId((id) => (id === causa.id ? null : causa.id))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedCausaId((id) => (id === causa.id ? null : causa.id));
                      }
                    }}
                    className={cardClassName}
                    style={cardStyle}
                  >
                    {cardBody}
                  </div>
                );
              }

              return (
                <div key={causa.id} className="rounded-xl border p-4" style={cardStyle}>
                  {cardBody}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Eventos/Actividades (backlog 2026-09-25) — modulo transversal, ver Activity.cs ── */}
      {activities.length > 0 && (
        <section className="mx-auto mt-10 max-w-[860px] px-4">
          <h2 className="text-lg font-semibold" style={{ color: INK }}>
            {getText('Próximos eventos', 'Upcoming events')}
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {activities.map((activity) => {
              const start = new Date(activity.startsAt);
              const dateLabel = start.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
              const timeLabel = start.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
              // Si "Ends" existe, se agrega al lado de la hora de inicio -- solo la hora si cae
              // el mismo dia que "Starts" (evita repetir la fecha dos veces), fecha completa si no.
              let endLabel = '';
              if (activity.endsAt) {
                const end = new Date(activity.endsAt);
                if (!Number.isNaN(end.getTime())) {
                  const sameDay =
                    start.getFullYear() === end.getFullYear() &&
                    start.getMonth() === end.getMonth() &&
                    start.getDate() === end.getDate();
                  endLabel = sameDay
                    ? end.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
                    : end.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' }) +
                      ' · ' +
                      end.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
                }
              }
              const title = getText(activity.title, activity.titleEn?.trim() || activity.title);
              const description = getText(activity.description ?? '', activity.descriptionEn?.trim() || activity.description || '');
              return (
                <div key={activity.id} className="rounded-xl border p-4" style={{ borderColor: '#E3E6EC', backgroundColor: '#FFFFFF' }}>
                  <div className="flex items-start gap-2.5">
                    <CalendarIcon className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: accent }} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-medium" style={{ color: INK }}>{title}</span>
                        <span className="text-xs font-medium" style={{ color: MUTED }}>
                          {dateLabel} · {timeLabel}
                          {endLabel ? ` – ${endLabel}` : ''}
                        </span>
                      </div>
                      {description && (
                        <p className="mt-1 text-xs" style={{ color: MUTED }}>{description}</p>
                      )}
                      {activity.location && (
                        <p className="mt-1 text-xs" style={{ color: MUTED }}>📍 {activity.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Punto de entrega (Fase 4) — texto libre del afiliado + dirección ya existente ── */}
      {showPuntoDeEntrega && (
        <section id="punto-de-entrega" className="mx-auto mt-10 max-w-[860px] scroll-mt-20 px-4">
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3E6EC' }}>
            <div className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4" style={{ color: MUTED }} />
              <span className="text-sm font-semibold" style={{ color: INK }}>
                {getText('Entrega en persona', 'In-person drop-off')}
              </span>
            </div>
            {impact?.deliverySchedule?.trim() && (
              <p className="mt-2 text-sm" style={{ color: MUTED }}>
                {impact.deliverySchedule}
                {business.address ? (
                  <>
                    {' · '}
                    <a
                      href={googleMapsUrl(business.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: MUTED }}
                    >
                      {business.address}
                    </a>
                  </>
                ) : ''}
              </p>
            )}
            {!impact?.deliverySchedule?.trim() && business.address && (
              <p className="mt-2 text-sm" style={{ color: MUTED }}>
                <a
                  href={googleMapsUrl(business.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: MUTED }}
                >
                  {business.address}
                </a>
              </p>
            )}
            {impact?.deliveryAcceptedItems?.trim() && (
              <p className="mt-1 text-xs" style={{ color: MUTED }}>{impact.deliveryAcceptedItems}</p>
            )}
          </div>
        </section>
      )}

      <div className="h-10" />
      <PublicFooter business={business} capabilities={capabilities} language={language} />
    </div>
  );
}

// Umbrales del tono del mensaje — arbitrarios (no vienen de ningún dato real), solo cambian el
// texto según el monto, nunca la cifra de platos calculada.
const JOKE_TIERS: { min: number; es: string; en: string }[] = [
  { min: 0, es: 'Suficiente para que nadie le pelee a su hermanito la última cucharada.', en: "Enough that nobody has to fight their sibling for the last spoonful." },
  { min: 10, es: 'Eso silencia una barriga rugiente por un buen rato.', en: 'That quiets a growling stomach for a good while.' },
  { min: 20, es: 'Nivel héroe de barrio: nadie se va con hambre.', en: "Neighborhood-hero level: nobody leaves hungry." },
  { min: 40, es: 'Ojo, con esto casi que abres tu propio restaurante pop-up.', en: "Careful, with this you're almost opening your own pop-up restaurant." },
  { min: 80, es: 'El chef ya te está poniendo delantal honorario.', en: 'The chef is already handing you an honorary apron.' },
  { min: 150, es: 'A este ritmo te van a pedir que cuentes chistes en la cena.', en: "At this rate they'll be asking you to tell jokes at dinner." },
];

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

  let tone = JOKE_TIERS[0];
  for (const tier of JOKE_TIERS) {
    if (amount >= tier.min) tone = tier;
  }

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
        . {getText(tone.es, tone.en)}
      </p>
    </div>
  );
}
