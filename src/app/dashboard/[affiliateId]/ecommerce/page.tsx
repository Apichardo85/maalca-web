'use client'

import { useAffiliate } from '@/contexts/AffiliateContext'

/**
 * Módulo: Tienda
 * Generado automáticamente al activar el módulo desde Configuración.
 * Reemplaza este archivo con la implementación real del módulo.
 */
export default function TiendaPage() {
  const { brandName } = useAffiliate()

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '2.5rem' }}>🛍️</span>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Tienda
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
            la implementación completa de Tienda.
          </p>
        </div>
      </div>
    </div>
  )
}
