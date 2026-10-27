import { NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Catálogo de módulos con el plan mínimo vigente (GET /api/modules/catalog, público).
export async function GET() {
  const apiRes = await fetch(`${API}/api/modules/catalog`, { cache: 'no-store' });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? [], { status: apiRes.status });
}
