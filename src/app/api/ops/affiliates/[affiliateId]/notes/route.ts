import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Notas CRM internas por afiliado — visibles solo en /ops.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { affiliateId } = await params;
  const apiRes = await fetch(`${API}/api/ops/affiliates/${affiliateId}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? [], { status: apiRes.status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { affiliateId } = await params;
  const body = await req.json();

  const apiRes = await fetch(`${API}/api/ops/affiliates/${affiliateId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
