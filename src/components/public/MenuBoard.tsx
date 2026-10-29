'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { categoryLabel } from '@/lib/category-label';
import { alignCatalogToTemplates, normalizeBaseLanguage } from '@/lib/catalog-language';
import { formatPrice as formatCurrencyPrice } from '@/lib/currency';
import { MenuLayoutView, makePalette } from './MenuBoardLayouts';
import {
  IMPLEMENTED_LAYOUTS, normalizeLayout, normalizeOrientation, normalizePanels, normalizeDailyMenu, DEFAULT_PANELS,
  type BoardLayoutName, type BoardOrientation, type BoardPanel, type DailyMenu,
} from '@/lib/board-layouts';
import type { HorarioEntry } from '@/lib/business-hours';
import { PanelsBoard, describePanels } from './BoardPanels';
import { useWallClock } from '@/hooks/useWallClock';
import { buildFrames, locateFrame, locatePerTv, parseSyncParams, slideForScreen, syncParamsFromApi, type ApiWall, type SyncParams } from '@/lib/wall-sync';
import SyncTestClient from '@/app/sync-test/SyncTestClient';
import { SINGLE_SCREEN, SpanFrame, SyncedVideo, shouldSpan, useMediaInfo, type MediaInfo } from './BoardSync';

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
    /** Pie de los flyers verticales y estado "Abierto ahora" (layout Panels). */
    address?: string | null;
    phone?: string | null;
    horario?: HorarioEntry[] | null;
    timezone?: string | null;
  };
  initialItems: BoardItem[];
  initialCategories: BoardCategory[];
  initialScreenAds?: ScreenAd[];
  initialAdFrequency?: number | null;
  /** Muro sincronizado configurado en el dashboard (null = pantalla suelta). */
  initialWall?: ApiWall | null;
  /** Preferencia del negocio, no del visitante — nadie interactúa con la TV para cambiarla. */
  language?: 'es' | 'en';
  theme?: 'Dark' | 'Light';
  transitionEffect?: TransitionEffect;
  /** Plantilla visual (Classic = la grilla original). */
  layout?: BoardLayoutName;
  /** Layout "Panels": cómo está montada la TV y qué flyer va en cada espacio. */
  orientation?: BoardOrientation;
  panels?: BoardPanel[] | null;
  /** Menú del día del negocio (Affiliate.DailyMenu) — lo usa el flyer "Menú del día". */
  dailyMenu?: DailyMenu | null;
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
const REFRESH_INTERVAL_MS = 60 * 1000;
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
  dailyMenu?: DailyMenu | null;
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

/** Imágenes que una slide necesita para verse completa. Los videos se cargan solos y quedan
 *  fuera; un plato con video no muestra su foto. */
function slideImageUrls(slide: Slide | undefined): string[] {
  if (!slide) return [];
  if (slide.kind === 'ad') return slide.ad.mediaType === 'Image' && slide.ad.mediaUrl ? [slide.ad.mediaUrl] : [];
  return slide.items.filter((i) => !i.video_url && i.image_url).map((i) => i.image_url as string);
}

/** Muro con menú propio por TV: duración fija de cada slot de menú (todas las TVs cambian juntas
 *  aunque cada una tenga distinta cantidad de slides). Ver locatePerTv en lib/wall-sync. */
const WALL_SLOT_MS = 10000;

/** Duración de una slide en el timeline SINCRONIZADO (?sync / ?wall). Igual que la rotación
 *  normal, salvo los videos: acá no se puede "avanzar al terminar" (cada TV terminaría en otro
 *  momento), así que se usa la duración real del archivo (useMediaInfo), con tope. */
function syncedSlideDurationMs(s: Slide, mediaInfo: Record<string, MediaInfo>): number {
  if (s.kind === 'combo') return COMBO_SLIDE_INTERVAL_MS;
  if (s.kind === 'menu') return SLIDE_INTERVAL_MS;
  if (s.ad.mediaType === 'Video') {
    const real = mediaInfo[s.ad.mediaUrl]?.durationMs;
    const fallback = s.ad.durationSeconds > 0 ? s.ad.durationSeconds * 1000 : 15000;
    return Math.min(real ?? fallback, MAX_VIDEO_AD_MS);
  }
  return Math.max(1000, s.ad.durationSeconds * 1000);
}

