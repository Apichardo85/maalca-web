'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'

// ─── Shared CSS ───────────────────────────────────────────────────────────────

const TLD_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block');
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,700;1,6..72,300;1,6..72,400&family=Manrope:wght@300;400;500;600;700&display=swap');

  .ms {
    font-family: 'Material Symbols Outlined';
    font-style: normal; font-weight: normal;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-block; line-height: 1; letter-spacing: normal;
    text-transform: none; white-space: nowrap; user-select: none;
    word-wrap: normal; font-size: 20px;
  }
  .ms-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .ms-sm   { font-size: 16px; }
  .ms-lg   { font-size: 28px; }
  .ms-xl   { font-size: 36px; }

  .tld-db      { font-family: 'Manrope', system-ui, sans-serif; }
  .tld-serif   { font-family: 'Newsreader', Georgia, serif; }

  /* Nav */
  .tld-nav-active { color: #00193c; font-weight: 700; border-right: 3px solid #e12531; background: #fff; }
  .tld-nav-item   { transition: background .15s, color .15s; color: #6b7280; font-weight: 500; }
  .tld-nav-item:hover { background: rgba(255,255,255,.6); color: #1e3a5f; }

  /* Animations */
  .tld-pulse  { animation: tld-blink 1.5s ease-in-out infinite; }
  @keyframes tld-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }

  .tld-spin   { animation: tld-rotate 3s linear infinite; }
  @keyframes tld-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* Editorial helpers */
  .tld-shadow { box-shadow: 0 20px 40px rgba(25,28,29,.06); }

  /* Table row hover */
  .tld-tr:hover td { background: rgba(0,25,60,.025); }

  .tld-db-hamburger {
    display: none; background: none; border: none; cursor: pointer;
    padding: 4px 8px; font-size: 1.3rem; color: #00193c; line-height: 1;
    align-items: center;
  }
  @media(max-width: 768px) {
    .tld-sidebar { transform: translateX(-100%); transition: transform .25s ease; }
    .tld-sidebar-open { transform: translateX(0); }
    .tld-main    { margin-left: 0 !important; }
    .tld-db-hamburger { display: flex; }
  }
`

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { icon: 'dashboard',                   label: 'Dashboard',   href: '/dashboard/the-little-dominican'           },
  { icon: 'restaurant_menu',             label: 'Menú',        href: '/dashboard/the-little-dominican/menu'      },
  { icon: 'receipt_long',                label: 'Órdenes',     href: '/dashboard/the-little-dominican/orders'    },
  { icon: 'group',                       label: 'Clientes',    href: '/dashboard/the-little-dominican/customers' },
  { icon: 'inventory_2',                 label: 'Inventario',  href: '/dashboard/the-little-dominican/inventory' },
  { icon: 'analytics',                   label: 'Analytics',   href: '/dashboard/the-little-dominican/metrics'   },
  { icon: 'payments',                    label: 'Facturación', href: '/dashboard/the-little-dominican/invoicing'  },
  { icon: 'featured_seasonal_and_gifts', label: 'Gift Cards',  href: '/dashboard/the-little-dominican/giftcards' },
  { icon: 'campaign',                    label: 'Campañas',    href: '/dashboard/the-little-dominican/campaigns' },
  { icon: 'qr_code_2',                   label: 'QR Codes',    href: '/dashboard/the-little-dominican/qr'        },
]

const PAGE_TITLES: Record<string, { title: string; live?: boolean }> = {
  '/dashboard/the-little-dominican':            { title: 'Admin Suite'            },
  '/dashboard/the-little-dominican/menu':       { title: 'Menu Management'        },
  '/dashboard/the-little-dominican/orders':     { title: 'Live Orders Monitor', live: true },
  '/dashboard/the-little-dominican/customers':  { title: 'Customer Directory'     },
  '/dashboard/the-little-dominican/inventory':  { title: 'Inventory'              },
  '/dashboard/the-little-dominican/metrics':    { title: 'Analytics'              },
  '/dashboard/the-little-dominican/invoicing':  { title: 'Facturación'            },
  '/dashboard/the-little-dominican/giftcards':  { title: 'Gift Cards'             },
  '/dashboard/the-little-dominican/campaigns':  { title: 'Campaigns'              },
  '/dashboard/the-little-dominican/qr':         { title: 'QR Codes'               },
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TLDDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const page = PAGE_TITLES[pathname] ?? { title: 'Admin Suite' }
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <style>{TLD_CSS}</style>

      <div className="tld-db" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>

        {/* ── SIDEBAR BACKDROP (mobile) ───────────────────────────── */}
        {navOpen && (
          <div
            onClick={() => setNavOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 39,
              background: 'rgba(0,15,35,.35)',
              backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside className={`tld-sidebar${navOpen ? ' tld-sidebar-open' : ''}`} style={{
          position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 40,
          width: '280px', background: '#f9fafb',
          borderRight: '1px solid #f0f0f0',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Brand */}
          <div style={{ padding: '2rem 2rem 1.25rem' }}>
            <Link href="/the-little-dominican" style={{ textDecoration: 'none' }}>
              <h1 className="tld-serif" style={{ fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 400, color: '#00193c', lineHeight: 1.2, marginBottom: '4px' }}>
                Little Dominicana
              </h1>
            </Link>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#9ca3af' }}>
              Admin Suite
            </p>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0 1rem', overflowY: 'auto' }}>
            {NAV.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className={`tld-nav-item ${isActive ? 'tld-nav-active' : ''}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 16px',
                    borderRadius: isActive ? 0 : '8px',
                    textDecoration: 'none',
                    fontSize: '.84rem', letterSpacing: '.02em',
                    marginBottom: '2px',
                  }}
                >
                  <span className={`ms ${isActive ? 'ms-fill' : ''}`}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* CTA */}
          <div style={{ padding: '1.5rem' }}>
            <button style={{
              width: '100%', background: '#00193c', color: '#fff',
              padding: '13px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
              fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '.82rem', letterSpacing: '.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <span className="ms ms-sm">add</span> Nueva Orden
            </button>
            <Link href="/the-little-dominican" style={{ display: 'block', textAlign: 'center', marginTop: '8px', fontSize: '.7rem', color: '#9ca3af', textDecoration: 'none' }}>
              ← Sitio público
            </Link>
          </div>
        </aside>

        {/* ── MAIN ──────────────────────────────────────────────────── */}
        <div className="tld-main" style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── TOP HEADER ── */}
          <header style={{
            position: 'sticky', top: 0, zIndex: 30, height: '64px', padding: '0 2rem',
            background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #f0f1f2',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="tld-db-hamburger" onClick={() => setNavOpen(o => !o)} aria-label="Abrir menú">
                {navOpen ? '✕' : '☰'}
              </button>
              <span className="tld-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00193c', fontStyle: 'italic' }}>
                {page.title}
              </span>
              {page.live && (
                <span className="tld-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <span className="ms ms-sm" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>search</span>
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  style={{
                    background: '#e7e8e9', border: 'none', borderRadius: '9999px',
                    padding: '7px 16px 7px 34px',
                    fontFamily: 'Manrope,sans-serif', fontSize: '.7rem',
                    fontWeight: 600, letterSpacing: '.1em', color: '#374151',
                    outline: 'none', width: '100%', maxWidth: '200px',
                  }}
                />
              </div>

              {/* Icon buttons */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {['notifications', 'settings', 'help'].map(icon => (
                  <button key={icon} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '6px', borderRadius: '8px', color: '#9ca3af',
                    display: 'flex', transition: 'color .15s',
                  }}>
                    <span className="ms">{icon}</span>
                  </button>
                ))}
              </div>

              {/* Avatar */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#d7e2ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '.78rem', color: '#00193c', flexShrink: 0,
              }}>TL</div>
            </div>
          </header>

          {/* ── PAGE CONTENT ── */}
          {children}
        </div>
      </div>
    </>
  )
}
