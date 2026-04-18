'use client'
// Menu page shell — client component to consume useTldI18n.
// Metadata lives en el server wrapper (page.tsx).
import Link from 'next/link'
import TLDNav from '../TLDNav'
import MenuPageClient from './MenuPageClient'
import { MOCK_DISHES, HOURS, type MenuItem } from '../_data'
import { useTldI18n } from '../tld-i18n'

const MENU_CSS = `@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Manrope:wght@300;400;500;600&display=swap');
.tld {
  --p:  #00193c;
  --s:  #e12531;
  --t:  #3eaa59;
  --bg: #f8f9fa;
  --l1: #f3f4f5;
  --l2: #edeeef;
  --l3: #e4e5e7;
  --tx: #191c1d;
  --tm: #44474f;
  --tl: #74777f;
  --sh: 0 20px 40px rgba(25,28,29,.06);
  --navy-footer: #00193c;

  /* ─── Brand-stable tokens (no invierten en dark mode) ────────────
     --p se invierte para que los títulos queden legibles sobre fondo
     oscuro. Pero los CTAs de marca (botones primarios, hero) deben
     mantener navy+blanco en ambos temas — si usáramos --p como fondo
     de botón, quedaría blanco sobre blanco en dark. Estos tokens son
     estables y no se tocan en el bloque [data-theme="dark"].
     ───────────────────────────────────────────────────────────── */
  --cta-bg:      #00193c;
  --cta-text:    #ffffff;
  --hero-bg:     #00193c;
  --hero-text:   #ffffff;
  /* Input blanco con texto oscuro — va sobre el hero navy estable */
  --input-bg:    #ffffff;
  --input-text:  #191c1d;

  font-family: 'Manrope', system-ui, sans-serif;
  background: var(--bg);
  color: var(--tx);
}
/* ─── Dark mode ─────────────────────────────────── */
[data-theme="dark"] .tld {
  --p:  #f5f5f5;
  --s:  #ff4d5c;
  --t:  #4bc267;
  --bg: #0a0a0a;
  --l1: #141414;
  --l2: #1c1c1c;
  --l3: #2a2a2a;
  --tx: #f5f5f5;
  --tm: #b8bcc4;
  --tl: #8b8f97;
  --sh: 0 20px 40px rgba(0,0,0,.45);
  /* --cta-*, --hero-*, --input-* NO se redefinen: son brand-stable */
}
.tld-label {
  font-size: .68rem; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: var(--tl);
}
.tld-body {
  font-size: .88rem; font-weight: 300; line-height: 1.65; color: var(--tm);
}
/* Fixed nav */
.tld-nav {
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:color-mix(in srgb, var(--bg) 90%, transparent);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid color-mix(in srgb, var(--p) 8%, transparent);
  height:60px;padding:0 clamp(1rem,3vw,5rem);
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
  padding:8px 14px;border-radius:9999px;
  font-size:.78rem;font-weight:500;color:var(--tm);
  text-decoration:none;transition:background .15s,color .15s;
  min-height:36px;display:inline-flex;align-items:center;
}
.tld-nav-link:hover { background:var(--l2);color:var(--p); }
.tld-hamburger {
  display:none;background:none;border:none;cursor:pointer;
  font-size:1.4rem;color:var(--p);padding:6px 8px;line-height:1;
}
.tld-mobile-nav {
  position:fixed;top:60px;left:0;right:0;z-index:99;
  background:color-mix(in srgb, var(--bg) 97%, transparent);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid color-mix(in srgb, var(--p) 10%, transparent);
  display:flex;flex-direction:column;padding:1rem 1.5rem 1.25rem;gap:.25rem;
  transform:translateY(-110%);opacity:0;
  transition:transform .22s ease,opacity .18s ease;
  pointer-events:none;
}
.tld-mobile-nav-open {
  transform:translateY(0);opacity:1;pointer-events:auto;
}
.tld-mobile-link {
  padding:11px 14px;border-radius:.625rem;
  font-size:.9rem;font-weight:500;color:var(--tx);
  text-decoration:none;transition:background .15s;
}
.tld-mobile-link:hover { background:var(--l2); }
/* Footer */
.tld-menu-footer {
  background:var(--navy-footer);color:rgba(255,255,255,.65);
  padding:2rem clamp(1.5rem,5vw,5rem);
  display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;
}
/* ── Mobile Bottom Nav ──────────────────────────────────── */
.tld-bottom-nav {
  display:none;
  position:fixed;bottom:0;left:0;right:0;z-index:100;
  background:color-mix(in srgb, var(--bg) 95%, transparent);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-top:1px solid color-mix(in srgb, var(--p) 10%, transparent);
  padding:6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
}
.tld-bottom-nav-inner {
  display:flex;justify-content:space-around;align-items:center;
  max-width:480px;margin:0 auto;
}
.tld-bottom-link {
  display:flex;flex-direction:column;align-items:center;gap:2px;
  padding:6px 12px;border-radius:12px;
  font-size:.62rem;font-weight:600;color:var(--tm);
  text-decoration:none;transition:background .15s,color .15s;
  letter-spacing:.02em;
  min-width:56px;min-height:44px;justify-content:center;
}
.tld-bottom-link:hover,.tld-bottom-link:active { background:var(--l2);color:var(--p); }
.tld-bottom-link svg { width:20px;height:20px; }
@media(max-width:640px) {
  .tld-nav-links { display:none; }
  .tld-bottom-nav { display:block; }
  .tld { padding-bottom:72px; }
  .tld-info-strip { flex-direction:column; }
}`

