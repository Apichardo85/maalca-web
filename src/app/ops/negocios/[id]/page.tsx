import { notFound } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import type { OpsAffiliate, OpsNote } from '../../types';
import { NegocioDetail } from './NegocioDetail';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default async function OpsNegocioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getMaalcaApiToken();
  if (!token) return null;

  // No hay endpoint de un solo afiliado en /api/ops todavía — se reusa la lista completa
  // (mismo dato que ya trae /ops/negocios) y se busca el id acá. Si el panel crece mucho
  // en cantidad de negocios, vale la pena agregar GET /api/ops/affiliates/{id}.
  const [affiliatesRes, notesRes] = await Promise.all([
    fetch(`${API}/api/ops/affiliates`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${API}/api/ops/affiliates/${id}/notes`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
  ]);

  const affiliates: OpsAffiliate[] = affiliatesRes.ok ? await affiliatesRes.json() : [];
  const affiliate = affiliates.find((a) => a.id === id);
  if (!affiliate) notFound();

  const notes: OpsNote[] = notesRes.ok ? await notesRes.json() : [];

  return <NegocioDetail initialAffiliate={affiliate} initialNotes={notes} />;
}
