# Spec — Espacio v2 (maalca-web / frontend Next.js)

**Repo:** `maalca-web` · **Branch de trabajo:** `develop` → QA de Ciri → merge a `main`
**Alcance de este documento:** SOLO frontend (Next.js, Vercel). No incluye ningún cambio de backend/.NET — ver documento hermano `spec-maalca-api-espacio-v2.md`. Todo lo de aquí consume endpoints de `maalca-api`; si un endpoint necesario no existe todavía, está marcado explícitamente para no bloquear el trabajo de frontend por sorpresa.

---

## Fase 0 — Contexto (ya resuelto, sin trabajo de frontend)

El bug de "límite 10 / 66 items reales" en `/space/the-little-dominicana` **no era un problema de frontend ni de routing**. Era un dato de `Plan` mal seteado en el backend, ya corregido en producción. `business.id` (usado aquí) y `affiliate.id` (usado en el `/dashboard/[affiliateId]` viejo) son el mismo GUID — no hay unificación de tenant pendiente. Esto se documenta aquí solo para que quede registrado que no requiere acción de frontend.

Lo que sí sigue siendo una diferencia real y consciente entre los dos sistemas: `/dashboard/[affiliateId]` (rol super-admin, Ciri) resuelve por config estática hardcodeada; `/space/[slug]` (rol afiliado) resuelve contra la API real. Son roles distintos por diseño — no se unifican en una sola ruta.

---

## Principio rector de todo este programa

> El espacio del afiliado **hereda el lenguaje visual y la densidad del hub maestro** (`/dashboard/maalca`), pero con **scope de datos propio del afiliado** (nunca navegación ni datos de super-admin). La riqueza del dashboard **escala sola** con los módulos que el negocio tenga activos — no es densidad fija, es `base Core + una tarjeta por módulo activo`.

Ejemplo de validación del patrón (colmado): activar Facturación agrega tarjeta "Ventas de hoy"; activar Clientes agrega "Nuevos esta semana". Misma grilla, se llena según lo que el backend confirme como módulo activo (ver Fase B del spec de API).

---

## Fase 1 — Shell y navegación del espacio del afiliado

- [ ] Adoptar el sistema visual del hub maestro: header con saludo + fecha, tarjetas de KPI, tipografía y densidad consistentes con `/dashboard/maalca`.
- [ ] Nav lateral del afiliado se mantiene con **su propio scope** — no absorbe ítems de super-admin: `Dashboard`, `Diseñar mi Espacio`, `Catálogo`, `Módulos`, `Estadísticas`, `Configuración` (renombrado desde la nav actual: Inicio→Dashboard, se agrega Diseñar mi Espacio y Módulos como secciones nuevas).
- [ ] Badge de plan (`Gratis` / `Emprendedor` / etc.) debe leerse del `Plan` real devuelto por `/api/space/{slug}` — no hardcodear "Gratis" en el shell.

**Criterio de aceptación:** visualmente el espacio del afiliado se siente del mismo "sistema" que el hub, pero un afiliado nunca ve datos ni navegación de otro tenant ni de super-admin.

---

## Fase 2 — Dashboard compositivo

### Base (Core, siempre visible, plan gratis incluido)
- Header: saludo + fecha, nombre del negocio, badge de plan, estado "En línea"/"Borrador", botón "Ver mi página".
- Fila de KPIs base: Visitas a mi página · Items publicados · Escaneos de QR · Clics a canales (con delta cuando haya histórico). **Depende de que el backend confirme si "Escaneos QR" y "Clics a canales" ya están trackeados** (Fase C del spec de API) — si no, mostrar esas dos tarjetas con estado "Próximamente" en vez de un dato falso o en cero engañoso.
- Acciones rápidas: Agregar item · Ver mi página · Configurar canales (lleva a Diseñar mi Espacio → Canales) · Compartir link.
- "Próximos pasos" (onboarding checklist existente) se mantiene, colapsable al completarse.
- **Tarjeta "Tu página"**: miniatura de la página publicada + URL (`maalca.com/{slug}`) + botones Ver / Editar / Compartir.

