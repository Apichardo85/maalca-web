'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';

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
  business: {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
  };
  initialItems: BoardItem[];
  initialCategories: BoardCategory[];
  initialScreenAds?: ScreenAd[];
  initialAdFrequency?: number | null;
  /** Preferencia del negocio, no del visitante — nadie interactúa con la TV para cambiarla. */
  language?: 'es' | 'en';
  theme?: 'Dark' | 'Light';
  transitionEffect?: TransitionEffect;
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
  },
  Light: {
    root: 'bg-white text-neutral-900',
    card: 'bg-black/5 ring-1 ring-black/10',
    mediaFallback: 'bg-neutral-200',
    dotInactive: 'rgba(0,0,0,0.15)',
    unavailableText: 'text-neutral-500',
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** How often the board re-fetches the catalog. This is the "actualización remota" —
 *  a TV left open just needs to notice dashboard changes eventually, not live/websocket. */
const REFRESH_INTERVAL_MS = 3 * 60 * 1000;
/** How long each slide (one category, up to ITEMS_PER_SLIDE items) stays on screen. */
const SLIDE_INTERVAL_MS = 9000;
const ITEMS_PER_SLIDE = 6;

interface CatalogPayload {
  items: BoardItem[];
  categories?: BoardCategory[];
  screenAds?: ScreenAd[];
  adFrequency?: number | null;
}

type Slide =
  | { kind: 'menu'; category: string; items: BoardItem[] }
  | { kind: 'ad'; ad: ScreenAd };

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

/** Fase 9 Etapa A — intercala un slide de comercial cada `frequency` slides de menú.
 *  frequency <= 0 o sin comerciales activos = sin cambios (comportamiento previo intacto). Los
 *  comerciales rotan en round-robin, no se repite siempre el mismo primero. */
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
  return result;
}

function formatPrice(price: number | null | undefined) {
  if (price == null) return '';
  return `$${price.toFixed(2)}`;
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

export function MenuBoard({
  slug, business, initialItems, initialCategories,
  initialScreenAds = [], initialAdFrequency = null,
  language = 'es', theme = 'Dark', transitionEffect = 'Fade',
}: Props) {
  const t = BOARD_STRINGS[language];
  const c = THEME_CLASSES[theme];

  const [catalog, setCatalog] = useState<CatalogPayload>({
    items: initialItems,
    categories: initialCategories,
    screenAds: initialScreenAds,
    adFrequency: initialAdFrequency,
  });
  const [slideIndex, setSlideIndex] = useState(0);

  // Poll for catalog changes made from the dashboard — this is the whole point of the
  // board being "remote-updatable": the TV never needs to be touched. Now also picks up
  // comerciales nuevos/pausados y cambios de frecuencia sin reabrir la pestaña.
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setCatalog({
          items: data.items ?? [],
          categories: data.categories ?? [],
          screenAds: data.screenAds ?? [],
          adFrequency: data.adFrequency ?? null,
        });
      } catch {
        // Transient network hiccup — keep showing the last good catalog, try again next tick.
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [slug]);

  const slides = useMemo(() => {
    const menuSlides = buildMenuSlides(catalog.items, catalog.categories ?? []);
    return interleaveAds(menuSlides, catalog.screenAds ?? [], catalog.adFrequency);
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
    const durationMs = slide?.kind === 'ad' ? slide.ad.durationSeconds * 1000 : SLIDE_INTERVAL_MS;
    const timer = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [slideIndex, slides, slide]);

  return (
    <div
      className={`fixed inset-0 flex flex-col overflow-hidden ${c.root}`}
      style={{ aspectRatio: '16 / 9' }}
    >
      {/* Header band — logo + business name, always visible so the board is
          self-identifying even to someone walking up mid-rotation. */}
      <header
        className="flex items-center gap-4 px-10 py-6"
        style={{ background: business.primaryColor }}
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
          <span className="ml-auto text-xl font-semibold uppercase tracking-widest text-white/80">
            {slide.category}
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
                loop
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
        ) : (
          <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-6">
            {slide.items.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col overflow-hidden rounded-2xl ${c.card}`}
              >
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
                  ) : item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">🍽️</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <span className="text-2xl font-bold leading-tight">{item.name}</span>
                  <span className="text-2xl font-extrabold whitespace-nowrap" style={{ color: business.primaryColor }}>
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            ))}
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
              key={s.kind === 'menu' ? `${s.category}-${i}` : `${s.ad.id}-${i}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === slideIndex ? 24 : 8,
                background: i === slideIndex ? business.primaryColor : c.dotInactive,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
