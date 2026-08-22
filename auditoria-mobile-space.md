# Auditoría mobile — `/space` (dashboard de dueño)

**Fecha:** 21 de agosto, 2026
**Alcance:** Dashboard, Menú/Catálogo, Pedidos, Inventario, Agenda, Fila de espera, Facturación, Clientes, Personal (Equipo), Diseño, Configuración.
**Metodología:** No se pudo forzar un viewport móvil real en la sesión de navegador de esta auditoría (el redimensionado de ventana no tuvo efecto en el entorno). Por eso esto es una auditoría **a nivel de código**: se leyó cada pantalla y se evaluó cómo van a renderizar sus clases de Tailwind a un ancho de ~375–414px (iPhone/Android estándar), comparado contra los estándares que el propio proyecto ya se auto-impuso en commits anteriores (objetivos táctiles de 44px, filas de tabs con scroll horizontal, modales con `max-h` + `overflow-y-auto`, tablas convertidas a tarjetas en mobile). No es un reemplazo perfecto de probarlo en un teléfono real, pero da una base concreta y accionable.

**Panorama general:** el código está bastante mejor de lo que el reclamo original hacía pensar. La mayoría de pantallas ya usan `grid-cols-1` como base con upgrades en `sm:`/`lg:`, las filas de tabs/categorías ya usan `overflow-x-auto`, y el modal compartido (`Modal.tsx`) ya implementa `max-h-[90vh]` + scroll interno correctamente. Los problemas reales que aparecen son consistentes y puntuales: **botones táctiles por debajo de 44px** (el propio estándar que el equipo fijó al arreglar POS/Kiosko) repetidos en varias pantallas, y un puñado de layouts sin prefijo responsive que quedan apretados (no rotos) en un teléfono angosto.

---

## Prioridad alta

Ninguna. No se encontró nada que bloquee o rompa visualmente una tarea central en mobile — ni overflow horizontal, ni contenido cortado, ni modal que se salga de la pantalla.

---

## Prioridad media

Estos afectan flujos que de verdad se usan desde el celular (agendar una cita, cobrar una factura, elegir el color de marca) y quedan notablemente más apretados de lo que deberían.

1. **Agenda — selector de hora** (`AgendaContent.tsx:472`)
   `grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto sm:grid-cols-6`, botones `px-2 py-1.5 text-xs` (~28-30px de alto). Es el control más usado de la pantalla más usada (elegir la hora al agendar), y queda bien por debajo del estándar de 44px que el equipo ya estableció.

2. **Facturación — fila de línea de factura** (`InvoicesContent.tsx:236-259`)
   Descripción (`flex-1 min-w-0`) + cantidad (`w-16`) + precio (`w-24`) en una sola fila sin wrap. A 375px el campo de descripción queda en ~119px de ancho — no se rompe (el input se encoge), pero escribir una descripción de trabajo junto a dos campos numéricos fijos es incómodo en una tarea que se repite por cada línea de la factura.

3. **Clientes — columnas ocultas en vez de tarjetas** (`ClientesContent.tsx:205-238`)
   Usa `<table>` con `hidden ... sm:table-cell` en Contacto y Última visita — en mobile solo se ve Nombre + Visitas. El teléfono/email/última visita siguen recuperables tocando la fila (abre un modal de historial), pero es inconsistente con el precedente que el propio equipo ya sentó en `/ops/negocios` (tabla → tarjetas) y esconde información de la vista principal sin avisar.

4. **Diseño — selector de color de marca** (`ConfigTab.tsx:184`)
   `grid grid-cols-6 gap-2`, swatches `h-8 w-8` (32px) circulares, apretados junto a un logo de `h-16 w-16` en la misma fila. A 375px quedan ~33px por columna — los círculos casi se tocan entre sí. Es un control que se usa para elegir el color de marca del negocio, no algo secundario.

