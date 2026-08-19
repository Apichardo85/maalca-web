# QA de usabilidad — /space (segundo recorrido)

Fecha: 2026-08-19
Alcance: recorrido a nivel de código de todas las pantallas `/space/{slug}/*`, con foco en lo que se agregó **después** del primer reporte (2026-08-15, `usability-qa-space-report.md`) y su fix (#112): POS, Kiosko, Reservas de mesa, Propuestas, Bloqueo de horario en Agenda, Galería. El primer reporte se dio por resuelto — confirmado en este pase (Equipo, Catálogo, Pantalla, Canales, Propuestas ya tienen `confirm()` + toast correctamente).

## Crítico — borrar sin confirmar

| Pantalla | Acción | Archivo |
|---|---|---|
| Agenda | Quitar bloqueo de horario | `agenda/AgendaContent.tsx:203` (`removeTimeBlock`) |

`removeTimeBlock` hace `DELETE` directo al hacer click en el ícono de la papelera (línea 643), sin `window.confirm` de por medio. Es el mismo patrón que ya se corrigió en el resto de Agenda (cancelar cita sí confirma, línea 318) — esta función se agregó después con la feature de Bloqueo de horario (#192) y quedó fuera del fix. Sí tiene toast de éxito/error, solo falta la confirmación previa.

## Crítico — página muerta / rota

| Pantalla | Problema | Archivo |
|---|---|---|
| `/space/{slug}/products/new` | Envía el formulario a `POST /api/products`, que **no existe** en el proyecto (no hay ruta registrada) | `products/new/page.tsx` |

Esta pantalla es un remanente de una arquitectura anterior: consulta una tabla `businesses` por Supabase directo (en vez del modelo `Affiliate` real vía API) y postea a un endpoint que ya no existe — cualquiera que llegue a esa URL (no está enlazada en el nav, pero es accesible directo) llena el formulario, hace click en "Agregar producto" y recibe un error genérico sin explicación real. El Catálogo real (`catalog/new/NewItemForm.tsx`) ya cubre esto correctamente. Recomendación: eliminar la carpeta `products/` completa (no `catalog/`, que es la vigente).

## Medio — feedback de éxito ausente

| Pantalla | Acción | Archivo |
|---|---|---|
| Facturación | Cambiar moneda del negocio (USD/DOP) | `settings/SettingsContent.tsx:209` (`handleCurrencyChange`) |

El cambio de moneda es optimista (actualiza la UI al toque) y si falla hace rollback + muestra error en texto rojo — eso está bien. Pero si el `PATCH` sí funciona, no hay ningún toast ni mensaje de éxito, igual que el patrón "medio" del primer reporte. Facturación en general no importa `useToast` — es la única pantalla con mutaciones que quedó completamente fuera del fix de la tarea #112 (no estaba en las "5 pantallas" originales).

## Bajo — texto sin formato (alcance menor al original)

FAQ y Pasos en Contenido (`ContenidoTab.tsx:524,615`) y un campo en `ConfigTab.tsx:108` siguen en `<textarea>` plano. A diferencia del hallazgo original (que ya se resolvió con el editor enriquecido para Descripción, tarea #111), estos son campos cortos (preguntas/respuestas de FAQ, título+detalle de un paso, límite 500 caracteres) — el impacto de no tener negrita/listas ahí es bajo. Lo dejo anotado pero no lo consideraría prioritario.

## Lo que no alcancé a verificar en este pase

Igual que el reporte anterior: esto es a nivel de código (grep + lectura puntual), no clickthrough real en navegador. Quedan sin verificar: estados vacíos reales (0 productos, 0 reservas, 0 propuestas), tamaño de áreas táctiles en mobile en las pantallas nuevas (POS, Kiosko), y accesibilidad de teclado/contraste en Reservas y Propuestas, que son las más nuevas.

## Propuesta

1. Agregar `confirm()` antes de `removeTimeBlock` en Agenda (5 minutos, mismo patrón ya usado ahí mismo).
2. Eliminar `src/app/space/[slug]/products/new/` — código muerto que además confunde si alguien lo encuentra.
3. Conectar `useToast` en Facturación, al menos para el guardado de moneda.
4. (Opcional, baja prioridad) Extender el editor enriquecido de la tarea #111 a FAQ/Pasos si en algún momento se quiere texto con formato ahí también.
