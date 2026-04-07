"use client";
import { GalleryCategory, CategoryFilter as CategoryFilterType } from "@/lib/types";
interface CategoryFilterProps {
  categories: CategoryFilterType[];
  selectedCategory: GalleryCategory;
  onCategoryChange: (category: GalleryCategory) => void;
  className?: string;
}
const defaultCategories: CategoryFilterType[] = [
  { value: "todas", label: "Todas", count: 45, color: "amber" },
  { value: "box-comida", label: "Box Comida", count: 12, color: "blue" },
  { value: "bubette", label: "Bubette", count: 8, color: "green" },
  { value: "empanadas", label: "Empanadas", count: 10, color: "orange" },
  { value: "eventos-corporativos", label: "Eventos Corporativos", count: 7, color: "purple" },
  { value: "bodas", label: "Bodas", count: 5, color: "pink" },
  { value: "postres", label: "Postres", count: 3, color: "red" }
];
const colorVariants = {
  amber: "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40",
  blue: "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40",
  green: "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40",
  orange: "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40",
  purple: "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40",
  pink: "bg-pink-500/10 text-pink-700 border-pink-500/20 hover:bg-pink-500/20 hover:border-pink-500/40",
  red: "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40"
};
const activeColorVariants = {
  amber: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/25",
  blue: "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25",
  green: "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25",
  orange: "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25",
  purple: "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/25",
  pink: "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/25",
  red: "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25"
};
export default function CategoryFilter({
  categories = defaultCategories,
  selectedCategory,
  onCategoryChange,
  className = ""
}: CategoryFilterProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-3 ${className}`}>
      {categories.map((category, index) => {
        const isActive = selectedCategory === category.value;
        const color = category.color as keyof typeof colorVariants || "amber";
        return (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`
              relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              border transition-all duration-300 group overflow-hidden
              hover:scale-105 active:scale-95
              animate-fade-in-up
              ${isActive
                ? activeColorVariants[color]
                : colorVariants[color]
              }
            `}
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            {/* Category label */}
            <span className="relative z-10">{category.label}</span>
            {/* Count badge */}
            {category.count && (
              <span
                className={`
                  relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5
                  text-xs font-bold rounded-full transition-all duration-300
                  ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-current/10 text-current"
                  }
                `}
              >
                {category.count}
              </span>
            )}
            {/* Active indicator */}
            {isActive && (
              <div
                className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-current rounded-full transition-all duration-300"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
