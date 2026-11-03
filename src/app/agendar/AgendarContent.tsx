'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/buttons'
import { useTranslation, useSimpleLanguage } from '@/hooks/useSimpleLanguage'
import {
  PublicBookingSection,
  type PublicBookingSectionHandle,
} from '@/components/public/booking/PublicBookingSection'

interface Props {
  slug: string
  horario: { dia: string; abre: string; cierra: string; cerrado: boolean }[] | null
  timezone: string | null
}

/** Respaldo si el token no se puede leer. Mismo valor que --brand-primary en globals.css. */
const BRAND_FALLBACK = '#045AFE'

export function AgendarContent({ slug, horario, timezone }: Props) {
  const { t } = useTranslation()
  const { language } = useSimpleLanguage()
  const bookingRef = useRef<PublicBookingSectionHandle>(null)

  // El widget pide un hex (hace color-mix sobre él), no una clase de Tailwind. Se lee el token de
  // marca para que, si cambia, esta página lo siga sin tocar código; el valor fijo es solo respaldo.
  const [accent, setAccent] = useState(BRAND_FALLBACK)
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
    if (/^#[0-9a-f]{6}$/i.test(v)) setAccent(v)
  }, [])

  const points = ['agendar.point1', 'agendar.point2', 'agendar.point3']

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="text-xs uppercase tracking-widest font-semibold text-brand-primary mb-4">
              {t('agendar.eyebrow')}
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-text-primary mb-6">
              {t('agendar.title')}
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary leading-relaxed">
              {t('agendar.subtitle')}
            </p>

            <ul className="mt-8 inline-flex flex-col gap-3 text-left text-text-secondary">
              {points.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
                onClick={() => bookingRef.current?.openBooking()}
              >
                {t('agendar.cta')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* El widget real de reservas, el mismo que usan los negocios. Sin su encabezado propio: la
          página ya tiene el suyo, y repetirlo ("Reserva tu cita…") era justo lo que no tenía
          sentido de la versión anterior. El botón de arriba abre el mismo modal. */}
      <PublicBookingSection
        ref={bookingRef}
        slug={slug}
        language={language === 'en' ? 'en' : 'es'}
        accent={accent}
        horario={horario}
        timezone={timezone}
        embedded
      />
    </main>
  )
}
