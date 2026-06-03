// src/components/public/templates/Service.tsx
import Link from 'next/link';
import type { PublicTemplateProps } from '@/lib/templates/registry';

export function ServiceTemplate({ business, items, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? '#C8102E';

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
        {business.whatsapp && (
          <a
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition"
          >
            💬 WhatsApp
          </a>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 p-12 text-center">
            <p className="text-4xl">🛠️</p>
            <p className="mt-4 text-sm text-neutral-500">Información disponible pronto.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-neutral-200 p-6">
                <h3 className="font-semibold">{item.name}</h3>
                {item.description && <p className="mt-2 text-sm text-neutral-600">{item.description}</p>}
                <div className="mt-4 flex items-center justify-between">
                  {item.price != null && <p className="font-semibold">${item.price.toFixed(2)}</p>}
                  {business.whatsapp && (
                    <a
                      href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hola ${business.name}, me interesa: ${item.name}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full px-4 py-1.5 text-xs font-medium text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {capabilities.bookingCalendar ? 'Reservar' : 'Cotizar por WhatsApp'}
                    </a>
                  )}
                </div>
              </div>
            ))}
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
    </div>
  );
}
