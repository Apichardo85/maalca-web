# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL - READ FIRST

**BEFORE making ANY changes to styling, branding, or components:**
1. The active homepage is `src/app/page.tsx`
2. Use **semantic tokens** (`bg-surface`, `text-text-primary`, `text-brand-primary`) defined in `globals.css` via `@theme inline`. They support light/dark automatically via CSS vars.
3. Use direct Tailwind (`bg-gray-900`, `text-white`, `text-red-600`) **only** inside affiliate-scoped pages that deliberately break the global theme (e.g. TLD, CiriWhispers, Pegote).
4. NEVER refactor or "componentize" code without explicit user approval
5. ALWAYS ask before implementing "best practices" or structural changes

**Stable Version:** Commit 8e9adb4 (2025-09-18) - This is the correct reference point.

## ⚠️ DARK MODE — DECISIÓN FINAL (no cambiar)

**Sistema elegido: `data-theme` manual. NO usar next-themes.**

- El CSS usa `[data-theme="dark"]` en `globals.css`
- `ThemeToggle` aplica `document.documentElement.setAttribute('data-theme', 'dark')` manualmente
- `ThemeProvider` de next-themes fue **eliminado** de `layout.tsx` — NO volver a añadirlo
- NO cambiar `[data-theme="dark"]` a `.dark` — rompe el ThemeToggle
- NO añadir `attribute="class"` a ningún provider de tema

---

## Project Overview

MaalCa Web is a creative ecosystem website built with Next.js 15, TypeScript, and Tailwind CSS 4. The project showcases multiple business ventures (Editorial, CiriWhispers, MaalCa Properties, etc.) with a dark-themed design and red branding. Uses Framer Motion for animations and follows modern React patterns with the App Router structure and Turbopack for development and build optimization.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application with Turbopack  
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Type Checking
TypeScript is configured with strict mode enabled. Use the TypeScript compiler for type checking:
- `npx tsc --noEmit` - Type check without emitting files

## Architecture

### Project Structure
```
src/
  app/                  # Next.js App Router directory
    catering/          # Catering service page
    layout.tsx         # Root layout with font configuration
    page.tsx          # Home page component
    globals.css       # Global styles with Tailwind imports
    favicon.ico       # Application favicon
  components/          # Reusable React components
    HeroSection.tsx   # Animated hero section component
  componentsui/       # UI component library
```

### Key Technologies
- **Next.js 15**: App Router with Turbopack for fast builds
- **TypeScript**: Strict mode configuration with path aliases (`@/*` → `./src/*`)
- **Tailwind CSS 4**: PostCSS integration with custom CSS variables
- **React 19**: Latest React with concurrent features
- **Framer Motion**: Animation library for smooth interactions and transitions
- **ESLint**: Next.js TypeScript config with core web vitals

### Styling System
- Custom CSS variables for theming (`--background`, `--foreground`)
- Dark mode support via `prefers-color-scheme`
- Geist font family (Sans and Mono) via Google Fonts
- Tailwind utility classes with custom theme configuration

### Configuration Files
- `next.config.ts` - Next.js configuration (minimal setup)
- `tsconfig.json` - TypeScript with Next.js plugin and path aliases
- `eslint.config.mjs` - Flat config with Next.js rules
- `postcss.config.mjs` - Tailwind CSS PostCSS plugin

## Development Notes

### Font Management
The application uses Playfair Display (display font) and Inter (body font) loaded via `next/font/google` with CSS variables (`--font-playfair`, `--font-inter`) for consistent typography across components.

### Import Paths
Use the `@/` alias for imports from the `src/` directory. Example: `import Component from '@/components/Component'`

