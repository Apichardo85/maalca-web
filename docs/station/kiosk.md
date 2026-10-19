# Estación de pedidos en modo kiosko

URL: `https://maalca.com/station/{slug}` (la vieja `/space/{slug}/station` redirige aquí).

La ruta está **fuera** del dashboard: sin sidebar, sin menú móvil, sin selector de negocios y sin la
campana de notificaciones (que llevaba a Pedidos). Dentro de la página no hay ningún enlace de
salida; además se bloquea el menú de "mantener presionado" y el gesto de tirar para recargar.
El bloqueo del dispositivo (que nadie salga del navegador o cambie de URL) lo hace Fully Kiosk.

## Configurar la tablet (Fully Kiosk Browser)
1. **Iniciar sesión primero, sin bloquear**: Start URL = `https://maalca.com/station/{slug}` →
   te manda a `/login` → entra con la cuenta del negocio. La sesión queda guardada.
2. **Web Content Settings**
   - Start URL: `https://maalca.com/station/{slug}`
   - Enable Pull to Refresh: **off**
3. **Web Browsing Settings**
   - URL Whitelist: `https://maalca.com/station/*`
     (agregar `https://maalca.com/login*`, `https://accounts.google.com/*` y el dominio de Supabase
     solo si hay que volver a iniciar sesión)
   - Disable other URLs / "Allow navigation to other domains": **off**
4. **Toolbars & Appearance**: Show Address Bar **off**, Show Navigation Bar **off**,
   Show Status Bar **off**.
5. **Kiosk Mode (PLUS)**: Enable Kiosk Mode **on** + Kiosk Exit PIN (solo el dueño lo sabe).
6. **Device Management**: Keep Screen On **on**, Launch on Boot **on**.

## Qué hace la pantalla
- Izquierda: pedido nuevo que suena hasta que alguien lo acepta (elige "listo en" e imprime).
- Derecha: **En proceso** (FIFO) con reloj contra la hora prometida al cliente:
  verde = a tiempo, ámbar = faltan ≤ 4 min / listo esperando ≥ 10 min, rojo = atrasado.
- Tocar un pedido → detalle (artículos y notas, cliente, horarios, total, cobro) con
  **Reimprimir** y el botón para avanzar (Empezar a preparar → Marcar listo → Entregado).
