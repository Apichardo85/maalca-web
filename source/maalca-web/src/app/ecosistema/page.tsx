"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";

const projects = [
  {
    id: "editorial-maalca",
    title: "Editorial MaalCa",
    description: "Publicaciones que exploran cultura, creatividad y sociedad con distribución global en Amazon KDP",
    category: "Editorial + KDP",
    outcome: "Libros publicados y distribuidos globalmente",
    color: "red",
    image: "/images/projects/editorial-maalca.svg",
    details: [
      "Filosofía contemporánea y pensamiento crítico",
      "Análisis cultural desde perspectiva caribeña",
      "Distribución global a través de Amazon KDP",
      "Formato digital y físico disponible"
    ],
    status: "Activo",
    launched: "2022"
  },
  {
    id: "ciriwhispers",
    title: "CiriWhispers",
    description: "Contenido íntimo y conversaciones profundas con estrategia IA para autopost calendario",
    category: "Fábrica IA",
    outcome: "Contenido automatizado y engagement aumentado",
    color: "gray",
    image: "/images/projects/ciriwhispers.png",
    details: [
      "Sistema IA para generación de contenido personalizado",
      "Automatización de calendario de publicaciones",
      "Engagement analytics en tiempo real",
      "Contenido íntimo y auténtico optimizado"
    ],
    status: "Beta",
    launched: "2024"
  },
  {
    id: "hbm-podcast",
    title: "Hablando Mierda (HBM)",
    description: "Podcast y plataforma de conversaciones sin filtros",
    category: "Podcast + Media",
    outcome: "Comunidad activa y monetización por episodio",
    color: "red",
    image: "/images/projects/hbm-podcast.svg",
    details: [
      "Conversaciones auténticas sin censura",
      "Filosofía callejera con sentido humano",
      "Comunidad comprometida de oyentes",
      "Monetización directa por episodio"
    ],
    status: "Activo",
    launched: "2023"
  },
  {
    id: "masa-tina",
    title: "Masa Tina",
    description: "Experiencias gastronómicas con catálogo, POS y procesamiento Stripe integrado",
    category: "Catálogo + POS + Stripe",
    outcome: "Ventas procesadas y experiencias entregadas",
    color: "gray",
    image: "/images/projects/masa-tina.svg",
    details: [
      "Gastronomía dominicana auténtica",
      "Sistema POS integrado con Stripe",
      "Catálogo digital de productos",
      "Experiencias culinarias personalizadas"
    ],
    status: "Activo",
    launched: "2022"
  },
  {
    id: "verde-prive",
    title: "Verde Privé",
    description: "Lifestyle cannabis premium con máxima privacidad y calidad artesanal para adultos conscientes",
    category: "Cannabis + Lifestyle",
    outcome: "Experiencias premium y bienestar entregados discretamente",
    color: "red",
    image: "/images/projects/verde-prive.svg",
    details: [
      "Cannabis artesanal de máxima calidad",
      "Privacidad y discreción garantizada",
      "Lifestyle premium para adultos conscientes",
      "Productos wellness y bienestar integral"
    ],
    status: "Desarrollo",
    launched: "2025"
  },
  {
    id: "maalca-properties",
    title: "MaalCa Properties",
    description: "Propiedades turísticas frente al océano en República Dominicana, conectando clientes globales con el paraíso caribeño",
    category: "Turismo + Real Estate",
    outcome: "Propiedades vendidas a inversores globales",
    color: "gray",
    image: "/images/projects/maalca-properties.svg",
    details: [
      "Propiedades frente al océano en RD",
      "Inversión turística para clientes globales",
      "Gestión completa de propiedades",
      "ROI optimizado para inversores internacionales"
    ],
    status: "Activo",
    launched: "2023"
  }
];

const categories = ["Todos", "Editorial + KDP", "Fábrica IA", "Podcast + Media", "Catálogo + POS + Stripe", "Cannabis + Lifestyle", "Turismo + Real Estate"];

export default function EcosistemaPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo": return "text-green-600 bg-green-50 border-green-200";
      case "Beta": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Desarrollo": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
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
              Nuestro
              <span className="block text-brand-primary">Ecosistema</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
              Seis proyectos únicos que reflejan nuestra pasión por la creatividad, 
              la innovación y la conexión humana desde República Dominicana hacia el mundo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-text-muted">
                <span className="font-medium">6</span> Proyectos Activos
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                <span className="font-medium">4</span> Verticales de Negocio
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                Fundado en <span className="font-medium">2020</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {projects.map((project, index) => (
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
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Project Content */}
                  <div className="p-8">
                    {/* Status and Category */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className="text-xs text-text-muted">
                        Lanzado {project.launched}
                      </span>
                    </div>

                    {/* Title and Category Badge */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                        {project.title}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        project.color === 'red' 
                          ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' 
                          : 'bg-surface-elevated text-text-secondary border border-border'
                      }`}>
                        {project.category}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Key Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-text-primary mb-3">Características clave:</h4>
                      <ul className="space-y-2">
                        {project.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Outcome */}
                    <div className="text-sm text-brand-primary font-medium mb-6 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {project.outcome}
                    </div>

                    {/* CTA */}
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                    >
                      Explorar {project.title}
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
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Nuestro ecosistema está en constante evolución. Si tienes una idea que resuene 
              con nuestra filosofía de sentido humano, conversemos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
              >
                Proponer Colaboración
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
              >
                Ver Nuestros Servicios
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}