import { NextRequest, NextResponse } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; invoiceId: string; kind: string }> };

// Los enlaces de PDF/XML de Alanube vencen: la API pide uno fresco y aquí se redirige a él.
export async function GET(req: NextRequest, { params }: Ctx) {
  const { slug, invoiceId, kind } = await params;
  const res = await proxyAffiliate(req, slug, `/fiscal/invoices/${invoiceId}/files/${kind}`, 'GET');
  if (!res.ok) return res;
  const data = (await res.json().catch(() => null)) as { url?: string } | null;
  if (!data?.url) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.redirect(data.url);
}
