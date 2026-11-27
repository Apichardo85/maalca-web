import type { MetadataRoute } from 'next'

const BASE_URL = 'https://maalca.com'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

// Se rehace cada hora: así entran las obras nuevas de los autores sin desplegar.
export const revalidate = 3600

/** Obras publicadas de los autores (espacio Creator), de maalca-api. Si el API falla, el sitemap sale sin ellas. */
async function authorWorks(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_BASE}/api/public/sitemap/works`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const rows: { affiliateSlug: string; workSlug: string; lastModified: string }[] = await res.json()
    return rows.map((r) => ({
      url: `${BASE_URL}/${encodeURIComponent(r.affiliateSlug)}/obras/${encodeURIComponent(r.workSlug)}`,
      lastModified: new Date(r.lastModified),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Páginas principales
  const mainPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/ecosistema`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/servicios`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/casos-estudio`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Proyectos del ecosistema
  const projects: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/editorial`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/ciriwhispers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/cirisonic`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/hablando-mierda`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // Afiliados
  const affiliates: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/pegote-barber`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/britocolor`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/the-little-dominicana`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/masa-tina`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/dr-pichardo`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/dr-pichardo/servicios`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/maalca-properties`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/verde-prive`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  return [...mainPages, ...projects, ...affiliates, ...(await authorWorks())]
}
