'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import type { MenuItem } from '../_data'
import { MENU_CATEGORIES } from '../_data'
import { getAffiliateConfig } from '@/config/affiliates-config'
import {
  isItemAvailable,
  nextAvailabilityLabel,
  currentPeriodEndLabel,
  getCurrentPeriod,
  MEAL_PERIOD_LABELS,
} from '@/lib/menu-availability'
import { UnavailableItemModal } from '@/components/menu/UnavailableItemModal'
import type { MenuCatalogItem } from '@/lib/types'
import { useTldI18n } from '../tld-i18n'

// ─── Cart types ──────────────────────────────────────────────────────────────
interface CartItem { dish: MenuItem; qty: number }

// ─── Props ───────────────────────────────────────────────────────────────────
interface MenuPageClientProps {
  dishes: MenuItem[]
}

// ─── Config helpers ──────────────────────────────────────────────────────────
const TLD_CONFIG = getAffiliateConfig('the-little-dominican')
const TLD_HOURS = TLD_CONFIG?.mealPeriodHours

/** Convierte MenuItem → MenuCatalogItem para usar con los helpers puros. */
function toCatalog(d: MenuItem): MenuCatalogItem {
  return {
    kind: 'menu',
    id: d.id,
    name: d.name,
    description: d.description,
    price: d.price,
    image: d.image,
    category: d.category,
    available: d.available,
    popular: d.popular,
    flags: d.flags,
    periods: d.periods,
  }
}

