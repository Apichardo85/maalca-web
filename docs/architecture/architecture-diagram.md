# Diagrama de Arquitectura - Optimización MaalCa Web

## 🏗️ Arquitectura Actual vs. Propuesta

### Arquitectura Actual (PROBLEMÁTICA)

```mermaid
graph TD
    A[Usuario] --> B[Next.js App]
    B --> C[Todas las páginas son Client Components]
    C --> D[Header Client Component]
    C --> E[39 páginas con use client]
    C --> F[Framer Motion en todas partes]
    
    E --> G[Bundle JS masivo]
    F --> G
    D --> G
    
    G --> H[Hidratación lenta]
    G --> I[Performance pobre]
    G --> J[Navegación pesada]
    
    style C fill:#ff6b6b
    style E fill:#ff6b6b
    style F fill:#ff6b6b
    style G fill:#ff6b6b
    style H fill:#ff6b6b
    style I fill:#ff6b6b
    style J fill:#ff6b6b
```

### Arquitectura Propuesta (OPTIMIZADA)

```mermaid
graph TD
    A[Usuario] --> B[Next.js 15 App Router]
    
    B --> C[Server Components por defecto]
    B --> D[Client Components selectivos]
    
    C --> E[Header híbrido]
    C --> F[Páginas Server]
    C --> G[Secciones estáticas]
    
    D --> H[Componentes interactivos lazy]
    D --> I[Formularios]
    D --> J[Widgets dinámicos]
    
    F --> K[HTML pre-renderizado]
    G --> K
    E --> K
    
    K --> L[Carga instantánea]
    K --> M[SEO optimizado]
    K --> N[Bundle JS mínimo]
    
    H --> O[Lazy loading]
    I --> O
    J --> O
    
    O --> P[JS solo cuando se necesita]
    
    style C fill:#51cf66
    style D fill:#51cf66
    style K fill:#51cf66
    style L fill:#51cf66
    style M fill:#51cf66
    style N fill:#51cf66
    style P fill:#51cf66
```

---

## 📦 Estructura de Componentes

### Componentes por Tipo

```mermaid
graph LR
    A[Componentes] --> B[Server Components]
    A --> C[Client Components]
    
    B --> D[Layout]
    B --> E[Páginas]
    B --> F[Secciones estáticas]
    B --> G[Contenido]
    
    C --> H[Interactivos]
    C --> I[Formularios]
    C --> J[Widgets]
    
    H --> K[Lazy Loading]
    I --> K
    J --> K
    
    style B fill:#51cf66
    style C fill:#fab005
    style K fill:#22b8cf
```

---

## 🔄 Flujo de Carga de Página

### Página Landing (Marketing)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as Server
    participant B as Browser
    participant C as Client JS
    
    U->>S: Request /editorial
    S->>S: Fetch data
    S->>S: Render HTML
    S->>B: HTML completo (Server Component)
    B->>U: Muestra contenido inmediatamente
    
    Note over B: Usuario ya puede ver y leer
    
    B->>C: Descarga JS mínimo
    C->>B: Hidrata componentes interactivos
    B->>U: Componentes interactivos listos
    
    Note over U: Carga progresiva, no bloquea
```

### Página de Afiliado (con Commerce)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant S as Server
    participant B as Browser
    participant L as Lazy Components
    
    U->>S: Request /pegote-barber
    S->>S: Fetch affiliate data
    S->>B: HTML estático pre-renderizado
    B->>U: Hero, servicios, equipo visible
    
    Note over U: Contenido principal ya cargado
    
    U->>B: Scroll hacia abajo
    B->>L: Lazy load BookingWidget
    L->>B: Componente interactivo cargado
    
    U->>B: Click en producto
    B->>L: Lazy load ShoppingCart
    L->>B: Cart cargado
    
    Note over U: JS se carga solo cuando se necesita
```

---

## 🗂️ Organización de Archivos

### Estructura Actual

```
src/
├── app/
│   ├── page.tsx ("use client" ❌)
│   ├── layout.tsx
│   ├── editorial/
│   │   └── page.tsx ("use client" ❌)
│   ├── pegote-barber/
│   │   └── page.tsx ("use client" ❌)
│   └── dashboard/
│       └── page.tsx ("use client" ❌)
└── components/
    ├── Header.tsx ("use client" ❌)
    └── (componentes mezclados)
```

### Estructura Propuesta

