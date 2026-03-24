// app/the-little-dominican/gallery/page.tsx — Server Component
// Bento grid gallery with category tabs (GalleryClient handles tab filtering)

import type { Metadata } from 'next'
import Link from 'next/link'
import GalleryClient from './GalleryClient'
import { GALLERY_IMAGES } from '../_data'

export const metadata: Metadata = {
  title: 'Galería | The Little Dominican · Elmira, NY',
  description: 'Fotos del restaurante, platos y ambiente de The Little Dominican en Elmira, NY.',
}

const GALLERY_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Manrope:wght@300;400;500;600&display=swap');

.tld {
  --p:  #00193c;
  --s:  #e12531;
  --bg: #f8f9fa;
  --l1: #f3f4f5;
  --l2: #edeeef;
  --l3: #e4e5e7;
  --tx: #191c1d;
  --tm: #44474f;
  --tl: #74777f;
  font-family: 'Manrope', system-ui, sans-serif;
  background: var(--bg);
  color: var(--tx);
}
.tld-label {
  font-size: .68rem; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: var(--tl);
}

/* Fixed nav */
.tld-nav {
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(248,249,250,.90);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(0,25,60,.06);
  height:60px;padding:0 clamp(1.5rem,5vw,5rem);
  display:flex;align-items:center;justify-content:space-between;
}
.tld-nav-brand {
  font-family:'Newsreader',Georgia,serif;
  font-size:1.05rem;font-weight:400;color:var(--p);text-decoration:none;
}
.tld-nav-links {
  display:flex;align-items:center;gap:2px;
}
.tld-nav-link {
  padding:7px 13px;border-radius:9999px;
  font-size:.78rem;font-weight:500;color:var(--tm);
  text-decoration:none;transition:background .15s,color .15s;
}
.tld-nav-link:hover { background:var(--l2);color:var(--p); }

.tld-gallery-footer {
  background:var(--p);color:rgba(255,255,255,.65);
  padding:2rem clamp(1.5rem,5vw,5rem);
  display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;
}

@media(max-width:640px) {
  .tld-nav-links { display:none; }
}
`

export default function GalleryPage() {
  return (
    <>
      <style>{GALLERY_CSS}</style>

      <div className="tld" style={{ minHeight:'100vh', paddingTop:'60px' }}>

        {/* ── FIXED NAV ─────────────────────────────────────────── */}
        <nav className="tld-nav">
          <a href="/the-little-dominican" className="tld-nav-brand">
            ← The Little Dominican
          </a>
          <div className="tld-nav-links">
            {[
              { href: '/the-little-dominican',         label: 'Inicio'   },
              { href: '/the-little-dominican/menu',    label: 'Menú'     },
              { href: '/the-little-dominican#reservar',label: 'Reservar' },
              { href: 'tel:6072150990',                label: '📞 Llamar' },
            ].map(item => (
              <a key={item.label} href={item.href} className="tld-nav-link">{item.label}</a>
            ))}
          </div>
        </nav>

        {/* ── HERO HEADER ───────────────────────────────────────── */}
        <section style={{ background:'var(--p)', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)', textAlign:'center' }}>
          <div style={{ fontSize:'.7rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:'1rem' }}>
            Galería
          </div>
          <h1 style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:300, color:'#fff', lineHeight:1.1, marginBottom:'1rem' }}>
            Vive la experiencia
          </h1>
          <p style={{ fontSize:'.9rem', fontWeight:300, color:'rgba(255,255,255,.65)', maxWidth:'46ch', margin:'0 auto' }}>
            Platos, ambiente y momentos de The Little Dominican en Elmira, NY.
          </p>
        </section>

        {/* ── GALLERY CLIENT (tabs + bento grid) ───────────────── */}
        <GalleryClient images={GALLERY_IMAGES} />

        {/* ── CTA STRIP ─────────────────────────────────────────── */}
        <section style={{ background:'var(--l1)', padding:'3rem clamp(1.5rem,5vw,5rem)', textAlign:'center' }}>
          <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:300, color:'var(--p)', marginBottom:'1rem' }}>
            ¿Listo para vivir la experiencia?
          </div>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/the-little-dominican#reservar"
              style={{
                display:'inline-flex', alignItems:'center', gap:'8px',
                padding:'12px 24px', borderRadius:'9999px',
                background:'linear-gradient(135deg,#00193c 0%,#002d62 100%)',
                color:'#fff', textDecoration:'none',
                fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.85rem',
              }}
            >
              Reservar Mesa
            </a>
            <a href="/the-little-dominican/menu"
              style={{
                display:'inline-flex', alignItems:'center', gap:'8px',
                padding:'12px 24px', borderRadius:'9999px',
                background:'var(--s)', color:'#fff', textDecoration:'none',
                fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.85rem',
              }}
            >
              Ver Menú →
            </a>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="tld-gallery-footer">
          <p style={{ fontSize:'.78rem' }}>© 2026 The Little Dominican — Elmira, NY</p>
          <p style={{ fontSize:'.78rem' }}>
            Powered by{' '}
            <Link href="/" style={{ color:'rgba(255,255,255,.8)', fontWeight:600, textDecoration:'none' }}>MaalCa Ecosistema</Link>
          </p>
        </footer>
      </div>
    </>
  )
}
