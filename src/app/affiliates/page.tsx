"use client";
import { useState } from "react";
import Link from "next/link";
import { affiliates } from "@/data/mock/affiliates";
import type { AffiliateCategory, AffiliateStatus } from "@/lib/types";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";

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
  "comunicacion-visual-diseno": { es: "Diseño Visual", en: "Visual Design" },
};

const statusNames: Record<AffiliateStatus, { es: string; en: string }> = {
  active: { es: "Activo", en: "Active" },
  preferred: { es: "Preferente", en: "Preferred" },
  premium: { es: "Premium", en: "Premium" },
  inactive: { es: "Inactivo", en: "Inactive" },
  pending: { es: "Pendiente", en: "Pending" },
};

const statusColors: Record<AffiliateStatus, string> = {
  active: "bg-green-600",
  preferred: "bg-blue-600",
  premium: "bg-brand-primary",
  inactive: "bg-gray-600",
  pending: "bg-yellow-600",
};

export default function AffiliatesPage() {
  const { language } = useSimpleLanguage();
  const [selectedCategory, setSelectedCategory] = useState<AffiliateCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<AffiliateStatus | "all">("all");

  const getText = (es: string, en: string) => (language === "es" ? es : en);

  const categories = Object.keys(categoryNames) as AffiliateCategory[];

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const categoryMatch = selectedCategory === "all" || affiliate.category === selectedCategory;
    const statusMatch = selectedStatus === "all" || affiliate.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Hero Section — sin nav local (Header global ya montado en layout.tsx) */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {getText("Nuestros", "Our")}{" "}
            <span className="text-brand-primary">{getText("Afiliados", "Affiliates")}</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            {getText(
              "Partners estratégicos del ecosistema MaalCa. Empresas que comparten nuestra visión de excelencia y calidad.",
              "Strategic partners of the MaalCa ecosystem. Companies that share our vision of excellence and quality."
            )}
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {getText("Categoría", "Category")}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as AffiliateCategory | "all")}
                className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary"
              >
                <option value="all">{getText("Todas las categorías", "All categories")}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getText(categoryNames[category].es, categoryNames[category].en)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {getText("Estado", "Status")}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AffiliateStatus | "all")}
                className="w-full bg-surface text-text-primary border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-brand-primary"
              >
                <option value="all">{getText("Todos los estados", "All statuses")}</option>
                <option value="premium">
                  {getText(statusNames.premium.es, statusNames.premium.en)}
                </option>
                <option value="preferred">
                  {getText(statusNames.preferred.es, statusNames.preferred.en)}
                </option>
                <option value="active">
                  {getText(statusNames.active.es, statusNames.active.en)}
                </option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-text-secondary text-sm">
            {getText("Mostrando", "Showing")}{" "}
            <span className="text-text-primary font-semibold">{filteredAffiliates.length}</span>{" "}
            {getText("afiliados", "affiliates")}
          </div>
        </div>
      </section>

      {/* Affiliates Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAffiliates.map((affiliate) => (
              <Link key={affiliate.id} href={`/affiliates/${affiliate.id}`}>
                <div className="bg-surface border border-border rounded-lg p-6 hover:border-brand-primary transition-all duration-300 cursor-pointer group h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`${statusColors[affiliate.status]} text-white text-xs px-3 py-1 rounded-full`}
                    >
                      {getText(statusNames[affiliate.status].es, statusNames[affiliate.status].en)}
                    </span>
                    <span className="text-text-muted text-xs">
                      {getText(
                        categoryNames[affiliate.category].es,
                        categoryNames[affiliate.category].en
                      )}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-text-primary group-hover:text-brand-primary transition-colors">
                    {affiliate.name}
                  </h3>
                  <p className="text-sm text-text-muted mb-3">
                    {affiliate.contact.city}, {affiliate.contact.country}
                  </p>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3 flex-grow">
                    {affiliate.description}
                  </p>
                  {affiliate.metrics && (
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-text-primary font-bold text-lg">
                          {affiliate.metrics.projectsCompleted}
                        </div>
                        <div className="text-text-muted text-xs">
                          {getText("Proyectos", "Projects")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-text-primary font-bold text-lg">
                          {affiliate.metrics.averageRating > 0
                            ? affiliate.metrics.averageRating.toFixed(1)
                            : "N/A"}
                        </div>
                        <div className="text-text-muted text-xs">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-text-primary font-bold text-lg">
                          {affiliate.metrics.responseTime}h
                        </div>
                        <div className="text-text-muted text-xs">
                          {getText("Respuesta", "Response")}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-text-muted">
                    {affiliate.services.length}{" "}
                    {getText("servicios disponibles", "available services")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {filteredAffiliates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">
                {getText(
                  "No se encontraron afiliados con los filtros seleccionados.",
                  "No affiliates found with the selected filters."
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary">
            {getText("¿Quieres ser parte del ecosistema?", "Want to be part of the ecosystem?")}
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            {getText(
              "Únete a nuestra red de partners estratégicos y accede a tecnología, branding, sistemas de facturación y más.",
              "Join our network of strategic partners and access technology, branding, billing systems and more."
            )}
          </p>
          <Link
            href="/contacto"
            className="inline-block bg-brand-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-brand-primary-hover transition-colors"
          >
            {getText("Solicitar Afiliación", "Request Affiliation")}
          </Link>
        </div>
      </section>
    </div>
  );
}