5. **Diseño — botones de Canales** (`CanalesTab.tsx:361-414`)
   Guardar/Cancelar/Confirmar/Editar/Eliminar/toggle Activo por canal, todos `px-2 py-1 text-xs` (~24-26px) — los objetivos táctiles más chicos de todo el código auditado, varios adyacentes en la misma fila.

6. **Inventario — formulario de alta** (`InventoryContent.tsx:198`)
   `grid grid-cols-3 gap-3` sin prefijo responsive para Cantidad/Mínimo/Costo unit. A 375px quedan ~90px por columna — usable con teclado numérico pero apretado, y la etiqueta "Costo unit." puede partirse en dos líneas.

---

## Prioridad baja

Objetivos táctiles por debajo de 44px pero sin riesgo real de toque equivocado, o detalles cosméticos. Vale la pena limpiarlos en algún momento, no son urgentes:

- **Dashboard** (`SpaceDashboard.tsx`): botones Ver/Editar/Compartir (~28-30px), acciones rápidas (~30-36px), etiquetas de KPI que envuelven a 2-3 líneas en columnas angostas.
- **Menú/Catálogo** (`CatalogView.tsx`): "Activar/Desactivar" y "Editar →" (~26-28px) uno junto al otro; CTA "+ Agregar item" (~36px).
- **Pedidos** (`OrdersContent.tsx`): botones de cambio de estado (~30-32px) — sin riesgo de overflow, ya usan `flex-wrap`.
- **Fila de espera** (`QueueContent.tsx`): Llamar/No llegó/Completar (~34-40px) — son las acciones que más se tocan parado en el mostrador, vale la pena subirlas a 44px antes que las de pantallas menos frecuentes.
- **Clientes** (`ClientesContent.tsx`): botón "+ Cliente" (~36px).
- **Personal/Equipo** (`EquipoContent.tsx`): Dar/Quitar acceso, Marcar disponible, Quitar (~30px), varios juntos en la misma fila.
- **Diseño** (`ContenidoTab.tsx`): flechas ↑↓/Editar/Eliminar en Pasos y FAQ (~24-28px).
- **Inventario** (`InventoryContent.tsx`): + Entrada/− Salida/Editar/Eliminar por fila (~30px), cuatro juntos; el modal de movimiento (`InventoryContent.tsx:311`) es el único modal a medida del código que NO usa `max-h` + `overflow-y-auto` como el `Modal.tsx` compartido — hoy es corto y no se corta, pero si crece sí podría hacerlo.

**Configuración** (`SettingsContent.tsx`) es la pantalla mejor comportada del audit — la mayoría de sus botones ya están en `py-2.5`/`py-3` (~40-44px), prácticamente al estándar.

---

## Patrones ya correctos (confirmado, no tocar)

- Filas de tabs/categorías con scroll horizontal: `CatalogView.tsx:151`, `AgendaContent.tsx:428`, `DesignEditor.tsx:288`.
- Grids que colapsan a una columna en mobile por defecto: Pedidos, Agenda (formulario nueva cita y bloqueo de horario), Configuración.
- Modal compartido `Modal.tsx` (usado en Clientes): `max-h-[90vh] overflow-hidden flex flex-col` + scroll interno — el patrón correcto que el resto del código debería imitar.
- `DesignEditor.tsx:307` — el editor y la vista previa en vivo apilan verticalmente en mobile en vez de ponerse lado a lado (el riesgo obvio de esa pantalla, ya resuelto). Costo real: hay que bajar mucho para ver la preview, pero no se rompe.
- Formulario de "Agregar persona" y horarios (`HorarioSection`) en Personal/Contenido: usan `flex-wrap`/`flex-col sm:flex-row` correctamente.

---

## Recomendación de siguiente paso

No se tocó ningún código en esta tarea (era solo diagnóstico). Si quieres, el siguiente paso natural sería un fix específico y acotado: subir a 44px (`h-11`/`py-2.5` mínimo) los botones de **Agenda** (selector de hora) y **Fila de espera** primero, ya que son las dos pantallas con más uso táctil real y repetido desde el celular — y son cambios de una sola clase por botón, bajo riesgo.
