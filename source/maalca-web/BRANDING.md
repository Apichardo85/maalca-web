# BRANDING Y DARK MODE - MaalCa Web

**VERSIÓN CORRECTA:** Commit 8e9adb4 (2025-09-18)
**ÚLTIMA VALIDACIÓN:** 2025-10-29

---

## ⚠️ REGLAS CRÍTICAS - NO MODIFICAR

### 1. ARQUITECTURA DE PÁGINAS

**PÁGINA PRINCIPAL ACTIVA:**
- ✅ `src/app/(marketing)/page.tsx` - Esta es la página que Next.js sirve en la ruta `/`
- ❌ `src/app/page.tsx` - NO USAR - Solo existe por estructura de Next.js

**IMPORTANTE:** Debido al Route Group `(marketing)`, Next.js sirve automáticamente `src/app/(marketing)/page.tsx` en la ruta raíz. Cualquier cambio debe hacerse en este archivo.

---

## 2. SISTEMA DE ESTILOS CORRECTO

### ✅ USAR: Clases Directas de Tailwind

```tsx
// CORRECTO - Clases directas
<h1 className="text-white">MaalCa</h1>
<span className="text-red-600">Ecosistema</span>
<p className="text-gray-300">Descripción</p>
<div className="bg-black">Content</div>
<button className="bg-red-600 hover:bg-red-700">CTA</button>
```

### ❌ NO USAR: Clases Semánticas

```tsx
// INCORRECTO - NO usar estas clases
<h1 className="text-text-primary">MaalCa</h1>
<span className="text-brand-primary">Ecosistema</span>
<p className="text-text-secondary">Descripción</p>
<div className="bg-background">Content</div>
<div className="bg-surface">Card</div>
```

**RAZÓN:** Las clases semánticas (`text-brand-primary`, `bg-surface`, etc.) NO están definidas en el sistema actual de Tailwind. Solo existen clases directas.

---

## 3. PATRÓN DE BRANDING - COLORES

### Paleta de Colores Oficial

#### Rojo MaalCa (Brand Color)
```css
/* Uso principal */
text-red-600      /* Títulos de marca, CTAs principales */
bg-red-600        /* Backgrounds de botones primarios */

/* Estados hover */
text-red-700
bg-red-700
hover:bg-red-700

/* Tonos alternos */
text-red-500      /* Acentos, highlights */
text-red-400      /* Links en hover */
```

#### Blancos y Grises
```css
/* Textos principales */
text-white        /* Títulos principales, texto en fondos oscuros */
text-gray-300     /* Descripciones, subtítulos */
text-gray-400     /* Textos secundarios, placeholders */

/* Backgrounds */
bg-black          /* Background principal */
bg-gray-900       /* Secciones alternas */
bg-gray-800       /* Cards, elementos elevados */
```

---

## 4. ESTRUCTURA DE HERO SECTION

```tsx
{/* CORRECTO - Hero con gradiente animado */}
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Animated Background */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900/20" />
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          "radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)",
          "radial-gradient(circle at 40% 40%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)",
        ]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>

  {/* Título con patrón de branding */}
  <motion.h1 className="font-display text-6xl sm:text-8xl lg:text-9xl font-bold mb-8 leading-tight">
    <span className="text-white">MaalCa</span>
    <br />
    <span className="text-red-600">Ecosistema</span>
    <br />
    <span className="text-gray-400">Creativo</span>
  </motion.h1>
</section>
```

---

## 5. PATRÓN DE BOTONES (CTAs)

```tsx
{/* Botón Primario - Rojo */}
<Button
  variant="primary"
  size="lg"
  className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 text-xl px-12 py-4"
>
  Conoce nuestros proyectos
</Button>

{/* Botón Secondary - Outline Blanco */}
<Button
  variant="outline"
  size="lg"
  className="border-white text-white hover:bg-white hover:text-black text-xl px-12 py-4"
>
  Únete al ecosistema
</Button>
```

---

## 6. DARK MODE - NO IMPLEMENTADO ACTUALMENTE

