'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { categoryLabel } from '@/lib/category-label';
import { formatPrice as formatCurrencyPrice } from '@/lib/currency';
import { MenuLayoutView, makePalette } from './MenuBoardLayouts';
import { IMPLEMENTED_LAYOUTS, normalizeLayout, type BoardLayoutName } from '@/lib/board-layouts';

// Screen Wake Lock API — tipos propios (con nombre distinto a los de lib.dom, por si el
// TS target ya los trae) para no depender de qué tan reciente sea la lib del proyecto.
// Soportado en Chrome/Edge/Android desde hace años; ausente en algunos navegadores/iOS
// Safari viejos — por eso todo el request va en try/catch y degrada a "no-op" sin romper nada.
interface BoardWakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
}
interface NavigatorWithWakeLock extends Navigator {
  wakeLock?: {
    request: (type: 'screen') => Promise<BoardWakeLockSentinel>;
  };
}

type BoardItem = PublicTemplateProps['items'][number];
type BoardCategory = PublicTemplateProps['categories'][number];

export interface ScreenAd {
  id: string;
  mediaUrl: string;
  mediaType: 'Image' | 'Video';
  durationSeconds: number;
  /** "Contain" (default, nunca recorta — deja franjas si la proporción no coincide) |
   *  "Cover" (llena el recuadro, puede recortar). Se elige por comercial en el dashboard. */
  fit?: 'Contain' | 'Cover';
}

type TransitionEffect = 'Fade' | 'Slide' | 'Zoom' | 'None';

interface Props {
  slug: string;
  /** Pantalla extra (/{slug}/board/{screenId}); el poll debe pedir el mismo recorte. */
  screenId?: string;
  business: {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
    /** Paleta del negocio: secundario y acento (opcionales; si faltan se derivan del primario). */
    secondaryColor?: string | null;
    accentColor?: string | null;
    currency?: 'USD' | 'DOP';
    categoryTranslations?: Record<string, { es?: string | null; en?: string | null }> | null;
  };
  initialItems: BoardItem[];
  initialCategories: BoardCategory[];
  initialScreenAds?: ScreenAd[];
  initialAdFrequency?: number | null;
  /** Preferencia del negocio, no del visitante — nadie interactúa con la TV para cambiarla. */
  language?: 'es' | 'en';
  theme?: 'Dark' | 'Light';
  transitionEffect?: TransitionEffect;
  /** Plantilla visual (Classic = la grilla original). */
  layout?: BoardLayoutName;
}

// Diccionario chico a propósito — el board tiene un puñado de strings fijos, no justifica
// traer el sistema de traducción completo del sitio (useSimpleLanguage), que además es una
// preferencia de VISITANTE y esto es una preferencia de NEGOCIO.
const BOARD_STRINGS = {
  es: { unavailable: 'Catálogo no disponible por el momento.' },
  en: { unavailable: 'Catalog not available right now.' },
};