// ─── Fallback image placeholder ──────────────────────────────────────────────
const FALLBACK_IMG = 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="#e4e5e7"><rect width="600" height="400"/><text x="300" y="210" text-anchor="middle" fill="#74777f" font-family="sans-serif" font-size="18">Imagen no disponible</text></svg>`)

// ─── Toast Component ─────────────────────────────────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', bottom: '5.5rem', left: '50%', transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
        zIndex: 300, background: 'var(--p)', color: '#fff',
        padding: '12px 24px', borderRadius: '9999px',
        fontFamily: 'Manrope,sans-serif', fontSize: '.85rem', fontWeight: 600,
        boxShadow: '0 12px 32px rgba(0,25,60,.3)',
        opacity: visible ? 1 : 0,
        transition: 'opacity .25s, transform .25s',
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  )
}

// ─── Client Component ────────────────────────────────────────────────────────
export default function MenuPageClient({ dishes }: MenuPageClientProps) {
  const { t } = useTldI18n()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [dietFilters, setDietFilters] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', visible: false })
  const [showFilters, setShowFilters] = useState(false)

  // Modal "avísame cuando abra"
  const [unavailableDish, setUnavailableDish] = useState<MenuItem | null>(null)

  // "Ahora sirviendo" chip — refresh cada minuto
  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const currentPeriod = getCurrentPeriod(TLD_HOURS, now)
  const periodEnd = currentPeriodEndLabel(TLD_HOURS, now)

  const categories = ['Todos', 'Popular', ...MENU_CATEGORIES]

  const toggleDiet = (f: string) => {
    setDietFilters(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  const filtered = useMemo(() => {
    return dishes.filter(d => {
      // `available: false` explícito sigue ocultando (admin disabled)
      if (!d.available) return false
      if (activeCategory === 'Popular' && !d.popular) return false
      if (activeCategory !== 'Todos' && activeCategory !== 'Popular' && d.category !== activeCategory) return false
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
          !d.description.toLowerCase().includes(search.toLowerCase())) return false
      if (dietFilters.has('vegetarian') && !d.flags.vegetarian) return false
      if (dietFilters.has('glutenFree') && !d.flags.glutenFree) return false
      if (dietFilters.has('spicy') && !d.flags.spicy) return false
      return true
    })
  }, [dishes, activeCategory, search, dietFilters])

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000)
  }, [])

  const addToCart = (dish: MenuItem) => {
    // Si no está disponible por periodo, abrir modal en lugar de agregar
    if (!isItemAvailable(toCatalog(dish), TLD_HOURS, now)) {
      setUnavailableDish(dish)
      return
    }
    setCart(prev => {
      const existing = prev.find(i => i.dish.id === dish.id)
      return existing
        ? prev.map(i => i.dish.id === dish.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { dish, qty: 1 }]
    })
    showToast(`${dish.name} agregado`)
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

  // Build WhatsApp message
  const buildWhatsAppUrl = () => {
    const phone = '16078574226'
    const lines = cart.map(i => `• ${i.qty}x ${i.dish.name} — $${(i.dish.price * i.qty).toFixed(2)}`)
    const msg = [
      '🍽 *Nueva Orden — The Little Dominican*',
      '',
      ...lines,
      '',
      `Subtotal: $${cartTotal.toFixed(2)}`,
      `Tax (8.875%): $${tax.toFixed(2)}`,
      `*Total: $${totalWithTax.toFixed(2)}*`,
      '',
      'Nombre: ',
      'Pickup / Delivery: ',
    ].join('\n')
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  // Send order to n8n (fire-and-forget alongside WhatsApp)
  const sendOrderToN8n = () => {
    fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'the-little-dominican',
        items: cart.map(i => ({
          id: i.dish.id,
          name: i.dish.name,
          quantity: i.qty,
          unitPrice: i.dish.price,
          subtotal: i.dish.price * i.qty,
        })),
        subtotal: cartTotal,
        tax,
        total: totalWithTax,
        whatsappNumber: '16078574226',
      }),
    }).catch(() => { /* non-blocking */ })
  }

  // Close cart on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setCartOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* ── SEARCH HERO (compact) ──────────────────────────────────── */}
      <section style={{ background: 'var(--hero-bg)', padding: 'clamp(2rem,4vw,3.5rem) clamp(1.5rem,5vw,5rem)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Newsreader,Georgia,serif', fontSize: 'clamp(1.8rem,4.5vw,2.8rem)', fontWeight: 300, color: '#fff', lineHeight: 1.1, marginBottom: '.6rem' }}>
            {t.menuHeroTitle}
          </div>
          <p style={{ fontSize: '.85rem', fontWeight: 300, color: 'rgba(255,255,255,.7)', marginBottom: '1rem' }}>
            {t.menuHeroSubtitle}
          </p>

          {/* Period chip */}
          {TLD_HOURS && currentPeriod !== 'all_day' && periodEnd && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '9999px',
              background: 'rgba(255,255,255,.18)', color: '#fff',
              fontSize: '.78rem', fontWeight: 600,
              marginBottom: '1.25rem', backdropFilter: 'blur(6px)',
            }}>
              <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%' }} />
              Ahora sirviendo {MEAL_PERIOD_LABELS[currentPeriod].toLowerCase()} · hasta las {periodEnd}
            </div>
          )}

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,.4)', pointerEvents: 'none' }}>
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar platos..."
              style={{
                width: '100%', boxSizing: 'border-box',
                // Input sits sobre el hero navy estable → tokens estables también,
                // si no --tx se invertiría a blanco y quedaría blanco-sobre-blanco.
                background: 'var(--input-bg)', border: 'none', borderRadius: '9999px',
                padding: '14px 20px 14px 46px',
                fontFamily: 'Manrope,sans-serif', fontSize: '.9rem', color: 'var(--input-text)',
                outline: 'none', boxShadow: '0 8px 32px rgba(0,0,0,.15)',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── FILTER BAR (sticky) ──────────────── */}
      <div style={{
        position: 'sticky', top: '60px', zIndex: 50,
        background: 'color-mix(in srgb, var(--bg) 95%, transparent)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--l3)',
        padding: '.625rem clamp(1rem,3vw,5rem)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', gap: '6px', alignItems: 'center',
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            paddingBottom: '2px',
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '10px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                  fontFamily: 'Manrope,sans-serif', fontSize: '.8rem', fontWeight: 600,
                  transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
                  minHeight: '40px',
                  // Pill activo = CTA estable; inactivo usa tokens que sí invierten.
                  background: activeCategory === cat ? 'var(--cta-bg)' : 'var(--l2)',
                  color: activeCategory === cat ? 'var(--cta-text)' : 'var(--tm)',
                }}
              >
                {cat === 'Popular' ? '🔥 Popular' : cat}
              </button>
            ))}
            <div style={{ width: '1px', height: '24px', background: 'var(--l3)', flexShrink: 0 }} />
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '10px 14px', borderRadius: '9999px', cursor: 'pointer',
                fontFamily: 'Manrope,sans-serif', fontSize: '.78rem', fontWeight: 500,
                flexShrink: 0, minHeight: '40px', whiteSpace: 'nowrap',
                background: showFilters || dietFilters.size > 0 ? 'var(--t)' : 'transparent',
                color: showFilters || dietFilters.size > 0 ? '#fff' : 'var(--tl)',
                border: showFilters || dietFilters.size > 0 ? '1.5px solid var(--t)' : '1.5px solid var(--l3)',
                transition: 'all .15s',
              }}
            >
              <FilterIcon /> Filtros{dietFilters.size > 0 ? ` (${dietFilters.size})` : ''}
            </button>
            <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--tl)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {filtered.length} platos
            </span>
          </div>

          {showFilters && (
            <div style={{
              display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '.5rem',
              borderTop: '1px solid var(--l3)', marginTop: '.5rem',
            }}>
              {[
                { key: 'vegetarian', label: '🌿 Vegetariano' },
                { key: 'glutenFree', label: '🌾 Sin Gluten' },
                { key: 'spicy', label: '🌶 Picante' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => toggleDiet(f.key)}
                  style={{
                    padding: '10px 14px', borderRadius: '9999px', cursor: 'pointer',
                    fontFamily: 'Manrope,sans-serif', fontSize: '.78rem', fontWeight: 500,
                    transition: 'all .15s', minHeight: '40px',
                    background: dietFilters.has(f.key) ? 'var(--t)' : 'transparent',
                    color: dietFilters.has(f.key) ? '#fff' : 'var(--tl)',
                    border: dietFilters.has(f.key) ? '1.5px solid var(--t)' : '1.5px solid var(--l3)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        ${cartOpen ? '.tld-bottom-nav { display: none !important; }' : ''}
      `}</style>

      {/* ── DISH GRID ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(2rem,4vw,3.5rem) clamp(1.5rem,5vw,5rem)', minHeight: '50vh' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--tl)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽</div>
              <p style={{ fontFamily: 'Newsreader,Georgia,serif', fontSize: '1.2rem', color: 'var(--p)' }}>
                No encontramos ese plato
              </p>
              <p className="tld-body" style={{ marginTop: '.5rem' }}>Prueba con otra búsqueda o categoría</p>
            </div>
          ) : (
            activeCategory === 'Todos' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {MENU_CATEGORIES.map(cat => {
                  const catDishes = filtered.filter(d => d.category === cat)
                  if (!catDishes.length) return null
                  return (
                    <div key={cat}>
                      <div style={{
                        fontFamily: 'Newsreader,Georgia,serif',
                        fontSize: '1.1rem', fontWeight: 400, color: 'var(--p)',
                        marginBottom: '1rem', paddingBottom: '.5rem',
                        borderBottom: '1px solid var(--l3)',
                      }}>
                        {cat}
                      </div>
                      <DishGrid
                        dishes={catDishes}
                        cart={cart}
                        onAdd={addToCart}
                        onRemove={removeFromCart}
                        onUnavailable={setUnavailableDish}
                        now={now}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <DishGrid
                dishes={filtered}
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onUnavailable={setUnavailableDish}
                now={now}
              />
            )
          )}
        </div>
      </section>

      <Toast message={toast.message} visible={toast.visible} />

      {/* Floating cart button */}
      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          aria-label={`Ver orden: ${cartCount} platos`}
          style={{
            position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)', right: '1.25rem', zIndex: 90,
            background: 'var(--cta-bg)', color: 'var(--cta-text)', border: 'none',
            borderRadius: '9999px', padding: '14px 22px',
            fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '.88rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 16px 40px rgba(0,25,60,.3)',
            transition: 'transform .15s',
            minHeight: '48px',
          }}
        >
          <CartIcon />
          Ver orden
          <span style={{
            background: 'var(--s)', borderRadius: '9999px',
            padding: '2px 9px', fontSize: '.78rem', fontWeight: 700,
          }}>
            {cartCount}
          </span>
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setCartOpen(false)}
        >
          <div
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0,
              width: 'min(420px, 95vw)',
              background: 'var(--bg)', boxShadow: '-20px 0 60px rgba(0,0,0,.15)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--l3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="tld-label">Mi orden</div>
                <div style={{ fontFamily: 'Newsreader,Georgia,serif', fontSize: '1.2rem', color: 'var(--p)', marginTop: '2px' }}>
                  {cartCount} {cartCount === 1 ? 'plato' : 'platos'}
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Cerrar"
                style={{
                  background: 'var(--l2)', border: 'none', borderRadius: '50%',
                  width: '44px', height: '44px', cursor: 'pointer',
                  fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {cart.map(item => (
                <div key={item.dish.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 0', borderBottom: '1px solid var(--l3)',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.dish.image}
                    alt={item.dish.name}
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
                    style={{ width: '52px', height: '52px', borderRadius: '.5rem', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--p)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.dish.name}
                    </div>
                    <div style={{ fontFamily: 'Newsreader,Georgia,serif', fontSize: '.95rem', color: 'var(--tm)', marginTop: '2px' }}>
                      ${(item.dish.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => removeFromCart(item.dish.id)}
                      aria-label={`Quitar ${item.dish.name}`}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                        background: 'var(--l2)', cursor: 'pointer',
                        fontWeight: 700, fontSize: '1rem', color: 'var(--p)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >−</button>
                    <span style={{ fontWeight: 600, fontSize: '.9rem', minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                    <button
                      onClick={() => addToCart(item.dish)}
                      aria-label={`Agregar ${item.dish.name}`}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                        background: 'var(--cta-bg)', cursor: 'pointer',
                        fontWeight: 700, fontSize: '1rem', color: 'var(--cta-text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.25rem 1.5rem calc(1.25rem + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid var(--l3)', background: 'var(--l1)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                  <span style={{ color: 'var(--tm)' }}>Subtotal</span>
                  <span style={{ color: 'var(--p)', fontWeight: 500 }}>${cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem' }}>
                  <span style={{ color: 'var(--tl)' }}>Tax NY (8.875%)</span>
                  <span style={{ color: 'var(--tl)' }}>${tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.95rem', paddingTop: '6px', borderTop: '1px solid var(--l3)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--p)' }}>Total</span>
                  <span style={{ fontFamily: 'Newsreader,Georgia,serif', fontSize: '1.2rem', fontWeight: 400, color: 'var(--p)' }}>
                    ${totalWithTax.toFixed(2)}
                  </span>
                </div>
              </div>

              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sendOrderToN8n()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', background: '#25D366', color: '#fff', border: 'none',
                  borderRadius: '9999px', padding: '14px', cursor: 'pointer',
                  fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '.9rem',
                  textDecoration: 'none', minHeight: '48px',
                }}
              >
                <WhatsAppIcon /> Confirmar por WhatsApp
              </a>
              <p style={{ textAlign: 'center', fontSize: '.73rem', color: 'var(--tl)', marginTop: '.75rem' }}>
                O llama al{' '}
                <a href="tel:6078574226" style={{ color: 'var(--p)', fontWeight: 600, textDecoration: 'none' }}>
                  (607) 857-4226
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal "avísame cuando abra" */}
      <UnavailableItemModal
        open={unavailableDish !== null}
        onClose={() => setUnavailableDish(null)}
        itemName={unavailableDish?.name ?? ''}
        availabilityLabel={
          unavailableDish
            ? nextAvailabilityLabel(toCatalog(unavailableDish), TLD_HOURS, now)
            : null
        }
        affiliateId="the-little-dominican"
        itemId={unavailableDish?.id ?? ''}
      />
    </>
  )
}

// ─── Dish grid sub-component ─────────────────────────────────────────────────
function DishGrid({ dishes, cart, onAdd, onRemove, onUnavailable, now }: {
  dishes: MenuItem[]
  cart: CartItem[]
  onAdd: (d: MenuItem) => void
  onRemove: (id: string) => void
  onUnavailable: (d: MenuItem) => void
  now: Date
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))',
      gap: '1rem',
    }}>
      {dishes.map(dish => {
        const cartItem = cart.find(i => i.dish.id === dish.id)
        const catalog = toCatalog(dish)
        const available = isItemAvailable(catalog, TLD_HOURS, now)
        const nextLabel = available ? null : nextAvailabilityLabel(catalog, TLD_HOURS, now)

        return (
          <div key={dish.id} style={{
            background: 'var(--l1)', borderRadius: '.875rem', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            transition: 'box-shadow .2s',
            opacity: available ? 1 : 0.62,
          }}>
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--l3)', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dish.image}
                alt={dish.name}
                loading="lazy"
                onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  transition: 'transform .5s ease',
                  filter: available ? 'none' : 'grayscale(0.4)',
                }}
              />
              {dish.popular && available && (
                <span style={{
                  position: 'absolute', top: '10px', left: '10px',
                  background: 'var(--s)', color: '#fff',
                  padding: '4px 10px', borderRadius: '9999px',
                  fontSize: '.65rem', fontWeight: 700, letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 12px rgba(225,37,49,.3)',
                }}>
                  🔥 Popular
                </span>
              )}
              {!available && nextLabel && (
                <span style={{
                  position: 'absolute', top: '10px', left: '10px', right: '10px',
                  background: 'rgba(17,24,39,.92)', color: '#fff',
                  padding: '6px 10px', borderRadius: '8px',
                  fontSize: '.68rem', fontWeight: 600, textAlign: 'center',
                }}>
                  🕑 {nextLabel}
                </span>
              )}
            </div>

            <div style={{ padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ fontFamily: 'Newsreader,Georgia,serif', fontSize: '1rem', fontWeight: 400, color: 'var(--p)', lineHeight: 1.2 }}>
                  {dish.name}
                </span>
                <span style={{ fontFamily: 'Newsreader,Georgia,serif', fontSize: '1.05rem', fontWeight: 500, color: 'var(--s)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  ${dish.price % 1 === 0 ? dish.price : dish.price.toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: '.78rem', fontWeight: 300, lineHeight: 1.55, color: 'var(--tm)', flex: 1 }}>
                {dish.description}
              </p>

              {(dish.flags.vegetarian || dish.flags.glutenFree || dish.flags.spicy) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {dish.flags.vegetarian && <span style={{ padding: '2px 8px', background: '#dcfce7', color: '#166534', fontSize: '.6rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: '9999px' }}>Vegetariano</span>}
                  {dish.flags.glutenFree && <span style={{ padding: '2px 8px', background: '#e0f2fe', color: '#0c4a6e', fontSize: '.6rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: '9999px' }}>Sin Gluten</span>}
                  {dish.flags.spicy && <span style={{ padding: '2px 8px', background: '#ffe8d6', color: '#7c2d12', fontSize: '.6rem', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: '9999px' }}>Picante</span>}
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                {!available ? (
                  <button
                    onClick={() => onUnavailable(dish)}
                    style={{
                      width: '100%', background: 'transparent', color: 'var(--p)',
                      border: '1.5px solid var(--p)',
                      borderRadius: '9999px', padding: '12px 16px', cursor: 'pointer',
                      fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '.8rem',
                      minHeight: '44px',
                    }}
                  >
                    🔔 Avísame cuando abra
                  </button>
                ) : cartItem ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '.78rem', color: 'var(--tl)' }}>
                      ${(dish.price * cartItem.qty).toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => onRemove(dish.id)}
                        aria-label={`Quitar ${dish.name}`}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                          background: 'var(--l3)', cursor: 'pointer',
                          fontWeight: 700, fontSize: '1rem', color: 'var(--p)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >−</button>
                      <span style={{ fontWeight: 600, fontSize: '.9rem', minWidth: '18px', textAlign: 'center' }}>{cartItem.qty}</span>
                      <button
                        onClick={() => onAdd(dish)}
                        aria-label={`Agregar ${dish.name}`}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                          background: 'var(--cta-bg)', cursor: 'pointer',
                          fontWeight: 700, fontSize: '1rem', color: 'var(--cta-text)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >+</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onAdd(dish)}
                    style={{
                      width: '100%', background: 'var(--cta-bg)', color: 'var(--cta-text)', border: 'none',
                      borderRadius: '9999px', padding: '12px 16px', cursor: 'pointer',
                      fontFamily: 'Manrope,sans-serif', fontWeight: 600, fontSize: '.82rem',
                      transition: 'opacity .15s', minHeight: '44px',
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

function FilterIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
