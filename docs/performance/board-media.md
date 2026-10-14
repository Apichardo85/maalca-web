# Rendimiento de imágenes del Menu Board

## Problema
Las pantallas (Fully Kiosk en onn Google TV) mostraban las fotos "cargando" al rotar slides. Causa: fotos subidas sin comprimir (varios MB) que el TV debe descargar y decodificar justo al mostrarlas. El cuello de botella es descarga + decodificación en el TV, no el servidor.

## Decisiones
1. **Precarga en el cliente** (`MenuBoard.tsx`): se precargan con `new Image()` + `decode()` el slide actual y los 2 siguientes (cache en un `Map` en un ref). La rotación espera hasta 4 s a que el siguiente esté listo y luego avanza igual (nunca se queda pegada).
2. **Comprimir al subir** (`src/lib/optimize-image.ts`, usado en `catalog/upload-image` y `screen-ads/upload-media`): `sharp` (ya era dependencia), máx. 1600 px (comerciales 1920 px), WebP q80, rotación EXIF, transparencia conservada. Si falla, o el resultado no es más liviano, se guarda el original: **nunca bloquea una subida**. Los videos pasan sin tocar.
3. **Caché largo**: `cacheControl: 31536000`. Es seguro porque cada subida usa una ruta única con timestamp (la URL cambia al cambiar la foto).
4. **Fotos ya subidas**: `scripts/optimize-existing-media.mjs` (una sola vez, ver abajo).

## Por qué NO Redis
Redis cachea datos en el servidor; aquí el cuello es el peso de la imagen en el TV. Sumaría infraestructura, costo y un punto de falla sin resolver el problema.

## Cómo ejecutar el script de fotos existentes
Desde la raíz de `maalca-web` (usa las llaves de `.env.local`):

    node --env-file=.env.local scripts/optimize-existing-media.mjs          # simulacro, no cambia nada
    node --env-file=.env.local scripts/optimize-existing-media.mjs --apply  # aplica

- Solo toca imágenes > 200 KB y solo reemplaza si ahorra ≥ 20 %.
- Guarda el original en `_backup-originals/<ruta>` del mismo bucket antes de sobrescribir.
- Conserva la misma ruta/URL: no hay que tocar la base de datos. Nota: el contenido pasa a WebP aunque la extensión sea .jpg/.png; los navegadores lo muestran bien porque usan el Content-Type.
- Para revertir: copiar de `_backup-originals/` a la ruta original.

## Principio
Mantener el proyecto liviano y veloz: preferir lo que ya está en el stack (sharp) antes que servicios o dependencias nuevas; toda optimización debe fallar abierto.
