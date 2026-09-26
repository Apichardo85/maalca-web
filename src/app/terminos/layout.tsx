import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos de uso | MaalCa',
  description: 'Términos y condiciones de uso de la plataforma MaalCa.',
  openGraph: {
    title: 'Términos de uso | MaalCa',
    description: 'Términos y condiciones de uso de la plataforma MaalCa.',
    url: 'https://maalca.com/terminos',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