### Composición por módulo activo
- [ ] Consumir el campo `ModulosActivos` desde `/api/space/{slug}` (Fase B del spec de API) y renderizar **una tarjeta por módulo activo confirmado por backend** — nunca inferir módulos activos del string crudo `Affiliate.Modules` en el cliente.
- [ ] Cada tarjeta de módulo trae su propio dato relevante (ej. Catálogo → "X items publicados"; Métricas → resumen de tráfico). Definir el contenido de la tarjeta módulo por módulo, empezando por los tres que sí tienen datos reales hoy: Catálogo, Página, Métricas.

### Módulos PRO inactivos
- [ ] Mostrar como **tarjetas teaser bloqueadas**: una línea de "qué desbloqueas" + CTA "Mejorar". Solo para módulos que **ya existen y están construidos** pero el afiliado no tiene activos (hoy: ninguno más allá de los tres base, así que este bloque queda listo para cuando se construya el primero).
- [ ] Al final de la grilla completa (activos + teasers), **una única tarjeta compacta** "Explora más módulos →" que lleva a la pantalla Módulos. No repetir el detalle de cada módulo "Próximamente" aquí — eso vive solo en la pantalla Módulos.

**Criterio de aceptación:** el dashboard de un afiliado con solo plan gratis se ve limpio y funcional (no vacío); el de un afiliado con más módulos activos se ve proporcionalmente más rico, sin código condicional hardcodeado por afiliado.

---

## Fase 3 — Onboarding rápido (2–3 min)

- [ ] Flujo: Registro (Google/Email) → Nombre del negocio → Categoría (`BusinessType`) → Color principal → Logo → 1 canal de contacto principal → crear espacio.
- [ ] Al completar, **aterrizar en el Dashboard, nunca directo al editor**. Esto es explícito: el usuario debe sentir que tiene un panel de administración desde el primer segundo, no un formulario incompleto.
- [ ] Consume el `POST /api/onboarding` extendido (ver spec de API, Fase D) que ahora acepta color y logo, y crea automáticamente la primera fila de `Canal`.

**Criterio de aceptación:** onboarding completo en menos de 3 minutos percibidos, sin pantallas técnicas, y el usuario cae en un Dashboard ya poblado (aunque sea con datos en cero).

---

## Fase 4 — Editor "Diseñar mi Espacio"

**Decisión de alcance (importante, ya acordada):** no se construye un motor de preview reactivo en cada tecla. Se prioriza esfuerzo bajo con visualización real donde es barato.

- [ ] **Preview instantáneo** (sin fricción de ingeniería, actualización inmediata): color principal (variable CSS) y logo (reemplazo de `src`).
- [ ] **Preview bajo demanda** (botón explícito "Ver cambio" / actualiza al perder foco, no en cada tecla): descripción, horario, dirección, textos largos, reordenamiento de secciones.
- [ ] Layout de la pantalla: split screen — panel izquierdo con secciones (Configuración, Canales, y en el futuro Tema), panel derecho con el preview.
- [ ] **Sección Canales** dentro de este editor (no solo en onboarding): permite agregar/editar/eliminar canales Nivel 1 (WhatsApp, Email, Teléfono) usando los endpoints de `Canal` del spec de API. Reordenar con el campo `Orden`.
- [ ] Estados de publicación en la parte superior: `● Borrador` / `Guardar` / `Vista previa` / `Publicar`. Publicar activa la URL pública inmediatamente.
- [ ] Todos los campos de "Configuración" (nombre, logo, color, header, descripción, horario, dirección, contacto) consumen el endpoint **ya existente** `PATCH /api/affiliates/{id}/profile` — no requiere endpoint nuevo, solo cablear el formulario.

**Criterio de aceptación:** el afiliado nunca "configura a ciegas" para color/logo (ve el cambio al instante); para el resto, un clic explícito le muestra el resultado antes de publicar.

---

## Fase 5 — Layout por categoría de negocio (reemplaza el concepto de "6 temas")

Reformulación acordada, más barata que un sistema de temas completo:

- [ ] Un **layout base fijo por `BusinessType`** (Restaurant, Barber/Service, Retail, Creator/Portfolio, etc.), con la estructura ya pensada para ese tipo de negocio (ej. Restaurant = menú con fotos grandes; Barber = servicios con duración/precio visible).
- [ ] Dentro de ese layout, el afiliado **solo personaliza color principal y logo** — no reestructura secciones ni elige entre layouts alternativos.
- [ ] El layout **consume directamente los items del catálogo real** del afiliado para poblar galería/menú — no hay carga de contenido duplicado para la página pública.
- [ ] **Selector de imagen destacada por item:** si un item de catálogo tiene más de una foto o pertenece a una subcategoría, el afiliado puede marcar cuál imagen se usa para representarlo en la galería/menú público (flag simple a nivel de item, editable desde Catálogo o desde el editor).

