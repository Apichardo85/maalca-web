'use client'

import { useState, useMemo } from 'react'
import type { MenuItem } from '../_data'
import { MENU_CATEGORIES } from '../_data'

// ─── Cart types ──────────────────────────────────────────────────────────────

interface CartItem { dish: MenuItem; qty: number }

// ─── Props ───────────────────────────────────────────────────────────────────

interface MenuPageClientProps {
  dishes: MenuItem[]
}

// ─── Client Component ────────────────────────────────────────────────────────

export default function MenuPageClient({ dishes }: MenuPageClientProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [dietFilters, setDietFilters] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const categories = ['Todos', ...MENU_CATEGORIES]

  const toggleDiet = (f: string) => {
    setDietFilters(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  const filtered = useMemo(() => {
    return dishes.filter(d => {
      if (!d.available) return false
      if (activeCategory !== 'Todos' && d.category !== activeCategory) return false
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
          !d.description.toLowerCase().includes(search.toLowerCase())) return false
      if (dietFilters.has('vegetarian') && !d.flags.vegetarian) return false
      if (dietFilters.has('glutenFree') && !d.flags.glutenFree) return false
      if (dietFilters.has('spicy') && !d.flags.spicy) return false
      return true
    })
  }, [dishes, activeCategory, search, dietFilters])

  const addToCart = (dish: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id)
      return existing
        ? prev.map(i => i.dish.id === dish.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { dish, qty: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const item = prev.find(i => i.dish.id === id)
      if (!item) return prev
      if (item.qty === 1) return prev.filter(i => i.dish.id !== id)
      return prev.map(i => i.dish.id === id ? { ...i, qty: i.qty - 1 } : i)
    })
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.dish.price * i.qty, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)
  const tax = cartTotal * 0.08875
  const totalWithTax = cartTotal + tax

  return (
    <>
      {/* ── SEARCH HERO ──────────────────────────────────────────── */}
      <section style={{ background:'var(--p)', padding:'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,5rem)' }}>
        <div style={{ maxWidth:'760px', margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:300, color:'#fff', lineHeight:1.1, marginBottom:'1rem' }}>
            Nuestro Menú
          </div>
          <p style={{ fontSize:'.9rem', fontWeight:300, color:'rgba(255,255,255,.7)', marginBottom:'2rem' }}>
            Cocina dominicana auténtica — Elmira, NY
          </p>

          {/* Search bar */}
          <div style={{ position:'relative', maxWidth:'520px', margin:'0 auto' }}>
            <span style={{ position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)', color:'rgba(0,0,0,.4)', pointerEvents:'none' }}>
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar platos..."
              style={{
                width:'100%', boxSizing:'border-box',
                background:'#fff', border:'none', borderRadius:'9999px',
                padding:'14px 20px 14px 46px',
                fontFamily:'Manrope,sans-serif', fontSize:'.9rem', color:'var(--tx)',
                outline:'none', boxShadow:'0 8px 32px rgba(0,0,0,.15)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── FILTER BAR (sticky) ───────────────────────────────────── */}
      <div style={{
        position:'sticky', top:'60px', zIndex:50,
        background:'rgba(248,249,250,.95)', backdropFilter:'blur(16px)',
        borderBottom:'1px solid var(--l3)',
        padding:'.875rem clamp(1.5rem,5vw,5rem)',
      }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto', display:'flex', flexWrap:'wrap', gap:'.75rem', alignItems:'center' }}>

          {/* Category pills */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding:'6px 14px', borderRadius:'9999px', border:'none', cursor:'pointer',
                  fontFamily:'Manrope,sans-serif', fontSize:'.78rem', fontWeight:600,
                  transition:'all .15s',
                  background: activeCategory === cat ? 'var(--p)' : 'var(--l2)',
                  color: activeCategory === cat ? '#fff' : 'var(--tm)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div style={{ width:'1px', height:'24px', background:'var(--l3)' }} />

          {/* Dietary filters */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {[
              { key:'vegetarian', label:'🌿 Vegetariano' },
              { key:'glutenFree', label:'🌾 Sin Gluten' },
              { key:'spicy',      label:'🌶 Picante' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => toggleDiet(f.key)}
                style={{
                  padding:'6px 13px', borderRadius:'9999px', cursor:'pointer',
                  fontFamily:'Manrope,sans-serif', fontSize:'.76rem', fontWeight:500,
                  transition:'all .15s',
                  background: dietFilters.has(f.key) ? 'var(--t)' : 'transparent',
                  color: dietFilters.has(f.key) ? '#fff' : 'var(--tl)',
                  border: dietFilters.has(f.key) ? '1.5px solid var(--t)' : '1.5px solid var(--l3)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          <span style={{ marginLeft:'auto', fontSize:'.75rem', color:'var(--tl)', fontWeight:500, whiteSpace:'nowrap' }}>
            {filtered.length} platos
          </span>
        </div>
      </div>

      {/* ── DISH GRID ─────────────────────────────────────────────── */}
      <section style={{ background:'var(--bg)', padding:'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,5rem)', minHeight:'50vh' }}>
        <div style={{ maxWidth:'1280px', margin:'0 auto' }}>

          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem 0', color:'var(--tl)' }}>
              <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>🍽</div>
              <p style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.2rem', color:'var(--p)' }}>
                No encontramos ese plato
              </p>
              <p className="tld-body" style={{ marginTop:'.5rem' }}>Prueba con otra búsqueda o categoría</p>
            </div>
          ) : (
            /* Group by category when showing all */
            activeCategory === 'Todos' ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'3rem' }}>
                {MENU_CATEGORIES.map(cat => {
                  const catDishes = filtered.filter(d => d.category === cat)
                  if (!catDishes.length) return null
                  return (
                    <div key={cat}>
                      <div style={{
                        fontFamily:'Newsreader,Georgia,serif',
                        fontSize:'1.1rem', fontWeight:400, color:'var(--p)',
                        marginBottom:'1.1rem', paddingBottom:'.5rem',
                        borderBottom:'1px solid var(--l3)',
                      }}>
                        {cat}
                      </div>
                      <DishGrid dishes={catDishes} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <DishGrid dishes={filtered} cart={cart} onAdd={addToCart} onRemove={removeFromCart} />
            )
          )}
        </div>
      </section>

      {/* ── CART BUTTON (floating) ────────────────────────────────── */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          style={{
            position:'fixed', bottom:'2rem', right:'2rem', zIndex:90,
            background:'var(--p)', color:'#fff', border:'none',
            borderRadius:'9999px', padding:'14px 24px',
            fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.9rem',
            cursor:'pointer', display:'flex', alignItems:'center', gap:'10px',
            boxShadow:'0 16px 40px rgba(0,25,60,.3)',
            transition:'transform .15s',
          }}
        >
          <CartIcon />
          Ver orden
          <span style={{
            background:'var(--s)', borderRadius:'9999px',
            padding:'2px 8px', fontSize:'.78rem', fontWeight:700,
          }}>
            {cartCount}
          </span>
        </button>
      )}

      {/* ── CART DRAWER ───────────────────────────────────────────── */}
      {cartOpen && (
        <div
          style={{
            position:'fixed', inset:0, zIndex:200,
            background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)',
          }}
          onClick={() => setCartOpen(false)}
        >
          <div
            style={{
              position:'absolute', right:0, top:0, bottom:0,
              width:'min(420px, 95vw)',
              background:'var(--bg)', boxShadow:'-20px 0 60px rgba(0,0,0,.15)',
              display:'flex', flexDirection:'column', overflow:'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--l3)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div className="tld-label">Mi orden</div>
                <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.2rem', color:'var(--p)', marginTop:'2px' }}>
                  {cartCount} {cartCount === 1 ? 'plato' : 'platos'}
                </div>
              </div>
              <button onClick={() => setCartOpen(false)} style={{
                background:'var(--l2)', border:'none', borderRadius:'50%',
                width:'36px', height:'36px', cursor:'pointer',
                fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center',
              }}>×</button>
            </div>

            {/* Cart items */}
            <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.5rem' }}>
              {cart.map(item => (
                <div key={item.dish.id} style={{
                  display:'flex', alignItems:'center', gap:'12px',
                  padding:'12px 0', borderBottom:'1px solid var(--l3)',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.dish.image}
                    alt={item.dish.name}
                    style={{ width:'52px', height:'52px', borderRadius:'.5rem', objectFit:'cover', flexShrink:0 }}
                  />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'.85rem', color:'var(--p)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.dish.name}
                    </div>
                    <div style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'.95rem', color:'var(--tm)', marginTop:'2px' }}>
                      ${(item.dish.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                    <button onClick={() => removeFromCart(item.dish.id)} style={{
                      width:'28px', height:'28px', borderRadius:'50%', border:'none',
                      background:'var(--l2)', cursor:'pointer', fontWeight:700, fontSize:'.9rem',
                      display:'flex', alignItems:'center', justifyContent:'center', color:'var(--p)',
                    }}>−</button>
                    <span style={{ fontWeight:600, fontSize:'.88rem', minWidth:'16px', textAlign:'center' }}>{item.qty}</span>
                    <button onClick={() => addToCart(item.dish)} style={{
                      width:'28px', height:'28px', borderRadius:'50%', border:'none',
                      background:'var(--p)', cursor:'pointer', fontWeight:700, fontSize:'.9rem',
                      display:'flex', alignItems:'center', justifyContent:'center', color:'#fff',
                    }}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals + CTA */}
            <div style={{ padding:'1.25rem 1.5rem', borderTop:'1px solid var(--l3)', background:'var(--l1)' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem' }}>
                  <span style={{ color:'var(--tm)' }}>Subtotal</span>
                  <span style={{ color:'var(--p)', fontWeight:500 }}>${cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                  <span style={{ color:'var(--tl)' }}>Tax NY (8.875%)</span>
                  <span style={{ color:'var(--tl)' }}>${tax.toFixed(2)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.95rem', paddingTop:'6px', borderTop:'1px solid var(--l3)' }}>
                  <span style={{ fontWeight:700, color:'var(--p)' }}>Total</span>
                  <span style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1.2rem', fontWeight:400, color:'var(--p)' }}>
                    ${totalWithTax.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                style={{
                  width:'100%', background:'var(--p)', color:'#fff', border:'none',
                  borderRadius:'9999px', padding:'14px', cursor:'pointer',
                  fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.9rem',
                }}
              >
                Confirmar Orden →
              </button>
              <p style={{ textAlign:'center', fontSize:'.73rem', color:'var(--tl)', marginTop:'.75rem' }}>
                O llama al{' '}
                <a href="tel:6072150990" style={{ color:'var(--p)', fontWeight:600, textDecoration:'none' }}>
                  (607) 215-0990
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Dish grid sub-component ─────────────────────────────────────────────────

function DishGrid({ dishes, cart, onAdd, onRemove }: {
  dishes: MenuItem[]
  cart: CartItem[]
  onAdd: (d: MenuItem) => void
  onRemove: (id: string) => void
}) {
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',
      gap:'1rem',
    }}>
      {dishes.map(dish => {
        const cartItem = cart.find(i => i.dish.id === dish.id)
        return (
          <div key={dish.id} style={{
            background:'var(--l1)', borderRadius:'.875rem', overflow:'hidden',
            display:'flex', flexDirection:'column',
            transition:'box-shadow .2s',
          }}>
            {/* Photo */}
            <div style={{ aspectRatio:'4/3', overflow:'hidden', background:'var(--l3)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dish.image}
                alt={dish.name}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform .5s ease' }}
              />
            </div>

            {/* Body */}
            <div style={{ padding:'1rem 1.1rem', display:'flex', flexDirection:'column', gap:'.5rem', flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'6px' }}>
                <span style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1rem', fontWeight:400, color:'var(--p)', lineHeight:1.2 }}>
                  {dish.name}
                </span>
                <span style={{ fontFamily:'Newsreader,Georgia,serif', fontSize:'1rem', fontWeight:400, color:'var(--p)', whiteSpace:'nowrap', flexShrink:0 }}>
                  ${dish.price % 1 === 0 ? dish.price : dish.price.toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize:'.78rem', fontWeight:300, lineHeight:1.55, color:'var(--tm)', flex:1 }}>
                {dish.description}
              </p>

              {/* Chips */}
              {(dish.flags.vegetarian || dish.flags.glutenFree || dish.flags.spicy) && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                  {dish.flags.vegetarian && <span style={{ padding:'2px 8px', background:'#dcfce7', color:'#166534', fontSize:'.6rem', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', borderRadius:'9999px' }}>Vegetariano</span>}
                  {dish.flags.glutenFree  && <span style={{ padding:'2px 8px', background:'#e0f2fe', color:'#0c4a6e', fontSize:'.6rem', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', borderRadius:'9999px' }}>Sin Gluten</span>}
                  {dish.flags.spicy       && <span style={{ padding:'2px 8px', background:'#ffe8d6', color:'#7c2d12', fontSize:'.6rem', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', borderRadius:'9999px' }}>Picante</span>}
                </div>
              )}

              {/* Cart controls */}
              <div style={{ marginTop:'auto', paddingTop:'8px' }}>
                {cartItem ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'.78rem', color:'var(--tl)' }}>
                      ${(dish.price * cartItem.qty).toFixed(2)}
                    </span>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <button
                        onClick={() => onRemove(dish.id)}
                        style={{
                          width:'30px', height:'30px', borderRadius:'50%', border:'none',
                          background:'var(--l3)', cursor:'pointer',
                          fontWeight:700, fontSize:'1rem', color:'var(--p)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}
                      >−</button>
                      <span style={{ fontWeight:600, fontSize:'.9rem', minWidth:'18px', textAlign:'center' }}>{cartItem.qty}</span>
                      <button
                        onClick={() => onAdd(dish)}
                        style={{
                          width:'30px', height:'30px', borderRadius:'50%', border:'none',
                          background:'var(--p)', cursor:'pointer',
                          fontWeight:700, fontSize:'1rem', color:'#fff',
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}
                      >+</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onAdd(dish)}
                    style={{
                      width:'100%', background:'var(--p)', color:'#fff', border:'none',
                      borderRadius:'9999px', padding:'9px 16px', cursor:'pointer',
                      fontFamily:'Manrope,sans-serif', fontWeight:600, fontSize:'.78rem',
                      transition:'opacity .15s',
                    }}
                  >
                    + Agregar
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
