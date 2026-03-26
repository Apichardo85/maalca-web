import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CiriWhispers | Libros | MaalCa',
  description: 'Colección literaria CiriWhispers. Libros de ficción y no-ficción publicados por Editorial MaalCa.',
  openGraph: {
    title: 'CiriWhispers | Editorial MaalCa',
    description: 'Colección literaria CiriWhispers — ficción y no-ficción.',
    url: 'https://maalca.com/ciriwhispers',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
