'use client'

import { useState } from 'react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const CUSTOMERS = [
  {
    id: 1, name: 'Altagracia Méndez', email: 'alta.mendez@gmail.com', phone: '+1 845 521 0034',
    visits: 18, lastVisit: 'Mar 20, 2026', totalSpent: 1240.00, avgTicket: 68.88,
    tier: 'VIP', status: 'active', initials: 'AM',
    tags: ['Familia numerosa', 'Preferencia: Pernil'],
  },
  {
    id: 2, name: 'Roberto Castillo', email: 'r.castillo@yahoo.com', phone: '+1 845 311 7892',
    visits: 9, lastVisit: 'Mar 18, 2026', totalSpent: 620.50, avgTicket: 68.94,
    tier: 'Regular', status: 'active', initials: 'RC',
    tags: ['Alérgico: mariscos'],
  },
  {
    id: 3, name: 'Yanira Peralta',    email: 'yperalta@hotmail.com', phone: '+1 914 708 4412',
    visits: 24, lastVisit: 'Mar 22, 2026', totalSpent: 2180.75, avgTicket: 90.86,
    tier: 'VIP', status: 'active', initials: 'YP',
    tags: ['Cumpleaños: 15 Abr', 'Vino blanco'],
  },
  {
    id: 4, name: 'Marcus Thompson',  email: 'm.thompson@gmail.com', phone: '+1 845 882 3310',
    visits: 3, lastVisit: 'Feb 28, 2026', totalSpent: 198.00, avgTicket: 66.00,
    tier: 'Nuevo', status: 'inactive', initials: 'MT',
    tags: ['Referido por Yanira P.'],
  },
  {
    id: 5, name: 'Diana Rodríguez',  email: 'drodriguez@outlook.com', phone: '+1 845 445 0091',
    visits: 12, lastVisit: 'Mar 15, 2026', totalSpent: 890.25, avgTicket: 74.19,
    tier: 'Regular', status: 'active', initials: 'DR',
    tags: ['Delivery habitual', 'Mofongo siempre'],
  },
  {
    id: 6, name: 'James & Lucia Park', email: 'jlpark@gmail.com', phone: '+1 914 220 8834',
    visits: 7, lastVisit: 'Mar 10, 2026', totalSpent: 542.00, avgTicket: 77.43,
    tier: 'Regular', status: 'active', initials: 'JP',
    tags: ['Pareja', 'Mesa ventana'],
  },
]

const RETENTION = [
  { label: 'Clientes VIP',     value: 2,   pct: 33, color: '#e12531' },
  { label: 'Clientes Activos', value: 5,   pct: 83, color: '#22c55e' },
  { label: 'Inactivos 30d',    value: 1,   pct: 17, color: '#f59e0b' },
  { label: 'Tasa Retención',   value: '91%', pct: 91, color: '#00193c' },
]

