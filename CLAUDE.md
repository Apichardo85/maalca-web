# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL - READ FIRST

**BEFORE making ANY changes to styling, branding, or components:**
1. Read `BRANDING.md` - Contains official branding rules and dark mode guidelines
2. The active homepage is `src/app/(marketing)/page.tsx` NOT `src/app/page.tsx`
3. Use direct Tailwind classes (e.g., `text-red-600`) NOT semantic classes (e.g., `text-brand-primary`)
4. NEVER refactor or "componentize" code without explicit user approval
5. ALWAYS ask before implementing "best practices" or structural changes

**Stable Version:** Commit 8e9adb4 (2025-09-18) - This is the correct reference point.

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
- **ONLY use direct Tailwind classes**: `text-white`, `bg-black`, `text-red-600`
- **NEVER use semantic classes**: NO `text-brand-primary`, NO `bg-surface`, NO `text-text-primary`
- The site uses a FIXED dark theme (no dark mode toggle currently)
- Component-specific styles should use Tailwind classes rather than separate CSS files
- See `BRANDING.md` for complete color palette and branding rules

**Current Color System:**
- Brand: `text-red-600`, `bg-red-600`, `hover:bg-red-700`
- Text: `text-white`, `text-gray-300`, `text-gray-400`
- Backgrounds: `bg-black`, `bg-gray-900`, `bg-gray-800`

### Animation Patterns
- Framer Motion is used for page transitions and component animations
- Common patterns include fade-in, slide-up animations with staggered delays
- Use `motion` components for declarative animations with `initial`, `animate`, and `transition` props

---

## Working with This Codebase

### Route Structure
- Homepage: `src/app/(marketing)/page.tsx` ← **THIS IS THE ACTIVE HOMEPAGE**
- Other routes: `src/app/{route-name}/page.tsx`
- Route Group `(marketing)` means that folder doesn't appear in URLs

### DO NOT
- ❌ Create semantic CSS classes (`text-brand-primary`, `bg-surface`)
- ❌ Refactor working code into components without approval
- ❌ Create new folder structures (`components/sections/`, `data/affiliates.ts`) without asking
- ❌ Implement dark mode using `dark:` variants without approval
- ❌ Change the branding colors (red-600 is sacred)
- ❌ Assume "best practices" are wanted - always ask first

### DO
- ✅ Read `BRANDING.md` before making style changes
- ✅ Use direct Tailwind classes as shown in existing code
- ✅ Ask before refactoring or restructuring
- ✅ Fix bugs in existing code structure
- ✅ Follow the exact patterns shown in `src/app/(marketing)/page.tsx`

### Emergency Recovery
If you break something:
```bash
git status                    # Check what changed
git restore src/app/          # Restore app directory
git reset --hard 8e9adb4      # Nuclear: back to stable version
npm run dev                   # Restart dev server
```

---

## Reference Files

- `BRANDING.md` - Official branding and color guidelines
- `src/app/(marketing)/page.tsx` - Homepage reference implementation
- `src/data/index.ts` - Central data exports
- `src/components/ui/buttons.tsx` - Button component reference