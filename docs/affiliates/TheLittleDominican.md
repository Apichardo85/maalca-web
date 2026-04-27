// app/the-little-dominican/page.tsx
// TODO: Replace MOCK_CONFIG with fetch from GET /api/affiliates/the-little-dominican
// TODO: Replace MOCK_DISHES  with fetch from Umbraco CMS CMS-REQ-REST-002

import type { Metadata } from 'next'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItem {
  name: string
  description: string
  price: number
  category: string
  flags: { vegetarian?: boolean; spicy?: boolean; glutenFree?: boolean }
  available: boolean
}

interface Event {
  id: string
  title: string
  artistName: string
  date: string
  startTime: string
}

// ─── Mock data (replace with API/CMS calls when ready) ───────────────────────

const MOCK_CONFIG = {
  id: 'the-little-dominican',
  name: 'The Little Dominican',
  tagline: "Traditional Dominican with a modern spin, bringing abuela's cooking straight to you.",
  address: '4 Waldron Ave, Nyack, NY 10960',
  phone: '(845) 480-5737',
  website: 'thelittledominican.com',
  priceRange: '$10–20',
  rating: 5.0,
  branding: {
    primaryColor: '#DC2626',
    secondaryColor: '#F97316',
    accentColor: '#F59E0B',
  },
  hours: [
    { day: 'Lunes',    open: 'Cerrado' },
    { day: 'Martes',   open: '11:00 AM', close: '9:00 PM' },
    { day: 'Miércoles',open: '11:00 AM', close: '9:00 PM' },
    { day: 'Jueves',   open: '11:00 AM', close: '9:00 PM' },
    { day: 'Viernes',  open: '11:00 AM', close: '10:00 PM' },
    { day: 'Sábado',   open: '11:00 AM', close: '10:00 PM' },
    { day: 'Domingo',  open: '12:00 PM', close: '8:00 PM' },
  ],
  features: {
    delivery: true,
    pickup: true,
    dineIn: true,
    reservations: true,
    liveMusic: true,
  },
}

const MOCK_DISHES: MenuItem[] = [
  { name: 'Mofongo con Camarones', description: 'Clásico dominicano con camarones al ajillo', price: 18, category: 'mains', flags: { glutenFree: true }, available: true },
  { name: 'Sancocho de 7 Carnes',  description: 'Guiso tradicional de la abuela con siete carnes', price: 16, category: 'mains', flags: { glutenFree: true }, available: true },
  { name: 'Rabo Guisado',          description: 'Cola de res estofada lentamente por 4 horas', price: 17, category: 'mains', flags: {}, available: true },
  { name: 'Tostones con Dip',      description: 'Plátanos verdes fritos, crujientes, con salsa criolla', price: 7, category: 'appetizers', flags: { vegetarian: true, glutenFree: true }, available: true },
  { name: 'Tres Golpes',           description: 'Mangú, queso frito, salami y huevo', price: 13, category: 'mains', flags: {}, available: true },
  { name: 'Yaroa Dominicana',      description: 'Capas de papas fritas, pollo y queso derretido', price: 14, category: 'mains', flags: {}, available: true },
]

const MOCK_EVENTS: Event[] = [
  { id: '1', title: 'Noche de Bachata', artistName: 'DJ Caribe', date: '2026-03-28', startTime: '8:00 PM' },
  { id: '2', title: 'Merengue en Vivo', artistName: 'Grupo Quisqueya', date: '2026-04-04', startTime: '7:30 PM' },
]

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'The Little Dominican | MaalCa',
  description: MOCK_CONFIG.tagline,
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FlagBadge({ label, emoji }: { label: string; emoji: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
      {emoji} {label}
    </span>
  )
}

function DishCard({ dish }: { dish: MenuItem }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-red-500/30 transition-all duration-200 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-sm leading-tight">{dish.name}</h3>
        <span className="text-orange-400 font-bold text-sm whitespace-nowrap">${dish.price}</span>
      </div>
      <p className="text-white/60 text-xs leading-relaxed">{dish.description}</p>
      <div className="flex flex-wrap gap-1 mt-auto pt-1">
        {dish.flags.vegetarian && <FlagBadge label="Vegetariano" emoji="🌱" />}
        {dish.flags.spicy      && <FlagBadge label="Picante"     emoji="🌶️" />}
        {dish.flags.glutenFree && <FlagBadge label="Sin Gluten"  emoji="🌾" />}
      </div>
    </div>
  )
}

