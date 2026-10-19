import { NextRequest } from 'next/server';
import { proxyWalls } from './_proxy';

// Muros de pantallas sincronizadas (Pantallas → Muros sincronizados).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyWalls(slug, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return proxyWalls(slug, 'POST', '', await req.json());
}
