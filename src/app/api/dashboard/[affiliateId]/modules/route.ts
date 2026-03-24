// API: PUT /api/dashboard/[affiliateId]/modules
// Reads/writes src/data/modules-override.json to toggle modules at runtime.
// When enabling a module that has no route page yet, generates a placeholder page.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { getAffiliateConfig } from '@/config/affiliates-config'
import { MODULE_NAV_CONFIG } from '@/lib/affiliate-branding'

const OVERRIDE_PATH = path.join(process.cwd(), 'src', 'data', 'modules-override.json')
const DASHBOARD_DIR = path.join(process.cwd(), 'src', 'app', 'dashboard', '[affiliateId]')

type ModuleOverrides = Record<string, Record<string, boolean>>

function readOverrides(): ModuleOverrides {
  try {
    return JSON.parse(fs.readFileSync(OVERRIDE_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function writeOverrides(data: ModuleOverrides) {
  fs.writeFileSync(OVERRIDE_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

/** Generate a placeholder page for a newly-activated module */
function generateModulePage(moduleName: string) {
  const moduleCfg = MODULE_NAV_CONFIG[moduleName]
  if (!moduleCfg) return

  const moduleDir = path.join(DASHBOARD_DIR, moduleName)
  const pagePath = path.join(moduleDir, 'page.tsx')

  if (fs.existsSync(pagePath)) return // already exists

  fs.mkdirSync(moduleDir, { recursive: true })

  const label = moduleCfg.label
  const icon = moduleCfg.icon

  const content = `'use client'

import { useAffiliate } from '@/contexts/AffiliateContext'

/**
 * Módulo: ${label}
 * Generado automáticamente al activar el módulo desde Configuración.
 * Reemplaza este archivo con la implementación real del módulo.
 */
export default function ${label.replace(/\s+/g, '')}Page() {
  const { brandName } = useAffiliate()

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '2.5rem' }}>${icon}</span>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            ${label}
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>{brandName}</p>
        </div>
      </div>
      <div style={{
        background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px',
        padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '12px'
      }}>
        <span style={{ fontSize: '1.5rem' }}>✅</span>
        <div>
          <p style={{ fontWeight: 600, color: '#15803d', margin: '0 0 4px' }}>
            Módulo activado correctamente
          </p>
          <p style={{ color: '#166534', fontSize: '.875rem', margin: 0 }}>
            Este módulo fue generado automáticamente. Reemplaza esta página con
            la implementación completa de ${label}.
          </p>
        </div>
      </div>
    </div>
  )
}
`
  fs.writeFileSync(pagePath, content, 'utf-8')
}

// ── GET: returns merged module state for affiliate ──────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> }
) {
  const { affiliateId } = await params
  const config = getAffiliateConfig(affiliateId)
  if (!config) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })

  const overrides = readOverrides()
  const affOverrides = overrides[affiliateId] ?? {}
  const merged = { ...config.modules, ...affOverrides }

  return NextResponse.json({ affiliateId, modules: merged })
}

// ── PUT: toggle a module ─────────────────────────────────────────────────────
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> }
) {
  // Admin-only
  const cookieStore = await cookies()
  const role = cookieStore.get('user_role')?.value
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const { affiliateId } = await params
  const config = getAffiliateConfig(affiliateId)
  if (!config) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })

  const { module: moduleName, enabled } = await req.json() as { module: string; enabled: boolean }

  if (!(moduleName in config.modules)) {
    return NextResponse.json({ error: `Unknown module: ${moduleName}` }, { status: 400 })
  }

  // Update overrides
  const overrides = readOverrides()
  if (!overrides[affiliateId]) overrides[affiliateId] = {}
  overrides[affiliateId][moduleName] = enabled
  writeOverrides(overrides)

  // If enabling, generate placeholder page if needed
  let pageGenerated = false
  if (enabled) {
    const pagePath = path.join(DASHBOARD_DIR, moduleName, 'page.tsx')
    if (!fs.existsSync(pagePath)) {
      generateModulePage(moduleName)
      pageGenerated = true
    }
  }

  const merged = { ...config.modules, ...overrides[affiliateId] }

  return NextResponse.json({
    success: true,
    affiliateId,
    module: moduleName,
    enabled,
    pageGenerated,
    modules: merged,
  })
}
