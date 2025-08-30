"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { FormField } from "@/components/ui/FormField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SelectField } from "@/components/ui/SelectField";
import { useFormValidation, EMAIL_PATTERN, NAME_PATTERN, type ValidationRules } from "@/hooks/useFormValidation";
import { useContactForm, type ContactFormData } from "@/hooks/useContactForm";

// Form validation rules
const validationRules: ValidationRules = {
  name: {
    required: true,
    minLength: 2,
    pattern: NAME_PATTERN,
    custom: (value: string) => {
      if (value.trim().split(' ').length < 2) {
        return 'Por favor ingresa tu nombre completo';
      }
      return null;
    }
  },
  email: {
    required: true,
    pattern: EMAIL_PATTERN
  },
  company: {
    maxLength: 100
  },
  project: {
    required: true
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000
  }
};

// Project type options
const projectOptions = [
  { value: "editorial", label: "Editorial y Publicaciones" },
  { value: "tech", label: "Desarrollo Tecnológico" },
  { value: "content", label: "Creación de Contenido" },
  { value: "real-estate", label: "Bienes Raíces" },
  { value: "catering", label: "Servicios de Catering" },
  { value: "consulting", label: "Consultoría" },
  { value: "collaboration", label: "Colaboración/Partnership" },
  { value: "other", label: "Otro" }
];

export default function ContactoPage() {
  const initialData: ContactFormData = {
    name: "",
    email: "",
    company: "",
    message: "",
    project: ""
  };

  const {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    getFieldProps
  } = useFormValidation(initialData, validationRules);

  const {
    status,
    message,
    submitForm,
    isLoading,
    isSuccess,
    isError
  } = useContactForm('global');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isValid = validateAllFields();
    
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }
    
    // Submit form
    const result = await submitForm(formData);
    
    if (result.success) {
      resetForm();
    }
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
                  <FormField
                    label="Nombre"
                    name="name"
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                    error={errors.name}
                    {...getFieldProps('name')}
                  />

                  {/* Email */}
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    autoComplete="email"
                    error={errors.email}
                    {...getFieldProps('email')}
                  />

                  {/* Company */}
                  <FormField
                    label="Empresa/Organización"
                    name="company"
                    type="text"
                    placeholder="Nombre de tu empresa (opcional)"
                    autoComplete="organization"
                    error={errors.company}
                    {...getFieldProps('company')}
                  />

                  {/* Project Type */}
                  <SelectField
                    label="Tipo de Proyecto"
                    name="project"
                    required
                    placeholder="Selecciona un tipo de proyecto"
                    options={projectOptions}
                    error={errors.project}
                    {...getFieldProps('project')}
                  />

                  {/* Message */}
                  <TextAreaField
                    label="Mensaje"
                    name="message"
                    required
                    rows={6}
                    maxLength={1000}
                    placeholder="Cuéntanos sobre tu proyecto, ideas o cómo podemos colaborar..."
                    error={errors.message}
                    {...getFieldProps('message')}
                  />

                  {/* Form Status Messages */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={`p-4 rounded-xl border flex items-center gap-3 ${
                          isSuccess 
                            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                            : isError
                              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                              : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isSuccess && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isError && (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="font-medium">{message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enviando...
                      </div>
                    ) : (
                      "Enviar Mensaje"
                    )}
                  </Button>
                  
                  {/* Form Footer */}
                  <div className="text-center">
                    <p className="text-sm text-text-muted">
                      Al enviar este formulario, aceptas que podamos contactarte sobre tu consulta.
                    </p>
                  </div>
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