"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import MedicalConsultationBooking from "@/components/ui/MedicalConsultationBooking";
import WhatsAppIntegration from "@/components/ui/WhatsAppIntegration";
import PropertyNewsletterSubscription from "@/components/ui/PropertyNewsletterSubscription";
import { ProjectImage } from "@/components/ui/ProjectImage";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
import SimpleLanguageToggle from "@/components/ui/SimpleLanguageToggle";

// Mock data for Dr. Pichardo
const doctorInfo = {
  fullName: "Dr. José Francisco Pichardo Pantaleón",
  specialty: { es: "Medicina Interna", en: "Internal Medicine" },
  title: { es: "Médico Internista · Medicina Solidaria", en: "Internal Medicine Physician · Solidarity Medicine" },
  license: "Exequátur #12345-MD",
  image: "/images/doctor/dr-pichardo-portrait.jpg",
  bio: {
    es: `Médico internista comprometido con la atención médica humanizada y accesible.
        Con más de 15 años de experiencia, el Dr. Pichardo ha dedicado su carrera a
        brindar atención de calidad independientemente de la capacidad económica del paciente.`,
    en: `Internal medicine physician committed to humanized and accessible medical care.
        With over 15 years of experience, Dr. Pichardo has dedicated his career to
        providing quality care regardless of the patient's economic capacity.`
  },
  philosophy: { es: "La salud es un derecho, no un privilegio", en: "Health is a right, not a privilege" },
  contact: {
    phone: "+1 (809) 555-0123",
    email: "consultas@drpichardo.com",
    whatsapp: "+18095550123",
    address: { es: "Av. Sarasota #45, Bella Vista, Santo Domingo", en: "Av. Sarasota #45, Bella Vista, Santo Domingo" }
  }
};

const services = [
  {
    id: "consulta-presencial",
    name: { es: "Consulta Presencial", en: "In-Person Consultation" },
    description: {
      es: "Evaluación médica completa en consultorio con examen físico detallado",
      en: "Complete medical evaluation at the office with detailed physical examination"
    },
    duration: { es: "45-60 minutos", en: "45-60 minutes" },
    suggestedDonation: "RD$ 800-1,500",
    features: [
      { es: "Examen físico completo", en: "Complete physical examination" },
      { es: "Revisión de historial", en: "Medical history review" },
      { es: "Diagnóstico", en: "Diagnosis" },
      { es: "Plan de tratamiento", en: "Treatment plan" }
    ]
  },
  {
    id: "teleconsulta",
    name: { es: "Teleconsulta", en: "Telemedicine" },
    description: {
      es: "Consulta médica virtual para seguimientos y evaluaciones iniciales",
      en: "Virtual medical consultation for follow-ups and initial evaluations"
    },
    duration: { es: "30-45 minutos", en: "30-45 minutes" },
    suggestedDonation: "RD$ 500-1,000",
    features: [
      { es: "Videollamada segura", en: "Secure video call" },
      { es: "Revisión de síntomas", en: "Symptom review" },
      { es: "Receta digital", en: "Digital prescription" },
      { es: "Seguimiento virtual", en: "Virtual follow-up" }
    ]
  },
  {
    id: "consulta-urgente",
    name: { es: "Consulta de Urgencia", en: "Urgent Consultation" },
    description: {
      es: "Atención inmediata para casos que requieren evaluación rápida",
      en: "Immediate care for cases requiring rapid evaluation"
    },
    duration: { es: "30 minutos", en: "30 minutes" },
    suggestedDonation: "RD$ 1,000-2,000",
    features: [
      { es: "Disponibilidad 24/7", en: "24/7 availability" },
      { es: "Respuesta rápida", en: "Quick response" },
      { es: "Evaluación inmediata", en: "Immediate evaluation" },
      { es: "Derivación si necesario", en: "Referral if necessary" }
    ]
  }
];

