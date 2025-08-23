"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    name: "María Elena Rodríguez",
    role: "Directora de Eventos",
    company: "Hotel Boutique Santiago",
    content: "MaalCa transformó completamente la experiencia gastronómica de nuestros eventos. La calidad de sus productos y la atención al detalle son excepcionales. Nuestros huéspedes siempre quedan impresionados.",
    rating: 5,
    image: "/images/team/maria.jpg"
  },
  {
    name: "Carlos Mendoza",
    role: "CEO",
    company: "Innovatech Solutions",
    content: "Para nuestras reuniones corporativas, MaalCa ha sido la elección perfecta. Sus Box Comida no solo son deliciosos, sino que reflejan la sofisticación que buscamos transmitir a nuestros clientes.",
    rating: 5,
    image: "/images/team/carlos.jpg"
  },
  {
    name: "Isabella Torres",
    role: "Wedding Planner",
    company: "Momentos Únicos",
    content: "He trabajado con muchos caterings, pero MaalCa se destaca por su creatividad y profesionalismo. Cada evento es una obra de arte gastronómica que los novios y sus invitados recuerdan para siempre.",
    rating: 5,
    image: "/images/team/isabella.jpg"
  }
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const testimonialVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            La confianza de nuestros clientes es nuestro mayor logro. Descubre por qué eligen MaalCa para sus eventos más importantes.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative"
        >
          {/* Main Testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <motion.div
              key={activeTestimonial}
              variants={testimonialVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 lg:p-12 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                <motion.div
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                </motion.div>

                <div className="flex-1 text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="text-amber-500 text-xl"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>

                  <motion.blockquote
                    className="text-lg lg:text-xl text-gray-700 italic mb-6 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    "{testimonials[activeTestimonial].content}"
                  </motion.blockquote>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {testimonials[activeTestimonial].name}
                    </h4>
                    <p className="text-gray-600">
                      {testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center gap-4">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeTestimonial 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                whileHover={{ scale: index === activeTestimonial ? 1.25 : 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-amber-300/30 rounded-full blur-3xl -z-10" />
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-center"
        >
          {[
            { number: "500+", label: "Eventos Realizados" },
            { number: "98%", label: "Clientes Satisfechos" },
            { number: "5★", label: "Calificación Promedio" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.2 + 1, type: "spring", stiffness: 200 }}
              >
                {stat.number}
              </motion.div>
              <p className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}