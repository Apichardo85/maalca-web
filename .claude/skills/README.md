# MaalCa Skills System

Skills personalizados para automatizar tareas comunes en el proyecto MaalCa-Web.

## Skills disponibles

| Skill | Comando | Descripción |
|-------|---------|-------------|
| **dashboard-module** | `/dashboard-module` | Crear módulos del dashboard multi-tenant |
| **dashboard-redesign** | `/dashboard-redesign` | Auditar y corregir diseño visual de módulos (2026) |
| **dashboard-table** | `/dashboard-table` | Generar tablas con Server Component + ResponsiveTable |
| **dashboard-form** | `/dashboard-form` | Generar forms validados con service layer + toast |
| **dashboard-chart** | `/dashboard-chart` | Generar charts con Recharts + ChartCard wrapper |
| **api-endpoint** | `/api-endpoint` | Crear endpoints de API con el patrón apiClient |
| **component** | `/component` | Crear componentes React con estilos correctos |
| **affiliate** | `/affiliate` | Configurar nuevos afiliados en el sistema |
| **performance** | `/performance` | Optimizar código siguiendo best practices |

## Cómo usar los skills

### Opción 1: Invocar directamente
```
/dashboard-module crear módulo de "loyalty" para programa de puntos
```

### Opción 2: Referenciar en contexto
```
Quiero agregar un nuevo afiliado llamado "La Bodega" que es una tienda de víveres.
```
Claude automáticamente usará el skill `/affiliate` basado en el contexto.

### Opción 3: Pedir que siga las reglas
```
Crea un componente Card siguiendo las reglas de /component
```

## Estructura de un skill

Cada skill tiene un archivo `SKILL.md` con:

1. **Contexto** - Información sobre cómo funciona en el proyecto
2. **Reglas obligatorias** - Lo que DEBE seguirse siempre
3. **Patrones/Ejemplos** - Código de referencia
4. **Checklist** - Verificaciones antes de completar
5. **Referencias** - Archivos del proyecto como ejemplo

## Crear un nuevo skill

1. Crear carpeta en `.claude/skills/{skill-name}/`
2. Crear archivo `SKILL.md` siguiendo el formato
3. Documentar reglas específicas del proyecto

### Template básico

```markdown
# Skill: {Nombre}

{Descripción breve de qué hace el skill}

## Contexto

{Información relevante del proyecto}

## Reglas obligatorias

### 1. {Regla importante}
\`\`\`typescript
// ✅ CORRECTO
...

// ❌ INCORRECTO
...
\`\`\`

## Checklist antes de completar

- [ ] {Verificación 1}
- [ ] {Verificación 2}

## Referencias

- `src/path/to/example.ts` - Descripción
```

## Beneficios

1. **Consistencia** - Mismo patrón en todo el codebase
2. **Velocidad** - No hay que explicar reglas cada vez
3. **Calidad** - Checklists previenen errores comunes
4. **Aprendizaje** - Las reglas documentan best practices
5. **Extensible** - Fácil agregar nuevos skills

## Skills por tipo de tarea

| Si necesitas... | Usa este skill |
|-----------------|----------------|
| Agregar página al dashboard | `/dashboard-module` |
| Mejorar diseño visual de módulo | `/dashboard-redesign` |
| Tabla con filtros, sort, paginación | `/dashboard-table` |
| Form modal con validación real | `/dashboard-form` |
| Gráficos con Recharts | `/dashboard-chart` |
| Conectar con el backend | `/api-endpoint` |
| Crear UI component | `/component` |
| Nuevo negocio/afiliado | `/affiliate` |
| Mejorar rendimiento | `/performance` |

## Mantenimiento

Los skills deben actualizarse cuando:
- Cambian patrones del proyecto
- Se agregan nuevas dependencias
- Se descubren mejores prácticas
- Hay errores recurrentes que evitar
