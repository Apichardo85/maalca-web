'use client';
// src/components/public/templates/Dealer.tsx
//
// Vitrina pública para autoventas / concesionarios (BusinessType.Dealer). Inventario en tabla propia
// (VehicleListing, ver plans/spec-espacio-dealer.md) y NO el catálogo genérico `items`: llega por
// `business.dealer` = { baseCurrency, settings, vehicles }. El servidor ya quitó vendidos, ocultos y (si el
// dueño lo decidió) reservados; acá solo se filtra/ordena en el cliente y el estado de los filtros vive en
// la URL (?make=toyota&body=suv...) para poder compartir una búsqueda por WhatsApp.
//
// Moneda y millaje los decide el dueño (Configuración del dealer) — toda esa lógica está en lib/dealer.ts.
// Paleta: misma derivación de marca que Community (deriveBrandPalette / deriveDarkBrandPalette); el azul de
// MaalCa es el acento por defecto si el negocio no eligió color.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicTemplateProps, PublicVehicle } from '@/lib/templates/registry';
import { AboutSection } from '@/components/public/AboutSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import PublicThemeToggle from '@/components/public/PublicThemeToggle';
import { googleMapsUrl } from '@/lib/maps';
import { formatHour, getOpenStatus, type OpenStatus } from '@/lib/business-hours';
import { VehicleDetail } from '@/components/public/dealer/VehicleDetail';
import { TradeInModal } from '@/components/public/dealer/LeadForms';
import { CompareSheet } from '@/components/public/dealer/CompareSheet';
import { useDealerFavorites } from '@/components/public/dealer/useDealerFavorites';
import { deriveBrandPalette, deriveDarkBrandPalette, themeVarsCss } from '@/lib/brand-palette';
import {
  BODY_LABELS, CONDITION_LABELS, DEFAULT_DEALER_SETTINGS, EMPTY_FILTERS, FUEL_LABELS, STATUS_LABELS,
  TRANSMISSION_LABELS, activeFilterCount, applyFilters, facetCounts, filtersFromParams, filtersToParams, formatMileage,
  formatVehiclePrices, label, monthlyPayment, ORIGIN_LABELS, primaryCurrency, uniqueValues, vehicleTitle,
  vehicleWhatsAppLink, type VehicleFilters,
} from '@/lib/dealer';

const MAALCA_BLUE = '#045AFE';
const MAX_COMPARE = 3;
const PAPER = 'var(--dl-bg, #F7F8FA)';
const SURFACE = 'var(--dl-surface, #FFFFFF)';
const BORDER = 'var(--dl-border, #E3E6EC)';
const INK = 'var(--dl-ink, #161A22)';
const MUTED = 'var(--dl-muted, #5B6472)';
const AMBER = 'var(--dl-amber, #B4740E)';
const AMBER_BG = 'var(--dl-amber-bg, #FBF1DF)';
// Superficie oscura de marca (barra superior, hero, tapa de las fotos): inkSurface funciona en claro y en
// oscuro, a diferencia de ink, que en modo oscuro es casi blanco y no sirve de fondo bajo texto blanco.
const INK_SURFACE = 'var(--dl-ink-surface, #161A22)';
const WHATSAPP_GREEN = '#16A34A';
// Tintes neutros para las tarjetas sin foto: un grid entero del mismo gris se ve apagado, y variarlo
// por vehículo (siempre el mismo para el mismo id) da sensación de inventario real.
const TINTS = ['#334155', '#3F3F46', '#1E293B', '#44403C', '#3B3B52', '#2C3E2F'];
const tintFor = (id: string) => TINTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];

const inputCls = 'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2';
const inputStyle = { borderColor: BORDER, backgroundColor: SURFACE, color: INK } as const;

function Select({ value, onChange, placeholder, options }: {
  value: string; onChange: (v: string) => void; placeholder: string;
  options: Array<{ value: string; text: string; disabled?: boolean }>;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} aria-label={placeholder}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.text}</option>)}
    </select>
  );
}

