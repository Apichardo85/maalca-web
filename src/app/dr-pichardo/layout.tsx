import type { Metadata } from 'next'
import { LocalBusinessJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Dr. Pichardo | Medicina General | MaalCa',
  description: 'Consultorio médico del Dr. José Francisco Pichardo Pantaleón. Medicina general, operativos de salud y atención personalizada.',
  openGraph: {
    title: 'Dr. Pichardo | Medicina General | MaalCa',
    description: 'Consultorio médico — medicina general, operativos de salud y atención personalizada.',
    url: 'https://maalca.com/dr-pichardo',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LocalBusinessJsonLd
        name="Dr. José Francisco Pichardo Pantaleón"
        url="https://maalca.com/dr-pichardo"
        description="Medicina general, operativos de salud y atención personalizada."
        type="MedicalBusiness"
        priceRange="$$"
      />
      {children}
    </>
  )
}
