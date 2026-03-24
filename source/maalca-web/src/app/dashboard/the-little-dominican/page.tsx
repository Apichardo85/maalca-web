'use client'

import Link from 'next/link'

// ─── Mock data ────────────────────────────────────────────────────────────────

const TABLES = [
  { id: 'T-01', occupied: true  },
  { id: 'T-02', occupied: false },
  { id: 'T-03', occupied: false },
  { id: 'T-04', occupied: true  },
  { id: 'T-05', occupied: true  },
  { id: 'T-06', occupied: false },
  { id: 'T-07', occupied: true  },
  { id: 'T-08', occupied: false },
  { id: 'T-09', occupied: true  },
  { id: 'T-10', occupied: true  },
  { id: 'T-11', occupied: false },
  { id: 'T-12', occupied: true  },
]

const ACTIVITY = [
  { icon: 'check_circle',   iconBg: '#bbf7d0', iconColor: '#15803d', title: 'Table 04 Paid',       sub: 'Check #4021 closed at 2:14 PM',                   ago: '2 MIN AGO'   },
  { icon: 'priority_high',  iconBg: '#fecdd3', iconColor: '#be123c', title: 'Stock Alert',         sub: 'Plantain inventory below 15% threshold',          ago: '12 MIN AGO'  },
  { icon: 'local_shipping', iconBg: '#dbeafe', iconColor: '#1d4ed8', title: 'Supplier Delivery',   sub: 'Moro Fresh Seafood delivered 40 kg catch',        ago: '45 MIN AGO'  },
  { icon: 'person_add',     iconBg: '#e5e7eb', iconColor: '#374151', title: 'New Reservation',     sub: 'Altagracia, party of 6 for 8:00 PM',              ago: '1 HR AGO'    },
  { icon: 'restaurant',     iconBg: '#fef3c7', iconColor: '#b45309', title: 'New Order — T-09',    sub: 'Chicharrón + Camarones al Ajillo + Mofongo Bowl', ago: '2 HR AGO'    },
]

