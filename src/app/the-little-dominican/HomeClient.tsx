'use client'
// TLD Home — Client component (consume useTldI18n). Metadata lives en page.tsx server wrapper.
import Link from 'next/link'
import TLDNav from './TLDNav'
import ReservationForm from './ReservationForm'
import { MOCK_DISHES, HOURS, GALLERY_IMAGES, FEATURED_DISHES, type MenuItem } from './_data'
import WhatsAppIntegration from '@/components/ui/WhatsAppIntegration'
import { useTldI18n } from './tld-i18n'
// ─── Shared CSS (design system + page-specific) ──────────────────────────────
const TLD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=Manrope:wght@300;400;500;600&display=swap');
.tld {
  /* ─── TLD Brand System ──────────────────────────────────────────
     Colores oficiales derivados del logo ilustrado + fotos reales.
     No cambiar sin consultar brand guidelines.
     ─────────────────────────────────────────────────────────── */
  --p:      #00193c;  /* Navy deep — fondos hero, headers fuertes */
  --navy:   #002D62;  /* Navy principal */
  --s:      #CE1126;  /* Rojo bandera DR — acentos/CTAs secundarios */
  --t:      #3A7D44;  /* Verde plátano/limón — frescura */
  --gold:   #F4B400;  /* Oro cálido — precios, stars, highlights */
  --blue:   #0038A8;  /* Azul bandera DR */
  --wood:   #8B5A3C;  /* Madera quemada — footer, tarjetas tipo menú mesa */
  --cream:  #F5E6D0;  /* Arena caribe — cards, bloques suaves */
  --bg:     #F8F4EE;  /* Crema soft — fondo principal */
  --l1:     #F5E6D0;  /* Crema → cards primarias */
  --l2:     #EEE4D1;  /* Crema oscura → hover states */
  --l3:     #E6D9C1;  /* Crema más oscura → bordes */
  --tx:     #191c1d;  /* Texto fuerte */
  --tm:     #44474f;  /* Texto medio */
  --tl:     #74777f;  /* Texto light */
  --sh:     0 20px 40px rgba(25,28,29,.06);
  --navy-footer: #00193c;  /* Token fijo: footer siempre oscuro en ambos temas */

  /* ─── Brand-stable tokens (no invierten en dark mode) ────────────
     --p se invierte en dark para títulos, pero los CTAs y el hero
     deben mantener navy+blanco en ambos temas. Estos tokens son
     estables — no se tocan en [data-theme="dark"]. */
  --cta-bg:      #00193c;
  --cta-text:    #ffffff;
  --hero-bg:     #00193c;
  --hero-text:   #ffffff;
  --input-bg:    #ffffff;
  --input-text:  #191c1d;

  font-family: 'Manrope', system-ui, sans-serif;
  background: var(--bg);
  color: var(--tx);
}
/* ─── Dark mode ─────────────────────────────────────────
   Invertimos la paleta cálida: navy → casi-blanco, crema → negro.
   Los acentos bandera (rojo/verde/gold) se brighten para contrast.
   El footer queda estable con --navy-footer (no invierte).
   ─────────────────────────────────────────────────── */
