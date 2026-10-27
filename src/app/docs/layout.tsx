import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cómo funciona MaalCa | MaalCa',
  description:
    'Cómo funciona MaalCa: tu página, tus pantallas, tus pedidos y tu equipo desde un solo panel. Enciendes solo lo que necesitas.',
  openGraph: {
    title: 'Cómo funciona MaalCa | MaalCa',
    description: 'Tu página, tus pantallas, tus pedidos y tu equipo desde un solo panel.',
    url: 'https://maalca.com/docs',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
