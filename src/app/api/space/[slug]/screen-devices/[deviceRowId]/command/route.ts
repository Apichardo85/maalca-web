import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Comando a distancia para una TV ("reload" | "identify"). La TV lo recoge en su próxima señal.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; deviceRowId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { slug, deviceRowId } = await params;
  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/screen-devices/${encodeURIComponent(deviceRowId)}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Affiliate-Id': affiliate.id },
    body: JSON.stringify({ command: body?.command }),
  });
  return new NextResponse(null, { status: apiRes.status });
}
