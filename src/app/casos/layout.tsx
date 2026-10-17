import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Casos reales | MaalCa',
  description:
    'Negocios de Elmira, NY que ya operan con MaalCa: Pegote Barbershop, Little Dominicana y La Catrina Mexican Restaurant.',
  openGraph: {
    title: 'Casos reales | MaalCa',
    description: 'Negocios reales de Elmira, NY operando con MaalCa.',
    url: 'https://maalca.com/casos',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
