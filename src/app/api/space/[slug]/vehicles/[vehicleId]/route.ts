import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string; vehicleId: string }> }) {
  const { slug, vehicleId } = await params;
  return proxyAffiliate(req, slug, `/vehicles/${vehicleId}`, 'PUT');
}