**Estado actual detectado:** hoy solo existe una plantilla única sin diferenciación por categoría — este es trabajo nuevo real, no un ajuste menor. Recomendado empezar por el layout de **Restaurant** (cubre a Little Dominicana, el caso con más datos reales) y **Barber/Service** (cubre a Pegote), antes de generalizar a Retail/Creator.

### Principio de migración de módulos (decidido, no programado todavía)

Hallazgo importante durante QA de Fase 1/2: el nuevo "Catálogo" genérico (`catalog-items`, horizontal, sirve a cualquier `BusinessType`) **no es ni pretende ser** un reemplazo del sistema de "Carta/Menú" ya maduro que existe hoy en el dashboard viejo (`dashboard/[affiliateId]/menu/` — editor de períodos de comida, editor por día de semana, menú imprimible, inventario, destacados). Son sistemas distintos, construidos en momentos distintos, con niveles de madurez muy distintos.

**Principio acordado para cuando le toque el turno a cada módulo:** el objetivo es **reusar y migrar** los módulos maduros que ya existen (como Carta) hacia el shell de `/space`, no reconstruir su funcionalidad desde cero como una versión genérica más pobre. El Catálogo genérico actual sirve bien a negocios que no tienen ya un módulo especializado (ej. BritoColor). Para negocios que sí lo tienen (restaurantes con Carta), la ruta correcta cuando se aborde esa migración es adaptar/portar el sistema existente al nuevo shell — no rehacerlo. Esto es una decisión de producto ya tomada, pendiente de programar (no forma parte del alcance actual de Fase 5).

**Criterio de aceptación:** dos negocios de distinta categoría con el mismo catálogo cargado se ven estructuralmente distintos en su página pública, sin que el afiliado haya tenido que elegir un "tema" manualmente — el layout lo decide el `BusinessType`.

---

## Fase 6 — Pantalla Módulos (marketplace)

- [ ] Listar **solo módulos con endpoint real hoy**: Catálogo, Página, Métricas (ya activos por defecto, no se "venden" — son el plan gratis).
- [ ] Sección separada **"Próximamente"**: Citas, Facturación, Cupones, Equipo, CRM — sin precio, sin botón de pago, solo para comunicar roadmap. No prometer fecha.
- [ ] Cuando se construya un módulo premium real (fuera de alcance de este programa), aparece aquí con su propio "Activar — $X/mes", siguiendo el mismo patrón visual que el teaser ya usado en el Dashboard (Fase 2).

**Criterio de aceptación:** un afiliado nunca puede intentar activar algo que rompe porque no está construido — la pantalla solo ofrece lo que funciona de verdad.

---

## Fase 7 — Menu Board público (Smart TV) — ✅ Hecho (base)

**Nota 2026-08-09:** esta fase ya está construida (`/{slug}/board`, `MenuBoard.tsx`) — rotación por categoría, polling de 3 min, gate por `capabilities.menuBoard`. Lo que sigue pendiente de la lista original de abajo es solo **video por item** (seguía sin campo `VideoUrl` en el catálogo — ver Fase 9, que además amplía el alcance más allá de un menú). El resto del checklist original queda como referencia histórica.

## Fase 7 — Menu Board público (Smart TV) — pendiente, sin empezar (checklist original)

**Origen:** pedido directo de Little Dominicana (2026-08-08). Vista pública nueva, en 16:9, pensada para quedar abierta a pantalla completa en el navegador de una Smart TV como menú digital rotativo — no es un rediseño del template público existente, es una vista separada.

