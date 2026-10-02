import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicProposalContent, type PublicProposal } from './PublicProposalContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function loadProposal(token: string): Promise<PublicProposal | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/proposals/${token}`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Vista previa al compartir el link: antes salia el titulo generico de MaalCa. No incluye el monto
// (el link se reenvia por chats) y no se indexa (acceso por token).
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const p = await loadProposal(token);
  const robots = { index: false, follow: false };
  if (!p) return { title: 'Propuesta', robots };
  const title = `Propuesta de ${p.businessName}`;
  const description = p.title;
  const logo = p.businessLogoUrl && /^https?:\/\//.test(p.businessLogoUrl) ? [{ url: p.businessLogoUrl }] : undefined;
  return { title, description, robots, openGraph: { title, description, siteName: 'MaalCa', images: logo } };
}

// Página pública sin login — el link que el negocio comparte con su cliente para que acepte
// una propuesta (task #194). Ver /api/public/proposals/{token}.
export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const res = await fetch(`${API_BASE}/api/public/proposals/${token}`, { cache: 'no-store' });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to load proposal: ${res.status}`);

  const proposal: PublicProposal = await res.json();

  return <PublicProposalContent token={token} initial={proposal} />;
}
