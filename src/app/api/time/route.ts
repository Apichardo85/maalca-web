// Fuente de verdad del "reloj del muro" (Pantallas sincronizadas — Fase 1).
// Las TVs NO usan su propio reloj (puede estar desfasado segundos): calculan su diferencia
// contra esta hora con un ping estilo NTP (ver src/lib/wall-clock.ts).
//
// Runtime Edge: responde desde el punto de Vercel más cercano a la TV. El error de la medición es
// la mitad del tiempo de ida y vuelta (RTT/2), así que un RTT corto es directamente más precisión
// (con Node, en una sola región, medimos ~80 ms de RTT = ±40 ms). Los relojes de los nodos de
// Vercel están sincronizados por NTP entre sí (error de ~1 ms, despreciable frente al RTT). El
// cold start solo afecta la primera muestra, y el cliente la descarta (se queda con el menor RTT).
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response(JSON.stringify({ t: Date.now() }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store, max-age=0',
    },
  });
}
