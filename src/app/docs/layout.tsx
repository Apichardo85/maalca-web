import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'El producto en acción | MaalCa',
  description:
    'Capturas reales de negocios que ya usan MaalCa: página propia, kiosco de autopedidos, pantalla de menú, reservas y ponche de personal.',
  openGraph: {
    title: 'El producto en acción | MaalCa',
    description: 'Capturas reales de negocios que ya usan MaalCa.',
    url: 'https://maalca.com/docs',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
