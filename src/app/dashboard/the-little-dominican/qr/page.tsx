'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// ─── Config ──────────────────────────────────────────────────────────────────

const P = '#00193c'   // navy
const S = '#e12531'   // red
const BASE = 'https://maalca.com/the-little-dominican'
const TABLES = 12

type Tab = 'mesas' | 'redes' | 'imprimir'

interface QRItem {
  id: string
  label: string
  sub: string
  url: string
  icon: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TABLE_ITEMS: QRItem[] = Array.from({ length: TABLES }, (_, i) => ({
  id: `mesa-${i + 1}`,
  label: `Mesa ${i + 1}`,
  sub: 'Escanea para ver el menú',
  url: `${BASE}/menu?mesa=${i + 1}`,
  icon: '🍽',
}))

const SOCIAL_ITEMS: QRItem[] = [
  { id: 'menu',        label: 'Menú Digital',     sub: BASE + '/menu',                      url: BASE + '/menu',                                icon: '📋' },
  { id: 'instagram',   label: 'Instagram',         sub: '@thelittledominican',               url: 'https://instagram.com/thelittledominican',    icon: '📸' },
  { id: 'facebook',    label: 'Facebook',          sub: 'The Little Dominican',              url: 'https://facebook.com/thelittledominican',    icon: '👥' },
  { id: 'reservar',    label: 'Reservaciones',     sub: 'Reserva tu mesa online',            url: BASE + '/#reservar',                          icon: '📅' },
  { id: 'takeout',     label: 'Takeout / Delivery',sub: 'Ordena para llevar',               url: BASE + '/menu?modo=takeout',                   icon: '🥡' },
  { id: 'catering',    label: 'Catering',          sub: 'Eventos y celebraciones',           url: BASE + '/#catering',                          icon: '🎉' },
]

// ─── Single QR card ───────────────────────────────────────────────────────────

function QRCard({ item, size = 150 }: { item: QRItem; size?: number }) {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    QRCode.toDataURL(item.url, {
      width: size * 2,
      margin: 2,
      color: { dark: P, light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setDataUrl)
  }, [item.url, size])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-tld-${item.id}.png`
    a.click()
  }

  const printSingle = () => {
    if (!dataUrl) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head>
      <title>QR — ${item.label}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Manrope',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
        .card{width:290px;padding:28px 22px;border:2.5px solid ${P};border-radius:16px;text-align:center}
        .brand{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${S};margin-bottom:6px}
        .label{font-size:24px;font-weight:700;color:${P};margin-bottom:3px}
        .sub{font-size:11px;color:#74777f;margin-bottom:18px}
        img{width:200px;height:200px;margin:0 auto 14px;display:block}
        .url{font-size:8px;color:#9ca3af;word-break:break-all;margin-bottom:14px}
        .footer{padding-top:12px;border-top:1px solid #f0f0f0;font-size:9px;color:#9ca3af}
      </style>
    </head><body>
      <div class="card">
        <div class="brand">The Little Dominican</div>
        <div class="label">${item.label}</div>
        <div class="sub">${item.sub}</div>
        <img src="${dataUrl}" alt="${item.label}"/>
        <div class="url">${item.url}</div>
        <div class="footer">315 E Water St, Elmira, NY · (607) 215-0990</div>
      </div>
      <script>window.onload=()=>window.print()</script>
    </body></html>`)
    w.document.close()
  }

  const ready = !!dataUrl

  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: '1.25rem',
      border: '1px solid #f0f1f2', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '10px',
      boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,25,60,.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.04)')}
    >
      {/* QR image */}
      <div style={{
        width: size, height: size, background: '#f3f4f5', borderRadius: '10px',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {ready
          ? <img src={dataUrl} alt={item.label} style={{ width: '100%', height: '100%' }} />
          : <span style={{ fontSize: '2rem' }}>{item.icon}</span>
        }
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <p className="tld-serif" style={{ fontSize: '.95rem', fontWeight: 700, color: P, lineHeight: 1.2 }}>
          {item.label}
        </p>
        <p style={{ fontSize: '.68rem', color: '#74777f', marginTop: '2px' }}>{item.sub}</p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
        <button
          onClick={download}
          disabled={!ready}
          style={{
            flex: 1, padding: '7px 0', borderRadius: '9999px',
            border: `1.5px solid ${P}`, background: 'transparent', color: P,
            fontFamily: 'Manrope,sans-serif', fontSize: '.7rem', fontWeight: 700,
            cursor: ready ? 'pointer' : 'not-allowed', opacity: ready ? 1 : .5,
          }}
        >
          ↓ PNG
        </button>
        <button
          onClick={printSingle}
          disabled={!ready}
          style={{
            flex: 1, padding: '7px 0', borderRadius: '9999px',
            border: 'none', background: P, color: '#fff',
            fontFamily: 'Manrope,sans-serif', fontSize: '.7rem', fontWeight: 700,
            cursor: ready ? 'pointer' : 'not-allowed', opacity: ready ? 1 : .5,
          }}
        >
          🖨 Print
        </button>
      </div>
    </div>
  )
}

