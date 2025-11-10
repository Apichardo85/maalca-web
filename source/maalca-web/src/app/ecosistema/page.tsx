"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useSimpleLanguage";

const projects = [
  {
    id: "editorial-maalca",
    title: "Editorial MaalCa",
    description: "Publicaciones que exploran cultura, creatividad y sociedad con distribución global en Amazon KDP",
    category: "Editorial + KDP",
    outcome: "Libros publicados y distribuidos globalmente",
    color: "red",
    image: "/images/projects/editorial-maalca.svg",
    href: "/editorial",
    details: [
      "Filosofía contemporánea y pensamiento crítico",
      "Análisis cultural desde perspectiva caribeña",
      "Distribución global a través de Amazon KDP",
      "Formato digital y físico disponible"
    ],
    status: "Activo",
    launched: "2022",
    active: true
  },
  {
    id: "ciriwhispers",
    title: "CiriWhispers",
    description: "Autor y escritor creativo especializado en narrativas íntimas y conversaciones profundas",
    category: "Autor + Escritor Creativo",
    outcome: "Contenido auténtico y conexiones humanas genuinas",
    color: "gray",
    image: "/images/projects/ciriwhispers.png",
    href: "/ciriwhispers",
    details: [
      "Narrativas íntimas y personales auténticas",
      "Escritura creativa con perspectiva única",
      "Conversaciones profundas y reflexivas",
      "Conexión genuina con audiencias"
    ],
    status: "Activo",
    launched: "2024",
    active: true
  },
  {
    id: "cirisonic",
    title: "CiriSonic",
    description: "Fábrica de contenido IA con automatización inteligente y estrategia de engagement optimizada",
    category: "Fábrica IA",
    outcome: "Contenido automatizado y engagement aumentado",
    color: "red",
    image: "/images/projects/cirisonic.svg",
    href: "/cirisonic",
    details: [
      "Sistema IA para generación de contenido personalizado",
      "Automatización de calendario de publicaciones",
      "Engagement analytics en tiempo real",
      "A/B testing automatizado para optimización"
    ],
    status: "Beta",
    launched: "2024",
    active: true
  },
  {
    id: "hbm-podcast",
    title: "Hablando Mierda (HBM)",
    description: "Podcast y plataforma de conversaciones sin filtros",
    category: "Podcast + Media",
    outcome: "Comunidad activa y monetización por episodio",
    color: "red",
    image: "/images/projects/hbm-podcast.svg",
    href: "/hbm",
    details: [
      "Conversaciones auténticas sin censura",
      "Filosofía callejera con sentido humano",
      "Comunidad comprometida de oyentes",
      "Monetización directa por episodio"
    ],
    status: "Activo",
    launched: "2023",
    active: false
  },
  {
    id: "masa-tina",
    title: "Cocina Tina",
    description: "Experiencias gastronómicas con catálogo, POS y procesamiento Stripe integrado",
    category: "Catálogo + POS + Stripe",
    outcome: "Ventas procesadas y experiencias entregadas",
    color: "gray",
    image: "/images/projects/masa-tina.svg",
    href: "/masa-tina",
    details: [
      "Gastronomía dominicana auténtica",
      "Sistema POS integrado con Stripe",
      "Catálogo digital de productos",
      "Experiencias culinarias personalizadas"
    ],
    status: "Activo",
    launched: "2022",
    active: true
  },
  {
    id: "verde-prive",
    title: "Verde Privé",
    description: "Lifestyle cannabis premium con máxima privacidad y calidad artesanal para adultos conscientes",
    category: "Cannabis + Lifestyle",
    outcome: "Experiencias premium y bienestar entregados discretamente",
    color: "red",
    image: "/images/projects/verde-prive.svg",
    href: "/verde-prive",
    details: [
      "Cannabis artesanal de máxima calidad",
      "Privacidad y discreción garantizada",
      "Lifestyle premium para adultos conscientes",
      "Productos wellness y bienestar integral"
    ],
    status: "Desarrollo",
    launched: "2025",
    active: false
  },
  {
    id: "maalca-properties",
    title: "MaalCa Properties",
    description: "Propiedades turísticas frente al océano en República Dominicana, conectando clientes globales con el paraíso caribeño",
    category: "Turismo + Real Estate",
    outcome: "Propiedades vendidas a inversores globales",
    color: "gray",
    image: "/images/projects/maalca-properties.svg",
    href: "/maalca-properties",
    details: [
      "Propiedades frente al océano en RD",
      "Inversión turística para clientes globales",
      "Gestión completa de propiedades",
      "ROI optimizado para inversores internacionales"
    ],
    status: "Activo",
    launched: "2023",
    active: true
  }
];

const categories = ["Todos", "Editorial + KDP", "Autor + Escritor Creativo", "Fábrica IA", "Podcast + Media", "Catálogo + POS + Stripe", "Cannabis + Lifestyle", "Turismo + Real Estate"];

