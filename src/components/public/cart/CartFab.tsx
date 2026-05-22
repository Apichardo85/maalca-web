'use client'

interface CartFabProps {
  cartCount: number
  onClick: () => void
}

export function CartFab({ cartCount, onClick }: CartFabProps) {
  if (cartCount === 0) return null

  return (
    <button
      onClick={onClick}
      aria-label={`Ver orden: ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
        right: '1.25rem',
        zIndex: 90,
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '9999px',
        padding: '14px 22px',
        fontFamily: 'inherit',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,.2)',
        minHeight: '48px',
      }}
    >
      <CartIcon />
      Ver orden
      <span
        style={{
          backgroundColor: '#25D366',
          borderRadius: '9999px',
          padding: '2px 9px',
          fontSize: '12px',
          fontWeight: 700,
        }}
      >
        {cartCount}
      </span>
    </button>
  )
}

function CartIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  )
}
