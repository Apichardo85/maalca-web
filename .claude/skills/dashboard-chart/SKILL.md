# Skill: Dashboard Chart

Genera secciones de gráficos con Recharts para módulos del dashboard.

## Contexto

Recharts 3.5 está instalado pero la mayoría de módulos muestran "Proximamente con Recharts" como placeholder. Este skill genera charts reales con theming consistente usando el componente `ChartCard` wrapper.

## Tipos de chart soportados

| Tipo | Componente Recharts | Uso |
|---|---|---|
| Line | `<LineChart>` | Tendencias temporales (citas/día, ingresos/mes) |
| Bar | `<BarChart>` | Comparaciones por categoría (ventas por servicio) |
| Donut | `<PieChart>` con innerRadius | Distribuciones (estados, fuentes de ingreso) |
| Area | `<AreaChart>` | Volumen acumulado |

## Reglas obligatorias

### 1. Siempre usar ChartCard wrapper

```typescript
import { ChartCard, chartColors, chartTheme } from "@/components/dashboard/shared/ChartCard";

<ChartCard
  title="Tendencia Semanal"
  icon="📈"
  timeRanges={["7d", "30d", "90d"]}
  onTimeRangeChange={(range) => setTimeRange(range)}
>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData}>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

### 2. Importar Recharts con dynamic import (NO SSR)

```typescript
import dynamic from "next/dynamic";

const ChartSection = dynamic(() => import("./components/ChartSection"), {
  ssr: false,
  loading: () => <DashboardSkeleton variant="chart" />,
});
```

Recharts usa APIs del browser que fallan en SSR. SIEMPRE lazy-load.

### 3. Colores consistentes — Usar chartColors

```typescript
import { chartColors, chartTheme } from "@/components/dashboard/shared/ChartCard";

// chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

<Line stroke={chartColors[0]} /> // Azul
<Line stroke={chartColors[1]} /> // Verde
<Bar fill={chartColors[2]} />    // Amarillo
```

**NO usar colores hardcodeados arbitrarios.** Siempre del array `chartColors`.

### 4. Theming del chart — Grid, Axis, Tooltip

```typescript
import { chartTheme } from "@/components/dashboard/shared/ChartCard";

<LineChart data={data}>
  <CartesianGrid
    strokeDasharray="3 3"
    stroke={chartTheme.grid.stroke}
    strokeOpacity={chartTheme.grid.strokeOpacity}
  />
  <XAxis
    dataKey="date"
    stroke={chartTheme.axis.stroke}
    fontSize={chartTheme.axis.fontSize}
    tickLine={false}
    axisLine={false}
  />
  <YAxis
    stroke={chartTheme.axis.stroke}
    fontSize={chartTheme.axis.fontSize}
    tickLine={false}
    axisLine={false}
  />
  <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
  <Line
    type="monotone"
    dataKey="value"
    stroke={chartColors[0]}
    strokeWidth={2}
    dot={false}
    activeDot={{ r: 4, fill: chartColors[0] }}
  />
</LineChart>
```

### 5. Line Chart — Template completo

```typescript
"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { ChartCard, chartColors, chartTheme } from "@/components/dashboard/shared/ChartCard";

interface TrendChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  icon?: string;
}

export function TrendChart({ data, title, icon = "📈" }: TrendChartProps) {
  return (
    <ChartCard title={title} icon={icon} timeRanges={["7d", "30d", "90d"]}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.stroke} strokeOpacity={chartTheme.grid.strokeOpacity} />
          <XAxis dataKey="date" stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
```

### 6. Bar Chart — Template completo

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ComparisonChart({ data, title }: { data: Array<{ name: string; value: number }>; title: string }) {
  return (
    <ChartCard title={title} icon="📊">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid.stroke} strokeOpacity={chartTheme.grid.strokeOpacity} />
          <XAxis dataKey="name" stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={chartTheme.axis.stroke} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Bar dataKey="value" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
```

### 7. Donut Chart — Template completo

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function DistributionChart({ data, title }: { data: Array<{ name: string; value: number }>; title: string }) {
  return (
    <ChartCard title={title} icon="🍩">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartColors[index % chartColors.length] }}
            />
            <span className="text-gray-600 dark:text-gray-400">{entry.name}</span>
            <span className="font-medium text-gray-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
```

## Checklist antes de completar

- [ ] Chart importado con `dynamic(() => import(...), { ssr: false })`
- [ ] Usa `ChartCard` wrapper (NO `DashboardCard` directo para charts)
- [ ] Colores del array `chartColors` (NO hardcodeados)
- [ ] Grid/Axis/Tooltip usan `chartTheme`
- [ ] `ResponsiveContainer` con width="100%" height="100%"
- [ ] Loading fallback usa `DashboardSkeleton variant="chart"`
- [ ] Chart responsive en mobile (se adapta al ancho)
- [ ] `npm run build` pasa sin errores

## Referencias

- `src/components/dashboard/shared/ChartCard.tsx` — Wrapper con time range selector
- `src/app/globals.css` — Keyframes para shimmer loading
- `src/components/dashboard/shared/DashboardSkeleton.tsx` — Skeleton variant="chart"
- Recharts docs: recharts.org/en-US/api
