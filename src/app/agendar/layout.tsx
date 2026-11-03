import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agenda una videollamada | MaalCa',
  description:
    'Agenda una videollamada con MaalCa: elige el día y la hora, recibe el link por correo y agrégalo a tu calendario.',
  openGraph: {
    title: 'Agenda una videollamada | MaalCa',
    description: 'Cuéntanos de tu negocio y te mostramos cómo MaalCa puede trabajar para ti.',
    url: 'https://maalca.com/agendar',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
