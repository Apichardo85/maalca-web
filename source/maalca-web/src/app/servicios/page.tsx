"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";

const services = [
  {
    id: "editorial-kdp",
    title: "Editorial + Amazon KDP",
    description: "Desde la conceptualización hasta la distribución global de tu contenido",
    icon: "📚",
    features: [
      "Redacción y edición profesional",
      "Diseño de portada y maquetación",
      "Configuración en Amazon KDP",
      "Distribución global automática",
      "Marketing de lanzamiento",
      "Análisis de métricas de ventas"
    ],
    pricing: "Desde $2,500",
    timeline: "4-6 semanas"
  },
  {
    id: "fabrica-ia",
    title: "Fábrica de Contenido IA",
    description: "Automatización inteligente de tu estrategia de contenido con IA",
    icon: "🤖",
    features: [
      "Sistema de autopost calendárizado",
      "Generación de contenido personalizado",
      "Optimización para engagement",
      "Analytics en tiempo real",
      "A/B testing automatizado",
      "Integración con todas las plataformas"
    ],
    pricing: "Desde $1,800/mes",
    timeline: "2-3 semanas setup"
  },
  {
    id: "podcast-media",
    title: "Producción Podcast + Media",
    description: "Tu voz al mundo con producción profesional y distribución estratégica",
    icon: "🎙️",
    features: [
      "Producción de audio profesional",
      "Edición y post-producción",
      "Distribución en todas las plataformas",
      "Creación de audiencias",
      "Monetización desde el primer episodio",
      "Branding completo del show"
    ],
    pricing: "Desde $3,200",
    timeline: "3-4 semanas"
  },
  {
    id: "pos-ecommerce",
    title: "Catálogo + POS + Stripe",
    description: "Solución completa de ventas online con procesamiento de pagos integrado",
    icon: "💳",
    features: [
      "Catálogo digital profesional",
      "Sistema POS integrado",
      "Procesamiento Stripe",
      "Gestión de inventario",
      "Dashboard de ventas",
      "Soporte técnico 24/7"
    ],
    pricing: "Desde $4,500",
    timeline: "6-8 semanas"
  },
  {
    id: "proptech-real-estate",
    title: "PropTech + Real Estate",
    description: "Tecnología inmobiliaria para maximizar tus inversiones turísticas",
    icon: "🏝️",
    features: [
      "Plataforma de gestión de propiedades",
      "Marketing digital especializado",
      "Captación de inversores globales",
      "Análisis de ROI automatizado",
      "Documentación legal completa",
      "Seguimiento post-venta"
    ],
    pricing: "Consultoría personalizada",
    timeline: "8-12 semanas"
  },
  {
    id: "consultoria-integral",
    title: "Consultoría Integral",
    description: "Acompañamiento estratégico para escalar tu negocio con sentido humano",
    icon: "💡",
    features: [
      "Análisis profundo del negocio",
      "Estrategia de crecimiento personalizada",
      "Implementación paso a paso",
      "Mentoring ejecutivo",
      "Acceso a nuestro network",
      "Seguimiento mensual"
    ],
    pricing: "Desde $8,000",
    timeline: "Ongoing"
  }
];

const process = [
  {
    step: "01",
    title: "Conversación Inicial",
    description: "Entendemos tu visión, objetivos y desafíos específicos"
  },
  {
    step: "02", 
    title: "Estrategia Personalizada",
    description: "Diseñamos una propuesta única adaptada a tus necesidades"
  },
  {
    step: "03",
    title: "Implementación",
    description: "Ejecutamos con excelencia mientras te mantenemos informado"
  },
  {
    step: "04",
    title: "Lanzamiento y Optimización",
    description: "Ponemos en marcha y optimizamos basado en resultados reales"
  }
];

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
                Servicios con
                <span className="block text-brand-primary">Sentido Humano</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Transformamos ideas en realidades rentables. Cada servicio está diseñado 
                para generar resultados tangibles mientras mantenemos la esencia humana en cada proyecto.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Soluciones integrales que combinan tecnología de punta con estrategia humanizada
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-surface rounded-2xl p-8 h-full border border-border hover:border-brand-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
                  {/* Icon */}
                  <div className="text-4xl mb-6">{service.icon}</div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-brand-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-2 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing and Timeline */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Inversión:</span>
                      <span className="font-semibold text-brand-primary">{service.pricing}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Timeline:</span>
                      <span className="font-semibold text-text-secondary">{service.timeline}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300"
                  >
                    Más Información
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Nuestro Proceso
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Un enfoque sistemático que garantiza resultados mientras mantenemos la comunicación transparente
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="text-center">
                  {/* Step Number */}
                  <div className="w-16 h-16 bg-brand-primary/10 border-2 border-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-brand-primary font-bold text-lg">{step.step}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-4">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line */}
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-border"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Teaser */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Resultados Reales
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
              Nuestros clientes no solo obtienen servicios, obtienen resultados medibles y crecimiento sostenible
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { metric: "200%", label: "Crecimiento promedio en engagement" },
              { metric: "15+", label: "Proyectos lanzados exitosamente" },
              { metric: "98%", label: "Satisfacción del cliente" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-surface rounded-2xl border border-border"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="text-4xl font-bold text-brand-primary mb-2">{stat.metric}</div>
                <div className="text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
            >
              Ver Casos de Estudio Completos
            </Button>
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
              ¿Listo para transformar tu proyecto?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Cada proyecto único merece una propuesta personalizada. 
              Conversemos sobre tu visión y creemos algo extraordinario juntos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover"
              >
                Solicitar Consulta Gratuita
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background"
              >
                Ver Nuestro Portafolio
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}