"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import MedicalConsultationBooking from "@/components/ui/MedicalConsultationBooking";
import WhatsAppIntegration from "@/components/ui/WhatsAppIntegration";
import PropertyNewsletterSubscription from "@/components/ui/PropertyNewsletterSubscription";
import { ProjectImage } from "@/components/ui/ProjectImage";

// Mock data for Dr. Pichardo
const doctorInfo = {
  fullName: "Dr. José Francisco Pichardo Pantaleón",
  specialty: "Medicina Interna",
  title: "Médico Internista · Medicina Solidaria",
  license: "Exequátur #12345-MD",
  image: "/images/doctor/dr-pichardo-portrait.jpg",
  bio: `Médico internista comprometido con la atención médica humanizada y accesible. 
        Con más de 15 años de experiencia, el Dr. Pichardo ha dedicado su carrera a 
        brindar atención de calidad independientemente de la capacidad económica del paciente.`,
  philosophy: "La salud es un derecho, no un privilegio",
  contact: {
    phone: "+1 (809) 555-0123",
    email: "consultas@drpichardo.com",
    whatsapp: "+18095550123",
    address: "Av. Sarasota #45, Bella Vista, Santo Domingo"
  }
};

const services = [
  {
    id: "consulta-presencial",
    name: "Consulta Presencial",
    description: "Evaluación médica completa en consultorio con examen físico detallado",
    duration: "45-60 minutos",
    suggestedDonation: "RD$ 800-1,500",
    features: ["Examen físico completo", "Revisión de historial", "Diagnóstico", "Plan de tratamiento"]
  },
  {
    id: "teleconsulta",
    name: "Teleconsulta",
    description: "Consulta médica virtual para seguimientos y evaluaciones iniciales",
    duration: "30-45 minutos", 
    suggestedDonation: "RD$ 500-1,000",
    features: ["Videollamada segura", "Revisión de síntomas", "Receta digital", "Seguimiento virtual"]
  },
  {
    id: "consulta-urgente",
    name: "Consulta de Urgencia",
    description: "Atención inmediata para casos que requieren evaluación rápida",
    duration: "30 minutos",
    suggestedDonation: "RD$ 1,000-2,000",
    features: ["Disponibilidad 24/7", "Respuesta rápida", "Evaluación inmediata", "Derivación si necesario"]
  }
];

const operatives = [
  {
    id: "community-health-nov",
    title: "Jornada de Salud Comunitaria - Los Alcarrizos",
    date: "2025-02-15",
    location: "Centro Comunitario Los Alcarrizos",
    description: "Operativo médico gratuito con consultas generales, chequeos de presión y diabetes",
    image: "/images/operatives/los-alcarrizos.jpg",
    services: ["Consultas generales", "Control de presión arterial", "Glicemia", "Medicamentos básicos"],
    spots: 150,
    registered: 87
  },
  {
    id: "diabetes-screening-dec",
    title: "Screening de Diabetes - Villa Mella",
    date: "2025-03-10",
    location: "Club de Diabéticos Villa Mella",
    description: "Jornada especializada en prevención y control de diabetes mellitus",
    image: "/images/operatives/villa-mella.jpg",
    services: ["Pruebas de glucosa", "HbA1c rápida", "Educación nutricional", "Medicación gratuita"],
    spots: 100,
    registered: 45
  }
];

const testimonials = [
  {
    name: "María González",
    condition: "Diabetes Tipo 2",
    text: "El Dr. Pichardo me ha ayudado tremendamente con mi diabetes. Su enfoque humano y la opción de donar según mis posibilidades ha sido fundamental.",
    rating: 5
  },
  {
    name: "Roberto Martínez", 
    condition: "Hipertensión",
    text: "Excelente atención médica. El doctor se toma el tiempo necesario para explicar todo claramente. Recomiendo sus servicios completamente.",
    rating: 5
  },
  {
    name: "Ana Rodríguez",
    condition: "Chequeo General",
    text: "La teleconsulta fue muy conveniente. El Dr. Pichardo es muy profesional y accesible. El sistema de donaciones es muy justo.",
    rating: 5
  }
];

export default function DrPichardoPage() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

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
                  🩺 Medicina Solidaria · MaalCa Ecosystem
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                <span className="block text-2xl md:text-3xl font-normal text-slate-600 mb-2">
                  {doctorInfo.specialty}
                </span>
                Dr. José Francisco 
                <span className="block text-blue-600">Pichardo Pantaleón</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-4 leading-relaxed">
                {doctorInfo.philosophy}
              </p>
              
              <p className="text-lg text-slate-700 mb-8 leading-relaxed">
                {doctorInfo.bio}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleBookConsultation()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📅 Agendar Consulta
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Ver Servicios
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Disponible para consultas
                </div>
                <div>📍 {doctorInfo.contact.address}</div>
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
                  <p className="text-blue-600 font-medium">{doctorInfo.title}</p>
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
                  defaultMessage="Hola Dr. Pichardo, me gustaría agendar una consulta médica."
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
              Servicios Médicos
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Atención médica profesional con modelo de donación voluntaria. 
              Todos reciben la misma calidad de atención, independientemente de su contribución.
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
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Duración:</span>
                    <span className="font-medium text-slate-700">{service.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Donación sugerida:</span>
                    <span className="font-medium text-green-600">{service.suggestedDonation}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-slate-900 mb-2">Incluye:</h4>
                  <ul className="space-y-1">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="primary"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleBookConsultation(service.id)}
                >
                  Agendar {service.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Operatives Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Operativos Médicos Comunitarios
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Llevamos atención médica gratuita a comunidades que más la necesitan. 
              Únete a nuestros operativos solidarios.
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
                  alt={operative.title}
                  className="w-full h-48"
                />
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      📅 {new Date(operative.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{operative.title}</h3>
                  <p className="text-slate-600 mb-4">{operative.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>📍</span>
                      <span>{operative.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>👥</span>
                      <span>{operative.registered}/{operative.spots} personas registradas</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">Servicios disponibles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {operative.services.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Pre-registrarme
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Lo que dicen nuestros pacientes
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Testimonios reales de personas que han experimentado nuestra medicina solidaria.
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
                
                <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
                
                <div className="border-t border-blue-100 pt-4">
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-600">{testimonial.condition}</p>
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
            title="Mantente informado sobre salud"
            description="Recibe consejos de salud, información sobre operativos médicos y actualizaciones del Dr. Pichardo."
            buttonText="Suscribirme"
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