- [ ] Nueva ruta pública (ej. `/{slug}/board` o `/menu-board/{slug}`) — 16:9, sin nav/footer de marketing, sin chrome de ningún tipo (aplica el mismo checklist de "Nav/footer de marketing NO debe aparecer" que ya rige para `/space`, `/login`, `/onboarding`).
- [ ] Consume los **items reales del Smart Catalog** del afiliado (mismo principio que Fase 5: no hay contenido duplicado — si se agrega/edita/oculta un producto desde el dashboard, el board lo refleja sin que el afiliado tenga que tocar nada aparte).
- [ ] **Actualización remota:** el board no se edita in-place — se administra igual que el resto del catálogo desde el dashboard (`/space/{slug}/catalog`); el board solo necesita revalidar datos con la frecuencia suficiente para notar cambios sin depender de un refresh manual (polling o revalidación periódica, a definir esfuerzo vs. necesidad real — no hace falta websocket/tiempo real).
- [ ] **Rotación automática de contenido:** ciclo entre items/categorías con transición e intervalo configurable (valor por defecto razonable, ej. 8–10s por slide).
- [ ] **Soporte de foto y video:** el catálogo hoy solo tiene `ImageUrl` (una imagen por item) — **video es un campo nuevo, no existe en el schema actual** (`CatalogItemDto`/`CreateCatalogItemRequest` en `maalca-api`). Esto es dependencia de backend antes de poder cablear el board a video real, no solo trabajo de frontend.
- [ ] Diseño debe asumir visión a distancia (tipografía grande, alto contraste) — es una pantalla para verse desde varios metros, no un layout de página web normal.
- [ ] Sin interacción táctil ni de mouse esperada una vez abierto — la única "interacción" es dejarlo corriendo en la TV.

**Dependencias:**
- Backend: agregar soporte de video al item de catálogo (campo `VideoUrl` o similar + validación de tipo/tamaño) — no existe hoy.
- Sin dependencia de Stripe/planes — a definir si esta vista es exclusiva de plan Emprendedor o viene con el plan gratis (no decidido todavía).

**Criterio de aceptación:** un TV con el navegador abierto en esa URL, en modo pantalla completa, muestra el catálogo real del negocio rotando solo, se actualiza cuando el afiliado cambia algo en el dashboard (sin recargar manualmente ni re-abrir la pestaña), y es legible a distancia.

---

## Fase 8 — Plan Emprendedor completo (goal real del negocio) — pendiente, sin empezar

**Origen:** copy de venta ya publicado en `/servicios` para el plan Emprendedor ($38/mes): *"Cuando ya vendes: reservas, pagos online, catálogo ilimitado y automatizaciones que te ahorran horas."* Este es el checklist de qué falta construir para que esa promesa sea real, no solo copy. Investigado 2026-08-09: `onlinePayments` y `bookingCalendar` ya existen como **flags de capability** (frontend `plan-limits.ts`/`capabilities.ts`, backend `PlanCapabilitiesDto`) pero no están respaldados por ninguna feature real — es deuda de producto, no solo de código.

| Item del plan | Estado real (2026-08-09) |
|---|---|
| Catálogo ilimitado | ✅ Ya funciona (`itemsPerBusiness: Infinity` en plan Emprendedor). |
| Reservas / pedidos online con panel admin | ❌ No existe. El "carrito" (`CartDrawer.tsx`) solo arma un mensaje de WhatsApp — no hay orden real guardada en el sistema, ni panel admin para verla/gestionarla. No hay modelo `Order`/`Booking` en el backend. |
| Dashboard multiusuario con roles | ❌ No existe. No hay modelo de roles/usuarios múltiples por afiliado en el backend (`UserAffiliateMap` mapea un usuario a un afiliado, pero no hay roles ni invitaciones). |
| Automatizaciones básicas (confirmaciones, recordatorios) | ❌ No existe. No hay ningún sistema de notificación automática — depende de que existan órdenes/reservas primero. |
| Pagos con Stripe (tarjeta, Apple Pay, Google Pay) | ❌ No existe. El único Stripe en el proyecto es la suscripción MaalCa→afiliado (`StripeBillingService`, `Mode = "subscription"`). No hay Stripe Connect ni ningún mecanismo para que el afiliado cobre a SU cliente. `onlinePayments: true` es un flag sin feature detrás. |
| Analytics de conversión | ⚠️ Parcial. Hoy solo hay KPIs de tráfico (visitas, escaneos QR, clics a canales) — no hay funnel de conversión porque no hay eventos de "orden completada" que medir. Depende de que exista Pedidos/Pagos primero. |
| Soporte prioritario (24h) | ⚪ No es código — es operativo (proceso de soporte, no feature de producto). |

