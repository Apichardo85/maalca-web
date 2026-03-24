'use client'

import { useState } from 'react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Todos', 'Entradas', 'Sopas', 'Platos Fuertes', 'Postres', 'Bebidas']

const MENU_ITEMS = [
  {
    id: 1, category: 'Platos Fuertes', name: 'Mofongo Relleno', price: 24.00,
    desc: 'Plátano verde majado con chicharrón, relleno con camarones al ajillo',
    available: true, featured: true, stock: 'high',
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
  },
  {
    id: 2, category: 'Platos Fuertes', name: 'Pernil Dominicano', price: 28.00,
    desc: 'Pierna de cerdo marinada 24h con sazón criollo, arroz blanco y habichuelas',
    available: true, featured: true, stock: 'low',
    img: 'https://images.unsplash.com/photo-1544025162-d76594e8cef1?w=400&q=80',
  },
  {
    id: 3, category: 'Platos Fuertes', name: 'Pescado Frito Entero', price: 32.00,
    desc: 'Snapper entero frito, tostones, ensalada y salsa criolla',
    available: true, featured: true, stock: 'medium',
    img: 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=400&q=80',
  },
  {
    id: 4, category: 'Platos Fuertes', name: 'Pollo Guisado', price: 22.00,
    desc: 'Pollo estofado con sofrito dominicano, arroz y habichuelas',
    available: true, featured: false, stock: 'high',
    img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80',
  },
  {
    id: 5, category: 'Entradas', name: 'Chicharrón de Pollo', price: 14.00,
    desc: 'Trozos de pollo fritos crujientes con salsa rosada y tostones',
    available: true, featured: false, stock: 'high',
    img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80',
  },
  {
    id: 6, category: 'Entradas', name: 'Yaniqueques', price: 8.00,
    desc: 'Crackers dominicanos fritos, crujientes, con mantequilla y queso',
    available: false, featured: false, stock: 'out',
    img: 'https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4?w=400&q=80',
  },
  {
    id: 7, category: 'Sopas', name: 'Sancocho Prieto', price: 18.00,
    desc: 'Guiso tradicional de siete carnes, maíz y raíces tropicales',
    available: true, featured: false, stock: 'medium',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
  },
  {
    id: 8, category: 'Postres', name: 'Tres Leches Dominicano', price: 9.00,
    desc: 'Bizcocho empapado en tres tipos de leche, canela y coco rallado',
    available: true, featured: false, stock: 'high',
    img: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&q=80',
  },
  {
    id: 9, category: 'Bebidas', name: 'Morir Soñando', price: 6.00,
    desc: 'Jugo de naranja con leche evaporada y azúcar, clásico dominicano',
    available: true, featured: false, stock: 'high',
    img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80',
  },
]

