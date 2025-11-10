"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { projects, affiliates } from "@/data";

export default function HomePage() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900/20" />
          <motion.div
            className="absolute inset-0"
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 40%, rgba(220, 38, 38, 0.1) 0%, transparent 50%)",
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
              className="font-display text-6xl sm:text-8xl lg:text-9xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <span className="text-white">MaalCa</span>
              <br />
              <span className="text-red-600">Ecosistema</span>
              <br />
              <span className="text-gray-400">Creativo</span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl lg:text-3xl font-light mb-12 max-w-4xl mx-auto leading-relaxed text-gray-300"
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
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 text-xl px-12 py-4"
                onClick={() => scrollToSection('ecosistema')}
              >
                Conoce nuestros proyectos
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black text-xl px-12 py-4"
                onClick={() => scrollToSection('contacto')}
              >
                Únete al ecosistema
              </Button>
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
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center cursor-pointer"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => scrollToSection('about')}
          >
            <motion.div
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About / Storytelling Section */}
      <section id="about" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-8">
              Sobre MaalCa
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
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
                <div className="text-6xl font-bold text-red-600 mb-4">{item.year}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem / Projects Section */}
      <section id="ecosistema" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-8">
              Nuestro Ecosistema
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Proyectos diversos que reflejan nuestra pasión por la creatividad, la innovación y la comunidad
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Editorial MaalCa",
                description: "Publicaciones que exploran cultura, creatividad y sociedad",
                category: "Editorial",
                color: "red"
              },
              {
                title: "CiriWhispers",
                description: "Proyecto de contenido íntimo y conversaciones profundas",
                category: "Contenido",
                color: "gray"
              },
              {
                title: "Hablando Mierda (HBM)",
                description: "Podcast y plataforma de conversaciones sin filtros",
                category: "Podcast",
                color: "red"
              },
              {
                title: "Cocina Tina",
                description: "Experiencias gastronómicas y catering premium",
                category: "Gastronomía",
                color: "gray"
              },
              {
                title: "Dispensario",
                description: "Wellness y productos de bienestar integral",
                category: "Wellness",
                color: "red"
              },
              {
                title: "Inmobiliaria",
                description: "Desarrollos inmobiliarios con visión creativa",
                category: "Real Estate",
                color: "gray"
              }
            ].map((project, index) => (
              <motion.div
                key={project.title}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-gray-900 rounded-2xl p-8 h-full border border-gray-800 hover:border-red-600/50 transition-all duration-300">
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                    project.color === 'red' 
                      ? 'bg-red-600/20 text-red-400 border border-red-600/30' 
                      : 'bg-gray-800 text-gray-300 border border-gray-700'
                  }`}>
                    {project.category}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-6 flex items-center text-red-400 group-hover:text-red-300 transition-colors">
                    <span className="text-sm font-medium">Explorar proyecto</span>
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliates Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-8">
              Afiliados y Partners
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Colaboradores que comparten nuestra visión y potencian nuestro ecosistema
            </p>
          </motion.div>

          {/* Affiliates Carousel */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              "Pegote Barbershop",
              "Studio Alpha",
              "Creative Hub",
              "Design Co.",
              "Media Lab",
              "Art Collective"
            ].map((affiliate, index) => (
              <motion.div
                key={affiliate}
                className="group text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gray-800 rounded-xl p-8 h-24 flex items-center justify-center mb-4 group-hover:bg-red-600 transition-all duration-300">
                  <span className="text-gray-400 group-hover:text-white font-bold text-lg">
                    {affiliate.split(' ').map(word => word[0]).join('')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm group-hover:text-white transition-colors">
                  {affiliate}
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