'use client'

import { useState } from 'react'

// ─── Mock data ────────────────────────────────────────────────────────────────

type InvoiceStatus = 'paid' | 'overdue' | 'pending'

const INVOICES = [
  { id: '#INV-9821', client: 'Marco Antonio de la Cruz',  initials: 'MA', date: 'Oct 24, 2023', status: 'paid'    as InvoiceStatus, freshness: 'Orgánico',  amount: 1240.00  },
  { id: '#INV-9820', client: 'Santo Lucas Catering',      initials: 'SL', date: 'Oct 23, 2023', status: 'overdue' as InvoiceStatus, freshness: 'Importado', amount: 4850.50  },
  { id: '#INV-9819', client: 'Dominican Resort Group',    initials: 'DR', date: 'Oct 23, 2023', status: 'pending' as InvoiceStatus, freshness: 'Local',     amount: 12400.00 },
  { id: '#INV-9818', client: 'Altagracia Méndez',         initials: 'AM', date: 'Oct 22, 2023', status: 'paid'    as InvoiceStatus, freshness: 'Local',     amount: 320.00   },
  { id: '#INV-9817', client: 'Yanira Peralta',            initials: 'YP', date: 'Oct 21, 2023', status: 'paid'    as InvoiceStatus, freshness: 'Orgánico',  amount: 610.75   },
]

