import { redirect } from 'next/navigation';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { HistorialContent } from './HistorialContent';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/** Historial de cambios de la configuración del negocio: quién cambió qué, y revertir (solo el dueño). */
export default async function HistorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getMaalcaApiToken();
  if (!token) redirect('/login');

  const res = await fetch(`${API}/api/space/${slug}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const role: string | null = res.ok ? ((await res.json()).role ?? null) : null;

  return <HistorialContent slug={slug} canRevert={role === 'Owner'} />;
}
