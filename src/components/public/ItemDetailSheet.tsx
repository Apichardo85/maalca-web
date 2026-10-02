'use client';

// Detalle de un plato/producto al tocarlo en la página pública: foto grande, nombre, descripción
// completa, etiquetas, disponibilidad y control de cantidad. Hoja inferior en móvil, tarjeta
// centrada en pantallas grandes. Compartido por Restaurant y Retail.

import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  name: string;
  description?: string | null;
  priceLabel?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  /** Etiquetas ya listas para mostrar (⭐ Destacado, 🌱 Vegetariano…). */
  tags?: string[];
  /** Si el item no está disponible hoy: texto ("Solo martes") y se oculta el botón de agregar. */
  unavailableLabel?: string | null;
  /** Horario/periodos en texto (p. ej. "Desayuno · lun–sáb"). */
  availabilityLabel?: string | null;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  accent: string;
  onAccent?: string;
  textColor?: string;
  mutedColor?: string;
  language: 'es' | 'en';
}

export function ItemDetailSheet({
  open,
  onClose,
  name,
  description,
  priceLabel,
  imageUrl,
  category,
  tags = [],
  unavailableLabel,
  availabilityLabel,
  qty,
  onAdd,
  onRemove,
  accent,
  onAccent = '#ffffff',
  textColor = '#1f1a14',
  mutedColor = '#6b6257',
  language,
}: Props) {
  const t = (es: string, en: string) => (language === 'es' ? es : en);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const btn = (label: string, onClick: () => void, filled: boolean) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: 'none',
        fontSize: 20,
        fontWeight: 700,
        cursor: 'pointer',
        backgroundColor: filled ? accent : 'rgba(0,0,0,0.07)',
        color: filled ? onAccent : textColor,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '20px 20px 0 0',
          position: 'relative',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('Cerrar', 'Close')}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            width: 36,
            height: 36,
            borderRadius: 9999,
            border: 'none',
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            fontSize: 18,
            cursor: 'pointer',
            color: '#1f1a14',
          }}
        >
          ✕
        </button>

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            style={{ display: 'block', width: '100%', maxHeight: '45vh', objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
          />
        )}

        <div style={{ padding: imageUrl ? '16px 20px 8px' : '28px 20px 8px' }}>
          {category && (
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: mutedColor }}>
              {category}
            </p>
          )}
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.25, color: textColor, paddingRight: imageUrl ? 0 : 40 }}>
            {name}
          </h2>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {tags.map((tag) => (
                <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 9999, background: 'rgba(0,0,0,0.06)', color: textColor }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          {description ? (
            <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.6, color: mutedColor, whiteSpace: 'pre-line' }}>{description}</p>
          ) : null}
          {availabilityLabel && (
            <p style={{ margin: '12px 0 0', fontSize: 12, color: mutedColor }}>🕒 {availabilityLabel}</p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 20px 4px',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: textColor }}>{priceLabel ?? ''}</span>
          {unavailableLabel ? (
            <span style={{ fontSize: 13, fontWeight: 600, color: mutedColor, textAlign: 'right' }}>{unavailableLabel}</span>
          ) : qty === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              style={{ background: accent, color: onAccent, border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              + {t('Agregar', 'Add')}
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {btn('−', onRemove, false)}
              <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: 16, color: textColor }}>{qty}</span>
              {btn('+', onAdd, true)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
