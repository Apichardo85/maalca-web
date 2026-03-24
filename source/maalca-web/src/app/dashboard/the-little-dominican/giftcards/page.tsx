'use client'

import { useState } from 'react'

// ─── Types & mock data ────────────────────────────────────────────────────────

type CardStatus = 'active' | 'redeemed' | 'locked'

const CARDS = [
  { initials: 'MA', name: 'Mateo Almonte',  email: 'mateo@example.do',       id: '**** **** 8291', issued: 'Oct 24, 2023', initial: 500.00,  balance: 342.50, status: 'active'   as CardStatus },
  { initials: 'RC', name: 'Rosa Castillo',  email: 'rosa.cas@webmail.com',   id: '**** **** 1039', issued: 'Nov 12, 2023', initial: 200.00,  balance: 0.00,   status: 'redeemed' as CardStatus },
  { initials: 'JV', name: 'Juan Valdez',    email: 'juan.v@coffee.com',      id: '**** **** 5522', issued: 'Jan 04, 2024', initial: 1000.00, balance: 890.00, status: 'active'   as CardStatus },
  { initials: 'LS', name: 'Lucía Santos',   email: 'lsantos@domain.do',      id: '**** **** 9918', issued: 'Feb 15, 2024', initial: 150.00,  balance: 150.00, status: 'locked'   as CardStatus },
  { initials: 'YP', name: 'Yanira Peralta', email: 'yperalta@hotmail.com',   id: '**** **** 3301', issued: 'Mar 01, 2024', initial: 300.00,  balance: 180.00, status: 'active'   as CardStatus },
  { initials: 'AM', name: 'Altagracia M.',  email: 'alta.mendez@gmail.com',  id: '**** **** 7745', issued: 'Mar 10, 2024', initial: 500.00,  balance: 500.00, status: 'active'   as CardStatus },
]

const statusStyle: Record<CardStatus, { bg: string; color: string; label: string }> = {
  active:   { bg: '#dcfce7', color: '#15803d', label: 'ACTIVA'   },
  redeemed: { bg: '#e7e8e9', color: '#6b7280', label: 'CANJEADA' },
  locked:   { bg: '#ffdad6', color: '#93000a', label: 'BLOQUEADA' },
}

