# Pantallas sincronizadas (muros de TVs)

**Todo se configura desde el dashboard: Pantallas → Muros sincronizados.**
- "Nuevo muro": nombre, modo y acomodo → se crean solas las TVs del muro ("{muro} · TV n").
- Cada TV tiene un link fijo (Copiar link / QR / Abrir) que se pone UNA vez en Fully Kiosk.
  Cambiar modo, acomodo, marco o contenido después no requiere tocar los TVs: lo toman solos
  en su próximo poll (≤ 1 min).
- Modos: **Muro** (slides repartidas, comerciales cruzando todas las TVs) y **Espejo** (todas
  iguales al mismo instante).
- "Calibrar": todas las TVs del muro muestran la prueba de sincronización hasta apagarlo.
- El contenido del muro (categorías, comerciales, tema, diseño) es el de su TV 1, editable en
  "Pantallas adicionales".
- Achicar o eliminar un muro no borra TVs: quedan como pantallas sueltas (su link sigue vivo).

Backend: `ScreenWall` + `Screens.WallId/WallCol/WallRow` (maalca-api). El catálogo público, con el
`screenId` de una TV del muro, devuelve `wall` (modo + posición de esa TV) y el contenido de la TV 1.

Override de prueba por URL (no hace falta en uso normal): `?sync=1`, `?wall=3x1&pos=0[&bezel=24]`,
`&debug=1` (muestra ±ms de sincronización). `/sync-test?cols=2&col=0` sigue disponible.

## Cómo se comporta el muro
- **Slides de menú/combos**: se reparten — cada TV muestra una distinta, todas cambian juntas.
- **Comerciales**: todas las TVs los muestran al mismo tiempo. El board decide solo según la
  proporción del archivo:
  - proporción más parecida a la del muro que a la de una TV (ej. 32:9, 48:9) → se **estira**
    sobre todo el muro (cada TV muestra su tramo);
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
