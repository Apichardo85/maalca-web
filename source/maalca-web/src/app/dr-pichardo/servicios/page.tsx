"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import MedicalConsultationBooking from "@/components/ui/MedicalConsultationBooking";
import { ProjectImage } from "@/components/ui/ProjectImage";

const medicalServices = [
  {
    id: "medicina-interna",
    name: "Medicina Interna",
    category: "Especialidad Principal",
    description: "Diagnóstico y tratamiento integral de enfermedades del adulto con enfoque preventivo y curativo.",
    image: "/images/services/medicina-interna.jpg",
    features: [
      "Evaluación integral del paciente adulto",
      "Diagnóstico diferencial complejo",
      "Manejo de enfermedades crónicas",
      "Prevención primaria y secundaria",
      "Coordinación con especialistas"
    ],
    conditions: [
      "Diabetes Mellitus", "Hipertensión Arterial", "Enfermedades Cardiovasculares",
      "Enfermedades Respiratorias", "Trastornos Endocrinos", "Enfermedades Renales"
    ],
    duration: "45-60 minutos",
    suggestedDonation: "RD$ 800-1,500",
    available: true
  },
  {
    id: "consulta-preventiva",
    name: "Chequeo Médico Preventivo",
    category: "Prevención",
    description: "Evaluación médica completa para detectar factores de riesgo y prevenir enfermedades.",
    image: "/images/services/chequeo-preventivo.jpg",
    features: [
      "Historia clínica detallada",
      "Examen físico completo",
      "Evaluación de factores de riesgo",
      "Recomendaciones personalizadas",
      "Plan de seguimiento"
    ],
    includes: [
      "Medición de signos vitales",
      "Evaluación cardiovascular",
      "Screening de diabetes",
      "Evaluación nutricional",
      "Orientación sobre estilos de vida"
    ],
    duration: "60 minutos",
    suggestedDonation: "RD$ 600-1,200",
    available: true
  },
  {
    id: "control-diabetes",
    name: "Control de Diabetes",
    category: "Especializada",
    description: "Seguimiento especializado para pacientes diabéticos con enfoque integral.",
    image: "/images/services/diabetes-control.jpg",
    features: [
      "Monitoreo de glucemia",
      "Evaluación de HbA1c",
      "Ajuste de medicación",
      "Educación diabetológica",
      "Prevención de complicaciones"
    ],
    includes: [
      "Revisión de automonitoreo",
      "Evaluación de pie diabético",
      "Control oftalmológico",
      "Función renal",
      "Plan nutricional personalizado"
    ],
    duration: "45 minutos",
    suggestedDonation: "RD$ 700-1,300",
    available: true
  },
  {
    id: "control-hipertension",
    name: "Control de Hipertensión",
    category: "Especializada", 
    description: "Manejo integral de la presión arterial con enfoque en prevención cardiovascular.",
    image: "/images/services/hipertension-control.jpg",
    features: [
      "Monitoreo de presión arterial",
      "Evaluación cardiovascular",
      "Ajuste de antihipertensivos",
      "Control de factores de riesgo",
      "Educación en autocuidado"
    ],
    includes: [
      "MAPA (si indicado)",
      "Evaluación de órgano blanco",
      "Control de peso",
      "Recomendaciones dietéticas",
      "Plan de ejercicio personalizado"
    ],
    duration: "45 minutos",
    suggestedDonation: "RD$ 700-1,300",
    available: true
  },
  {
    id: "teleconsulta",
    name: "Teleconsulta Médica",
    category: "Virtual",
    description: "Consulta médica virtual segura para seguimientos y evaluaciones que no requieren examen físico.",
    image: "/images/services/teleconsulta.jpg",
    features: [
      "Videollamada segura y cifrada",
      "Revisión de historia clínica",
      "Evaluación de síntomas",
      "Prescripción digital",
      "Seguimiento virtual"
    ],
    requirements: [
      "Conexión estable a internet",
      "Dispositivo con cámara y micrófono",
      "Ambiente privado y silencioso",
      "Documentos médicos disponibles",
      "Lista de medicamentos actuales"
    ],
    duration: "30-45 minutos",
    suggestedDonation: "RD$ 500-1,000",
    available: true
  },
  {
    id: "segunda-opinion",
    name: "Segunda Opinión Médica",
    category: "Especializada",
    description: "Evaluación independiente de diagnóstico y plan de tratamiento establecido por otro médico.",
    image: "/images/services/segunda-opinion.jpg",
    features: [
      "Revisión de historia clínica completa",
      "Análisis de estudios previos",
      "Evaluación independiente",
      "Recomendaciones adicionales",
      "Informe detallado"
    ],
    requirements: [
      "Informes médicos previos",
      "Resultados de laboratorio",
      "Imágenes diagnósticas",
      "Lista de medicamentos",
      "Historia clínica detallada"
    ],
    duration: "60 minutos",
    suggestedDonation: "RD$ 900-1,600",
    available: true
  },
  {
    id: "atencion-urgente",
    name: "Atención Médica Urgente",
    category: "Urgente",
    description: "Atención médica inmediata para situaciones que requieren evaluación rápida pero no constituyen emergencia.",
    image: "/images/services/atencion-urgente.jpg",
    features: [
      "Disponibilidad extendida",
      "Evaluación rápida",
      "Tratamiento inmediato",
      "Referencia si es necesario",
      "Seguimiento prioritario"
    ],
    conditions: [
      "Síntomas agudos no severos",
      "Reagudización de condiciones crónicas",
      "Efectos adversos de medicamentos",
      "Síntomas preocupantes nuevos",
      "Seguimiento post-hospitalario urgente"
    ],
    duration: "30 minutos",
    suggestedDonation: "RD$ 1,000-2,000",
    available: true,
    urgent: true
  }
];

