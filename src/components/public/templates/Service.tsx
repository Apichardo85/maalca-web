// src/components/public/templates/Service.tsx
import Link from 'next/link';
import type { PublicTemplateProps } from '@/lib/templates/registry';

export function ServiceTemplate({ business, items, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? '#C8102E';

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-100 px-4 pt-12 pb-8 text-center">
        {business.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logo_url} alt={business.name} className="mx-auto h-20 w-20 rounded-full object-cover" />
        )}
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{business.name}</h1>
        {business.description && (
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">{business.description}</p>
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
