"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";

interface OperativeEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  description: string;
  image: string;
  services: string[];
  spots: number;
  registered: number;
  status: 'upcoming' | 'registration-open' | 'full' | 'completed';
  category: string;
  targetAudience: string;
  requirements?: string[];
  organizers: string[];
  sponsors?: string[];
  cost: 'free' | 'donation-based';
  medicalTeam: {
    doctors: number;
    nurses: number;
    volunteers: number;
  };
  expectedConditions: string[];
  materials: string[];
}

const operativeEvents: OperativeEvent[] = [
  {
    id: "op-001",
    title: "Jornada de Salud Comunitaria - Los Alcarrizos",
    date: "2025-02-15",
    time: "08:00-16:00",
    location: {
      name: "Centro Comunitario Los Alcarrizos",
      address: "Calle Principal #45, Los Alcarrizos, Santo Domingo Oeste",
      coordinates: { lat: 18.5134, lng: -70.0086 }
    },
    description: "Operativo médico gratuito enfocado en medicina preventiva y atención primaria para la comunidad de Los Alcarrizos. Incluye consultas generales, control de enfermedades crónicas y educación en salud.",
    image: "/images/operatives/los-alcarrizos-2025.jpg",
    services: [
      "Consultas de medicina general",
      "Control de presión arterial",
      "Medición de glucosa",
      "Evaluación nutricional",
      "Vacunación básica",
      "Medicamentos básicos gratuitos",
      "Charlas educativas",
      "Orientación sobre estilos de vida"
    ],
    spots: 150,
    registered: 87,
    status: 'registration-open',
    category: "Salud Comunitaria",
    targetAudience: "Población general, especial atención a adultos mayores",
    requirements: [
      "Llevar cédula de identidad",
      "Lista de medicamentos actuales",
      "Ayuno de 8 horas para glucometría",
      "Cartón de vacunas (si aplica)"
    ],
    organizers: ["Dr. José Francisco Pichardo Pantaleón", "Fundación MaalCa"],
    sponsors: ["Farmacia Popular", "Laboratorio Vida", "Alcaldía Santo Domingo Oeste"],
    cost: 'free',
    medicalTeam: {
      doctors: 3,
      nurses: 6,
      volunteers: 12
    },
    expectedConditions: [
      "Hipertensión arterial",
      "Diabetes mellitus",
      "Sobrepeso y obesidad",
      "Infecciones respiratorias",
      "Problemas dermatológicos menores"
    ],
    materials: [
      "Tensiómetros digitales",
      "Glucómetros",
      "Medicamentos básicos",
      "Material educativo",
      "Vacunas de rutina"
    ]
  },
  {
    id: "op-002",
    title: "Screening de Diabetes - Villa Mella",
    date: "2025-03-10",
    time: "07:00-15:00",
    location: {
      name: "Club de Diabéticos Villa Mella",
      address: "Av. Charles de Gaulle #123, Villa Mella, Santo Domingo Norte",
      coordinates: { lat: 18.5392, lng: -69.8739 }
    },
    description: "Operativo especializado en prevención, detección y control de diabetes mellitus. Dirigido especialmente a población de riesgo y pacientes diabéticos conocidos de la zona norte.",
    image: "/images/operatives/villa-mella-diabetes.jpg",
    services: [
      "Pruebas de glucosa en ayunas",
      "HbA1c rápida",
      "Consulta endocrinológica",
      "Evaluación de pie diabético",
      "Control oftalmológico básico",
      "Educación nutricional especializada",
      "Medicamentos hipoglucemiantes",
      "Programa de seguimiento"
    ],
    spots: 100,
    registered: 45,
    status: 'registration-open',
    category: "Diabetes y Endocrinología",
    targetAudience: "Personas con diabetes, prediabetes o factores de riesgo",
    requirements: [
      "Ayuno de 12 horas obligatorio",
      "Llevar récords de glucosa recientes",
      "Lista de medicamentos para diabetes",
      "Cédula de identidad",
      "Acompañante recomendado"
    ],
    organizers: ["Dr. José Francisco Pichardo Pantaleón", "Asociación de Diabéticos RD"],
    sponsors: ["Laboratorio Roche", "Farmacia Carol", "SENASA"],
    cost: 'free',
    medicalTeam: {
      doctors: 2,
      nurses: 4,
      volunteers: 8
    },
    expectedConditions: [
      "Diabetes tipo 2",
      "Prediabetes",
      "Complicaciones diabéticas",
      "Síndrome metabólico",
      "Neuropatía diabética"
    ],
    materials: [
      "Equipos de HbA1c instantánea",
      "Glucómetros profesionales",
      "Tiras reactivas",
      "Monofilamentos para neuropatía",
      "Oftalmoscopio"
    ]
  },
  {
    id: "op-003",
    title: "Jornada Cardiovascular - Santiago",
    date: "2025-04-05",
    time: "08:00-17:00",
    location: {
      name: "Centro de Convenciones Santiago",
      address: "Av. 27 de Febrero, Santiago de los Caballeros",
      coordinates: { lat: 19.4517, lng: -70.6970 }
    },
    description: "Operativo especializado en salud cardiovascular con énfasis en prevención de infartos y accidentes cerebrovasculares. Incluye electrocardiogramas y consultas cardiológicas.",
    image: "/images/operatives/santiago-cardiovascular.jpg",
    services: [
      "Electrocardiogramas",
      "Consulta cardiológica",
      "Control de presión arterial",
      "Perfil lipídico completo",
      "Evaluación de riesgo cardiovascular",
      "Educación en primeros auxilios",
      "Medicamentos cardiovasculares",
      "Plan de ejercicios personalizado"
    ],
    spots: 200,
    registered: 23,
    status: 'registration-open',
    category: "Cardiología",
    targetAudience: "Adultos mayores de 40 años con factores de riesgo cardiovascular",
    requirements: [
      "Ayuno de 12 horas para perfil lipídico",
      "Electrocardiogramas previos (si los tiene)",
      "Lista completa de medicamentos",
      "Historia familiar cardiovascular",
      "Cédula de identidad"
    ],
    organizers: ["Dr. José Francisco Pichardo Pantaleón", "Sociedad Dominicana de Cardiología"],
    sponsors: ["Laboratorio Labcorp", "Farmacia Azul", "Hospital Regional Santiago"],
    cost: 'donation-based',
    medicalTeam: {
      doctors: 4,
      nurses: 8,
      volunteers: 15
    },
    expectedConditions: [
      "Hipertensión arterial",
      "Arritmias cardíacas",
      "Dislipidemia",
      "Angina de pecho",
      "Post-infarto"
    ],
    materials: [
      "Electrocardiógrafos portátiles",
      "Equipo de laboratorio móvil",
      "Desfibrilador automático",
      "Medicamentos de emergencia",
      "Material educativo especializado"
    ]
  },
  {
    id: "op-004",
    title: "Operativo Rural - Constanza",
    date: "2025-05-18",
    time: "09:00-16:00",
    location: {
      name: "Centro de Salud Rural Constanza",
      address: "Carretera Central, Constanza, La Vega",
      coordinates: { lat: 18.9091, lng: -70.7462 }
    },
    description: "Jornada médica especial para poblaciones rurales de difícil acceso. Medicina general, pediatría básica y atención materno-infantil.",
    image: "/images/operatives/constanza-rural.jpg",
    services: [
      "Consultas de medicina general",
      "Atención pediátrica básica",
      "Control prenatal",
      "Vacunación infantil",
      "Desparasitación",
      "Consulta odontológica básica",
      "Medicamentos esenciales",
      "Programa de nutrición infantil"
    ],
    spots: 120,
    registered: 12,
    status: 'registration-open',
    category: "Medicina Rural",
    targetAudience: "Población rural, especial atención a embarazadas y niños",
    requirements: [
      "Cédula o acta de nacimiento",
      "Cartón de vacunas para niños",
      "Carnet prenatal (embarazadas)",
      "Lista de medicamentos actuales"
    ],
    organizers: ["Dr. José Francisco Pichardo Pantaleón", "Ministerio de Salud Pública"],
    sponsors: ["UNICEF", "Fundación Corazones", "Alcaldía Constanza"],
    cost: 'free',
    medicalTeam: {
      doctors: 3,
      nurses: 5,
      volunteers: 10
    },
    expectedConditions: [
      "Enfermedades parasitarias",
      "Desnutrición infantil",
      "Infecciones respiratorias",
      "Problemas obstétricos",
      "Enfermedades de la piel"
    ],
    materials: [
      "Medicamentos pediátricos",
      "Vacunas de rutina",
      "Suplementos nutricionales",
      "Equipo obstétrico básico",
      "Antiparasitarios"
    ]
  }
];

