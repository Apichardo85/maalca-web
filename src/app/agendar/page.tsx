import { AgendarContent } from './AgendarContent'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Slug del espacio de MaalCa que recibe las reservas. Esta página NO es la página de ese espacio
 * (/maalca): es la cara comercial de la vitrina que usa su motor de citas. Un negocio que agenda
 * videollamadas no necesita además una "página de negocio" pública — ver GetBookableAffiliateAsync
 * en maalca-api, que separó "mi página se ve" de "mi agenda responde".
 */
const BOOKING_SLUG = 'maalca'

interface BookingConfig {
  horario: { dia: string; abre: string; cierra: string; cerrado: boolean }[] | null
  timezone: string | null
}

/**
 * Horario y zona del espacio, para que el widget ofrezca solo las horas en que MaalCa atiende y
 * mida "hoy" en su reloj, no en el del visitante. Si el API no responde la página sigue sirviendo:
 * el widget cae a su horario por defecto en vez de dejar al visitante sin poder reservar.
 */
async function getBookingConfig(): Promise<BookingConfig> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${BOOKING_SLUG}/catalog`, {
      next: { revalidate: 60, tags: [`affiliate:${BOOKING_SLUG}`] },
    })
    if (!res.ok) return { horario: null, timezone: null }
    const data = await res.json()
    return {
      horario: data?.affiliate?.horario ?? null,
      timezone: data?.affiliate?.timezone ?? null,
    }
  } catch {
    return { horario: null, timezone: null }
  }
}

export default async function AgendarPage() {
  const { horario, timezone } = await getBookingConfig()
  return <AgendarContent slug={BOOKING_SLUG} horario={horario} timezone={timezone} />
}
