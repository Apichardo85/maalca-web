// app/the-little-dominican/menu/page.tsx — Server Component wrapper
// Interactive filtering handled by MenuPageClient (client component)

import type { Metadata } from 'next'
import Link from 'next/link'
import MenuPageClient from './MenuPageClient'
import { MOCK_DISHES, HOURS } from '../_data'

export const metadata: Metadata = {
  title: 'Menú | The Little Dominican · Elmira, NY',
  description: 'Cocina dominicana auténtica — Yaroa, Pica Pollo, Chicharrón, Churrasco, Camarones y más. Ordena online o llama al (607) 215-0990.',
}

const MENU_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Manrope:wght@300;400;500;600&display=swap');

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
  font-family: 'Manrope', system-ui, sans-serif;
  background: var(--bg);
  color: var(--tx);
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

/* Footer */
.tld-menu-footer {
  background:var(--p);color:rgba(255,255,255,.65);
  padding:2rem clamp(1.5rem,5vw,5rem);
  display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;
}

@media(max-width:640px) {
  .tld-nav-links { display:none; }
}
`

export default function MenuPage() {
  return (
    <>
      <style>{MENU_CSS}</style>

      <div className="tld" style={{ minHeight:'100vh', paddingTop:'60px' }}>

        {/* ── FIXED NAV ─────────────────────────────────────────── */}
        <nav className="tld-nav">
          <a href="/the-little-dominican" className="tld-nav-brand">
            ← The Little Dominican
          </a>
          <div className="tld-nav-links">
            {[
              { href: '/the-little-dominican',          label: 'Inicio'   },
              { href: '/the-little-dominican/gallery',  label: 'Galería'  },
              { href: '/the-little-dominican#reservar', label: 'Reservar' },
              { href: 'tel:6072150990',                 label: '📞 (607) 215-0990' },
            ].map(item => (
              <a key={item.label} href={item.href} className="tld-nav-link">{item.label}</a>
            ))}
          </div>
        </nav>

        {/* ── INTERACTIVE MENU CLIENT ───────────────────────────── */}
        <MenuPageClient dishes={MOCK_DISHES} />

        {/* ── MINI INFO STRIP ───────────────────────────────────── */}
        <section style={{ background:'var(--l1)', padding:'2.5rem clamp(1.5rem,5vw,5rem)', borderTop:'1px solid var(--l3)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', display:'flex', flexWrap:'wrap', gap:'2rem', justifyContent:'space-between', alignItems:'start' }}>

            <div>
              <div className="tld-label" style={{ marginBottom:'.5rem' }}>Horario</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {HOURS.map(h => (
                  <div key={h.day} style={{ display:'flex', gap:'1.5rem', fontSize:'.82rem' }}>
                    <span style={{ color:'var(--tm)', fontWeight:300, minWidth:'90px' }}>{h.day}</span>
                    <span style={{ color: h.closed ? 'var(--s)' : 'var(--p)', fontWeight:500 }}>
                      {h.closed ? 'Cerrado' : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="tld-label" style={{ marginBottom:'.5rem' }}>Contacto</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <a href="tel:6072150990" style={{ fontSize:'.88rem', color:'var(--p)', textDecoration:'none', fontWeight:500 }}>📞 (607) 215-0990</a>
                <p style={{ fontSize:'.82rem', color:'var(--tm)', fontWeight:300 }}>📍 315 E Water St, Elmira, NY 14901</p>
              </div>
            </div>

            <div>
              <div className="tld-label" style={{ marginBottom:'.5rem' }}>Servicios</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {['Dine-in','Pickup','Delivery','Catering','Música en vivo'].map(s => (
                  <span key={s} style={{ padding:'4px 12px', background:'var(--l2)', borderRadius:'9999px', fontSize:'.76rem', fontWeight:500, color:'var(--tm)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="tld-menu-footer">
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
