'use client';
// src/components/public/templates/Retail.tsx
import Link from 'next/link';
import type { PublicTemplateProps } from '@/lib/templates/registry';
import { useCart } from '@/components/public/cart/useCart';
import { WhatsAppCart } from '@/components/public/cart/WhatsAppCart';
import { resolveWhatsAppDigits } from '@/lib/public-contact';

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function RetailTemplate({ business, items, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? '#C8102E';
  const waRaw = resolveWhatsAppDigits(business);
  const { cart, addToCart, removeFromCart, cartTotal, cartCount } = useCart();

  return (
    <div className="min-h-screen bg-white">
      {/* TODO: Starter plan adds: gallery, hours, location */}
      <header
        className="relative px-4 pt-12 pb-8 text-center"
        style={{ backgroundColor: accent }}
      >
        {business.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo_url}
            alt={business.name}
            className="mx-auto mb-4 h-20 w-20 rounded-full object-cover border-4 border-white/30"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow">
          {business.name}
        </h1>
        {business.description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
            {business.description}
          </p>
        )}
        {waRaw && (
          <a
            href={`https://wa.me/${waRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition"
          >
            💬 WhatsApp
          </a>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 p-12 text-center">
            <p className="text-4xl">🛍️</p>
            <p className="mt-4 text-sm text-neutral-500">Productos disponibles pronto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => {
              const cartQty = cart.find(e => e.item.id === item.id)?.qty ?? 0;
              const imageUrl = item.imageUrl ?? item.image_url;
              return (
                <div key={item.id} className="group">
                  <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-neutral-300">
                        🛍️
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium line-clamp-1">{item.name}</p>
                  {item.price != null && (
                    <p className="text-sm text-neutral-600">{priceFormatter.format(item.price)}</p>
                  )}
                  {cartQty === 0 ? (
                    <button
                      onClick={() => addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price ?? 0,
                        image: imageUrl ?? undefined,
                      })}
                      aria-label={`Agregar ${item.name}`}
                      className="mt-2 block w-full rounded-full py-1.5 text-center text-xs font-medium text-white transition hover:opacity-90"
                      style={{ backgroundColor: accent }}
                    >
                      + Agregar
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Quitar ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold"
                        style={{ backgroundColor: '#f0ede8', color: '#1a1a1a' }}
                      >
                        −
                      </button>
                      <span className="text-sm font-bold" style={{ color: '#1a1a1a' }}>
                        {cartQty}
                      </span>
                      <button
                        onClick={() => addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price ?? 0,
                          image: imageUrl ?? undefined,
                        })}
                        aria-label={`Agregar ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {!capabilities.hidePoweredBy && (
        <footer className="py-8 text-center">
          <Link href="/servicios" className="text-xs text-neutral-400 hover:text-neutral-600">
            Powered by <span className="font-semibold">MaalCa</span>
          </Link>
        </footer>
      )}

      {waRaw && (
        <WhatsAppCart
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          cartTotal={cartTotal}
          cartCount={cartCount}
          whatsappNumber={waRaw}
          businessName={business.name}
        />
      )}
    </div>
  );
}
