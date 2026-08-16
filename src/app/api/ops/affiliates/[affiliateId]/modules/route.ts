import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Control de módulos por afiliado desde /ops — MaalCa puede prender/apagar cualquier módulo
// del whitelist por encima de lo que el plan normalmente daría.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { affiliateId } = await params;
  const body = await req.json();

  const apiRes = await fetch(`${API}/api/ops/affiliates/${affiliateId}/modules`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
