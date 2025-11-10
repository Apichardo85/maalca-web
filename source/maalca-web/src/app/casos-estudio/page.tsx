"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";

const caseStudies = [
  {
    id: "editorial-maalca-case",
    title: "Editorial MaalCa: Filosofía Digital Global",
    category: "Editorial + KDP",
    challenge: "Crear una editorial que pudiera competir globalmente desde República Dominicana",
    solution: "Distribución digital via Amazon KDP con enfoque en filosofía contemporánea caribeña",
    results: {
      books: "3 libros publicados",
      reach: "Disponible en 200+ países",
      sales: "Ventas constantes internacionales",
      impact: "Primera editorial dominicana en filosofía digital"
    },
    metrics: [
      { label: "Tiempo de lanzamiento", value: "6 meses", trend: "down" },
      { label: "Países alcanzados", value: "200+", trend: "up" },
      { label: "Costo de distribución", value: "-90%", trend: "down" },
      { label: "Alcance global", value: "100%", trend: "up" }
    ],
    image: "/images/projects/editorial-maalca.svg",
    testimonial: {
      text: "La estrategia digital nos permitió competir globalmente sin las limitaciones tradicionales de la industria editorial",
      author: "Equipo Editorial MaalCa"
    },
    technologies: ["Amazon KDP", "Print on Demand", "Global Distribution", "Digital Marketing"]
  },
  {
    id: "ciriwhispers-case",
    title: "CiriWhispers: Narrativas Íntimas Digitales",
    category: "Autor + Escritor Creativo",
    challenge: "Crear conexiones auténticas en un mundo digital saturado",
    solution: "Narrativas personales profundas con sistema bilingüe y engagement genuino",
    results: {
      engagement: "85% tasa de engagement",
      retention: "Audiencia fiel y creciente",
      books: "2 novelas publicadas",
      community: "Comunidad global activa"
    },
    metrics: [
      { label: "Engagement Rate", value: "85%", trend: "up" },
      { label: "Tiempo de lectura", value: "12 min avg", trend: "up" },
      { label: "Retención de audiencia", value: "92%", trend: "up" },
      { label: "Crecimiento mensual", value: "15%", trend: "up" }
    ],
    image: "/images/projects/ciriwhispers.png",
    testimonial: {
      text: "La autenticidad y profundidad de las narrativas crearon una conexión real con lectores globales",
      author: "Ciriaco A. Pichardo"
    },
    technologies: ["Bilingual Content", "Personal Branding", "Digital Storytelling", "Community Building"]
  },
  {
    id: "masa-tina-case",
    title: "Cocina Tina: Gastronomía Digital Dominicana",
    category: "Catálogo + POS + Stripe",
    challenge: "Digitalizar experiencias gastronómicas tradicionales dominicanas",
    solution: "Plataforma completa con catálogo, POS y procesamiento de pagos integrado",
    results: {
      orders: "500+ pedidos mensuales",
      efficiency: "Operaciones 70% más eficientes",
      revenue: "Ingresos incrementados 200%",
      satisfaction: "98% satisfacción del cliente"
    },
    metrics: [
      { label: "Pedidos mensuales", value: "500+", trend: "up" },
      { label: "Tiempo de procesamiento", value: "-60%", trend: "down" },
      { label: "Incremento de ingresos", value: "+200%", trend: "up" },
      { label: "Satisfacción cliente", value: "98%", trend: "up" }
    ],
    image: "/images/projects/masa-tina.svg",
    testimonial: {
      text: "La digitalización preservó la esencia de nuestra cocina tradicional mientras modernizó completamente el negocio",
      author: "Equipo Cocina Tina"
    },
    technologies: ["Stripe Integration", "Custom POS", "Digital Catalog", "Order Management"]
  },
  {
    id: "hbm-podcast-case",
    title: "Hablando Mierda: Filosofía Sin Filtros",
    category: "Podcast + Media",
    challenge: "Crear contenido auténtico que resonara con audiencias diversas",
    solution: "Conversaciones sin censura con filosofía callejera y sentido humano",
    results: {
      episodes: "50+ episodios publicados",
      downloads: "10K+ descargas mensuales",
      community: "Comunidad activa y comprometida",
      monetization: "Monetización por episodio exitosa"
    },
    metrics: [
      { label: "Episodios publicados", value: "50+", trend: "up" },
      { label: "Descargas mensuales", value: "10K+", trend: "up" },
      { label: "Engagement promedio", value: "78%", trend: "up" },
      { label: "Crecimiento audiencia", value: "25%", trend: "up" }
    ],
    image: "/images/projects/hbm-podcast.svg",
    testimonial: {
      text: "La autenticidad y las conversaciones reales crearon una comunidad que trasciende el formato digital",
      author: "Oyente Regular HBM"
    },
    technologies: ["Podcast Production", "Community Building", "Content Strategy", "Monetization"]
  },
  {
    id: "verde-prive-case",
    title: "Verde Privé: Cannabis Premium Discreto",
    category: "Cannabis + Lifestyle",
    challenge: "Crear una marca premium de cannabis con máxima discreción y calidad",
    solution: "Lifestyle brand enfocado en bienestar adulto consciente con privacidad garantizada",
    results: {
      launch: "Lanzamiento Q1 2025",
      positioning: "Posicionamiento premium establecido",
      privacy: "Sistema de privacidad implementado",
      quality: "Estándares artesanales definidos"
    },
    metrics: [
      { label: "Preparación de lanzamiento", value: "90%", trend: "up" },
      { label: "Desarrollo de producto", value: "85%", trend: "up" },
      { label: "Sistema de privacidad", value: "100%", trend: "up" },
      { label: "Posicionamiento premium", value: "Establecido", trend: "up" }
    ],
    image: "/images/projects/verde-prive.svg",
    testimonial: {
      text: "Combinar calidad artesanal con discreción total redefine la experiencia del cannabis premium",
      author: "Equipo Desarrollo Verde Privé"
    },
    technologies: ["Privacy Systems", "Premium Branding", "Quality Control", "Discreet Operations"]
  },
  {
    id: "maalca-properties-case",
    title: "MaalCa Properties: Inversión Turística Global",
    category: "Turismo + Real Estate",
    challenge: "Conectar inversores globales con propiedades turísticas dominicanas",
    solution: "Plataforma especializada en propiedades frente al océano con gestión completa",
    results: {
      properties: "25+ propiedades gestionadas",
      investors: "Inversores de 15 países",
      roi: "ROI promedio 18% anual",
      satisfaction: "100% satisfacción inversores"
    },
    metrics: [
      { label: "Propiedades activas", value: "25+", trend: "up" },
      { label: "Países de inversores", value: "15", trend: "up" },
      { label: "ROI promedio anual", value: "18%", trend: "up" },
      { label: "Satisfacción inversores", value: "100%", trend: "up" }
    ],
    image: "/images/projects/maalca-properties.svg",
    testimonial: {
      text: "La expertise local combinada con visión internacional hizo realidad nuestras inversiones en el Caribe",
      author: "Inversor Internacional"
    },
    technologies: ["Property Management", "International Marketing", "ROI Analytics", "Client Relations"]
  }
];

