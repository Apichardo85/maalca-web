import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Abre una sesión de soporte (impersonation) de 2h contra el afiliado dado. El backend hace
// toda la validación (platform_admin, negocio existe) — este proxy solo reenvía.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ affiliateId: string }> },
) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { affiliateId } = await params;

  const apiRes = await fetch(`${API}/api/ops/impersonate/${affiliateId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await apiRes.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: apiRes.status });
}
