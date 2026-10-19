# Pantallas sincronizadas (muro de TVs)

Se activa por URL en Fully Kiosk. Sin parámetros, el board funciona igual que siempre.

| URL | Qué hace |
|---|---|
| `/{slug}/board?sync=1` | Todas las TVs con esa URL cambian de slide en el mismo instante; los videos van alineados. |
| `/{slug}/board?wall=3x1&pos=0` | Muro de 3 TVs en fila; esta es la izquierda (`pos=1` centro, `pos=2` derecha). |
| `/{slug}/board?wall=2x2&pos=1,0` | Muro 2×2: `pos=col,fila`. |
| `&bezel=24` | Px de marco físico entre TVs: la imagen "salta" el marco en vez de partirse encima. |
| `&debug=1` | Muestra error de sincronización (±ms), frame actual y número de TV. |
| `/sync-test?cols=2&col=0` | Prueba de calibración (color/número/barra cruzando el muro). |

## Cómo se comporta el muro
- **Slides de menú/combos**: se reparten — cada TV muestra una distinta, todas cambian juntas.
- **Comerciales**: todas las TVs los muestran al mismo tiempo. El board decide solo según la
  proporción del archivo:
  - proporción del muro (2 TVs ≈ 32:9, 3 TVs ≈ 48:9, margen ±25 %) → se **estira** sobre todo el
    muro (cada TV muestra su tramo);
  - cualquier otra (16:9 normal, video vertical del celular, logo) → va **completo en cada TV**,
    sincronizado frame a frame.
- Todas las TVs del muro deben usar la **misma** URL base (mismo slug / mismo screenId); solo
  cambia `pos`.

## Cómo funciona
- `src/lib/wall-clock.ts`: reloj compartido (ping estilo NTP a `/api/time`, mejor RTT, resync 30 s).
- `src/lib/wall-sync.ts`: timeline determinista — `posición = hora del muro mod duración total`.
  No hay servidor que mande órdenes; una TV reiniciada vuelve sola al punto correcto.
- `src/components/public/BoardSync.tsx`: `SyncedVideo` (corrige deriva con playbackRate/seek),
  `SpanFrame` (lienzo del muro recortado por TV), `useVideoDurations`.
- Las TVs consultan el catálogo en el mismo minuto del reloj del muro para que un cambio del
  dashboard les llegue a la vez.

## Límites conocidos
- Cada TV decodifica el video completo del comercial y recorta su parte: con 3 TVs y un video
  1080p, cada TV muestra 1/3 escalado (se ve más suave). Mejora futura: pre-cortar un tile por
  TV con ffmpeg al subir.
- Precisión esperada por internet: ~10–30 ms. Suficiente para slides; para video continuo
  revisar el ±ms con `&debug=1`.
