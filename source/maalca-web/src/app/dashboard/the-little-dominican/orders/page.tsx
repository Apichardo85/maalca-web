'use client'

import { useState } from 'react'

// ─── Types & mock data ────────────────────────────────────────────────────────

type TableStatus = 'occupied' | 'attention' | 'bill' | 'available' | 'cleaning'

interface TableEntry {
  id: string
  status: TableStatus
  party?: number
  server?: string
  duration?: string   // "1h 12m"
  ticket?: number
  order?: string
  vip?: boolean
}

const TABLES: TableEntry[] = [
  { id: 'T-01', status: 'occupied',  party: 4, server: 'Marisol', duration: '0h 42m', ticket: 112.00, order: 'Pernil + Sancocho + 2x Morir Soñando'   },
  { id: 'T-02', status: 'available'  },
  { id: 'T-03', status: 'cleaning'   },
  { id: 'T-04', status: 'bill',      party: 2, server: 'Carlos',  duration: '1h 28m', ticket: 74.50,  order: 'Pescado frito + Mofongo'                },
  { id: 'T-05', status: 'attention', party: 6, server: 'Yira',    duration: '0h 18m', ticket: 0,      order: 'Esperando orden',                       vip: true },
  { id: 'T-06', status: 'occupied',  party: 3, server: 'Marisol', duration: '0h 55m', ticket: 88.00,  order: 'Chicharrón + 3x Pollo Guisado'         },
  { id: 'T-07', status: 'available'  },
  { id: 'T-08', status: 'occupied',  party: 2, server: 'Carlos',  duration: '0h 30m', ticket: 56.00,  order: 'Camarones + Arroz con leche'            },
  { id: 'T-09', status: 'attention', party: 4, server: 'Yira',    duration: '1h 05m', ticket: 145.00, order: 'Mesa lleva 65 min sin atención'          },
  { id: 'T-10', status: 'bill',      party: 5, server: 'Marisol', duration: '1h 50m', ticket: 198.75, order: 'Solicitud de cuenta pendiente'           },
  { id: 'T-11', status: 'cleaning'   },
  { id: 'T-12', status: 'occupied',  party: 2, server: 'Carlos',  duration: '0h 12m', ticket: 48.00,  order: 'Yaniqueques + Tres Leches + 2 bebidas'  },
]

const LEGEND: { status: TableStatus; label: string; bg: string; color: string; border: string }[] = [
  { status: 'occupied',  label: 'Ocupada',              bg: 'rgba(0,25,60,.06)',   color: '#00193c', border: 'rgba(0,25,60,.15)'   },
  { status: 'attention', label: 'Necesita Atención',    bg: 'rgba(245,158,11,.08)',color: '#b45309', border: 'rgba(245,158,11,.3)'  },
  { status: 'bill',      label: 'Cuenta Solicitada',    bg: 'rgba(59,130,246,.08)',color: '#1d4ed8', border: 'rgba(59,130,246,.3)'  },
  { status: 'available', label: 'Disponible',           bg: 'rgba(34,197,94,.07)', color: '#15803d', border: 'rgba(34,197,94,.25)'  },
  { status: 'cleaning',  label: 'En Limpieza',          bg: 'rgba(156,163,175,.1)',color: '#6b7280', border: 'rgba(156,163,175,.3)' },
]

const statusDot: Record<TableStatus, string> = {
  occupied:  '#00193c',
  attention: '#f59e0b',
  bill:      '#3b82f6',
  available: '#22c55e',
  cleaning:  '#9ca3af',
}

