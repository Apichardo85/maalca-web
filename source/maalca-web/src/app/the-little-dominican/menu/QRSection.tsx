'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

// ─── Config ──────────────────────────────────────────────────────────────────

const BRAND = { name: 'The Little Dominican', primary: '#00193c', accent: '#e12531' }
const BASE_URL = 'https://thelittledominican.com'
const TABLE_COUNT = 12

type QRTab = 'mesas' | 'redes' | 'impresion'

interface QRItem {
  id: string
  label: string
  sublabel: string
  url: string
  icon: string
}

// ─── QR Items ────────────────────────────────────────────────────────────────

const TABLE_QRS: QRItem[] = Array.from({ length: TABLE_COUNT }, (_, i) => ({
  id: `table-${i + 1}`,
  label: `Mesa ${i + 1}`,
  sublabel: 'Menú digital',
  url: `${BASE_URL}/menu?mesa=${i + 1}`,
  icon: '🍽',
}))

const SOCIAL_QRS: QRItem[] = [
  {
    id: 'main-menu',
    label: 'Menú Digital',
    sublabel: 'thelittledominican.com/menu',
    url: `${BASE_URL}/menu`,
    icon: '📋',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    sublabel: '@thelittledominican',
    url: 'https://instagram.com/thelittledominican',
    icon: '📸',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    sublabel: 'The Little Dominican',
    url: 'https://facebook.com/thelittledominican',
    icon: '👥',
  },
  {
    id: 'reservar',
    label: 'Reservaciones',
    sublabel: 'Reserva tu mesa',
    url: `${BASE_URL}/#reservar`,
    icon: '📅',
  },
  {
    id: 'flyer-takeout',
    label: 'Takeout / Delivery',
    sublabel: 'Ordena para llevar',
    url: `${BASE_URL}/menu?modo=takeout`,
    icon: '🥡',
  },
  {
    id: 'flyer-catering',
    label: 'Catering',
    sublabel: 'Eventos y catering',
    url: `${BASE_URL}/#catering`,
    icon: '🎉',
  },
]

// ─── Single QR card ───────────────────────────────────────────────────────────

