import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicios | MaalCa',
  description: 'Servicios de desarrollo web, marketing digital, diseño y soluciones tecnológicas para tu negocio.',
  openGraph: {
    title: 'Servicios | MaalCa',
    description: 'Desarrollo web, marketing digital, diseño y soluciones tecnológicas.',
    url: 'https://maalca.com/servicios',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
