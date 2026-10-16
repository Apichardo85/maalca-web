'use client';

// Navegación inferior de 4 pestañas (solo móvil): Inicio · catálogo · pedido · Info. Compartida entre
// plantillas de pedido. Las anclas (#top, #<catalogAnchorId>, #info) deben existir en la plantilla.
export function PublicBottomNav({
  cartCount,
  accent,
  onAccent,
  surface,
  border,
  muted,
  ink,
  onOpenCart,
  getText,
  catalogLabel = { es: 'Menú', en: 'Menu' },
  cartLabel = { es: 'Pedido', en: 'Order' },
  catalogAnchorId = 'menu',
}: {
  cartCount: number;
  accent: string;
  onAccent: string;
  surface: string;
  border: string;
  muted: string;
  ink: string;
  onOpenCart: () => void;
  getText: (es: string, en: string) => string;
  catalogLabel?: { es: string; en: string };
  cartLabel?: { es: string; en: string };
  catalogAnchorId?: string;
}) {
  const go = (id: string) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const itemStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    minHeight: '44px',
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: '11px',
    fontWeight: 500,
    color: muted,
    textDecoration: 'none',
    cursor: 'pointer',
  };
  const icon = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  return (
    <nav
      aria-label={getText('Navegación principal', 'Main navigation')}
      className="@public-sm:hidden fixed bottom-0 left-0 right-0"
      style={{ zIndex: 80, backgroundColor: surface, borderTop: `1px solid ${border}`, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div style={{ height: '64px', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <a href="#top" onClick={go('top')} style={itemStyle}>
          <svg {...icon}><path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" /></svg>
          {getText('Inicio', 'Home')}
        </a>
        <a href={`#${catalogAnchorId}`} onClick={go(catalogAnchorId)} style={itemStyle}>
          <svg {...icon}><path d="M6 5h12M6 10h12M6 15h12M6 20h8" /></svg>
          {getText(catalogLabel.es, catalogLabel.en)}
        </a>
        <button type="button" onClick={onOpenCart} style={{ ...itemStyle, position: 'relative', color: cartCount > 0 ? ink : muted }}>
          <svg {...icon}><path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
          {getText(cartLabel.es, cartLabel.en)}
          {cartCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                left: 'calc(50% + 6px)',
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                borderRadius: '9999px',
                backgroundColor: accent,
                color: onAccent,
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
        <a href="#info" onClick={go('info')} style={itemStyle}>
          <svg {...icon}><path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>
          {getText('Info', 'Info')}
        </a>
      </div>
    </nav>
  );
}
