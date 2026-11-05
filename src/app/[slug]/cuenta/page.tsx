// Página "Mi cuenta" del cliente de una tienda: sus pedidos, estado y "repetir pedido".
// Misma fuente pública que [slug]/page.tsx (el fetch queda en caché); la sesión se resuelve en el navegador.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CuentaContent } from './CuentaContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface CatalogHead {
  pagePublished?: boolean;
  affiliate: {
    slug: string;
    name: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    currency?: string | null;
    language?: string | null;
  };
  capabilities?: { storeAccounts?: boolean } | null;
}

async function getHead(slug: string): Promise<CatalogHead | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, {
      next: { revalidate: 60, tags: [`affiliate:${slug}`] },
    });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getHead(slug);
  return { title: data ? `Mi cuenta · ${data.affiliate.name}` : 'Mi cuenta', robots: { index: false } };
}

export default async function CuentaPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getHead(slug);
  if (!data || data.pagePublished === false || data.capabilities?.storeAccounts !== true) notFound();
  const { affiliate } = data;

  return (
    <>
      {(affiliate.language === 'en' || affiliate.language === 'es') && (
        <script dangerouslySetInnerHTML={{ __html: `window.__MAALCA_DEFAULT_LANG__='${affiliate.language}';` }} />
      )}
      <CuentaContent
        slug={slug}
        name={affiliate.name}
        logoUrl={affiliate.logoUrl ?? null}
        color={affiliate.primaryColor ?? null}
        barColor={affiliate.secondaryColor ?? null}
        currency={affiliate.currency ?? 'USD'}
      />
    </>
  );
}