**Orden de dependencia real** (no se puede saltar sin quedar a medias):
1. **Pagos con Stripe Connect** — sin esto, "pedidos online" es solo un formulario sin cobro real, y "analytics de conversión" no tiene qué medir. Es la base de todo lo demás.
2. **Reservas / pedidos online con panel admin** — modelo `Order`/`Booking` en el backend + pantalla de gestión en `/space/{slug}`. Usa Stripe Connect del paso 1 para el cobro.
3. **Automatizaciones básicas** — confirmaciones/recordatorios sobre las órdenes/reservas del paso 2 (email o WhatsApp).
4. **Analytics de conversión** — una vez hay eventos de orden real, agregar el funnel (visita → item visto → orden iniciada → orden pagada).
5. **Dashboard multiusuario con roles** — independiente de los anteriores, se puede hacer en paralelo si hace falta.
6. **Soporte prioritario 24h** — decisión operativa, no bloquea desarrollo.

**Criterio de aceptación de la Fase completa:** un afiliado Emprendedor puede recibir un pedido, cobrarlo con tarjeta/Apple Pay/Google Pay directo a su cuenta, verlo en un panel admin, y el cliente recibe confirmación automática — sin que WhatsApp sea el único canal de venta real.

---

## Fase 9 — Pantallas del negocio (menú + comerciales + cocina + POS) — pendiente, sin empezar

**Origen:** pedido directo 2026-08-09, a partir de la Fase 7 ya construida. El caso real: Little Dominicana Restaurant quiere varias pantallas físicas en el local, cada una con un rol distinto — una que solo muestre el menú, otra rotando comerciales/promos, o una sola pantalla que alterne entre menú y comercial según configuración. A futuro, pantalla de cocina (qué pedidos hay que preparar) y punto de venta. Son 4 productos de complejidad muy distinta bajo el mismo paraguas de "pantallas" — se separan en etapas independientes, no es una sola feature.

### Etapa A — Comerciales + rotación configurable (extiende Fase 7 directamente)

La más cercana a lo que ya existe — mismo `MenuBoard.tsx`, mismo modelo de "playlist rotativa", pero agrega un tipo de slide nuevo que no es un item del catálogo.

- [ ] Backend: nueva entidad `ScreenContent` (o similar) — no reutilizar `CatalogItem`, un comercial no es un producto: `MediaUrl` (imagen o video), `MediaType`, `DurationSeconds`, `Order`, `Active`, rango de fechas opcional (para promos con vigencia).
- [ ] Backend: `VideoUrl` en `CatalogItem` (el pendiente que ya estaba anotado en Fase 7) — para que un item del menú también pueda ser un video corto, no solo foto.
- [ ] Backend: endpoint de configuración de rotación por afiliado — qué mezcla de menú/comerciales, en qué orden (ej. "cada 3 slides de categoría, 1 comercial" o una lista explícita ordenada — a decidir el modelo exacto, empezar simple).
- [ ] Frontend dashboard: pantalla nueva en `/space/{slug}` para subir/gestionar comerciales (imagen o video) y configurar el orden de rotación — mismo patrón de upload que ya existe para imágenes de catálogo.
- [ ] Frontend board: `MenuBoard.tsx` intercala slides de comercial entre los de categoría según la configuración, reutilizando el mismo motor de rotación (`SLIDE_INTERVAL_MS`, polling) que ya existe.

**Esfuerzo:** medio — es extender infraestructura que ya funciona, no construir desde cero. Es lo lógico para empezar.

### Mejora previa a B — Idioma y tema del board (deuda de Etapa A)

**Origen:** pedido 2026-08-09. Hoy `MenuBoard.tsx` tiene el idioma (español) y el tema (oscuro) escritos a mano en el código — no hay ningún ajuste. Es una laguna real de Etapa A: una TV no tiene usuario que le dé click a un toggle de idioma como sí lo tiene el sitio público (`useSimpleLanguage` es una preferencia de visitante, no aplica a una pantalla que nadie toca). Necesita ser una preferencia **del negocio**, no del visitante.

