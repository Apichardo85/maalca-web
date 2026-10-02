'use client';
// src/components/public/templates/Restaurant.tsx
//
// "La Mesa" — a warm, generous template for restaurants (dine-in/pickup),
// tuned to feel like an invitation rather than a consultation ficha. The
// signature element is a "Destacados" strip right after the hero, surfacing
// the kitchen's own featured/popular picks before the visitor even scrolls
// to the full menu — deliberately distinct from Service's mono rate-card
// index, Barber's ticket-stub cards, and Retail's paint-chip motif.
//
// "Vista Hoy" — defaults the menu to what applies right now (current meal
// period + weekday), computed in the business's OWN timezone via
// Intl.DateTimeFormat (not the visitor's browser clock, not the server's
// unadjusted local time — see resolveNowInTimezone below). Only activates
// when `business.timezone` is set AND at least one item has periods/
// weekDays populated; otherwise the full menu shows with no filter, so a
// business without that data configured never sees a confusing empty view.
import { useEffect, useMemo, useState } from 'react';
import { Inter } from 'next/font/google';
import { deriveBrandPalette, brandPaletteVars } from '@/lib/brand-palette';
import type { ProcessStep, PublicTemplateProps } from '@/lib/templates/registry';
import { useCart } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { resolveWhatsAppDigits, resolveContactItems, resolveDeliveryLinks } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { sanitizeRichText } from '@/lib/sanitize-html';
import { ClampedDescription } from '@/components/public/ClampedDescription';
import { ItemDetailSheet } from '@/components/public/ItemDetailSheet';
import { ScrollStrip } from '@/components/public/ScrollStrip';
import { CONTACT_ICON_BY_TIPO } from '@/components/public/ContactIcons';
import { PublicFooter } from '@/components/public/PublicFooter';
import { PublicGalleryLightbox } from '@/components/public/PublicGalleryLightbox';
import { TableReservationSection, OPEN_TABLE_RESERVATION_EVENT } from '@/components/public/booking/TableReservationSection';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import { formatPrice } from '@/lib/currency';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import { MEAL_PERIOD_LABELS, MEAL_PERIOD_ORDER } from '@/lib/menu-availability';
import { matchesCatalogQuery } from '@/lib/catalog-search';
// Los días del Horario del negocio son claves en español (lunes…domingo), distintas de los
// WeekDay en inglés que usa el menú más abajo — de ahí los alias.
import {
  WEEK_DAY_ORDER as HORARIO_DAY_ORDER,
  WEEK_DAY_LABELS_ES as HORARIO_LABELS_ES,
  WEEK_DAY_LABELS_EN as HORARIO_LABELS_EN,
  getOpenStatus,
  getScheduleTarget,
  hhmmToMinutes,
  todayKeyInTimezone,
  formatHour,
  type OpenStatus,
} from '@/lib/business-hours';
import type { MealPeriod, WeekDay } from '@/lib/types';
import { categoryLabel } from '@/lib/category-label';

// Scoped to this template only. Una sola familia (Inter) con pesos fuertes: el serif cursivo
// anterior se sentía de papelería/invitación, no de pedir comida. Los colores ya no son fijos:
// vienen de las variables --rt-* que calcula deriveBrandPalette() a partir del color primario del
// negocio (ver src/lib/brand-palette.ts) y se fijan en el contenedor raíz de la plantilla.
// El segundo valor de cada var() es el respaldo si la variable no existe.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-restaurant-body' });

const ALL_TAB = '__all__';
const ALL_PERIODS = '__all_periods__';
const MAX_DESTACADOS = 8;

const ACCENT = 'var(--rt-accent, #C1522A)';
const TERRACOTA = 'var(--rt-accent-text, #C1522A)'; // acento como TEXTO sobre fondo claro (contraste garantizado)
const CREMA = 'var(--rt-bg, #FBF3E7)';
const PALMA = '#3A5A40';
const CAFE = 'var(--rt-ink, #2B1D14)';
const MUTED = 'var(--rt-muted, #8A7B6E)';

const FLAG_ICONS: Record<string, string> = {
  vegetarian: '🌱',
  spicy: '🌶️',
  glutenFree: '🌾',
};

const MEAL_PERIOD_LABELS_EN: Record<MealPeriod, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  late_night: 'Late night',
  all_day: 'All day',
};

const WEEK_DAY_LABELS_ES: Record<WeekDay, string> = {
  monday: 'lunes', tuesday: 'martes', wednesday: 'miércoles', thursday: 'jueves',
  friday: 'viernes', saturday: 'sábado', sunday: 'domingo',
};
const WEEK_DAY_LABELS_EN: Record<WeekDay, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

// Cortes POR DEFECTO de los momentos de comida (24h, minutos desde medianoche). Cada negocio
// puede sobreescribir los suyos en Diseñar mi Espacio → Contenido ("Momentos de comida",
// business.mealPeriodHours); lo que no configura cae a estos. late_night cruza medianoche.
const DEFAULT_PERIOD_HOURS: Record<Exclude<MealPeriod, 'all_day'>, { start: number; end: number }> = {
  breakfast: { start: 5 * 60, end: 11 * 60 },
  lunch: { start: 11 * 60, end: 16 * 60 },
  dinner: { start: 16 * 60, end: 22 * 60 },
  late_night: { start: 22 * 60, end: 5 * 60 },
};

type PeriodRanges = Record<Exclude<MealPeriod, 'all_day'>, { start: number; end: number }>;

