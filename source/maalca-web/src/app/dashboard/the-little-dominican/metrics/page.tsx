'use client'

// ─── Mock data ────────────────────────────────────────────────────────────────

const REVENUE_BARS = [
  { week: 'Sem 1', rev: 40, exp: 28 },
  { week: 'Sem 2', rev: 55, exp: 32 },
  { week: 'Sem 3', rev: 45, exp: 30 },
  { week: 'Sem 4', rev: 70, exp: 40 },
  { week: 'Sem 5', rev: 65, exp: 38 },
  { week: 'Sem 6', rev: 85, exp: 45 },
  { week: 'Sem 7', rev: 95, exp: 50 },
]

const MENU_STARS = [
  { name: 'Mofongo de Camarones', orders: '1,402', trend: 'up',   img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=80&q=80' },
  { name: 'Sancocho Prieto',      orders: '984',   trend: 'up',   img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=80&q=80' },
  { name: 'Ensalada de Aguacate', orders: '822',   trend: 'flat', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=80' },
]

const INVENTORY_ISSUES = [
  { name: 'Plátanos (dulces)',    pct: 12, urgency: 'Mañana',  color: '#ba1a1a' },
  { name: 'Presidente Beer 12oz', pct: 28, urgency: 'Viernes', color: '#bb001e' },
]

const GUEST_VOICE = '"El mofongo fue impresionante. Se sentía como estar en Santo Domingo. El servicio fue excepcional y el ambiente perfectamente elegante."'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Analytics() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: '#e12531', marginBottom: '6px' }}>
            Métricas de Rendimiento
          </p>
          <h2 className="tld-serif" style={{ fontSize: '2.8rem', fontWeight: 300, color: '#00193c', lineHeight: 1.1, letterSpacing: '-.02em' }}>
            Visión General<br /><span style={{ fontWeight: 700 }}>Operacional</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button style={{
            padding: '10px 18px', borderRadius: '9999px', border: '1px solid #e4e5e7',
            background: '#f3f4f5', fontSize: '.76rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="ms ms-sm">download</span>
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          <button style={{
            padding: '10px 20px', borderRadius: '9999px', border: 'none',
            background: '#00193c', color: '#fff', fontSize: '.76rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span className="ms ms-sm">calendar_today</span>
            <span className="hidden sm:inline">Oct 1 – Oct 31</span>
          </button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1rem]">
        {[
          { icon: 'payments',     label: 'Ingresos Brutos',   value: '$42,850',  badge: '+12.4%', badgeBg: '#dcfce7', badgeColor: '#15803d' },
          { icon: 'shopping_bag', label: 'Ticket Promedio',   value: '$34.20',   badge: '-2.1%',  badgeBg: '#fecdd3', badgeColor: '#be123c' },
          { icon: 'group',        label: 'Nuevos Clientes',   value: '1,248',    badge: '+8.4%',  badgeBg: '#dcfce7', badgeColor: '#15803d' },
          { icon: 'star',         label: 'Tasa Satisfacción', value: '4.8 / 5',  badge: 'Estable',badgeBg: '#d7e2ff', badgeColor: '#00193c' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span className="ms" style={{ color: '#9ca3af' }}>{kpi.icon}</span>
              <span style={{ fontSize: '.62rem', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', background: kpi.badgeBg, color: kpi.badgeColor }}>
                {kpi.badge}
              </span>
            </div>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px' }}>
              {kpi.label}
            </p>
            <h4 className="tld-serif" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00193c', lineHeight: 1 }}>
              {kpi.value}
            </h4>
          </div>
        ))}
      </div>

      {/* ── MAIN CHARTS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-[1.5rem]">

        {/* Financial Trajectory */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', boxShadow: '0 1px 6px rgba(0,0,0,.05)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h4 className="tld-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00193c' }}>
              Trayectoria Financiera
            </h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[['#00193c','Ingresos'],['#e12531','Gastos']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Bar + line chart */}
          <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 8px', borderLeft: '1px solid #f0f1f2', borderBottom: '1px solid #f0f1f2' }}>
            {/* Horizontal grid lines */}
            {[25,50,75,100].map(pct => (
              <div key={pct} style={{ position: 'absolute', left: 0, right: 0, bottom: `${pct}%`, borderTop: '1px solid #f0f1f2', pointerEvents: 'none' }} />
            ))}

            {/* Bars */}
            {REVENUE_BARS.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: '#00193c', height: `${d.rev}%`, opacity: .9 }} />
              </div>
            ))}

            {/* Expense line overlay (SVG) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="none">
              <polyline
                points={REVENUE_BARS.map((d, i) => {
                  const x = (i / (REVENUE_BARS.length - 1)) * 100
                  const y = 100 - d.exp
                  return `${x}% ${y}%`
                }).join(' ')}
                fill="none" stroke="#e12531" strokeWidth="2.5" strokeDasharray="8 4"
              />
            </svg>
          </div>

          {/* X-axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 8px 0', fontSize: '.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ca3af' }}>
            {REVENUE_BARS.map(d => <span key={d.week}>{d.week}</span>)}
          </div>
        </div>

        {/* Menu Stars */}
        <div style={{ background: '#00193c', borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 className="tld-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7796d1', marginBottom: '1.5rem' }}>
              Estrellas del Menú
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {MENU_STARS.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, filter: 'grayscale(40%)' }}>
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p className="tld-serif" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>{item.name}</p>
                      <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7796d1', marginTop: '2px' }}>
                        {item.orders} órdenes
                      </p>
                    </div>
                  </div>
                  <span className="ms" style={{ color: item.trend === 'up' ? '#3eaa59' : '#7796d1' }}>
                    {item.trend === 'up' ? 'trending_up' : 'trending_flat'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button style={{
            marginTop: '1.5rem', padding: '10px', borderRadius: '9999px',
            background: 'none', border: '1px solid rgba(119,150,209,.3)',
            color: '#7796d1', fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em',
            textTransform: 'uppercase', cursor: 'pointer', width: '100%',
          }}>
            Ver Análisis Completo
          </button>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-[1.5rem]">

        {/* Inventory Insights */}
        <div style={{ background: '#f3f4f5', borderRadius: '14px', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h4 className="tld-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00193c' }}>
                Inventario — Alertas
              </h4>
              <p style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: '2px' }}>
                Alertas y velocidad de uso
              </p>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#ffdad6', color: '#ba1a1a', fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {INVENTORY_ISSUES.length} Críticos
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {INVENTORY_ISSUES.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '14px 16px', background: '#fff', borderRadius: '10px', border: '1px solid rgba(196,198,209,.08)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '.8rem', fontWeight: 600, color: '#00193c', letterSpacing: '.05em', textTransform: 'uppercase' }}>{item.name}</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: item.color }}>{item.pct}% stock</span>
                  </div>
                  <div style={{ background: '#edeeef', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '9999px', background: item.color, width: `${item.pct}%` }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '2px' }}>Restock</p>
                  <p style={{ fontSize: '.82rem', fontWeight: 700, color: '#00193c' }}>{item.urgency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice of Guest */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', boxShadow: '0 1px 6px rgba(0,0,0,.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #f0f1f2' }}>
          <div>
            <h4 className="tld-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00193c', marginBottom: '1.25rem' }}>
              Voz del Cliente
            </h4>
            <p className="tld-serif" style={{
              paddingLeft: '16px', borderLeft: '2px solid rgba(225,37,49,.2)',
              fontStyle: 'italic', fontSize: '1rem', color: '#4b5563', lineHeight: 1.7,
              marginBottom: '12px',
            }}>
              {GUEST_VOICE}
              <span style={{ display: 'block', marginTop: '8px', fontStyle: 'normal', fontFamily: 'Manrope,sans-serif', fontSize: '.64rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ca3af' }}>
                — María G., Elite Reviewer
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[8px]">
            {[
              { value: '98%', label: 'Positivo',  bg: 'rgba(142,250,158,.2)', color: '#002109' },
              { value: '2%',  label: 'Neutral',   bg: '#f3f4f5',              color: '#6b7280' },
              { value: '0%',  label: 'Negativo',  bg: 'rgba(186,26,26,.07)',  color: '#93000a' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: '10px', background: s.bg }}>
                <p className="tld-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '.6rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: s.color, opacity: .7, marginTop: '2px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