export default function CasosEstudioPage() {
  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? "↗️" : "↙️";
  };

  const getTrendColor = (trend: "up" | "down") => {
    return trend === "up" ? "text-green-600" : "text-blue-600";
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
              Casos de
              <span className="block text-brand-primary">Estudio</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
              Análisis profundos de nuestros proyectos: desafíos enfrentados, soluciones implementadas 
              y resultados medibles que demuestran el impacto real del ecosistema MaalCa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-text-muted">
                <span className="font-medium">6</span> Casos Analizados
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                <span className="font-medium">4</span> Verticales de Negocio
              </div>
              <div className="hidden sm:block text-text-muted">•</div>
              <div className="text-sm text-text-muted">
                Resultados <span className="font-medium">Verificables</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  {/* Content */}
                  <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    {/* Header */}
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-primary/20 text-brand-primary border border-brand-primary/30 mb-4">
                        {study.category}
                      </span>
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
                        {study.title}
                      </h2>
                    </div>

                    {/* Challenge & Solution */}
                    <div className="space-y-6">
                      <div className="bg-surface rounded-xl p-6 border border-border">
                        <h3 className="text-lg font-bold text-red-600 mb-3">🎯 Desafío</h3>
                        <p className="text-text-secondary leading-relaxed">{study.challenge}</p>
                      </div>
                      
                      <div className="bg-surface rounded-xl p-6 border border-border">
                        <h3 className="text-lg font-bold text-green-600 mb-3">💡 Solución</h3>
                        <p className="text-text-secondary leading-relaxed">{study.solution}</p>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="bg-surface rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-bold text-text-primary mb-4">📊 Métricas Clave</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {study.metrics.map((metric, idx) => (
                          <div key={idx} className="text-center p-4 bg-surface-elevated rounded-lg border border-border">
                            <div className={`text-2xl font-bold ${getTrendColor(metric.trend)} mb-1`}>
                              {metric.value} {getTrendIcon(metric.trend)}
                            </div>
                            <div className="text-sm text-text-muted">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-3">Tecnologías y Enfoques:</h4>
                      <div className="flex flex-wrap gap-2">
                        {study.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-surface-elevated text-text-secondary px-2 py-1 rounded-md border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-brand-primary/5 rounded-xl p-6 border border-brand-primary/20">
                      <blockquote className="text-text-primary italic mb-3">
                        "{study.testimonial.text}"
                      </blockquote>
                      <cite className="text-sm text-brand-primary font-medium">
                        — {study.testimonial.author}
                      </cite>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="aspect-square overflow-hidden rounded-2xl border border-border shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <ProjectImage 
                        src={study.image} 
                        alt={study.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Results Summary */}
                    <div className="mt-6 bg-surface rounded-xl p-6 border border-border">
                      <h3 className="text-lg font-bold text-text-primary mb-4">🏆 Resultados Clave</h3>
                      <div className="space-y-2">
                        {Object.entries(study.results).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-text-secondary text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-text-primary font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
              ¿Tu proyecto será el próximo caso de estudio?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Cada proyecto del ecosistema MaalCa comienza con una idea audaz y se convierte 
              en una solución medible. Conversemos sobre tu visión.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
                onClick={() => window.location.href = '/contacto'}
              >
                Iniciar Tu Proyecto
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
                onClick={() => window.location.href = '/servicios'}
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