function hhmmToMin(v: string | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec((v ?? '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h > 23 || min > 59 ? null : h * 60 + min;
}

/** Cortes del negocio sobre los de por defecto (minutos). Un rango inválido o start==end se ignora. */
function resolvePeriodRanges(custom: PublicTemplateProps['business']['mealPeriodHours']): PeriodRanges {
  const out: PeriodRanges = { ...DEFAULT_PERIOD_HOURS };
  if (!custom) return out;
  for (const p of Object.keys(DEFAULT_PERIOD_HOURS) as Array<Exclude<MealPeriod, 'all_day'>>) {
    const start = hhmmToMin(custom[p]?.start);
    const end = hhmmToMin(custom[p]?.end);
    if (start !== null && end !== null && start !== end) out[p] = { start, end };
  }
  return out;
}

const FLAG_LABELS: Record<string, [string, string]> = {
  vegetarian: ['Vegetariano', 'Vegetarian'],
  spicy: ['Picante', 'Spicy'],
  glutenFree: ['Sin gluten', 'Gluten-free'],
};

/** Datos de texto del detalle de un plato (etiquetas, horario/días) — los usan MenuCard y Destacados. */
function itemDetailText(
  item: PublicTemplateProps['items'][number],
  language: 'es' | 'en',
): { tags: string[]; availability: string | null } {
  const t = (es: string, en: string) => (language === 'es' ? es : en);
  const tags = [
    ...(item.featured ? [`⭐ ${t('Destacado', 'Featured')}`] : []),
    ...(item.popular ? [`🔥 ${t('Popular', 'Popular')}`] : []),
    ...(item.flags ?? []).map((f) => `${FLAG_ICONS[f] ?? ''} ${FLAG_LABELS[f] ? t(FLAG_LABELS[f][0], FLAG_LABELS[f][1]) : f}`.trim()),
  ];
  const days = (item.weekDays ?? []).map((d) => (language === 'en' ? WEEK_DAY_LABELS_EN[d] : WEEK_DAY_LABELS_ES[d]));
  const periods = (item.periods ?? []).filter((p) => p !== 'all_day').map((p) => (language === 'en' ? MEAL_PERIOD_LABELS_EN[p] : MEAL_PERIOD_LABELS[p]));
  const availability = [periods.join(', '), days.join(', ')].filter(Boolean).join(' · ') || null;
  return { tags, availability };
}

/**
 * Resolves the current meal period + weekday AS SEEN IN the given IANA
 * timezone — via Intl.DateTimeFormat's `timeZone` option, which correctly
 * handles DST and day boundaries (unlike adding/subtracting a raw UTC
 * offset, which breaks right at midnight). Returns null for an invalid/
 * unsupported timezone string so the caller can fail safe (no filter).
 */
function resolveNowInTimezone(
  timezone: string,
  ranges: PeriodRanges,
  now: Date = new Date(),
): { period: Exclude<MealPeriod, 'all_day'>; weekday: WeekDay } | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'long',
    }).formatToParts(now);

    const hourStr = parts.find((p) => p.type === 'hour')?.value;
    const minuteStr = parts.find((p) => p.type === 'minute')?.value;
    const weekdayStr = parts.find((p) => p.type === 'weekday')?.value;
    if (!hourStr || !minuteStr || !weekdayStr) return null;

    // hour12: false can format midnight as "24" in some environments.
    const totalMin = (Number(hourStr) % 24) * 60 + Number(minuteStr);
    const weekday = weekdayStr.toLowerCase() as WeekDay;

    let period: Exclude<MealPeriod, 'all_day'> = 'late_night';
    for (const [p, range] of Object.entries(ranges) as Array<
      [Exclude<MealPeriod, 'all_day'>, { start: number; end: number }]
    >) {
      const withinRange = range.end > range.start
        ? totalMin >= range.start && totalMin < range.end
        : totalMin >= range.start || totalMin < range.end; // crosses midnight
      if (withinRange) { period = p; break; }
    }

    return { period, weekday };
  } catch {
    return null;
  }
}

/** Momento de comida que corresponde a una hora del día (minutos desde medianoche). */
function periodAtMinutes(totalMin: number, ranges: PeriodRanges): Exclude<MealPeriod, 'all_day'> {
  for (const [p, range] of Object.entries(ranges) as Array<[Exclude<MealPeriod, 'all_day'>, { start: number; end: number }]>) {
    const within = range.end > range.start
      ? totalMin >= range.start && totalMin < range.end
      : totalMin >= range.start || totalMin < range.end;
    if (within) return p;
  }
  return 'late_night';
}