const THEME_CLASSES = {
  Dark: {
    root: 'bg-neutral-950 text-white',
    card: 'bg-white/5 ring-1 ring-white/10',
    mediaFallback: 'bg-neutral-800',
    dotInactive: 'rgba(255,255,255,0.25)',
    unavailableText: 'text-white/60',
    muted: 'text-white/65',
  },
  Light: {
    root: 'bg-white text-neutral-900',
    card: 'bg-black/5 ring-1 ring-black/10',
    mediaFallback: 'bg-neutral-200',
    dotInactive: 'rgba(0,0,0,0.15)',
    unavailableText: 'text-neutral-500',
    muted: 'text-neutral-600',
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** How often the board re-fetches the catalog. This is the "actualización remota" —
 *  a TV left open just needs to notice dashboard changes eventually, not live/websocket. */
const REFRESH_INTERVAL_MS = 3 * 60 * 1000;
/** How long each slide (one category, up to ITEMS_PER_SLIDE items) stays on screen. */
const SLIDE_INTERVAL_MS = 9000;

/** Las slides de combos destacados (McDonald's/Taco Bell-style) se quedan un poco más que una
 *  grilla de menú normal — son la pieza de venta, no una lista a repasar rápido. */
const COMBO_SLIDE_INTERVAL_MS = 11000;
/** Tope de slides de combos por pantalla — el pedido fue "no es el menú entero, unas 2-3
 *  slides bonitas al lado", no una segunda copia del catálogo. */
const MAX_COMBO_SLIDES = 3;

/** Tope por comercial en video: el video se reproduce completo y avanza al terminar, pero nunca
 *  más de esto (un video larguísimo o trabado no se queda con la pantalla). */
const MAX_VIDEO_AD_MS = 60 * 1000;
const ITEMS_PER_SLIDE = 6;

/** Watchdog: cada cuánto se revisa si el polling sigue vivo. */
const WATCHDOG_CHECK_INTERVAL_MS = 60 * 1000;
/** Si pasa este tiempo sin un refresh exitoso (3 ciclos de polling, ~9 min), algo se
 *  colgó — tab congelada, catálogo caído, lo que sea — y se fuerza un reload completo de
 *  la página en vez de seguir mostrando contenido potencialmente viejo para siempre. Un
 *  reload es gratis aquí: no hay estado del visitante que perder, es una pantalla pasiva. */
const STALE_RELOAD_THRESHOLD_MS = REFRESH_INTERVAL_MS * 3;

interface CatalogPayload {
  items: BoardItem[];
  categories?: BoardCategory[];
  screenAds?: ScreenAd[];
  adFrequency?: number | null;
}

type ComboVariant = 'spotlight' | 'duo' | 'trio';

type Slide =
  | { kind: 'menu'; category: string; items: BoardItem[] }
  | { kind: 'ad'; ad: ScreenAd }
  | { kind: 'combo'; items: BoardItem[]; variant: ComboVariant };

/** Groups items by category into fixed-size chunks — each chunk is one slide, so a
 *  category with more items than fit on screen spills into a second, third, etc. slide
 *  instead of shrinking everything down to fit (bad for distance viewing). */
function buildMenuSlides(items: BoardItem[], categories: BoardCategory[]): Slide[] {
  const visible = items.filter((i) => (i.status ?? 'Active') === 'Active' && !i.is_demo);
  const byCategory = new Map<string, BoardItem[]>();
  for (const item of visible) {
    const key = item.category ?? 'other';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(item);
  }

  const orderedKeys =
    categories.length > 0
      ? [...categories.map((c) => c.name), ...[...byCategory.keys()].filter((k) => !categories.some((c) => c.name === k))]
      : [...byCategory.keys()];

  const slides: Slide[] = [];
  for (const key of orderedKeys) {
    const catItems = byCategory.get(key);
    if (!catItems || catItems.length === 0) continue;
    for (let i = 0; i < catItems.length; i += ITEMS_PER_SLIDE) {
      slides.push({ kind: 'menu', category: key, items: catItems.slice(i, i + ITEMS_PER_SLIDE) });
    }
  }
  return slides;
}

/** McDonald's/Taco Bell-style: unas pocas slides vendiendo los combos destacados, con
 *  variedad de layout (1/2/3 items) en vez de repetir siempre la misma grilla — eso es lo que
 *  las hace sentir "con vida propia" en vez de una repetición de la misma tarjeta. Usa items
 *  marcados Featured en el catálogo (el dueño ya los elige desde el dashboard); si no marcó
 *  ninguno, cae a Popular para no dejar la pantalla sin highlight. Sin Featured ni Popular =
 *  sin slides de combo (no hay nada que destacar todavía). */
function buildComboSlides(items: BoardItem[], categories: BoardCategory[]): Slide[] {
  const visible = items.filter((i) => (i.status ?? 'Active') === 'Active' && !i.is_demo);
  let picks = visible.filter((i) => i.featured);
  if (picks.length === 0) picks = visible.filter((i) => i.popular);
  if (picks.length === 0) return [];

  // Mismo orden que el menú (por categoría, luego por SortOrder ya resuelto en items) para que
  // los combos no salten de un plato a otro sin relación aparente.
  const orderedKeys = categories.length > 0 ? categories.map((c) => c.name) : [];
  if (orderedKeys.length > 0) {
    picks = picks.sort((a, b) => {
      const ai = orderedKeys.indexOf(a.category ?? '');
      const bi = orderedKeys.indexOf(b.category ?? '');
      return (ai === -1 ? orderedKeys.length : ai) - (bi === -1 ? orderedKeys.length : bi);
    });
  }

  const variants: ComboVariant[] = ['spotlight', 'duo', 'trio'];
  const slides: Slide[] = [];
  let i = 0;
  let variantIdx = 0;
  while (i < picks.length && slides.length < MAX_COMBO_SLIDES) {
    const variant = variants[variantIdx % variants.length];
    const count = variant === 'spotlight' ? 1 : variant === 'duo' ? 2 : 3;
    const chunk = picks.slice(i, i + count);
    if (chunk.length === 0) break;
    // Un spotlight/duo con menos items de los que pide el variant (quedan pocos picks) sigue
    // sirviendo — simplemente se ve con lo que hay, nunca se infla con relleno.
    slides.push({ kind: 'combo', items: chunk, variant: chunk.length >= count ? variant : (chunk.length === 2 ? 'duo' : 'spotlight') });
    i += chunk.length;
    variantIdx += 1;
  }
  return slides;
}

/** Fase 9 Etapa A — intercala un slide de comercial cada `frequency` slides de menú.
 *  frequency <= 0 o sin comerciales activos = sin cambios (comportamiento previo intacto). Los
 *  comerciales rotan en round-robin, no se repite siempre el mismo primero.
 *
 *  Si el negocio tiene menos slides de menú que `frequency` (ej. 1 sola categoría con
 *  frecuencia 2), el múltiplo exacto nunca se alcanza y el comercial jamás aparecería —
 *  se agrega al final como fallback para garantizar que, si hay comerciales activos y
 *  frecuencia > 0, al menos uno entre en la rotación sin importar cuántos slides de menú haya. */
function interleaveAds(menuSlides: Slide[], ads: ScreenAd[], frequency: number | null | undefined): Slide[] {
  if (!frequency || frequency <= 0 || ads.length === 0) return menuSlides;

  const result: Slide[] = [];
  let adIndex = 0;
  menuSlides.forEach((slide, i) => {
    result.push(slide);
    if ((i + 1) % frequency === 0) {
      result.push({ kind: 'ad', ad: ads[adIndex % ads.length] });
      adIndex += 1;
    }
  });

  if (adIndex === 0) {
    result.push({ kind: 'ad', ad: ads[0] });
  }

  return result;
}

function formatPrice(price: number | null | undefined, currency?: 'USD' | 'DOP') {
  if (price == null) return '';
  return formatCurrencyPrice(price, currency);
}

/** Estilo inicial (oculto) y final (visible) por efecto — solo animamos la ENTRADA de cada
 *  slide, no la salida del anterior (el remount vía `key` ya los separa limpio). "None" existe
 *  para quien prefiera el corte seco de antes de que hubiera transiciones. */
const TRANSITION_STYLES: Record<TransitionEffect, { hidden: React.CSSProperties; visible: React.CSSProperties; className: string }> = {
  Fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    className: 'transition-opacity duration-700 ease-in-out',
  },
  Slide: {
    hidden: { opacity: 0, transform: 'translateX(40px)' },
    visible: { opacity: 1, transform: 'translateX(0)' },
    className: 'transition-[opacity,transform] duration-700 ease-out',
  },
  Zoom: {
    hidden: { opacity: 0, transform: 'scale(0.92)' },
    visible: { opacity: 1, transform: 'scale(1)' },
    className: 'transition-[opacity,transform] duration-700 ease-out',
  },
  None: {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
    className: '',
  },
};

/** Anima la entrada de cada slide — se re-dispara cada vez que `slideKey` cambia (remonta el
 *  contenido vía `key` en el llamador, así que siempre arranca en el estado "hidden" del
 *  efecto elegido). Configurable por negocio/pantalla (Fade/Slide/Zoom/None). */
function TransitionSlide({
  slideKey, effect, children,
}: { slideKey: string | number; effect: TransitionEffect; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideKey]);
  const t = TRANSITION_STYLES[effect];
  return (
    <div className={`h-full w-full ${t.className}`} style={visible ? t.visible : t.hidden}>
      {children}
    </div>
  );
}

