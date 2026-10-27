import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Plan mínimo de un módulo desde /ops/modulos (ModulePlanRules en maalca-api).
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const authToken = await getMaalcaApiToken();
  if (!authToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { token } = await params;
  const body = await req.json();

  const apiRes = await fetch(`${API}/api/ops/module-rules/${encodeURIComponent(token)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(body),
  });

  if (apiRes.status === 204) return new NextResponse(null, { status: 204 });
  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
