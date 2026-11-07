import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

// Importación masiva de clientes. La web manda las filas ya mapeadas; dryRun=true solo valida.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyAffiliate(req, slug, '/customers/import', 'POST');
}
