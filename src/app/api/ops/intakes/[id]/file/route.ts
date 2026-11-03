import { NextRequest, NextResponse } from 'next/server';
import { getMaalcaApiToken } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { INTAKE_BUCKET } from '@/lib/intake';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Abre un archivo subido por el prospecto: comprueba que quien pide es admin de plataforma (el API
// responde el levantamiento solo a ellos) y que la ruta pertenece a ESTE levantamiento; luego
// redirige a una URL firmada de 5 minutos. El bucket es privado: no hay enlace permanente.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getMaalcaApiToken();
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const path = req.nextUrl.searchParams.get('path') ?? '';

  const apiRes = await fetch(`${API}/api/ops/intakes/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!apiRes.ok) return NextResponse.json({ error: 'forbidden' }, { status: apiRes.status === 404 ? 404 : 403 });
  const intake = await apiRes.json();
  if (!path.startsWith(`intake/${intake.token}/`) || path.includes('..')) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { data, error } = await supabaseAdmin().storage.from(INTAKE_BUCKET).createSignedUrl(path, 300);
  if (error || !data?.signedUrl) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
