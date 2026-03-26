import type { Metadata } from 'next'
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Masa Tina | Repostería Artesanal | MaalCa',
  description: 'Repostería artesanal dominicana. Bizcochos, postres y catering para eventos especiales.',
  openGraph: {
    title: 'Masa Tina | Repostería Artesanal | MaalCa',
    description: 'Repostería artesanal dominicana — bizcochos, postres y catering.',
    url: 'https://maalca.com/masa-tina',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessJsonLd
        name="Masa Tina"
        url="https://maalca.com/masa-tina"
        description="Repostería artesanal dominicana — bizcochos, postres y catering."
        type="Bakery"
        priceRange="$$"
      />
      {children}
    </>
  )
}
