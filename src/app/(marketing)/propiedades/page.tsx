"use client";

import { PropertyHero } from "@/components/sections";
import { PropertyFilter } from "@/lib/types";

export default function PropiedadesPage() {
  const handleFilterChange = (filters: PropertyFilter) => {
    console.log("Filtros aplicados:", filters);
    // Aquí implementarías la lógica de filtrado real
  };

  return (
    <main className="min-h-screen">
      <PropertyHero
        title="Encuentra Tu Propiedad Ideal"
        subtitle="MaalCa Properties"
        backgroundImage="/images/hero/properties-hero.jpg"
        initialPropertyCount={245}
        onFilterChange={handleFilterChange}
      />
      
      {/* Aquí irían las demás secciones de la página */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Propiedades Destacadas
          </h2>
          <p className="text-xl text-gray-600">
            Las siguientes secciones mostrarían las propiedades filtradas...
          </p>
        </div>
      </section>
    </main>
  );
}