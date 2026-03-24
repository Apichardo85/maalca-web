"use client";

import { useState, useTransition } from "react";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { AffiliateConfig } from "@/config/affiliates-config";
import { MODULE_NAV_CONFIG } from "@/lib/affiliate-branding";

// ─── Types ─────────────────────────────────────────────────────────────────

type ModuleKey = keyof AffiliateConfig['modules']

interface ModuleState {
  [module: string]: boolean
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  multiLanguage: 'Multi-idioma',
  darkMode:      'Modo Oscuro',
  notifications: 'Notificaciones',
  analytics:     'Analytics Avanzado',
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { config, brandName, isAdmin } = useAffiliate();

  // Build initial module state from config
  const initialModules: ModuleState = Object.fromEntries(
    Object.entries(config?.modules ?? {}).map(([k, v]) => [k, v])
  )

  const [modules, setModules] = useState<ModuleState>(initialModules)
  const [generating, setGenerating] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // ── Not admin: read-only view ──────────────────────────────────────────

  if (!isAdmin) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          Configuración
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Información de {brandName}
        </p>
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px',
          padding: '1rem 1.25rem', display: 'flex', gap: '10px', alignItems: 'flex-start',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔒</span>
          <p style={{ margin: 0, color: '#92400e', fontSize: '.875rem' }}>
            Solo los administradores de MaalCa pueden modificar la configuración de módulos.
          </p>
        </div>
        <InfoSection config={config} />
      </div>
    )
  }

  // ── Admin: full settings with module toggles ───────────────────────────

  async function handleToggle(moduleName: string, newState: boolean) {
    if (!config) return
    setError(null)

    if (newState) setGenerating(moduleName)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/dashboard/${config.id}/modules`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ module: moduleName, enabled: newState }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Error al actualizar módulo')
          return
        }

        setModules(data.modules)
        if (data.pageGenerated) {
          setLastGenerated(moduleName)
          setTimeout(() => setLastGenerated(null), 5000)
        }
      } catch {
        setError('Error de conexión al actualizar módulo')
      } finally {
        setGenerating(null)
      }
    })
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
          Configuración del Sistema
        </h1>
        <p style={{ color: '#6b7280' }}>
          Administra los módulos activos de <strong>{brandName}</strong>
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px',
          padding: '1rem 1.25rem', display: 'flex', gap: '10px', alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <span>⚠️</span>
          <p style={{ margin: 0, color: '#dc2626', fontSize: '.875rem' }}>{error}</p>
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1.2rem' }}
          >×</button>
        </div>
      )}

      {/* Generated banner */}
      {lastGenerated && MODULE_NAV_CONFIG[lastGenerated] && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px',
          padding: '1rem 1.25rem', display: 'flex', gap: '10px', alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <span>✅</span>
          <p style={{ margin: 0, color: '#15803d', fontSize: '.875rem' }}>
            Ruta <code style={{ background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
              /dashboard/{config?.id}/{MODULE_NAV_CONFIG[lastGenerated].path}
            </code> generada automáticamente.
          </p>
        </div>
      )}

      {/* Module toggles grid */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          Módulos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {Object.entries(modules).map(([moduleName, enabled]) => {
            const info = MODULE_NAV_CONFIG[moduleName]
            if (!info) return null
            const isGenerating = generating === moduleName
            const justGenerated = lastGenerated === moduleName

            return (
              <div key={moduleName} style={{
                background: '#fff',
                border: `2px solid ${enabled ? '#86efac' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'border-color .2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '.9rem' }}>
                        {info.label}
                      </p>
                      <p style={{ margin: 0, color: '#9ca3af', fontSize: '.75rem' }}>{info.desc}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '.7rem', fontWeight: 700, padding: '3px 10px',
                    borderRadius: '9999px', letterSpacing: '.05em', textTransform: 'uppercase',
                    background: enabled ? '#dcfce7' : '#f3f4f6',
                    color: enabled ? '#15803d' : '#9ca3af',
                  }}>
                    {enabled ? 'ON' : 'OFF'}
                  </span>
                </div>

                {justGenerated && (
                  <p style={{ margin: 0, fontSize: '.72rem', color: '#15803d', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>
                    Ruta generada automáticamente ✓
                  </p>
                )}

                <button
                  disabled={isGenerating || isPending}
                  onClick={() => handleToggle(moduleName as ModuleKey, !enabled)}
                  style={{
                    padding: '8px 16px', borderRadius: '9999px', border: 'none',
                    cursor: isGenerating || isPending ? 'not-allowed' : 'pointer',
                    fontWeight: 600, fontSize: '.78rem',
                    background: enabled ? '#fee2e2' : '#00193c',
                    color: enabled ? '#dc2626' : '#fff',
                    opacity: isGenerating || isPending ? .7 : 1,
                    transition: 'opacity .15s',
                    alignSelf: 'flex-start',
                  }}
                >
                  {isGenerating
                    ? '⏳ Generando ruta...'
                    : enabled ? 'Desactivar' : 'Activar'
                  }
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Business info (read-only) */}
      <InfoSection config={config} />
    </div>
  )
}

// ─── InfoSection ────────────────────────────────────────────────────────────

function InfoSection({ config }: { config: AffiliateConfig | null }) {
  if (!config) return null

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1px solid #e5e7eb', borderRadius: '8px',
    background: '#f9fafb', color: '#374151',
    fontSize: '.875rem', fontFamily: 'inherit',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Branding */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          Información del Negocio
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Nombre',          value: config.branding.name        },
            { label: 'Descripción',     value: config.branding.description },
            { label: 'Color Primario',  value: config.branding.primaryColor },
            { label: 'Moneda',          value: config.settings.currency    },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                {f.label}
              </label>
              <input type="text" value={f.value} readOnly style={fieldStyle} />
            </div>
          ))}
        </div>
        <p style={{ marginTop: '12px', fontSize: '.78rem', color: '#6b7280' }}>
          ℹ️ La información del negocio se gestiona desde <code>src/config/affiliates-config.ts</code>
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          Características
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(config.features).map(([feature, enabled]) => (
            <div key={feature} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: '10px',
              background: enabled ? '#f0fdf4' : '#f9fafb',
              border: `1px solid ${enabled ? '#86efac' : '#e5e7eb'}`,
            }}>
              <span style={{ fontSize: '.875rem', fontWeight: 500, color: '#374151' }}>
                {FEATURE_LABELS[feature] ?? feature}
              </span>
              <span style={{
                fontSize: '.68rem', fontWeight: 700, padding: '2px 8px',
                borderRadius: '9999px', textTransform: 'uppercase',
                background: enabled ? '#dcfce7' : '#e5e7eb',
                color: enabled ? '#15803d' : '#9ca3af',
              }}>
                {enabled ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Regional */}
      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          Configuración Regional
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Zona Horaria',    value: config.settings.timezone   },
            { label: 'Formato Fecha',   value: config.settings.dateFormat  },
            { label: 'Moneda',          value: config.settings.currency    },
          ].map(f => (
            <div key={f.label}>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                {f.label}
              </label>
              <input type="text" value={f.value} readOnly style={fieldStyle} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