const operatives = [
  {
    id: "community-health-nov",
    title: {
      es: "Jornada de Salud Comunitaria - Los Alcarrizos",
      en: "Community Health Day - Los Alcarrizos"
    },
    date: "2025-02-15",
    location: {
      es: "Centro Comunitario Los Alcarrizos",
      en: "Los Alcarrizos Community Center"
    },
    description: {
      es: "Operativo médico gratuito con consultas generales, chequeos de presión y diabetes",
      en: "Free medical outreach with general consultations, blood pressure and diabetes screenings"
    },
    image: "/images/operatives/los-alcarrizos.jpg",
    services: [
      { es: "Consultas generales", en: "General consultations" },
      { es: "Control de presión arterial", en: "Blood pressure monitoring" },
      { es: "Glicemia", en: "Blood glucose testing" },
      { es: "Medicamentos básicos", en: "Basic medications" }
    ],
    spots: 150,
    registered: 87
  },
  {
    id: "diabetes-screening-dec",
    title: {
      es: "Screening de Diabetes - Villa Mella",
      en: "Diabetes Screening - Villa Mella"
    },
    date: "2025-03-10",
    location: {
      es: "Club de Diabéticos Villa Mella",
      en: "Villa Mella Diabetes Club"
    },
    description: {
      es: "Jornada especializada en prevención y control de diabetes mellitus",
      en: "Specialized day for diabetes mellitus prevention and control"
    },
    image: "/images/operatives/villa-mella.jpg",
    services: [
      { es: "Pruebas de glucosa", en: "Glucose testing" },
      { es: "HbA1c rápida", en: "Quick HbA1c" },
      { es: "Educación nutricional", en: "Nutritional education" },
      { es: "Medicación gratuita", en: "Free medication" }
    ],
    spots: 100,
    registered: 45
  }
];

const testimonials = [
  {
    name: "María González",
    condition: { es: "Diabetes Tipo 2", en: "Type 2 Diabetes" },
    text: {
      es: "El Dr. Pichardo me ha ayudado tremendamente con mi diabetes. Su enfoque humano y la opción de donar según mis posibilidades ha sido fundamental.",
      en: "Dr. Pichardo has helped me tremendously with my diabetes. His human approach and the option to donate according to my means has been fundamental."
    },
    rating: 5
  },
  {
    name: "Roberto Martínez",
    condition: { es: "Hipertensión", en: "Hypertension" },
    text: {
      es: "Excelente atención médica. El doctor se toma el tiempo necesario para explicar todo claramente. Recomiendo sus servicios completamente.",
      en: "Excellent medical care. The doctor takes the necessary time to explain everything clearly. I completely recommend his services."
    },
    rating: 5
  },
  {
    name: "Ana Rodríguez",
    condition: { es: "Chequeo General", en: "General Checkup" },
    text: {
      es: "La teleconsulta fue muy conveniente. El Dr. Pichardo es muy profesional y accesible. El sistema de donaciones es muy justo.",
      en: "The telemedicine consultation was very convenient. Dr. Pichardo is very professional and accessible. The donation system is very fair."
    },
    rating: 5
  }
];

