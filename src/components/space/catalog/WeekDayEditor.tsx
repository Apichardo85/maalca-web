"use client";

import { WEEK_DAY_LABELS, WEEK_DAY_ORDER, WEEK_DAY_SHORT } from "@/lib/menu-availability";
import type { WeekDay } from "@/lib/types";

interface WeekDayEditorProps {
  value: WeekDay[];
  onChange: (next: WeekDay[]) => void;
  compact?: boolean;
}

export function WeekDayEditor({ value, onChange, compact = false }: WeekDayEditorProps) {
  const isAllWeek = value.length === 0;

  const toggle = (day: WeekDay) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  const toggleAll = () => {
    onChange(isAllWeek ? [] : []);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={toggleAll}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
            isAllWeek
              ? "text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
          style={isAllWeek ? { backgroundColor: "var(--brand-primary)" } : undefined}
        >
          Todos los días
        </button>
        {WEEK_DAY_ORDER.map((day) => {
          const active = !isAllWeek && value.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              title={WEEK_DAY_LABELS[day]}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                active
                  ? "text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              style={active ? { backgroundColor: "var(--brand-primary)" } : undefined}
            >
              {compact ? WEEK_DAY_SHORT[day] : WEEK_DAY_LABELS[day]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
