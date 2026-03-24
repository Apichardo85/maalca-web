'use client'

import { useState } from 'react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const ITEMS = [
  {
    id: 1, name: 'Plátanos (dulces)',       sku: 'PLT-DR-SW-10', category: 'Produce',
    qty: '12 lbs', price: 4.50,  status: 'critical',
    img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=80&q=80',
  },
  {
    id: 2, name: 'Snapper fresco',          sku: 'FSH-SN-FR-01', category: 'Seafood',
    qty: '8 lbs',  price: 12.00, status: 'low',
    img: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=80&q=80',
  },
  {
    id: 3, name: 'Pernil de cerdo',         sku: 'PK-LEG-DR-01', category: 'Meat',
    qty: '22 lbs', price: 8.75,  status: 'low',
    img: 'https://images.unsplash.com/photo-1544025162-d76594e8cef1?w=80&q=80',
  },
  {
    id: 4, name: 'Arroz largo',             sku: 'RCE-LG-50LB',  category: 'Grains',
    qty: '40 lbs', price: 1.20,  status: 'optimal',
    img: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=80&q=80',
  },
  {
    id: 5, name: 'Habichuelas negras',      sku: 'BN-BLK-DR-10', category: 'Grains',
    qty: '30 lbs', price: 1.80,  status: 'optimal',
    img: 'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=80&q=80',
  },
  {
    id: 6, name: 'Presidente Beer (12oz)',  sku: 'BEV-PRES-24PK', category: 'Beverage',
    qty: '4 cases',price: 28.00, status: 'low',
    img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=80&q=80',
  },
  {
    id: 7, name: 'Yuca fresca',             sku: 'VEG-YCA-FR-10', category: 'Produce',
    qty: '25 lbs', price: 2.10,  status: 'optimal',
    img: 'https://images.unsplash.com/photo-1617952236317-0bd127407984?w=80&q=80',
  },
  {
    id: 8, name: 'Camarones medianos',      sku: 'SHR-MED-FR-05', category: 'Seafood',
    qty: '10 lbs', price: 14.50, status: 'optimal',
    img: 'https://images.unsplash.com/photo-1565680018093-ebb6b9ab7992?w=80&q=80',
  },
]

