// app/the-little-dominican/menu/page.tsx — Server Component (metadata wrapper)
// UI vive en MenuShell.tsx para poder consumir useTldI18n.
import type { Metadata } from 'next'
import MenuShell from './MenuShell'

export const metadata: Metadata = {
  title: 'Menú | The Little Dominican · Elmira, NY',
  description: 'Cocina dominicana auténtica — Yaroa, Pica Pollo, Chicharrón, Churrasco, Camarones y más. Ordena online o llama al (607) 215-0990.',
}

export default function MenuPage() {
  return <MenuShell />
}