// ─── Print-all tables ─────────────────────────────────────────────────────────

function PrintAllBtn({ items, label }: { items: QRItem[]; label: string }) {
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      const cards = await Promise.all(items.map(async item => ({
        item,
        url: await QRCode.toDataURL(item.url, {
          width: 400, margin: 2, color: { dark: P, light: '#fff' }, errorCorrectionLevel: 'M',
        }),
      })))

      const w = window.open('', '_blank')
      if (!w) return

      const html = cards.map(({ item, url }) => `
        <div class="card">
          <div class="brand">The Little Dominican</div>
          <div class="label">${item.label}</div>
          <div class="sub">${item.sub}</div>
          <img src="${url}" alt="${item.label}"/>
          <div class="footer">315 E Water St, Elmira, NY · (607) 215-0990</div>
        </div>`).join('')

      w.document.write(`<!DOCTYPE html><html><head>
        <title>${label} — The Little Dominican</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Manrope',sans-serif;background:#fff;padding:20px}
          .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
          .card{border:2px solid ${P};border-radius:14px;padding:18px 14px;text-align:center;page-break-inside:avoid}
          .brand{font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${S};margin-bottom:4px}
          .label{font-size:18px;font-weight:700;color:${P};margin-bottom:2px}
          .sub{font-size:10px;color:#74777f;margin-bottom:12px}
          img{width:150px;height:150px;margin:0 auto 10px;display:block}
          .footer{padding-top:8px;border-top:1px solid #f0f0f0;font-size:8px;color:#9ca3af}
          @media print{.grid{gap:14px}}
        </style>
      </head><body>
        <div class="grid">${html}</div>
        <script>window.onload=()=>window.print()</script>
      </body></html>`)
      w.document.close()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={run}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 22px', borderRadius: '9999px', border: 'none',
        background: P, color: '#fff',
        fontFamily: 'Manrope,sans-serif', fontSize: '.82rem', fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
        transition: 'opacity .15s',
      }}
    >
      <span className="ms ms-sm">print</span>
      {loading ? 'Generando PDF...' : label}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QRPage() {
  const [tab, setTab] = useState<Tab>('mesas')

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'mesas',    icon: 'table_restaurant', label: 'Mesas' },
    { key: 'redes',    icon: 'share',             label: 'Redes & Flyers' },
    { key: 'imprimir', icon: 'print',             label: 'Kit Impresión' },
  ]

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.25em', textTransform: 'uppercase', color: S, marginBottom: '6px' }}>
            Marketing Digital
          </p>
          <h2 className="tld-serif" style={{ fontSize: '2.6rem', fontWeight: 300, color: P, lineHeight: 1.1, letterSpacing: '-.02em' }}>
            Códigos QR<br /><span style={{ fontWeight: 700 }}>Personalizados</span>
          </h2>
          <p style={{ fontSize: '.82rem', color: '#74777f', marginTop: '8px', fontWeight: 300 }}>
            QR con tu marca · Listos para imprimir · Sin app necesaria
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '4px', background: '#f3f4f5', padding: '4px', borderRadius: '9999px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '9999px', border: 'none',
              fontFamily: 'Manrope,sans-serif', fontSize: '.78rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all .2s',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? P : '#9ca3af',
              boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
            }}>
              <span className="ms ms-sm">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MESAS ── */}
      {tab === 'mesas' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '.82rem', color: '#74777f', maxWidth: '520px', fontWeight: 300 }}>
              Cada QR lleva al menú digital pre-configurado para esa mesa. El cliente escanea con la cámara del móvil — sin app.
            </p>
            <PrintAllBtn items={TABLE_ITEMS} label={`Imprimir todas (${TABLES} mesas)`} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {TABLE_ITEMS.map(item => <QRCard key={item.id} item={item} size={130} />)}
          </div>
        </div>
      )}

      {/* ── REDES & FLYERS ── */}
      {tab === 'redes' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '.82rem', color: '#74777f', maxWidth: '520px', fontWeight: 300 }}>
              Usa estos QR en flyers, menús impresos, tarjetas de visita y publicaciones de redes sociales.
            </p>
            <PrintAllBtn items={SOCIAL_ITEMS} label="Imprimir todos" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {SOCIAL_ITEMS.map(item => <QRCard key={item.id} item={item} size={160} />)}
          </div>
        </div>
      )}

      {/* ── KIT IMPRESIÓN ── */}
      {tab === 'imprimir' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Dark card — summary */}
          <div style={{ background: P, borderRadius: '16px', padding: '2rem', color: '#fff', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: '8px' }}>
                Kit de Impresión
              </p>
              <h3 className="tld-serif" style={{ fontSize: '1.8rem', fontWeight: 300, lineHeight: 1.15, marginBottom: '.25rem' }}>
                Todo listo<br /><span style={{ fontWeight: 700 }}>para imprimir</span>
              </h3>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                `${TABLES} QR de mesas — 3 por página`,
                '6 QR de redes sociales y flyers',
                'Diseño con marca TLD en cada tarjeta',
                'Resolución 2× — nítido en cualquier impresora',
                'Dirección y teléfono incluidos en cada QR',
              ].map((t, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '.84rem', fontWeight: 300 }}>
                  <span style={{ width: '22px', height: '22px', background: 'rgba(255,255,255,.12)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="ms ms-sm" style={{ color: '#fff', fontSize: '12px' }}>check</span>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '.5rem', borderTop: '1px solid rgba(255,255,255,.1)' }}>
              <PrintAllBtn items={TABLE_ITEMS} label={`Mesas (${TABLES})`} />
              <PrintAllBtn items={SOCIAL_ITEMS} label="Redes & Flyers" />
            </div>
          </div>

          {/* Instructions */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #f0f1f2', boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
            <h3 className="tld-serif" style={{ fontSize: '1.4rem', fontWeight: 700, color: P, marginBottom: '1.5rem' }}>
              Cómo implementarlos
            </h3>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', listStyle: 'none', padding: 0 }}>
              {[
                { n: '01', t: 'Descarga o imprime',    d: 'Clic en "🖨 Print" en cualquier QR, o usa los botones de este panel para imprimir en lote.' },
                { n: '02', t: 'Coloca en la mesa',     d: 'Usa un soporte de acrílico, porta-menú o lamina el QR y pégalo en la mesa o pared.' },
                { n: '03', t: 'Cliente escanea',        d: 'Abre la cámara del móvil, apunta al QR y el menú se abre al instante. Sin app necesaria.' },
                { n: '04', t: 'Orden y pago',           d: 'Desde el menú digital puede agregar platos al carrito y confirmar la orden fácilmente.' },
              ].map(s => (
                <li key={s.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '30px', height: '30px', background: '#f3f4f5', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.62rem', fontWeight: 800, color: S, flexShrink: 0, letterSpacing: '.05em',
                  }}>
                    {s.n}
                  </span>
                  <div>
                    <p style={{ fontWeight: 700, color: P, fontSize: '.85rem', marginBottom: '3px' }}>{s.t}</p>
                    <p style={{ fontSize: '.78rem', color: '#74777f', fontWeight: 300, lineHeight: 1.6 }}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
