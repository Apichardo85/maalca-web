import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/space/', '/ops/', '/login', '/me'],
      },
    ],
    sitemap: 'https://maalca.com/sitemap.xml',
  }
}
