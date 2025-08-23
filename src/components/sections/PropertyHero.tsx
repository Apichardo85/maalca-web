"use client";

import { motion, useAnimationControls } from "framer-motion";
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
  const counterControls = useAnimationControls();

  // Animated counter effect
  useEffect(() => {
    const animateCounter = async () => {
      await counterControls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      });
    };
    
    let startCount = propertyCount;
    let endCount = initialPropertyCount;
    
    if (filters.type || filters.location || filters.minPrice > 0) {
      // Simulate filtered results
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
        animateCounter();
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [filters, initialPropertyCount, counterControls]);

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
        <motion.div
          className="text-center text-white mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p
            className="text-lg sm:text-xl font-light mb-4 tracking-wide opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
          
          <motion.h1
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {title}
          </motion.h1>

          {/* Property Counter */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.span
              animate={counterControls}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"
            >
              {propertyCount.toLocaleString()}
            </motion.span>
            <span className="text-white/80 text-lg">propiedades disponibles</span>
          </motion.div>
        </motion.div>

        {/* Filter Panel */}
        <motion.div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Property Type */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="block text-white font-semibold text-sm uppercase tracking-wide">
                Tipo de Propiedad
              </label>
              <motion.select
                value={filters.type}
                onChange={(e) => handleFilterChange({ type: e.target.value as PropertyType | "" })}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.02 }}
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value} className="text-gray-900">
                    {type.label} {type.count && `(${type.count})`}
                  </option>
                ))}
              </motion.select>
            </motion.div>

            {/* Price Range */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label className="block text-white font-semibold text-sm uppercase tracking-wide">
                Rango de Precio
              </label>
              <motion.select
                value={selectedPriceRange}
                onChange={(e) => handlePriceRangeChange(Number(e.target.value))}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.02 }}
              >
                {priceRanges.map((range, index) => (
                  <option key={index} value={index} className="text-gray-900">
                    {range.label}
                  </option>
                ))}
              </motion.select>
            </motion.div>

            {/* Location */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <label className="block text-white font-semibold text-sm uppercase tracking-wide">
                Ubicación
              </label>
              <motion.select
                value={filters.location}
                onChange={(e) => handleFilterChange({ location: e.target.value })}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.02 }}
              >
                {locations.map((location) => (
                  <option key={location.value} value={location.value} className="text-gray-900">
                    {location.label} {location.count && `(${location.count})`}
                  </option>
                ))}
              </motion.select>
            </motion.div>

            {/* Search Button */}
            <motion.div
              className="flex items-end"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full h-[52px] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-xl hover:shadow-2xl"
              >
                🔍 Buscar Propiedades
              </Button>
            </motion.div>
          </div>

          {/* Quick Filters */}
          <motion.div
            className="mt-6 pt-6 border-t border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <p className="text-white/80 text-sm mb-3">Filtros populares:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Casas en Las Condes",
                "Departamentos bajo $150M",
                "Oficinas Santiago Centro",
                "Propiedades nuevas"
              ].map((filter, index) => (
                <motion.button
                  key={filter}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm transition-all duration-300"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="w-1 h-3 bg-white/70 rounded-full mt-2"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}