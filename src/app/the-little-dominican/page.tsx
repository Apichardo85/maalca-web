// app/the-little-dominican/page.tsx — Server Component (metadata + data fetch)
// La UI vive en HomeClient.tsx para poder consumir useTldI18n (hook client).
import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { getDishes } from './_dishes-loader'

export const metadata: Metadata = {
  title: 'The Little Dominican | Elmira, NY',
  description: "Traditional Dominican with a modern spin — bringing abuela's cooking straight to you. Dine-in, pickup y delivery en Elmira, NY.",
}

export const revalidate = 60

export default async function Page() {
  const dishes = await getDishes()
  return <HomeClient dishes={dishes} />
}
