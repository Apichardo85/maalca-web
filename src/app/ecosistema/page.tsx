"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";

/**
 * OPTIMIZATION NOTE:
 * This page MUST remain a Client Component because it needs:
 * - useRouter for navigation
 * - useTranslation hook for i18n
 * 
 * HOWEVER, we've optimized it by:
 * - Removing ALL Framer Motion components
 * - Using CSS animations instead
 * - Reducing bundle size significantly
 */

const projects = [
  {
    id: "editorial-maalca",
    titleKey: "Editorial MaalCa",
    descriptionKey: "Publicaciones que exploran cultura, creatividad y sociedad con distribución global en Amazon KDP",
    categoryKey: "Editorial + KDP",
    outcomeKey: "Libros publicados y distribuidos globalmente",
    color: "red",
    image: "/images/projects/editorial-maalca.svg",
    href: "/editorial",
    detailKeys: [
      "Filosofía contemporánea y pensamiento crítico",
      "Análisis cultural desde perspectiva caribeña",
      "Distribución global a través de Amazon KDP",
      "Formato digital y físico disponible"
    ],
    statusKey: "Activo",
    launched: "2022",
    active: true
  },
  {
    id: "ciriwhispers",
    titleKey: "CiriWhispers",
    descriptionKey: "Autor y escritor creativo especializado en narrativas íntimas y conversaciones profundas",
    categoryKey: "Autor + Escritor Creativo",
    outcomeKey: "Contenido auténtico y conexiones humanas genuinas",
    color: "gray",
    image: "/images/projects/ciriwhispers.png",
    href: "/ciriwhispers",
    detailKeys: [
      "Narrativas íntimas y personales auténticas",
      "Escritura creativa con perspectiva única",
      "Conversaciones profundas y reflexivas",
      "Conexión genuina con audiencias"
    ],
    statusKey: "Activo",
    launched: "2024",
    active: true
  },
  {
    id: "cirisonic",
    titleKey: "CiriSonic",
    descriptionKey: "Fábrica de contenido IA con automatización inteligente y estrategia de engagement optimizada",
    categoryKey: "Fábrica IA",
    outcomeKey: "Contenido automatizado y engagement aumentado",
    color: "red",
    image: "/images/projects/cirisonic.svg",
    href: "/cirisonic",
    detailKeys: [
      "Sistema IA para generación de contenido personalizado",
      "Automatización de calendario de publicaciones",
      "Engagement analytics en tiempo real",
      "A/B testing automatizado para optimización"
    ],
    statusKey: "Beta",
    launched: "2024",
    active: true
  },
  {
    id: "hbm-podcast",
    titleKey: "Hablando Mierda (HBM)",
    descriptionKey: "Podcast y plataforma de conversaciones sin filtros",
    categoryKey: "Podcast + Media",
    outcomeKey: "Comunidad activa y monetización por episodio",
    color: "red",
    image: "/images/projects/hbm-podcast.svg",
    href: "/hbm",
    detailKeys: [
      "Conversaciones auténticas sin censura",
      "Filosofía callejera con sentido humano",
      "Comunidad comprometida de oyentes",
      "Monetización directa por episodio"
    ],
    statusKey: "Activo",
    launched: "2023",
    active: false
  },
  {
    id: "masa-tina",
    titleKey: "Cocina Tina",
    descriptionKey: "Experiencias gastronómicas con catálogo, POS y procesamiento Stripe integrado",
    categoryKey: "Catálogo + POS + Stripe",
    outcomeKey: "Ventas procesadas y experiencias entregadas",
    color: "gray",
    image: "/images/projects/masa-tina.svg",
    href: "/masa-tina",
    detailKeys: [
      "Gastronomía dominicana auténtica",
      "Sistema POS integrado con Stripe",
      "Catálogo digital de productos",
      "Experiencias culinarias personalizadas"
    ],
    statusKey: "Activo",
    launched: "2023",
    active: true
  },
  {
    id: "maalca-properties",
    titleKey: "MaalCa Properties",
    descriptionKey: "Portal inmobiliario con propiedades exclusivas en República Dominicana",
    categoryKey: "PropTech + Real Estate",
    outcomeKey: "Propiedades comercializadas exitosamente",
    color: "gray",
    image: "/images/projects/maalca-properties.svg",
    href: "/maalca-properties",
    detailKeys: [
      "Propiedades exclusivas en República Dominicana",
      "Visualización interactiva de propiedades",
      "Sistema de agendamiento de consultas",
      "Integración con canales de comunicación"
    ],
    statusKey: "Activo",
    launched: "2024",
    active: true
  }
];

export default function EcosistemaPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleProjectClick = (href: string) => {
    router.push(href);
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      "Activo": "text-green-700 bg-green-50 border-green-200",
      "Beta": "text-blue-700 bg-blue-50 border-blue-200",
      "Desarrollo": "text-yellow-700 bg-yellow-50 border-yellow-200",
      "Inactivo": "text-gray-700 bg-gray-50 border-gray-200"
    };
    return statusMap[status] || "text-gray-700 bg-gray-50 border-gray-200";
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in-up">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              {t('ecosystem.hero.title')}
              <span className="block text-brand-primary">{t('ecosystem.hero.subtitle')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              {t('ecosystem.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-gray-400">
                <span className="font-medium">6</span> {t('ecosystem.stats.projects')}
              </div>
              <div className="hidden sm:block text-gray-400">•</div>
              <div className="text-sm text-gray-400">
                <span className="font-medium">4</span> {t('ecosystem.stats.verticals')}
              </div>
              <div className="hidden sm:block text-gray-400">•</div>
              <div className="text-sm text-gray-400">
                {t('ecosystem.stats.founded')} <span className="font-medium">2020</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group fade-in-up hover-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-surface rounded-2xl overflow-hidden border border-border hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
                  {/* Project Image */}
                  <div className="aspect-[2/1] overflow-hidden">
                    <ProjectImage
                      src={project.image}
                      alt={project.titleKey}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Project Content */}
                  <div className="p-8">
                    {/* Status and Category */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(t(project.statusKey))}`}>
                        {t(project.statusKey)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t('ecosystem.launched')} {project.launched}
                      </span>
                    </div>

                    {/* Title and Category Badge */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-brand-primary transition-colors">
                        {project.titleKey}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        project.color === 'red'
                          ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                          : 'bg-surface-elevated text-gray-300 border border-border'
                      }`}>
                        {t(project.categoryKey)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {t(project.descriptionKey)}
                    </p>

                    {/* Key Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white mb-3">{t('ecosystem.keyFeatures')}</h4>
                      <ul className="space-y-2">
                        {project.detailKeys.map((detailKey, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                            {detailKey}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Outcome */}
                    <div className="text-sm text-brand-primary font-medium mb-6 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {t(project.outcomeKey)}
                    </div>

                    {/* CTA */}
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                      onClick={() => handleProjectClick(project.href)}
                    >
                      {t('ecosystem.exploreProject')} {project.titleKey}
                      <span className="ml-2 animate-pulse">→</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="fade-in-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              {t('ecosystem.cta.title')}
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('ecosystem.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
                onClick={() => handleProjectClick("/contacto")}
              >
                {t('ecosystem.cta.collaborate')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-white hover:bg-text-primary hover:text-background"
                onClick={() => handleProjectClick("/servicios")}
              >
                {t('ecosystem.cta.services')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