export function RestaurantTemplate({
  business,
  items,
  categories: categoriesProp,
  capabilities,
}: PublicTemplateProps) {
  const accent = business.primary_color ?? '#045AFE';
  const paletteVars = brandPaletteVars(deriveBrandPalette(business.primary_color, business.secondary_color, business.accent_color), 'rt');
  const waRaw = resolveWhatsAppDigits(business);
  const deliveryLinks = resolveDeliveryLinks(business);

  const { cart, addToCart, removeFromCart, cartTotal, cartCount, updateNotes } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  // "Abierto ahora" depende del reloj: se calcula solo en el cliente (así la página cacheada por
  // ISR no se congela en el estado del momento del build ni desajusta la hidratación) y se
  // refresca cada minuto. Sin horario o sin zona horaria queda en null y la barra no se muestra.
  const [openStatus, setOpenStatus] = useState<OpenStatus | null>(null);
  const [todayKey, setTodayKey] = useState<string | null>(null);
  // Día de la semana (monday..sunday, igual que item.weekDays) en la zona del negocio. También
  // solo-cliente por la misma razón: Destacados lo usa para ocultar el plato de otro día sin
  // desajustar la hidratación de la página cacheada.
  const [weekdayNow, setWeekdayNow] = useState<WeekDay | null>(null);
  // Momento de comida actual (desayuno/almuerzo/cena…). Solo-cliente por la misma razón: se usa para
  // ORDENAR (lo del momento primero), no para ocultar nada.
  const [hlOpenId, setHlOpenId] = useState<string | null>(null);
  const [periodNow, setPeriodNow] = useState<Exclude<MealPeriod, 'all_day'> | null>(null);
  const periodRanges = useMemo(() => resolvePeriodRanges(business.mealPeriodHours), [business.mealPeriodHours]);
  useEffect(() => {
    const update = () => {
      setPeriodNow(business.timezone ? resolveNowInTimezone(business.timezone, periodRanges)?.period ?? null : null);
      setOpenStatus(getOpenStatus(business.horario, business.timezone));
      setTodayKey(todayKeyInTimezone(business.timezone));
      setWeekdayNow(business.timezone ? resolveNowInTimezone(business.timezone, periodRanges)?.weekday ?? null : null);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [business.horario, business.timezone, periodRanges]);
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const periodLabel = (p: MealPeriod) => (language === 'en' ? MEAL_PERIOD_LABELS_EN[p] : MEAL_PERIOD_LABELS[p]);

  const categoryNamesBase: string[] =
    categoriesProp.length > 0
      ? [...categoriesProp].sort((a, b) => a.sort_order - b.sort_order).map((c) => c.name)
      : Array.from(new Set(items.map((i) => i.category).filter((c): c is string => !!c)));

  // Vista Hoy — only meaningful if the business has a timezone AND at least
  // one item actually carries periods/weekDays; otherwise there is nothing
  // to filter by, so we skip it entirely rather than show a confusing
  // "everything is hidden" state to a business that never set this up.
  const hasSchedulingData = items.some(
    (i) => (i.periods && i.periods.length > 0) || (i.weekDays && i.weekDays.length > 0),
  );
  const nowInfo = business.timezone ? resolveNowInTimezone(business.timezone, periodRanges) : null;
  const vistaHoyAvailable = Boolean(nowInfo) && hasSchedulingData;

  const [vistaHoyActive, setVistaHoyActive] = useState(vistaHoyAvailable);
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  // Momento elegido a mano (null = automático: sigue la hora real del negocio, minuto a minuto, así
  // una pestaña abierta en el desayuno pasa sola al almuerzo).
  const [periodPick, setPeriodPick] = useState<string | null>(null);
  const setActivePeriod = (key: string) => setPeriodPick(key);

  // Negocio cerrado (con horario y zona configurados): no se pide "para ahora", solo se programa para
  // la próxima apertura. El menú que se muestra pasa a ser el de ESE día y momento (p. ej. cerrado el
  // martes en la noche => el desayuno del miércoles), no el de la hora actual.
  const schedule = getScheduleTarget(openStatus, business.timezone);
  const effWeekday: WeekDay | null = schedule ? (schedule.weekday as WeekDay) : nowInfo?.weekday ?? null;
  const openMin = schedule ? hhmmToMinutes(schedule.opensAt) : null;
  const effPeriod: Exclude<MealPeriod, 'all_day'> | null = schedule && openMin !== null ? periodAtMinutes(openMin, periodRanges) : nowInfo?.period ?? null;
  const activePeriod = periodPick ?? (vistaHoyActive && effPeriod ? effPeriod : ALL_PERIODS);
  const [query, setQuery] = useState('');
  const searchActive = query.trim().length > 0;

  // Prioridad por momento de comida: si el cliente eligió un período, ese; si no, el de ahora.
  // 0 = se sirve en este momento, 1 = sin período (todo el día), 2 = solo en otro momento.
  // El orden es estable (lo demás conserva su orden) y NUNCA oculta: solo pone primero lo del momento.
  const focusPeriod = activePeriod !== ALL_PERIODS ? (activePeriod as MealPeriod) : effPeriod ?? periodNow;
  function periodRank(item: (typeof items)[number]): number {
    if (!focusPeriod || !item.periods || item.periods.length === 0 || item.periods.includes('all_day')) return 1;
    return item.periods.includes(focusPeriod) ? 0 : 2;
  }
  function byPeriod<T extends (typeof items)[number]>(list: T[]): T[] {
    return focusPeriod ? [...list].sort((a, b) => periodRank(a) - periodRank(b)) : list;
  }
  // Las categorías con platos del momento suben (Desayuno primero en la mañana); tabs y listado coinciden.
  const categoryNames: string[] = focusPeriod
    ? [...categoryNamesBase]
        .map((name, index) => {
          const catId = categoriesProp.find((c) => c.name === name)?.id;
          const inCat = items.filter((i) => (catId !== undefined && i.category_id === catId) || i.category === name);
          const best = inCat.length > 0 ? Math.min(...inCat.map(periodRank)) : 1;
          return { name, index, best };
        })
        .sort((a, b) => a.best - b.best || a.index - b.index)
        .map((c) => c.name)
    : categoryNamesBase;

  function clearSearch() {
    setQuery('');
  }

  function clearVistaHoy() {
    setVistaHoyActive(false);
    setPeriodPick(ALL_PERIODS);
  }

  function matchesWeekday(item: (typeof items)[number]): boolean {
    if (!vistaHoyActive || !effWeekday) return true;
    if (!item.weekDays || item.weekDays.length === 0) return true;
    return item.weekDays.includes(effWeekday);
  }

  const availablePeriods = MEAL_PERIOD_ORDER.filter(
    (p): p is Exclude<MealPeriod, 'all_day'> =>
      p !== 'all_day' && items.some((i) => i.periods?.includes(p)),
  );

  // Destacados es "lo mejor de la cocina" PERO vivo: respeta el día y el momento de comida reales del
  // negocio (o los de la próxima apertura si está cerrado). Una sopa que solo se hace los sábados no es
  // el "popular" de un martes, y una cena no aparece primero en el desayuno. Un plato sin días ni
  // períodos aplica siempre. Si nada coincide con este momento, la franja se oculta (no se rellena con
  // platos fuera de horario). El pedido, además, se valida en el servidor.
  const servesNow = (i: (typeof items)[number]) => {
    if (effWeekday && i.weekDays && i.weekDays.length > 0 && !i.weekDays.includes(effWeekday)) return false;
    if (focusPeriod && i.periods && i.periods.length > 0 && !i.periods.includes('all_day') && !i.periods.includes(focusPeriod)) return false;
    return true;
  };
  const destacados = byPeriod(
    items.filter((i) => i.featured || i.popular).filter(servesNow),
  ).slice(0, MAX_DESTACADOS);

  // Menú completo (Vista Hoy apagada): un plato que hoy no se hace sigue visible pero en gris y sin
  // botón de agregar, con la etiqueta de qué días sí. El servidor igual rechaza el pedido.
  function unavailableLabel(item: (typeof items)[number]): string | null {
    const day = effWeekday ?? weekdayNow;
    if (vistaHoyActive || !day) return null;
    if (!item.weekDays || item.weekDays.length === 0 || item.weekDays.includes(day)) return null;
    const names = item.weekDays.map((d) => (language === 'en' ? WEEK_DAY_LABELS_EN[d] : WEEK_DAY_LABELS_ES[d]));
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} ${language === 'en' ? 'and' : 'y'} ${names[names.length - 1]}` : names[0];
    return language === 'en' ? `Only ${list}` : `Solo ${list.toLowerCase()}`;
  }

  function matchesPeriod(item: (typeof items)[number]): boolean {
    if (activePeriod === ALL_PERIODS) return true;
    if (!item.periods || item.periods.length === 0) return true;
    return item.periods.includes(activePeriod as MealPeriod);
  }

  function matchesQuery(item: (typeof items)[number]): boolean {
    return matchesCatalogQuery(query, [item.name, item.nameEn, item.category]);
  }

  function itemsFor(tab: string): typeof items {
    const catId = categoriesProp.find((c) => c.name === tab)?.id;
    const base =
      tab === ALL_TAB
        ? items
        : items.filter(
            (i) => (catId !== undefined && i.category_id === catId) || i.category === tab,
          );
    return byPeriod(base.filter(matchesPeriod).filter(matchesWeekday).filter(matchesQuery));
  }

  // While searching, a per-category breakdown reads as sparse/confusing for a
  // handful of cross-category matches — show one flat matched list instead.
  const groupedForAll: Array<{ categoryName: string; groupItems: typeof items }> =
    searchActive
      ? []
      : categoryNames.length > 0
      ? categoryNames
          .map((name) => ({ categoryName: name, groupItems: itemsFor(name) }))
          .filter((g) => g.groupItems.length > 0)
      : [{ categoryName: '', groupItems: items }];

  const visibleItems = itemsFor(activeTab);

  return (
    <div id="top" className={inter.variable} style={{ minHeight: '100vh', backgroundColor: CREMA, fontFamily: inter.style.fontFamily, ...paletteVars } as React.CSSProperties}>
      {/* ── ESTADO (abierto/cerrado) — pegada arriba mientras se hace scroll ── */}
      <OpenStatusBar status={openStatus} language={language} getText={getText} />

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          height: '380px',
          backgroundColor: accent,
          overflow: 'hidden',
        }}
      >
        {business.cover_image_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.cover_image_url}
              alt=""
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'var(--rt-hero-overlay, rgba(0,0,0,0.55))',
              }}
            />
          </>
        )}

        {/* filo de acento al pie del hero: el color de detalle de la marca */}
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '4px', zIndex: 2, backgroundColor: 'var(--rt-detail, var(--rt-accent, #C1522A))' }} />

        {/* language toggle — top-right corner, clear of the bottom-anchored
            content below and never covered by it at any viewport */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
          <SimpleLanguageToggle variant="dark" />
        </div>

        {/* content anchored bottom-left */}
        <div
          className="mx-auto max-w-public-content"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            padding: '0 32px 48px',
            color: '#fff',
          }}
        >
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              style={{
                display: 'block',
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.2)',
                marginBottom: '12px',
              }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '12px',
              }}
            >
              🍽️
            </div>
          )}

          <h1
            className={inter.className}
            style={{
              margin: 0,
              fontSize: '30px',
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            {business.name}
          </h1>

          {business.address && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              📍 {business.address}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
            {items.length > 0 && (
              <a
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  backgroundColor: accent,
                  border: '1px solid rgba(255,255,255,0.8)',
                  color: 'var(--rt-on-accent, #ffffff)',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {getText('Ordenar', 'Order now')}
              </a>
            )}
            <a
              href="#reservar"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new Event(OPEN_TABLE_RESERVATION_EVENT));
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '44px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.8)',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {getText('Reservar mesa', 'Book a table')}
            </a>
            {deliveryLinks.map((d) => (
              <a
                key={d.tipo}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCanalClick(business.slug, d.tipo, d.canalId)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {getText(`Delivery con ${d.label}`, `Delivery on ${d.label}`)} ↗
              </a>
            ))}
            {business.address && (
              <a
                href={`https://maps.google.com?q=${encodeURIComponent(business.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  minHeight: '44px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.35)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                📍 {getText('Cómo llegar', 'Get directions')}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── DESTACADOS — signature element: featured/popular picks, capped at
          MAX_DESTACADOS and laid out as a single horizontal scroll strip
          (una sola fila; la siguiente tarjeta asoma para indicar que se desliza) ── */}
      {destacados.length > 0 && (
        <section className="mx-auto max-w-public-content" style={{ padding: '24px 24px 0' }}>
          <h2
            className={inter.className}
            style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', color: TERRACOTA }}
          >
            {getText('Destacados', 'Highlights')}
          </h2>
          <ScrollStrip language={language}>
            {destacados.map((item) => {
              const imageUrl = item.imageUrl ?? item.image_url;
              const isPopular = item.popular;
              const destacadoName = language === 'en' && item.nameEn ? item.nameEn : item.name;
              const hlQty = cart.find((e) => e.item.id === item.id)?.qty ?? 0;
              const hlAdd = () => addToCart({
                id: item.id,
                name: destacadoName,
                price: item.price ?? 0,
                image: imageUrl ?? undefined,
              });
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setHlOpenId(item.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHlOpenId(item.id); } }}
                  style={{
                    cursor: 'pointer',
                    flex: '0 0 auto',
                    width: '170px',
                    scrollSnapAlign: 'start',
                    backgroundColor: '#ffffff',
                    border: '0.5px solid var(--rt-border-soft, #ece2d3)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                  }}
                >
                  {imageUrl && (
                    <div style={{ position: 'relative', height: '110px', backgroundColor: 'var(--rt-placeholder, #f2e9db)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={destacadoName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '9999px',
                          backgroundColor: isPopular ? ACCENT : CAFE,
                          color: isPopular ? 'var(--rt-on-accent, #ffffff)' : '#ffffff',
                        }}
                      >
                        {isPopular ? `🔥 ${getText('Popular', 'Popular')}` : `⭐ ${getText('Destacado', 'Featured')}`}
                      </span>
                    </div>
                  )}
                  <div style={{ padding: '8px 10px' }}>
                    {!imageUrl && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginBottom: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '9999px',
                          backgroundColor: isPopular ? ACCENT : CAFE,
                          color: isPopular ? 'var(--rt-on-accent, #ffffff)' : '#ffffff',
                        }}
                      >
                        {isPopular ? `🔥 ${getText('Popular', 'Popular')}` : `⭐ ${getText('Destacado', 'Featured')}`}
                      </span>
                    )}
                    <p className={inter.className} style={{ margin: 0, fontSize: '13px', fontWeight: 800, letterSpacing: '-0.01em', color: CAFE, lineHeight: 1.3 }}>
                      {destacadoName}
                    </p>
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '4px' }}>
                      {item.price != null ? (
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: CAFE }}>
                          {formatPrice(item.price, business.currency)}
                        </p>
                      ) : (
                        <span />
                      )}
                      {hlQty === 0 ? (
                        <button
                          type="button"
                          onClick={hlAdd}
                          aria-label={`${getText('Agregar', 'Add')} ${destacadoName}`}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '9999px',
                            border: 'none',
                            backgroundColor: accent,
                            color: 'var(--rt-on-accent, #ffffff)',
                            fontSize: '20px',
                            fontWeight: 700,
                            lineHeight: 1,
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          +
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`${getText('Quitar', 'Remove')} ${destacadoName}`}
                            style={{ width: '28px', height: '28px', borderRadius: '9999px', border: 'none', backgroundColor: 'var(--rt-placeholder, #f2e9db)', color: CAFE, fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            −
                          </button>
                          <span style={{ minWidth: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: CAFE }}>{hlQty}</span>
                          <button
                            type="button"
                            onClick={hlAdd}
                            aria-label={`${getText('Agregar', 'Add')} ${destacadoName}`}
                            style={{ width: '28px', height: '28px', borderRadius: '9999px', border: 'none', backgroundColor: accent, color: 'var(--rt-on-accent, #ffffff)', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollStrip>
          {(() => {
            const hl = hlOpenId ? destacados.find((d) => d.id === hlOpenId) : undefined;
            if (!hl) return null;
            const txt = itemDetailText(hl, language);
            const hlName = language === 'en' && hl.nameEn ? hl.nameEn : hl.name;
            return (
              <ItemDetailSheet
                open
                onClose={() => setHlOpenId(null)}
                name={hlName}
                description={language === 'en' && hl.descriptionEn ? hl.descriptionEn : hl.description}
                priceLabel={hl.price != null ? formatPrice(hl.price, business.currency) : null}
                imageUrl={hl.imageUrl ?? hl.image_url}
                category={categoryLabel(hl.category, language, business.categoryTranslations)}
                tags={txt.tags}
                availabilityLabel={txt.availability}
                qty={cart.find((e) => e.item.id === hl.id)?.qty ?? 0}
                onAdd={() => addToCart({ id: hl.id, name: hlName, price: hl.price ?? 0, image: (hl.imageUrl ?? hl.image_url) ?? undefined })}
                onRemove={() => removeFromCart(hl.id)}
                accent={accent}
                onAccent="var(--rt-on-accent, #ffffff)"
                textColor={CAFE}
                mutedColor={MUTED}
                language={language}
              />
            );
          })()}
        </section>
      )}

      <AboutSection description={business.description} descriptionEn={business.descriptionEn} maxWidthClassName="max-w-public-content" language={language} />

      {/* ── PASOS ── */}
      <ProcessSection steps={business.processSteps} visible={business.sectionVisibility?.processSteps !== false} accent={accent} getText={getText} />

      {/* ── GALERÍA ── */}
      <GallerySection images={business.galleryImages} visible={business.sectionVisibility?.gallery !== false} accent={accent} getText={getText} />

      {/* ── SEARCH — independent of category tabs so it's still there for a
          business with no categories set up yet ── */}
      {items.length > 0 && (
        <div className="mx-auto max-w-public-content" style={{ padding: '20px 24px 0' }}>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '15px',
                color: MUTED,
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getText('Buscar en el menú...', 'Search the menu...')}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                fontSize: '14px',
                borderRadius: '12px',
                border: '1px solid var(--rt-border, #e8ddc9)',
                backgroundColor: '#ffffff',
                color: CAFE,
                outline: 'none',
              }}
            />
            {searchActive && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={getText('Borrar búsqueda', 'Clear search')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: MUTED,
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── NAV TABS ── */}
      {categoryNames.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backgroundColor: CREMA,
            borderBottom: '1px solid var(--rt-border, #e8ddc9)',
          }}
        >
          <div className="mx-auto max-w-public-content" style={{ padding: '0 24px' }}>
            <div
              className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ display: 'flex', overflowX: 'auto' }}
            >
              {[
                { key: ALL_TAB, label: getText('Todos', 'All') },
                ...categoryNames.map((n) => ({ key: n, label: categoryLabel(n, language, business.categoryTranslations) })),
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flexShrink: 0,
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: activeTab === key ? 600 : 400,
                    color: activeTab === key ? CAFE : MUTED,
                    background: 'none',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: activeTab === key
                      ? `2px solid ${TERRACOTA}`
                      : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PERIOD FILTER ── */}
      {availablePeriods.length > 0 && (
        <div className="mx-auto max-w-public-content" style={{ padding: '16px 24px 0' }}>
          <div
            className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}
          >
            {[
              { key: ALL_PERIODS, label: getText('Todos los horarios', 'All hours') },
              ...availablePeriods.map((p) => ({ key: p, label: periodLabel(p) })),
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActivePeriod(key)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: activePeriod === key ? `1px solid ${ACCENT}` : '1px solid var(--rt-border, #e8ddc9)',
                  backgroundColor: activePeriod === key ? ACCENT : '#ffffff',
                  color: activePeriod === key ? 'var(--rt-on-accent, #ffffff)' : MUTED,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── VISTA HOY BANNER — visible, not tucked away, per the brief ── */}
      {vistaHoyActive && nowInfo && (
        <div className="mx-auto max-w-public-content" style={{ padding: '16px 24px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              backgroundColor: 'var(--rt-accent-soft, rgba(193,82,42,0.08))',
              border: `1px solid ${TERRACOTA}`,
              borderRadius: '12px',
              padding: '10px 16px',
            }}
          >
            <span style={{ fontSize: '13px', color: CAFE, fontWeight: 500 }}>
              {schedule && effPeriod && effWeekday
                ? getText(
                    `Cerrado ahora · mostrando el menú de ${schedule.daysAhead === 0 ? 'hoy' : schedule.daysAhead === 1 ? 'mañana' : 'la próxima apertura'}: ${periodLabel(effPeriod)} · ${WEEK_DAY_LABELS_ES[effWeekday]}`,
                    `Closed now · showing the ${schedule.daysAhead === 0 ? "today's" : schedule.daysAhead === 1 ? "tomorrow's" : 'next opening'} menu: ${periodLabel(effPeriod)} · ${WEEK_DAY_LABELS_EN[effWeekday]}`,
                  )
                : getText(
                    `Mostrando el menú de ahora: ${periodLabel(nowInfo.period)} · ${WEEK_DAY_LABELS_ES[nowInfo.weekday]}`,
                    `Showing today's menu: ${periodLabel(nowInfo.period)} · ${WEEK_DAY_LABELS_EN[nowInfo.weekday]}`,
                  )}
            </span>
            <button
              onClick={clearVistaHoy}
              style={{
                flexShrink: 0,
                background: 'none',
                border: 'none',
                color: TERRACOTA,
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              {getText('Ver menú completo →', 'See full menu →')}
            </button>
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <main id="menu" className="mx-auto max-w-public-content" style={{ padding: '32px 24px', scrollMarginTop: '48px' }}>
        {items.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '48px' }}>🍽️</span>
            <p style={{ marginTop: '16px', fontSize: '14px', color: MUTED }}>
              {getText('El menú estará disponible pronto.', 'The menu will be available soon.')}
            </p>
          </div>
        ) : activeTab === ALL_TAB && !searchActive ? (
          groupedForAll.length === 0 ? (
            <EmptyFilterState getText={getText} vistaHoyActive={vistaHoyActive} onClearVistaHoy={clearVistaHoy} searchActive={searchActive} onClearSearch={clearSearch} />
          ) : (
            groupedForAll.map(({ categoryName, groupItems }) => (
              <div key={categoryName || '__ungrouped__'} style={{ marginBottom: '32px' }}>
                {categoryName && <SectLabel label={categoryLabel(categoryName, language, business.categoryTranslations)} />}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupItems.map((item) => {
                    const cartQty = cart.find(e => e.item.id === item.id)?.qty ?? 0;
                    return (
                      <MenuCard
                        key={item.id}
                        categoryTranslations={business.categoryTranslations}
                        item={item}
                        language={language}
                        accent={accent}
                        cartQty={cartQty}
                        onAdd={() => addToCart({
                          id: item.id,
                          name: language === 'en' && item.nameEn ? item.nameEn : item.name,
                          price: item.price ?? 0,
                          image: item.imageUrl ?? item.image_url ?? undefined,
                        })}
                        onRemove={() => removeFromCart(item.id)}
                        currency={business.currency}
                        unavailableLabel={unavailableLabel(item)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )
        ) : visibleItems.length === 0 ? (
          <EmptyFilterState getText={getText} vistaHoyActive={vistaHoyActive} onClearVistaHoy={clearVistaHoy} searchActive={searchActive} onClearSearch={clearSearch} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleItems.map((item) => {
              const cartQty = cart.find(e => e.item.id === item.id)?.qty ?? 0;
              return (
                <MenuCard
                  key={item.id}
                  categoryTranslations={business.categoryTranslations}
                  item={item}
                  language={language}
                  accent={accent}
                  cartQty={cartQty}
                  onAdd={() => addToCart({
                    id: item.id,
                    name: language === 'en' && item.nameEn ? item.nameEn : item.name,
                    price: item.price ?? 0,
                    image: item.imageUrl ?? item.image_url ?? undefined,
                  })}
                  onRemove={() => removeFromCart(item.id)}
                  currency={business.currency}
                  unavailableLabel={unavailableLabel(item)}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* ── FAQ ── */}
      <FaqSection faq={business.faq} getText={getText} />

      {/* ── RESERVA DE MESA ── deliberadamente NO PublicBookingSection: ver
          TableReservationSection.tsx y docs/audits/business-type-flows-audit.md. */}
      <TableReservationSection slug={business.slug} language={language} accent={business.primary_color} horario={business.horario} timezone={business.timezone} />

      {/* ── HORARIO + CONTACTO — destino del botón "Info" de la barra inferior ── */}
      <div id="info" style={{ scrollMarginTop: '48px' }}>
        <HoursSection horario={business.horario} todayKey={todayKey} language={language} getText={getText} />
        <ContactSection business={business} language={language} />
      </div>

      {/* ── FOOTER ── */}
      <PublicFooter business={business} capabilities={capabilities} language={language} />

      {/* ── CART ── */}
      <WhatsAppCart
        cart={cart}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        cartCount={cartCount}
        whatsappNumber={waRaw ?? ''}
        businessName={business.name}
        taxRate={0}
        slug={business.slug}
        onlinePayments={capabilities.onlinePayments}
        updateNotes={updateNotes}
        restaurantMode
        schedule={
          schedule
            ? (() => {
                const dayEs = (HORARIO_LABELS_ES[schedule.dayKey] ?? schedule.dayKey).toLowerCase();
                const dayEn = HORARIO_LABELS_EN[schedule.dayKey] ?? schedule.dayKey;
                return {
                  dateIso: schedule.dateIso,
                  whenEs: schedule.daysAhead === 0 ? 'hoy' : schedule.daysAhead === 1 ? 'mañana' : `el ${dayEs}`,
                  whenEn: schedule.daysAhead === 0 ? 'today' : schedule.daysAhead === 1 ? 'tomorrow' : dayEn,
                  opensAtLabel: formatHour(schedule.opensAt),
                };
              })()
            : null
        }
        getText={getText}
        isOpen={cartOpen}
        onOpenChange={setCartOpen}
        hideFab
        bottomInset={64}
      />

      {/* Barra de pedido + navegación inferior (móvil): reemplazan al botón flotante genérico. */}
      <CartBar count={cartCount} total={cartTotal} currency={business.currency} accent={accent} hidden={cartOpen} onOpen={() => setCartOpen(true)} getText={getText} />
      <BottomNav cartCount={cartCount} accent={accent} onOpenCart={() => setCartOpen(true)} getText={getText} />
      <div className="sm:hidden" aria-hidden style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function OpenStatusBar({
  status,
  language,
  getText,
}: {
  status: OpenStatus | null;
  language: 'es' | 'en';
  getText: (es: string, en: string) => string;
}) {
  if (!status) return null;

  const dayLabel = (day: string) =>
    (language === 'en' ? HORARIO_LABELS_EN[day] : HORARIO_LABELS_ES[day]) ?? day;

  let dot = PALMA;
  let bg = '#E8F0E6';
  let border = '#cfe0cc';
  let color = '#2E4A34';
  let strong: string;
  let rest = '';

  if (status.state === 'open') {
    strong = getText('Abierto ahora', 'Open now');
    rest = getText(`Cierra a las ${formatHour(status.closesAt)}`, `Closes at ${formatHour(status.closesAt)}`);
  } else if (status.state === 'opening_soon') {
    dot = '#B7791F';
    bg = '#FBF0DC';
    border = '#f0dfba';
    color = '#6B4A12';
    strong = getText('Abre pronto', 'Opening soon');
    rest = getText(`Abre a las ${formatHour(status.opensAt)}`, `Opens at ${formatHour(status.opensAt)}`);
  } else {
    dot = MUTED;
    bg = '#F1E9DD';
    border = 'var(--rt-border, #e8ddc9)';
    color = CAFE;
    strong = getText('Cerrado ahora', 'Closed now');
    const n = status.next;
    if (n) {
      const at = formatHour(n.opensAt);
      rest =
        n.daysAhead === 0
          ? getText(`Abre hoy a las ${at}`, `Opens today at ${at}`)
          : n.daysAhead === 1
            ? getText(`Abre mañana a las ${at}`, `Opens tomorrow at ${at}`)
            : getText(`Abre el ${dayLabel(n.day)} a las ${at}`, `Opens ${dayLabel(n.day)} at ${at}`);
    }
  }

  return (
    <div
      role="status"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minHeight: '40px',
        padding: '8px 16px',
        backgroundColor: bg,
        borderBottom: `1px solid ${border}`,
        color,
        fontSize: '13px',
        textAlign: 'center',
      }}
    >
      <span aria-hidden style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: dot, flexShrink: 0 }} />
      <span style={{ fontWeight: 600 }}>{strong}</span>
      {rest && <span>· {rest}</span>}
    </div>
  );
}

function HoursSection({
  horario,
  todayKey,
  language,
  getText,
}: {
  horario: PublicTemplateProps['business']['horario'];
  todayKey: string | null;
  language: 'es' | 'en';
  getText: (es: string, en: string) => string;
}) {
  const rows = HORARIO_DAY_ORDER.map((day) => ({ day, entry: horario?.find((h) => h.dia === day) })).filter(
    (r): r is { day: string; entry: NonNullable<typeof r.entry> } => Boolean(r.entry),
  );
  if (rows.length === 0) return null;

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '0 24px 32px' }}>
      <h2 className={inter.className} style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', color: TERRACOTA }}>
        {getText('Horario', 'Hours')}
      </h2>
      <div style={{ backgroundColor: '#ffffff', border: '0.5px solid var(--rt-border-soft, #ece2d3)', borderRadius: '12px', padding: '4px 16px' }}>
        {rows.map(({ day, entry }, i) => {
          const isToday = day === todayKey;
          const label = language === 'en' ? HORARIO_LABELS_EN[day] : HORARIO_LABELS_ES[day];
          return (
            <div
              key={day}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '11px 0',
                borderTop: i === 0 ? 'none' : '1px solid var(--rt-border-soft, #f0e8da)',
                fontSize: '14px',
                color: CAFE,
                fontWeight: isToday ? 600 : 400,
              }}
            >
              <span>
                {label}
                {isToday && (
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: TERRACOTA, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {getText('Hoy', 'Today')}
                  </span>
                )}
              </span>
              <span style={{ color: entry.cerrado ? MUTED : CAFE }}>
                {entry.cerrado ? getText('Cerrado', 'Closed') : `${formatHour(entry.abre)} – ${formatHour(entry.cierra)}`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CartBar({
  count,
  total,
  currency,
  accent,
  hidden,
  onOpen,
  getText,
}: {
  count: number;
  total: number;
  currency: PublicTemplateProps['business']['currency'];
  accent: string;
  hidden: boolean;
  onOpen: () => void;
  getText: (es: string, en: string) => string;
}) {
  if (count === 0 || hidden) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={getText(`Ver pedido: ${count} ${count === 1 ? 'artículo' : 'artículos'}`, `View order: ${count} ${count === 1 ? 'item' : 'items'}`)}
      className="fixed left-3 right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
      style={{
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '56px',
        padding: '0 18px',
        border: 'none',
        borderRadius: '14px',
        backgroundColor: CAFE,
        color: '#ffffff',
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: '15px',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,.25)',
      }}
    >
      <span
        style={{
          minWidth: '26px',
          height: '26px',
          padding: '0 6px',
          borderRadius: '9999px',
          backgroundColor: accent,
          color: 'var(--rt-on-accent, #ffffff)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {count}
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>{getText('Ver pedido', 'View order')}</span>
      <span>{formatPrice(total, currency)}</span>
    </button>
  );
}

function BottomNav({
  cartCount,
  accent,
  onOpenCart,
  getText,
}: {
  cartCount: number;
  accent: string;
  onOpenCart: () => void;
  getText: (es: string, en: string) => string;
}) {
  const go = (id: string) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const itemStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    minHeight: '44px',
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: '11px',
    fontWeight: 500,
    color: MUTED,
    textDecoration: 'none',
    cursor: 'pointer',
  };
  const icon = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  return (
    <nav
      aria-label={getText('Navegación principal', 'Main navigation')}
      className="sm:hidden fixed bottom-0 left-0 right-0"
      style={{ zIndex: 80, backgroundColor: '#ffffff', borderTop: '1px solid var(--rt-border, #e8ddc9)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div style={{ height: '64px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <a href="#top" onClick={go('top')} style={itemStyle}>
          <svg {...icon}><path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" /></svg>
          {getText('Inicio', 'Home')}
        </a>
        <a href="#menu" onClick={go('menu')} style={itemStyle}>
          <svg {...icon}><path d="M6 5h12M6 10h12M6 15h12M6 20h8" /></svg>
          {getText('Menú', 'Menu')}
        </a>
        <button type="button" onClick={onOpenCart} style={{ ...itemStyle, position: 'relative', color: cartCount > 0 ? CAFE : MUTED }}>
          <svg {...icon}><path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
          {getText('Pedido', 'Order')}
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                left: 'calc(50% + 6px)',
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                borderRadius: '9999px',
                backgroundColor: accent,
                color: 'var(--rt-on-accent, #ffffff)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
        <a href="#info" onClick={go('info')} style={itemStyle}>
          <svg {...icon}><path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>
          {getText('Info', 'Info')}
        </a>
      </div>
    </nav>
  );
}

function ProcessSection({
  steps,
  visible,
  accent,
  getText,
}: {
  steps?: ProcessStep[] | null;
  visible: boolean;
  accent: string;
  getText: (es: string, en: string) => string;
}) {
  if (!visible || !steps || steps.length === 0) return null;

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '24px 24px 0' }}>
      <h2 className={inter.className} style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', color: TERRACOTA }}>
        {getText('Cómo trabajamos', 'How we work')}
      </h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={`${i}-${step.title}`}
            style={{
              backgroundColor: '#ffffff',
              border: '0.5px solid var(--rt-border-soft, #ece2d3)',
              borderRadius: '14px',
              padding: '16px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '9999px',
                backgroundColor: accent,
                color: 'var(--rt-on-accent, #ffffff)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {i + 1}
            </span>
            <p className={inter.className} style={{ margin: '10px 0 0', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em', color: CAFE }}>
              {step.title}
            </p>
            {step.description && (
              <div
                className="prose-sm whitespace-pre-line [&_h2]:text-[13px] [&_h2]:font-semibold [&_h3]:text-[12px] [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline"
                style={{ margin: '6px 0 0', fontSize: '12px', lineHeight: 1.5, color: MUTED }}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(step.description) }}
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function GallerySection({
  images,
  visible,
  accent,
  getText,
}: {
  images?: string[] | null;
  visible: boolean;
  accent: string;
  getText: (es: string, en: string) => string;
}) {
  if (!visible || !images || images.length === 0) return null;

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '24px 24px 0' }}>
      <h2 className={inter.className} style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.01em', color: TERRACOTA }}>
        {getText('Galería', 'Gallery')}
      </h2>
      <PublicGalleryLightbox images={images} accent={accent} getText={getText} />
    </section>
  );
}

function SectLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <span
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          color: MUTED,
          letterSpacing: '0.08em',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--rt-border, #e8ddc9)' }} />
    </div>
  );
}

function EmptyFilterState({
  getText,
  vistaHoyActive,
  onClearVistaHoy,
  searchActive,
  onClearSearch,
}: {
  getText: (es: string, en: string) => string;
  vistaHoyActive: boolean;
  onClearVistaHoy: () => void;
  searchActive?: boolean;
  onClearSearch?: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 0',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '32px' }}>🍽️</span>
      <p style={{ marginTop: '12px', fontSize: '14px', color: MUTED }}>
        {searchActive
          ? getText('No hay platos que coincidan con tu búsqueda.', 'No dishes match your search.')
          : vistaHoyActive
          ? getText('No hay platos disponibles para este momento.', 'No dishes available right now.')
          : getText('No hay platos para este filtro.', 'No dishes match this filter.')}
      </p>
      {searchActive ? (
        <button
          onClick={onClearSearch}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: TERRACOTA,
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          {getText('Borrar búsqueda', 'Clear search')}
        </button>
      ) : vistaHoyActive && (
        <button
          onClick={onClearVistaHoy}
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: TERRACOTA,
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          {getText('Ver menú completo →', 'See full menu →')}
        </button>
      )}
    </div>
  );
}

function MenuCard({
  item,
  language,
  accent,
  cartQty,
  onAdd,
  onRemove,
  currency,
  unavailableLabel,
  categoryTranslations,
}: {
  unavailableLabel?: string | null;
  categoryTranslations?: PublicTemplateProps['business']['categoryTranslations'];
  item: PublicTemplateProps['items'][number];
  language: 'es' | 'en';
  accent: string;
  cartQty: number;
  onAdd: () => void;
  onRemove: () => void;
  currency?: 'USD' | 'DOP';
}) {
  const imageUrl = item.imageUrl ?? item.image_url;
  const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
  const displayName = language === 'en' && item.nameEn ? item.nameEn : item.name;
  const getText = (es: string, en: string) => (language === 'es' ? es : en);
  const [detailOpen, setDetailOpen] = useState(false);
  const { tags: detailTags, availability: availabilityText } = itemDetailText(item, language);
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  // Sin foto, descripción, etiquetas ni horario, el detalle repetiría lo que ya se ve en la tarjeta.
  const hasDetail = Boolean(imageUrl || description || detailTags.length > 0 || availabilityText);

  // Etiquetas Destacado/Popular: sobre la foto si hay foto; en línea sobre el nombre si no la hay
  // (sin foto no se reserva un cuadro vacío — la tarjeta es solo texto, como en las apps de delivery).
  const badgeEls = (
    <>
      {item.featured && (
        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', backgroundColor: CAFE, color: '#ffffff' }}>
          ⭐ {getText('Destacado', 'Featured')}
        </span>
      )}
      {item.popular && (
        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', backgroundColor: ACCENT, color: 'var(--rt-on-accent, #ffffff)' }}>
          🔥 {getText('Popular', 'Popular')}
        </span>
      )}
    </>
  );
  const hasBadges = Boolean(item.featured || item.popular);
  const badgesOverlay = hasBadges ? (
    <div style={{ position: 'absolute', top: '4px', left: '4px', display: 'flex', gap: '4px' }}>{badgeEls}</div>
  ) : null;

  return (
    <>
    <div
      role={hasDetail ? 'button' : undefined}
      tabIndex={hasDetail ? 0 : undefined}
      onClick={hasDetail ? () => setDetailOpen(true) : undefined}
      onKeyDown={hasDetail ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailOpen(true); } } : undefined}
      style={{
        cursor: hasDetail ? 'pointer' : 'default',
        backgroundColor: '#ffffff',
        border: '0.5px solid var(--rt-border-soft, #ece2d3)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        minHeight: imageUrl ? '120px' : '84px',
        opacity: unavailableLabel ? 0.55 : 1,
        filter: unavailableLabel ? 'grayscale(0.6)' : undefined,
      }}
    >
      {imageUrl && (
        <div style={{ position: 'relative', flexShrink: 0, margin: '8px 0 8px 8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={displayName}
            style={{
              display: 'block',
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: '12px',
            }}
          />
          {badgesOverlay}
        </div>
      )}

      <div
        style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        {/* Name + description */}
        <div>
          {!imageUrl && hasBadges && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>{badgeEls}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <p
              className={inter.className}
              style={{
                margin: 0,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                fontSize: '15px',
                color: CAFE,
                lineHeight: 1.3,
              }}
            >
              {displayName}
            </p>
            {item.flags && item.flags.length > 0 && (
              <div style={{ display: 'flex', gap: '3px' }} title={item.flags.join(', ')}>
                {item.flags.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(58,90,64,0.12)',
                      color: PALMA,
                    }}
                  >
                    {FLAG_ICONS[f] ?? f}
                  </span>
                ))}
              </div>
            )}
          </div>
          {description && (
            <div onClick={stop}>
              <ClampedDescription
                text={description}
                language={language}
                textStyle={{ margin: '4px 0 0', fontSize: '12px', color: MUTED, lineHeight: 1.5 }}
                buttonColor={accent}
                buttonStyle={{ fontSize: '12px' }}
              />
            </div>
          )}
        </div>

        {/* Price + cart controls */}
        <div
          onClick={stop}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            gap: '8px',
          }}
        >
          {item.price != null ? (
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: CAFE }}>
              {formatPrice(item.price, currency)}
            </p>
          ) : (
            <span />
          )}

          {unavailableLabel ? (
            <span style={{ fontSize: '11px', fontWeight: 600, color: MUTED, textAlign: 'right', lineHeight: 1.3 }}>
              {unavailableLabel}
            </span>
          ) : cartQty === 0 ? (
            <button
              onClick={onAdd}
              aria-label={`${getText('Agregar', 'Add')} ${displayName}`}
              style={{
                backgroundColor: accent,
                color: 'var(--rt-on-accent, #ffffff)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              + {getText('Agregar', 'Add')}
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
              }}
            >
              <button
                onClick={onRemove}
                aria-label={`${getText('Quitar', 'Remove')} ${displayName}`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--rt-placeholder, #f2e9db)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: CAFE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  minWidth: '16px',
                  textAlign: 'center',
                  color: CAFE,
                }}
              >
                {cartQty}
              </span>
              <button
                onClick={onAdd}
                aria-label={`${getText('Agregar', 'Add')} ${displayName}`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: accent,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--rt-on-accent, #ffffff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    <ItemDetailSheet
      open={detailOpen}
      onClose={() => setDetailOpen(false)}
      name={displayName}
      description={description}
      priceLabel={item.price != null ? formatPrice(item.price, currency) : null}
      imageUrl={imageUrl}
      category={categoryLabel(item.category, language, categoryTranslations)}
      tags={detailTags}
      unavailableLabel={unavailableLabel}
      availabilityLabel={availabilityText}
      qty={cartQty}
      onAdd={onAdd}
      onRemove={onRemove}
      accent={accent}
      onAccent="var(--rt-on-accent, #ffffff)"
      textColor={CAFE}
      mutedColor={MUTED}
      language={language}
    />
    </>
  );
}

function FaqSection({
  faq,
  getText,
}: {
  faq?: PublicTemplateProps['business']['faq'];
  getText: (es: string, en: string) => string;
}) {
  if (!faq || faq.length === 0) return null;

  return (
    <section className="mx-auto max-w-public-content" style={{ padding: '0 24px 32px' }}>
      <h2 className={inter.className} style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em', color: TERRACOTA }}>
        {getText('Preguntas frecuentes', 'FAQ')}
      </h2>
      <div style={{ borderTop: '1px solid var(--rt-border, #e8ddc9)' }}>
        {faq.map((entry, i) => (
          <details key={`${i}-${entry.question}`} style={{ borderBottom: '1px solid var(--rt-border, #e8ddc9)', padding: '14px 0' }}>
            <summary style={{ cursor: 'pointer', listStyle: 'none', fontWeight: 500, color: CAFE, fontSize: '14px' }}>
              {entry.question}
            </summary>
            <div
              className="prose-sm whitespace-pre-line [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-[13px] [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_a]:underline"
              style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.6, color: MUTED }}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(entry.answer) }}
            />
          </details>
        ))}
      </div>
    </section>
  );
}

function ContactSection({
  business,
  language,
}: {
  business: PublicTemplateProps['business'];
  language: 'es' | 'en';
}) {
  const contacts = resolveContactItems(business, language);

  if (contacts.length === 0) return null;

  return (
    <section style={{ borderTop: '1px solid var(--rt-border, #e8ddc9)' }}>
      <div className="mx-auto max-w-public-content" style={{ padding: '32px 24px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {contacts.map((c) => {
            const Icon = CONTACT_ICON_BY_TIPO[c.tipo];
            return (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCanalClick(business.slug, c.tipo, c.canalId)}
              style={{
                backgroundColor: '#ffffff',
                border: '0.5px solid var(--rt-border-soft, #ece2d3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              {Icon && <span style={{ color: CAFE }}><Icon size={22} /></span>}
              <span
                style={{
                  fontSize: '11px',
                  color: MUTED,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {c.label}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: CAFE,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.value}
              </span>
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
