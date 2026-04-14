"use client";

import { useState } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  name: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onSearch: (query: string) => void;
  onFilter: (name: string, value: string) => void;
  onClear: () => void;
  activeFilters?: Record<string, string>;
  searchValue?: string;
}

export function FilterBar({
  searchPlaceholder = "Buscar...",
  filters = [],
  onSearch,
  onFilter,
  onClear,
  activeFilters = {},
  searchValue = "",
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  const hasActiveFilters =
    localSearch.length > 0 ||
    Object.values(activeFilters).some((v) => v && v !== "all");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch(value);
  };

  const handleClear = () => {
    setLocalSearch("");
    onClear();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      {/* Filter selects */}
      {filters.map((filter) => (
        <select
          key={filter.name}
          value={activeFilters[filter.name] ?? "all"}
          onChange={(e) => onFilter(filter.name, e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition min-w-[140px]"
        >
          <option value="all">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {/* Clear button */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