[data-theme="dark"] .tld {
  --p:      #f5f5f5;
  --navy:   #e0e0e0;
  --s:      #ff4d5c;
  --t:      #4bc267;
  --gold:   #ffc947;
  --blue:   #5aa0ff;
  --wood:   #b08872;
  --cream:  #1e1a15;
  --bg:     #0a0a0a;
  --l1:     #141414;
  --l2:     #1c1c1c;
  --l3:     #2a2a2a;
  --tx:     #f5f5f5;
  --tm:     #b8bcc4;
  --tl:     #8b8f97;
  --sh:     0 20px 40px rgba(0,0,0,.45);
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
.btn-wa {
  display:inline-flex;align-items:center;gap:10px;
  padding:16px 32px;border-radius:9999px;border:none;cursor:pointer;
  font-family:'Manrope',sans-serif;font-size:1rem;font-weight:700;
  letter-spacing:.01em;text-decoration:none;
  background:#25d366;color:#fff;
  box-shadow:0 12px 30px rgba(37,211,102,.35),0 2px 6px rgba(37,211,102,.2);
  transition:transform .15s,box-shadow .2s,background .15s;
}
.btn-wa:hover { background:#1fb858; transform:translateY(-2px); box-shadow:0 16px 38px rgba(37,211,102,.45),0 3px 8px rgba(37,211,102,.25); }
.btn-wa-sm {
  display:inline-flex;align-items:center;gap:8px;
  padding:12px 24px;border-radius:9999px;border:none;cursor:pointer;
  font-family:'Manrope',sans-serif;font-size:.88rem;font-weight:700;
  text-decoration:none;background:#25d366;color:#fff;
  transition:background .15s,transform .15s;
}
.btn-wa-sm:hover { background:#1fb858; transform:translateY(-1px); }
.btn-g {
  display:inline-flex;align-items:center;gap:6px;
  padding:11px 22px;border-radius:9999px;border:none;cursor:pointer;
  font-family:'Manrope',sans-serif;font-size:.85rem;font-weight:600;
  text-decoration:none;background:transparent;color:var(--p);
  border: 1.5px solid rgba(0,25,60,.15);
  transition:background .15s,border-color .15s;
}
.btn-g:hover { background:var(--l2); border-color:rgba(0,25,60,.25); }
/* ── Social buttons ── */
.tld-social-btn {
  display:flex;align-items:center;gap:10px;
  padding:13px 24px;border-radius:9999px;
  background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);
  text-decoration:none;color:#fff;font-size:.85rem;font-weight:600;
  transition:background .15s;
}
.tld-social-btn:hover { background:rgba(255,255,255,.2); }
.tld-social-btn-wa {
  display:flex;align-items:center;gap:10px;
  padding:13px 24px;border-radius:9999px;
  background:#25d366;border:1px solid #25d366;
  text-decoration:none;color:#fff;font-size:.85rem;font-weight:600;
  transition:opacity .15s;
}
.tld-social-btn-wa:hover { opacity:.85; }
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
  background:var(--navy-footer);color:rgba(255,255,255,.7);
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
export default function HomeClient({ dishes = MOCK_DISHES }: { dishes?: MenuItem[] } = {}) {
  const { t, language } = useTldI18n()
  const featuredDishes = dishes.filter(d => FEATURED_DISHES.includes(d.id))
  const heroDish = featuredDishes[0]
  const sideDishes = featuredDishes.slice(1, 3)
  const bottomDish = featuredDishes[3]
  const galleryPreview = GALLERY_IMAGES.slice(0, 5)
  const waText = language === 'en'
    ? 'Hi, I want to order. What do you have available right now?'
    : 'Hola, quiero ordenar. ¿Qué tienen disponible ahora?'
  const waUrl = `https://wa.me/16078574226?text=${encodeURIComponent(waText)}`
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
              src="/images/affiliates/tld/photos/La-Bandera-Dominicana.jpg"
              alt="La Bandera Dominicana — arroz blanco, habichuelas guisadas y carne"
            />
          </div>
          <div className="tld-hero-overlay" />
          <div className="tld-hero-content">
            {/* Flag badge — bandera dominicana (cruz blanca + 4 cuadrantes) */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.25rem' }}>
              <DRFlag />
              <span style={{ fontSize:'.7rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.75)' }}>
                {t.heroRatingLabel}
              </span>
            </div>
            {/* Tagline oficial — Caveat (handwritten warmth) */}
            <p className="font-caveat" style={{ color:'var(--gold)', fontSize:'clamp(1.6rem,3vw,2.2rem)', lineHeight:1.1, margin:'0 0 .5rem', fontWeight:600, textShadow:'0 2px 12px rgba(0,0,0,.35)' }}>
              {t.heroTagline}
            </p>
            <h1 className="tld-serif-xl" style={{ color:'#fff', maxWidth:'14ch' }}>
              {t.heroH1Line1}<br />
              <em style={{ fontStyle:'italic', color:'rgba(255,255,255,.9)' }}>{t.heroH1Line2}</em><br />
              {t.heroH1Line3}
            </h1>
            <p style={{ fontSize:'1rem', fontWeight:300, lineHeight:1.65, color:'rgba(255,255,255,.8)', maxWidth:'42ch', marginTop:'1.25rem', marginBottom:'.75rem' }}>
              {t.heroSub}
            </p>
            <p style={{ fontSize:'1.05rem', fontWeight:600, color:'#fff', marginBottom:'2rem', letterSpacing:'.01em' }}>
              {t.heroUrgent}
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center' }}>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
              >
                <WhatsAppIcon /> {t.ctaWhatsapp}
              </a>
              <a href="/the-little-dominican/menu" className="btn-g" style={{ color:'#fff', borderColor:'rgba(255,255,255,.35)', background:'rgba(255,255,255,.1)', backdropFilter:'blur(8px)' }}>
                <MenuIcon /> {t.ctaViewMenu}
              </a>
              <a href="tel:6078574226" style={{ color:'rgba(255,255,255,.85)', fontSize:'.82rem', fontWeight:500, textDecoration:'none', padding:'10px 4px' }}>
                {t.ctaCall}
              </a>
            </div>
            {/* Service badges */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'7px', marginTop:'1.75rem' }}>
              {t.serviceBadges.map(s => (
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
                  src="/images/affiliates/tld/photos/habichuelas-con-dulce-02.jpg"
                  alt="Habichuelas con dulce — postre tradicional dominicano hecho en casa"
                />
                {/* Rating badge */}
                <div className="story-badge" style={{ bottom:'-1.5rem', right:'-1.5rem' }}>
                  <div className="tld-label" style={{ marginBottom:'3px' }}>{t.badgeGoogleReviews}</div>
                  <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'2.2rem', fontWeight:300, color:'var(--p)', lineHeight:1 }}>
                    5.0 ★
                  </div>
                  <div className="tld-label" style={{ marginTop:'3px', color:'var(--t)' }}>{t.badgePerfectRating}</div>
                </div>
                {/* Location badge */}
                <div className="story-badge" style={{ top:'1.5rem', left:'-1.5rem' }}>
                  <div className="tld-label">{t.badgeLocation}</div>
                  <div style={{ fontFamily:'Manrope,sans-serif', fontSize:'.88rem', fontWeight:600, color:'var(--p)', marginTop:'4px' }}>
                    315 E Water St
                  </div>
                  <div className="tld-label" style={{ marginTop:'2px' }}>Elmira, NY 14901</div>
                </div>
              </div>
              {/* Text side */}
              <div>
                <div className="tld-label" style={{ marginBottom:'.75rem' }}>{t.storyLabel}</div>
                <p className="font-caveat" style={{ color:'var(--s)', fontSize:'1.65rem', lineHeight:1.05, margin:'0 0 .35rem', fontWeight:600 }}>
                  {t.storyTagline}
                </p>
                <h2 className="tld-serif-lg" style={{ marginBottom:'1.5rem' }}>
                  {t.storyH2Line1}<br />{t.storyH2Line2}
                </h2>
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  <p className="tld-body">{t.storyP1}</p>
                  <p className="tld-body">{t.storyP2}</p>
                </div>
                {/* Stats row */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:'1.5rem', marginTop:'2.5rem' }}>
                  {[
                    { num: '★★★★★', label: t.statsGoogleReviews },
                    { num: '12+',    label: t.statsAuthenticDishes },
                    { num: '< 30m',  label: t.statsPickupReady },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.75rem', fontWeight:300, color:'var(--p)', lineHeight:1 }}>{s.num}</div>
                      <div className="tld-label" style={{ marginTop:'4px' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:'2.5rem', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa-sm"
                  >
                    <WhatsAppIcon /> {t.ctaWhatsapp}
                  </a>
                  <a href="/the-little-dominican/menu" className="btn-g">
                    <MenuIcon /> {t.ctaViewMenu}
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
                <div className="tld-label" style={{ marginBottom:'.5rem' }}>{t.signatureLabel}</div>
                <h2 className="tld-serif-lg">{t.signatureH2Line1}<br />{t.signatureH2Line2}</h2>
              </div>
              <a href="/the-little-dominican/menu" className="btn-g">
                {t.ctaFullMenu}
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
                      {t.ctaOrderNow}
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
              src="/images/affiliates/tld/photos/pezcado-frito.jpg"
              alt="Pescado frito dominicano — sabor tropical de la costa"
            />
          </div>
          <div className="tld-sanctuary-overlay" />
          <div className="tld-sanctuary-content">
            <div style={{ maxWidth:'680px' }}>
              <div style={{ fontSize:'.7rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:'1.25rem' }}>
                {t.sanctuaryLabel}
              </div>
              <h2 className="tld-serif-xl" style={{ color:'#fff', marginBottom:'1.5rem' }}>
                {t.sanctuaryH2Line1}<br />
                <em style={{ fontStyle:'italic' }}>{t.sanctuaryH2Line2}</em>
              </h2>
              <p style={{ fontSize:'.95rem', fontWeight:300, lineHeight:1.7, color:'rgba(255,255,255,.75)', marginBottom:'2.5rem' }}>
                {t.sanctuaryP}
              </p>
            </div>
            {/* Stats row */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', marginTop:'.5rem' }}>
              {[
                { icon:'⚡', label:t.chipPickupTitle,   sub:t.chipPickupSub   },
                { icon:'🏠', label:t.chipFamilyTitle,   sub:t.chipFamilySub   },
                { icon:'📍', label:t.chipLocationTitle, sub:t.chipLocationSub },
                { icon:'⏰', label:t.chipHoursTitle,    sub:t.chipHoursSub    },
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
                <div className="tld-label" style={{ marginBottom:'.5rem' }}>{t.galleryLabel}</div>
                <h2 className="tld-serif-lg">{t.galleryH2}</h2>
              </div>
              <a href="/the-little-dominican/gallery" className="btn-g">
                {t.ctaFullGallery}
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
        {/* ── CTA: ORDER NOW ───────────────────────────────────────── */}
        <section style={{ background:'var(--navy-footer)', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)' }}>
          <div style={{ maxWidth:'920px', margin:'0 auto', textAlign:'center' }}>
            <div className="tld-label" style={{ color:'rgba(255,255,255,.55)', marginBottom:'.75rem' }}>
              {t.ctaStripLabel}
            </div>
            <h2 style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:300, color:'#fff', letterSpacing:'-.015em', lineHeight:1.15, marginBottom:'.75rem' }}>
              {t.ctaStripH2Line1}<br />
              <em style={{ fontStyle:'italic', color:'rgba(255,255,255,.85)' }}>{t.ctaStripH2Line2}</em>
            </h2>
            <p style={{ fontSize:'.95rem', fontWeight:300, color:'rgba(255,255,255,.7)', maxWidth:'52ch', margin:'0 auto 2rem' }}>
              {t.ctaStripP}
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa"
              >
                <WhatsAppIcon /> {t.ctaWhatsapp}
              </a>
              <a href="/the-little-dominican/menu" className="btn-g" style={{ color:'#fff', borderColor:'rgba(255,255,255,.3)', background:'rgba(255,255,255,.08)' }}>
                {t.ctaViewMenu}
              </a>
            </div>
          </div>
        </section>
        {/* ── RESERVATION + INFO ───────────────────────────────────── */}
        <section id="reservar" style={{ background:'var(--bg)', padding:'clamp(4rem,7vw,7rem) clamp(1.5rem,5vw,5rem)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 items-start" style={{ maxWidth:'1280px', margin:'0 auto', gap:'clamp(2rem,5vw,5rem)' }}>
            {/* Info + Hours */}
            <div>
              <div className="tld-label" style={{ marginBottom:'.5rem' }}>{t.reserveLabelFind}</div>
              <h2 className="tld-serif-lg" style={{ marginBottom:'1.5rem' }}>{t.reserveH2}</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2.5rem' }}>
                <InfoRow emoji="📍">315 E Water St, Elmira, NY 14901 — Between Baldwin St &amp; Lake St</InfoRow>
                <InfoRow emoji="📞">
                  <a href="tel:6078574226" style={{ color:'var(--p)', textDecoration:'none', fontWeight:500 }}>(607) 857-4226</a>
                </InfoRow>
                <InfoRow emoji="🌐">
                  <a href="https://maalca.com/the-little-dominican" target="_blank" rel="noopener noreferrer" style={{ color:'var(--p)', textDecoration:'none', fontWeight:500 }}>
                    maalca.com/the-little-dominican
                  </a>
                </InfoRow>
              </div>
              <div className="tld-label" style={{ marginBottom:'.875rem' }}>{t.reserveLabelHours}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {HOURS.map(h => (
                  <div key={h.day} style={{ display:'flex', justifyContent:'space-between', fontSize:'.875rem', padding:'4px 0', borderBottom:'1px solid var(--l3)' }}>
                    <span style={{ color:'var(--tm)', fontWeight:300 }}>{h.day}</span>
                    <span style={{ color: h.closed ? 'var(--s)' : 'var(--p)', fontWeight:500 }}>
                      {h.closed ? t.closed : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Reservation form */}
            <div style={{ background:'var(--l1)', borderRadius:'1.25rem', padding:'clamp(1.5rem,3vw,2.5rem)', boxShadow:'var(--sh)' }}>
              <div className="tld-label" style={{ marginBottom:'.4rem' }}>{t.reserveLabelFree}</div>
              <h3 className="tld-serif-lg" style={{ marginBottom:'.4rem' }}>{t.reserveFormH3}</h3>
              <p className="tld-body" style={{ fontSize:'.82rem', marginBottom:'1.75rem' }}>
                {t.reserveFormP}
              </p>
              <ReservationForm phone="(607) 857-4226" />
            </div>
          </div>
        </section>
        {/* ── SOCIAL ───────────────────────────────────────────────── */}
        <section style={{ background:'var(--navy-footer)', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)' }}>
          <div style={{ maxWidth:'1280px', margin:'0 auto', textAlign:'center' }}>
            <div className="tld-label" style={{ color:'rgba(255,255,255,.5)', marginBottom:'.75rem' }}>{t.socialLabel}</div>
            <h2 style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:300, color:'#fff', marginBottom:'.5rem', letterSpacing:'-.01em' }}>
              {t.socialH2}
            </h2>
            <p style={{ fontSize:'.88rem', fontWeight:300, color:'rgba(255,255,255,.6)', marginBottom:'2.5rem' }}>
              {t.socialP}
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:'1rem', flexWrap:'wrap' }}>
              {/* Facebook */}
              <a href="https://facebook.com/thelittledominican" target="_blank" rel="noopener noreferrer" className="tld-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/thelittledominican" target="_blank" rel="noopener noreferrer" className="tld-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/16078574226" target="_blank" rel="noopener noreferrer" className="tld-social-btn-wa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
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
                {t.footerTagline}
              </p>
              <div style={{ display:'flex', gap:'8px' }}>
                {[
                  { label:'FB', href:'https://facebook.com/thelittledominican' },
                  { label:'IG', href:'https://instagram.com/thelittledominican' },
                  { label:'WA', href:'https://wa.me/16078574226' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                    width:'34px', height:'34px', borderRadius:'50%',
                    background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:'.7rem', fontWeight:700,
                    color:'rgba(255,255,255,.7)', textDecoration:'none',
                    transition:'background .15s',
                  }}>{s.label}</a>
                ))}
              </div>
            </div>
            {/* Menu col */}
            <div>
              <div className="tld-footer-title">{t.footerTitleMenu}</div>
              {(['Picadera','Fritura','Carnes','Mariscos','Acompañantes','Postres'] as const).map(cat => (
                <a key={cat} href={`/the-little-dominican/menu?cat=${cat}`} className="tld-footer-link">{t.cats[cat]}</a>
              ))}
            </div>
            {/* Horario col */}
            <div>
              <div className="tld-footer-title">{t.footerTitleHours}</div>
              {HOURS.map(h => (
                <div key={h.day} style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', marginBottom:'6px', color:'rgba(255,255,255,.55)' }}>
                  <span>{h.day.substring(0,3)}</span>
                  <span style={{ color: h.closed ? '#e12531' : 'rgba(255,255,255,.75)' }}>
                    {h.closed ? t.closed : h.open?.replace(' AM','').replace(' PM','')+'-'+h.close?.replace(' AM','').replace(' PM','')}
                  </span>
                </div>
              ))}
            </div>
            {/* Contact col */}
            <div>
              <div className="tld-footer-title">{t.footerTitleContact}</div>
              <a href="tel:6078574226" className="tld-footer-link">📞 (607) 857-4226</a>
              <a href="mailto:tld@maalca.com" className="tld-footer-link">✉ tld@maalca.com</a>
              <a href="https://maps.google.com/?q=315+E+Water+St,+Elmira,+NY+14901" target="_blank" rel="noopener noreferrer" className="tld-footer-link">📍 315 E Water St, Elmira, NY</a>
              <div style={{ marginTop:'1rem' }}>
                <a href="/the-little-dominican/menu" className="btn-s" style={{ padding:'9px 18px', fontSize:'.78rem' }}>
                  {t.ctaOrderNow}
                </a>
              </div>
            </div>
          </div>
          <div style={{ maxWidth:'1280px', margin:'2.5rem auto 0', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
            <p style={{ fontSize:'.75rem', color:'rgba(255,255,255,.35)' }}>
              © 2026 The Little Dominican
            </p>
            <p style={{ fontSize:'.75rem', color:'rgba(255,255,255,.35)' }}>
              {t.footerPoweredBy}{' '}
              <Link href="/" style={{ color:'rgba(255,255,255,.55)', fontWeight:600, textDecoration:'none' }}>MaalCa Ecosistema</Link>
            </p>
          </div>
        </footer><WhatsAppIntegration phoneNumber="+1 (607) 857-4226" businessName="The Little Dominican" businessType="restaurant" />
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
function DRFlag() {
  // Bandera dominicana: cruz blanca con cuadrantes azul/rojo/rojo/azul
  // Azul ultramar #002D62 · Rojo bermellón #CE1126 · Cruz blanca
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" aria-label="Bandera Dominicana"
      style={{ borderRadius:'2px', boxShadow:'0 1px 4px rgba(0,0,0,.35)', flexShrink:0, display:'block' }}>
      {/* Cuadrantes */}
      <rect x="0"  y="0" width="12" height="7"  fill="#002D62" />
      <rect x="16" y="0" width="12" height="7"  fill="#CE1126" />
      <rect x="0"  y="11" width="12" height="7" fill="#CE1126" />
      <rect x="16" y="11" width="12" height="7" fill="#002D62" />
      {/* Cruz blanca */}
      <rect x="12" y="0" width="4"  height="18" fill="#fff" />
      <rect x="0"  y="7" width="28" height="4"  fill="#fff" />
    </svg>
  )
}
function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
