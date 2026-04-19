"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAffiliateById } from "@/data/mock/affiliates";
import type { AffiliateCategory, AffiliateStatus } from "@/lib/types";

const categoryNames: Record<AffiliateCategory, string> = {
  "proveedor-ingredientes": "Proveedor de Ingredientes",
  "equipamiento-cocina": "Equipamiento de Cocina",
  "decoracion-eventos": "Decoración de Eventos",
  "logistica-transporte": "Logística y Transporte",
  "venues-espacios": "Venues y Espacios",
  "fotografia-video": "Fotografía y Video",
  "mobiliario-eventos": "Mobiliario para Eventos",
  "floreria-plantas": "Florería y Plantas",
  "vinos-bebidas": "Vinos y Bebidas",
  "tecnologia-eventos": "Tecnología para Eventos",
  "limpieza-mantenimiento": "Limpieza y Mantenimiento",
  "seguros-eventos": "Seguros para Eventos",
  "comunicacion-visual-diseno": "Comunicación Visual y Diseño",
};

const statusNames: Record<AffiliateStatus, string> = {
  active: "Activo",
  preferred: "Preferente",
  premium: "Premium",
  inactive: "Inactivo",
  pending: "Pendiente",
};

// Status pills — intentional colored badges (legible en ambos temas con texto blanco).
const statusColors: Record<AffiliateStatus, string> = {
  active: "bg-green-600",
  preferred: "bg-blue-600",
  premium: "bg-brand-primary",
  inactive: "bg-gray-600",
  pending: "bg-yellow-600",
};

