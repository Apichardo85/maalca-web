// app/the-little-dominican/menu/page.tsx — Server Component (metadata + data fetch)
// UI vive en MenuShell.tsx para poder consumir useTldI18n.
import type { Metadata } from 'next'
import MenuShell from './MenuShell'
import { getDishes } from '../_dishes-loader'

export const metadata: Metadata = {
  title: 'Menú | Little Dominicana Restaurant · Elmira, NY',
  description: 'Comida dominicana tradicional — Yaroa, Pica Pollo, Chicharrón, Churrasco, Camarones y más. Ordena online o llama al (607) 215-0990.',
}

export const revalidate = 60

export default async function MenuPage() {
  const dishes = await getDishes()
  return <MenuShell dishes={dishes} />
}
