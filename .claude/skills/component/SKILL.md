# Skill: Component

Crea componentes React siguiendo los patrones y estilos del proyecto MaalCa.

## Contexto

El proyecto usa:
- **React 19** con Server Components por defecto
- **Tailwind CSS 4** con clases directas (NO semánticas)
- **Framer Motion** para animaciones
- **TypeScript** estricto

## Estructura de componentes

```
src/components/
├── dashboard/           # Componentes del dashboard multi-tenant
│   ├── DashboardCard.tsx
│   ├── DashboardHeader.tsx
│   └── modules/         # Componentes por módulo
├── ui/                  # Componentes UI reutilizables
│   ├── ResponsiveTable.tsx
│   ├── TableActionButton.tsx
│   └── buttons.tsx
├── layout/              # Header, Footer, Navigation
├── sections/            # Secciones de páginas marketing
└── brands/              # Componentes específicos por marca
```

## Reglas de estilos (CRÍTICO)

### 1. SOLO clases Tailwind directas
```typescript
// ✅ CORRECTO
<div className="bg-gray-900 text-white border border-gray-800">
<button className="bg-red-600 hover:bg-red-700 text-white">
<p className="text-gray-400">

// ❌ INCORRECTO - Clases semánticas prohibidas
<div className="bg-surface text-text-primary">
<button className="bg-brand-primary">
<p className="text-text-secondary">
```

### 2. Paleta de colores permitida
```typescript
// Backgrounds
"bg-black"      // Fondo principal
"bg-gray-900"   // Cards, contenedores
"bg-gray-800"   // Hover states, bordes

// Textos
"text-white"    // Texto principal
"text-gray-300" // Texto secundario
"text-gray-400" // Texto terciario/muted

// Brand (solo para CTAs y acentos)
"text-red-600"  // Acento brand
"bg-red-600"    // Botones primarios
"hover:bg-red-700"

// Bordes
"border-gray-800"
"border-gray-700"
```

### 3. Componente Server vs Client
```typescript
// Server Component (default) - para datos estáticos
export function StaticCard({ title }: { title: string }) {
  return <div className="bg-gray-900 p-4">{title}</div>;
}

// Client Component - solo cuando necesitas interactividad
"use client";
import { useState } from "react";

export function InteractiveCard({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

## Patrones de componentes

### Card básica
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 p-6 ${className || ""}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
```

### Botón con variantes
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className || ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Componente con animación
```typescript
"use client";
import { motion } from "framer-motion";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
}

export function AnimatedCard({ children, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-900 rounded-lg border border-gray-800 p-6"
    >
      {children}
    </motion.div>
  );
}
```

## Props y tipos

### 1. Siempre definir interface para props
```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
  className?: string;  // Siempre permitir className para extensibilidad
}
```

### 2. Usar React.ComponentPropsWithoutRef para extensión
```typescript
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary";
}
```

### 3. Exportar tipos si son reutilizables
```typescript
export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

export function Table<T>({ columns, data }: TableProps<T>) { ... }
```

## Checklist antes de completar

- [ ] Props tipadas con interface
- [ ] `className` prop para extensibilidad
- [ ] Solo clases Tailwind directas (no semánticas)
- [ ] "use client" solo si hay hooks/eventos
- [ ] JSDoc para componentes complejos

## Referencias

- `src/components/ui/ResponsiveTable.tsx` - Componente complejo con genéricos
- `src/components/dashboard/DashboardCard.tsx` - Card pattern
- `src/components/ui/buttons.tsx` - Variantes de botones
