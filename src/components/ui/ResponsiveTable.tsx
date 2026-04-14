"use client";
import { ReactNode } from "react";
export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
  sortable?: boolean;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowKey: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
}
/**
 * Tabla responsive que se adapta a mobile y desktop
 */
export function ResponsiveTable<T>({
  data,
  columns,
  getRowKey,
  emptyMessage = "No se encontraron resultados",
  onRowClick,
  sortConfig,
  onSort,
}: ResponsiveTableProps<T>) {
  const mobileColumns = columns.filter(col => !col.hideOnMobile);
  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📭</div>
        <p className="text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white ${
                    column.sortable && onSort ? "cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors" : ""
                  }`}
                  onClick={column.sortable && onSort ? () => onSort(column.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-blue-500">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={getRowKey(item)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors animate-fade-in ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-4 text-gray-900 dark:text-white"
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item, index) => (
          <div
            key={getRowKey(item)}
            className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3 animate-fade-in ${
              onRowClick ? "cursor-pointer active:scale-[0.98]" : ""
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => onRowClick?.(item)}
          >
            {mobileColumns.map((column) => (
              <div key={column.key} className="flex justify-between items-start gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {column.mobileLabel || column.header}:
                </span>
                <div className="text-sm text-gray-900 dark:text-white text-right flex-1">
                  {column.render(item)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
