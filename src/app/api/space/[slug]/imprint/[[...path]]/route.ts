import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken, resolveAffiliateIdBySlug } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Proxy del sello editorial (ver WorkEndpoints.cs, sección "Sello editorial"):
//   /api/space/{slug}/imprint/authors/**    → /api/affiliates/{id}/imprint/authors/**   (lado del sello)
//   /api/space/{slug}/imprint/works         → /api/affiliates/{id}/imprint/works        (lado del sello)
//   /api/space/{slug}/imprint/contracts/**  → /api/affiliates/{id}/imprint-contracts/** (lado del autor)
//   /api/space/{slug}/imprint/options       → /api/affiliates/{id}/imprint-options      (sellos para la ficha)
// El API decide quién puede qué; aquí solo se resuelve el negocio y se reenvía.
function target(path: string[]): string {
  const [head, ...rest] = path;
  const tail = rest.length > 0 ? `/${rest.map(encodeURIComponent).join('/')}` : '';
  if (head === 'contracts') return `/imprint-contracts${tail}`;
  if (head === 'options') return '/imprint-options';
  return `/imprint/${path.map(encodeURIComponent).join('/')}`;
}

async function forward(req: NextRequest, slug: string, path: string[] | undefined) {
  if (!path || path.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const affiliate = await resolveAffiliateIdBySlug(slug, token);
  if (!affiliate) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const hasBody = req.method !== 'GET' && req.method !== 'DELETE';
  const apiRes = await fetch(`${API}/api/affiliates/${affiliate.id}${target(path)}`, {
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
