import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Estado de cuenta de un cliente. El segmento se llama [id] (no [customerId]) porque Next no permite dos nombres
// dinámicos distintos en el mismo nivel de customers/.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  return proxyAffiliate(req, slug, `/customers/${id}/statement`, 'GET');
}
