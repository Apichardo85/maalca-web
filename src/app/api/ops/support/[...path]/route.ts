import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type Ctx = { params: Promise<{ path: string[] }> };

/**
 * Proxy de la bandeja de soporte: /api/ops/support/* → maalca-api /api/ops/support/* (con su query string).
 * Quién puede qué (colaborador vs Owner) lo decide el API.
 */
async function forward(req: NextRequest, { params }: Ctx, method: 'GET' | 'POST' | 'PUT') {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { path } = await params;
  if (path.some((p) => !/^[A-Za-z0-9-]+$/.test(p))) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/ops/support/${path.join('/')}${req.nextUrl.search}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: method === 'GET' ? undefined : JSON.stringify(await req.json().catch(() => ({}))),
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

export function PUT(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx, 'PUT');
}