```
src/
├── app/
│   ├── page.tsx (Server ✅)
│   ├── layout.tsx (Server ✅)
│   │
│   ├── editorial/
│   │   └── page.tsx (Server ✅)
│   │
│   ├── [affiliate]/
│   │   └── page.tsx (Server ✅)
│   │
│   └── dashboard/
│       ├── layout.tsx (Client - necesario)
│       └── [affiliateId]/
│           └── page.tsx (Server con datos iniciales ✅)
│
└── components/
    ├── layout/
    │   ├── Header.tsx (Server ✅)
    │   ├── NavBar.tsx (Server ✅)
    │   └── MobileMenu.tsx (Client lazy)
    │
    ├── sections/ (Server ✅)
    │   ├── HeroSection.tsx
    │   ├── FeaturesGrid.tsx
    │   └── CTASection.tsx
    │
    ├── interactive/ (Client lazy)
    │   ├── BookingWidget.tsx
    │   ├── ShoppingCart.tsx
    │   └── ContactForm.tsx
    │
    └── ui/
        ├── base/ (Server ✅)
        │   ├── Button.tsx
        │   ├── Card.tsx
        │   └── Typography.tsx
        │
        └── client/ (Client)
            ├── Modal.tsx
            └── Dropdown.tsx
```

---

## ⚡ Flujo de Optimización por Página

### Conversión de Client a Server Component

```mermaid
flowchart TD
    A[Página actual Client Component] --> B{¿Necesita estado o eventos?}
    
    B -->|No| C[Convertir completamente a Server]
    B -->|Sí| D{¿Toda la página?}
    
    D -->|No| E[Separar en Server + Client]
    D -->|Sí| F[Mantener Client pero optimizar]
    
    E --> G[Parte estática = Server]
    E --> H[Parte interactiva = Client]
    
    H --> I[Hacer lazy loading]
    
    C --> J[Beneficio completo]
    G --> K[Beneficio parcial]
    I --> K
    F --> L[Beneficio mínimo]
    
    style C fill:#51cf66
    style E fill:#fab005
    style F fill:#ff6b6b
    style J fill:#51cf66
    style K fill:#fab005
    style L fill:#ff6b6b
```

### Decisión: ¿Framer Motion o CSS?

```mermaid
flowchart TD
    A[¿Necesitas animación?] --> B{¿Tipo de animación?}
    
    B -->|Fade in/out| C[CSS Animation]
    B -->|Slide simple| C
    B -->|Scale simple| C
    B -->|Hover effect| C
    
    B -->|Drag & Drop| D[Framer Motion]
    B -->|Gestos complejos| D
    B -->|Layout animations| D
    B -->|Coordinated sequences| D
    
    C --> E[Mejor performance]
    C --> F[Menor bundle]
    
    D --> G[Usar lazy loading]
    D --> H[Solo en Client Component]
    
    style C fill:#51cf66
    style D fill:#fab005
    style E fill:#51cf66
    style F fill:#51cf66
```

---

## 📊 Estrategia de Carga

### Bundle Splitting Strategy

```mermaid
graph TB
    A[App Bundle] --> B[Core Chunks]
    A --> C[Route Chunks]
    A --> D[Lazy Chunks]
    
    B --> E[Layout común]
    B --> F[Componentes base]
    
    C --> G[Home page]
    C --> H[Editorial page]
    C --> I[Affiliate pages]
    C --> J[Dashboard pages]
    
    D --> K[Framer Motion]
    D --> L[Maps Mapbox]
    D --> M[EPUB Reader]
    D --> N[Charts]
    
    E --> O[Carga inmediata]
    F --> O
    
    G --> P[Carga por ruta]
    H --> P
    I --> P
    J --> P
    
    K --> Q[Carga bajo demanda]
    L --> Q
    M --> Q
    N --> Q
    
    style O fill:#51cf66
    style P fill:#fab005
    style Q fill:#22b8cf
```

---

## 🎯 Modelo de Priorización

### Matriz de Refactorización

```mermaid
quadrantChart
    title Prioridad de Refactorización
    x-axis Bajo Impacto --> Alto Impacto
    y-axis Bajo Esfuerzo --> Alto Esfuerzo
    
    quadrant-1 Hacer después
    quadrant-2 Hacer ahora (Quick Wins)
    quadrant-3 Evaluar necesidad
    quadrant-4 Planificar bien
    
    Home Page: [0.9, 0.8]
    Editorial: [0.85, 0.7]
    Header: [0.95, 0.5]
    CSS Global: [0.9, 0.2]
    Servicios: [0.6, 0.3]
    Dashboard: [0.7, 0.9]
    Properties: [0.75, 0.75]
    Affiliates: [0.8, 0.7]
```

---

## 🔄 Pipeline de Implementación

