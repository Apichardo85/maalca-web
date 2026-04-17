// app/the-little-dominican/gallery/page.tsx — Server Component (metadata wrapper)
// UI vive en GalleryShell.tsx para poder consumir useTldI18n.
import type { Metadata } from 'next'
import GalleryShell from './GalleryShell'

export const metadata: Metadata = {
  title: 'Galería | The Little Dominican · Elmira, NY',
  description: 'Fotos del restaurante, platos y ambiente de The Little Dominican en Elmira, NY.',
}

export default function GalleryPage() {
  return <GalleryShell />
}