export default function AffiliateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const affiliate = getAffiliateById(id);

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Afiliado no encontrado</h1>
          <p className="text-text-secondary mb-8">
            El afiliado que buscas no existe en nuestro ecosistema.
          </p>
          <Link
            href="/affiliates"
            className="inline-block bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary-hover transition-colors"
          >
            Ver todos los afiliados
          </Link>
        </div>
      </div>
    );
  }

  const partnershipTypeNames = {
    supplier: "Proveedor",
    vendor: "Vendedor",
    strategic: "Estratégico",
    franchise: "Franquicia",
  };

  const contractTypeNames = {
    exclusive: "Exclusivo",
    "non-exclusive": "No exclusivo",
    preferred: "Preferente",
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Back Button */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
          >
            <span>←</span> Volver
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span
              className={`${statusColors[affiliate.status]} text-white text-sm px-4 py-2 rounded-full`}
            >
              {statusNames[affiliate.status]}
            </span>
            <span className="text-text-secondary">
              {categoryNames[affiliate.category]}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">{affiliate.name}</h1>
          <p className="text-xl text-text-secondary max-w-3xl mb-8">
            {affiliate.description}
          </p>
          <div className="flex flex-wrap gap-4 text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="text-brand-primary">📍</span>
              <span>
                {affiliate.contact.city}, {affiliate.contact.country}
              </span>
            </div>
            {affiliate.website && (
              <div className="flex items-center gap-2">
                <span className="text-brand-primary">🌐</span>
                <a
                  href={affiliate.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors"
                >
                  Sitio web
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-6 border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Información de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-text-secondary text-sm mb-1">Persona de contacto</div>
              <div className="text-text-primary font-semibold">{affiliate.contact.name}</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm mb-1">Email</div>
              <a
                href={`mailto:${affiliate.contact.email}`}
                className="text-brand-primary hover:text-brand-primary-hover"
              >
                {affiliate.contact.email}
              </a>
            </div>
            <div>
              <div className="text-text-secondary text-sm mb-1">Teléfono</div>
              <a
                href={`tel:${affiliate.contact.phone}`}
                className="text-brand-primary hover:text-brand-primary-hover"
              >
                {affiliate.contact.phone}
              </a>
            </div>
            <div>
              <div className="text-text-secondary text-sm mb-1">Dirección</div>
              <div className="text-text-primary">{affiliate.contact.address || "N/A"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliate.services.map((service, index) => (
              <div
                key={index}
                className="bg-surface border border-border rounded-lg p-4 hover:border-brand-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-brand-primary text-xl">✓</span>
                  <span className="text-text-primary">{service}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      {affiliate.metrics && (
        <section className="py-12 px-6 border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Métricas de Desempeño</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="bg-background border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-brand-primary mb-2">
                  {affiliate.metrics.projectsCompleted}
                </div>
                <div className="text-text-secondary text-sm">Proyectos Completados</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-brand-primary mb-2">
                  {affiliate.metrics.averageRating > 0
                    ? affiliate.metrics.averageRating.toFixed(1)
                    : "N/A"}
                </div>
                <div className="text-text-secondary text-sm">Rating Promedio</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-brand-primary mb-2">
                  {affiliate.metrics.responseTime}h
                </div>
                <div className="text-text-secondary text-sm">Tiempo de Respuesta</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-brand-primary mb-2">
                  {affiliate.metrics.reliabilityScore}%
                </div>
                <div className="text-text-secondary text-sm">Confiabilidad</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-brand-primary mb-2">
                  {affiliate.metrics.costEfficiency}%
                </div>
                <div className="text-text-secondary text-sm">Eficiencia de Costos</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Partnership Details */}
      <section className="py-12 px-6 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Detalles de la Asociación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="text-text-secondary text-sm mb-2">Tipo de Partner</div>
              <div className="text-text-primary font-semibold text-lg">
                {partnershipTypeNames[affiliate.partnership.type]}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="text-text-secondary text-sm mb-2">Tipo de Contrato</div>
              <div className="text-text-primary font-semibold text-lg">
                {contractTypeNames[affiliate.partnership.contractType]}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="text-text-secondary text-sm mb-2">Socio desde</div>
              <div className="text-text-primary font-semibold text-lg">
                {new Date(affiliate.partnership.since).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                })}
              </div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="text-text-secondary text-sm mb-2">Términos de pago</div>
              <div className="text-text-primary font-semibold text-lg">
                {affiliate.partnership.paymentTerms}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-12 px-6 border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ubicaciones</h2>
          <div className="flex flex-wrap gap-3">
            {affiliate.locations.map((location, index) => (
              <span
                key={index}
                className="bg-background border border-border text-text-primary px-4 py-2 rounded-full"
              >
                📍 {location}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      {affiliate.certifications && affiliate.certifications.length > 0 && (
        <section className="py-12 px-6 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Certificaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affiliate.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="bg-surface border border-border rounded-lg p-4 flex items-center gap-3"
                >
                  <span className="text-brand-primary text-2xl">🏆</span>
                  <span className="text-text-primary">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Media */}
      {affiliate.socialMedia && (
        <section className="py-12 px-6 border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Redes Sociales</h2>
            <div className="flex flex-wrap gap-4">
              {affiliate.socialMedia.instagram && (
                <a
                  href={affiliate.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background border border-border text-text-primary px-6 py-3 rounded-lg hover:border-brand-primary transition-colors flex items-center gap-2"
                >
                  <span>📷</span> Instagram
                </a>
              )}
              {affiliate.socialMedia.facebook && (
                <a
                  href={`https://facebook.com/${affiliate.socialMedia.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background border border-border text-text-primary px-6 py-3 rounded-lg hover:border-brand-primary transition-colors flex items-center gap-2"
                >
                  <span>📘</span> Facebook
                </a>
              )}
              {affiliate.socialMedia.linkedin && (
                <a
                  href={`https://linkedin.com/company/${affiliate.socialMedia.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background border border-border text-text-primary px-6 py-3 rounded-lg hover:border-brand-primary transition-colors flex items-center gap-2"
                >
                  <span>💼</span> LinkedIn
                </a>
              )}
              {affiliate.socialMedia.website && (
                <a
                  href={affiliate.socialMedia.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background border border-border text-text-primary px-6 py-3 rounded-lg hover:border-brand-primary transition-colors flex items-center gap-2"
                >
                  <span>🌐</span> Sitio Web
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Quieres trabajar con {affiliate.name}?
          </h2>
          <p className="text-text-secondary text-lg mb-8">
            Contacta directamente o solicita una conexión a través del ecosistema MaalCa.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`mailto:${affiliate.contact.email}`}
              className="bg-brand-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-brand-primary-hover transition-colors"
            >
              Contactar por Email
            </a>
            <Link
              href="/affiliates"
              className="bg-surface-elevated text-text-primary px-8 py-4 rounded-lg font-semibold hover:bg-surface transition-colors border border-border"
            >
              Ver más afiliados
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
