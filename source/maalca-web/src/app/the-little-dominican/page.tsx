// app/the-little-dominican/page.tsx — Server Component
// Design: "Tropical Elegance" — light theme, Newsreader + Manrope
// Nav: fixed glassmorphism top bar
// Sections: Hero · Story · Signature Bento · Sanctuary · Gallery Teaser · Events · Reservation · Footer

import type { Metadata } from 'next'
import Link from 'next/link'
import TLDNav from './TLDNav'
import ReservationForm from './ReservationForm'
import { MOCK_DISHES, MOCK_EVENTS, HOURS, GALLERY_IMAGES, FEATURED_DISHES } from './_data'

export const metadata: Metadata = {
  title: 'The Little Dominican | Elmira, NY',
  description: "Traditional Dominican with a modern spin — bringing abuela's cooking straight to you. Dine-in, pickup y delivery en Elmira, NY.",
}

// ─── Shared CSS (design system + page-specific) ──────────────────────────────

const TLD_CSS = `
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

/* ── Typography ── */
.tld-serif-xl {
  font-family: 'Newsreader', Georgia, serif;
  font-size: clamp(2.8rem, 7vw, 5rem);
  font-weight: 300; line-height: 1.06; letter-spacing: -.02em;
}
.tld-serif-lg {
  font-family: 'Newsreader', Georgia, serif;
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 400; line-height: 1.15; letter-spacing: -.015em; color: var(--p);
}
.tld-serif-md {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.05rem; font-weight: 400; line-height: 1.3; color: var(--p);
}
.tld-label {
  font-size: .68rem; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: var(--tl);
}
.tld-body {
  font-size: .88rem; font-weight: 300; line-height: 1.65; color: var(--tm);
}

/* ── Buttons ── */
.btn-p {
  display:inline-flex;align-items:center;gap:8px;
  padding:13px 26px;border-radius:9999px;border:none;cursor:pointer;
  font-family:'Manrope',sans-serif;font-size:.85rem;font-weight:600;
  letter-spacing:.02em;text-decoration:none;
  background:linear-gradient(135deg,#00193c 0%,#002d62 100%);
  color:#fff;box-shadow:var(--sh);transition:opacity .2s,transform .15s;
}
.btn-p:hover { opacity:.9; transform:translateY(-1px); }

.btn-s {
  display:inline-flex;align-items:center;gap:8px;
  padding:13px 26px;border-radius:9999px;border:none;cursor:pointer;
  font-family:'Manrope',sans-serif;font-size:.85rem;font-weight:600;
  letter-spacing:.02em;text-decoration:none;
  background:var(--s);color:#fff;transition:opacity .2s,transform .15s;
}
.btn-s:hover { opacity:.9; transform:translateY(-1px); }

.btn-g {
  display:inline-flex;align-items:center;gap:6px;
  padding:11px 22px;border-radius:9999px;border:none;cursor:pointer;
  font-family:'Manrope',sans-serif;font-size:.85rem;font-weight:600;
  text-decoration:none;background:transparent;color:var(--p);
  border: 1.5px solid rgba(0,25,60,.15);
  transition:background .15s,border-color .15s;
}
.btn-g:hover { background:var(--l2); border-color:rgba(0,25,60,.25); }

/* ── Fixed Nav ── */
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
  white-space:nowrap;
}
.tld-nav-links {
  display:flex;align-items:center;gap:2px;
}
.tld-nav-link {
  padding:7px 13px;border-radius:9999px;
  font-size:.78rem;font-weight:500;color:var(--tm);
  text-decoration:none;transition:background .15s,color .15s;white-space:nowrap;
}
.tld-nav-link:hover { background:var(--l2);color:var(--p); }

/* ── Hero ── */
.tld-hero {
  position:relative;min-height:90svh;
  display:flex;align-items:flex-end;padding-bottom:5rem;
  overflow:hidden;
}
.tld-hero-bg {
  position:absolute;inset:0;z-index:0;
}
.tld-hero-bg img {
  width:100%;height:100%;object-fit:cover;display:block;
}
.tld-hero-overlay {
  position:absolute;inset:0;z-index:1;
  background:linear-gradient(to top, rgba(0,10,25,.75) 0%, rgba(0,10,25,.3) 55%, rgba(0,10,25,.05) 100%);
}
.tld-hero-content {
  position:relative;z-index:2;
  width:100%;max-width:1280px;margin:0 auto;
  padding:0 clamp(1.5rem,5vw,5rem);
}

/* ── Dish cards ── */
.dish-card {
  background:var(--l1);border-radius:.875rem;overflow:hidden;
  display:flex;flex-direction:column;
  transition:background .2s,box-shadow .2s;
}
.dish-card:hover { background:var(--l2);box-shadow:var(--sh); }
.dish-card:hover .dish-img { transform:scale(1.04); }
.dish-img-wrap { aspect-ratio:4/3;overflow:hidden;background:var(--l3); }
.dish-img { width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease; }
.dish-body { padding:1.1rem 1.25rem;display:flex;flex-direction:column;gap:.6rem;flex:1; }

/* ── Chips ── */
.chip-v { display:inline-flex;align-items:center;gap:4px;padding:2px 9px;
  background:#dcfce7;color:#166534;font-size:.6rem;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;border-radius:9999px; }
.chip-g { display:inline-flex;align-items:center;gap:4px;padding:2px 9px;
  background:#e0f2fe;color:#0c4a6e;font-size:.6rem;font-weight:600;
  letter-spacing:.06em;text-transform:uppercase;border-radius:9999px; }

/* ── Bento grid ── */
.bento-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  grid-template-rows:auto auto;
  gap:1rem;
}
.bento-feature {
  grid-row:span 2;
  border-radius:1.25rem;overflow:hidden;position:relative;
  min-height:380px;
}
.bento-feature img {
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s ease;
}
.bento-feature:hover img { transform:scale(1.03); }
.bento-overlay {
  position:absolute;inset:0;
  background:linear-gradient(to top, rgba(0,10,25,.7) 0%, transparent 55%);
  display:flex;flex-direction:column;justify-content:flex-end;
  padding:1.4rem;
}
.bento-small {
  border-radius:1rem;overflow:hidden;position:relative;
  aspect-ratio:4/3;
}
.bento-small img {
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s ease;
}
.bento-small:hover img { transform:scale(1.04); }
.bento-small-overlay {
  position:absolute;inset:0;
  background:linear-gradient(to top, rgba(0,10,25,.65) 0%, transparent 55%);
  display:flex;flex-direction:column;justify-content:flex-end;
  padding:1rem;
}

/* ── Gallery grid ── */
.gallery-teaser {
  display:grid;
  grid-template-columns:repeat(3,1fr);
  grid-template-rows:220px 220px;
  gap:.75rem;
}
.gallery-item {
  border-radius:1rem;overflow:hidden;position:relative;cursor:pointer;
}
.gallery-item img {
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s ease;
}
.gallery-item:hover img { transform:scale(1.05); }
.gallery-item.span-2 { grid-column:span 2; }
.gallery-item.tall   { grid-row:span 2; }

/* ── Sanctuary section ── */
.tld-sanctuary {
  position:relative;overflow:hidden;
  padding:clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,5rem);
  min-height:420px;display:flex;align-items:center;
}
.tld-sanctuary-bg {
  position:absolute;inset:0;z-index:0;
}
.tld-sanctuary-bg img { width:100%;height:100%;object-fit:cover;display:block; }
.tld-sanctuary-overlay {
  position:absolute;inset:0;z-index:1;
  background:rgba(0,15,35,.65);
}
.tld-sanctuary-content {
  position:relative;z-index:2;
  max-width:1280px;margin:0 auto;width:100%;
}

/* ── Form inputs ── */
.tld-inp {
  width:100%;background:var(--l3);border:none;
  border-radius:.65rem;padding:12px 14px;
  font-family:'Manrope',sans-serif;font-size:.875rem;
  color:var(--tx);outline:none;transition:background .15s;
  box-sizing:border-box;
}
.tld-inp::placeholder { color:var(--tl); }
.tld-inp:focus { background:#fff;box-shadow:0 0 0 2px rgba(0,25,60,.12); }

/* ── Footer ── */
.tld-footer {
  background:var(--p);color:rgba(255,255,255,.7);
  padding:clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem);
}
.tld-footer-grid {
  max-width:1280px;margin:0 auto;
  display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;
}
.tld-footer-link {
  font-size:.8rem;color:rgba(255,255,255,.6);text-decoration:none;
  transition:color .15s;display:block;margin-bottom:8px;
}
.tld-footer-link:hover { color:#fff; }
.tld-footer-title {
  font-size:.68rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
  color:rgba(255,255,255,.4);margin-bottom:1rem;
}

/* ── Story section ── */
.story-grid {
  display:grid;grid-template-columns:1fr 1fr;
  gap:clamp(3rem,6vw,6rem);align-items:center;
}
.story-img-wrap {
  position:relative;
}
.story-img {
  width:100%;aspect-ratio:4/5;object-fit:cover;display:block;
  border-radius:1.5rem;
  box-shadow:0 40px 80px rgba(25,28,29,.12);
  transform:rotate(-2deg);
  transition:transform .4s ease;
}
.story-img-wrap:hover .story-img { transform:rotate(0deg); }
.story-badge {
  position:absolute;background:rgba(248,249,250,.95);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-radius:1rem;padding:.875rem 1.1rem;
  box-shadow:0 16px 40px rgba(25,28,29,.1);
}

/* ── Hamburger + Mobile Menu ── */
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
.tld-mobile-nav-open {
  transform:translateY(0);opacity:1;pointer-events:auto;
}
.tld-mobile-link {
  padding:11px 14px;border-radius:.625rem;
  font-size:.9rem;font-weight:500;color:var(--tx);
  text-decoration:none;transition:background .15s;
}
.tld-mobile-link:hover { background:var(--l2); }

/* ── Responsive ── */
@media(max-width:1024px) {
  .tld-footer-grid { grid-template-columns:1fr 1fr;gap:2rem; }
}
@media(max-width:900px) {
  .story-grid,.bento-grid { grid-template-columns:1fr!important; }
  .bento-feature { grid-row:span 1;min-height:280px; }
  .gallery-teaser { grid-template-columns:1fr 1fr;grid-template-rows:auto; }
  .gallery-item.tall { grid-row:span 1; }
}
@media(max-width:640px) {
  .tld-nav-links { display:none; }
  .tld-hamburger { display:block; }
  .story-badge { display:none; }
  .gallery-teaser { grid-template-columns:1fr;grid-template-rows:auto; }
  .gallery-item.span-2 { grid-column:span 1; }
  .tld-footer-grid { grid-template-columns:1fr;gap:1.5rem; }
}
`

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TheLittleDominicanPage() {
  const featuredDishes = MOCK_DISHES.filter(d => FEATURED_DISHES.includes(d.id))
  const heroDish = featuredDishes[0]
  const sideDishes = featuredDishes.slice(1, 3)
  const bottomDish = featuredDishes[3]
  const galleryPreview = GALLERY_IMAGES.slice(0, 5)

  return (
    <>
      <style>{TLD_CSS}</style>

      <div className="tld" style={{ paddingTop: '60px' }}>

        {/* ── FIXED NAV ─────────────────────────────────────────── */}
        <TLDNav />

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="tld-hero">
          <div className="tld-hero-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=1000&fit=crop&q=85"
              alt="The Little Dominican restaurant"
            />
          </div>
          <div className="tld-hero-overlay" />

          <div className="tld-hero-content">
            {/* Flag badge */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.5rem' }}>
              <div style={{ display:'flex', height:'14px', width:'22px', borderRadius:'2px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.3)', flexShrink:0 }}>
                <div style={{ width:'50%', height:'100%', background:'#0038A8' }} />
                <div style={{ width:'50%', height:'100%', background:'#CE1126' }} />
              </div>
              <span style={{ fontSize:'.7rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.75)' }}>
                Elmira, NY · ★★★★★ Google
              </span>
            </div>

            <h1 className="tld-serif-xl" style={{ color:'#fff', maxWidth:'14ch' }}>
              La cocina de<br />
              <em style={{ fontStyle:'italic', color:'rgba(255,255,255,.9)' }}>la abuela.</em><br />
              Ahora aquí.
            </h1>

            <p style={{ fontSize:'1rem', fontWeight:300, lineHeight:1.65, color:'rgba(255,255,255,.8)', maxWidth:'42ch', marginTop:'1.25rem', marginBottom:'2rem' }}>
              Traditional Dominican with a modern spin — bringing abuela&rsquo;s cooking
              straight to you. Dine-in, pickup y delivery desde el corazón de Elmira.
            </p>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
              <a href="#reservar" className="btn-p">
                <CalendarIcon /> Reservar Mesa
              </a>
              <a href="/the-little-dominican/menu" className="btn-s">
                <MenuIcon /> Ver Menú
              </a>
              <a href="tel:6072150990" className="btn-g" style={{ color:'#fff', borderColor:'rgba(255,255,255,.3)', background:'rgba(255,255,255,.08)' }}>
                📞 (607) 215-0990
              </a>
            </div>

            {/* Service badges */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', marginTop:'1.75rem' }}>
              {['Dine-in','Pickup','Delivery','Música en vivo','$10–20'].map(s => (
                <span key={s} style={{ padding:'5px 14px', background:'rgba(255,255,255,.12)', backdropFilter:'blur(8px)', borderRadius:'9999px', fontSize:'.74rem', fontWeight:500, color:'rgba(255,255,255,.85)', border:'1px solid rgba(255,255,255,.15)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── OUR STORY ────────────────────────────────────────────── */}
        <section style={{ padding:'clamp(5rem,10vw,9rem) clamp(1.5rem,5vw,5rem)', background:'var(--bg)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
            <div className="story-grid">

              {/* Image side */}
              <div className="story-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="story-img"
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=1000&fit=crop&q=85"
                  alt="Interior de The Little Dominican"
                />

                {/* Rating badge */}
                <div className="story-badge" style={{ bottom:'-1.5rem', right:'-1.5rem' }}>
                  <div className="tld-label" style={{ marginBottom:'3px' }}>Reseñas Google</div>
                  <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'2.2rem', fontWeight:300, color:'var(--p)', lineHeight:1 }}>
                    5.0 ★
                  </div>
                  <div className="tld-label" style={{ marginTop:'3px', color:'var(--t)' }}>Calificación perfecta</div>
                </div>

                {/* Location badge */}
                <div className="story-badge" style={{ top:'1.5rem', left:'-1.5rem' }}>
                  <div className="tld-label">Ubicación</div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontSize:'.88rem', fontWeight:600, color:'var(--p)', marginTop:'4px' }}>
                    315 E Water St
                  </div>
                  <div className="tld-label" style={{ marginTop:'2px' }}>Elmira, NY 14901</div>
                </div>
              </div>

              {/* Text side */}
              <div>
                <div className="tld-label" style={{ marginBottom:'.75rem' }}>Nuestra historia</div>
                <h2 className="tld-serif-lg" style={{ marginBottom:'1.5rem' }}>
                  Donde la tradición<br />se encuentra con el sabor
                </h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  <p className="tld-body">
                    En The Little Dominican llevamos la esencia de la cocina quisqueyana al corazón de Elmira.
                    Cada plato nace de recetas heredadas, sazonadas con el amor de la familia y adaptadas para
                    quienes buscan autenticidad en cada bocado.
                  </p>
                  <p className="tld-body">
                    Desde el chicharrón crujiente hasta el rabo guisado que se deshace sola —
                    aquí la comida es cultura, es identidad, es hogar.
                  </p>
                </div>

                {/* Stats row */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'1.5rem', marginTop:'2.5rem' }}>
                  {[
                    { num: '★★★★★', label: 'Google Reviews' },
                    { num: '12+',    label: 'Platos auténticos' },
                    { num: '7',      label: 'Días de eventos' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.75rem', fontWeight:300, color:'var(--p)', lineHeight:1 }}>{s.num}</div>
                      <div className="tld-label" style={{ marginTop:'4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:'2.5rem', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <a href="/the-little-dominican/menu" className="btn-p">
                    <MenuIcon /> Explorar Menú
                  </a>
                  <a href="#reservar" className="btn-g">
                    Reservar mesa →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SIGNATURE EXPRESSIONS BENTO ──────────────────────────── */}
        <section style={{ background:'var(--l1)', padding:'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,5rem)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto' }}>

            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'clamp(2rem,4vw,3rem)' }}>
              <div>
                <div className="tld-label" style={{ marginBottom:'.5rem' }}>Especialidades</div>
                <h2 className="tld-serif-lg">Nuestras expresiones<br />de sabor</h2>
              </div>
              <a href="/the-little-dominican/menu" className="btn-g">
                Ver menú completo →
              </a>
            </div>

            <div className="bento-grid">

              {/* Feature dish — spans 2 rows */}
              {heroDish && (
                <div className="bento-feature">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroDish.image} alt={heroDish.name} />
                  <div className="bento-overlay">
                    <div className="tld-label" style={{ color:'rgba(255,255,255,.6)', marginBottom:'4px' }}>{heroDish.category}</div>
                    <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.4rem', fontWeight:400, color:'#fff', lineHeight:1.15 }}>{heroDish.name}</div>
                    <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.1rem', fontWeight:300, color:'rgba(255,255,255,.8)', marginTop:'4px' }}>${heroDish.price}</div>
                    <p style={{ fontSize:'.78rem', fontWeight:300, color:'rgba(255,255,255,.7)', marginTop:'6px', lineHeight:1.5 }}>{heroDish.description}</p>
                  </div>
                </div>
              )}

              {/* Two small dishes */}
              {sideDishes.map(dish => (
                <div key={dish.id} className="bento-small">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dish.image} alt={dish.name} />
                  <div className="bento-small-overlay">
                    <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.05rem', fontWeight:400, color:'#fff', lineHeight:1.2 }}>{dish.name}</div>
                    <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'.9rem', fontWeight:300, color:'rgba(255,255,255,.75)', marginTop:'2px' }}>${dish.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom wide dish */}
            {bottomDish && (
              <div style={{ marginTop:'1rem', borderRadius:'1rem', overflow:'hidden', position:'relative', height:'200px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bottomDish.image} alt={bottomDish.name}
                  style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .5s ease' }}
                />
                <div style={{
                  position:'absolute', inset:0,
                  background:'linear-gradient(to right, rgba(0,10,25,.65) 0%, transparent 60%)',
                  display:'flex', alignItems:'center', padding:'0 2rem',
                }}>
                  <div>
                    <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.5rem', fontWeight:400, color:'#fff' }}>{bottomDish.name}</div>
                    <p style={{ fontSize:'.8rem', fontWeight:300, color:'rgba(255,255,255,.8)', marginTop:'4px', maxWidth:'40ch' }}>{bottomDish.description}</p>
                    <a href="/the-little-dominican/menu" className="btn-p" style={{ marginTop:'14px', padding:'9px 20px', fontSize:'.78rem' }}>
                      Ordenar ahora →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── TROPICAL SANCTUARY ───────────────────────────────────── */}
        <section className="tld-sanctuary">
          <div className="tld-sanctuary-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=800&fit=crop&q=85"
              alt="Ambiente del restaurante"
            />
          </div>
          <div className="tld-sanctuary-overlay" />

          <div className="tld-sanctuary-content">
            <div style={{ maxWidth:'680px' }}>
              <div style={{ fontSize:'.7rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:'1.25rem' }}>
                La experiencia
              </div>
              <h2 className="tld-serif-xl" style={{ color:'#fff', marginBottom:'1.5rem' }}>
                Un pedazo de<br />
                <em style={{ fontStyle:'italic' }}>la isla</em> en Elmira
              </h2>
              <p style={{ fontSize:'.95rem', fontWeight:300, lineHeight:1.7, color:'rgba(255,255,255,.75)', marginBottom:'2.5rem' }}>
                Música en vivo los fines de semana, un ambiente familiar y auténtico, y
                la mejor cocina dominicana de Elmira, NY. Ven a vivir la experiencia.
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', marginTop:'.5rem' }}>
              {[
                { icon:'🎵', label:'Música en vivo', sub:'Viernes y Sábados' },
                { icon:'🏠', label:'Ambiente familiar', sub:'Bienvenidos todos' },
                { icon:'📍', label:'Elmira, NY', sub:'315 E Water St' },
                { icon:'⏰', label:'Martes–Domingo', sub:'Desde 11:00 AM' },
              ].map(s => (
                <div key={s.label} style={{
                  background:'rgba(255,255,255,.1)', backdropFilter:'blur(12px)',
                  borderRadius:'1rem', padding:'1.1rem 1.5rem',
                  border:'1px solid rgba(255,255,255,.12)',
                  minWidth:'160px',
                }}>
                  <div style={{ fontSize:'1.4rem', marginBottom:'6px' }}>{s.icon}</div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.88rem', color:'#fff' }}>{s.label}</div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontWeight:300, fontSize:'.76rem', color:'rgba(255,255,255,.65)', marginTop:'2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALLERY TEASER ───────────────────────────────────────── */}
        <section style={{ background:'var(--bg)', padding:'clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,5rem)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto' }}>

            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'clamp(2rem,4vw,3rem)' }}>
              <div>
                <div className="tld-label" style={{ marginBottom:'.5rem' }}>Galería</div>
                <h2 className="tld-serif-lg">Vive la experiencia</h2>
              </div>
              <a href="/the-little-dominican/gallery" className="btn-g">
                Ver galería completa →
              </a>
            </div>

            <div className="gallery-teaser">
              {/* Item 1 — tall (spans 2 rows) */}
              <a href="/the-little-dominican/gallery" className="gallery-item tall">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={galleryPreview[0].src} alt={galleryPreview[0].alt} />
              </a>
              {/* Item 2 — wide */}
              <a href="/the-little-dominican/gallery" className="gallery-item span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={galleryPreview[1].src} alt={galleryPreview[1].alt} />
              </a>
              {/* Items 3-4 */}
              {galleryPreview.slice(2, 4).map(img => (
                <a key={img.id} href="/the-little-dominican/gallery" className="gallery-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── EVENTOS ──────────────────────────────────────────────── */}
        <section style={{ background:'var(--l1)', padding:'clamp(3rem,6vw,6rem) clamp(1.5rem,5vw,5rem)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto' }}>
            <div className="tld-label" style={{ marginBottom:'.5rem' }}>Entretenimiento</div>
            <h2 className="tld-serif-lg" style={{ marginBottom:'clamp(1.5rem,3vw,2.5rem)' }}>Música en vivo</h2>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1rem' }}>
              {MOCK_EVENTS.map(event => (
                <div key={event.id} style={{
                  display:'flex', alignItems:'center', gap:'1.25rem',
                  background:'var(--bg)', borderRadius:'1rem', padding:'1.25rem 1.5rem',
                  boxShadow:'var(--sh)',
                }}>
                  <div style={{
                    flexShrink:0, width:'52px', height:'52px', borderRadius:'.75rem',
                    background:'rgba(0,25,60,.06)',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  }}>
                    <span style={{ fontSize:'.55rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--tl)' }}>
                      {new Date(event.date).toLocaleDateString('es', { month: 'short' })}
                    </span>
                    <span style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.45rem', fontWeight:400, color:'var(--p)', lineHeight:1 }}>
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'.88rem', color:'var(--p)', marginBottom:'3px' }}>{event.title}</p>
                    <p className="tld-label">{event.artistName} · {event.startTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RESERVATION + INFO ───────────────────────────────────── */}
        <section id="reservar" style={{ background:'var(--bg)', padding:'clamp(4rem,7vw,7rem) clamp(1.5rem,5vw,5rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start" style={{ maxWidth:'1280px', margin:'0 auto', gap:'clamp(2rem,5vw,5rem)' }}>

            {/* Info + Hours */}
            <div>
              <div className="tld-label" style={{ marginBottom:'.5rem' }}>Encuéntranos</div>
              <h2 className="tld-serif-lg" style={{ marginBottom:'1.5rem' }}>Visítanos</h2>

              <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2.5rem' }}>
                <InfoRow emoji="📍">315 E Water St, Elmira, NY 14901 — Between Baldwin St &amp; Lake St</InfoRow>
                <InfoRow emoji="📞">
                  <a href="tel:6072150990" style={{ color:'var(--p)', textDecoration:'none', fontWeight:500 }}>(607) 215-0990</a>
                </InfoRow>
                <InfoRow emoji="🌐">
                  <a href="https://thelittledominican.com" target="_blank" rel="noopener noreferrer" style={{ color:'var(--p)', textDecoration:'none', fontWeight:500 }}>
                    thelittledominican.com
                  </a>
                </InfoRow>
              </div>

              <div className="tld-label" style={{ marginBottom:'.875rem' }}>Horario</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {HOURS.map(h => (
                  <div key={h.day} style={{ display:'flex', justifyContent:'space-between', fontSize:'.875rem', padding:'4px 0', borderBottom:'1px solid var(--l3)' }}>
                    <span style={{ color:'var(--tm)', fontWeight:300 }}>{h.day}</span>
                    <span style={{ color: h.closed ? 'var(--s)' : 'var(--p)', fontWeight:500 }}>
                      {h.closed ? 'Cerrado' : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reservation form */}
            <div style={{ background:'var(--l1)', borderRadius:'1.25rem', padding:'clamp(1.5rem,3vw,2.5rem)', boxShadow:'var(--sh)' }}>
              <div className="tld-label" style={{ marginBottom:'.4rem' }}>Sin cargo</div>
              <h3 className="tld-serif-lg" style={{ marginBottom:'.4rem' }}>Reservar Mesa</h3>
              <p className="tld-body" style={{ fontSize:'.82rem', marginBottom:'1.75rem' }}>
                Te confirmamos en menos de una hora.
              </p>
              <ReservationForm phone="(607) 215-0990" />
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer className="tld-footer">
          <div className="tld-footer-grid">

            {/* Brand col */}
            <div>
              <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.2rem', fontWeight:400, color:'#fff', marginBottom:'.75rem' }}>
                The Little Dominican
              </div>
              <p style={{ fontSize:'.82rem', fontWeight:300, lineHeight:1.65, color:'rgba(255,255,255,.55)', maxWidth:'30ch', marginBottom:'1.5rem' }}>
                Cocina dominicana auténtica en el corazón de Elmira, NY.
              </p>
              <div style={{ display:'flex', gap:'10px' }}>
                {['FB','IG'].map(s => (
                  <a key={s} href="#" style={{
                    width:'34px', height:'34px', borderRadius:'50%',
                    background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:'.75rem', fontWeight:600,
                    color:'rgba(255,255,255,.7)', textDecoration:'none',
                    transition:'background .15s',
                  }}>{s}</a>
                ))}
              </div>
            </div>

            {/* Menu col */}
            <div>
              <div className="tld-footer-title">Menú</div>
              {['Picadera','Fritura','Carnes','Mariscos','Appetizers','Sides'].map(cat => (
                <a key={cat} href={`/the-little-dominican/menu?cat=${cat}`} className="tld-footer-link">{cat}</a>
              ))}
            </div>

            {/* Horario col */}
            <div>
              <div className="tld-footer-title">Horario</div>
              {HOURS.map(h => (
                <div key={h.day} style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', marginBottom:'6px', color:'rgba(255,255,255,.55)' }}>
                  <span>{h.day.substring(0,3)}</span>
                  <span style={{ color: h.closed ? '#e12531' : 'rgba(255,255,255,.75)' }}>
                    {h.closed ? 'Cerrado' : h.open?.replace(' AM','').replace(' PM','')+'-'+h.close?.replace(' AM','').replace(' PM','')}
                  </span>
                </div>
              ))}
            </div>

            {/* Contact col */}
            <div>
              <div className="tld-footer-title">Contacto</div>
              <a href="tel:6072150990" className="tld-footer-link">📞 (607) 215-0990</a>
              <a href="mailto:info@thelittledominican.com" className="tld-footer-link">✉ info@thelittledominican.com</a>
              <a href="#" className="tld-footer-link">📍 315 E Water St, Elmira, NY</a>
              <div style={{ marginTop:'1rem' }}>
                <a href="/the-little-dominican/menu" className="btn-s" style={{ padding:'9px 18px', fontSize:'.78rem' }}>
                  Ordenar ahora →
                </a>
              </div>
            </div>
          </div>

          <div style={{ maxWidth:'1280px', margin:'2.5rem auto 0', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
            <p style={{ fontSize:'.75rem', color:'rgba(255,255,255,.35)' }}>
              © 2026 The Little Dominican
            </p>
            <p style={{ fontSize:'.75rem', color:'rgba(255,255,255,.35)' }}>
              Powered by{' '}
              <Link href="/" style={{ color:'rgba(255,255,255,.55)', fontWeight:600, textDecoration:'none' }}>MaalCa Ecosistema</Link>
            </p>
          </div>
        </footer>

      </div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InfoRow({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
      <span style={{ fontSize:'1rem', flexShrink:0 }}>{emoji}</span>
      <span className="tld-body" style={{ lineHeight:1.5 }}>{children}</span>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