const tierBadge: Record<string, { bg: string; color: string }> = {
  'VIP':     { bg: '#fef3c7', color: '#b45309' },
  'Regular': { bg: '#dbeafe', color: '#1d4ed8' },
  'Nuevo':   { bg: '#dcfce7', color: '#15803d' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerDirectory() {
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState<string>('Todos')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 4

  const filtered = CUSTOMERS.filter(c => {
    if (filterTier !== 'Todos' && c.tier !== filterTier) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── EDITORIAL HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px' }}>
            CRM — Directorio
          </p>
          <h2 className="tld-serif" style={{ fontSize: '2.2rem', fontWeight: 400, fontStyle: 'italic', color: '#00193c', lineHeight: 1.1 }}>
            Nuestra Comunidad<br />
            <span style={{ fontWeight: 700 }}>de Comensales</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            padding: '10px 18px', borderRadius: '9999px', border: '1px solid #e4e5e7',
            background: '#fff', fontSize: '.78rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="ms ms-sm">download</span> Exportar
          </button>
          <button style={{
            padding: '10px 20px', borderRadius: '9999px', border: 'none',
            background: '#00193c', color: '#fff', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="ms ms-sm">person_add</span> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[2rem] items-start">

        {/* Left — CRM table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Todos', 'VIP', 'Regular', 'Nuevo'].map(tier => (
                <button key={tier} onClick={() => { setFilterTier(tier); setPage(1) }} style={{
                  padding: '7px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                  fontSize: '.78rem', fontWeight: 600,
                  background: filterTier === tier ? '#00193c' : '#f3f4f5',
                  color: filterTier === tier ? '#fff' : '#6b7280',
                  transition: 'background .15s',
                }}>
                  {tier}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <span className="ms ms-sm" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>search</span>
              <input
                type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Buscar por nombre o email..."
                style={{
                  background: '#f3f4f5', border: 'none', borderRadius: '9999px',
                  padding: '8px 16px 8px 34px', fontFamily: 'Manrope,sans-serif',
                  fontSize: '.78rem', color: '#374151', outline: 'none', width: '240px',
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)', minWidth: '600px' }}>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '12px 1.5rem', borderBottom: '1px solid #f0f1f2',
              fontSize: '.62rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af',
            }}>
              <span>Cliente</span>
              <span style={{ textAlign: 'center' }}>Tier</span>
              <span style={{ textAlign: 'center' }}>Visitas</span>
              <span style={{ textAlign: 'center' }}>Gasto Total</span>
              <span style={{ textAlign: 'right' }}>Última Visita</span>
            </div>

            {/* Rows */}
            {paginated.map(customer => (
              <div key={customer.id} className="tld-tr" style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                padding: '1rem 1.5rem', borderBottom: '1px solid #f9fafb',
                cursor: 'pointer',
              }}>
                {/* Customer info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: '#d7e2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '.72rem', color: '#00193c', flexShrink: 0,
                  }}>
                    {customer.initials}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '.85rem', color: '#00193c', marginBottom: '2px' }}>{customer.name}</p>
                    <p style={{ fontSize: '.72rem', color: '#9ca3af' }}>{customer.email}</p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {customer.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: '.58rem', fontWeight: 600, padding: '2px 6px',
                          borderRadius: '4px', background: '#f3f4f5', color: '#6b7280',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tier */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    ...tierBadge[customer.tier],
                    fontSize: '.65rem', fontWeight: 700, padding: '4px 10px',
                    borderRadius: '9999px', letterSpacing: '.05em',
                  }}>
                    {customer.tier}
                  </span>
                </div>

                {/* Visits */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="tld-serif" style={{ fontSize: '1rem', fontWeight: 700, color: '#00193c' }}>{customer.visits}</span>
                </div>

                {/* Total spent */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span className="tld-serif" style={{ fontSize: '1rem', fontWeight: 700, color: '#00193c' }}>
                    ${customer.totalSpent.toFixed(0)}
                  </span>
                  <span style={{ fontSize: '.64rem', color: '#9ca3af' }}>avg ${customer.avgTicket.toFixed(0)}</span>
                </div>

                {/* Last visit */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '.76rem', color: '#6b7280', textAlign: 'right' }}>{customer.lastVisit}</span>
                </div>
              </div>
            ))}

            {paginated.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                <span className="ms ms-xl">person_off</span>
                <p style={{ marginTop: '8px', fontSize: '.85rem' }}>No se encontraron clientes</p>
              </div>
            )}

            {/* Pagination */}
            <div style={{ padding: '12px 1.5rem', borderTop: '1px solid #f0f1f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '.74rem', color: '#9ca3af' }}>
                Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} clientes
              </p>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: '1px solid #e4e5e7',
                    background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '.76rem', fontWeight: 600, color: page === 1 ? '#d1d5db' : '#374151',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <span className="ms ms-sm">chevron_left</span>
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} style={{
                    padding: '6px 12px', borderRadius: '8px', border: '1px solid #e4e5e7',
                    background: page === i + 1 ? '#00193c' : '#fff',
                    color: page === i + 1 ? '#fff' : '#374151',
                    cursor: 'pointer', fontSize: '.76rem', fontWeight: 700,
                  }}>
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: '1px solid #e4e5e7',
                    background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '.76rem', fontWeight: 600, color: page === totalPages ? '#d1d5db' : '#374151',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <span className="ms ms-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Right — Retention + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Retention card */}
          <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f1f2' }}>
              <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#374151' }}>
                Retención & Fidelización
              </p>
            </div>

            {/* Restaurant atmosphere image */}
            <div style={{ height: '140px', overflow: 'hidden', background: '#1a1a1a', position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=600&q=80"
                alt="Little Dominican atmosphere"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,25,60,.6))' }} />
              <p className="tld-serif" style={{ position: 'absolute', bottom: '12px', left: '16px', color: '#fff', fontSize: '.95rem', fontStyle: 'italic', fontWeight: 400 }}>
                Sabor que fideliza.
              </p>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {RETENTION.map(item => (
                <div key={item.label} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#374151' }}>{item.label}</span>
                    <span className="tld-serif" style={{ fontSize: '.9rem', fontWeight: 700, color: '#00193c' }}>{item.value}</span>
                  </div>
                  <div style={{ background: '#f3f4f5', borderRadius: '9999px', height: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '9999px', background: item.color, width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top spender */}
          <div style={{ background: '#00193c', borderRadius: '14px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: '10px' }}>
                Top Cliente del Mes
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#d7e2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.82rem', color: '#00193c' }}>
                  YP
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '.9rem', color: '#fff' }}>Yanira Peralta</p>
                  <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.6)' }}>24 visitas · VIP</p>
                </div>
              </div>
              <p className="tld-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>$2,180</p>
              <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', marginTop: '4px' }}>gasto acumulado</p>
            </div>
            <span className="ms" style={{ position: 'absolute', right: '-10px', bottom: '-14px', fontSize: '80px', color: 'rgba(255,255,255,.06)' }}>workspace_premium</span>
          </div>

          {/* Campaign nudge */}
          <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '1.25rem', border: '1px solid #f0f1f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="ms ms-fill" style={{ color: '#e12531' }}>campaign</span>
              <p style={{ fontWeight: 700, fontSize: '.84rem', color: '#00193c' }}>Próxima Campaña</p>
            </div>
            <p style={{ fontSize: '.76rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '12px' }}>
              1 cliente inactivo los últimos 30 días. Envía un cupón de retención.
            </p>
            <button style={{
              width: '100%', padding: '9px', borderRadius: '9999px', border: 'none',
              background: '#e12531', color: '#fff', fontSize: '.76rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <span className="ms ms-sm">send</span> Enviar Campaña
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