export default function MenuShell({ dishes = MOCK_DISHES }: { dishes?: MenuItem[] } = {}) {
  const { t } = useTldI18n()
  return (
    <>
      <style>{MENU_CSS}</style>
      <div className="tld" style={{ minHeight: '100vh', paddingTop: '60px' }}>
        {/* ── FIXED NAV (with lang toggle) ─────────────────────── */}
        <TLDNav />
        {/* ── INTERACTIVE MENU CLIENT ───────────────────────────── */}
        <MenuPageClient dishes={dishes} />
        {/* ── MINI INFO STRIP ───────────────────────────────────── */}
        <section style={{ background: 'var(--l1)', padding: '2.5rem clamp(1.5rem,5vw,5rem)', borderTop: '1px solid var(--l3)' }}>
          <div className="tld-info-strip" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div className="tld-label" style={{ marginBottom: '.5rem' }}>{t.menuInfoHours}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {HOURS.map(h => (
                  <div key={h.day} style={{ display: 'flex', gap: '1.5rem', fontSize: '.82rem' }}>
                    <span style={{ color: 'var(--tm)', fontWeight: 300, minWidth: '90px' }}>{h.day}</span>
                    <span style={{ color: h.closed ? 'var(--s)' : 'var(--p)', fontWeight: 500 }}>
                      {h.closed ? t.closed : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="tld-label" style={{ marginBottom: '.5rem' }}>{t.menuInfoContact}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a href="tel:6078574226" style={{ fontSize: '.88rem', color: 'var(--p)', textDecoration: 'none', fontWeight: 500 }}>📞 (607) 857-4226</a>
                <p style={{ fontSize: '.82rem', color: 'var(--tm)', fontWeight: 300 }}>📍 315 E Water St, Elmira, NY 14901</p>
              </div>
            </div>
            <div>
              <div className="tld-label" style={{ marginBottom: '.5rem' }}>{t.menuInfoServices}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Dine-in', 'Pickup', 'Delivery', 'Catering'].map(s => (
                  <span key={s} style={{ padding: '4px 12px', background: 'var(--l2)', borderRadius: '9999px', fontSize: '.76rem', fontWeight: 500, color: 'var(--tm)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="tld-menu-footer">
          <p style={{ fontSize: '.78rem' }}>© 2026 The Little Dominican — Elmira, NY</p>
          <p style={{ fontSize: '.78rem' }}>
            {t.footerPoweredBy}{' '}
            <Link href="/" style={{ color: 'rgba(255,255,255,.8)', fontWeight: 600, textDecoration: 'none' }}>MaalCa Ecosistema</Link>
          </p>
        </footer>
        {/* ── MOBILE BOTTOM NAV ────────────────────────────────────── */}
        <nav className="tld-bottom-nav" aria-label="Mobile nav">
          <div className="tld-bottom-nav-inner">
            <a href="/the-little-dominican" className="tld-bottom-link">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
              {t.bottomNavHome}
            </a>
            <a href="/the-little-dominican/gallery" className="tld-bottom-link">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {t.bottomNavGallery}
            </a>
            <a href="tel:6078574226" className="tld-bottom-link" style={{ color: 'var(--p)' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {t.bottomNavCall}
            </a>
            <a href="/the-little-dominican#reservar" className="tld-bottom-link">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {t.bottomNavReserve}
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
