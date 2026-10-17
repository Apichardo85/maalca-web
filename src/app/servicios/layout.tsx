import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Planes y precios | MaalCa',
  description:
    'Planes de MaalCa para el espacio digital de tu negocio: Inicial gratis 30 días, Emprendedor y Profesional, con pantallas de menú, pedidos, reservas y facturación.',
  openGraph: {
    title: 'Planes y precios | MaalCa',
    description:
      'Planes de MaalCa para el espacio digital de tu negocio: empieza gratis y crece a tu ritmo.',
    url: 'https://maalca.com/servicios',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
