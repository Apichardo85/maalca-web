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

## Puente mientras tanto
Fully no tiene opción de mostrar contenido en caché sin red. Alternativa sin app: service worker +
último catálogo guardado en `localStorage` dentro del propio board (funciona en el WebView de Fully).