- [ ] Backend: `Affiliate.Language` (`"es" | "en"`, default `"es"`) y `Affiliate.BoardTheme` (`Light | Dark`, default `Dark` — preserva el comportamiento actual sin romper nada para quien ya tiene un board abierto).
- [ ] Se exponen en el mismo `PublicCatalogResponse` que ya trae `screenAds`/`adFrequency` — el board los lee del mismo fetch, sin llamada nueva.
- [ ] `MenuBoard.tsx`: strings fijos ("Catálogo no disponible...", etc.) pasan a un diccionario ES/EN chico (no es el sistema de traducción completo del sitio — el board no necesita eso), y las clases de color cambian según `BoardTheme`.
- [ ] Dashboard: se agrega al panel de `/space/{slug}/board` que ya existe (Etapa A) — dos selects más, mismo patrón que `AdFrequency` (guarda vía `PATCH /profile`).

**Esfuerzo:** bajo. Es la base que Etapa B va a reusar (ver abajo) — por eso va primero, no después.

### Etapa B — Múltiples pantallas por afiliado (una TV = un rol)

Hoy `/{slug}/board` es una sola vista fija. Un negocio con 2+ TVs (una de menú, una de comerciales) no puede configurarlas distinto con la ruta actual.

- [ ] Backend: entidad `Screen` por afiliado (`Id`, `Nombre` ej. "TV Entrada", `Tipo`: MenuBoard | Comerciales | Mixta).
- [ ] **Herencia de configuración:** cada `Screen` puede *heredar* Idioma/Tema/Frecuencia de comerciales del afiliado (comportamiento por defecto, sin tocar nada) o *sobreescribirlos* puntualmente (campos nullable en `Screen` — null = usa el del afiliado). Mismo patrón para categorías visibles: null = todas, o una lista para limitar una TV a, ej., solo "Bebidas".
- [ ] Ruta pasa a `/{slug}/board/{screenId}` — cada URL se abre en una TV distinta. `/{slug}/board` (sin id) se mantiene como alias a la "pantalla por defecto" del afiliado, para no romper QRs ya impresos de Etapa A.
- [ ] Dashboard: la pantalla `/space/{slug}/board` (ya existe) pasa de "un board" a "lista de pantallas" — crear/nombrar/configurar cada una (con la opción de heredar o sobreescribir), generar su link/QR — mismo patrón que el QR de Identidad ya existente.

**Esfuerzo:** medio-alto, sobre todo por la UI de administración (pasar de un formulario a una lista con estado por pantalla). El modelo de datos es directo porque ya viene diseñado para heredar en vez de duplicar configuración.

### Etapa C — Pantalla de cocina (Kitchen Display System)

A diferencia de A y B, esto no es contenido rotativo — es **operación en vivo**: qué pedidos hay que preparar ahora mismo. Depende 100% de Orders (Fase 8, ya construido).

- [ ] Vista tipo tablero: pedidos `Paid` sin `Fulfilled`, agrupados por antigüedad, con acción rápida para marcar en preparación / listo (reusa `PATCH /orders/{orderId}/status` que ya existe).
- [ ] Tiempo real en vez de polling: el proyecto **ya tiene infraestructura de SignalR** (`QueueHub.cs`, usada hoy para la fila de la barbería) — mismo patrón aplicable aquí en vez de inventar algo nuevo: un hub que notifica "nuevo pedido" al instante en lugar de esperar el próximo poll.

**Esfuerzo:** medio. Técnicamente más simple que A/B (no hay media, no hay rotación) pero es un flujo operativo real, no una pantalla pasiva — necesita más cuidado de UX (un cocinero no puede perderse un pedido).

### Etapa D — Punto de venta (POS)

Esta es categóricamente distinta a las otras tres — no es "una pantalla más", es un producto completo (cobro en persona, turnos de caja, posiblemente impresión de recibos). Antes de estimar esfuerzo hay una decisión estratégica pendiente:

- **Decisión (2026-08-09): POS propio**, no integración con terceros (Square/Clover). Implica: manejo de efectivo, hardware compatible (impresora de recibos, cajón/lector de tarjeta), y cumplimiento fiscal según el negocio — alcance real de meses, se planifica en detalle cuando le toque el turno (después de A/B/C), no ahora.

**Orden confirmado:** A → B → C → D. Arrancando por Etapa A.

---

## Orden de construcción recomendado y dependencias

