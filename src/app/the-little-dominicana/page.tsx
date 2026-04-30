// app/the-little-dominican/page.tsx — Server Component (metadata + data fetch)
// La UI vive en HomeClient.tsx para poder consumir useTldI18n (hook client).
import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { getDishes } from './_dishes-loader'

export const metadata: Metadata = {
  title: 'Little Dominicana Restaurant | Elmira, NY',
  description: "Comida dominicana tradicional — auténtica y sabrosa. Dine-in y pickup en Elmira, NY.",
}

export const revalidate = 60

export default async function Page() {
  const dishes = await getDishes()
  return <HomeClient dishes={dishes} />
}
