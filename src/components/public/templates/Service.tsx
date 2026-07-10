'use client';
// src/components/public/templates/Service.tsx
import type { FaqEntry, ProcessStep, PublicTemplateProps } from '@/lib/templates/registry';
import { resolveWhatsAppDigits } from '@/lib/public-contact';
import { trackCanalClick } from '@/lib/public-events';
import { AboutSection } from '@/components/public/AboutSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

export function ServiceTemplate({ business, items, capabilities }: PublicTemplateProps) {
  const accent = business.primary_color ?? '#C8102E';
  const waRaw = resolveWhatsAppDigits(business);
  const { language } = useSimpleLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* TODO: Starter plan adds: gallery, hours, location */}
      <header
        className="relative overflow-hidden px-4 pt-12 pb-8 text-center"
        style={{ backgroundColor: accent }}
      >
        {business.cover_image_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={business.cover_image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
          </>
        )}
        <div className="relative z-10">
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
          {waRaw && (
            <a
              href={`https://wa.me/${waRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCanalClick(business.slug, 'WhatsApp')}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition"
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      </header>

      <AboutSection description={business.description} />

      <ProcessSection steps={business.processSteps} accent={accent} />

      <main className="mx-auto max-w-3xl px-4 py-12">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 p-12 text-center">
            <p className="text-4xl">🛠️</p>
            <p className="mt-4 text-sm text-neutral-500">Información disponible pronto.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => {
              const imageUrl = item.imageUrl ?? item.image_url;
              const description = language === 'en' && item.descriptionEn ? item.descriptionEn : item.description;
              return (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-neutral-200">
                  <div className="aspect-video bg-neutral-100">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-neutral-300">
                        🛠️
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold">{item.name}</h3>
                    {description && <p className="mt-2 text-sm text-neutral-600">{description}</p>}
                    <div className="mt-4 flex items-center justify-between">
                      {item.price != null && <p className="font-semibold">${item.price.toFixed(2)}</p>}
                      {waRaw && (
                        <a
                          href={`https://wa.me/${waRaw}?text=${encodeURIComponent(
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
                </div>
              );
            })}
          </div>
        )}
      </main>

      <FaqSection faq={business.faq} />

      <PublicFooter business={business} capabilities={capabilities} />
    </div>
  );
}

function ProcessSection({ steps, accent }: { steps?: ProcessStep[] | null; accent: string }) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 pt-10">
      <h2 className="text-lg font-semibold text-neutral-900">Cómo funciona</h2>
      <ol className="mt-4 space-y-4">
        {steps.map((step, i) => (
          <li key={`${i}-${step.title}`} className="flex gap-4">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-neutral-900">{step.title}</p>
              <p className="mt-1 text-sm text-neutral-600">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FaqSection({ faq }: { faq?: FaqEntry[] | null }) {
  if (!faq || faq.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 pt-10">
      <h2 className="text-lg font-semibold text-neutral-900">Preguntas frecuentes</h2>
      <div className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
        {faq.map((entry, i) => (
          <details key={`${i}-${entry.question}`} className="group p-4">
            <summary className="cursor-pointer list-none font-medium text-neutral-900 marker:content-none">
              {entry.question}
            </summary>
            <p className="mt-2 text-sm text-neutral-600">{entry.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