1. Fase 1 (shell) — sin dependencias de API nuevas.
2. Fase 2 (dashboard compositivo) — depende de que `maalca-api` exponga `ModulosActivos` (Fase B del spec de API). Si no está listo, se puede avanzar con los 3 módulos base hardcodeados temporalmente y migrar cuando el endpoint esté.
3. Fase 3 (onboarding rápido) — depende de `OnboardingRequest` extendido (Fase D del spec de API).
4. Fase 4 (editor) — Configuración ya tiene backend listo (`PATCH /profile`); Canales depende de la Fase A del spec de API.
5. Fase 5 (layout por categoría) — sin dependencia de backend nueva más allá del catálogo existente; es el bloque de mayor esfuerzo, planificar aparte.
6. Fase 6 (Módulos) — sin dependencias, es principalmente contenido estático + los 3 módulos reales.
7. Fase 7 (Menu Board Smart TV) — depende de agregar soporte de video al catálogo en `maalca-api` (no existe hoy); el resto (rotación, layout 16:9, consumo del catálogo real) no tiene dependencia de backend nueva.
8. Fase 8 (Plan Emprendedor completo) — la de mayor esfuerzo del programa, es multi-sprint. Empieza por Stripe Connect (pagos), todo lo demás depende de eso en cascada. Ver orden de dependencia dentro de la Fase 8.
9. Fase 9 (Pantallas: menú + comerciales + cocina + POS) — Etapa A extiende Fase 7 (ya hecha). Etapa C depende de Orders (Fase 8, ya hecha). Etapa D es decisión de producto, no de código — no programar sin definir build-vs-integrar primero.

QA de Ciri entre cada fase antes de avanzar a la siguiente, como en el resto del proyecto.

---

## Checklist de calidad obligatorio al tocar cualquier template público

Cada vez que se rediseñe o modifique Restaurant.tsx, Barber.tsx, Service.tsx, o Retail.tsx, verificar estos puntos ANTES de reportar como terminado:

- [ ] **Descripción de item visible.** Cada tarjeta de catálogo debe mostrar la descripción del item (no solo nombre/foto/precio). Barber lo perdió en su rediseño y tuvo que corregirse.
- [ ] **Traducción de rótulos fijos de la interfaz.** Encabezados como "Servicios", "Sobre nosotros", "Cómo trabajamos", "Preguntas frecuentes" deben pasar por el mismo mecanismo de traducción (useSimpleLanguage/getText) que usa el resto del sitio — no alcanza con que el CONTENIDO del negocio (descriptionEn) cambie de idioma si la estructura de la página se queda fija en español.
- [ ] **coverImageUrl se renderiza** en el hero de cada template.
- [ ] **Nav/footer de marketing NO debe aparecer** dentro de /space, /login, /onboarding.
- [ ] **Verificar colisión de prefijo** en cualquier lista de exclusión de rutas basada en startsWith — un slug real puede empezar con el mismo prefijo que una ruta reservada.

Este checklist existe porque cada uno de estos puntos ya causó al menos un ciclo de "arreglarlo después de que se coló" en producción.

---

## Deuda técnica detectada (fuera de alcance — no tocar sin decisión explícita)

**`src/hooks/useSimpleLanguage.tsx` — claves de traducción duplicadas.** El diccionario `translations` tiene al menos una clave definida dos veces dentro del mismo bloque de idioma: `editorial.hero.title` aparece 2 veces en `es` y 2 veces en `en`. Como en JS la última definición de una clave de objeto gana, la copy real de la página Editorial ("Publicar tu libro no debería costarte tus ahorros...") queda silenciosamente sobrescrita por una segunda definición genérica ("Editorial" / "MaalCa") que aparece más abajo en el mismo archivo — no rompe nada visible hoy porque `t('editorial.hero.title')` simplemente devuelve la última, pero es un bug latente si alguien reordena o edita el archivo sin saber que hay dos definiciones. No se detectaron más duplicados dentro de un mismo bloque de idioma en esta revisión (el archivo cruza ~1200 claves; sí hay ~29 claves presentes en `es` sin equivalente en `en`, que es un hallazgo relacionado pero distinto — quedaría bien auditarlo en la misma limpieza). Pendiente: consolidar duplicados, decidir cuál copy es la correcta para `editorial.hero.title`, y considerar partir este archivo (hoy un solo diccionario gigante) en algo más mantenible.
