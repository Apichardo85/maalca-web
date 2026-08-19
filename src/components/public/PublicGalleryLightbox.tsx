'use client';
// src/components/public/PublicGalleryLightbox.tsx
//
// Shared gallery viewer used by all 4 public templates' GallerySection. A static
// vertical grid of up to 12 photos was growing the page a lot — this replaces it
// with a compact horizontal-scroll thumbnail strip (fixed height, doesn't grow
// with photo count) + click-to-open fullscreen lightbox with prev/next/keyboard
// navigation, matching the "carrusel / agrupadas, click para ver" usability ask.
import { useEffect, useState } from 'react';

export function PublicGalleryLightbox({
  images,
  accent = '#111827',
  getText,
}: {
  images: string[];
  /** Border/ring color for the active thumbnail + lightbox nav buttons — pass the template's accent. */
  accent?: string;
  getText: (es: string, en: string) => string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = () => setOpenIndex(null);
  const prev = () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    // Evita que el fondo haga scroll detrás del lightbox mientras está abierto.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Tira horizontal — alto fijo, nunca crece con la cantidad de fotos (hasta 12). */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" style={{ scrollSnapType: 'x proximity' }}>
        {images.map((url, i) => (
          <button
            key={url + i}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28"
            style={{ scrollSnapAlign: 'start' }}
            aria-label={getText(`Ver foto ${i + 1}`, `View photo ${i + 1}`)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label={getText('Cerrar', 'Close')}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label={getText('Anterior', 'Previous')}
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 sm:left-4"
            >
              ‹
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex]}
            alt=""
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            style={{ boxShadow: `0 0 0 1px ${accent}33` }}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label={getText('Siguiente', 'Next')}
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 sm:right-4"
            >
              ›
            </button>
          )}

          {images.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {openIndex + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
