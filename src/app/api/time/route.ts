// Fuente de verdad del "reloj del muro" (Pantallas sincronizadas — Fase 1).
// Las TVs NO usan su propio reloj (puede estar desfasado segundos): calculan su diferencia
// contra esta hora con un ping estilo NTP (ver src/lib/wall-clock.ts).
//
// Runtime Node (no edge) a propósito: una sola región (iad1) => todas las TVs miden contra el
// mismo grupo de servidores sincronizados por NTP, y evitamos el reloj "congelado durante I/O"
// de algunos runtimes de isolates. El cold start solo afecta la primera muestra, y el cliente
// la descarta porque se queda con la de menor RTT.
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response(JSON.stringify({ t: Date.now() }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store, max-age=0',
    },
  });
}
