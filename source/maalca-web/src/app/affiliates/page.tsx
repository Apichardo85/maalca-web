"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { affiliates } from "@/data/mock/affiliates";
import type { AffiliateCategory, AffiliateStatus } from "@/lib/types";

const categoryNames: Record<AffiliateCategory, string> = {
  "proveedor-ingredientes": "Ingredientes",
  "equipamiento-cocina": "Equipamiento",
  "decoracion-eventos": "Decoración",
  "logistica-transporte": "Logística",
  "venues-espacios": "Venues",
  "fotografia-video": "Foto/Video",
  "mobiliario-eventos": "Mobiliario",
  "floreria-plantas": "Florería",
  "vinos-bebidas": "Vinos/Bebidas",
  "tecnologia-eventos": "Tecnología",
  "limpieza-mantenimiento": "Limpieza",
  "seguros-eventos": "Seguros",
  "comunicacion-visual-diseno": "Diseño Visual"
};

const statusNames: Record<AffiliateStatus, string> = {
  active: "Activo",
  preferred: "Preferente",
  premium: "Premium",
  inactive: "Inactivo",
  pending: "Pendiente"
};

const statusColors: Record<AffiliateStatus, string> = {
  active: "bg-green-600",
  preferred: "bg-blue-600",
  premium: "bg-red-600",
  inactive: "bg-gray-600",
  pending: "bg-yellow-600"
};

export default function AffiliatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<AffiliateCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<AffiliateStatus | "all">("all");

  const categories = Object.keys(categoryNames) as AffiliateCategory[];

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const categoryMatch = selectedCategory === "all" || affiliate.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || affiliate.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Nuestros <span className="text-red-600">Afiliados</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Partners estratégicos del ecosistema MaalCa. Empresas que comparten nuestra visión de excelencia y calidad.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as AffiliateCategory | "all")}
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryNames[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AffiliateStatus | "all")}
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
              >
                <option value="all">Todos los estados</option>
                <option value="premium">Premium</option>
                <option value="preferred">Preferente</option>
                <option value="active">Activo</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-gray-400 text-sm">
            Mostrando <span className="text-white font-semibold">{filteredAffiliates.length}</span> afiliados
          </div>
        </div>
      </section>

      {/* Affiliates Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAffiliates.map((affiliate, index) => (
              <motion.div
                key={affiliate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/affiliates/${affiliate.id}`}>
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-600 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`${statusColors[affiliate.status]} text-white text-xs px-3 py-1 rounded-full`}>
                        {statusNames[affiliate.status]}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {categoryNames[affiliate.category]}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition-colors">
                      {affiliate.name}
                    </h3>

                    {/* Location */}
                    <p className="text-sm text-gray-400 mb-3">
                      {affiliate.contact.city}, {affiliate.contact.country}
                    </p>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                      {affiliate.description}
                    </p>

                    {/* Metrics */}
                    {affiliate.metrics && (
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-800">
                        <div className="text-center">
                          <div className="text-white font-bold text-lg">
                            {affiliate.metrics.projectsCompleted}
                          </div>
                          <div className="text-gray-500 text-xs">Proyectos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold text-lg">
                            {affiliate.metrics.averageRating > 0 ? affiliate.metrics.averageRating.toFixed(1) : "N/A"}
                          </div>
                          <div className="text-gray-500 text-xs">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold text-lg">
                            {affiliate.metrics.responseTime}h
                          </div>
                          <div className="text-gray-500 text-xs">Respuesta</div>
                        </div>
                      </div>
                    )}

                    {/* Services Count */}
                    <div className="mt-4 text-xs text-gray-500">
                      {affiliate.services.length} servicios disponibles
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredAffiliates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                No se encontraron afiliados con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Quieres ser parte del ecosistema?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Únete a nuestra red de partners estratégicos y accede a tecnología, branding, sistemas de facturación y más.
            </p>
            <Link
              href="/contacto"
              className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Solicitar Afiliación
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