const KITCHEN_BARS = [0.45, 0.65, 1.0, 0.78, 0.5, 0.6, 0.88]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TLDDashboard() {
  const occupiedCount = TABLES.filter(t => t.occupied).length

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>

      {/* ── BENTO STATS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1.25rem]">

        {/* Gross Revenue */}
        <div className="col-span-1 sm:col-span-2" style={{
          padding: '2rem', borderRadius: '12px',
          background: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,.04)',
        }}>
          <p style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#74777f', marginBottom: '8px' }}>
            Ingresos Brutos
          </p>
          <h3 className="tld-serif" style={{ fontSize: '3rem', fontWeight: 700, color: '#00193c', lineHeight: 1 }}>
            $14,280.50
          </h3>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d' }}>
            <span className="ms ms-sm">trending_up</span>
            <span style={{ fontSize: '.75rem', fontWeight: 700 }}>+12.4% vs la semana pasada</span>
          </div>
          <div style={{
            position: 'absolute', right: '-3rem', bottom: '-3rem',
            width: '180px', height: '180px', borderRadius: '50%',
            background: '#d7e2ff', opacity: .3, filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Active Tables */}
        <div style={{ padding: '2rem', borderRadius: '12px', background: '#f3f4f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#74777f', marginBottom: '6px' }}>
              Mesas Activas
            </p>
            <h3 className="tld-serif" style={{ fontSize: '2rem', fontWeight: 700, color: '#00193c' }}>
              {occupiedCount}/{TABLES.length}
            </h3>
          </div>
          <div style={{ background: '#e4e5e7', height: '4px', borderRadius: '9999px', overflow: 'hidden', marginTop: '1rem' }}>
            <div style={{ background: '#e12531', height: '100%', width: `${(occupiedCount / TABLES.length) * 100}%`, borderRadius: '9999px' }} />
          </div>
        </div>

        {/* Two small stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderRadius: '12px', background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '.6rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: '#74777f' }}>Órdenes Pendientes</p>
              <h3 className="tld-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#00193c' }}>07</h3>
            </div>
            <span className="ms ms-fill" style={{ color: '#e12531', fontSize: '24px' }}>restaurant</span>
          </div>
          <div style={{ padding: '1.25rem 1.5rem', borderRadius: '12px', background: '#f3f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '.6rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: '#74777f' }}>Ticket Promedio</p>
              <h3 className="tld-serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#00193c' }}>$82.40</h3>
            </div>
            <span className="ms" style={{ color: '#3eaa59' }}>receipt</span>
          </div>
        </div>
      </section>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 className="tld-serif" style={{ fontSize: '1.5rem', fontWeight: 700, fontStyle: 'italic', color: '#00193c' }}>
              Telemetría en Vivo
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="tld-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af' }}>Live Feed</span>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Kitchen Velocity */}
            <div style={{ padding: '1.5rem', background: '#edeeef', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="ms" style={{ color: '#00193c' }}>speed</span>
                <span style={{ fontSize: '.58rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#74777f' }}>Velocidad Cocina</span>
              </div>
              <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {KITCHEN_BARS.map((h, i) => (
                  <div key={i} style={{
                    flex: 1, borderRadius: '3px 3px 0 0',
                    background: i === 2 ? '#002d62' : 'rgba(0,45,98,.2)',
                    height: `${h * 100}%`,
                  }} />
                ))}
              </div>
              <p className="tld-serif" style={{ marginTop: '12px', fontSize: '1.25rem', fontWeight: 700, color: '#00193c' }}>
                14 min{' '}
                <span style={{ fontSize: '.75rem', fontWeight: 300, color: '#9ca3af', fontStyle: 'italic' }}>
                  prep promedio
                </span>
              </p>
            </div>

            {/* Guest Satisfaction */}
            <div style={{ padding: '1.5rem', background: '#edeeef', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span className="ms ms-fill" style={{ color: '#e12531' }}>favorite</span>
                <span style={{ fontSize: '.58rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#74777f' }}>Satisfacción</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <h3 className="tld-serif" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00193c' }}>4.9</h3>
                <span style={{ fontSize: '.72rem', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase' }}>/ 5.0</span>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '3px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="ms ms-fill ms-sm" style={{ color: '#e12531' }}>star</span>
                ))}
              </div>
              <p style={{ marginTop: '8px', fontSize: '.72rem', color: '#74777f', fontWeight: 300 }}>
                Basado en <span style={{ fontWeight: 600, color: '#00193c' }}>124 reseñas</span>
              </p>
            </div>
          </div>

          {/* Floor Map */}
          <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,.04)' }}>
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #f0f1f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#374151' }}>
                Mapa de Planta — Tiempo Real
              </p>
              <button style={{ fontSize: '.72rem', fontWeight: 700, color: '#00193c', background: 'none', border: 'none', cursor: 'pointer' }}>
                Gestionar →
              </button>
            </div>
            <div style={{ padding: '.75rem 1.5rem 0', display: 'flex', gap: '1.25rem' }}>
              {[['#e12531','Ocupada'],['#22c55e','Disponible']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '.68rem', color: '#6b7280' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {label}
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
              {TABLES.map(t => (
                <div key={t.id} style={{
                  aspectRatio: '1', borderRadius: '8px',
                  border: t.occupied ? '1px solid rgba(225,37,49,.2)' : '1px solid rgba(34,197,94,.25)',
                  background: t.occupied ? 'rgba(225,37,49,.06)' : 'rgba(34,197,94,.06)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '.58rem', fontWeight: 700, color: t.occupied ? '#be123c' : '#15803d' }}>{t.id}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.occupied ? '#e12531' : '#22c55e', display: 'inline-block' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 className="tld-serif" style={{ fontSize: '1.5rem', fontWeight: 700, fontStyle: 'italic', color: '#00193c' }}>
            Actividad Reciente
          </h4>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {ACTIVITY.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: item.iconBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="ms ms-fill ms-sm" style={{ color: item.iconColor }}>{item.icon}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '.82rem', color: '#00193c', marginBottom: '2px' }}>{item.title}</p>
                  <p style={{ fontSize: '.74rem', color: '#74777f', lineHeight: 1.4, marginBottom: '4px' }}>{item.sub}</p>
                  <span style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', color: '#9ca3af' }}>{item.ago}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Menu editor CTA */}
          <Link href="/dashboard/the-little-dominican/menu" style={{
            display: 'block', textDecoration: 'none',
            position: 'relative', padding: '1.5rem',
            borderRadius: '12px', background: '#00193c',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p className="tld-serif" style={{ fontSize: '1.05rem', fontStyle: 'italic', color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>
                ¿Actualizar el menú?
              </p>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.7)', marginBottom: '14px', lineHeight: 1.5 }}>
                Precios y disponibilidad en tiempo real.
              </p>
              <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.4)', paddingBottom: '3px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Abrir Editor <span className="ms ms-sm" style={{ color: '#fff' }}>arrow_forward</span>
              </span>
            </div>
            <span className="ms" style={{ position: 'absolute', right: '-16px', bottom: '-10px', fontSize: '80px', color: 'rgba(255,255,255,.08)' }}>restaurant_menu</span>
          </Link>

          {/* Reservations shortcut */}
          <Link href="/the-little-dominican#reservar" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            textDecoration: 'none', padding: '1.1rem 1.25rem', borderRadius: '12px',
            background: '#f3f4f5', border: '1px solid #e4e5e7',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#edeeef')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f5')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="ms" style={{ color: '#00193c' }}>event_available</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '.82rem', color: '#00193c' }}>Reservaciones de Hoy</p>
                <p style={{ fontSize: '.72rem', color: '#74777f', marginTop: '1px' }}>3 reservaciones · próxima 7:00 PM</p>
              </div>
            </div>
            <span className="ms ms-sm" style={{ color: '#9ca3af' }}>chevron_right</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
