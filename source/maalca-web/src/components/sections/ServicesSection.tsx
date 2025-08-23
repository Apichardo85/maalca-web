"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/buttons";

interface ServiceCard {
  title: string;
  description: string;
  features: string[];
  image: string;
  price: string;
}

const services: ServiceCard[] = [
  {
    title: "Box Comida",
    description: "Cajas gourmet personalizadas para eventos corporativos y reuniones especiales. Ingredientes premium en presentaciones elegantes.",
    features: [
      "Menús personalizables",
      "Ingredientes premium",
      "Presentación elegante",
      "Opciones vegetarianas/veganas"
    ],
    image: "/images/services/box-comida.jpg",
    price: "Desde $25.000"
  },
  {
    title: "Bubette",
    description: "Servicio de brunch y desayunos exclusivos. Experiencias gastronómicas matutinas con productos artesanales de la más alta calidad.",
    features: [
      "Brunch gourmet",
      "Productos artesanales",
      "Servicio a domicilio",
      "Montaje completo"
    ],
    image: "/images/services/bubette.jpg",
    price: "Desde $18.000"
  },
  {
    title: "Empanadas Gourmet",
    description: "Empanadas artesanales con rellenos únicos y masa casera. Perfectas para eventos, reuniones y celebraciones especiales.",
    features: [
      "Masa artesanal",
      "Rellenos exclusivos",
      "Horneado al momento",
      "Variedades dulces y saladas"
    ],
    image: "/images/services/empanadas.jpg",
    price: "Desde $3.500"
  }
];

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Nuestros Servicios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre nuestra selección de servicios gastronómicos diseñados para hacer de cada evento una experiencia memorable
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="group"
            >
              <motion.div
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.div
                    className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      {service.price}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-center text-gray-700"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ 
                          delay: index * 0.3 + featureIndex * 0.1 + 0.5,
                          duration: 0.4
                        }}
                      >
                        <motion.div
                          className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mr-3"
                          initial={{ scale: 0 }}
                          animate={isInView ? { scale: 1 } : {}}
                          transition={{ 
                            delay: index * 0.3 + featureIndex * 0.1 + 0.6,
                            type: "spring",
                            stiffness: 300
                          }}
                        />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    size="md"
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-orange-600 group-hover:text-white group-hover:border-transparent"
                  >
                    Solicitar Información
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-16"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Ver Todos los Servicios
          </Button>
        </motion.div>
      </div>
    </section>
  );
}