import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const PARTS = new Set(['modules', 'tiers', 'countries', 'settings']);

// Guarda una parte de la fórmula de precios desde /ops/precios (solo Owner; el API lo vuelve a validar).
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ part: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { part } = await params;
  if (!PARTS.has(part)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json();
  const apiRes = await fetch(`${API}/api/ops/pricing/${part}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
