'use client'

import { useState } from 'react'

// ─── Mock data ────────────────────────────────────────────────────────────────

type CampaignFilter = 'ongoing' | 'past' | 'drafts'

const CAMPAIGNS = [
  {
    id: 1,
    channel: 'Email & Social',
    name: 'Los Tres Golpes Ritual',
    desc: 'Focusing on authentic breakfast traditions.',
    spent: 1240,
    roi: '4.2x',
    roiColor: '#005320',
    badge: 'Destacada',
    badgeBg: 'rgba(142,250,158,.25)',
    badgeColor: '#005320',
    note: 'Termina en 4 días',
    status: 'ongoing' as CampaignFilter,
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=160&q=80',
  },
  {
    id: 2,
    channel: 'Anuncios Digitales',
    name: 'Tropical Happy Hour',
    desc: 'BOGO en chinola y mezclas de guayaba.',
    spent: 850,
    roi: '6.1x',
    roiColor: '#005320',
    badge: 'Hot',
    badgeBg: 'rgba(225,37,49,.12)',
    badgeColor: '#e12531',
    note: 'Termina en 12 días',
    status: 'ongoing' as CampaignFilter,
    img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=160&q=80',
  },
  {
    id: 3,
    channel: 'Solo en Tienda',
    name: 'Mama Juana Heritage Month',
    desc: 'Degustación gratuita con cada cena.',
    spent: 400,
    roi: '—',
    roiColor: '#9ca3af',
    badge: 'Pausada',
    badgeBg: '#e7e8e9',
    badgeColor: '#6b7280',
    note: 'Programada',
    status: 'drafts' as CampaignFilter,
    img: null,
  },
  {
    id: 4,
    channel: 'Email',
    name: 'Navidad Dominicana',
    desc: 'Campaña de temporada con menú especial.',
    spent: 2100,
    roi: '7.8x',
    roiColor: '#005320',
    badge: 'Completada',
    badgeBg: '#d7e2ff',
    badgeColor: '#00193c',
    note: 'Dic 2023',
    status: 'past' as CampaignFilter,
    img: 'https://images.unsplash.com/photo-1544025162-d76594e8cef1?w=160&q=80',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Campaigns() {
  const [filter, setFilter] = useState<CampaignFilter>('ongoing')

  const filtered = CAMPAIGNS.filter(c => c.status === filter)

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '4rem' }}>

      {/* ── HERO STATS HEADER ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9ca3af' }}>
              Visión General de Rendimiento
            </p>
            <h1 className="tld-serif" style={{ fontSize: '3rem', fontWeight: 400, color: '#00193c', lineHeight: 1.1, marginTop: '6px' }}>
              Retornos de Marketing
            </h1>
          </div>

          {/* ROI summary pill */}
          <div style={{ background: '#f3f4f5', padding: '1rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af' }}>ROI Total</p>
              <p className="tld-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#e12531', lineHeight: 1 }}>5.8x</p>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(196,198,209,.4)' }} />
            <div>
              <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af' }}>Conversiones</p>
              <p className="tld-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00193c', lineHeight: 1 }}>1,248</p>
            </div>
          </div>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:[grid-template-rows:auto_auto] gap-[1.5rem]">

          {/* Feature campaign card — spans 8 cols × 2 rows */}
          <div className="lg:col-span-8 lg:row-span-2" style={{
            background: '#f3f4f5', borderRadius: '14px', overflow: 'hidden',
            display: 'flex', position: 'relative', minHeight: '340px',
          }}>
            {/* Left text half */}
            <div style={{ width: '55%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
              <div>
                <span style={{ background: '#dcfce7', color: '#005320', fontSize: '.62rem', fontWeight: 800, padding: '4px 12px', borderRadius: '9999px', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  Activa Ahora
                </span>
                <h3 className="tld-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#00193c', marginTop: '14px', marginBottom: '8px', lineHeight: 1.15 }}>
                  Sancocho Sundays
                </h3>
                <p style={{ fontSize: '.86rem', color: '#6b7280', lineHeight: 1.7 }}>
                  Impulsando el engagement del fin de semana mediante narrativas culturales y kits de preparación exclusivos.
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '2px' }}>Alcance</p>
                    <p className="tld-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#00193c' }}>45.2k</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '2px' }}>Engagement</p>
                    <p className="tld-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#00193c' }}>12.4%</p>
                  </div>
                </div>

                {/* Revenue progress */}
                <div style={{ background: 'rgba(255,255,255,.7)', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '.64rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#00193c' }}>Objetivo de Ingresos</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#e12531' }}>82%</span>
                  </div>
                  <div style={{ background: '#e7e8e9', height: '6px', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '9999px', background: '#e12531', width: '82%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right image half */}
            <div style={{ position: 'absolute', right: 0, top: 0, width: '46%', height: '100%', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80"
                alt="Sancocho Sundays campaign"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Gradient fade to left */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #f3f4f5 0%, rgba(243,244,245,.3) 30%, transparent 60%)' }} />
            </div>
          </div>

          {/* Top channel — navy card */}
          <div className="lg:col-span-4" style={{
            background: '#00193c', color: '#fff', borderRadius: '14px', padding: '2rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="ms" style={{ fontSize: '36px', color: 'rgba(119,150,209,.5)', display: 'block', marginBottom: '12px' }}>trending_up</span>
              <h4 className="tld-serif" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Canal Principal</h4>
              <p style={{ fontSize: '.8rem', color: '#7796d1', marginTop: '4px' }}>Instagram Stories</p>
            </div>
            <div style={{ position: 'relative', zIndex: 1, marginTop: '1.5rem' }}>
              <p className="tld-serif" style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>42%</p>
              <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginTop: '4px' }}>
                Cuota de atribución
              </p>
            </div>
            <span className="ms ms-fill" style={{ position: 'absolute', right: '-16px', bottom: '-10px', fontSize: '120px', color: 'rgba(255,255,255,.07)' }}>auto_graph</span>
          </div>

          {/* Next launch — red card */}
          <div className="lg:col-span-4" style={{
            background: '#e12531', borderRadius: '14px', padding: '2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
          }}>
            <div>
              <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: '6px' }}>
                Próximo Lanzamiento
              </p>
              <h4 className="tld-serif" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                Holiday Hampers
              </h4>
            </div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
              border: '1px solid rgba(255,255,255,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <span className="ms">arrow_forward</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL CAMPAIGNS LIST ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
          <h2 className="tld-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#00193c' }}>
            Todas las Campañas
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['ongoing', 'past', 'drafts'] as CampaignFilter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 20px', borderRadius: '9999px', border: '1px solid rgba(196,198,209,.4)',
                background: filter === f ? '#00193c' : 'transparent',
                color: filter === f ? '#fff' : '#9ca3af',
                fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}>
                {{ ongoing: 'Activas', past: 'Anteriores', drafts: 'Borradores' }[f]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(camp => (
            <div key={camp.id} style={{
              background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
              border: '1px solid transparent', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(196,198,209,.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = '#fff'; (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent' }}
            >
              {/* Image / placeholder */}
              {camp.img ? (
                <img
                  src={camp.img} alt={camp.name}
                  style={{ width: '72px', height: '72px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, filter: 'grayscale(30%)' }}
                />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '10px', background: '#e7e8e9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="ms ms-lg" style={{ color: '#9ca3af' }}>inventory</span>
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '2px' }}>
                  {camp.channel}
                </p>
                <h4 className="tld-serif" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#00193c' }}>
                  {camp.name}
                </h4>
                <p style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: '2px' }}>{camp.desc}</p>
              </div>

              {/* Spent */}
              <div style={{ textAlign: 'right', padding: '0 1.5rem', flexShrink: 0 }}>
                <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '2px' }}>Inversión</p>
                <p className="tld-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00193c' }}>
                  ${camp.spent.toLocaleString()}
                </p>
              </div>

              {/* ROI */}
              <div style={{ textAlign: 'right', padding: '0 1.5rem', flexShrink: 0 }}>
                <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '2px' }}>ROI</p>
                <p className="tld-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: camp.roiColor }}>{camp.roi}</p>
              </div>

              {/* Badge + note + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: camp.badgeBg, color: camp.badgeColor, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                    {camp.badge}
                  </span>
                  <span style={{ fontSize: '.72rem', color: '#9ca3af', fontStyle: 'italic' }}>{camp.note}</span>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', color: '#9ca3af' }}>
                  <span className="ms">more_vert</span>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: '12px' }}>
              <span className="ms ms-xl">campaign</span>
              <p style={{ marginTop: '8px', fontSize: '.85rem' }}>Sin campañas en esta categoría</p>
            </div>
          )}
        </div>
      </section>

      {/* ── EDITORIAL FOOTER QUOTE ── */}
      <footer style={{ borderTop: '1px solid rgba(196,198,209,.2)', paddingTop: '3rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <span className="ms ms-fill" style={{ fontSize: '36px', color: 'rgba(225,37,49,.25)', display: 'block', marginBottom: '12px' }}>format_quote</span>
        <p className="tld-serif" style={{ fontSize: '1.3rem', fontStyle: 'italic', fontWeight: 400, color: '#00193c', lineHeight: 1.6 }}>
          "La autenticidad no es una estrategia de marketing, es el alma de nuestra cocina. Cada campaña cuenta una historia que comenzó hace generaciones."
        </p>
        <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: '.62rem', fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', color: '#9ca3af', marginTop: '1.5rem' }}>
          — Little Dominicana Creative House
        </p>
      </footer>
    </div>
  )
}
