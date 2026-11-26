import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Proxy único de /api/space/{slug}/works/** → /api/affiliates/{id}/works/** (obras y capítulos del autor,
// ver WorkEndpoints.cs). El API decide quién lee y quién escribe; aquí solo se resuelve el negocio y se reenvía.
// Excepción de ruta: el reorden vive en /works/{id}/chapters-order en el API (no bajo /chapters/{id}).
async function forward(req: NextRequest, slug: string, path: string[] | undefined) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const suffix = path && path.length > 0 ? `/${path.map(encodeURIComponent).join('/')}` : '';
  const hasBody = req.method !== 'GET' && req.method !== 'DELETE';
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}/works${suffix}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Affiliate-Id': affiliate.id,
    },
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  });
  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}

type Ctx = { params: Promise<{ slug: string; path?: string[] }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug, path } = await params;
  return forward(req, slug, path);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { slug, path } = await params;
  return forward(req, slug, path);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, path } = await params;
  return forward(req, slug, path);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { slug, path } = await params;
  return forward(req, slug, path);
}