const statusStyle: Record<InvoiceStatus, { bg: string; color: string; label: string }> = {
  paid:    { bg: '#dcfce7', color: '#15803d', label: 'Pagado'   },
  overdue: { bg: '#fecdd3', color: '#be123c', label: 'Vencido'  },
  pending: { bg: '#e7e8e9', color: '#6b7280', label: 'Pendiente' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Invoicing() {
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all')

  const filtered = INVOICES.filter(inv => filter === 'all' || inv.status === filter)

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── HERO BENTO ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-[1.5rem]">

        {/* Revenue card */}
        <div style={{ background: '#f3f4f5', borderRadius: '14px', padding: '2.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '280px' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>
              Rendimiento de Ingresos
            </p>
            <h2 className="tld-serif" style={{ fontSize: '2.5rem', fontWeight: 300, color: '#00193c', letterSpacing: '-.02em', marginBottom: '10px' }}>
              Total Facturado
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span className="tld-serif" style={{ fontSize: '4rem', fontStyle: 'italic', fontWeight: 700, color: '#00193c', lineHeight: 1 }}>
                $142,850
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', background: 'rgba(142,250,158,.25)', color: '#15803d', fontSize: '.72rem', fontWeight: 700 }}>
                <span className="ms ms-sm">trending_up</span> +12.5%
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '12px', marginTop: '2rem' }}>
            <button style={{
              padding: '12px 28px', borderRadius: '9999px', border: 'none',
              background: '#e12531', color: '#fff', fontSize: '.78rem', fontWeight: 700,
              cursor: 'pointer', letterSpacing: '.04em',
            }}>
              Descargar Reporte
            </button>
            <button style={{
              padding: '12px 28px', borderRadius: '9999px', border: 'none',
              background: '#e1e3e4', color: '#00193c', fontSize: '.78rem', fontWeight: 700,
              cursor: 'pointer',
            }}>
              Ver Toda la Actividad
            </button>
          </div>

          {/* Decorative gradient */}
          <div style={{ position: 'absolute', right: '-64px', top: '-64px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,25,60,.06), rgba(225,37,49,.06))', filter: 'blur(40px)', pointerEvents: 'none' }} />
        </div>

        {/* Quick action cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Generate invoice */}
          <div style={{ flex: 1, background: '#00193c', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="ms ms-fill" style={{ color: '#7796d1', fontSize: '36px', display: 'block', marginBottom: '10px' }}>add_circle</span>
              <h3 className="tld-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                Generar Nueva<br />Proforma
              </h3>
            </div>
            <span style={{ position: 'relative', zIndex: 1, fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              Iniciar Borrador <span className="ms ms-sm">arrow_forward</span>
            </span>
            <span className="ms" style={{ position: 'absolute', right: '-16px', bottom: '-10px', fontSize: '80px', color: 'rgba(255,255,255,.07)' }}>description</span>
          </div>

          {/* Pending approvals */}
          <div style={{ flex: 1, background: '#e7e8e9', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid transparent' }}>
            <div>
              <span className="ms" style={{ color: '#e12531', fontSize: '32px', display: 'block', marginBottom: '8px' }}>pending_actions</span>
              <h3 className="tld-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00193c', lineHeight: 1.3 }}>
                Aprobaciones<br />Pendientes
              </h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span className="tld-serif" style={{ fontSize: '2rem', fontStyle: 'italic', fontWeight: 700, color: '#00193c' }}>14</span>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e12531', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 800 }}>!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENT INVOICES TABLE ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="tld-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#00193c', letterSpacing: '-.01em' }}>
              Facturas Recientes
            </h2>
            <p style={{ fontSize: '.8rem', color: '#9ca3af', marginTop: '2px' }}>
              Mostrando las últimas {filtered.length} transacciones procesadas.
            </p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', padding: '4px', borderRadius: '9999px', background: '#f3f4f5', gap: '2px' }}>
            {(['all', 'paid', 'overdue', 'pending'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 18px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                fontSize: '.72rem', fontWeight: 700,
                background: filter === f ? '#fff' : 'none',
                color: filter === f ? '#00193c' : '#9ca3af',
                boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}>
                {{ all: 'Todos', paid: 'Pagado', overdue: 'Vencido', pending: 'Pendiente' }[f]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)', minWidth: '700px' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 2.5fr 1.2fr 1fr 1fr 1.2fr auto',
            padding: '12px 2rem', background: '#f9fafb',
            fontSize: '.6rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9ca3af',
          }}>
            <span>ID Factura</span>
            <span>Cliente</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Origen</span>
            <span style={{ textAlign: 'right' }}>Monto</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map(inv => {
            const s = statusStyle[inv.status]
            return (
              <div key={inv.id} className="tld-tr" style={{
                display: 'grid', gridTemplateColumns: '1fr 2.5fr 1.2fr 1fr 1fr 1.2fr auto',
                padding: '1.2rem 2rem', borderBottom: '1px solid #f9fafb',
                alignItems: 'center', cursor: 'pointer',
              }}>
                <span style={{ fontWeight: 800, fontSize: '.86rem', color: '#00193c', letterSpacing: '-.01em' }}>{inv.id}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#d7e2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.68rem', color: '#00193c', flexShrink: 0 }}>
                    {inv.initials}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '.86rem', color: '#191c1d' }}>{inv.client}</span>
                </div>

                <span style={{ fontSize: '.82rem', color: '#9ca3af' }}>{inv.date}</span>

                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '9999px', background: s.bg, fontSize: '.64rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: s.color, justifySelf: 'start' }}>
                  {s.label}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '9999px', background: 'rgba(142,250,158,.2)', fontSize: '.62rem', fontWeight: 700, color: '#005320', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#005320', display: 'inline-block' }} />
                    {inv.freshness}
                  </span>
                </div>

                <span className="tld-serif" style={{ textAlign: 'right', fontSize: '1rem', fontWeight: 700, color: '#00193c' }}>
                  ${inv.amount.toFixed(2)}
                </span>

                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#d1d5db', marginLeft: '8px' }}>
                  <span className="ms ms-sm">more_vert</span>
                </button>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              <span className="ms ms-xl">receipt_long</span>
              <p style={{ marginTop: '8px', fontSize: '.85rem' }}>Sin facturas en esta categoría</p>
            </div>
          )}

          {/* Pagination footer */}
          <div style={{ padding: '14px 2rem', background: 'rgba(249,250,251,.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.76rem', color: '#9ca3af' }}>Mostrando {filtered.length} de 152 facturas</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['chevron_left',null,null,'chevron_right'].map((icon, i) => (
                <button key={i} style={{
                  width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e4e5e7',
                  background: i === 1 ? '#00193c' : '#fff',
                  color: i === 1 ? '#fff' : '#6b7280',
                  fontSize: i > 0 && i < 3 ? '.72rem' : '0', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon ? <span className="ms ms-sm">{icon}</span> : (i === 1 ? '1' : '2')}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── EDITORIAL BREAK ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 items-center gap-[4rem]" style={{ padding: '2rem 0 4rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: '14px', overflow: 'hidden', aspectRatio: '4/3', position: 'relative', zIndex: 1 }}>
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80"
              alt="Dominican cuisine"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Decorative offset box */}
          <div style={{ position: 'absolute', bottom: '-32px', right: '-32px', width: '60%', aspectRatio: '1', background: '#edeeef', borderRadius: '12px', zIndex: 0 }} />
          {/* Decorative ring */}
          <div style={{ position: 'absolute', top: '-48px', left: '-48px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(196,198,209,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <span className="tld-serif" style={{ color: 'rgba(0,25,60,.12)', fontSize: '1.8rem', fontStyle: 'italic' }}>Calidad</span>
          </div>
        </div>

        <div style={{ paddingLeft: '2rem' }}>
          <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.3em', textTransform: 'uppercase', color: '#e12531', marginBottom: '14px' }}>
            Nuestro Compromiso
          </p>
          <h3 className="tld-serif" style={{ fontSize: '2.6rem', fontWeight: 400, color: '#00193c', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Honrando la herencia del sabor dominicano con abastecimiento premium.
          </h3>
          <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.8, marginBottom: '2rem' }}>
            Cada factura representa una alianza con agricultores locales y proveedores internacionales dedicados a mantener el estándar de excelencia de Little Dominicana.
          </p>
          <div style={{ display: 'flex', gap: '3rem' }}>
            {[
              { value: '98%', label: 'Satisfacción Proveedor' },
              { value: '24h', label: 'Tiempo Promedio de Pago' },
            ].map(s => (
              <div key={s.label}>
                <span className="tld-serif" style={{ display: 'block', fontSize: '2.5rem', fontStyle: 'italic', fontWeight: 700, color: '#00193c' }}>{s.value}</span>
                <span style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ca3af' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAB ── */}
      <button style={{
        position: 'fixed', bottom: '3rem', right: '3rem',
        width: '60px', height: '60px', borderRadius: '50%',
        background: '#00193c', color: '#fff', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(0,25,60,.3)', zIndex: 50,
      }}>
        <span className="ms ms-lg">add</span>
      </button>
    </div>
  )
}
