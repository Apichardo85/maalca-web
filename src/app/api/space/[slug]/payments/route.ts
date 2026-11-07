import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Registrar un pago o abono — proxya a /api/affiliates/{id}/payments (idempotente por idempotencyKey).
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/payments', 'POST');
}
