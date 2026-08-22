// Kiosko de ponche de entrada/salida (gestión de equipo — workforce) — pantalla pública sin
// login, pensada para vivir en una tableta fija dentro del negocio, mismo espíritu que el
// kiosko de autopedidos. El empleado elige su nombre y entra su PIN para poncharse; no hay
// cuenta ni login de su parte.
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PoncheContent, type PoncheMember } from './PoncheContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBusinessName(slug: string): Promise<{ name: string; logoUrl: string | null } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/catalog`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return { name: data.affiliate?.name ?? '', logoUrl: data.affiliate?.logoUrl ?? null };
  } catch {
    return null;
  }
}

async function getPoncheTeam(slug: string): Promise<PoncheMember[] | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/affiliates/${slug}/ponche-team`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessName(slug);
  return { title: business ? `Ponche — ${business.name}` : 'Ponche' };
}

export default async function PonchePage({ params }: PageProps) {
  const { slug } = await params;
  const [business, team] = await Promise.all([getBusinessName(slug), getPoncheTeam(slug)]);
  if (!business || !team) notFound();

  return (
    <PoncheContent
      slug={slug}
      businessName={business.name}
      logoUrl={business.logoUrl}
      initialTeam={team}
    />
  );
}
