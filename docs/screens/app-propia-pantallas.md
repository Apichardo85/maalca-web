# App propia para las pantallas (TVs) — requisitos a futuro

Hoy las TVs corren Fully Kiosk Browser apuntando al link del board. Funciona, pero depende de
ajustes manuales por TV. Cuando hagamos la app propia debe resolver:

- **Arranque sin Internet:** pantalla de MaalCa integrada; reintenta sola y entra al menú (hoy:
  `public/tv-espera.html` como Custom Error URL de Fully, a mano en cada TV).
- **Emparejar por código/QR:** la TV muestra un código y se vincula desde el panel; sin escribir links.
- **Contenido en caché (offline):** si cae el Wi-Fi, sigue mostrando el último menú y comerciales
  en vez de una pantalla en blanco.
- **Margen de pantalla (overscan) configurable por TV desde el panel** (hoy: 3.5 % fijo en
  `MenuBoard.tsx`).
- **Estado en el panel:** TVs en línea, qué muestran y desde cuándo; recargar/reiniciar a distancia.
- **Modo kiosco y arranque automático**, sin depender de la licencia ni la administración remota de Fully.
- **Actualizaciones automáticas** de la app.
- **Subida de videos directo a almacenamiento** (hoy el upload pasa por Vercel, tope práctico ~4.5 MB).

## Puente mientras tanto (ya implementado)
Fully no tiene opción de mostrar contenido en caché sin red, así que se hace en el propio board:
- `public/sw.js`: service worker que guarda la página del board (`/{slug}/board[/{pantalla}]`,
  red primero con 6 s de espera) y los scripts `/_next/static` (caché primero). Solo toca el board.
- `MenuBoard.tsx`: guarda en `localStorage` el último catálogo bueno por TV y lo muestra si el
  primer refresh de la carga falla (sin Internet).
- Límite: fotos y videos de comerciales dependen de la caché HTTP del navegador (las fotos suben
  con caché de 1 año; los videos no se guardan offline).