const statusLabel: Record<TableStatus, string> = {
  occupied:  'Ocupada',
  attention: 'Atención',
  bill:      'Cuenta',
  available: 'Libre',
  cleaning:  'Limpieza',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LiveOrders() {
  const [selected, setSelected] = useState<string | null>('T-05')

  const selectedTable = TABLES.find(t => t.id === selected)
  const style = selected ? LEGEND.find(l => l.status === selectedTable?.status) : null

  const counts = Object.fromEntries(LEGEND.map(l => [l.status, TABLES.filter(t => t.status === l.status).length])) as Record<TableStatus, number>

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px' }}>
            Monitor en Vivo
          </p>
          <h2 className="tld-serif" style={{ fontSize: '2.2rem', fontWeight: 400, fontStyle: 'italic', color: '#00193c', lineHeight: 1.1 }}>
            Mesas & Órdenes<br />
            <span style={{ fontWeight: 700 }}>Tiempo Real</span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="tld-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ca3af' }}>
            Feed en vivo
          </span>
        </div>
      </div>

      {/* ── LEGEND PILLS ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {LEGEND.map(l => (
          <div key={l.status} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '9999px',
            background: l.bg, border: `1px solid ${l.border}`,
            fontSize: '.74rem', fontWeight: 600, color: l.color,
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusDot[l.status], display: 'inline-block' }} />
            {l.label}
            <span style={{ fontWeight: 800 }}>{counts[l.status]}</span>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[2rem] items-start">

        {/* Table grid */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {TABLES.map(table => {
              const s = LEGEND.find(l => l.status === table.status)!
              const isSelected = selected === table.id
              return (
                <div
                  key={table.id}
                  onClick={() => setSelected(table.id)}
                  style={{
                    borderRadius: '12px', padding: '1.25rem',
                    background: s.bg, border: `1.5px solid ${isSelected ? statusDot[table.status] : s.border}`,
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 0 0 3px ${s.border}` : 'none',
                    transition: 'box-shadow .15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '.9rem', color: s.color }}>{table.id}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {table.vip && (
                        <span style={{ fontSize: '.56rem', fontWeight: 800, background: '#00193c', color: '#fff', padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>VIP</span>
                      )}
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusDot[table.status], display: 'inline-block' }} />
                    </div>
                  </div>

                  <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: s.color, marginBottom: '4px' }}>
                    {statusLabel[table.status]}
                  </p>

                  {table.party && (
                    <div style={{ fontSize: '.74rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span><span className="ms ms-sm" style={{ verticalAlign: 'middle', fontSize: '14px' }}>group</span> {table.party} personas</span>
                      {table.server && <span><span className="ms ms-sm" style={{ verticalAlign: 'middle', fontSize: '14px' }}>badge</span> {table.server}</span>}
                      {table.duration && <span><span className="ms ms-sm" style={{ verticalAlign: 'middle', fontSize: '14px' }}>schedule</span> {table.duration}</span>}
                      {table.ticket && table.ticket > 0 ? (
                        <span style={{ fontWeight: 700, color: '#00193c', marginTop: '4px', fontSize: '.82rem' }}>
                          ${table.ticket.toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  )}

                  {table.status === 'available' && (
                    <p style={{ fontSize: '.72rem', color: '#15803d', fontWeight: 600 }}>Lista para recibir</p>
                  )}
                  {table.status === 'cleaning' && (
                    <p style={{ fontSize: '.72rem', color: '#9ca3af', fontWeight: 600 }}>Preparando mesa…</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel — selected table detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {selectedTable && style ? (
            <>
              {/* Detail card */}
              <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,.06)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f1f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: statusDot[selectedTable.status], display: 'inline-block' }} />
                    <p style={{ fontWeight: 800, fontSize: '.88rem', color: '#00193c' }}>{selectedTable.id}</p>
                    {selectedTable.vip && (
                      <span style={{ fontSize: '.58rem', fontWeight: 800, background: '#00193c', color: '#fff', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>VIP</span>
                    )}
                  </div>
                  <p style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: style.color }}>
                    {statusLabel[selectedTable.status]}
                  </p>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedTable.party && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                      <span style={{ color: '#9ca3af' }}>Comensales</span>
                      <span style={{ fontWeight: 700, color: '#00193c' }}>{selectedTable.party} personas</span>
                    </div>
                  )}
                  {selectedTable.server && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                      <span style={{ color: '#9ca3af' }}>Mesero/a</span>
                      <span style={{ fontWeight: 700, color: '#00193c' }}>{selectedTable.server}</span>
                    </div>
                  )}
                  {selectedTable.duration && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                      <span style={{ color: '#9ca3af' }}>Tiempo activo</span>
                      <span style={{ fontWeight: 700, color: '#00193c' }}>{selectedTable.duration}</span>
                    </div>
                  )}
                  {selectedTable.ticket && selectedTable.ticket > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                      <span style={{ color: '#9ca3af' }}>Ticket actual</span>
                      <span className="tld-serif" style={{ fontWeight: 700, fontSize: '1rem', color: '#00193c' }}>${selectedTable.ticket.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedTable.order && (
                    <div style={{ marginTop: '4px', padding: '10px 12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px' }}>Orden</p>
                      <p style={{ fontSize: '.78rem', color: '#374151', lineHeight: 1.5 }}>{selectedTable.order}</p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                {(selectedTable.status === 'occupied' || selectedTable.status === 'attention') && (
                  <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button style={{
                      width: '100%', padding: '10px', borderRadius: '9999px',
                      background: '#00193c', color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: '.78rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <span className="ms ms-sm">add_circle</span> Agregar ítem
                    </button>
                    <button style={{
                      width: '100%', padding: '10px', borderRadius: '9999px',
                      background: '#f3f4f5', color: '#374151', border: 'none', cursor: 'pointer',
                      fontSize: '.78rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <span className="ms ms-sm">receipt</span> Generar cuenta
                    </button>
                  </div>
                )}
                {selectedTable.status === 'bill' && (
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <button style={{
                      width: '100%', padding: '10px', borderRadius: '9999px',
                      background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: '.78rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <span className="ms ms-sm">payments</span> Procesar Pago
                    </button>
                  </div>
                )}
                {selectedTable.status === 'available' && (
                  <div style={{ padding: '0 1.5rem 1.5rem' }}>
                    <button style={{
                      width: '100%', padding: '10px', borderRadius: '9999px',
                      background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer',
                      fontSize: '.78rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <span className="ms ms-sm">table_restaurant</span> Asignar Mesa
                    </button>
                  </div>
                )}
              </div>

              {/* Attention alerts */}
              {TABLES.filter(t => t.status === 'attention').length > 0 && (
                <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ms ms-sm">warning</span> Requieren Atención
                  </p>
                  {TABLES.filter(t => t.status === 'attention').map(t => (
                    <button key={t.id} onClick={() => setSelected(t.id)} style={{
                      width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '6px 4px', fontSize: '.78rem', fontWeight: 700, color: '#b45309',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span>{t.id} {t.vip ? '— VIP' : ''}</span>
                      <span style={{ fontWeight: 400, fontSize: '.72rem', color: '#92400e' }}>{t.duration}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              <span className="ms ms-xl">table_restaurant</span>
              <p style={{ marginTop: '8px', fontSize: '.82rem' }}>Selecciona una mesa para ver el detalle</p>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[1rem]">
        {[
          { label: 'Ventas del Turno',   value: '$634.25', icon: 'attach_money',  color: '#15803d' },
          { label: 'Mesas Ocupadas',     value: `${counts.occupied + counts.attention + counts.bill}/12`, icon: 'table_restaurant', color: '#00193c' },
          { label: 'Ticket Promedio',    value: '$88.40',  icon: 'receipt_long', color: '#1d4ed8' },
          { label: 'Órd. Completadas',   value: '14',      icon: 'check_circle', color: '#15803d' },
          { label: 'Tiempo Prom. Mesa',  value: '52 min',  icon: 'schedule',     color: '#b45309' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <span className="ms ms-fill" style={{ color: s.color }}>{s.icon}</span>
            <p className="tld-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00193c', lineHeight: 1.2, marginTop: '6px' }}>{s.value}</p>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ca3af', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
