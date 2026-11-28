import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Extras contratados por negocio (/ops/negocios/{id}). Solo el Owner: el API lo valida.
type Ctx = { params: Promise<{ affiliateId: string; path?: string[] }> };

async function forward(req: NextRequest, { params }: Ctx, method: 'GET' | 'POST') {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { affiliateId, path } = await params;
  const suffix = (path ?? []).map(encodeURIComponent).join('/');
  const url = `${API}/api/ops/affiliates/${encodeURIComponent(affiliateId)}/addons${suffix ? `/${suffix}` : ''}`;
  const body = method === 'POST' ? await req.text() : undefined;
  const apiRes = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body || undefined,
    cache: 'no-store',
  });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

export function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, 'GET');
}

export function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, 'POST');
}
