import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Proxy único de /api/ops/agents/** hacia maalca-api (estado, bitácora, fichas, modelos, proveedor, pausa).
// El API decide quién lee (admin) y quién escribe (Owner); aquí solo se reenvía con el token.
async function forward(req: NextRequest, path: string[] | undefined) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const suffix = path && path.length > 0 ? `/${path.map(encodeURIComponent).join('/')}` : '';
  const hasBody = req.method !== 'GET';
  const apiRes = await fetch(`${API}/api/ops/agents${suffix}${req.nextUrl.search}`, {
    method: req.method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return forward(req, (await params).path);
}
