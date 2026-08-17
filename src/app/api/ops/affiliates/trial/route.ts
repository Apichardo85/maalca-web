import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Crea un afiliado de prueba sin dueño desde /ops (ver /api/ops/affiliates/trial en la API).
// El admin lo configura vía impersonación y, si el cliente lo quiere, se le invita como Owner
// desde /space/{slug}/equipo — no hace falta ningún endpoint nuevo de "asignar dueño".
export async function POST(req: NextRequest) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();

  const apiRes = await fetch(`${API}/api/ops/affiliates/trial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
