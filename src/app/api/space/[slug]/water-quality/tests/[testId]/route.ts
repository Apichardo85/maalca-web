import { NextRequest } from 'next/server';
import { proxyAffiliate } from '@/lib/space-proxy';

type Ctx = { params: Promise<{ slug: string; testId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { slug, testId } = await params;
  return proxyAffiliate(req, slug, `/water-quality/tests/${testId}`, 'PUT');
}

// "Borrar" = desactivar (el API lo deja en el historial interno).
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { slug, testId } = await params;
  return proxyAffiliate(req, slug, `/water-quality/tests/${testId}`, 'DELETE');
}