const INVENTORY_ALERTS = [
  { name: 'Plátanos verdes', unit: '12 lbs restantes', pct: 15, critical: true  },
  { name: 'Snapper fresco',  unit: '8 lbs restantes',  pct: 25, critical: true  },
  { name: 'Cerdo (pernil)',  unit: '22 lbs restantes', pct: 45, critical: false },
  { name: 'Arroz largo',     unit: '40 lbs restantes', pct: 60, critical: false },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuManagement() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')
  const [editingPrice, setEditingPrice] = useState<number | null>(null)
  const [prices, setPrices] = useState<Record<number, number>>(
    Object.fromEntries(MENU_ITEMS.map(i => [i.id, i.price]))
  )
  const [availability, setAvailability] = useState<Record<number, boolean>>(
    Object.fromEntries(MENU_ITEMS.map(i => [i.id, i.available]))
  )

  const filtered = MENU_ITEMS.filter(item => {
    if (activeCategory !== 'Todos' && item.category !== activeCategory) return false
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stockColor = (s: string) =>
    s === 'high' ? '#15803d' : s === 'medium' ? '#b45309' : s === 'low' ? '#be123c' : '#9ca3af'
  const stockLabel = (s: string) =>
    s === 'high' ? 'Disponible' : s === 'medium' ? 'Moderado' : s === 'low' ? 'Bajo' : 'Agotado'

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── EDITORIAL HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '6px' }}>
            Gestión de Carta
          </p>
          <h2 className="tld-serif" style={{ fontSize: '2.2rem', fontWeight: 400, fontStyle: 'italic', color: '#00193c', lineHeight: 1.1 }}>
            Auténtica Sazón<br />
            <span style={{ fontWeight: 700 }}>Dominicana</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            padding: '10px 18px', borderRadius: '9999px', border: '1px solid #e4e5e7',
            background: '#fff', fontSize: '.78rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="ms ms-sm">upload</span> Importar CSV
          </button>
          <button style={{
            padding: '10px 20px', borderRadius: '9999px', border: 'none',
            background: '#00193c', color: '#fff', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="ms ms-sm">add</span> Nuevo Plato
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '7px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
              fontSize: '.78rem', fontWeight: 600,
              background: activeCategory === cat ? '#00193c' : '#f3f4f5',
              color: activeCategory === cat ? '#fff' : '#6b7280',
              transition: 'background .15s, color .15s',
            }}>
              {cat}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <span className="ms ms-sm" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>search</span>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar plato..."
            style={{
              background: '#f3f4f5', border: 'none', borderRadius: '9999px',
              padding: '8px 16px 8px 34px', fontFamily: 'Manrope,sans-serif',
              fontSize: '.78rem', color: '#374151', outline: 'none', width: '220px',
            }}
          />
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Menu items grid */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {filtered.map(item => (
              <div key={item.id} style={{
                background: '#fff', borderRadius: '14px', overflow: 'hidden',
                boxShadow: '0 1px 6px rgba(0,0,0,.05)',
                opacity: availability[item.id] ? 1 : 0.6,
              }}>
                {/* Image */}
                <div style={{ position: 'relative', height: '140px', overflow: 'hidden', background: '#f3f4f5' }}>
                  <img
                    src={item.img} alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {item.featured && (
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      background: '#e12531', color: '#fff',
                      fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em',
                      padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase',
                    }}>
                      Destacado
                    </span>
                  )}
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: availability[item.id] ? 'rgba(34,197,94,.15)' : 'rgba(156,163,175,.15)',
                    borderRadius: '6px', padding: '3px 8px',
                    fontSize: '.6rem', fontWeight: 700, color: availability[item.id] ? '#15803d' : '#9ca3af',
                    backdropFilter: 'blur(8px)',
                  }}>
                    {availability[item.id] ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 700, fontSize: '.88rem', color: '#00193c', lineHeight: 1.3 }}>{item.name}</p>
                    <span style={{ fontSize: '.6rem', fontWeight: 600, color: stockColor(item.stock) }}>
                      ● {stockLabel(item.stock)}
                    </span>
                  </div>
                  <p style={{ fontSize: '.74rem', color: '#74777f', lineHeight: 1.4, marginBottom: '12px' }}>{item.desc}</p>

                  {/* Price + controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {editingPrice === item.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '.8rem', color: '#74777f' }}>$</span>
                        <input
                          type="number" step="0.01"
                          value={prices[item.id]}
                          onChange={e => setPrices(p => ({ ...p, [item.id]: parseFloat(e.target.value) || 0 }))}
                          onBlur={() => setEditingPrice(null)}
                          autoFocus
                          style={{
                            width: '70px', border: '1px solid #00193c', borderRadius: '6px',
                            padding: '4px 6px', fontFamily: 'Manrope,sans-serif',
                            fontSize: '.82rem', fontWeight: 700, color: '#00193c', outline: 'none',
                          }}
                        />
                      </div>
                    ) : (
                      <button onClick={() => setEditingPrice(item.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        <span className="tld-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00193c' }}>
                          ${prices[item.id].toFixed(2)}
                        </span>
                        <span className="ms ms-sm" style={{ color: '#9ca3af', fontSize: '14px' }}>edit</span>
                      </button>
                    )}

                    {/* Toggle availability */}
                    <button
                      onClick={() => setAvailability(a => ({ ...a, [item.id]: !a[item.id] }))}
                      style={{
                        padding: '5px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                        fontSize: '.7rem', fontWeight: 600,
                        background: availability[item.id] ? '#fecdd3' : '#bbf7d0',
                        color: availability[item.id] ? '#be123c' : '#15803d',
                      }}
                    >
                      {availability[item.id] ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <span className="ms ms-xl">search_off</span>
              <p style={{ marginTop: '8px', fontSize: '.85rem' }}>No se encontraron platos</p>
            </div>
          )}
        </div>

        {/* Right — Inventory alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Inventory sync */}
          <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f1f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#374151' }}>
                Inventario Crítico
              </p>
              <button style={{
                fontSize: '.68rem', fontWeight: 700, color: '#00193c',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <span className="ms ms-sm tld-spin" style={{ display: 'inline-block' }}>sync</span> Sincronizar
              </button>
            </div>

            <div style={{ padding: '8px' }}>
              {INVENTORY_ALERTS.map(item => (
                <div key={item.name} style={{ padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <p style={{ fontWeight: 600, fontSize: '.82rem', color: '#00193c' }}>{item.name}</p>
                    {item.critical && (
                      <span style={{ fontSize: '.6rem', fontWeight: 700, color: '#be123c', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span className="ms ms-sm">warning</span> Crítico
                      </span>
                    )}
                  </div>
                  <div style={{ background: '#f3f4f5', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '9999px',
                      background: item.pct < 30 ? '#e12531' : item.pct < 50 ? '#f59e0b' : '#22c55e',
                      width: `${item.pct}%`,
                    }} />
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '.68rem', color: '#9ca3af' }}>{item.unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Platos Activos', value: MENU_ITEMS.filter(i => i.available).length, icon: 'check_circle', color: '#15803d' },
              { label: 'Inactivos',      value: MENU_ITEMS.filter(i => !i.available).length, icon: 'cancel',       color: '#be123c' },
              { label: 'Destacados',     value: MENU_ITEMS.filter(i => i.featured).length,   icon: 'star',         color: '#b45309' },
              { label: 'Total Platos',   value: MENU_ITEMS.length,                            icon: 'restaurant_menu', color: '#00193c' },
            ].map(s => (
              <div key={s.label} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '10px', textAlign: 'center', border: '1px solid #f0f1f2' }}>
                <span className="ms ms-fill" style={{ color: s.color, fontSize: '22px' }}>{s.icon}</span>
                <p className="tld-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00193c', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '.64rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: '2px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