export function DealerTemplate({ business, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? MAALCA_BLUE;
  const darkPalette = deriveDarkBrandPalette(business.primary_color, business.secondary_color, business.accent_color, MAALCA_BLUE);
  const lightPalette = deriveBrandPalette(business.primary_color, business.secondary_color, business.accent_color, MAALCA_BLUE);
  const lightAccentHex = /^#[0-9a-fA-F]{3,8}$/.test(accent.trim()) ? accent.trim() : MAALCA_BLUE;
  const themeCss = themeVarsCss(
    'dl-scope',
    {
      'dl-bg': lightPalette.bg, 'dl-surface': lightPalette.surface, 'dl-border': lightPalette.border,
      'dl-ink': lightPalette.ink, 'dl-muted': lightPalette.muted,
      'dl-accent': lightAccentHex, 'dl-accent-text': lightPalette.accentText, 'dl-on-accent': lightPalette.onAccent,
      'dl-amber': '#B4740E', 'dl-amber-bg': '#FBF1DF',
      'dl-ink-surface': lightPalette.inkSurface,
    },
    {
      'dl-bg': darkPalette.bg, 'dl-surface': darkPalette.surface, 'dl-border': darkPalette.border,
      'dl-ink': darkPalette.ink, 'dl-muted': darkPalette.muted,
      'dl-accent': darkPalette.accent, 'dl-accent-text': darkPalette.accentText, 'dl-on-accent': darkPalette.onAccent,
      'dl-amber': '#F2B556', 'dl-amber-bg': 'rgba(242,181,86,0.16)',
      'dl-ink-surface': darkPalette.inkSurface,
    },
  );
  const accentText = `var(--dl-accent-text, ${lightPalette.accentText})`;
  const accentFill = `var(--dl-accent, ${lightAccentHex})`;
  const onAccent = `var(--dl-on-accent, ${lightPalette.onAccent})`;

  const { language } = useSimpleLanguage();
  const lang = language === 'es' ? 'es' : 'en';
  const t = (es: string, en: string) => (lang === 'es' ? es : en);

  const dealer = business.dealer;
  const settings = dealer?.settings ?? DEFAULT_DEALER_SETTINGS;
  const baseCurrency = dealer?.baseCurrency ?? business.currency ?? 'USD';
  const vehicles = useMemo(() => dealer?.vehicles ?? [], [dealer]);

  // ── Filtros en la URL ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<VehicleFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tradeInOpen, setTradeInOpen] = useState(false);
  // Fase 3: favoritos (localStorage por vitrina) y comparador (hasta 3, en memoria).
  const favorites = useDealerFavorites(business.slug);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const toggleCompare = (id: string) =>
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id]));
  const [hydrated, setHydrated] = useState(false);
  // El estado de apertura depende de la hora real del visitante: se calcula en el cliente para no
  // servir desde el SSR un "Abierto" que ya venció.
  const [openStatus, setOpenStatus] = useState<OpenStatus | null>(null);
  useEffect(() => { setOpenStatus(getOpenStatus(business.horario, business.timezone)); }, [business.horario, business.timezone]);

  useEffect(() => {
    setFilters(filtersFromParams(new URLSearchParams(window.location.search)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Solo en la página pública real: en el preview del editor no se toca la URL del panel.
    if (!window.location.pathname.endsWith(`/${business.slug}`)) return;
    const qs = filtersToParams(filters).toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [filters, hydrated, business.slug]);

  // Ficha abierta: /{slug}/v/{id}. Se lee al cargar (enlace compartido) y con atrás/adelante del navegador;
  // abrir/cerrar cambia la URL con pushState, sin recargar. Solo en la página pública real.
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const read = () => {
      const m = window.location.pathname.match(/\/v\/([^/?#]+)\/?$/);
      setOpenId(m ? decodeURIComponent(m[1]) : null);
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const publicPath = `/${business.slug}`;
  const canRoute = typeof window !== 'undefined'
    && (window.location.pathname === publicPath || window.location.pathname.startsWith(`${publicPath}/v/`));
  const openVehicle = (id: string) => {
    if (canRoute) window.history.pushState(null, '', `${publicPath}/v/${id}`);
    setOpenId(id);
  };
  const closeVehicle = () => {
    if (canRoute) window.history.pushState(null, '', filtersToParams(filters).toString() ? `${publicPath}?${filtersToParams(filters).toString()}` : publicPath);
    setOpenId(null);
  };

  useEffect(() => {
    if (compareOpen && compareIds.length < 2) setCompareOpen(false);
  }, [compareOpen, compareIds.length]);

  const patch = (p: Partial<VehicleFilters>) => setFilters((f) => ({ ...f, ...p }));

  const makes = useMemo(() => uniqueValues(vehicles, (v) => v.make), [vehicles]);
  const bodies = useMemo(() => uniqueValues(vehicles, (v) => v.bodyType), [vehicles]);
  const fuels = useMemo(() => uniqueValues(vehicles, (v) => v.fuelType), [vehicles]);
  const transmissions = useMemo(() => uniqueValues(vehicles, (v) => v.transmission), [vehicles]);
  const conditions = useMemo(() => uniqueValues(vehicles, (v) => v.condition), [vehicles]);

  const matched = useMemo(
    () => applyFilters(vehicles, filters, baseCurrency, settings),
    [vehicles, filters, baseCurrency, settings],
  );
  const favCount = useMemo(() => vehicles.filter((v) => favorites.ids.includes(v.id)).length, [vehicles, favorites.ids]);
  const visible = useMemo(
    () => (onlyFavs ? matched.filter((v) => favorites.ids.includes(v.id)) : matched),
    [matched, onlyFavs, favorites.ids],
  );
  const facets = useMemo(() => facetCounts(vehicles, filters, baseCurrency, settings), [vehicles, filters, baseCurrency, settings]);
  const compareVehicles = useMemo(
    () => compareIds.flatMap((id) => vehicles.find((v) => v.id === id) ?? []),
    [compareIds, vehicles],
  );
  // Opción con su conteo; las que dejarían 0 resultados se deshabilitan (salvo la elegida, para poder quitarla).
  const opt = (facet: 'make' | 'body' | 'fuel' | 'transmission' | 'condition', value: string, text: string) => {
    const n = facets[facet][value] ?? 0;
    return { value, text: `${text} (${n})`, disabled: n === 0 && filters[facet] !== value };
  };
  const activeCount = activeFilterCount(filters);
  const priceCurrency = primaryCurrency(baseCurrency, settings);

  return (
    <div style={{ backgroundColor: PAPER, color: INK, minHeight: '100vh' }} className="font-sans dl-scope">
      <style dangerouslySetInnerHTML={{ __html: themeCss }} />

      {/* ── Barra superior: horario, dirección y contacto directo ────────── */}
      {(openStatus || business.address || business.whatsapp) && (
        <div style={{ backgroundColor: INK_SURFACE, color: '#FFFFFF' }}>
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2.5 text-[13px]">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {openStatus && (
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" aria-hidden
                    style={{ backgroundColor: openStatus.state === 'open' ? '#22C55E' : openStatus.state === 'opening_soon' ? '#F59E0B' : '#94A3B8' }} />
                  {openStatus.state === 'open'
                    ? t(`Abierto · cierra ${formatHour(openStatus.closesAt)}`, `Open · closes ${formatHour(openStatus.closesAt)}`)
                    : openStatus.state === 'opening_soon'
                      ? t(`Abre a las ${formatHour(openStatus.opensAt)}`, `Opens at ${formatHour(openStatus.opensAt)}`)
                      : t('Cerrado ahora', 'Closed now')}
                </span>
              )}
              {business.address && (
                <a href={googleMapsUrl(business.address)} target="_blank" rel="noopener noreferrer"
                  className="opacity-85 underline-offset-2 hover:underline hover:opacity-100">
                  {business.address}
                </a>
              )}
            </div>
            {business.whatsapp && (
              <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 font-semibold"
                style={{ backgroundColor: WHATSAPP_GREEN, color: '#FFFFFF' }}>
                <WhatsAppIcon /> {t('Escríbenos', 'Message us')}
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {/* Superficie oscura (no el color de marca a plancha): una autoventa se lee como showroom, y el
          color primario queda para precios, botones y badges, donde sí tiene que resaltar. */}
      <header style={{ backgroundColor: INK_SURFACE, color: '#FFFFFF' }} className="relative overflow-hidden">
        {business.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        )}
        {/* Oscurece hacia la izquierda: el texto se lee aunque la portada sea una foto clara. */}
        <div className="absolute inset-0" aria-hidden
          style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.34) 55%, rgba(0,0,0,0.12) 100%)' }} />
        <div className="absolute inset-x-0 top-0 h-1" aria-hidden style={{ backgroundColor: accentFill }} />
        <div className="absolute right-4 top-5 z-20 flex items-center gap-2">
          <SimpleLanguageToggle variant="dark" spanishFlag={business.spanishFlag} />
          <PublicThemeToggle variant="dark" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1100px] px-4 pb-12 pt-12 sm:pb-14 sm:pt-14">
          {business.logo_url && (
            // Sin recuadro: los logos de autoventa suelen ser horizontales y un cuadro los recorta.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt={business.name}
              className="mb-5 h-14 w-auto max-w-[260px] object-contain object-left sm:h-16" />
          )}
          <span className="inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#FFFFFF' }}>
            {vehicles.length > 0
              ? t(`${vehicles.length} ${vehicles.length === 1 ? 'vehículo disponible' : 'vehículos disponibles'}`,
                  `${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'} available`)
              : t('Inventario en actualización', 'Inventory being updated')}
          </span>
          <h1 className="mt-4 max-w-[760px] text-3xl font-bold leading-[1.1] sm:text-5xl">{business.name}</h1>
          <p className="mt-3 max-w-[560px] text-sm opacity-85 sm:text-base">
            {t('Ficha completa, precio claro y respuesta directa — sin dar vueltas.',
               'Full specs, clear pricing and a direct answer — no runaround.')}
          </p>
        </div>
      </header>

      <AboutSection
        description={business.description}
        descriptionEn={business.descriptionEn}
        maxWidthClassName="max-w-[1100px]"
        language={language}
      />

      {/* ── Buscador + filtros ───────────────────────────────────────────── */}
      {vehicles.length > 0 && (
        <section className="mx-auto mt-8 max-w-[1100px] px-4" aria-label={t('Buscar vehículos', 'Search vehicles')}>
          <div className="flex gap-2">
            <input
              type="search" value={filters.q} onChange={(e) => patch({ q: e.target.value })}
              placeholder={t('Buscar marca, modelo o color…', 'Search make, model or color…')}
              className={inputCls} style={inputStyle}
            />
            <button
              type="button" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}
              className="shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold sm:hidden"
              style={{ borderColor: BORDER, backgroundColor: SURFACE, color: INK }}
            >
              {t('Filtros', 'Filters')}{activeCount > 0 ? ` (${activeCount})` : ''}
            </button>
          </div>

          <div className={`${filtersOpen ? 'grid' : 'hidden'} mt-3 grid-cols-2 gap-2 sm:grid sm:grid-cols-4`}>
            <Select value={filters.make} onChange={(v) => patch({ make: v })} placeholder={t('Marca', 'Make')}
              options={makes.map((m) => opt('make', m, m))} />
            <Select value={filters.body} onChange={(v) => patch({ body: v })} placeholder={t('Tipo', 'Body type')}
              options={bodies.map((b) => opt('body', b, label(BODY_LABELS, b, lang) ?? b))} />
            <Select value={filters.fuel} onChange={(v) => patch({ fuel: v })} placeholder={t('Combustible', 'Fuel')}
              options={fuels.map((f) => opt('fuel', f, label(FUEL_LABELS, f, lang) ?? f))} />
            <Select value={filters.transmission} onChange={(v) => patch({ transmission: v })} placeholder={t('Transmisión', 'Transmission')}
              options={transmissions.map((x) => opt('transmission', x, label(TRANSMISSION_LABELS, x, lang) ?? x))} />
            {conditions.length > 1 && (
              <Select value={filters.condition} onChange={(v) => patch({ condition: v })} placeholder={t('Condición', 'Condition')}
                options={conditions.map((c) => opt('condition', c, label(CONDITION_LABELS, c, lang) ?? c))} />
            )}
            <input inputMode="numeric" value={filters.yearMin} onChange={(e) => patch({ yearMin: e.target.value })}
              placeholder={t('Año desde', 'Year from')} className={inputCls} style={inputStyle} aria-label={t('Año desde', 'Year from')} />
            <input inputMode="numeric" value={filters.priceMin} onChange={(e) => patch({ priceMin: e.target.value })}
              placeholder={`${t('Precio desde', 'Price from')} (${priceCurrency})`} className={inputCls} style={inputStyle}
              aria-label={t('Precio desde', 'Price from')} />
            <input inputMode="numeric" value={filters.priceMax} onChange={(e) => patch({ priceMax: e.target.value })}
              placeholder={`${t('Precio hasta', 'Price to')} (${priceCurrency})`} className={inputCls} style={inputStyle}
              aria-label={t('Precio hasta', 'Price to')} />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm" style={{ color: MUTED }}>
            <span>
              {t(`${visible.length} de ${vehicles.length} vehículos`, `${visible.length} of ${vehicles.length} vehicles`)}
              {activeCount > 0 && (
                <button type="button" onClick={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}
                  className="ml-3 font-semibold underline underline-offset-2" style={{ color: accentText }}>
                  {t('Limpiar filtros', 'Clear filters')}
                </button>
              )}
            </span>
            <div className="flex items-center gap-2">
            {favCount > 0 && (
              <button type="button" onClick={() => setOnlyFavs((o) => !o)} aria-pressed={onlyFavs}
                className="rounded-lg border px-3 py-1.5 text-sm font-semibold"
                style={onlyFavs
                  ? { backgroundColor: accentFill, color: onAccent, borderColor: accentFill }
                  : { borderColor: BORDER, backgroundColor: SURFACE, color: INK }}>
                ♥ {t('Favoritos', 'Favorites')} ({favCount})
              </button>
            )}
            <select value={filters.sort} onChange={(e) => patch({ sort: e.target.value as VehicleFilters['sort'] })}
              className="rounded-lg border px-3 py-1.5 text-sm" style={inputStyle} aria-label={t('Ordenar por', 'Sort by')}>
              <option value="featured">{t('Destacados', 'Featured')}</option>
              <option value="price_asc">{t('Precio: menor a mayor', 'Price: low to high')}</option>
              <option value="price_desc">{t('Precio: mayor a menor', 'Price: high to low')}</option>
              <option value="year_desc">{t('Más nuevos', 'Newest')}</option>
              <option value="mileage_asc">{t('Menor millaje', 'Lowest mileage')}</option>
            </select>
            </div>
          </div>
        </section>
      )}

      {/* ── Inventario ───────────────────────────────────────────────────── */}
      <section className="mx-auto mt-5 max-w-[1100px] px-4">
        {vehicles.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
            <p className="text-3xl">🚗</p>
            <p className="mt-2 font-semibold">{t('Estamos actualizando el inventario', 'We are updating our inventory')}</p>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              {t('Escríbenos y te decimos qué tenemos disponible.', 'Message us and we will tell you what we have available.')}
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center" style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
            <p className="font-semibold">
              {onlyFavs ? t('Ninguno de tus favoritos coincide con estos filtros', 'None of your favorites match these filters')
                : t('Ningún vehículo coincide con tu búsqueda', 'No vehicles match your search')}
            </p>
            {onlyFavs && (
              <button type="button" onClick={() => setOnlyFavs(false)} className="mt-3 mr-4 text-sm font-semibold underline underline-offset-2"
                style={{ color: accentText }}>
                {t('Ver todos', 'Show all')}
              </button>
            )}
            <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="mt-3 text-sm font-semibold underline underline-offset-2"
              style={{ color: accentText }}>
              {t('Limpiar filtros', 'Clear filters')}
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((v) => (
              <li key={v.id}>
                <VehicleCard
                  v={v} slug={business.slug} onOpen={openVehicle} lang={lang} baseCurrency={baseCurrency} settings={settings}
                  whatsapp={business.whatsapp} businessName={business.name}
                  fav={favorites.has(v.id)} onFav={() => favorites.toggle(v.id)}
                  compared={compareIds.includes(v.id)} compareFull={compareIds.length >= MAX_COMPARE} onCompare={() => toggleCompare(v.id)}
                  accentText={accentText} accentFill={accentFill} onAccent={onAccent}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {settings.tradeInEnabled && (
        <section className="mx-auto mt-8 max-w-[1100px] px-4" aria-label={t('Vende o cambia tu carro', 'Sell or trade in your car')}>
          <div className="flex flex-col items-start gap-3 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: BORDER, backgroundColor: SURFACE }}>
            <div>
              <h2 className="text-lg font-bold">{t('¿Quieres vender o cambiar tu carro?', 'Want to sell or trade in your car?')}</h2>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                {t('Dinos qué tienes y te hacemos una oferta, sin compromiso.', 'Tell us what you have and we will make you an offer, no obligation.')}
              </p>
            </div>
            <button type="button" onClick={() => setTradeInOpen(true)} className="shrink-0 rounded-xl px-5 py-3 text-sm font-bold"
              style={{ backgroundColor: accentFill, color: onAccent }}>
              {t('Quiero mi oferta', 'Get my offer')}
            </button>
          </div>
        </section>
      )}

      {tradeInOpen && (
        <TradeInModal slug={business.slug} settings={settings} lang={lang} colors={{ accentText, accentFill, onAccent }}
          whatsapp={business.whatsapp} businessName={business.name} onClose={() => setTradeInOpen(false)} />
      )}

      {compareVehicles.length > 0 && !openId && !compareOpen && (
        <div role="region" aria-label={t('Comparador', 'Comparison')}
          className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-[560px] items-center gap-3 rounded-2xl border p-3 shadow-xl"
          style={{ borderColor: BORDER, backgroundColor: SURFACE, color: INK }}>
          <ul className="flex flex-1 gap-2 overflow-hidden">
            {compareVehicles.map((v) => (
              <li key={v.id} className="h-11 w-14 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: BORDER }} title={vehicleTitle(v)}>
                {v.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.imageUrl} alt={vehicleTitle(v)} className="h-full w-full object-cover" />
                )}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setCompareIds([])} className="text-xs font-semibold underline underline-offset-2" style={{ color: MUTED }}>
            {t('Limpiar', 'Clear')}
          </button>
          <button type="button" disabled={compareVehicles.length < 2} onClick={() => setCompareOpen(true)}
            className="rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50" style={{ backgroundColor: accentFill, color: onAccent }}>
            {compareVehicles.length < 2 ? t('Elige otro', 'Pick another') : `${t('Comparar', 'Compare')} (${compareVehicles.length})`}
          </button>
        </div>
      )}

      {compareOpen && compareVehicles.length >= 2 && (
        <CompareSheet
          vehicles={compareVehicles} lang={lang} baseCurrency={baseCurrency} settings={settings}
          accentText={accentText} accentFill={accentFill} onAccent={onAccent}
          onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
          onOpen={(id) => { setCompareOpen(false); openVehicle(id); }}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {openId && (
        <VehicleDetail
          slug={business.slug}
          isFav={favorites.has(openId)} onToggleFav={() => favorites.toggle(openId)}
          vehicle={vehicles.find((x) => x.id === openId) ?? null}
          lang={lang} baseCurrency={baseCurrency} settings={settings}
          whatsapp={business.whatsapp} businessName={business.name}
          shareUrl={`https://maalca.com/${business.slug}/v/${openId}`}
          accentText={accentText} accentFill={accentFill} onAccent={onAccent}
          onClose={closeVehicle}
        />
      )}

      <div className="h-10" />
      <PublicFooter business={business} capabilities={capabilities} language={language} />
    </div>
  );
}

function VehicleCard({ v, slug, onOpen, lang, baseCurrency, settings, accentText, accentFill, onAccent, fav, onFav, compared, compareFull, onCompare, whatsapp, businessName }: {
  v: PublicVehicle; slug: string; onOpen: (id: string) => void; lang: 'es' | 'en';
  fav: boolean; onFav: () => void; compared: boolean; compareFull: boolean; onCompare: () => void;
  baseCurrency: 'USD' | 'DOP'; settings: typeof DEFAULT_DEALER_SETTINGS;
  accentText: string; accentFill: string; onAccent: string;
  whatsapp?: string | null; businessName: string;
}) {
  const t = (es: string, en: string) => (lang === 'es' ? es : en);
  const prices = formatVehiclePrices(v.price, baseCurrency, settings);
  const was = v.compareAtPrice && v.compareAtPrice > v.price ? formatVehiclePrices(v.compareAtPrice, baseCurrency, settings)[0] : null;
  const mileage = formatMileage(v, settings.mileageUnit, lang);
  const reserved = v.status === 'reserved';
  const specs = [
    mileage,
    label(TRANSMISSION_LABELS, v.transmission, lang),
    label(FUEL_LABELS, v.fuelType, lang),
    label(BODY_LABELS, v.bodyType, lang),
  ].filter(Boolean) as string[];
  const origin = label(ORIGIN_LABELS, v.importOrigin, lang);
  const photoCount = v.images?.length ?? (v.imageUrl ? 1 : 0);
  // "Desde X/mes": la cuota más baja que ofrece el dueño — enganche mínimo y el plazo más largo.
  // Mismos parámetros que la calculadora de la ficha, para que no muestren números distintos.
  const terms = settings.financingTerms?.length ? settings.financingTerms : [60];
  const monthly = settings.financingEnabled
    ? monthlyPayment(v.price * (1 - Math.min(settings.minDownPercent ?? 20, 90) / 100), settings.financingRate ?? 0, Math.max(...terms))
    : 0;
  const monthlyLabel = monthly > 0 ? formatVehiclePrices(monthly, baseCurrency, settings)[0] : null;
  const waLink = vehicleWhatsAppLink(
    whatsapp,
    t(`Hola ${businessName}, me interesa el ${vehicleTitle(v)}. ¿Está disponible?`,
      `Hi ${businessName}, I'm interested in the ${vehicleTitle(v)}. Is it available?`),
  );

  return (
    <div className="relative">
    <Link
      href={`/${slug}/v/${v.id}`}
      onClick={(e) => {
        // Clic normal abre la ficha sin recargar; ctrl/cmd/clic medio siguen abriendo la pestaña nueva.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(v.id);
      }}
      className="group block overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg"
      style={{ borderColor: BORDER, backgroundColor: SURFACE }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: v.imageUrl ? INK_SURFACE : tintFor(v.id) }}>
        {v.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.imageUrl} alt={vehicleTitle(v)} loading="lazy"
            className={`h-full w-full object-cover transition-transform group-hover:scale-[1.03] ${reserved ? 'opacity-80' : ''}`} />
        ) : (
          // Sin foto: silueta sobre la superficie oscura. Un emoji a tamaño grande abarata la vitrina.
          <div className="flex h-full w-full items-center justify-center"><CarSilhouette /></div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {v.featured && (
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: accentFill, color: onAccent }}>
              {t('Destacado', 'Featured')}
            </span>
          )}
          {reserved && (
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: AMBER_BG, color: AMBER }}>
              {label(STATUS_LABELS, 'reserved', lang)}
            </span>
          )}
          {v.condition !== 'used' && (
            <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              {label(CONDITION_LABELS, v.condition, lang)}
            </span>
          )}
        </div>
        {origin && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">
            {origin}
          </span>
        )}
        {photoCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/65 px-2 py-1 text-[11px] font-semibold text-white">
            {t(`${photoCount} fotos`, `${photoCount} photos`)}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-snug">{vehicleTitle(v)}</h3>
        {specs.length > 0 && <p className="mt-1 text-xs" style={{ color: MUTED }}>{specs.join(' · ')}</p>}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="text-xl font-bold" style={{ color: accentText }}>{prices[0]}</span>
          {prices[1] && <span className="text-sm font-medium" style={{ color: MUTED }}>{prices[1]}</span>}
          {was && <span className="text-xs line-through" style={{ color: MUTED }}>{was}</span>}
        </div>
        {monthlyLabel && (
          <p className="mt-0.5 text-xs font-semibold" style={{ color: MUTED }}>
            {t(`desde ${monthlyLabel}/mes`, `from ${monthlyLabel}/mo`)}
          </p>
        )}
        <span className={`mt-3 block rounded-lg py-2.5 text-center text-sm font-bold ${waLink ? 'mr-[50px]' : ''}`}
          style={{ backgroundColor: accentFill, color: onAccent }}>
          {t('Ver ficha', 'View details')}
        </span>
      </div>
    </Link>
    {/* Botones hermanos del enlace (no dentro: un <button> dentro de un <a> no es HTML válido). */}
    <button type="button" onClick={onFav} aria-pressed={fav}
      aria-label={fav ? t('Quitar de favoritos', 'Remove from favorites') : t('Guardar en favoritos', 'Save to favorites')}
      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg leading-none text-white"
      style={fav ? { color: '#FF6B81' } : undefined}>
      {fav ? '♥' : '♡'}
    </button>
    {waLink && (
      <a href={waLink} target="_blank" rel="noopener noreferrer"
        aria-label={t('Preguntar por este vehículo por WhatsApp', 'Ask about this vehicle on WhatsApp')}
        className="absolute bottom-4 right-4 flex h-[42px] w-[42px] items-center justify-center rounded-lg border"
        style={{ borderColor: BORDER, backgroundColor: SURFACE, color: WHATSAPP_GREEN }}>
        <WhatsAppIcon size={19} />
      </a>
    )}
    <button type="button" onClick={onCompare} aria-pressed={compared} disabled={!compared && compareFull}
      title={!compared && compareFull ? t('Máximo 3 vehículos', 'Maximum 3 vehicles') : undefined}
      className="absolute right-2 top-12 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-40"
      style={compared ? { backgroundColor: accentFill, color: onAccent } : undefined}>
      {compared ? `✓ ${t('Comparando', 'Comparing')}` : t('Comparar', 'Compare')}
    </button>
    </div>
  );
}

/** Silueta de vehículo para las tarjetas sin foto (y la ficha). Hereda el color del contenedor. */
function CarSilhouette({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeOpacity="0.3"
      strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13l2-5.5A2 2 0 017 6h10a2 2 0 012 1.5L21 13v4h-2M3 17v-4m0 4h2m14 0H5" />
      <circle cx="7.5" cy="17" r="1.8" />
      <circle cx="16.5" cy="17" r="1.8" />
    </svg>
  );
}

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20z" />
      <path d="M8.5 7.3c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .6.4l.8 1.9c.1.3 0 .5-.1.7l-.4.5c-.1.2-.2.3 0 .6a7 7 0 003.1 2.7c.3.1.5.1.7-.1l.5-.6c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.3.4.5 0 .6-.3 1.3-1 1.6-.5.3-1.2.4-2 .2-2-.5-4.5-2.6-5.6-5-.4-.9-.4-1.9-.1-2.6l.1-.2z" />
    </svg>
  );
}