### Styling Conventions - IMPORTANT
- **Default: use semantic tokens** defined in `globals.css` via `@theme inline` (Tailwind v4). They swap colors automatically between light/dark via CSS vars — no `dark:` prefix needed.
- Use direct Tailwind (`bg-gray-900`, `text-white`) **only** inside affiliate pages that intentionally override the global theme (TLD, CiriWhispers, Pegote). Mark those sections clearly.
- Dark mode is controlled manually via `data-theme="dark"` on `<html>` (see DARK MODE section above). Do not use next-themes.
- Component-specific styles should use Tailwind classes rather than separate CSS files.

**Semantic tokens (default — use these):**
- Brand: `text-brand-primary`, `bg-brand-primary`, `hover:bg-brand-primary-hover`
- Text: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Backgrounds: `bg-background`, `bg-surface`, `bg-surface-elevated`
- Borders: `border-border`, `border-border-muted`

**Direct Tailwind (exception — affiliate overrides only):**
- `bg-black`, `bg-gray-900`, `text-white`, `text-red-600`, etc.
- Always pair with `dark:` variants when used, since there's no automatic theme swap.

### Animation Patterns
- Framer Motion is used for page transitions and component animations
- Common patterns include fade-in, slide-up animations with staggered delays
- Use `motion` components for declarative animations with `initial`, `animate`, and `transition` props

---

## Working with This Codebase

### Route Structure
- Homepage: `src/app/page.tsx` ← **THIS IS THE ACTIVE HOMEPAGE**
- Other routes: `src/app/{route-name}/page.tsx`

### DO NOT
- ❌ Add new CSS tokens to `globals.css` without asking (the existing set is intentional)
- ❌ Refactor working code into components without approval
- ❌ Create new folder structures (`components/sections/`, `data/affiliates.ts`) without asking
- ❌ Change `[data-theme="dark"]` to `.dark` or reintroduce next-themes
- ❌ Change the brand color value (`--brand-primary: #dc2626` is sacred)
- ❌ Assume "best practices" are wanted - always ask first

### DO
- ✅ Default to semantic tokens (`bg-surface`, `text-text-primary`, `text-brand-primary`)
- ✅ Use direct Tailwind classes only for affiliate-scoped overrides, paired with `dark:` variants
- ✅ Ask before refactoring or restructuring
- ✅ Fix bugs in existing code structure
- ✅ Follow the exact patterns shown in `src/app/page.tsx`

### Emergency Recovery
If you break something:
```bash
git status                    # Check what changed
git restore src/app/          # Restore app directory
git reset --hard 8e9adb4      # Nuclear: back to stable version
npm run dev                   # Restart dev server
```

---

## Skills System

El proyecto tiene skills especializados en `.claude/skills/` para tareas comunes:

| Skill | Uso | Descripción |
|-------|-----|-------------|
| `/dashboard-module` | Crear módulos dashboard | Páginas multi-tenant con validaciones |
| `/dashboard-redesign` | Auditar diseño visual | Enforce estándar 2026 (glassmorphism, animations) |
| `/dashboard-table` | Tablas con datos | Server Component + ResponsiveTable + filtros + sort |
| `/dashboard-form` | Forms validados | useFormValidation + service layer + toast feedback |
| `/dashboard-chart` | Gráficos Recharts | ChartCard wrapper + theming consistente |
| `/api-endpoint` | Crear endpoints API | Patrón apiClient con tipos |
| `/component` | Crear componentes | React + Tailwind (estilos correctos) |
| `/affiliate` | Nuevo afiliado | Configurar negocio en sistema multi-tenant |
| `/performance` | Optimizar código | Best practices Next.js 15 |

**Cómo usar:** Los skills se activan automáticamente por contexto o invocando `/skill-name`.

Ver `.claude/skills/README.md` para documentación completa.

---

## Reference Files

- `src/app/globals.css` - Semantic tokens (`@theme inline`) and brand CSS vars
- `src/app/page.tsx` - Homepage reference implementation
- `src/data/index.ts` - Central data exports
- `src/components/ui/buttons.tsx` - Button component reference
- `.claude/skills/` - Skills para automatización