'use client';

import { formatPrice } from '@/lib/currency';
import type { PublicTemplateProps } from '@/lib/templates/registry';

// Barra flotante "Ver pedido" (móvil: sobre la navegación inferior; escritorio: esquina inferior
// derecha). Compartida entre plantillas de pedido (Restaurant, Retail). Los colores llegan por props
// porque cada plantilla tiene su propio juego de variables (--rt-*, --rl-*).
export function PublicCartBar({
  count,
  total,
  currency,
  accent,
  onAccent,
  inkSurface,
  hidden,
  onOpen,
  getText,
}: {
  count: number;
  total: number;
  currency: PublicTemplateProps['business']['currency'];
  accent: string;
  onAccent: string;
  inkSurface: string;
  hidden: boolean;
  onOpen: () => void;
  getText: (es: string, en: string) => string;
}) {
  if (count === 0 || hidden) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={getText(`Ver pedido: ${count} ${count === 1 ? 'artículo' : 'artículos'}`, `View order: ${count} ${count === 1 ? 'item' : 'items'}`)}
      className="fixed left-3 right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+76px)] @public-sm:left-auto @public-sm:right-6 @public-sm:bottom-6 @public-sm:w-[380px]"
      style={{
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '56px',
        padding: '0 18px',
        border: 'none',
        borderRadius: '14px',
        backgroundColor: inkSurface,
        color: '#ffffff',
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: '15px',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,.25)',
      }}
    >
      <span
        style={{
          minWidth: '26px',
          height: '26px',
          padding: '0 6px',
          borderRadius: '9999px',
          backgroundColor: accent,
          color: onAccent,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {count}
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>{getText('Ver pedido', 'View order')}</span>
      <span>{formatPrice(total, currency)}</span>
    </button>
  );
}
