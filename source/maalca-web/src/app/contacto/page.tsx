"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    project: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío de formulario
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Form submitted:", formData);
    setIsSubmitting(false);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      message: "",
      project: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
                Hablemos de tu
                <span className="block text-brand-primary">Proyecto</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Cada gran proyecto comienza con una conversación. 
                Cuéntanos tu visión y exploremos juntos las posibilidades.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-surface rounded-2xl p-8 border border-border shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Envíanos un mensaje
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors text-text-primary"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors text-text-primary"
                      placeholder="tu@email.com"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-text-primary mb-2">
                      Empresa/Organización
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors text-text-primary"
                      placeholder="Nombre de tu empresa (opcional)"
                    />
                  </div>

                  {/* Project Type */}
                  <div>
                    <label htmlFor="project" className="block text-sm font-medium text-text-primary mb-2">
                      Tipo de Proyecto
                    </label>
                    <select
                      id="project"
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors text-text-primary"
                    >
                      <option value="">Selecciona un tipo de proyecto</option>
                      <option value="editorial">Editorial y Publicaciones</option>
                      <option value="tech">Desarrollo Tecnológico</option>
                      <option value="content">Creación de Contenido</option>
                      <option value="real-estate">Bienes Raíces</option>
                      <option value="consulting">Consultoría</option>
                      <option value="collaboration">Colaboración/Partnership</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors text-text-primary resize-vertical"
                      placeholder="Cuéntanos sobre tu proyecto, ideas o cómo podemos colaborar..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enviando...
                      </div>
                    ) : (
                      "Enviar Mensaje"
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Company Info */}
              <div className="bg-surface rounded-2xl p-8 border border-border">
                <h3 className="text-xl font-bold text-text-primary mb-6">
                  Información de Contacto
                </h3>
                
                <div className="space-y-6">
                  {/* Company */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">MaalCa LLC</h4>
                      <p className="text-text-secondary">Ecosistema Creativo</p>
                      <p className="text-sm text-text-muted">Elmira, NY • Estados Unidos</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">Email</h4>
                      <a href="mailto:hola@maalca.com" className="text-brand-primary hover:underline">
                        hola@maalca.com
                      </a>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">Tiempo de Respuesta</h4>
                      <p className="text-text-secondary">24-48 horas hábiles</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Philosophy Quote */}
              <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-8 border border-brand-primary/20">
                <blockquote className="text-text-primary">
                  <p className="text-lg font-medium italic mb-4">
                    &ldquo;Cada conversación es una oportunidad de crear algo extraordinario. 
                    En MaalCa creemos que los mejores proyectos nacen del diálogo genuino y la conexión humana.&rdquo;
                  </p>
                  <cite className="text-sm text-text-secondary">
                    — Filosofía MaalCa
                  </cite>
                </blockquote>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}