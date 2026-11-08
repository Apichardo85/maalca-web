import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; expenseId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, expenseId } = await params;
  return proxyAffiliate(req, slug, `/expenses/${expenseId}`, 'PUT');
}

// "Borrar" un gasto = desactivarlo (el API lo deja en el historial).
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { slug, expenseId } = await params;
  return proxyAffiliate(req, slug, `/expenses/${expenseId}`, 'DELETE');
}
