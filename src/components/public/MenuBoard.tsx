'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PublicTemplateProps } from '@/lib/templates/registry';

type BoardItem = PublicTemplateProps['items'][number];
type BoardCategory = PublicTemplateProps['categories'][number];

interface Props {
  slug: string;
  business: {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
  };
  initialItems: BoardItem[];
  initialCategories: BoardCategory[];
}

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
}

/** Groups items by category into fixed-size chunks — each chunk is one slide, so a
 *  category with more items than fit on screen spills into a second, third, etc. slide
 *  instead of shrinking everything down to fit (bad for distance viewing). */
function buildSlides(items: BoardItem[], categories: BoardCategory[]) {
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

  const slides: { category: string; items: BoardItem[] }[] = [];
  for (const key of orderedKeys) {
    const catItems = byCategory.get(key);
    if (!catItems || catItems.length === 0) continue;
    for (let i = 0; i < catItems.length; i += ITEMS_PER_SLIDE) {
      slides.push({ category: key, items: catItems.slice(i, i + ITEMS_PER_SLIDE) });
    }
  }
  return slides;
}

function formatPrice(price: number | null | undefined) {
  if (price == null) return '';
  return `$${price.toFixed(2)}`;
}

export function MenuBoard({ slug, business, initialItems, initialCategories }: Props) {
  const [catalog, setCatalog] = useState<CatalogPayload>({ items: initialItems, categories: initialCategories });
  const [slideIndex, setSlideIndex] = useState(0);

  // Poll for catalog changes made from the dashboard — this is the whole point of the
  // board being "remote-updatable": the TV never needs to be touched.
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setCatalog({ items: data.items ?? [], categories: data.categories ?? [] });
      } catch {
        // Transient network hiccup — keep showing the last good catalog, try again next tick.
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [slug]);

  const slides = useMemo(
    () => buildSlides(catalog.items, catalog.categories ?? []),
    [catalog],
  );

  // Reset to slide 0 whenever the slide set changes shape (items added/removed) so the
  // index never points past the end.
  useEffect(() => {
    setSlideIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[slideIndex];

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-neutral-950 text-white"
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
        {slide && (
          <span className="ml-auto text-xl font-semibold uppercase tracking-widest text-white/80">
            {slide.category}
          </span>
        )}
      </header>

      {/* Slide content */}
      <main className="flex flex-1 items-center justify-center px-10 py-8">
        {!slide ? (
          <p className="text-2xl text-white/60">Catálogo no disponible por el momento.</p>
        ) : (
          <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-6">
            {slide.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
              >
                <div className="relative flex-1 overflow-hidden bg-neutral-800">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">🍽️</div>
                  )}
                  {/* TODO(Fase 7): if/when items carry a videoUrl (not in the schema yet —
                      see plans/spec-maalca-web-espacio-v2.md), swap the <img> above for a
                      looping muted <video> here when videoUrl is present. */}
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
      </main>

      {/* Pagination dots — subtle, just enough to signal "there's more" without being
          interactive chrome (nothing on this screen is meant to be clicked). */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-6">
          {slides.map((s, i) => (
            <span
              key={`${s.category}-${i}`}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === slideIndex ? 24 : 8,
                background: i === slideIndex ? business.primaryColor : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
