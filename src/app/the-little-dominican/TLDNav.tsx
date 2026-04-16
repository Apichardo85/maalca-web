'use client'
import { useState } from 'react'
const NAV_ITEMS = [
  { href: '#',                              label: 'Inicio'    },
  { href: '/the-little-dominican/menu',     label: 'Menú'      },
  { href: '/the-little-dominican/gallery',  label: 'Galería'   },
  { href: 'tel:6072150990',                 label: '📞 Llamar' },
]
const WA_URL = `https://wa.me/16072150990?text=${encodeURIComponent('Hola, quiero ordenar. ¿Qué tienen disponible ahora?')}`
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
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 18px',
              fontSize: '.76rem',
              marginLeft: '6px',
              borderRadius: '9999px',
              background: '#25d366',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 6px 14px rgba(37,211,102,.3)',
            }}
          >
            💬 Ordenar
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
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: '8px',
            justifyContent: 'center',
            textAlign: 'center',
            background: '#25d366',
            color: '#fff',
            fontWeight: 700,
            padding: '14px 24px',
            borderRadius: '9999px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onClick={() => setOpen(false)}
        >
          💬 Ordenar por WhatsApp
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