const categories = [
  { id: "all", name: "Todos los Operativos", icon: "🏥" },
  { id: "Salud Comunitaria", name: "Salud Comunitaria", icon: "👥" },
  { id: "Diabetes y Endocrinología", name: "Diabetes", icon: "🩺" },
  { id: "Cardiología", name: "Cardiovascular", icon: "❤️" },
  { id: "Medicina Rural", name: "Rural", icon: "🌾" }
];

export default function OperativeEventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<OperativeEvent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    conditions: "",
    accompanist: false
  });

  const filteredEvents = selectedCategory === "all" 
    ? operativeEvents 
    : operativeEvents.filter(event => event.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration-open': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration-open': return 'Inscripciones Abiertas';
      case 'upcoming': return 'Próximamente';
      case 'full': return 'Cupos Agotados';
      case 'completed': return 'Completado';
      default: return 'Estado Desconocido';
    }
  };

  const handleShowDetails = (event: OperativeEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleRegister = (event: OperativeEvent) => {
    setSelectedEvent(event);
    setShowRegistration(true);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration submitted:', { event: selectedEvent?.id, data: registrationData });
    alert(`¡Registro exitoso! Se ha enviado confirmación a ${registrationData.email}`);
    setShowRegistration(false);
    setRegistrationData({
      fullName: "",
      phone: "",
      email: "",
      idNumber: "",
      conditions: "",
      accompanist: false
    });
  };

  const getAvailableSpots = (event: OperativeEvent) => {
    return event.spots - event.registered;
  };

  const getRegistrationPercentage = (event: OperativeEvent) => {
    return Math.round((event.registered / event.spots) * 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                🏥 Medicina Solidaria Comunitaria
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Operativos Médicos
              <span className="block text-green-600">Comunitarios</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Llevamos atención médica gratuita y de calidad a las comunidades que más lo necesitan. 
              Únete a nuestros operativos solidarios y forma parte del cambio hacia una salud más accesible.
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <ProjectImage
                    src={event.image}
                    alt={event.title}
                    className="w-full h-56"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 text-gray-800">
                      {event.category}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/90 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-600">Cupos disponibles</p>
                      <p className="font-bold text-green-600">{getAvailableSpots(event)}/{event.spots}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{event.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-slate-600">
                      <span className="mr-2">📅</span>
                      <span>{new Date(event.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <span className="mr-2">🕐</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-slate-600 col-span-2">
                      <span className="mr-2">📍</span>
                      <span className="line-clamp-1">{event.location.name}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Inscripciones</span>
                      <span>{getRegistrationPercentage(event)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getRegistrationPercentage(event)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-slate-900 mb-2">Servicios principales:</h4>
                    <div className="flex flex-wrap gap-1">
                      {event.services.slice(0, 3).map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-md"
                        >
                          {service}
                        </span>
                      ))}
                      {event.services.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                          +{event.services.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowDetails(event)}
                      className="flex-1"
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRegister(event)}
                      disabled={event.status === 'full' || event.status === 'completed'}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {event.status === 'full' ? 'Cupos Agotados' : 
                       event.status === 'completed' ? 'Completado' : 'Inscribirme'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      {showDetails && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">{selectedEvent.title}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <ProjectImage
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-64 rounded-xl mb-6"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">📍 Ubicación</h3>
                      <p className="text-slate-600">{selectedEvent.location.name}</p>
                      <p className="text-sm text-slate-500">{selectedEvent.location.address}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">👥 Equipo Médico</h3>
                      <div className="flex gap-4 text-sm">
                        <span>👨‍⚕️ {selectedEvent.medicalTeam.doctors} Médicos</span>
                        <span>👩‍⚕️ {selectedEvent.medicalTeam.nurses} Enfermeras</span>
                        <span>🤝 {selectedEvent.medicalTeam.volunteers} Voluntarios</span>
                      </div>
                    </div>

                    {selectedEvent.sponsors && (
                      <div>
                        <h3 className="font-bold text-slate-900 mb-2">🤝 Patrocinadores</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.sponsors.map((sponsor) => (
                            <span
                              key={sponsor}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {sponsor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-slate-900 mb-3">🩺 Servicios Completos</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedEvent.services.map((service) => (
                          <div key={service} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedEvent.requirements && (
                      <div>
                        <h3 className="font-bold text-slate-900 mb-3">📋 Requisitos</h3>
                        <ul className="space-y-2">
                          {selectedEvent.requirements.map((req) => (
                            <li key={req} className="flex items-start text-sm">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-slate-900 mb-3">🔬 Condiciones que Atendemos</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.expectedConditions.map((condition) => (
                          <span
                            key={condition}
                            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-bold text-slate-900 mb-3">📊 Información del Evento</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Fecha</p>
                          <p className="font-medium">{new Date(selectedEvent.date).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Horario</p>
                          <p className="font-medium">{selectedEvent.time}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Cupos totales</p>
                          <p className="font-medium">{selectedEvent.spots}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Disponibles</p>
                          <p className="font-medium text-green-600">{getAvailableSpots(selectedEvent)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowDetails(false);
                    handleRegister(selectedEvent);
                  }}
                  disabled={selectedEvent.status === 'full' || selectedEvent.status === 'completed'}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Inscribirme al Operativo
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistration && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Inscripción al Operativo</h2>
                  <p className="text-slate-600">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={() => setShowRegistration(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationData.fullName}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Juan Pérez García"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cédula/ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={registrationData.idNumber}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, idNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="001-1234567-8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={registrationData.phone}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(809) 555-1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="juan@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Condiciones Médicas o Medicamentos Actuales
                  </label>
                  <textarea
                    value={registrationData.conditions}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, conditions: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Indique condiciones médicas relevantes, medicamentos que toma, alergias, etc."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="accompanist"
                    checked={registrationData.accompanist}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, accompanist: e.target.checked }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded"
                  />
                  <label htmlFor="accompanist" className="text-sm text-slate-700">
                    Asistiré con acompañante
                  </label>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-2">📋 Información Importante</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Llegue 30 minutos antes del horario indicado</li>
                    <li>• Traiga cédula de identidad y documentos médicos</li>
                    <li>• El servicio es completamente gratuito</li>
                    <li>• Recibirá confirmación por SMS/WhatsApp</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRegistration(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Confirmar Inscripción
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}