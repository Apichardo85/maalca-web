/**
 * JSON-LD structured data components for SEO.
 * Server components — render <script type="application/ld+json"> in page head.
 */
interface OrganizationProps {
  name?: string
  url?: string
  logo?: string
  description?: string
  sameAs?: string[]
}
export function OrganizationJsonLd({
  name = 'MaalCa LLC',
  url = 'https://maalca.com',
  logo = 'https://maalca.com/logo-icon.svg',
  description = 'Crea, personaliza, publica y gestiona el espacio digital de tu negocio. Sin código. Sin plantillas genéricas.',
  sameAs = [
    'https://www.instagram.com/maalca_llc',
    'https://www.facebook.com/maalca',
  ],
}: OrganizationProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'DO',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
interface LocalBusinessProps {
  name: string
  url: string
  description: string
  image?: string
  phone?: string
  address?: string
  type?: string
  priceRange?: string
}
export function LocalBusinessJsonLd({
  name,
  url,
  description,
  image,
  phone,
  address,
  type = 'LocalBusiness',
  priceRange,
}: LocalBusinessProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    url,
    description,
  }
  if (image) schema.image = image
  if (phone) schema.telephone = phone
  if (priceRange) schema.priceRange = priceRange
  if (address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressCountry: 'DO',
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
interface WebSiteProps {
  name?: string
  url?: string
}
export function WebSiteJsonLd({
  name = 'MaalCa',
  url = 'https://maalca.com',
}: WebSiteProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface RestaurantProps {
  name: string
  url: string
  description?: string
  image?: string
  phone?: string
  address?: string
  horario?: { dia: string; abre: string; cierra: string; cerrado: boolean }[] | null
}

// Claves de día del Horario del negocio (español, sin acentos) -> nombre schema.org.
const DIA_TO_SCHEMA_DAY: Record<string, string> = {
  lunes: 'Monday',
  martes: 'Tuesday',
  miercoles: 'Wednesday',
  jueves: 'Thursday',
  viernes: 'Friday',
  sabado: 'Saturday',
  domingo: 'Sunday',
}
const HHMM = /^([01]?\d|2[0-3]):[0-5]\d$/

/**
 * Datos estructurados de Restaurant para páginas públicas de negocio (Google/Maps). A diferencia
 * de LocalBusinessJsonLd, NO asume país: el negocio puede estar en RD o en EE.UU., y la dirección
 * es un texto libre. Todo lo opcional se omite si falta, nunca se inventa. Un turno que cruza la
 * medianoche (abre 18:00, cierra 02:00) se publica tal cual: schema.org lo admite.
 */
export function RestaurantJsonLd({ name, url, description, image, phone, address, horario }: RestaurantProps) {
  const hours = (horario ?? [])
    .filter(
      (h) =>
        !h.cerrado &&
        DIA_TO_SCHEMA_DAY[h.dia] &&
        HHMM.test(h.abre) &&
        HHMM.test(h.cierra) &&
        h.abre !== h.cierra,
    )
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DIA_TO_SCHEMA_DAY[h.dia],
      opens: h.abre.padStart(5, '0'),
      closes: h.cierra.padStart(5, '0'),
    }))

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    url,
    hasMenu: `${url}#menu`,
  }
  if (description) schema.description = description
  if (image) schema.image = image
  if (phone) schema.telephone = phone
  if (address) schema.address = { '@type': 'PostalAddress', streetAddress: address }
  if (hours.length > 0) schema.openingHoursSpecification = hours

  return (
    <script
      type="application/ld+json"
      // El nombre/descripción los escribe el dueño del negocio: se escapa "<" para que un valor
      // con "</script>" no pueda cerrar la etiqueta y romper la página.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  )
}
