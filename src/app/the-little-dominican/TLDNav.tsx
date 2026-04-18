'use client'
import { useEffect, useState } from 'react'
import { useTldI18n } from './tld-i18n'
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage'

const WA_URL = `https://wa.me/16078574226?text=${encodeURIComponent('Hola, quiero ordenar. ¿Qué tienen disponible ahora?')}`

export default function TLDNav() {
  const [open, setOpen] = useState(false)
  const { t } = useTldI18n()
  const { language, setLanguage } = useSimpleLanguage()

  // ── Dark mode (sincroniza con el sistema global data-theme) ──
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark' | null)
    const prefersDark = typeof window !== 'undefined'
      && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    if (initial === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
  }, [])
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
  }

  const items = [
    { href: '/the-little-dominican',          label: t.navHome    },
    { href: '/the-little-dominican/menu',     label: t.navMenu    },
    { href: '/the-little-dominican/gallery',  label: t.navGallery },
    { href: 'tel:6078574226',                 label: t.navCall    },
  ]

  const toggleLang = () => setLanguage(language === 'en' ? 'es' : 'en')

  return (
    <>
      <nav className="tld-nav">
        <a href="/the-little-dominican" className="tld-nav-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/affiliates/tld/Logo.png" alt="" width={32} height={32} style={{ display: 'block', objectFit: 'contain' }} />
          <span>The Little Dominican</span>
        </a>
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
          <button
            onClick={toggleTheme}
            className="tld-nav-link"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,25,60,.15)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              letterSpacing: '.02em',
            }}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
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
        <button
          onClick={() => { toggleTheme(); setOpen(false) }}
          className="tld-mobile-link"
          style={{
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {theme === 'light'
            ? (language === 'en' ? '🌙 Dark mode' : '🌙 Modo oscuro')
            : (language === 'en' ? '☀️ Light mode' : '☀️ Modo claro')}
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
