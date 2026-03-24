'use client'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '#',                              label: 'Inicio'    },
  { href: '/the-little-dominican/menu',     label: 'Menú'      },
  { href: '/the-little-dominican/gallery',  label: 'Galería'   },
  { href: '#reservar',                      label: 'Reservar'  },
  { href: 'tel:6072150990',                 label: '📞 Llamar' },
]

export default function TLDNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="tld-nav">
        <a href="#" className="tld-nav-brand">The Little Dominican</a>

        {/* Desktop links */}
        <div className="tld-nav-links">
          {NAV_ITEMS.map(item => (
            <a key={item.label} href={item.href} className="tld-nav-link">{item.label}</a>
          ))}
          <a href="/the-little-dominican/menu" className="btn-s" style={{ padding: '8px 18px', fontSize: '.76rem', marginLeft: '6px' }}>
            Ordenar →
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="tld-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu — slides from top below nav */}
      <div className={`tld-mobile-nav${open ? ' tld-mobile-nav-open' : ''}`}>
        {NAV_ITEMS.map(item => (
          <a
            key={item.label}
            href={item.href}
            className="tld-mobile-link"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a
          href="/the-little-dominican/menu"
          className="btn-s"
          style={{ marginTop: '8px', justifyContent: 'center', textAlign: 'center' }}
          onClick={() => setOpen(false)}
        >
          Ordenar ahora →
        </a>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
            background: 'rgba(0,15,35,.35)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
