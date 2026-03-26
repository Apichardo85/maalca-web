import type { MetadataRoute } from 'next'

const BASE_URL = 'https://maalca.com'

export default function sitemap(): MetadataRoute.Sitemap {
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
    { url: `${BASE_URL}/the-little-dominican`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/the-little-dominican/menu`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/the-little-dominican/gallery`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/masa-tina`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/dr-pichardo`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/dr-pichardo/servicios`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/maalca-properties`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/verde-prive`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  return [...mainPages, ...projects, ...affiliates]
}