const serviceCategories = [
  { id: "all", name: "Todos los Servicios", color: "blue" },
  { id: "Especialidad Principal", name: "Medicina Interna", color: "green" },
  { id: "Prevención", name: "Preventiva", color: "purple" },
  { id: "Especializada", name: "Especializada", color: "orange" },
  { id: "Virtual", name: "Teleconsulta", color: "cyan" },
  { id: "Urgente", name: "Urgente", color: "red" }
];

export default function MedicalServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const filteredServices = selectedCategory === "all" 
    ? medicalServices 
    : medicalServices.filter(service => service.category === selectedCategory);

  const handleBookService = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (formData: any) => {
    console.log('Medical service booking:', formData);
    // TODO: Implement actual booking logic
  };

  const getCategoryColor = (category: string) => {
    const cat = serviceCategories.find(c => c.id === category);
    return cat?.color || "blue";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                🩺 Dr. José Francisco Pichardo Pantaleón
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Servicios Médicos
              <span className="block text-blue-600">Especializados</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Atención médica integral con enfoque humanizado. Medicina interna especializada 
              con modelo de donación voluntaria para hacer la salud accesible a todos.
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-600 text-white shadow-lg`
                    : `bg-white text-${category.color}-600 border border-${category.color}-200 hover:bg-${category.color}-50`
                }`}
              >
                {category.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
                  service.urgent ? 'ring-2 ring-red-200' : ''
                }`}
              >
                <div className="relative">
                  <ProjectImage
                    src={service.image}
                    alt={service.name}
                    className="w-full h-48"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getCategoryColor(service.category)}-100 text-${getCategoryColor(service.category)}-800`}>
                      {service.category}
                    </span>
                  </div>
                  {service.urgent && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        🚨 Urgente
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.name}</h3>
                    <p className="text-slate-600 text-lg leading-relaxed">{service.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Duración:</span>
                        <span className="font-medium text-slate-700">{service.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Donación sugerida:</span>
                        <span className="font-medium text-green-600">{service.suggestedDonation}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Disponibilidad:</span>
                        <span className={`font-medium ${service.available ? 'text-green-600' : 'text-red-600'}`}>
                          {service.available ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {service.features && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Incluye:</h4>
                      <ul className="space-y-2">
                        {service.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-slate-600">
                            <span className={`w-1.5 h-1.5 bg-${getCategoryColor(service.category)}-600 rounded-full mr-3`}></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {service.conditions && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Condiciones que tratamos:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.conditions.slice(0, 4).map((condition) => (
                          <span
                            key={condition}
                            className={`px-3 py-1 bg-${getCategoryColor(service.category)}-100 text-${getCategoryColor(service.category)}-800 text-xs font-medium rounded-full`}
                          >
                            {condition}
                          </span>
                        ))}
                        {service.conditions.length > 4 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            +{service.conditions.length - 4} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {service.requirements && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Requisitos:</h4>
                      <ul className="space-y-1">
                        {service.requirements.slice(0, 3).map((req, idx) => (
                          <li key={idx} className="flex items-center text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {service.includes && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Evaluaciones incluidas:</h4>
                      <ul className="space-y-1">
                        {service.includes.slice(0, 3).map((include, idx) => (
                          <li key={idx} className="flex items-center text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                            {include}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className={`flex-1 bg-${getCategoryColor(service.category)}-600 hover:bg-${getCategoryColor(service.category)}-700`}
                      onClick={() => handleBookService(service.id)}
                      disabled={!service.available}
                    >
                      {service.urgent ? '🚨 Agendar Urgente' : '📅 Agendar Consulta'}
                    </Button>
                    <Button
                      variant="outline"
                      className={`border-${getCategoryColor(service.category)}-600 text-${getCategoryColor(service.category)}-600 hover:bg-${getCategoryColor(service.category)}-50`}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Medicina Solidaria y Accesible
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Nuestro modelo de donación voluntaria garantiza que todos reciban la misma calidad de atención médica, 
              independientemente de su capacidad económica. La salud es un derecho, no un privilegio.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-white">
              <div className="text-center">
                <div className="text-4xl mb-2">🏥</div>
                <h3 className="font-bold mb-1">Atención Integral</h3>
                <p className="text-blue-100 text-sm">Cuidado médico completo</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💚</div>
                <h3 className="font-bold mb-1">Donación Voluntaria</h3>
                <p className="text-blue-100 text-sm">Contribuye según tu capacidad</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🤝</div>
                <h3 className="font-bold mb-1">Medicina Humanizada</h3>
                <p className="text-blue-100 text-sm">Trato personal y empático</p>
              </div>
            </div>
          </motion.div>
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