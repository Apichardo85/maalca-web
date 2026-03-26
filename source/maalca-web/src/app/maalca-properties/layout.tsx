import type { Metadata } from 'next'
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'MaalCa Properties | Bienes Raíces | MaalCa',
  description: 'Propiedades inmobiliarias en República Dominicana. Casas, apartamentos, terrenos y locales comerciales con tour virtual.',
  openGraph: {
    title: 'MaalCa Properties | Bienes Raíces',
    description: 'Propiedades inmobiliarias en República Dominicana.',
    url: 'https://maalca.com/maalca-properties',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessJsonLd
        name="MaalCa Properties"
        url="https://maalca.com/maalca-properties"
        description="Bienes raíces en República Dominicana — casas, apartamentos, terrenos."
        type="RealEstateAgent"
        priceRange="$$$"
      />
      {children}
    </>
  )
}
