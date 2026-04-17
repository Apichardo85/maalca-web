// app/the-little-dominican/page.tsx — Server Component (metadata wrapper)
// La UI vive en HomeClient.tsx para poder consumir useTldI18n (hook client).
import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'The Little Dominican | Elmira, NY',
  description: "Traditional Dominican with a modern spin — bringing abuela's cooking straight to you. Dine-in, pickup y delivery en Elmira, NY.",
}

export default function Page() {
  return <HomeClient />
}
