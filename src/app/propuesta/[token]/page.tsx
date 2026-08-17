import { notFound } from 'next/navigation';
import { PublicProposalContent, type PublicProposal } from './PublicProposalContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

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