const PAGE_SIZE = 4

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GiftCards() {
  const [filter, setFilter]   = useState<'all' | CardStatus>('all')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  const filtered = CARDS.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.id.includes(search)) return false
    return true
  })
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── HERO BENTO ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-[1.5rem]">

        {/* Main balance card */}
        <div style={{
          background: '#002d62', borderRadius: '14px', padding: '2.5rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden', minHeight: '240px',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(119,150,209,.85)', marginBottom: '14px' }}>
              Saldo Total en Circulación
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span className="tld-serif" style={{ fontSize: '3.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                $84,200
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '.78rem', fontWeight: 700, color: '#3eaa59' }}>
                <span className="ms ms-sm">trending_up</span> +12.4%
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '12px', marginTop: '2.5rem' }}>
            <button style={{
              padding: '12px 28px', borderRadius: '9999px', border: 'none',
              background: '#fff', color: '#00193c', fontSize: '.78rem', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '.04em',
            }}>
              Emitir Nueva Tarjeta
            </button>
            <button style={{
              padding: '12px 28px', borderRadius: '9999px',
              background: 'rgba(255,255,255,.12)', color: '#fff',
              border: '1px solid rgba(255,255,255,.15)', fontSize: '.78rem', fontWeight: 700,
              cursor: 'pointer',
            }}>
              Exportar Registro
            </button>
          </div>

          {/* Decorative glow + icon */}
          <div style={{ position: 'absolute', right: '-80px', bottom: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,.04)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <span className="ms" style={{ position: 'absolute', top: '1.5rem', right: '2rem', fontSize: '120px', color: 'rgba(255,255,255,.12)', pointerEvents: 'none' }}>
            featured_seasonal_and_gifts
          </span>
        </div>

        {/* Secondary stats */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#f3f4f5', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9ca3af' }}>Tarjetas Activas</p>
              <span className="ms" style={{ color: '#00193c' }}>credit_card</span>
            </div>
            <span className="tld-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#00193c' }}>1,428</span>
          </div>

          <div style={{ background: '#f3f4f5', borderRadius: '14px', padding: '1.5rem', borderLeft: '4px solid #e12531', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9ca3af' }}>Vencidas (30d)</p>
              <span className="ms" style={{ color: '#e12531' }}>event_busy</span>
            </div>
            <span className="tld-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#00193c' }}>42</span>
          </div>
        </div>
      </section>

      {/* ── REGISTRY ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="tld-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#00193c' }}>Registro</h2>
            <p style={{ fontSize: '.8rem', color: '#9ca3af', marginTop: '2px' }}>
              Log detallado de todos los instrumentos de regalo activos e históricos.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span className="ms ms-sm" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>search</span>
              <input
                type="text" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Número o cliente..."
                style={{
                  background: '#f3f4f5', border: 'none', borderRadius: '9999px',
                  padding: '8px 14px 8px 32px', fontFamily: 'Manrope,sans-serif',
                  fontSize: '.76rem', color: '#374151', outline: 'none', width: '200px',
                }}
              />
            </div>

            {/* Filter tabs */}
            {(['all', 'active', 'redeemed', 'locked'] as const).map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1) }} style={{
                padding: '7px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                fontSize: '.72rem', fontWeight: 700,
                background: filter === f ? '#00193c' : '#f3f4f5',
                color: filter === f ? '#fff' : '#9ca3af',
              }}>
                {{ all: 'Todos', active: 'Activas', redeemed: 'Canjeadas', locked: 'Bloqueadas' }[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)', minWidth: '680px' }}>

          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2.5fr 1.4fr 1.2fr 1fr 1.2fr 1fr auto',
            padding: '12px 2rem', borderBottom: '1px solid #f9fafb',
            fontSize: '.6rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9ca3af',
          }}>
            <span>Titular</span>
            <span>ID Tarjeta</span>
            <span>Emisión</span>
            <span>Inicial</span>
            <span>Saldo Actual</span>
            <span>Estado</span>
            <span />
          </div>

          {/* Data rows */}
          {paginated.map(card => {
            const s = statusStyle[card.status]
            return (
              <div key={card.id} className="tld-tr" style={{
                display: 'grid', gridTemplateColumns: '2.5fr 1.4fr 1.2fr 1fr 1.2fr 1fr auto',
                padding: '1.1rem 2rem', borderBottom: '1px solid #f9fafb',
                alignItems: 'center', cursor: 'pointer',
              }}>
                {/* Holder */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: '#edeeef', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '.68rem', color: '#00193c',
                  }}>
                    {card.initials}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '.86rem', color: '#00193c' }}>{card.name}</p>
                    <p style={{ fontSize: '.7rem', color: '#9ca3af' }}>{card.email}</p>
                  </div>
                </div>

                {/* Card ID */}
                <span style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#9ca3af', letterSpacing: '.04em' }}>
                  {card.id}
                </span>

                {/* Issued */}
                <span style={{ fontSize: '.82rem', color: '#6b7280' }}>{card.issued}</span>

                {/* Initial value */}
                <span style={{ fontSize: '.82rem', color: '#6b7280' }}>${card.initial.toFixed(2)}</span>

                {/* Current balance */}
                <span className="tld-serif" style={{ fontWeight: 700, fontSize: '.96rem', color: '#00193c' }}>
                  ${card.balance.toFixed(2)}
                </span>

                {/* Status badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                  borderRadius: '9999px', background: s.bg, fontSize: '.62rem',
                  fontWeight: 800, letterSpacing: '.08em', color: s.color, justifySelf: 'start',
                }}>
                  {s.label}
                </span>

                {/* Actions */}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#d1d5db', marginLeft: '8px' }}>
                  <span className="ms ms-sm">more_vert</span>
                </button>
              </div>
            )
          })}

          {paginated.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              <span className="ms ms-xl">featured_seasonal_and_gifts</span>
              <p style={{ marginTop: '8px', fontSize: '.85rem' }}>Sin resultados</p>
            </div>
          )}

          {/* Pagination footer */}
          <div style={{ padding: '14px 2rem', borderTop: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.74rem', color: '#9ca3af' }}>
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} entradas
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e4e5e7',
                background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#e4e5e7' : '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="ms ms-sm">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{
                  width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e4e5e7',
                  background: page === i + 1 ? '#00193c' : '#fff',
                  color: page === i + 1 ? '#fff' : '#374151',
                  cursor: 'pointer', fontSize: '.76rem', fontWeight: 700,
                }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e4e5e7',
                background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? '#e4e5e7' : '#6b7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="ms ms-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── BOTTOM EDITORIAL ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]" style={{ paddingBottom: '2rem' }}>

        {/* Incentive campaigns */}
        <div style={{
          background: '#f3f4f5', borderRadius: '14px', padding: '2rem',
          position: 'relative', overflow: 'hidden', height: '240px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
            alt="Restaurant atmosphere"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .18, filter: 'grayscale(30%)', pointerEvents: 'none' }}
          />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 className="tld-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00193c', marginBottom: '8px' }}>
              Campañas de Incentivos
            </h3>
            <p style={{ fontSize: '.8rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '14px', maxWidth: '400px' }}>
              Impulsa más ingresos combinando gift cards con los especiales de temporada. Aumenta el ticket promedio hasta un 15%.
            </p>
            <button style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
              color: '#e12531', display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              Ver Estrategias <span className="ms ms-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Security & smart suggestions */}
        <div style={{ background: '#f3f4f5', borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
          {[
            {
              icon: 'security',
              title: 'Protección contra Fraude',
              desc: 'Monitoreo de tarjetas con IA activo para 1,428 tarjetas.',
            },
            {
              icon: 'auto_awesome',
              title: 'Sugerencias Inteligentes',
              desc: '82 clientes tienen tarjetas que vencen en los próximos 14 días.',
            },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: '#fff', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,.06)',
              }}>
                <span className="ms" style={{ color: '#00193c' }}>{item.icon}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '.86rem', color: '#00193c', marginBottom: '2px' }}>{item.title}</p>
                <p style={{ fontSize: '.76rem', color: '#9ca3af', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