export default function DrPichardoPage() {
  const { language } = useSimpleLanguage();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const getText = (es: string, en: string) => language === 'es' ? es : en;

  const handleBookConsultation = (serviceId?: string) => {
    if (serviceId) setSelectedService(serviceId);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (formData: any) => {
    // Integrate with booking system
    console.log('Booking submitted:', formData);
    // TODO: Implement actual booking logic
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🩺</span>
              <span className="font-bold text-slate-900">Dr. Pichardo</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#servicios" className="text-slate-700 hover:text-blue-600 transition-colors">
                {getText('Servicios', 'Services')}
              </a>
              <a href="#operativos" className="text-slate-700 hover:text-blue-600 transition-colors">
                {getText('Operativos', 'Medical Drives')}
              </a>
              <a href="#testimonios" className="text-slate-700 hover:text-blue-600 transition-colors">
                {getText('Testimonios', 'Testimonials')}
              </a>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBookConsultation()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                📅 {getText('Agendar', 'Book Now')}
              </Button>
              <SimpleLanguageToggle variant="light" />
            </div>

            {/* Mobile menu button - could be expanded later */}
            <div className="md:hidden">
              <SimpleLanguageToggle variant="light" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  🩺 {getText('Medicina Solidaria', 'Solidarity Medicine')} · MaalCa Ecosystem
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                <span className="block text-2xl md:text-3xl font-normal text-slate-600 mb-2">
                  {getText(doctorInfo.specialty.es, doctorInfo.specialty.en)}
                </span>
                Dr. José Francisco
                <span className="block text-blue-600">Pichardo Pantaleón</span>
              </h1>

              <p className="text-xl text-slate-600 mb-4 leading-relaxed">
                {getText(doctorInfo.philosophy.es, doctorInfo.philosophy.en)}
              </p>

              <p className="text-lg text-slate-700 mb-8 leading-relaxed">
                {getText(doctorInfo.bio.es, doctorInfo.bio.en)}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleBookConsultation()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📅 {getText('Agendar Consulta', 'Book Consultation')}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {getText('Ver Servicios', 'View Services')}
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {getText('Disponible para consultas', 'Available for consultations')}
                </div>
                <div>📍 {getText(doctorInfo.contact.address.es, doctorInfo.contact.address.en)}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
                <div className="text-center mb-6">
                  <ProjectImage
                    src={doctorInfo.image}
                    alt={`Foto del ${doctorInfo.fullName}`}
                    className="w-32 h-32 mx-auto rounded-full mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-900">{doctorInfo.fullName}</h3>
                  <p className="text-blue-600 font-medium">{getText(doctorInfo.title.es, doctorInfo.title.en)}</p>
                  <p className="text-sm text-slate-500">{doctorInfo.license}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="text-blue-600">📞</span>
                    <span>{doctorInfo.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <span className="text-blue-600">📧</span>
                    <span>{doctorInfo.contact.email}</span>
                  </div>
                </div>

                <WhatsAppIntegration
                  phoneNumber={doctorInfo.contact.whatsapp}
                  defaultMessage={getText(
                    'Hola Dr. Pichardo, me gustaría agendar una consulta médica.',
                    'Hello Dr. Pichardo, I would like to schedule a medical consultation.'
                  )}
                  businessName={doctorInfo.fullName}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {getText('Servicios Médicos', 'Medical Services')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {getText(
                'Atención médica profesional con modelo de donación voluntaria. Todos reciben la misma calidad de atención, independientemente de su contribución.',
                'Professional medical care with voluntary donation model. Everyone receives the same quality of care, regardless of their contribution.'
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-white">
                      {service.id === 'consulta-presencial' ? '🏥' : 
                       service.id === 'teleconsulta' ? '💻' : '🚨'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {getText(service.name.es, service.name.en)}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {getText(service.description.es, service.description.en)}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{getText('Duración:', 'Duration:')}</span>
                    <span className="font-medium text-slate-700">
                      {getText(service.duration.es, service.duration.en)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{getText('Donación sugerida:', 'Suggested donation:')}</span>
                    <span className="font-medium text-green-600">{service.suggestedDonation}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-slate-900 mb-2">{getText('Incluye:', 'Includes:')}</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                        {getText(feature.es, feature.en)}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleBookConsultation(service.id)}
                >
                  {getText('Agendar', 'Book')} {getText(service.name.es, service.name.en)}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Operatives Section */}
      <section id="operativos" className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {getText('Operativos Médicos Comunitarios', 'Community Medical Outreach')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {getText(
                'Llevamos atención médica gratuita a comunidades que más la necesitan. Únete a nuestros operativos solidarios.',
                'We bring free medical care to communities that need it most. Join our solidarity outreach programs.'
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {operatives.map((operative, index) => (
              <motion.div
                key={operative.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ProjectImage
                  src={operative.image}
                  alt={getText(operative.title.es, operative.title.en)}
                  className="w-full h-48"
                />

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      📅 {new Date(operative.date).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {getText(operative.title.es, operative.title.en)}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {getText(operative.description.es, operative.description.en)}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>📍</span>
                      <span>{getText(operative.location.es, operative.location.en)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>👥</span>
                      <span>
                        {operative.registered}/{operative.spots} {getText('personas registradas', 'registered people')}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">
                      {getText('Servicios disponibles:', 'Available services:')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {operative.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {getText(service.es, service.en)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    {getText('Pre-registrarme', 'Pre-register')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {getText('Lo que dicen nuestros pacientes', 'What our patients say')}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {getText(
                'Testimonios reales de personas que han experimentado nuestra medicina solidaria.',
                'Real testimonials from people who have experienced our solidarity medicine.'
              )}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                
                <p className="text-slate-700 mb-4 italic">
                  "{getText(testimonial.text.es, testimonial.text.en)}"
                </p>

                <div className="border-t border-blue-100 pt-4">
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-600">
                    {getText(testimonial.condition.es, testimonial.condition.en)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PropertyNewsletterSubscription
            title={getText('Mantente informado sobre salud', 'Stay informed about health')}
            description={getText(
              'Recibe consejos de salud, información sobre operativos médicos y actualizaciones del Dr. Pichardo.',
              'Receive health tips, information about medical outreach programs, and updates from Dr. Pichardo.'
            )}
            buttonText={getText('Suscribirme', 'Subscribe')}
            className="bg-white/95 backdrop-blur-sm"
          />
        </div>
      </section>

      {/* Medical Consultation Booking Modal */}
      <MedicalConsultationBooking
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedService={selectedService}
        onSubmit={handleBookingSubmit}
      />
    </main>
  );
}