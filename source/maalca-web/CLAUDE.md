# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MaalCa Web is a luxury catering business website built with Next.js 15, TypeScript, and Tailwind CSS 4. The project uses Framer Motion for animations and follows modern React patterns with the App Router structure and Turbopack for development and build optimization.

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

### Styling Conventions
- Use Tailwind utility classes for styling
- CSS custom properties are defined in `globals.css` 
- Dark mode styles are handled via CSS media queries
- Component-specific styles should use Tailwind classes rather than separate CSS files
- Custom gradient variables are available for theming (`--gradient-primary`, `--gradient-secondary`, etc.)

### Animation Patterns
- Framer Motion is used for page transitions and component animations
- Common patterns include fade-in, slide-up animations with staggered delays
- Use `motion` components for declarative animations with `initial`, `animate`, and `transition` props