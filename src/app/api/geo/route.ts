import { NextRequest, NextResponse } from 'next/server';

// País del visitante según el edge de Vercel; /servicios lo usa solo para mostrar el precio de su zona.
// El cobro real usa el país del negocio, no este valor.
export function GET(req: NextRequest) {
  const country = (req.headers.get('x-vercel-ip-country') ?? '').toUpperCase();
  return NextResponse.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } });
}
