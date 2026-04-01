"use client";

import { useState } from "react";

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
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            La confianza de nuestros clientes es nuestro mayor logro. Descubre por qué eligen MaalCa para sus eventos más importantes.
          </p>
        </div>

        <div className="relative">
          {/* Main Testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <div
              key={activeTestimonial}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 lg:p-12 shadow-xl animate-fade-in-scale"
            >
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                <div className="flex-shrink-0 hover:scale-105 transition-transform duration-300">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <span
                        key={i}
                        className="text-amber-500 text-xl animate-fade-in-scale"
                        style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <blockquote
                    className="text-lg lg:text-xl text-gray-700 italic mb-6 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: '0.4s' }}
                  >
                    {`"${testimonials[activeTestimonial].content}"`}
                  </blockquote>

                  <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {testimonials[activeTestimonial].name}
                    </h4>
                    <p className="text-gray-600">
                      {testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center gap-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${
                  index === activeTestimonial
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/30 to-amber-300/30 rounded-full blur-3xl -z-10" />
        </div>

        {/* Stats Section */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-center animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          {[
            { number: "500+", label: "Eventos Realizados" },
            { number: "98%", label: "Clientes Satisfechos" },
            { number: "5★", label: "Calificación Promedio" }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <div
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 animate-fade-in-scale"
                style={{ animationDelay: `${index * 0.2 + 1}s` }}
              >
                {stat.number}
              </div>
              <p className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
