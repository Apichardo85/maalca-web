"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/buttons";
import { PropertyFilter, PropertyType, FilterOption, PriceRange } from "@/lib/types";

interface PropertyHeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  initialPropertyCount?: number;
  onFilterChange?: (filters: PropertyFilter) => void;
}

const propertyTypes: FilterOption[] = [
  { value: "", label: "Todos los tipos", count: 245 },
  { value: "casa", label: "Casas", count: 89 },
  { value: "departamento", label: "Departamentos", count: 112 },
  { value: "oficina", label: "Oficinas", count: 28 },
  { value: "local", label: "Locales", count: 16 }
];

const priceRanges: PriceRange[] = [
  { min: 0, max: 0, label: "Cualquier precio" },
  { min: 50000000, max: 100000000, label: "$50M - $100M" },
  { min: 100000000, max: 200000000, label: "$100M - $200M" },
  { min: 200000000, max: 300000000, label: "$200M - $300M" },
  { min: 300000000, max: 0, label: "Más de $300M" }
];

const locations: FilterOption[] = [
  { value: "", label: "Todas las ubicaciones" },
  { value: "providencia", label: "Providencia", count: 45 },
  { value: "las-condes", label: "Las Condes", count: 67 },
  { value: "santiago-centro", label: "Santiago Centro", count: 33 },
  { value: "vitacura", label: "Vitacura", count: 28 },
  { value: "nunoa", label: "Ñuñoa", count: 41 }
];

export default function PropertyHero({
  title = "Encuentra Tu Propiedad Ideal",
  subtitle = "MaalCa Properties",
  backgroundImage = "/images/hero/properties-hero.jpg",
  initialPropertyCount = 245,
  onFilterChange
}: PropertyHeroProps) {
  const [filters, setFilters] = useState<PropertyFilter>({
    type: "",
    minPrice: 0,
    maxPrice: 0,
    location: ""
  });

  const [propertyCount, setPropertyCount] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const startCount = propertyCount;
    let endCount = initialPropertyCount;

    if (filters.type || filters.location || filters.minPrice > 0) {
      endCount = Math.floor(initialPropertyCount * (0.3 + Math.random() * 0.4));
    }

    const duration = 1000;
    const steps = 30;
    const increment = (endCount - startCount) / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentCount = Math.floor(startCount + (increment * currentStep));
      setPropertyCount(currentCount);

      if (currentStep >= steps) {
        setPropertyCount(endCount);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, initialPropertyCount]);

  const handleFilterChange = (newFilters: Partial<PropertyFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handlePriceRangeChange = (rangeIndex: number) => {
    setSelectedPriceRange(rangeIndex);
    const range = priceRanges[rangeIndex];
    handleFilterChange({
      minPrice: range.min,
      maxPrice: range.max
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center text-white mb-12 animate-fade-in-up">
          <p
            className="text-lg sm:text-xl font-light mb-4 tracking-wide opacity-90 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            {subtitle}
          </p>

          <h1
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            {title}
          </h1>

          {/* Property Counter */}
          <div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 animate-fade-in-scale"
            style={{ animationDelay: '0.5s' }}
          >
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {propertyCount.toLocaleString()}
            </span>
            <span className="text-white/80 text-lg">propiedades disponibles</span>
          </div>
        </div>

        {/* Filter Panel */}
        <div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Property Type */}
            <div
              className="space-y-3 animate-fade-in-left"
              style={{ animationDelay: '0.7s' }}
            >
              <label className="block text-white font-semibold text-sm uppercase tracking-wide">
                Tipo de Propiedad
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value as PropertyType | "" })}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:scale-[1.02] transition-all"
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value} className="text-gray-900">
                    {type.label} {type.count && `(${type.count})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div
              className="space-y-3 animate-fade-in-left"
              style={{ animationDelay: '0.8s' }}
            >
              <label className="block text-white font-semibold text-sm uppercase tracking-wide">
                Rango de Precio
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => handlePriceRangeChange(Number(e.target.value))}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:scale-[1.02] transition-all"
              >
                {priceRanges.map((range, index) => (
                  <option key={index} value={index} className="text-gray-900">
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div
              className="space-y-3 animate-fade-in-left"
              style={{ animationDelay: '0.9s' }}
            >
              <label className="block text-white font-semibold text-sm uppercase tracking-wide">
                Ubicación
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange({ location: e.target.value })}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:scale-[1.02] transition-all"
              >
                {locations.map((location) => (
                  <option key={location.value} value={location.value} className="text-gray-900">
                    {location.label} {location.count && `(${location.count})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div
              className="flex items-end animate-fade-in-left"
              style={{ animationDelay: '1s' }}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full h-[52px] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-xl hover:shadow-2xl"
              >
                🔍 Buscar Propiedades
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div
            className="mt-6 pt-6 border-t border-white/20 animate-fade-in-up"
            style={{ animationDelay: '1.1s' }}
          >
            <p className="text-white/80 text-sm mb-3">Filtros populares:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Casas en Las Condes",
                "Departamentos bajo $150M",
                "Oficinas Santiago Centro",
                "Propiedades nuevas"
              ].map((filter, index) => (
                <button
                  key={filter}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in-scale"
                  style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
