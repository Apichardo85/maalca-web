import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  icon?: string;
}

/**
 * Card reutilizable para el dashboard
 */
export function DashboardCard({
  title,
  subtitle,
  children,
  className,
  action,
  icon
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
        className
      )}
    >
      {/* Header del card (opcional) */}
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="text-2xl">{icon}</span>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Contenido del card */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  color?: string;
}

/**
 * Card especializado para mostrar estadísticas
 */
export function StatCard({ label, value, icon, change, color = "blue" }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {change && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              change.type === "increase"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            <span>{change.type === "increase" ? "↑" : "↓"}</span>
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
