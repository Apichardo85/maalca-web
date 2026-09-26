import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacidad | MaalCa',
  description: 'Política de privacidad de MaalCa: qué datos recogemos, cómo se usan, y cómo proteger tu información y la de tus clientes.',
  openGraph: {
    title: 'Privacidad | MaalCa',
    description: 'Política de privacidad de MaalCa.',
    url: 'https://maalca.com/privacidad',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
