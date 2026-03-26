import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ecosistema | MaalCa',
  description: 'Conoce todos los proyectos del ecosistema MaalCa: Editorial, CiriWhispers, CiriSonic, afiliados y más.',
  openGraph: {
    title: 'Ecosistema MaalCa',
    description: 'Proyectos creativos y empresariales desde República Dominicana hacia el mundo.',
    url: 'https://maalca.com/ecosistema',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