function InfoIcon({ d }: { d: string }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TheLittleDominicanPage() {
  const config = MOCK_CONFIG

  return (
    <main className="min-h-screen bg-neutral-950 text-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient — replace with real hero image when CMS is ready */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-neutral-950 to-orange-950 opacity-80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.15),transparent)]" />

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-36">
          {/* Rating pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-semibold mb-6">
            <span className="text-orange-400">★★★★★</span>
            {config.rating.toFixed(1)} en Google
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            {config.name}
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-8 italic">
            &ldquo;{config.tagline}&rdquo;
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* TODO: open reservation modal → POST /api/affiliates/the-little-dominican/appointments */}
            <Link
              href="#reservar"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reservar Mesa
            </Link>

            {/* TODO: link to /the-little-dominican/order → WEB-REST-004 */}
            <Link
              href="#menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Ver Menú
            </Link>

            <a
              href={`tel:${config.phone.replace(/\D/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              {config.phone}
            </a>
          </div>

          {/* Service chips */}
          <div className="flex flex-wrap gap-2 mt-8">
            {config.features.dineIn      && <Chip label="Dine-in"    />}
            {config.features.pickup      && <Chip label="Pickup"     />}
            {config.features.delivery    && <Chip label="Delivery"   />}
            {config.features.liveMusic   && <Chip label="Música en vivo" />}
            <Chip label={config.priceRange} />
          </div>
        </div>
      </section>

      {/* ── Featured Menu ─────────────────────────────────────────── */}
      <section id="menu" className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Lo más pedido</h2>
            <p className="text-white/50 text-sm mt-1">Platos que vienen directo del recetario de la abuela</p>
          </div>
          {/* TODO: link to full menu page when WEB-REST-002 is done */}
          <Link href="#" className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
            Ver menú completo →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_DISHES.filter(d => d.available).map(dish => (
            <DishCard key={dish.name} dish={dish} />
          ))}
        </div>
      </section>

      {/* ── Live Events ───────────────────────────────────────────── */}
      <section className="bg-white/3 border-y border-white/8">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🎵</span>
            <div>
              <h2 className="text-xl font-bold">Música en vivo</h2>
              <p className="text-white/50 text-sm">Próximos eventos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_EVENTS.map(event => (
              <div key={event.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-colors">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center">
                  <span className="text-xs text-orange-300 font-semibold uppercase">
                    {new Date(event.date).toLocaleDateString('es', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-orange-400 leading-none">
                    {new Date(event.date).getDate()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{event.title}</p>
                  <p className="text-white/50 text-sm">{event.artistName} · {event.startTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Info + Hours + Reservation ────────────────────────────── */}
      <section id="reservar" className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Info block */}
          <div>
            <h2 className="text-xl font-bold mb-6">Visítanos</h2>
            <div className="flex flex-col gap-4">
              <InfoRow icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                {config.address}
              </InfoRow>
              <InfoRow icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z">
                <a href={`tel:${config.phone}`} className="hover:text-white transition-colors">{config.phone}</a>
              </InfoRow>
              <InfoRow icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9">
                <a href={`https://${config.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{config.website}</a>
              </InfoRow>
            </div>

            {/* Hours */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Horario</h3>
              <div className="flex flex-col gap-1">
                {config.hours.map(h => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className="text-white/60">{h.day}</span>
                    <span className={h.open === 'Cerrado' ? 'text-red-400/60' : 'text-white/80'}>
                      {h.open === 'Cerrado' ? 'Cerrado' : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reservation form — TODO: wire to POST /api/affiliates/the-little-dominican/appointments */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">Reservar Mesa</h2>
            <p className="text-white/50 text-sm mb-6">Sin cargo · Te confirmamos en menos de 1 hora</p>

            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Nombre" placeholder="Tu nombre" type="text" />
                <FormField label="Teléfono" placeholder="(845) 000-0000" type="tel" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Fecha" type="date" />
                <FormField label="Hora" type="time" />
              </div>
              <div>
                <label className="block text-xs text-white/50 font-medium mb-1.5 uppercase tracking-wide">Personas</label>
                <select className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors">
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n} className="bg-neutral-900">{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 font-medium mb-1.5 uppercase tracking-wide">Nota especial (opcional)</label>
                <textarea
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
                  rows={2}
                  placeholder="Alergias, celebración, mesa afuera..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold transition-colors"
              >
                Confirmar Reservación
              </button>

              <p className="text-center text-xs text-white/30">
                O llámanos directamente al {config.phone}
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © 2026 {config.name} · Powered by{' '}
            <Link href="/" className="text-red-400/70 hover:text-red-400 transition-colors">MaalCa Ecosistema</Link>
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-white/30 hover:text-white/70 text-sm transition-colors">Facebook</a>
            <a href="#" className="text-white/30 hover:text-white/70 text-sm transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

// ─── Micro helpers ────────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/8 border border-white/15 text-white/70">
      {label}
    </span>
  )
}

function InfoRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-white/60 text-sm">
      <InfoIcon d={icon} />
      <span className="leading-relaxed">{children}</span>
    </div>
  )
}

function FormField({ label, placeholder, type }: { label: string; placeholder?: string; type: string }) {
  return (
    <div>
      <label className="block text-xs text-white/50 font-medium mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
      />
    </div>
  )
}
