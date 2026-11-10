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
import { VehicleDetail } from '@/components/public/dealer/VehicleDetail';
import { TradeInModal } from '@/components/public/dealer/LeadForms';
import { CompareSheet } from '@/components/public/dealer/CompareSheet';
import { useDealerFavorites } from '@/components/public/dealer/useDealerFavorites';
import { deriveBrandPalette, deriveDarkBrandPalette, themeVarsCss } from '@/lib/brand-palette';
import {
  BODY_LABELS, CONDITION_LABELS, DEFAULT_DEALER_SETTINGS, EMPTY_FILTERS, FUEL_LABELS, STATUS_LABELS,
  TRANSMISSION_LABELS, activeFilterCount, applyFilters, facetCounts, filtersFromParams, filtersToParams, formatMileage,
  formatVehiclePrices, label, primaryCurrency, uniqueValues, vehicleTitle, type VehicleFilters,
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
    },
    {
      'dl-bg': darkPalette.bg, 'dl-surface': darkPalette.surface, 'dl-border': darkPalette.border,
      'dl-ink': darkPalette.ink, 'dl-muted': darkPalette.muted,
      'dl-accent': darkPalette.accent, 'dl-accent-text': darkPalette.accentText, 'dl-on-accent': darkPalette.onAccent,
      'dl-amber': '#F2B556', 'dl-amber-bg': 'rgba(242,181,86,0.16)',
    },
  );
  const accentText = `var(--dl-accent-text, ${lightPalette.accentText})`;
  const accentFill = `var(--dl-accent, ${lightAccentHex})`;
  const onAccent = `var(--dl-on-accent, ${lightPalette.onAccent})`;
  const heroInk = lightPalette.onAccent;
  const heroOnDark = heroInk.toLowerCase() === '#ffffff';

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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: accent }} className="relative overflow-hidden">
        {business.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <SimpleLanguageToggle variant={heroOnDark ? 'dark' : 'light'} spanishFlag={business.spanishFlag} />
          <PublicThemeToggle variant={heroOnDark ? 'dark' : 'light'} />
        </div>
        <div className="relative z-10 mx-auto max-w-[1100px] px-4 pb-10 pt-14 text-center sm:pt-16" style={{ color: heroInk }}>
          {business.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt={business.name}
              className="mx-auto mb-4 h-20 w-20 rounded-2xl border-2 border-white/40 bg-white object-contain p-2 shadow-lg" />
          )}
          <h1 className="text-3xl font-bold sm:text-4xl">{business.name}</h1>
          {business.address && (
            <p className="mt-2 text-sm opacity-80">
              <a href={googleMapsUrl(business.address)} target="_blank" rel="noopener noreferrer"
                className="underline decoration-current/40 underline-offset-2 hover:decoration-current">
                📍 {business.address}
              </a>
            </p>
          )}
          <p className="mt-3 text-sm font-medium opacity-90">
            {vehicles.length > 0
              ? t(`${vehicles.length} vehículos en inventario`, `${vehicles.length} vehicles in stock`)
              : t('Inventario en actualización', 'Inventory being updated')}
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

function VehicleCard({ v, slug, onOpen, lang, baseCurrency, settings, accentText, accentFill, onAccent, fav, onFav, compared, compareFull, onCompare }: {
  v: PublicVehicle; slug: string; onOpen: (id: string) => void; lang: 'es' | 'en';
  fav: boolean; onFav: () => void; compared: boolean; compareFull: boolean; onCompare: () => void;
  baseCurrency: 'USD' | 'DOP'; settings: typeof DEFAULT_DEALER_SETTINGS;
  accentText: string; accentFill: string; onAccent: string;
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
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: BORDER }}>
        {v.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.imageUrl} alt={vehicleTitle(v)} loading="lazy"
            className={`h-full w-full object-cover transition-transform group-hover:scale-[1.03] ${reserved ? 'opacity-80' : ''}`} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl" aria-hidden>🚗</div>
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
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold leading-snug">{vehicleTitle(v)}</h3>
        {specs.length > 0 && <p className="mt-1 text-xs" style={{ color: MUTED }}>{specs.join(' · ')}</p>}
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="text-xl font-bold" style={{ color: accentText }}>{prices[0]}</span>
          {prices[1] && <span className="text-sm font-medium" style={{ color: MUTED }}>{prices[1]}</span>}
          {was && <span className="text-xs line-through" style={{ color: MUTED }}>{was}</span>}
        </div>
      </div>
    </Link>
    {/* Botones hermanos del enlace (no dentro: un <button> dentro de un <a> no es HTML válido). */}
    <button type="button" onClick={onFav} aria-pressed={fav}
      aria-label={fav ? t('Quitar de favoritos', 'Remove from favorites') : t('Guardar en favoritos', 'Save to favorites')}
      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg leading-none text-white"
      style={fav ? { color: '#FF6B81' } : undefined}>
      {fav ? '♥' : '♡'}
    </button>
    <button type="button" onClick={onCompare} aria-pressed={compared} disabled={!compared && compareFull}
      title={!compared && compareFull ? t('Máximo 3 vehículos', 'Maximum 3 vehicles') : undefined}
      className="absolute right-2 top-12 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-40"
      style={compared ? { backgroundColor: accentFill, color: onAccent } : undefined}>
      {compared ? `✓ ${t('Comparando', 'Comparing')}` : t('Comparar', 'Compare')}
    </button>
    </div>
  );
}