function QRCard({ item, size = 160 }: { item: QRItem; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(item.url, {
      width: size * 2,       // 2× for retina
      margin: 2,
      color: { dark: BRAND.primary, light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(url => {
      setDataUrl(url)
    })
  }, [item.url, size])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-tld-${item.id}.png`
    a.click()
  }

  const handlePrint = () => {
    if (!dataUrl) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>QR — ${item.label} | The Little Dominican</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Manrope', sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
            .card { width: 300px; padding: 28px 24px; border: 2px solid #00193c; border-radius: 16px; text-align: center; }
            .brand { font-size: 11px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #e12531; margin-bottom: 6px; }
            .label { font-size: 22px; font-weight: 700; color: #00193c; margin-bottom: 4px; }
            .sublabel { font-size: 12px; color: #74777f; margin-bottom: 20px; }
            img { width: 200px; height: 200px; margin: 0 auto 16px; display: block; }
            .url { font-size: 9px; color: #9ca3af; word-break: break-all; }
            .footer { margin-top: 14px; padding-top: 14px; border-top: 1px solid #edeeef; font-size: 10px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">The Little Dominican</div>
            <div class="label">${item.label}</div>
            <div class="sublabel">${item.sublabel}</div>
            <img src="${dataUrl}" alt="QR ${item.label}" />
            <div class="url">${item.url}</div>
            <div class="footer">315 E Water St, Elmira, NY · (607) 215-0990</div>
          </div>
          <script>window.onload=()=>window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #edeeef',
      borderRadius: '14px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,25,60,.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* QR image */}
      <div style={{ width: size, height: size, background: '#f3f4f5', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
        {dataUrl
          ? <img src={dataUrl} alt={`QR ${item.label}`} style={{ width: '100%', height: '100%' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              {item.icon}
            </div>
        }
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1rem', fontWeight: 400, color: BRAND.primary, lineHeight: 1.2 }}>
          {item.label}
        </p>
        <p style={{ fontSize: '.7rem', color: '#74777f', marginTop: '2px' }}>{item.sublabel}</p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <button
          onClick={handleDownload}
          disabled={!dataUrl}
          style={{
            flex: 1, padding: '7px', borderRadius: '9999px', border: `1.5px solid ${BRAND.primary}`,
            background: 'transparent', color: BRAND.primary,
            fontFamily: 'Manrope, sans-serif', fontSize: '.72rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = BRAND.primary; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = BRAND.primary }}
        >
          ↓ PNG
        </button>
        <button
          onClick={handlePrint}
          disabled={!dataUrl}
          style={{
            flex: 1, padding: '7px', borderRadius: '9999px', border: 'none',
            background: BRAND.primary, color: '#fff',
            fontFamily: 'Manrope, sans-serif', fontSize: '.72rem', fontWeight: 600,
            cursor: 'pointer', transition: 'opacity .15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
        >
          🖨 Imprimir
        </button>
      </div>

      {/* hidden canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

// ─── Print-all for tables ─────────────────────────────────────────────────────

function PrintAllTables() {
  const [loading, setLoading] = useState(false)

  const handlePrintAll = async () => {
    setLoading(true)
    try {
      const cards = await Promise.all(
        TABLE_QRS.map(async item => {
          const url = await QRCode.toDataURL(item.url, {
            width: 400, margin: 2,
            color: { dark: BRAND.primary, light: '#ffffff' },
            errorCorrectionLevel: 'M',
          })
          return { item, url }
        })
      )

      const win = window.open('', '_blank')
      if (!win) return

      const cardsHtml = cards.map(({ item, url }) => `
        <div class="card">
          <div class="brand">The Little Dominican</div>
          <div class="label">${item.label}</div>
          <div class="sublabel">Escanea para ver el menú</div>
          <img src="${url}" alt="${item.label}" />
          <div class="footer">315 E Water St, Elmira, NY · (607) 215-0990</div>
        </div>
      `).join('')

      win.document.write(`
        <html>
          <head>
            <title>QR Mesas — The Little Dominican</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap');
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Manrope', sans-serif; background: #fff; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 24px; }
              .card { border: 2px solid #00193c; border-radius: 14px; padding: 20px 16px; text-align: center; page-break-inside: avoid; }
              .brand { font-size: 9px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #e12531; margin-bottom: 4px; }
              .label { font-size: 20px; font-weight: 700; color: #00193c; margin-bottom: 2px; }
              .sublabel { font-size: 11px; color: #74777f; margin-bottom: 14px; }
              img { width: 160px; height: 160px; margin: 0 auto 12px; display: block; }
              .footer { padding-top: 10px; border-top: 1px solid #edeeef; font-size: 9px; color: #9ca3af; }
              @media print { .grid { gap: 16px; padding: 16px; } }
            </style>
          </head>
          <body>
            <div class="grid">${cardsHtml}</div>
            <script>window.onload=()=>window.print()</script>
          </body>
        </html>
      `)
      win.document.close()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePrintAll}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 22px', borderRadius: '9999px', border: 'none',
        background: BRAND.primary, color: '#fff',
        fontFamily: 'Manrope, sans-serif', fontSize: '.82rem', fontWeight: 600,
        cursor: 'pointer', transition: 'opacity .15s',
        opacity: loading ? .7 : 1,
      }}
    >
      🖨 {loading ? 'Generando...' : `Imprimir todas (${TABLE_COUNT} mesas)`}
    </button>
  )
}

// ─── Main QR Section ─────────────────────────────────────────────────────────

export default function QRSection() {
  const [tab, setTab] = useState<QRTab>('mesas')

  const tabs: { key: QRTab; label: string; icon: string }[] = [
    { key: 'mesas',    label: 'Mesas',          icon: '🍽' },
    { key: 'redes',    label: 'Redes & Flyers',  icon: '📲' },
    { key: 'impresion', label: 'Impresión',       icon: '🖨' },
  ]

  const currentItems = tab === 'mesas' ? TABLE_QRS : SOCIAL_QRS

  return (
    <section style={{ background: '#f3f4f5', padding: 'clamp(3rem,5vw,4.5rem) clamp(1.5rem,5vw,5rem)', borderTop: '1px solid #edeeef' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: BRAND.accent, marginBottom: '6px' }}>
              Marketing Digital
            </div>
            <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 300, color: BRAND.primary, lineHeight: 1.1 }}>
              Códigos QR <span style={{ fontWeight: 700 }}>Personalizados</span>
            </h2>
            <p style={{ fontSize: '.85rem', color: '#74777f', marginTop: '6px', fontWeight: 300 }}>
              QR con tu marca · Listos para imprimir · Sin app necesaria
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: '6px', background: '#edeeef', padding: '4px', borderRadius: '9999px' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '9999px', border: 'none',
                  fontFamily: 'Manrope, sans-serif', fontSize: '.78rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all .2s',
                  background: tab === t.key ? '#fff' : 'transparent',
                  color: tab === t.key ? BRAND.primary : '#74777f',
                  boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
                }}
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mesas tab */}
        {tab === 'mesas' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ fontSize: '.82rem', color: '#74777f' }}>
                Cada QR lleva al menú pre-filtrado para esa mesa. El cliente escanea y ordena directamente.
              </p>
              <PrintAllTables />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
              {TABLE_QRS.map(item => <QRCard key={item.id} item={item} size={140} />)}
            </div>
          </>
        )}

        {/* Redes & Flyers tab */}
        {tab === 'redes' && (
          <>
            <p style={{ fontSize: '.82rem', color: '#74777f', marginBottom: '1.5rem' }}>
              Usa estos QR en flyers, menús impresos, tarjetas de visita y cartelería del restaurante.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
              {SOCIAL_QRS.map(item => <QRCard key={item.id} item={item} size={160} />)}
            </div>
          </>
        )}

        {/* Impresión tab */}
        {tab === 'impresion' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Print kit card */}
            <div style={{ background: BRAND.primary, borderRadius: '16px', padding: '2rem', color: '#fff' }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: '8px' }}>
                Kit de Impresión
              </div>
              <h3 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, marginBottom: '1rem', lineHeight: 1.2 }}>
                Todo lo que necesitas <span style={{ fontWeight: 700 }}>listo para imprimir</span>
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                {[
                  `${TABLE_COUNT} QR de mesas (3×3 por página)`,
                  'QR de redes sociales individuales',
                  'Diseño con marca TLD incluido',
                  'Resolución 2× para impresión nítida',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '.85rem', fontWeight: 300 }}>
                    <span style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 700, flexShrink: 0 }}>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <PrintAllTables />
            </div>

            {/* Instructions card */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', border: '1px solid #edeeef' }}>
              <h3 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: BRAND.primary, marginBottom: '1.25rem' }}>
                Cómo usar los QR
              </h3>
              <ol style={{ display: 'flex', flexDirection: 'column', gap: '14px', listStyle: 'none', padding: 0 }}>
                {[
                  { step: '01', title: 'Descarga o imprime', desc: 'Haz clic en "Imprimir" en cualquier QR o usa "Imprimir todas" para las mesas.' },
                  { step: '02', title: 'Coloca en tu mesa', desc: 'Usa un soporte de acrilico o pega el QR directamente en la mesa/pared.' },
                  { step: '03', title: 'Cliente escanea', desc: 'El cliente abre la cámara del móvil y ve el menú al instante. Sin app.' },
                  { step: '04', title: 'Ordena y paga', desc: 'Desde el menú digital puede agregar al carrito y confirmar la orden.' },
                ].map(s => (
                  <li key={s.step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '28px', height: '28px', background: '#f3f4f5', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.65rem', fontWeight: 700, color: BRAND.accent, flexShrink: 0,
                    }}>
                      {s.step}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, color: BRAND.primary, fontSize: '.85rem', marginBottom: '2px' }}>{s.title}</p>
                      <p style={{ fontSize: '.78rem', color: '#74777f', fontWeight: 300, lineHeight: 1.5 }}>{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
