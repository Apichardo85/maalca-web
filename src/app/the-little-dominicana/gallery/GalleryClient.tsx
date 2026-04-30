'use client'
import { useState, useMemo } from 'react'
import type { GalleryImage } from '../_data'

interface GalleryClientProps {
  images: GalleryImage[]
}

export default function GalleryClient({ images }: GalleryClientProps) {
  const categories = ['Todos', ...Array.from(new Set(images.map(i => i.category)))]
  const [active, setActive] = useState('Todos')
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)

  const filtered = useMemo(
    () => active === 'Todos' ? images : images.filter(i => i.category === active),
    [images, active]
  )

  return (
    <>
      {/* ── CATEGORY TABS (sticky) ────────────────────────────── */}
      <div style={{
        position: 'sticky', top: '60px', zIndex: 50,
        // Barra adapta al tema (antes: rgba fijo light → invisible sobre fondo oscuro)
        background: 'color-mix(in srgb, var(--bg) 95%, transparent)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--l3)',
        padding: '.875rem clamp(1.5rem,5vw,5rem)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              style={{
                padding: '7px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                fontFamily: 'Manrope,sans-serif', fontSize: '.8rem', fontWeight: 600,
                transition: 'all .15s',
                // Pill activa = CTA brand-stable (navy+blanco en ambos temas)
                background: active === cat ? 'var(--cta-bg)' : 'var(--l2)',
                color: active === cat ? 'var(--cta-text)' : 'var(--tm)',
              }}
            >
              {cat}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--tl)' }}>
            {filtered.length} fotos
          </span>
        </div>
      </div>

      {/* ── BENTO GALLERY GRID ───────────────────────────────── */}
      <section style={{
        padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,5rem)',
        background: 'var(--bg)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridAutoRows: '220px',
          gap: '.75rem',
        }}>
          {filtered.map((img, idx) => (
            <div
              key={img.id}
              data-gid={img.id}
              onClick={() => setLightbox(img)}
              style={{
                borderRadius: '1rem', overflow: 'hidden', cursor: 'zoom-in',
                position: 'relative',
                gridColumn: img.wide ? 'span 2' : 'span 1',
                gridRow: img.tall ? 'span 2' : 'span 1',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                loading={idx > 5 ? 'lazy' : 'eager'}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: 'block', transition: 'transform .5s ease',
                }}
              />
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,25,60,.0)',
                display: 'flex', alignItems: 'flex-end', padding: '.875rem',
                transition: 'background .2s',
              }}>
                <span style={{
                  fontFamily: 'Manrope,sans-serif', fontWeight: 500, fontSize: '.78rem',
                  color: 'rgba(255,255,255,0)', transition: 'color .2s',
                  textShadow: '0 1px 3px rgba(0,0,0,.3)',
                }}>
                  {img.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Hover styles — único bloque global que aplica a todas las tiles */}
        <style>{`
          [data-gid]:hover > div {
            background: rgba(0,25,60,.35) !important;
          }
          [data-gid]:hover span {
            color: rgba(255,255,255,.9) !important;
          }
          [data-gid]:hover img {
            transform: scale(1.05);
          }
        `}</style>
      </section>

      {/* ── LIGHTBOX ─────────────────────────────────────────── */}
      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setLightbox(null)}
        >
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              style={{
                maxWidth: '100%', maxHeight: '80vh',
                objectFit: 'contain', display: 'block',
                borderRadius: '1rem',
                boxShadow: '0 40px 80px rgba(0,0,0,.5)',
              }}
            />
            <div style={{
              position: 'absolute', bottom: '-2.5rem', left: 0, right: 0,
              textAlign: 'center',
              fontFamily: 'Manrope,sans-serif', fontSize: '.82rem', fontWeight: 300,
              color: 'rgba(255,255,255,.65)',
            }}>
              {lightbox.alt}
            </div>
            <button
              onClick={() => setLightbox(null)}
              aria-label="Cerrar"
              style={{
                position: 'absolute', top: '-1rem', right: '-1rem',
                background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', cursor: 'pointer',
                color: '#fff', fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
