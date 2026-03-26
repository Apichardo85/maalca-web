import type { Metadata } from 'next'
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'BritoColor | Salón de Belleza | MaalCa',
  description: 'Salón de belleza y colorimetría profesional. Servicios de cabello, uñas y estética para damas y caballeros.',
  openGraph: {
    title: 'BritoColor | Salón de Belleza | MaalCa',
    description: 'Salón de belleza y colorimetría profesional.',
    url: 'https://maalca.com/britocolor',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessJsonLd
        name="BritoColor"
        url="https://maalca.com/britocolor"
        description="Salón de belleza y colorimetría profesional."
        type="BeautySalon"
        priceRange="$$"
      />
      {children}
    </>
  )
}
