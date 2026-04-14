"use client";

import { ReactNode, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

interface ChartCardProps {
  title: string;
  icon?: string;
  children: ReactNode;
  timeRanges?: string[];
  onTimeRangeChange?: (range: string) => void;
  className?: string;
}

export function ChartCard({
  title,
  icon,
  children,
  timeRanges,
  onTimeRangeChange,
  className,
}: ChartCardProps) {
  const [activeRange, setActiveRange] = useState(timeRanges?.[0] ?? "7d");

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    onTimeRangeChange?.(range);
  };

  const rangeAction = timeRanges ? (
    <div className="flex gap-1">
      {timeRanges.map((range) => (
        <button
          key={range}
          onClick={() => handleRangeChange(range)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeRange === range
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  ) : undefined;

  return (
    <DashboardCard title={title} icon={icon} action={rangeAction} className={className}>
      <div className="h-64 w-full">{children}</div>
    </DashboardCard>
  );
}

export const chartColors = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export const chartTheme = {
  grid: { stroke: "var(--border)", strokeOpacity: 0.3 },
  axis: { stroke: "var(--text-muted)", fontSize: 12 },
  tooltip: {
    contentStyle: {
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
};
