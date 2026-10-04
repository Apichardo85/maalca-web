import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrackingContent, type OrderTracking } from './TrackingContent';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function load(token: string): Promise<OrderTracking | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/track/${encodeURIComponent(token)}`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Enlace privado por token (128 bits): no se indexa. La vista previa muestra el negocio al compartirlo.
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const t = await load(token);
  const robots = { index: false, follow: false };
  if (!t) return { title: 'Tu pedido', robots };
  return { title: `Tu pedido en ${t.businessName}`, robots };
}

// Seguimiento de pedido sin login (mismo patrón que /cita/[token]): un solo enlace reemplaza los correos
// por cada cambio de estado. Se refresca solo mientras está abierto (ver TrackingContent).
export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const initial = await load(token);
  if (!initial) notFound();
  return <TrackingContent token={token} initial={initial} apiBase={API_BASE} />;
}