export default function EcosistemaPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Generate translated projects
  const allTranslatedProjects = [
    {
      id: "editorial-maalca",
      titleKey: "project.editorial.title",
      descriptionKey: "project.editorial.description",
      categoryKey: "project.editorial.category",
      outcomeKey: "project.editorial.outcome",
      color: "red",
      image: "/images/projects/editorial-maalca.svg",
      href: "/editorial",
      detailKeys: ["details.editorial.1", "details.editorial.2", "details.editorial.3", "details.editorial.4"],
      statusKey: "ecosystem.status.active",
      launched: "2022",
      active: true
    },
    {
      id: "ciriwhispers",
      titleKey: "project.ciriwhispers.title",
      descriptionKey: "project.ciriwhispers.description",
      categoryKey: "project.ciriwhispers.category",
      outcomeKey: "project.ciriwhispers.outcome",
      color: "gray",
      image: "/images/projects/ciriwhispers.png",
      href: "/ciriwhispers",
      detailKeys: ["details.ciriwhispers.1", "details.ciriwhispers.2", "details.ciriwhispers.3", "details.ciriwhispers.4"],
      statusKey: "ecosystem.status.active",
      launched: "2024",
      active: true
    },
    {
      id: "cirisonic",
      titleKey: "project.cirisonic.title",
      descriptionKey: "project.cirisonic.description",
      categoryKey: "project.cirisonic.category",
      outcomeKey: "project.cirisonic.outcome",
      color: "red",
      image: "/images/projects/cirisonic.svg",
      href: "/cirisonic",
      detailKeys: ["details.cirisonic.1", "details.cirisonic.2", "details.cirisonic.3", "details.cirisonic.4"],
      statusKey: "ecosystem.status.beta",
      launched: "2024",
      active: true
    },
    {
      id: "hbm-podcast",
      titleKey: "project.hbm.title",
      descriptionKey: "project.hbm.description",
      categoryKey: "project.hbm.category",
      outcomeKey: "project.hbm.outcome",
      color: "red",
      image: "/images/projects/hbm-podcast.svg",
      href: "/hbm",
      detailKeys: ["details.hbm.1", "details.hbm.2", "details.hbm.3", "details.hbm.4"],
      statusKey: "ecosystem.status.active",
      launched: "2023",
      active: false
    },
    {
      id: "masa-tina",
      titleKey: "project.masatina.title",
      descriptionKey: "project.masatina.description",
      categoryKey: "project.masatina.category",
      outcomeKey: "project.masatina.outcome",
      color: "gray",
      image: "/images/projects/masa-tina.svg",
      href: "/masa-tina",
      detailKeys: ["details.masatina.1", "details.masatina.2", "details.masatina.3", "details.masatina.4"],
      statusKey: "ecosystem.status.active",
      launched: "2022",
      active: true
    },
    {
      id: "verde-prive",
      titleKey: "project.verdeprive.title",
      descriptionKey: "project.verdeprive.description",
      categoryKey: "project.verdeprive.category",
      outcomeKey: "project.verdeprive.outcome",
      color: "red",
      image: "/images/projects/verde-prive.svg",
      href: "/verde-prive",
      detailKeys: ["details.verdeprive.1", "details.verdeprive.2", "details.verdeprive.3", "details.verdeprive.4"],
      statusKey: "ecosystem.status.development",
      launched: "2025",
      active: false
    },
    {
      id: "maalca-properties",
      titleKey: "project.properties.title",
      descriptionKey: "project.properties.description",
      categoryKey: "project.properties.category",
      outcomeKey: "project.properties.outcome",
      color: "gray",
      image: "/images/projects/maalca-properties.svg",
      href: "/maalca-properties",
      detailKeys: ["details.properties.1", "details.properties.2", "details.properties.3", "details.properties.4"],
      statusKey: "ecosystem.status.active",
      launched: "2023",
      active: true
    }
  ];

  // Filter only active projects
  const translatedProjects = allTranslatedProjects.filter(project => project.active !== false);

  const handleProjectClick = (href: string) => {
    router.push(href);
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      [t('ecosystem.status.active')]: "text-green-600 bg-green-50 border-green-200",
      [t('ecosystem.status.beta')]: "text-blue-600 bg-blue-50 border-blue-200",
      [t('ecosystem.status.development')]: "text-orange-600 bg-orange-50 border-orange-200"
    };
    return statusMap[status] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
              {t('ecosystem.hero.title')}
              <span className="block text-brand-primary">{t('ecosystem.hero.subtitle')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
              {t('ecosystem.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-text-muted">
                <span className="font-medium">6</span> {t('ecosystem.stats.projects')}
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                <span className="font-medium">4</span> {t('ecosystem.stats.verticals')}
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                {t('ecosystem.stats.founded')} <span className="font-medium">2020</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {translatedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-surface rounded-2xl overflow-hidden border border-border hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
                  {/* Project Image */}
                  <div className="aspect-[2/1] overflow-hidden">
                    <ProjectImage
                      src={project.image}
                      alt={t(project.titleKey)}
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
                      <span className="text-xs text-text-muted">
                        {t('ecosystem.launched')} {project.launched}
                      </span>
                    </div>

                    {/* Title and Category Badge */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                        {t(project.titleKey)}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        project.color === 'red'
                          ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                          : 'bg-surface-elevated text-text-secondary border border-border'
                      }`}>
                        {t(project.categoryKey)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {t(project.descriptionKey)}
                    </p>

                    {/* Key Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-text-primary mb-3">{t('ecosystem.keyFeatures')}</h4>
                      <ul className="space-y-2">
                        {project.detailKeys.map((detailKey, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                            {t(detailKey)}
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
                      {t('ecosystem.exploreProject')} {t(project.titleKey)}
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('ecosystem.cta.title')}
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
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
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
                onClick={() => handleProjectClick("/servicios")}
              >
                {t('ecosystem.cta.services')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}