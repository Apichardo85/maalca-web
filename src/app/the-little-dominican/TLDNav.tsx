'use client'
import { useState } from 'react'
import { useTldI18n } from './tld-i18n'
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage'

const WA_URL = `https://wa.me/16072150990?text=${encodeURIComponent('Hola, quiero ordenar. ¿Qué tienen disponible ahora?')}`

export default function TLDNav() {
  const [open, setOpen] = useState(false)
  const { t } = useTldI18n()
  const { language, setLanguage } = useSimpleLanguage()

  const items = [
    { href: '#',                              label: t.navHome    },
    { href: '/the-little-dominican/menu',     label: t.navMenu    },
    { href: '/the-little-dominican/gallery',  label: t.navGallery },
    { href: 'tel:6072150990',                 label: t.navCall    },
  ]

  const toggleLang = () => setLanguage(language === 'en' ? 'es' : 'en')

  return (
    <>
      <nav className="tld-nav">
        <a href="/the-little-dominican" className="tld-nav-brand">The Little Dominican</a>
        {/* Desktop links */}
        <div className="tld-nav-links">
          {items.map(item => (
            <a key={item.label} href={item.href} className="tld-nav-link">{item.label}</a>
          ))}
          <button
            onClick={toggleLang}
            className="tld-nav-link"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,25,60,.15)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              letterSpacing: '.02em',
            }}
            aria-label="Switch language"
          >
            🌐 {language === 'en' ? 'ES' : 'EN'}
          </button>
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
            {t.navOrder}
          </a>
        </div>
        {/* Mobile hamburger */}
        <button
          className="tld-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? t.navClose : t.navOpen}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>
      {/* Mobile menu */}
      <div className={`tld-mobile-nav${open ? ' tld-mobile-nav-open' : ''}`}>
        {items.map(item => (
          <a
            key={item.label}
            href={item.href}
            className="tld-mobile-link"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <button
          onClick={() => { toggleLang(); setOpen(false) }}
          className="tld-mobile-link"
          style={{
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          🌐 {language === 'en' ? 'Español' : 'English'}
        </button>
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
          {language === 'en' ? '💬 Order via WhatsApp' : '💬 Ordenar por WhatsApp'}
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
