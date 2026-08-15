# QA de usabilidad — /space (recorrido inicial)

Fecha: 2026-08-15
Alcance: recorrido a nivel de código de todas las pantallas de `/space/{slug}/*` (Agenda, Pantalla/Board, Catálogo, Diseño, Identidad, Cocina, Módulos, Pedidos, Facturación, Estadísticas, Equipo), buscando el mismo patrón que originó el reporte de Equipo: acciones sin confirmación, sin feedback de éxito/error, y controles de texto sin formato.

Equipo ya se corrigió (toasts + confirmaciones + campo de correo) — ver commit "fix: feedback UX en Equipo". Este reporte cubre el resto.

## Hallazgo transversal

**Ninguna pantalla de `/space` usa el sistema de notificaciones (`useToast`/`Toast.tsx`) que ya existe en el proyecto**, excepto Equipo (recién arreglado). El patrón en todas partes es: error → texto rojo chiquito (a veces ni eso); éxito → nada, la UI simplemente se actualiza sola sin confirmación. Esto es la causa raíz de "no pasó nada" en cualquier pantalla, no solo en Equipo.

## Crítico — borrar sin confirmar

Estas acciones eliminan datos permanentemente y **no piden confirmación antes de ejecutar**. Un click accidental o un dedo en el lugar equivocado en mobile borra sin aviso.

| Pantalla | Acción | Archivo |
|---|---|---|
| Catálogo | Eliminar producto/servicio | `catalog/[id]/edit/EditForm.tsx:135` |
| Pantalla (Board) | Eliminar pantalla | `board/BoardContent.tsx:155` |
| Pantalla (Board) | Eliminar comercial | `board/BoardContent.tsx:220` |
| Agenda | Eliminar cita | `agenda/AgendaContent.tsx:130` |
| Diseño → Canales | Eliminar canal de contacto | `design/CanalesTab.tsx:265` |

**Caso más grave: Catálogo.** `deleteItem()` en `EditForm.tsx` no solo no confirma — si el DELETE falla (`!res.ok`), la función no hace nada: ni error, ni mensaje, el botón simplemente no responde. Es exactamente el mismo síntoma que reportaste en Equipo, pero acá además faltaba la confirmación.

## Alto — texto sin formato

Confirma tu observación original. Hay 3 `<textarea>` planos que renderizan tal cual en la página pública, sin negrita/tamaño/justificado:

- `design/ContenidoTab.tsx` (2) — probablemente FAQ / pasos del proceso
- `design/ConfigTab.tsx` (1) — probablemente descripción/meta

Esto ya está en la tarea #111 (editor de texto enriquecido) — lo resuelvo aparte porque es una pieza más grande (elegir librería, sanitizar HTML antes de renderizar en público).

## Medio — feedback de éxito ausente

Todas las pantallas de arriba, más Cocina, Identidad, Pedidos, Módulos, Facturación: guardar/actualizar no muestra ninguna confirmación visual de que funcionó — el usuario tiene que inferirlo por la UI cambiando sola. No es tan grave como el punto crítico, pero es la misma causa raíz.

## Lo que no alcancé a verificar en este pase

Este recorrido fue a nivel de código (grep + lectura puntual), no un click-through real en el navegador con cada rol (Owner/Manager/Staff) y en mobile. Cosas que un QA completo debería sumar: estados vacíos reales (¿qué se ve con 0 productos, 0 citas?), tamaño de áreas táctiles en mobile, foco de teclado/accesibilidad, y contraste de color en los badges.

## Propuesta

Replicar en estas 5 pantallas el mismo arreglo que ya se hizo en Equipo — es el mismo patrón, rápido de aplicar:
1. `window.confirm(...)` antes de las 5 acciones destructivas de la tabla de arriba.
2. Conectar `useToast` en las 5 pantallas para éxito/error visible.
3. Arreglar el fallo silencioso de `EditForm.tsx` (mostrar error si el DELETE falla).