/** Cuánto espera como máximo la rotación a que la próxima slide termine de cargar antes de
 *  mostrarla de todos modos (red caída o foto rota: la pantalla nunca se queda congelada). */
const PRELOAD_MAX_WAIT_MS = 4000;

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
  // Solo platos con foto/video: una slide de combo a pantalla completa sin imagen es un degradado
  // vacío. Cuando suban la foto del plato, aparece solo.
  const withMedia = visible.filter((i) => Boolean(i.image_url || i.video_url));
  let picks = withMedia.filter((i) => i.featured);
  if (picks.length === 0) picks = withMedia.filter((i) => i.popular);
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

/** Lienzo de diseño del board. Todo el layout (tipografías, grillas) está pensado para 1920x1080;
 *  en vez de depender de los píxeles CSS que reporte cada TV/navegador (una TV 4K en modo Android
 *  suele reportar 960x540 y todo se ve al doble de grande y se corta), se dibuja siempre sobre
 *  este lienzo y se escala para llenar la pantalla real. */
const STAGE_W = 1920;
const STAGE_H = 1080;

/** Monitoreo de pantallas: el board manda una señal de vida por minuto (ver src/lib/screen-devices.ts). */
const HEARTBEAT_MS = 60_000;
const DEVICE_KEY = 'maalca_tv_device_id';
const APP_VERSION = (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7) || 'dev';

