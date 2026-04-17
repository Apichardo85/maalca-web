'use client'
// Gallery page shell — client component to consume useTldI18n.
// Metadata lives en el server wrapper (page.tsx).
import Link from 'next/link'
import TLDNav from '../TLDNav'
import GalleryClient from './GalleryClient'
import { GALLERY_IMAGES } from '../_data'
import { useTldI18n } from '../tld-i18n'

const GALLERY_CSS = `@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Manrope:wght@300;400;500;600&display=swap');
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
.tld-nav-links { display:flex;align-items:center;gap:2px; }
.tld-nav-link {
  padding:7px 13px;border-radius:9999px;
  font-size:.78rem;font-weight:500;color:var(--tm);
  text-decoration:none;transition:background .15s,color .15s;
}
.tld-nav-link:hover { background:var(--l2);color:var(--p); }
.tld-hamburger {
  display:none;background:none;border:none;cursor:pointer;
  font-size:1.4rem;color:var(--p);padding:6px 8px;line-height:1;
}
.tld-mobile-nav {
  position:fixed;top:60px;left:0;right:0;z-index:99;
  background:rgba(248,249,250,.97);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(0,25,60,.08);
  display:flex;flex-direction:column;padding:1rem 1.5rem 1.25rem;gap:.25rem;
  transform:translateY(-110%);opacity:0;
  transition:transform .22s ease,opacity .18s ease;
  pointer-events:none;
}
.tld-mobile-nav-open { transform:translateY(0);opacity:1;pointer-events:auto; }
.tld-mobile-link {
  padding:11px 14px;border-radius:.625rem;
  font-size:.9rem;font-weight:500;color:var(--tx);
  text-decoration:none;transition:background .15s;
}
.tld-mobile-link:hover { background:var(--l2); }
.tld-gallery-footer {
  background:var(--p);color:rgba(255,255,255,.65);
  padding:2rem clamp(1.5rem,5vw,5rem);
  display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;
}
@media(max-width:640px) {
  .tld-nav-links { display:none; }
  .tld-hamburger { display:block; }
}`

export default function GalleryShell() {
  const { t } = useTldI18n()
  return (
    <>
      <style>{GALLERY_CSS}</style>
      <div className="tld" style={{ minHeight:'100vh', paddingTop:'60px' }}>
        <TLDNav />
        {/* ── HERO HEADER ───────────────────────────────────────── */}
        <section style={{ background:'var(--p)', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)', textAlign:'center' }}>
          <div style={{ fontSize:'.7rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.45)', marginBottom:'1rem' }}>
            {t.galleryHeroLabel}
          </div>
          <h1 style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:300, color:'#fff', lineHeight:1.1, marginBottom:'1rem' }}>
            {t.galleryHeroH1}
          </h1>
          <p style={{ fontSize:'.9rem', fontWeight:300, color:'rgba(255,255,255,.65)', maxWidth:'46ch', margin:'0 auto' }}>
            {t.galleryHeroP}
          </p>
        </section>
        <GalleryClient images={GALLERY_IMAGES} />
        {/* ── CTA STRIP ─────────────────────────────────────────── */}
        <section style={{ background:'var(--l1)', padding:'3rem clamp(1.5rem,5vw,5rem)', textAlign:'center' }}>
          <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:300, color:'var(--p)', marginBottom:'1rem' }}>
            {t.galleryReadyH2}
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
              {t.galleryReserveCta}
            </a>
            <a href="/the-little-dominican/menu"
              style={{
                display:'inline-flex', alignItems:'center', gap:'8px',
                padding:'12px 24px', borderRadius:'9999px',
                background:'var(--s)', color:'#fff', textDecoration:'none',
                fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.85rem',
              }}
            >
              {t.galleryViewMenuCta}
            </a>
          </div>
        </section>
        <footer className="tld-gallery-footer">
          <p style={{ fontSize:'.78rem' }}>© 2026 The Little Dominican — Elmira, NY</p>
          <p style={{ fontSize:'.78rem' }}>
            {t.footerPoweredBy}{' '}
            <Link href="/" style={{ color:'rgba(255,255,255,.8)', fontWeight:600, textDecoration:'none' }}>MaalCa Ecosistema</Link>
          </p>
        </footer>
      </div>
    </>
  )
}
