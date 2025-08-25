"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { projects, affiliates } from "@/data";

export default function HomePage() {
  const router = useRouter();
  
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProjectClick = (href: string) => {
    router.push(href);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain">
        {/* Soft Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
          <motion.div
            className="absolute inset-0"
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.03) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.03) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 40%, rgba(220, 38, 38, 0.03) 0%, transparent 50%)",
              ]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1
              className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <span className="text-text-primary">MaalCa</span>
              <br />
              <span className="text-brand-primary">Ecosistema</span>
              <br />
              <span className="text-text-secondary">Creativo</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed text-text-secondary"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Con corazón dominicano y espíritu global
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <Button
                variant="primary"
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white border-brand-primary hover:border-brand-primary-hover text-lg px-10 py-3"
                onClick={() => scrollToSection('ecosistema')}
              >
                Conoce nuestros proyectos
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-text-primary text-text-primary hover:bg-text-primary hover:text-background text-lg px-10 py-3"
                onClick={() => scrollToSection('contacto')}
              >
                Únete al ecosistema
              </Button>
              <div className="ml-4">
                <ThemeSwitch />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-text-muted rounded-full flex justify-center cursor-pointer"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => scrollToSection('about')}
          >
            <motion.div
              className="w-1 h-3 bg-text-muted rounded-full mt-2"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About / Storytelling Section */}
      <section id="about" className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              Sobre MaalCa
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Somos un ecosistema creativo y empresarial que conecta ideas, personas y proyectos. 
              Desde República Dominicana hacia el mundo, construimos puentes entre la creatividad y los negocios.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                year: "2020",
                title: "Fundación",
                description: "Nace MaalCa como concepto creativo en República Dominicana"
              },
              {
                year: "2022", 
                title: "Expansión",
                description: "Crecimiento del ecosistema con múltiples verticales de negocio"
              },
              {
                year: "2024",
                title: "Consolidación",
                description: "MaalCa LLC establecida en Elmira, NY con proyectos globales"
              }
            ].map((item, index) => (
              <motion.div
                key={item.year}
                className="text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="text-5xl font-bold text-brand-primary mb-4">{item.year}</div>
                <h3 className="text-xl font-bold text-text-primary mb-4">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem / Projects Section */}
      <section id="ecosistema" className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              Nuestro Ecosistema
            </h2>
            <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Proyectos diversos que reflejan nuestra pasión por la creatividad, la innovación y la comunidad
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Editorial MaalCa",
                description: "Publicaciones que exploran cultura, creatividad y sociedad con distribución global en Amazon KDP",
                category: "Editorial + KDP",
                outcome: "Libros publicados y distribuidos globalmente",
                color: "red",
                image: "/images/projects/editorial-maalca.svg",
                href: "/editorial"
              },
              {
                title: "CiriWhispers",
                description: "Autor y escritor creativo especializado en narrativas íntimas y conversaciones profundas",
                category: "Autor + Escritor Creativo",
                outcome: "Contenido auténtico y conexiones humanas genuinas",
                color: "gray",
                image: "/images/projects/ciriwhispers.png",
                href: "/ciriwhispers"
              },
              {
                title: "CiriSonic",
                description: "Fábrica de contenido IA con automatización inteligente y estrategia de engagement optimizada",
                category: "Fábrica IA",
                outcome: "Contenido automatizado y engagement aumentado",
                color: "red",
                image: "/images/projects/cirisonic.svg",
                href: "/cirisonic"
              },
              {
                title: "Hablando Mierda (HBM)",
                description: "Podcast y plataforma de conversaciones sin filtros",
                category: "Podcast + Media",
                outcome: "Comunidad activa y monetización por episodio",
                color: "red",
                image: "/images/projects/hbm-podcast.svg",
                href: "/hablando-mierda"
              },
              {
                title: "Masa Tina",
                description: "Experiencias gastronómicas con catálogo, POS y procesamiento Stripe integrado",
                category: "Catálogo + POS + Stripe",
                outcome: "Ventas procesadas y experiencias entregadas",
                color: "gray",
                image: "/images/projects/masa-tina.svg",
                href: "/masa-tina"
              },
              {
                title: "Verde Privé",
                description: "Lifestyle cannabis premium con máxima privacidad y calidad artesanal para adultos conscientes",
                category: "Cannabis + Lifestyle",
                outcome: "Experiencias premium y bienestar entregados discretamente",
                color: "red",
                image: "/images/projects/verde-prive.svg",
                href: "/verde-prive"
              },
              {
                title: "MaalCa Properties",
                description: "Propiedades turísticas frente al océano en República Dominicana, conectando clientes globales con el paraíso caribeño",
                category: "Turismo + Real Estate",
                outcome: "Propiedades vendidas a inversores globales",
                color: "gray",
                image: "/images/projects/maalca-properties.svg",
                href: "/maalca-properties"
              },
            ].map((project, index) => (
              <motion.div
                key={project.title}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => handleProjectClick(project.href)}
              >
                  <div className="bg-surface rounded-2xl p-6 h-full border border-border hover:border-brand-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg">
                  {/* Project Image */}
                  <ProjectImage 
                    src={project.image} 
                    alt={project.title}
                  />

                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                    project.color === 'red' 
                      ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' 
                      : 'bg-surface-elevated text-text-secondary border border-border'
                  }`}>
                    {project.category}
                  </div>
                  
                  <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-brand-primary transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-text-secondary leading-relaxed text-sm mb-4">
                    {project.description}
                  </p>

                  <div className="text-xs text-text-muted mb-6 font-medium">
                    ✓ {project.outcome}
                  </div>

                  <div className="mt-auto">
                    <div className="w-full bg-transparent border border-brand-primary/20 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 rounded-lg px-4 py-2 text-sm text-center">
                      Ver proyecto
                      <motion.span
                        className="ml-2 inline-block"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                  </div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliates Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              Afiliados y Partners
            </h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Colaboradores que comparten nuestra visión y potencian nuestro ecosistema
            </p>
          </motion.div>

          {/* Affiliates Carousel */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              {
                name: "Pegote Barbershop",
                description: "Barbería dominicana en Elmira, NY",
                href: "/pegote-barber",
                initials: "PB"
              },
              {
                name: "Studio Alpha", 
                description: "Estudio creativo",
                href: "#",
                initials: "SA"
              },
              {
                name: "Creative Hub",
                description: "Hub de creatividad",
                href: "#", 
                initials: "CH"
              },
              {
                name: "Design Co.",
                description: "Compañía de diseño",
                href: "#",
                initials: "DC"
              },
              {
                name: "Media Lab",
                description: "Laboratorio de medios",
                href: "#",
                initials: "ML"
              },
              {
                name: "Art Collective",
                description: "Colectivo artístico", 
                href: "#",
                initials: "AC"
              }
            ].map((affiliate, index) => (
              <motion.div
                key={affiliate.name}
                className="group text-center cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => window.location.href = affiliate.href}
              >
                <div className="bg-surface-elevated rounded-xl p-8 h-24 flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-all duration-300 border border-border">
                  <span className="text-text-secondary group-hover:text-white font-bold text-lg">
                    {affiliate.initials}
                  </span>
                </div>
                <p className="text-text-primary text-sm group-hover:text-brand-primary transition-colors font-medium">
                  {affiliate.name}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  {affiliate.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy / Quote Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.blockquote
            className="font-display text-4xl sm:text-6xl lg:text-8xl font-bold text-white leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            "Donde la creatividad se encuentra con la comunidad y la innovación"
          </motion.blockquote>
          
          <motion.div
            className="mt-8 w-24 h-1 bg-red-600 mx-auto"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-8">
                Conecta con nosotros
              </h2>
              
              <form className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    rows={6}
                    placeholder="Mensaje"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors resize-none"
                  />
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-4"
                >
                  Enviar mensaje
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">MaalCa LLC</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Elmira, NY<br />
                    Estados Unidos
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Correo</h3>
                  <a href="mailto:hello@maalca.com" className="text-red-400 hover:text-red-300 transition-colors">
                    hello@maalca.com
                  </a>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Síguenos</h3>
                  <div className="flex space-x-6">
                    {[
                      { name: "Instagram", icon: "📷" },
                      { name: "YouTube", icon: "📺" },
                      { name: "Spotify", icon: "🎵" },
                      { name: "LinkedIn", icon: "💼" }
                    ].map((social) => (
                      <motion.a
                        key={social.name}
                        href="#"
                        className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl hover:bg-red-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}