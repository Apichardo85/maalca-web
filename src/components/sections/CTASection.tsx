"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/buttons";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      id="contact"
      className="relative py-20 overflow-hidden"
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      
      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2
            className="font-display text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            ¿Listo Para Crear 
            <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Una Experiencia Única?
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Permítenos ser parte de tu próximo evento. Contacta con nuestro equipo de expertos 
            y descubre cómo podemos hacer realidad la experiencia gastronómica de tus sueños.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              variant="primary"
              size="lg"
              className="min-w-[200px] text-lg"
            >
              Solicitar Cotización
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] text-lg border-white text-white hover:bg-white hover:text-gray-900"
            >
              Ver Portafolio
            </Button>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              {
                icon: "📞",
                title: "Teléfono",
                content: "+56 9 1234 5678",
                subtitle: "Lun - Vie: 9:00 - 18:00"
              },
              {
                icon: "✉️",
                title: "Email",
                content: "hola@maalca.cl",
                subtitle: "Respuesta en 24hrs"
              },
              {
                icon: "📍",
                title: "Ubicación",
                content: "Santiago, Chile",
                subtitle: "Servicio nacional"
              }
            ].map((contact, index) => (
              <motion.div
                key={contact.title}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <motion.div
                    className="text-3xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {contact.icon}
                  </motion.div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-amber-300 font-medium mb-1">
                    {contact.content}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {contact.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="mt-16 pt-8 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <p className="text-gray-400 mb-4">Confían en nosotros:</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              {["Hotel Boutique", "Innovatech", "Momentos Únicos"].map((client, index) => (
                <motion.span
                  key={client}
                  className="text-white font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 0.6, scale: 1 } : {}}
                  transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                >
                  {client}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
    </section>
  );
}