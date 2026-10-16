'use client';

// Campo de búsqueda del catálogo (con ✕ para borrar). Independiente de las pestañas de categoría.
// Compartido entre plantillas de pedido; los colores llegan por props.
export function CatalogSearchInput({
  value,
  onChange,
  onClear,
  placeholder,
  clearLabel,
  surface,
  border,
  muted,
  ink,
}: {
  value: string;
  onChange: (next: string) => void;
  onClear: () => void;
  placeholder: string;
  clearLabel: string;
  surface: string;
  border: string;
  muted: string;
  ink: string;
}) {
  const active = value.trim().length > 0;
  return (
    <div className="mx-auto max-w-public-content" style={{ padding: '20px 24px 0' }}>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '15px',
            color: muted,
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            fontSize: '14px',
            borderRadius: '12px',
            border: `1px solid ${border}`,
            backgroundColor: surface,
            color: ink,
            outline: 'none',
          }}
        />
        {active && (
          <button
            type="button"
            onClick={onClear}
            aria-label={clearLabel}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: muted,
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