**ESTADO ACTUAL:** El sitio NO tiene dark mode toggle funcional.

**DISEÑO:** El sitio está diseñado con un tema OSCURO fijo:
- Background: `bg-black`, `bg-gray-900`
- Texto: `text-white`, `text-gray-300`
- No se usan variantes `dark:` de Tailwind

### ⚠️ Si se implementa Dark Mode en el futuro:

**NO HACER:**
- ❌ NO crear clases semánticas (`bg-surface`, `text-text-primary`)
- ❌ NO cambiar clases existentes que funcionan
- ❌ NO crear nuevos componentes sin consultar

**SÍ HACER:**
- ✅ Agregar variantes `dark:` a clases existentes
- ✅ Ejemplo: `bg-white dark:bg-gray-900`
- ✅ Ejemplo: `text-slate-900 dark:text-white`
- ✅ Mantener `text-red-600` sin cambios (brand color)

---

## 7. COMPONENTES - NO REFACTORIZAR SIN APROBACIÓN

**ESTADO ACTUAL:** El código usa estructura inline en `(marketing)/page.tsx`

### ❌ NO HACER:
- NO extraer componentes sin aprobación explícita
- NO crear carpetas `components/sections/` o `data/` sin consultar
- NO "componentizar" código que funciona
- NO crear "mejores prácticas" no solicitadas

### ✅ SÍ HACER:
- Mantener el código como está
- Solo modificar si hay un bug específico
- Preguntar antes de refactorizar

---

## 8. ARCHIVOS CLAVE - REFERENCIA

### Página Principal
```
src/app/(marketing)/page.tsx   ← ESTA ES LA PÁGINA ACTIVA
```

### Datos
```
src/data/index.ts              ← Exports de projects y affiliates
src/data/mock/projects.ts      ← Data de proyectos
```

### Componentes UI
```
src/components/ui/Button.tsx   ← Botón reutilizable
src/components/ui/ProjectImage.tsx
```

---

## 9. VALIDACIÓN VISUAL

**Si el sitio se ve así, está CORRECTO:**
- ✅ Background negro/oscuro
- ✅ "MaalCa" en blanco
- ✅ "Ecosistema" en rojo
- ✅ "Creativo" en gris
- ✅ Botón rojo "Conoce nuestros proyectos"
- ✅ Botón outline blanco "Únete al ecosistema"
- ✅ Gradiente rojo sutil animado en background

**Si el sitio se ve así, está ROTO:**
- ❌ Textos invisibles (contraste bajo)
- ❌ Colores semánticos rotos
- ❌ Componentes faltantes/errores
- ❌ Stats, timeline, o sections sin estilo

---

## 10. COMANDOS DE EMERGENCIA

### Restaurar a versión correcta:
```bash
git status                    # Ver qué cambió
git restore src/app/          # Restaurar todos los cambios en app/
git restore src/components/   # Restaurar componentes
git clean -fd src/            # Limpiar archivos no tracked
git reset --hard 8e9adb4      # Nuclear option - volver a commit correcto
```

### Verificar página activa:
```bash
ls -la src/app/ | grep page.tsx
ls -la src/app/\(marketing\)/ | grep page.tsx
```

---

## 11. HISTORIAL DE CAMBIOS

| Fecha | Commit | Descripción |
|-------|--------|-------------|
| 2025-09-18 | 8e9adb4 | Versión correcta estable - MaalCa Properties enhancements |
| 2025-10-29 | - | Documentación de branding creada después de incident |

---

## 12. CONTACTO Y APROBACIONES

**ANTES de hacer cambios visuales o de estructura:**
1. Documentar cambios propuestos
2. Obtener aprobación del usuario
3. Crear branch de trabajo
4. Validar visualmente
5. Solo entonces hacer commit

**NO asumir mejoras. NO refactorizar sin permiso. SIEMPRE preguntar.**

---

**VERSIÓN DEL DOCUMENTO:** 1.0
**ÚLTIMA ACTUALIZACIÓN:** 2025-10-29
**COMMIT BASE:** 8e9adb4
