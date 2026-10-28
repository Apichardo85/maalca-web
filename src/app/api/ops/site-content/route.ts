import { NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Overrides del copy del sitio (PlatformContent) para el editor /ops/sitio.
export async function GET() {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const apiRes = await fetch(`${API}/api/ops/site-content`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const data = await apiRes.json().catch(() => []);
  return NextResponse.json(data ?? [], { status: apiRes.status });
}
