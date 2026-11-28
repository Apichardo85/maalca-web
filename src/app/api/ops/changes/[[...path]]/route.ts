import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

type Ctx = { params: Promise<{ path?: string[] }> };

/** Historial desde /ops: GET /api/ops/changes?affiliateId= y POST /api/ops/changes/{id}/revert → maalca-api. */
async function forward(req: NextRequest, { params }: Ctx, method: 'GET' | 'POST') {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { path = [] } = await params;
  if (path.some((p) => !/^[A-Za-z0-9-]+$/.test(p))) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const apiRes = await fetch(`${API}/api/ops/changes${path.length ? `/${path.join('/')}` : ''}${req.nextUrl.search}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: method === 'POST' ? JSON.stringify(await req.json().catch(() => ({}))) : undefined,
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