const SHIPMENTS = [
  { icon: 'local_shipping', color: '#1d4ed8', name: 'Atlantic Seafood Co.', note: 'Expected: Today, 2:00 PM', badge: 'In Transit',  badgeColor: '#1d4ed8' },
  { icon: 'pending_actions', color: '#9ca3af', name: 'DR Highland Produce', note: 'Expected: Tomorrow',       badge: 'Scheduled',   badgeColor: '#9ca3af' },
  { icon: 'inventory_2',    color: '#15803d', name: 'Caribbean Grains LLC', note: 'Expected: Thu, Mar 26',    badge: 'Confirmed',   badgeColor: '#15803d' },
]

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  critical: { bg: '#fecdd3', color: '#be123c', label: 'Crítico'  },
  low:      { bg: '#fef3c7', color: '#b45309', label: 'Bajo'     },
  optimal:  { bg: '#dcfce7', color: '#15803d', label: 'Óptimo'   },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryManagement() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')

  const categories = ['Todos', ...Array.from(new Set(ITEMS.map(i => i.category)))]

  const filtered = ITEMS.filter(item => {
    if (category !== 'Todos' && item.category !== category) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const alertCount = ITEMS.filter(i => i.status !== 'optimal').length

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── BENTO STATS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1.25rem]">

        {/* Total Valuation */}
        <div className="col-span-1 sm:col-span-2" style={{
          padding: '2rem', borderRadius: '12px',
          background: '#002d62', position: 'relative', overflow: 'hidden',
        }}>
          <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(119,150,209,.9)', marginBottom: '8px' }}>
            Valoración Total de Inventario
          </p>
          <h3 className="tld-serif" style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            $248,590
          </h3>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#3eaa59' }}>
            <span className="ms ms-sm">trending_up</span>
            <span style={{ fontSize: '.75rem', fontWeight: 700 }}>+4.2% vs el mes pasado</span>
          </div>
          <span className="ms" style={{ position: 'absolute', right: '-24px', bottom: '-16px', fontSize: '120px', color: 'rgba(255,255,255,.06)' }}>account_balance_wallet</span>
        </div>

        {/* Stock Alerts */}
        <div style={{ padding: '2rem', borderRadius: '12px', background: '#e12531', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)', marginBottom: '6px' }}>
              Alertas de Stock
            </p>
            <h3 className="tld-serif" style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{alertCount}</h3>
          </div>
          <div style={{ fontSize: '.76rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="ms ms-fill ms-sm">warning</span> Ítems por debajo del umbral
          </div>
        </div>

        {/* Active Suppliers */}
        <div style={{ padding: '2rem', borderRadius: '12px', background: '#f3f4f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px' }}>
              Proveedores Activos
            </p>
            <h3 className="tld-serif" style={{ fontSize: '3rem', fontWeight: 700, color: '#00193c', lineHeight: 1 }}>32</h3>
          </div>
          <p style={{ fontSize: '.76rem', fontWeight: 600, color: '#3eaa59' }}>3 entregas pendientes hoy</p>
        </div>
      </section>

      {/* ── MASTER INVENTORY ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 className="tld-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#00193c' }}>
              Inventario Principal
            </h3>
            <p style={{ fontSize: '.8rem', color: '#9ca3af', marginTop: '2px' }}>
              Estado en tiempo real de materias primas e ingredientes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Category filter */}
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '7px 14px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                fontSize: '.72rem', fontWeight: 600,
                background: category === cat ? '#00193c' : '#f3f4f5',
                color: category === cat ? '#fff' : '#6b7280',
              }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <span className="ms ms-sm" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>search</span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                style={{
                  background: '#f3f4f5', border: 'none', borderRadius: '9999px',
                  padding: '8px 14px 8px 32px', fontFamily: 'Manrope,sans-serif',
                  fontSize: '.76rem', color: '#374151', outline: 'none', width: '180px',
                }}
              />
            </div>
            <button style={{
              padding: '8px 16px', borderRadius: '9999px', border: '1px solid #e4e5e7',
              background: '#fff', fontSize: '.72rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span className="ms ms-sm">download</span> Exportar
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)', minWidth: '580px' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '3fr 1.2fr 1.2fr 1.2fr 1.2fr',
            padding: '12px 1.5rem', borderBottom: '1px solid #f0f1f2',
            fontSize: '.6rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9ca3af',
          }}>
            <span>Producto</span>
            <span style={{ textAlign: 'center' }}>Categoría</span>
            <span style={{ textAlign: 'center' }}>Cantidad</span>
            <span style={{ textAlign: 'center' }}>Precio/Unidad</span>
            <span style={{ textAlign: 'right'  }}>Estado</span>
          </div>

          {/* Rows */}
          {filtered.map(item => {
            const s = statusStyle[item.status]
            return (
              <div key={item.id} className="tld-tr" style={{
                display: 'grid', gridTemplateColumns: '3fr 1.2fr 1.2fr 1.2fr 1.2fr',
                padding: '1rem 1.5rem', borderBottom: '1px solid #f9fafb',
                alignItems: 'center', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: '#f3f4f5', flexShrink: 0 }}>
                    <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '.86rem', color: '#00193c' }}>{item.name}</p>
                    <p style={{ fontSize: '.64rem', color: '#9ca3af', letterSpacing: '.08em', textTransform: 'uppercase' }}>SKU: {item.sku}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', background: '#f3f4f5', fontSize: '.64rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#6b7280' }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '.88rem', color: item.status !== 'optimal' ? '#be123c' : '#00193c' }}>
                  {item.qty}
                </div>
                <div style={{ textAlign: 'center', fontSize: '.86rem', color: '#6b7280' }}>
                  ${item.price.toFixed(2)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '9999px', background: s.bg, fontSize: '.64rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: s.color }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                    {s.label}
                  </span>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              <span className="ms ms-xl">inventory_2</span>
              <p style={{ marginTop: '8px', fontSize: '.85rem' }}>Sin resultados</p>
            </div>
          )}
        </div>
        </div>
      </section>

      {/* ── SECONDARY CARDS ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-[1.5rem]">

        {/* Incoming Shipments */}
        <div style={{ background: '#f3f4f5', borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="tld-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00193c' }}>
            Entregas Entrantes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SHIPMENTS.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="ms" style={{ color: s.color }}>{s.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '.84rem', color: '#00193c' }}>{s.name}</p>
                    <p style={{ fontSize: '.7rem', color: '#9ca3af' }}>{s.note}</p>
                  </div>
                </div>
                <span style={{ fontSize: '.64rem', fontWeight: 700, color: s.badgeColor }}>{s.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Barcode scanner CTA */}
        <div style={{ background: '#f3f4f5', borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
            <span className="ms ms-lg" style={{ color: '#00193c' }}>barcode_scanner</span>
          </div>
          <div>
            <h3 className="tld-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00193c', marginBottom: '6px' }}>
              Escaneo Rápido
            </h3>
            <p style={{ fontSize: '.8rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Usa tu dispositivo móvil para actualizar niveles de stock al instante.
            </p>
          </div>
          <button style={{
            padding: '10px 28px', borderRadius: '9999px', border: '1px solid #e4e5e7',
            background: '#fff', color: '#00193c', fontSize: '.74rem', fontWeight: 700,
            letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            Activar Cámara
          </button>
        </div>
      </section>
    </div>
  )
}
