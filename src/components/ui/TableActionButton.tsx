"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TableActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "sm" | "md";
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Botón de acción para tablas con estilos consistentes
 */
export function TableActionButton({
  children,
  onClick,
  variant = "secondary",
  size = "sm",
  icon,
  disabled = false
}: TableActionButtonProps) {

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:border-gray-700",
    success: "bg-green-600 text-white hover:bg-green-700 border-green-600",
    danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-lg border transition-colors
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </motion.button>
  );
}

/**
 * Contenedor para agrupar botones de acción
 */
export function TableActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}