function newDeviceId(): string {
  try {
    return crypto.randomUUID().replace(/-/g, '');
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
}

/** Qué hay en pantalla, en corto, para el panel ("Menú: Tacos", "Comercial: Video 2/6"). */
function describeSlide(slide: Slide | undefined, ads: ScreenAd[]): { kind: 'menu' | 'combo' | 'ad' | null; label: string | null } {
  if (!slide) return { kind: null, label: null };
  if (slide.kind === 'ad') {
    const i = ads.findIndex((a) => a.id === slide.ad.id);
    return { kind: 'ad', label: `${slide.ad.mediaType === 'Video' ? 'Video' : 'Imagen'}${i >= 0 ? ` ${i + 1}/${ads.length}` : ''}` };
  }
  if (slide.kind === 'combo') return { kind: 'combo', label: slide.items.slice(0, 3).map((it) => it.name).join(', ') };
  return { kind: 'menu', label: slide.category };
}

function useStage() {
  const [stage, setStage] = useState({ scale: 1, w: STAGE_W, h: STAGE_H, ready: false });
  useEffect(() => {
    function measure() {
      const vw = window.innerWidth || STAGE_W;
      const vh = window.innerHeight || STAGE_H;
      const scale = Math.min(vw / STAGE_W, vh / STAGE_H);
      // El lienzo se estira al ratio real de la pantalla (nunca menos de 1920x1080 lógicos), así
      // llena todo sin franjas y el contenido flexible aprovecha el espacio extra.
      setStage({ scale, w: vw / scale, h: vh / scale, ready: true });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  return stage;
}

/** Diagnóstico para TVs: se activa con ?debug=1 en la URL del board. Muestra lo que el dispositivo
 *  realmente ve (tamaño de vista, densidad, modo de color del sistema) y la config que recibió. */
function DebugBadge({ info }: { info: string }) {
  const [on, setOn] = useState(false);
  const [dev, setDev] = useState('');
  useEffect(() => {
    try {
      if (!new URLSearchParams(window.location.search).has('debug')) return;
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDev(`vista ${window.innerWidth}x${window.innerHeight} · dpr ${window.devicePixelRatio} · sistema ${dark ? 'OSCURO' : 'claro'}`);
      setOn(true);
    } catch { /* sin diagnóstico */ }
  }, []);
  if (!on) return null;
  return (
    <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 99999, background: 'rgba(0,0,0,.8)', color: '#0f0', font: '20px monospace', padding: '8px 12px', borderRadius: 8 }}>
      {dev}<br />{info}
    </div>
  );
}

export function MenuBoard({
  slug, screenId, business: initialBusiness, initialItems, initialCategories,
  initialScreenAds = [], initialAdFrequency = null, initialWall = null,
  language: initialLanguageProp = 'es', theme: initialThemeProp = 'Dark',
  transitionEffect: initialEffectProp = 'Fade', layout: initialLayoutProp = 'Classic',
  orientation: initialOrientationProp = 'Landscape', panels: initialPanelsProp = null, dailyMenu: initialDailyMenu = null,
}: Props) {
  // Config visual en estado (no solo props): el poll la vuelve a leer, así un cambio de tema,
  // diseño, idioma, efecto o colores hecho desde el dashboard llega a la TV sin recargarla.
  const [cfg, setCfg] = useState({
    language: initialLanguageProp,
    theme: initialThemeProp,
    transitionEffect: initialEffectProp,
    layout: initialLayoutProp,
    orientation: initialOrientationProp,
    panels: initialPanelsProp ?? DEFAULT_PANELS,
    primaryColor: initialBusiness.primaryColor,
    secondaryColor: initialBusiness.secondaryColor ?? null,
    accentColor: initialBusiness.accentColor ?? null,
  });
  const { language, theme, transitionEffect, layout } = cfg;
  const business = useMemo(
    () => ({
      ...initialBusiness,
      primaryColor: cfg.primaryColor,
      secondaryColor: cfg.secondaryColor,
      accentColor: cfg.accentColor,
    }),
    [initialBusiness, cfg.primaryColor, cfg.secondaryColor, cfg.accentColor],
  );
  const t = BOARD_STRINGS[language];
  const c = THEME_CLASSES[theme];
  const palette = useMemo(
    () => makePalette(business, theme),
    [business, theme],
  );
  const activeLayout = normalizeLayout(layout);

  // Evita que el navegador de la TV (Android WebView con el sistema en modo oscuro) aplique su
  // "force dark" por encima del tema que eligió el negocio: el board declara explícitamente su
  // esquema de color. Sin esto, una pantalla en tema Light se veía oscura en el Fully Kiosk.
  useEffect(() => {
    const scheme = theme === 'Light' ? 'only light' : 'only dark';
    const root = document.documentElement;
    const prev = root.style.colorScheme;
    root.style.colorScheme = scheme;
    let meta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }
    const prevContent = meta.content;
    meta.content = scheme;
    return () => {
      root.style.colorScheme = prev;
      if (created) meta?.remove();
      else if (meta) meta.content = prevContent;
    };
  }, [theme]);

  const [catalog, setCatalog] = useState<CatalogPayload>({
    items: initialItems,
    categories: initialCategories,
    screenAds: initialScreenAds,
    adFrequency: initialAdFrequency,
    dailyMenu: initialDailyMenu,
  });
  const [slideIndex, setSlideIndex] = useState(0);
  const stage = useStage();

  // Pantallas sincronizadas — ver src/lib/wall-sync.ts. La config viene del dashboard (Pantallas →
  // Muros sincronizados) dentro del catálogo, y el poll la refresca: cambiar el muro en el
  // dashboard le llega a la TV sin tocarla. ?sync / ?wall en la URL quedan como override de
  // prueba. Pantalla suelta sin override: syncOn=false y nada de esto corre (ni /api/time).
  const [apiWall, setApiWall] = useState<ApiWall | null>(initialWall);
  const [urlSync, setUrlSync] = useState<SyncParams | null | undefined>(undefined);
  useEffect(() => {
    setUrlSync(parseSyncParams(window.location.search));
  }, []);
  const syncParams = useMemo(() => urlSync ?? syncParamsFromApi(apiWall), [urlSync, apiWall]);
  const calibrating = Boolean(apiWall?.calibrate);
  const syncOn = syncParams !== null;
  const perTvWall = Boolean(syncParams?.wall?.perTv);
  const wall = syncParams?.wall ?? null;
  const { clock, stats: clockStats } = useWallClock(syncOn);

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

  // Service worker: guarda la página del board y sus scripts para que una TV que arranca o recarga
  // sin Internet la abra igual (ver public/sw.js). Si el navegador no lo soporta, no pasa nada.
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // Poll for catalog changes made from the dashboard — this is the whole point of the
  // board being "remote-updatable": the TV never needs to be touched. Now also picks up
  // comerciales nuevos/pausados y cambios de frecuencia sin reabrir la pestaña.
  useEffect(() => {
    // Caché del último catálogo bueno (por TV): si la TV arranca o recarga SIN Internet, el service
    // worker (public/sw.js) sirve la página guardada y de acá sale el catálogo más reciente que se
    // vio, en vez de una pantalla de error o un menú de hace días.
    const cacheKey = `maalca_board_cache_v1:${slug}:${screenId ?? ''}`;
    let gotFresh = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyPolled = (data: any) => {
      // Mismo mapeo que renderBoard (camelCase de la API → image_url/video_url del board).
      // Misma alineación de idioma que el render inicial (renderBoard): sin ella, en negocios
      // cuyo idioma base es inglés el poll dejaba `nameEn` = traducción al español y la TV
      // pasaba a mostrar los platos en español aunque la pantalla estuviera en inglés.
      const polledItems = alignCatalogToTemplates(
        (data.items ?? []).map((item: Record<string, unknown>) => ({
          ...item,
          image_url: item.image_url ?? item.imageUrl ?? null,
          video_url: item.video_url ?? item.videoUrl ?? null,
        })) as unknown as BoardItem[],
        normalizeBaseLanguage(data.affiliate?.language),
      );
      setCfg((prev) => {
        const next = {
          language: (data.language === 'en' ? 'en' : 'es') as 'es' | 'en',
          theme: (data.boardTheme === 'Light' ? 'Light' : 'Dark') as 'Dark' | 'Light',
          transitionEffect: (['Slide', 'Zoom', 'None'].includes(data.transitionEffect) ? data.transitionEffect : 'Fade') as TransitionEffect,
          layout: normalizeLayout(data.layout),
          orientation: normalizeOrientation(data.orientation),
          panels: normalizePanels(data.panels) ?? DEFAULT_PANELS,
          primaryColor: data.affiliate?.primaryColor ?? prev.primaryColor,
          secondaryColor: data.affiliate?.secondaryColor ?? null,
          accentColor: data.affiliate?.accentColor ?? null,
        };
        return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
      });
      const nextWall: ApiWall | null = data.wall ?? null;
      setApiWall((prev) => (JSON.stringify(prev) === JSON.stringify(nextWall) ? prev : nextWall));
      setCatalog({
        items: polledItems,
        categories: data.categories ?? [],
        screenAds: data.screenAds ?? [],
        adFrequency: data.adFrequency ?? null,
        dailyMenu: normalizeDailyMenu(data.affiliate?.dailyMenu),
      });
    };
    const pollOnce = async () => {
      try {
        // Mismo screenId que el render inicial: sin él, el backend devuelve el catálogo BASE
        // (todo el menú + todos los comerciales) y la pantalla extra pierde su filtro a los 3 min.
        const qs = screenId ? `?screenId=${encodeURIComponent(screenId)}` : '';
        const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog${qs}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        applyPolled(data);
        gotFresh = true;
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* cuota llena o sin storage: se ignora */ }
        lastSuccessRef.current = Date.now();
      } catch {
        // Sin red: mientras no haya habido ningún refresh bueno en esta carga, muestra el último
        // catálogo guardado. Con la TV ya mostrando datos frescos se mantiene lo que hay.
        if (!gotFresh) {
          try {
            const raw = localStorage.getItem(cacheKey);
            if (raw) {
              applyPolled(JSON.parse(raw));
              lastSuccessRef.current = Date.now(); // el watchdog no recarga en bucle estando offline
            }
          } catch { /* caché ilegible: se ignora */ }
        }
      }
    };
    // Sincronizado: todas las TVs consultan en el MISMO minuto del reloj del muro (+1.5 s), así un
    // cambio hecho en el dashboard les llega a la vez y el timeline no queda desalineado hasta
    // 60 s (una TV con el catálogo nuevo y otra con el viejo calcularían frames distintos).
    let poll: ReturnType<typeof setInterval> | undefined;
    let first: ReturnType<typeof setTimeout> | undefined;
    if (syncOn && clockStats.ready) {
      const delay = REFRESH_INTERVAL_MS - (clock.now() % REFRESH_INTERVAL_MS) + 1500;
      first = setTimeout(() => {
        void pollOnce();
        poll = setInterval(pollOnce, REFRESH_INTERVAL_MS);
      }, delay);
    } else {
      poll = setInterval(pollOnce, REFRESH_INTERVAL_MS);
    }
    return () => {
      clearTimeout(first);
      clearInterval(poll);
    };
  }, [slug, screenId, syncOn, clockStats.ready, clock]);

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
    // Muro con menú propio por TV: menú y comerciales van separados ([menú..., comerciales...]);
    // el orden real lo decide el timeline por slots (locatePerTv), común a todas las TVs.
    if (perTvWall) return [...menuSlides, ...ads.map((ad): Slide => ({ kind: 'ad', ad }))];
    return interleaveAds(menuSlides, ads, catalog.adFrequency);
  }, [catalog, perTvWall]);

  // Reset to slide 0 whenever the slide set changes shape (items added/removed, comerciales
  // agregados/quitados) so the index never points past the end. (Sincronizado: el índice lo
  // calcula el timeline, no hace falta resetear.)
  useEffect(() => {
    if (syncOn) return;
    setSlideIndex(0);
  }, [slides.length, syncOn]);

  // ── Timeline sincronizado ──────────────────────────────────────────────────────────────
  const adMedia = useMemo(() => {
    const seen = new Map<string, { url: string; type: 'Image' | 'Video' }>();
    for (const s of slides) if (s.kind === 'ad') seen.set(s.ad.mediaUrl, { url: s.ad.mediaUrl, type: s.ad.mediaType });
    return [...seen.values()];
  }, [slides]);
  const mediaInfo = useMediaInfo(adMedia, syncOn);
  const screensInWall = wall ? wall.cols * wall.rows : 1;
  const screenIndex = wall ? wall.row * wall.cols + wall.col : 0;
  const frames = useMemo(
    () => (syncOn && !perTvWall
      ? buildFrames(
          // En un muro, cada comercial se estira sobre todas las TVs; las slides de menú se reparten.
          slides.map((s) => ({ span: s.kind === 'ad', durationMs: syncedSlideDurationMs(s, mediaInfo) })),
          screensInWall,
        )
      : []),
    [syncOn, perTvWall, slides, mediaInfo, screensInWall],
  );
  /** span = durante este frame el comercial ocupa todas las TVs del muro. */
  const [syncFrame, setSyncFrame] = useState<{ frameIdx: number; frameStart: number; span: boolean } | null>(null);
  const setFrameIfChanged = useCallback((next: { frameIdx: number; frameStart: number; span: boolean }) => {
    setSyncFrame((prev) =>
      prev && prev.frameIdx === next.frameIdx && prev.frameStart === next.frameStart && prev.span === next.span ? prev : next);
  }, []);

  // Muro con menú propio por TV: timeline por slots (cada TV recorre SU menú; comerciales comunes).
  useEffect(() => {
    if (!syncOn || !perTvWall || !clockStats.ready || slides.length === 0) return;
    const adSlides = slides.filter((s): s is Extract<Slide, { kind: 'ad' }> => s.kind === 'ad');
    const menuCount = slides.length - adSlides.length;
    const adDurations = adSlides.map((s) => syncedSlideDurationMs(s, mediaInfo));
    const freq = catalog.adFrequency ?? 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const now = clock.now();
      const loc = locatePerTv(now, menuCount, adDurations, freq, WALL_SLOT_MS);
      if (!loc) return;
      if (loc.kind === 'menu') {
        setFrameIfChanged({ frameIdx: loc.menuIdx, frameStart: loc.start, span: false });
        setSlideIndex(loc.menuIdx);
      } else {
        setFrameIfChanged({ frameIdx: loc.adIdx, frameStart: loc.start, span: true });
        setSlideIndex(menuCount + loc.adIdx);
      }
      timer = setTimeout(tick, Math.max(5, Math.min(1000, loc.end - now)));
    };
    tick();
    return () => clearTimeout(timer);
  }, [syncOn, perTvWall, clockStats.ready, clock, slides, mediaInfo, catalog.adFrequency, setFrameIfChanged]);

  useEffect(() => {
    if (!syncOn || perTvWall || frames.length === 0 || !clockStats.ready) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const now = clock.now();
      const loc = locateFrame(frames, now);
      if (!loc) return;
      setFrameIfChanged({ frameIdx: loc.frameIdx, frameStart: loc.frameStart, span: frames[loc.frameIdx].kind === 'span' });
      setSlideIndex(slideForScreen(frames[loc.frameIdx], screenIndex));
      // Despierta justo en el borde del próximo frame (el cambio cae al mismo ms en todas las TVs),
      // y nunca duerme más de 1 s por si el reloj se re-sincronizó a mitad.
      timer = setTimeout(tick, Math.max(5, Math.min(1000, loc.frameEnd - now)));
    };
    tick();
    return () => clearTimeout(timer);
  }, [syncOn, perTvWall, frames, clockStats.ready, clock, screenIndex, setFrameIfChanged]);

  const slide = slides[slideIndex];

  // Señal de vida (monitoreo de pantallas): cada minuto avisa al API que esta TV sigue mostrando
  // la pantalla, qué tiene en ese momento y si la página está a la vista. La respuesta puede traer
  // un comando del panel: "reload" (recarga) o "identify" (muestra el nombre de la pantalla 15 s).
  const describeNow = () => (activeLayout === 'Panels'
    ? { kind: 'menu' as const, label: describePanels(cfg.panels, cfg.orientation) }
    : describeSlide(slide, catalog.screenAds ?? []));
  const showingRef = useRef(describeNow());
  showingRef.current = describeNow();
  const [identify, setIdentify] = useState<string | null>(null);
  useEffect(() => {
    let deviceId = '';
    try {
      deviceId = localStorage.getItem(DEVICE_KEY) ?? '';
      if (!/^[A-Za-z0-9_-]{8,64}$/.test(deviceId)) {
        deviceId = newDeviceId();
        localStorage.setItem(DEVICE_KEY, deviceId);
      }
    } catch {
      deviceId = newDeviceId();
    }
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const beat = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/screen-heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            deviceId,
            screenId: screenId ?? null,
            visible: document.visibilityState === 'visible',
            showingKind: showingRef.current.kind,
            showingLabel: showingRef.current.label,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent,
            appVersion: APP_VERSION,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.command === 'reload') {
          window.location.reload();
        } else if (data?.command === 'identify') {
          setIdentify(data.screenName || 'Pantalla');
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => setIdentify(null), 15_000);
        }
      } catch {
        // Sin red: el monitoreo lo registra como "sin señal"; nada que hacer aquí.
      }
    };
    const first = setTimeout(beat, 5_000);
    const every = setInterval(beat, HEARTBEAT_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
      clearTimeout(hideTimer);
    };
  }, [slug, screenId]);

  // Precarga: las fotos de la slide actual y las 2 siguientes se descargan y decodifican de
  // antemano (new Image + decode), así que al rotar ya están listas y no se ven "cargando".
  // Se guardan en un Map para que el navegador no las suelte; las que quedan atrás se descartan
  // para no gastar memoria en TVs con poca RAM.
  const imageCacheRef = useRef(new Map<string, HTMLImageElement>());
  const preloadSlide = useCallback((s: Slide | undefined): Promise<void> => {
    const cache = imageCacheRef.current;
    return Promise.all(
      slideImageUrls(s).map((url) => {
        let img = cache.get(url);
        if (!img) {
          img = new Image();
          img.decoding = 'async';
          img.src = url;
          cache.set(url, img);
        }
        return img.decode().catch(() => undefined);
      }),
    ).then(() => undefined);
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const keep = new Set<string>();
    for (let k = 0; k <= 2; k += 1) {
      const s = slides[(slideIndex + k) % slides.length];
      slideImageUrls(s).forEach((u) => keep.add(u));
      void preloadSlide(s);
    }
    for (const url of Array.from(imageCacheRef.current.keys())) {
      if (!keep.has(url)) imageCacheRef.current.delete(url);
    }
  }, [slides, slideIndex, preloadSlide]);

  // Duración variable por slide — un comercial puede durar distinto que un slide de menú
  // (ad.durationSeconds vs SLIDE_INTERVAL_MS fijo). Se re-arma el timer cada vez que cambia
  // el slide activo en vez de un solo interval fijo para toda la rotación.
  useEffect(() => {
    if (syncOn || slides.length <= 1 || activeLayout === 'Panels') return;
    // Comercial en video: avanza por onEnded (dura lo que dure el video); este timer es solo el
    // tope de seguridad (video colgado, sin red, o más largo que MAX_VIDEO_AD_MS).
    const durationMs = slide?.kind === 'ad'
      ? (slide.ad.mediaType === 'Video' ? MAX_VIDEO_AD_MS : slide.ad.durationSeconds * 1000)
      : slide?.kind === 'combo'
        ? COMBO_SLIDE_INTERVAL_MS
        : SLIDE_INTERVAL_MS;
    let cancelled = false;
    const timer = setTimeout(() => {
      // No se cambia de slide hasta que la siguiente tenga sus fotos listas (o pase el tope).
      const nextIndex = (slideIndex + 1) % slides.length;
      void Promise.race([
        preloadSlide(slides[nextIndex]),
        new Promise<void>((resolve) => setTimeout(resolve, PRELOAD_MAX_WAIT_MS)),
      ]).then(() => {
        if (!cancelled) setSlideIndex(nextIndex);
      });
    }, durationMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slideIndex, slides, slide, preloadSlide, syncOn, activeLayout]);

  // Calibración activada desde el dashboard: todas las TVs del muro muestran la prueba de
  // sincronización (color por segundo, destello, barra que cruza el muro) hasta que se apague.
  if (calibrating) {
    const span = wall ?? null;
    return (
      <SyncTestClient
        cols={span ? span.cols : 1}
        col={span ? span.col : 0}
        label={
          span
            ? `TV ${span.row * span.cols + span.col + 1} / ${span.cols * span.rows}`
            : (language === 'en' ? 'Mirror screen' : 'Pantalla espejo')
        }
      />
    );
  }

  // Muro: durante un comercial todas las TVs lo muestran a la vez (sin header, sin grilla).
  // Si su proporción es la del muro, se estira sobre todas (cada TV recorta su tramo); si es un
  // 16:9 normal, va completo en cada TV, sincronizado frame a frame.
  if (wall && syncOn && syncFrame?.span && slide?.kind === 'ad') {
    const fitCls = slide.ad.fit === 'Cover' ? 'object-cover' : 'object-contain';
    const span = shouldSpan(mediaInfo[slide.ad.mediaUrl]?.aspect, wall, stage.w / stage.h);
    return (
      <SpanFrame wall={span ? wall : SINGLE_SCREEN} background={palette.bg}>
        {slide.ad.mediaType === 'Video' ? (
          <SyncedVideo
            key={`${slide.ad.id}-${syncFrame.frameStart}`}
            src={slide.ad.mediaUrl}
            startAt={syncFrame.frameStart}
            clock={clock}
            className={`absolute inset-0 h-full w-full ${fitCls}`}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.ad.mediaUrl} alt="" className={`absolute inset-0 h-full w-full ${fitCls}`} />
        )}
      </SpanFrame>
    );
  }

  // Flyers verticales: contenido fijo (no rota), solo los comerciales cambian. Ver BoardPanels.tsx.
  if (activeLayout === 'Panels') {
    return (
      <>
        {identify && (
          <div
            className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center"
            style={{ zIndex: 99998, background: 'rgba(0,0,0,.82)', color: '#fff', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3vw', letterSpacing: '.3em', opacity: 0.7 }}>MAALCA · PANTALLA</div>
            <div style={{ fontSize: '9vw', fontWeight: 800, lineHeight: 1.05, marginTop: '1vh' }}>{identify}</div>
          </div>
        )}
        <DebugBadge info={`diseño Panels · ${cfg.orientation} · ${cfg.panels.map((p) => p.kind).join('+')} · idioma ${language}`} />
        {stage.ready && (
          <PanelsBoard
            orientation={cfg.orientation}
            panels={cfg.panels}
            business={business}
            items={catalog.items}
            ads={catalog.screenAds ?? []}
            dailyMenu={catalog.dailyMenu ?? null}
            language={language}
            palette={palette}
            viewport={{ w: stage.w * stage.scale, h: stage.h * stage.scale }}
          />
        )}
      </>
    );
  }

  return (
    <div
      // Antes tenía aspectRatio:'16/9' además de fixed+inset-0 — cuando el viewport real no es
      // exactamente 16:9 (cualquier navegador de escritorio, no solo el Smart TV), el aspect-ratio
      // ganaba el cálculo de altura sobre el inset-0, el contenedor quedaba más alto que la
      // pantalla y el nombre/precio de los combos (anclados abajo) caían fuera del área visible
      // sin scroll posible (overflow-hidden). fixed+inset-0 ya ajusta exacto al viewport solo.
      className="fixed inset-0 overflow-hidden"
      style={{ background: palette.bg, color: palette.text, visibility: stage.ready ? 'visible' : 'hidden' }}
    >
      {identify && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          style={{ zIndex: 99998, background: 'rgba(0,0,0,.82)', color: '#fff', textAlign: 'center' }}
        >
          <div style={{ fontSize: '3vw', letterSpacing: '.3em', opacity: 0.7 }}>MAALCA · PANTALLA</div>
          <div style={{ fontSize: '9vw', fontWeight: 800, lineHeight: 1.05, marginTop: '1vh' }}>{identify}</div>
        </div>
      )}
      <DebugBadge
        info={`tema ${theme} · diseño ${activeLayout} · idioma ${language}${
          syncOn
            ? ` · sync ±${Number.isFinite(clockStats.errorMs) ? clockStats.errorMs.toFixed(0) : '?'}ms · frame ${(syncFrame?.frameIdx ?? 0) + 1}/${perTvWall ? 'slots' : frames.length}${wall ? ` · TV ${screenIndex + 1}/${screensInWall}` : ''}`
            : ''
        }`}
      />
     <div
      className="flex flex-col"
      style={{
        width: stage.w,
        height: stage.h,
        boxSizing: 'border-box',
        // Zona segura de TV: muchas pantallas (Vizio, Android TV) hacen overscan y comen los
        // bordes — los precios de la derecha salían cortados ("$18.0"). 3.5% por lado es el
        // margen estándar de broadcast para texto; el fondo igual llena toda la pantalla.
        padding: `${(stage.h * 0.035).toFixed(0)}px ${(stage.w * 0.035).toFixed(0)}px`,
        transform: `scale(${stage.scale})`,
        transformOrigin: 'top left',
      }}
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
            {slide.ad.mediaType === 'Video' && syncOn && syncFrame ? (
              <SyncedVideo
                key={`${slide.ad.id}-${syncFrame.frameStart}`}
                src={slide.ad.mediaUrl}
                startAt={syncFrame.frameStart}
                clock={clock}
                className={`absolute inset-0 h-full w-full ${slide.ad.fit === 'Cover' ? 'object-cover' : 'object-contain'}`}
              />
            ) : slide.ad.mediaType === 'Video' ? (
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
        ) : slide.kind === 'combo' && activeLayout !== 'Classic' && IMPLEMENTED_LAYOUTS.includes(activeLayout) ? (
          // Con una plantilla elegida, los destacados usan ESA plantilla (misma identidad visual que el
          // resto de la rotación); solo Classic conserva el look cinematográfico propio de los combos.
          <MenuLayoutView
            layout={activeLayout}
            items={slide.items}
            categoryName={language === 'en' ? 'House favorites' : 'Favoritos de la casa'}
            language={language}
            palette={palette}
            formatPrice={(price) => formatPrice(price, business.currency)}
          />
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
    </div>
  );
}