```mermaid
gantt
    title Plan de Implementación por Fases
    dateFormat YYYY-MM-DD
    section Fase 1 Fundamentos
    Optimización CSS Global           :done, css, 2026-03-10, 3d
    Header Refactorizado              :active, header, 2026-03-13, 5d
    Sistema Componentes Base          :crit, base, 2026-03-15, 5d
    
    section Fase 2 Páginas Principales
    Home Page                         :home, after base, 4d
    Editorial Page                    :editorial, after home, 3d
    Ecosistema Page                   :eco, after editorial, 3d
    Servicios Page                    :services, after eco, 2d
    
    section Fase 3 Afiliados
    Template Base                     :template, after services, 4d
    Pegote Barber                     :pegote, after template, 3d
    Otras páginas afiliados           :others, after pegote, 7d
    
    section Fase 4 Properties
    Properties Refactor               :props, after others, 5d
    
    section Fase 5 Dashboard
    Dashboard Optimization            :dash, after props, 10d
    
    section Fase 6 Testing
    Performance Testing               :test, after dash, 5d
    Final Optimizations              :final, after test, 3d
```

---

## 📈 Métricas de Performance

### Comparación Antes/Después

```mermaid
graph TD
    subgraph Antes
        A1[LCP: 5-7s] --> B1[Lighthouse: 40-50]
        A2[FCP: 3-4s] --> B1
        A3[TTI: 7-10s] --> B1
        A4[Bundle: 500KB+] --> B1
    end
    
    subgraph Después
        C1[LCP: 1.5-2.5s] --> D1[Lighthouse: 90+]
        C2[FCP: 0.8-1.5s] --> D1
        C3[TTI: 2-3s] --> D1
        C4[Bundle: 150-200KB] --> D1
    end
    
    B1 -.Refactorización.-> D1
    
    style A1 fill:#ff6b6b
    style A2 fill:#ff6b6b
    style A3 fill:#ff6b6b
    style A4 fill:#ff6b6b
    style B1 fill:#ff6b6b
    
    style C1 fill:#51cf66
    style C2 fill:#51cf66
    style C3 fill:#51cf66
    style C4 fill:#51cf66
    style D1 fill:#51cf66
```

---

## 🎨 Flujo de Animaciones

### Estrategia de Animación

```mermaid
flowchart LR
    A[Elemento necesita animación] --> B{¿Tipo?}
    
    B -->|Simple fade| C[CSS @keyframes]
    B -->|Simple slide| C
    B -->|Simple scale| C
    
    B -->|Complejo| D{¿Crítico para UX?}
    
    D -->|No| E[Considerar eliminar]
    D -->|Sí| F{¿Interactivo?}
    
    F -->|No| C
    F -->|Sí| G[Framer Motion lazy]
    
    C --> H[Performance óptima]
    G --> I[Performance aceptable]
    E --> H
    
    style C fill:#51cf66
    style E fill:#51cf66
    style H fill:#51cf66
    style G fill:#fab005
    style I fill:#fab005
```

---

## 🚀 Mejoras Esperadas

### Impacto Visual por Métrica

```mermaid
graph LR
    subgraph Mejoras de Performance
        A[Tiempo Carga] --> A1[-60%]
        B[Bundle Size] --> B1[-65%]
        C[Time to Interactive] --> C1[-70%]
        D[First Paint] --> D1[-50%]
    end
    
    subgraph Mejoras de UX
        E[Navegación Fluida] --> E1[+100%]
        F[Responsividad] --> F1[+80%]
        G[Estabilidad] --> G1[+90%]
    end
    
    subgraph Mejoras de SEO
        H[Score Lighthouse] --> H1[+100%]
        I[Indexación] --> I1[+50%]
        J[Core Web Vitals] --> J1[+120%]
    end
    
    style A1 fill:#51cf66
    style B1 fill:#51cf66
    style C1 fill:#51cf66
    style D1 fill:#51cf66
    style E1 fill:#51cf66
    style F1 fill:#51cf66
    style G1 fill:#51cf66
    style H1 fill:#51cf66
    style I1 fill:#51cf66
    style J1 fill:#51cf66
```

---

## 🎯 Resumen de Transformación

### De Monolito Client a Arquitectura Híbrida

```mermaid
graph TD
    A[Situación Actual] --> B[Todo en Cliente]
    B --> C[Performance Pobre]
    B --> D[SEO Comprometido]
    B --> E[UX Lenta]
    
    F[Situación Propuesta] --> G[Híbrido Server/Client]
    G --> H[Performance Óptima]
    G --> I[SEO Excelente]
    G --> J[UX Instantánea]
    
    C --> K[Refactorización]
    D --> K
    E --> K
    
    K --> H
    K --> I
    K --> J
    
    style A fill:#ff6b6b
    style B fill:#ff6b6b
    style C fill:#ff6b6b
    style D fill:#ff6b6b
    style E fill:#ff6b6b
    
    style F fill:#51cf66
    style G fill:#51cf66
    style H fill:#51cf66
    style I fill:#51cf66
    style J fill:#51cf66
    
    style K fill:#fab005
```

---

**Documento creado:** 2026-03-10  
**Versión:** 1.0  
**Relacionado con:** [Plan Maestro de Optimización](./performance-optimization-master-plan.md)
