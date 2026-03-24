'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ─── Brand ───────────────────────────────────────────────────────────────────

const BRAND = {
  blue:     '#0038A8', // Azul Bandera Dominicana
  red:      '#CE1126', // Rojo Bandera Dominicana
  gold:     '#D4AF37', // Dorado
  wood:     '#1A0F0A', // Madera oscura (base)
  woodMid:  '#2C1810', // Madera media (cards)
  woodWarm: '#3D2214', // Madera cálida (hover)
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuItem {
  name: string
  description: string
  price: number
  image: string
  category: string
  popular?: boolean
  flags?: { vegetarian?: boolean; glutenFree?: boolean }
}

interface CartItem extends MenuItem {
  cartId: number
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MENU_CATEGORIES = ['Todo', 'Picadera', 'Fritura', 'Carnes', 'Mariscos', 'Appetizers', 'Sides']

const MOCK_DISHES: MenuItem[] = [
  { name: 'Yaroa de Pollo',        price: 12,   category: 'Picadera',   popular: true,
    description: 'Pollo desmenuzado con papas o plátano y queso fundido.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=380&fit=crop&q=80',
    flags: {} },
  { name: 'Pica Pollo',            price: 14,   category: 'Fritura',    popular: true,
    description: 'Pollo frito al estilo dominicano, crujiente y sazonado.',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&h=380&fit=crop&q=80',
    flags: {} },
  { name: 'Chicharrón',            price: 14,   category: 'Fritura',    popular: true,
    description: 'Nuestra especialidad: carne de cerdo frita a la perfección.',
    image: 'https://images.unsplash.com/photo-1544025162-d76538b2a681?w=500&h=380&fit=crop&q=80',
    flags: {} },
  { name: 'Queso Frito',           price: 10,   category: 'Fritura',
    description: 'Queso tropical frito a la perfección.',
    image: 'https://images.unsplash.com/photo-1588080936-c9a04d8cd89e?w=500&h=380&fit=crop&q=80',
    flags: { vegetarian: true } },
  { name: 'Pernil / Pork',         price: 14,   category: 'Carnes',    popular: true,
    description: 'Cerdo asado lentamente con sazón de la casa.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=380&fit=crop&q=80',
    flags: { glutenFree: true } },
  { name: 'Pollo Guisado',         price: 8,    category: 'Carnes',
    description: 'Pollo estofado en salsa criolla con especias.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&h=380&fit=crop&q=80',
    flags: { glutenFree: true } },
  { name: 'Churrasco',             price: 18,   category: 'Carnes',
    description: 'Skirt steak tierno a la parrilla.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=380&fit=crop&q=80',
    flags: { glutenFree: true } },
  { name: 'Rabo Guisado',          price: 17,   category: 'Carnes',
    description: 'Cola de res estofada tradicional.',
    image: 'https://images.unsplash.com/photo-1504544750208-dc0358e1c346?w=500&h=380&fit=crop&q=80',
    flags: { glutenFree: true } },
  { name: 'Camarones al Ajillo',   price: 18,   category: 'Mariscos',  popular: true,
    description: 'Camarones frescos en salsa de ajo y mantequilla.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=380&fit=crop&q=80',
    flags: { glutenFree: true } },
  { name: 'Pescado Frito',         price: 18,   category: 'Mariscos',
    description: 'Pescado entero frito al estilo isla.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&h=380&fit=crop&q=80',
    flags: { glutenFree: true } },
  { name: 'Empanadas',             price: 3.50, category: 'Appetizers',
    description: 'Pollo, Res o Queso con nuestra famosa salsa rosada.',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&h=380&fit=crop&q=80',
    flags: {} },
  { name: 'Mofongo Bowl',          price: 12,   category: 'Sides',
    description: 'Plátano frito majado con ajo y chicharrón.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=380&fit=crop&q=80',
    flags: { glutenFree: true } },
]

const NY_TAX = 0.08875

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MenuClient() {
  const searchParams   = useSearchParams()
  const tableId        = searchParams.get('table') || null

  const [cart, setCart]               = useState<CartItem[]>([])
  const [activeCategory, setCategory] = useState('Todo')
  const [cartOpen, setCartOpen]       = useState(false)
  const [tipPercent, setTipPercent]   = useState(0.18)

  const addToCart = (dish: MenuItem) =>
    setCart(prev => [...prev, { ...dish, cartId: Date.now() + Math.random() }])

  const removeFromCart = (cartId: number) =>
    setCart(prev => prev.filter(i => i.cartId !== cartId))

  const visibleDishes = activeCategory === 'Todo'
    ? MOCK_DISHES
    : MOCK_DISHES.filter(d => d.category === activeCategory)

  const subtotal = cart.reduce((s, i) => s + i.price, 0)
  const tax      = subtotal * NY_TAX
  const tip      = subtotal * tipPercent
  const total    = subtotal + tax + tip

  return (
    <>
      <style>{`
        @keyframes slideUp   { from { transform: translateY(120%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes fadeIn    { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .dish-card { animation: fadeIn 0.3s ease both }
        .cart-bar  { animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both }
        .bill-panel { animation: slideInRight 0.3s ease both }
        .no-scrollbar::-webkit-scrollbar { display: none }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }
        .wood-texture {
          background-image: repeating-linear-gradient(
            92deg,
            rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px,
            transparent 1px, transparent 60px
          ),
          repeating-linear-gradient(
            180deg,
            rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px,
            transparent 1px, transparent 40px
          );
        }
      `}</style>

      <div className="min-h-screen text-white relative" style={{ backgroundColor: BRAND.wood }}>

        {/* Wood texture overlay */}
        <div className="wood-texture fixed inset-0 pointer-events-none z-0" />

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative h-[42vh] min-h-[300px] flex items-end overflow-hidden z-10"
          style={{ borderBottom: `4px solid ${BRAND.blue}` }}>

          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-[#1A0F0A]/40 to-black/30 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&h=700&fit=crop&q=85"
            alt="Comida dominicana"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="relative z-20 w-full max-w-3xl mx-auto px-5 pb-8">
            {/* Mini bandera dominicana */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-3.5 w-6 rounded-sm overflow-hidden shadow-lg flex-shrink-0">
                <div className="w-1/2 h-full" style={{ backgroundColor: BRAND.blue }} />
                <div className="w-1/2 h-full" style={{ backgroundColor: BRAND.red }} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/60">
                Auténtico Sabor Quisqueyano
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none mb-2">
              THE LITTLE{' '}
              <span style={{ color: BRAND.red }}>DOMINICAN</span>
            </h1>

            <div className="flex flex-wrap gap-3 mt-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <span style={{ color: BRAND.gold }}>★★★★★</span> 5.0 Google
              </span>
              {tableId && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                  📍 Mesa {tableId}
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 text-white/70">
                315 E Water St, Elmira, NY · (607) 215-0990
              </span>
            </div>
          </div>
        </section>

        {/* ── Category Nav (sticky) ─────────────────────────────── */}
        <nav className="sticky top-0 z-40 backdrop-blur-md border-b border-white/5"
          style={{ backgroundColor: `${BRAND.wood}E8` }}>
          <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
            {MENU_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide whitespace-nowrap border transition-all duration-200 flex-shrink-0"
                style={activeCategory === cat
                  ? { backgroundColor: BRAND.blue, borderColor: BRAND.blue, color: '#fff' }
                  : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Dish Grid ────────────────────────────────────────────── */}
        <main className="relative z-10 max-w-3xl mx-auto px-4 py-6 pb-36">
          <div className="flex flex-col gap-3">
            {visibleDishes.map((dish, i) => (
              <DishRow
                key={dish.name}
                dish={dish}
                index={i}
                onAdd={() => addToCart(dish)}
              />
            ))}
          </div>

          {/* Footer links when no table (landing mode) */}
          {!tableId && (
            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <p className="text-white/30 text-xs mb-4">¿Quieres reservar una mesa?</p>
              <a
                href="tel:6072150990"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
              >
                📞 (607) 215-0990
              </a>
              <p className="text-white/20 text-[10px] mt-8 uppercase tracking-widest">
                Powered by <Link href="/" className="hover:text-white/40 transition-colors">MaalCa</Link>
              </p>
            </div>
          )}
        </main>

        {/* ── Floating Cart Bar ────────────────────────────────────── */}
        {cart.length > 0 && !cartOpen && (
          <div className="cart-bar fixed bottom-6 left-0 right-0 z-50 px-4">
            <div className="max-w-sm mx-auto">
              <button
                onClick={() => setCartOpen(true)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl shadow-2xl font-bold transition-transform active:scale-98"
                style={{ backgroundColor: BRAND.red }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-black"
                    style={{ color: BRAND.red }}>
                    {cart.length}
                  </div>
                  <div className="text-left leading-none">
                    <span className="block text-[9px] uppercase tracking-widest text-white/60 mb-0.5">
                      {tableId ? `Mesa ${tableId} ·` : ''} Mi Orden
                    </span>
                    <span className="text-sm font-bold">Ver Cuenta</span>
                  </div>
                </div>
                <span className="text-xl font-black italic tracking-tighter"
                  style={{ color: BRAND.gold }}>
                  ${subtotal.toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Bill Drawer (slide-in panel) ─────────────────────────── */}
        {cartOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            {/* Panel */}
            <div
              className="bill-panel fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col border-l border-white/5 overflow-y-auto"
              style={{ backgroundColor: BRAND.wood }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter">
                    TU <span style={{ color: BRAND.red }}>CUENTA</span>
                  </h2>
                  {tableId && (
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">
                      Mesa {tableId}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {cart.map(item => (
                    <div key={item.cartId}
                      className="flex items-center justify-between py-3 border-b border-white/5">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-bold text-white/90 truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-black" style={{ color: BRAND.gold }}>
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="w-6 h-6 rounded-full border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-colors text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip + Totals */}
              <div className="flex-shrink-0 px-6 pb-8 pt-4 border-t border-white/5"
                style={{ backgroundColor: `${BRAND.woodMid}` }}>

                {/* Tip selector */}
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center mb-3">
                  Sugerir Propina (Tip)
                </p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[0.15, 0.18, 0.20, 0.25].map(p => (
                    <button
                      key={p}
                      onClick={() => setTipPercent(p)}
                      className="py-2.5 rounded-xl text-xs font-black transition-all duration-150 border"
                      style={tipPercent === p
                        ? { backgroundColor: BRAND.gold, borderColor: BRAND.gold, color: '#1A0F0A' }
                        : { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
                      }
                    >
                      {(p * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>

                {/* Breakdown */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-xs text-white/40 font-bold uppercase">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/40 font-bold uppercase">
                    <span>Sales Tax (8.875%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase"
                    style={{ color: BRAND.gold }}>
                    <span>Tip ({(tipPercent * 100).toFixed(0)}%)</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-white/8">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Total Est.</span>
                    <span className="text-3xl font-black italic tracking-tighter">${total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-center text-[9px] text-white/20 leading-relaxed">
                  Estimación. Pago directo en caja al finalizar.
                </p>

                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full mt-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
                >
                  ← Seguir ordenando
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── DishRow ──────────────────────────────────────────────────────────────────

function DishRow({ dish, index, onAdd }: {
  dish: MenuItem
  index: number
  onAdd: () => void
}) {
  return (
    <div
      className="dish-card flex gap-4 p-4 rounded-2xl border border-transparent hover:border-white/10 transition-all duration-200 cursor-default group"
      style={{
        backgroundColor: BRAND.woodMid,
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Image */}
      <div className="relative h-24 w-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {dish.popular && (
          <div
            className="absolute top-0 left-0 px-1.5 py-0.5 text-[8px] font-black uppercase rounded-br-lg"
            style={{ backgroundColor: BRAND.red }}
          >
            Top
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-white leading-tight">{dish.name}</h3>
            <span className="text-base font-black flex-shrink-0 tabular-nums"
              style={{ color: BRAND.gold }}>
              ${dish.price % 1 === 0 ? dish.price : dish.price.toFixed(2)}
            </span>
          </div>
          <p className="text-white/40 text-[11px] mt-1 leading-snug line-clamp-2">
            {dish.description}
          </p>
          {/* Flags */}
          {(dish.flags?.vegetarian || dish.flags?.glutenFree) && (
            <div className="flex gap-1.5 mt-1.5">
              {dish.flags?.vegetarian && (
                <span className="text-[9px] font-bold text-green-400/70 bg-green-400/10 px-1.5 py-0.5 rounded-full">🌱</span>
              )}
              {dish.flags?.glutenFree && (
                <span className="text-[9px] font-bold text-yellow-400/70 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">GF</span>
              )}
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={onAdd}
          className="self-end flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95 border mt-2"
          style={{ backgroundColor: BRAND.blue, borderColor: BRAND.blue, color: '#fff' }}
        >
          + Ordenar
        </button>
      </div>
    </div>
  )
}
