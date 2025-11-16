"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { affiliates } from "@/data/mock/affiliates";
import type { AffiliateCategory, AffiliateStatus } from "@/lib/types";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
import SimpleLanguageToggle from "@/components/ui/SimpleLanguageToggle";
import { SimpleThemeSwitch } from "@/components/ui/SimpleThemeSwitch";

const categoryNames: Record<AffiliateCategory, { es: string; en: string }> = {
  "proveedor-ingredientes": { es: "Ingredientes", en: "Ingredients" },
  "equipamiento-cocina": { es: "Equipamiento", en: "Equipment" },
  "decoracion-eventos": { es: "Decoración", en: "Decoration" },
  "logistica-transporte": { es: "Logística", en: "Logistics" },
  "venues-espacios": { es: "Venues", en: "Venues" },
  "fotografia-video": { es: "Foto/Video", en: "Photo/Video" },
  "mobiliario-eventos": { es: "Mobiliario", en: "Furniture" },
  "floreria-plantas": { es: "Florería", en: "Florist" },
  "vinos-bebidas": { es: "Vinos/Bebidas", en: "Wines/Beverages" },
  "tecnologia-eventos": { es: "Tecnología", en: "Technology" },
  "limpieza-mantenimiento": { es: "Limpieza", en: "Cleaning" },
  "seguros-eventos": { es: "Seguros", en: "Insurance" },
  "comunicacion-visual-diseno": { es: "Diseño Visual", en: "Visual Design" }
};

const statusNames: Record<AffiliateStatus, { es: string; en: string }> = {
  active: { es: "Activo", en: "Active" },
  preferred: { es: "Preferente", en: "Preferred" },
  premium: { es: "Premium", en: "Premium" },
  inactive: { es: "Inactivo", en: "Inactive" },
  pending: { es: "Pendiente", en: "Pending" }
};

const statusColors: Record<AffiliateStatus, string> = {
  active: "bg-green-600",
  preferred: "bg-blue-600",
  premium: "bg-red-600",
  inactive: "bg-gray-600",
  pending: "bg-yellow-600"
};

export default function AffiliatesPage() {
  const { language } = useSimpleLanguage();
  const [selectedCategory, setSelectedCategory] = useState<AffiliateCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<AffiliateStatus | "all">("all");

  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const categories = Object.keys(categoryNames) as AffiliateCategory[];

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const categoryMatch = selectedCategory === "all" || affiliate.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || affiliate.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🤝</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {getText('Afiliados', 'Affiliates')}
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <SimpleLanguageToggle variant="light" />
              <SimpleThemeSwitch />
            </div>
          </div>
        </div>
      </nav>
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
              {getText('Nuestros', 'Our')} <span className="text-red-600">{getText('Afiliados', 'Affiliates')}</span>
            </h1>
            <p className="text-xl text-gray-400 dark:text-gray-300 max-w-3xl mx-auto">
              {getText(
                'Partners estratégicos del ecosistema MaalCa. Empresas que comparten nuestra visión de excelencia y calidad.',
                'Strategic partners of the MaalCa ecosystem. Companies that share our vision of excellence and quality.'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {getText('Categoría', 'Category')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as AffiliateCategory | "all")}
                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
              >
                <option value="all">{getText('Todas las categorías', 'All categories')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getText(categoryNames[category].es, categoryNames[category].en)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {getText('Estado', 'Status')}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AffiliateStatus | "all")}
                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600"
              >
                <option value="all">{getText('Todos los estados', 'All statuses')}</option>
                <option value="premium">{getText(statusNames.premium.es, statusNames.premium.en)}</option>
                <option value="preferred">{getText(statusNames.preferred.es, statusNames.preferred.en)}</option>
                <option value="active">{getText(statusNames.active.es, statusNames.active.en)}</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
            {getText('Mostrando', 'Showing')} <span className="text-gray-900 dark:text-white font-semibold">{filteredAffiliates.length}</span> {getText('afiliados', 'affiliates')}
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
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-red-600 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`${statusColors[affiliate.status]} text-white text-xs px-3 py-1 rounded-full`}>
                        {getText(statusNames[affiliate.status].es, statusNames[affiliate.status].en)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-500 text-xs">
                        {getText(categoryNames[affiliate.category].es, categoryNames[affiliate.category].en)}
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                      {affiliate.name}
                    </h3>

                    {/* Location */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {affiliate.contact.city}, {affiliate.contact.country}
                    </p>

                    {/* Description */}
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                      {affiliate.description}
                    </p>

                    {/* Metrics */}
                    {affiliate.metrics && (
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-center">
                          <div className="text-gray-900 dark:text-white font-bold text-lg">
                            {affiliate.metrics.projectsCompleted}
                          </div>
                          <div className="text-gray-500 text-xs">{getText('Proyectos', 'Projects')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-900 dark:text-white font-bold text-lg">
                            {affiliate.metrics.averageRating > 0 ? affiliate.metrics.averageRating.toFixed(1) : "N/A"}
                          </div>
                          <div className="text-gray-500 text-xs">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-900 dark:text-white font-bold text-lg">
                            {affiliate.metrics.responseTime}h
                          </div>
                          <div className="text-gray-500 text-xs">{getText('Respuesta', 'Response')}</div>
                        </div>
                      </div>
                    )}

                    {/* Services Count */}
                    <div className="mt-4 text-xs text-gray-500">
                      {affiliate.services.length} {getText('servicios disponibles', 'available services')}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredAffiliates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {getText(
                  'No se encontraron afiliados con los filtros seleccionados.',
                  'No affiliates found with the selected filters.'
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              {getText('¿Quieres ser parte del ecosistema?', 'Want to be part of the ecosystem?')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
              {getText(
                'Únete a nuestra red de partners estratégicos y accede a tecnología, branding, sistemas de facturación y más.',
                'Join our network of strategic partners and access technology, branding, billing systems and more.'
              )}
            </p>
            <Link
              href="/contacto"
              className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              {getText('Solicitar Afiliación', 'Request Affiliation')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
