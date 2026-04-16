"use client";

/**
 * Popover-like editor para los periodos en que se sirve un plato.
 *
 * Reglas:
 *  - Si no hay ninguno marcado, se trata como all_day (disponible siempre).
 *  - Marcar "all_day" desmarca los demás.
 *  - Marcar cualquier otro periodo desmarca "all_day".
 */

import { MEAL_PERIOD_LABELS, MEAL_PERIOD_ORDER } from "@/lib/menu-availability";
import type { MealPeriod } from "@/lib/types";

interface MealPeriodEditorProps {
  value: MealPeriod[];
  onChange: (next: MealPeriod[]) => void;
  compact?: boolean;
}

export function MealPeriodEditor({ value, onChange, compact = false }: MealPeriodEditorProps) {
  const isAllDay = value.length === 0 || value.includes("all_day");

  const toggle = (period: MealPeriod) => {
    if (period === "all_day") {
      onChange(isAllDay ? [] : []);
      return;
    }
    const current = isAllDay ? [] : value.filter((p) => p !== "all_day");
    const next = current.includes(period)
      ? current.filter((p) => p !== period)
      : [...current, period];
    onChange(next);
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : ""}`}>
      {MEAL_PERIOD_ORDER.map((p) => {
        const active = p === "all_day" ? isAllDay : !isAllDay && value.includes(p);
        return (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              active
                ? "text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            style={active ? { backgroundColor: "var(--brand-primary)" } : undefined}
          >
            {MEAL_PERIOD_LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
