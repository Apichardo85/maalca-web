// src/app/api/space/[slug]/community/combos/[id]/serve/route.ts
// Unica fuente de "comidas servidas" — cada POST aqui crea un ComboServing real en
// maalca-api (ver comentario en Program.cs). No hay PATCH/DELETE: servir es un evento,
// no un dato editable.
import { NextRequest } from 'next/server';
import { communityProxy } from '@/lib/community-api';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const body = await req.json();
  return communityProxy(slug, `/combos/${id}/serve`, { method: 'POST', body });
}
