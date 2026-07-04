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

## Orden de construcción recomendado y dependencias

1. Fase 1 (shell) — sin dependencias de API nuevas.
2. Fase 2 (dashboard compositivo) — depende de que `maalca-api` exponga `ModulosActivos` (Fase B del spec de API). Si no está listo, se puede avanzar con los 3 módulos base hardcodeados temporalmente y migrar cuando el endpoint esté.
3. Fase 3 (onboarding rápido) — depende de `OnboardingRequest` extendido (Fase D del spec de API).
4. Fase 4 (editor) — Configuración ya tiene backend listo (`PATCH /profile`); Canales depende de la Fase A del spec de API.
5. Fase 5 (layout por categoría) — sin dependencia de backend nueva más allá del catálogo existente; es el bloque de mayor esfuerzo, planificar aparte.
6. Fase 6 (Módulos) — sin dependencias, es principalmente contenido estático + los 3 módulos reales.

QA de Ciri entre cada fase antes de avanzar a la siguiente, como en el resto del proyecto.