/** Slide de combo destacado — layout tipo menu board de comida rápida, no la grilla genérica
 *  de categoría. Tres variantes (spotlight/duo/trio) según cuántos items trae, con un "Ken
 *  Burns" lento en la foto (ver combo-kenburns más abajo) para que no se sienta como una
 *  tarjeta estática cada vez que rota — es la pieza que el negocio quiere lucir. */
function ComboSlideView({
  items, variant, language, business, theme,
}: {
  items: BoardItem[];
  variant: ComboVariant;
  language: 'es' | 'en';
  business: Props['business'];
  theme: 'Dark' | 'Light';
}) {
  const isDark = theme === 'Dark';
  const priceBg = business.primaryColor;

  function Card({ item, big }: { item: BoardItem; big: boolean }) {
    const displayName = language === 'en' && item.nameEn ? item.nameEn : item.name;
    const hasMedia = Boolean(item.image_url || item.video_url);
    return (
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl">
        <div className={`relative flex-1 overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
          {hasMedia ? (
            item.video_url ? (
              <video
                src={item.video_url}
                className="combo-kenburns absolute inset-0 h-full w-full object-cover"
                autoPlay muted loop playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url ?? undefined} alt={displayName} className="combo-kenburns absolute inset-0 h-full w-full object-cover" />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${priceBg}33, transparent)` }} />
          )}
          {/* Scrim de abajo hacia arriba para que el nombre/precio siempre se lean encima de la foto. */}
          <div className="absolute inset-x-0 bottom-0 h-2/3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
          {(item.featured || item.popular) && (
            <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white" style={{ background: priceBg }}>
              {language === 'en' ? 'Favorite' : 'Favorito'}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
            <span className={`font-bold leading-tight text-white drop-shadow ${big ? 'text-4xl' : 'text-2xl'}`}>{displayName}</span>
            <span
              className={`combo-price-pulse shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-extrabold text-white shadow-lg ${big ? 'text-2xl' : 'text-lg'}`}
              style={{ background: priceBg }}
            >
              {formatPrice(item.price, business.currency)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid h-full w-full gap-6 ${variant === 'spotlight' ? 'grid-cols-1' : variant === 'duo' ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {items.map((item) => (
        <Card key={item.id} item={item} big={variant === 'spotlight'} />
      ))}
    </div>
  );
}

export function MenuBoard({
  slug, screenId, business, initialItems, initialCategories,
  initialScreenAds = [], initialAdFrequency = null,
  language = 'es', theme = 'Dark', transitionEffect = 'Fade', layout = 'Classic',
}: Props) {
  const t = BOARD_STRINGS[language];
  const c = THEME_CLASSES[theme];
  const palette = useMemo(
    () => makePalette(business, theme),
    [business, theme],
  );
  const activeLayout = normalizeLayout(layout);

  const [catalog, setCatalog] = useState<CatalogPayload>({
    items: initialItems,
    categories: initialCategories,
    screenAds: initialScreenAds,
    adFrequency: initialAdFrequency,
  });
  const [slideIndex, setSlideIndex] = useState(0);

  // Último refresh exitoso del catálogo — lo usa el watchdog de abajo para decidir si la
  // pantalla se "colgó". En un ref (no state) porque no debe disparar un re-render.
  const lastSuccessRef = useRef(Date.now());

  // Screen Wake Lock — evita que el sistema apague la pantalla mientras esta pestaña está
  // activa (sin esto, el board depende por completo de la política de ahorro de energía del
  // dispositivo/TV, que normalmente NO sabe que esta pestaña debe quedarse siempre visible).
  // El lock se libera solo cuando la pestaña pierde visibilidad (p. ej. si alguien minimiza
  // o cambia de ventana en la TV) — por eso se re-pide en 'visibilitychange'.
  useEffect(() => {
    let wakeLock: BoardWakeLockSentinel | null = null;
    let cancelled = false;

    async function requestWakeLock() {
      try {
        const nav = navigator as NavigatorWithWakeLock;
        if (!nav.wakeLock) return;
        const lock = await nav.wakeLock.request('screen');
        if (cancelled) {
          await lock.release().catch(() => {});
          return;
        }
        wakeLock = lock;
      } catch {
        // No soportado, o el navegador lo negó (batería baja, política del sistema, etc.) —
        // la pantalla sigue funcionando igual, solo sin esta protección extra.
      }
    }

    requestWakeLock();

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') requestWakeLock();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, []);

  // Poll for catalog changes made from the dashboard — this is the whole point of the
  // board being "remote-updatable": the TV never needs to be touched. Now also picks up
  // comerciales nuevos/pausados y cambios de frecuencia sin reabrir la pestaña.
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        // Mismo screenId que el render inicial: sin él, el backend devuelve el catálogo BASE
        // (todo el menú + todos los comerciales) y la pantalla extra pierde su filtro a los 3 min.
        const qs = screenId ? `?screenId=${encodeURIComponent(screenId)}` : '';
        const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog${qs}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        // Mismo mapeo que renderBoard (camelCase de la API → image_url/video_url del board).
        const polledItems = (data.items ?? []).map((item: Record<string, unknown>) => ({
          ...item,
          image_url: item.image_url ?? item.imageUrl ?? null,
          video_url: item.video_url ?? item.videoUrl ?? null,
        }));
        setCatalog({
          items: polledItems,
          categories: data.categories ?? [],
          screenAds: data.screenAds ?? [],
          adFrequency: data.adFrequency ?? null,
        });
        lastSuccessRef.current = Date.now();
      } catch {
        // Transient network hiccup — keep showing the last good catalog, try again next tick.
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [slug, screenId]);

  // Watchdog — si pasan varios ciclos de polling sin un refresh exitoso (tab congelada, red
  // caída, lo que sea), fuerza un reload completo en vez de quedarse mostrando contenido
  // potencialmente viejo indefinidamente. No depende de que el fetch "falle" explícitamente:
  // una pestaña verdaderamente congelada tampoco corre el setInterval del poll, pero sí este
  // otro interval (están desacoplados), así que esta revisión sola detecta ambos casos.
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (Date.now() - lastSuccessRef.current > STALE_RELOAD_THRESHOLD_MS) {
        window.location.reload();
      }
    }, WATCHDOG_CHECK_INTERVAL_MS);
    return () => clearInterval(watchdog);
  }, []);

  const slides = useMemo(() => {
    // Los combos van primero: son la pieza de venta (McDonald's/Taco Bell-style), así que se
    // ven temprano en la rotación en vez de perdidos al final de todo el menú.
    const comboSlides = buildComboSlides(catalog.items, catalog.categories ?? []);
    const menuSlides = [...comboSlides, ...buildMenuSlides(catalog.items, catalog.categories ?? [])];
    const ads = catalog.screenAds ?? [];
    // Pantalla "solo comerciales" (Fase 9 Etapa C) — sin items de menú, la rotación entera
    // son los comerciales, uno por slide, no solo el primero.
    if (menuSlides.length === 0 && ads.length > 0) {
      return ads.map((ad): Slide => ({ kind: 'ad', ad }));
    }
    return interleaveAds(menuSlides, ads, catalog.adFrequency);
  }, [catalog]);

  // Reset to slide 0 whenever the slide set changes shape (items added/removed, comerciales
  // agregados/quitados) so the index never points past the end.
  useEffect(() => {
    setSlideIndex(0);
  }, [slides.length]);

  const slide = slides[slideIndex];

  // Duración variable por slide — un comercial puede durar distinto que un slide de menú
  // (ad.durationSeconds vs SLIDE_INTERVAL_MS fijo). Se re-arma el timer cada vez que cambia
  // el slide activo en vez de un solo interval fijo para toda la rotación.
  useEffect(() => {
    if (slides.length <= 1) return;
    // Comercial en video: avanza por onEnded (dura lo que dure el video); este timer es solo el
    // tope de seguridad (video colgado, sin red, o más largo que MAX_VIDEO_AD_MS).
    const durationMs = slide?.kind === 'ad'
      ? (slide.ad.mediaType === 'Video' ? MAX_VIDEO_AD_MS : slide.ad.durationSeconds * 1000)
      : slide?.kind === 'combo'
        ? COMBO_SLIDE_INTERVAL_MS
        : SLIDE_INTERVAL_MS;
    const timer = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [slideIndex, slides, slide]);

  return (
    <div
      // Antes tenía aspectRatio:'16/9' además de fixed+inset-0 — cuando el viewport real no es
      // exactamente 16:9 (cualquier navegador de escritorio, no solo el Smart TV), el aspect-ratio
      // ganaba el cálculo de altura sobre el inset-0, el contenedor quedaba más alto que la
      // pantalla y el nombre/precio de los combos (anclados abajo) caían fuera del área visible
      // sin scroll posible (overflow-hidden). fixed+inset-0 ya ajusta exacto al viewport solo.
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: palette.bg, color: palette.text }}
    >
      {/* Ken Burns lento en las fotos de combo + un pulso suave en el precio — nada de esto
          corre en los slides de menú normales (las clases solo existen en ComboSlideView), así
          que es gratis para el resto del board. Duración atada a COMBO_SLIDE_INTERVAL_MS para
          que el zoom termine justo cuando el slide cambia, nunca se corta a mitad. */}
      <style>{`
        @keyframes comboKenBurns { from { transform: scale(1); } to { transform: scale(1.08); } }
        .combo-kenburns { animation: comboKenBurns ${COMBO_SLIDE_INTERVAL_MS}ms ease-out forwards; }
        @keyframes comboPricePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        .combo-price-pulse { animation: comboPricePulse 2.2s ease-in-out infinite; }
      `}</style>
      {/* Header band — logo + business name, always visible so the board is
          self-identifying even to someone walking up mid-rotation. */}
      <header
        className="flex items-center gap-4 px-10 py-6"
        style={{ background: palette.primary, color: palette.onPrimary }}
      >
        {business.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logoUrl}
            alt={business.name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-white/40"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight">{business.name}</h1>
        {slide?.kind === 'menu' && (
          <span className="ml-auto text-xl font-semibold uppercase tracking-widest opacity-80">
            {categoryLabel(slide.category, language, business.categoryTranslations)}
          </span>
        )}
        {slide?.kind === 'combo' && (
          <span className="ml-auto text-xl font-semibold uppercase tracking-widest opacity-80">
            {language === 'en' ? 'Popular picks' : 'Lo más pedido'}
          </span>
        )}
      </header>

      {/* Slide content — TransitionSlide remonta (key=slideIndex) y anima la entrada en cada
          cambio, para que pasar de una categoría/comercial a otra no se sienta como un corte
          seco. Efecto configurable (Fade/Slide/Zoom/None) por negocio o por pantalla. */}
      <main className="flex flex-1 items-center justify-center px-10 py-8">
        <TransitionSlide slideKey={slideIndex} effect={transitionEffect}>
        {!slide ? (
          <p className={`text-2xl ${c.unavailableText}`}>{t.unavailable}</p>
        ) : slide.kind === 'ad' ? (
          // Comercial — a pantalla completa dentro del área de contenido, sin la grilla de
          // items ni precios (no es un producto, es contenido promocional). object-contain por
          // default (nunca recorta) — "Cover" es opt-in por comercial desde el dashboard para
          // quien prefiera llenar la pantalla a costa de recortar.
          <div className={`relative h-full w-full overflow-hidden rounded-2xl ${c.mediaFallback}`}>
            {slide.ad.mediaType === 'Video' ? (
              <video
                key={slide.ad.id}
                src={slide.ad.mediaUrl}
                className={`absolute inset-0 h-full w-full ${slide.ad.fit === 'Cover' ? 'object-cover' : 'object-contain'}`}
                autoPlay
                muted
                // Con una sola slide no hay a dónde avanzar: loop. Con varias, avanza al terminar.
                loop={slides.length <= 1}
                onEnded={() => setSlideIndex((i) => (i + 1) % slides.length)}
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.ad.mediaUrl}
                alt=""
                className={`absolute inset-0 h-full w-full ${slide.ad.fit === 'Cover' ? 'object-cover' : 'object-contain'}`}
              />
            )}
          </div>
        ) : slide.kind === 'combo' ? (
          <ComboSlideView items={slide.items} variant={slide.variant} language={language} business={{ ...business, primaryColor: palette.accent }} theme={theme} />
        ) : IMPLEMENTED_LAYOUTS.includes(activeLayout) && activeLayout !== 'Classic' && slide.kind === 'menu' ? (
          <MenuLayoutView
            layout={activeLayout}
            items={slide.items}
            categoryName={categoryLabel(slide.category, language, business.categoryTranslations)}
            language={language}
            palette={palette}
            formatPrice={(price) => formatPrice(price, business.currency)}
          />
        ) : (
          <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-6">
            {slide.items.map((item) => {
              const displayName = language === 'en' && item.nameEn ? item.nameEn : item.name;
              const hasMedia = Boolean(item.video_url || item.image_url);
              // Descripción del plato (en inglés si la pantalla está en inglés y hay traducción).
              const displayDescription = (language === 'en' && item.descriptionEn ? item.descriptionEn : item.description)?.trim() || null;
              return (
              <div
                key={item.id}
                className={`flex flex-col overflow-hidden rounded-2xl ${c.card}`}
              >
                {/* Sin foto ni video: la tarjeta es de solo texto (nombre grande + precio), sin el recuadro vacío con 🍽️. */}
                {hasMedia && (
                  <div className={`relative flex-1 overflow-hidden ${c.mediaFallback}`}>
                    {item.video_url ? (
                      <video
                        src={item.video_url}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url ?? undefined}
                        alt={displayName}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div
                  className={
                    hasMedia
                      ? 'flex items-center justify-between gap-3 px-5 py-4'
                      : 'flex flex-1 flex-col items-center justify-center gap-3 px-6 py-6 text-center'
                  }
                >
                  {hasMedia ? (
                    <div className="min-w-0">
                      <span className="block text-2xl font-bold leading-tight">{displayName}</span>
                      {displayDescription && (
                        <span className={`mt-1 block text-lg leading-snug line-clamp-2 ${c.muted}`}>{displayDescription}</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl font-bold leading-tight">{displayName}</span>
                      {displayDescription && (
                        <span className={`text-xl leading-snug line-clamp-3 ${c.muted}`}>{displayDescription}</span>
                      )}
                    </>
                  )}
                  <span className={`${hasMedia ? 'text-2xl' : 'text-3xl'} font-extrabold whitespace-nowrap`} style={{ color: palette.price }}>
                    {formatPrice(item.price, business.currency)}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        )}
        </TransitionSlide>
      </main>

      {/* Pagination dots — subtle, just enough to signal "there's more" without being
          interactive chrome (nothing on this screen is meant to be clicked). */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-6">
          {slides.map((s, i) => (
            <span
              key={s.kind === 'menu' ? `${s.category}-${i}` : s.kind === 'combo' ? `combo-${i}` : `${s.ad.id}-${i}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === slideIndex ? 24 : 8,
                background: i === slideIndex ? palette.price : c.dotInactive,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
