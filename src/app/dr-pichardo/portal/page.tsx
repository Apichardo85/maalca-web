"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";

// Mock patient data - In production this would come from authentication
const mockPatientData = {
  id: "PAT-001",
  fullName: "María González Santos",
  email: "maria.gonzalez@email.com",
  phone: "(809) 555-0123",
  dateOfBirth: "1985-03-15",
  bloodType: "O+",
  allergies: ["Penicilina", "Mariscos"],
  emergencyContact: {
    name: "José González",
    phone: "(809) 555-0456",
    relationship: "Esposo"
  }
};

const mockAppointments = [
  {
    id: "APT-001",
    date: "2025-02-20",
    time: "10:00",
    type: "Consulta General",
    status: "confirmed", // confirmed, completed, cancelled
    doctor: "Dr. José Francisco Pichardo Pantaleón",
    modalidad: "presencial",
    notes: "Seguimiento de hipertensión arterial"
  },
  {
    id: "APT-002", 
    date: "2025-01-15",
    time: "14:30",
    type: "Teleconsulta",
    status: "completed",
    doctor: "Dr. José Francisco Pichardo Pantaleón",
    modalidad: "teleconsulta",
    notes: "Revisión de resultados de laboratorio",
    prescription: {
      id: "RX-001",
      medications: [
        "Losartan 50mg - 1 tableta cada 12 horas",
        "Atorvastatina 20mg - 1 tableta en la noche"
      ],
      instructions: "Control de presión arterial diario. Cita de seguimiento en 4 semanas.",
      date: "2025-01-15"
    }
  }
];

const mockPrescriptions = [
  {
    id: "RX-001",
    date: "2025-01-15",
    appointment: "Teleconsulta - Seguimiento",
    medications: [
      "Losartan 50mg - 1 tableta cada 12 horas",
      "Atorvastatina 20mg - 1 tableta en la noche"
    ],
    instructions: "Control de presión arterial diario. Cita de seguimiento en 4 semanas.",
    pdfUrl: "/pdfs/receta-rx-001.pdf"
  },
  {
    id: "RX-002",
    date: "2024-12-10",
    appointment: "Consulta Presencial",
    medications: [
      "Omeprazol 20mg - 1 cápsula en ayunas",
      "Probiótico - 1 cápsula después del almuerzo"
    ],
    instructions: "Tomar con abundante agua. Evitar comidas irritantes.",
    pdfUrl: "/pdfs/receta-rx-002.pdf"
  }
];

const mockLabResults = [
  {
    id: "LAB-001",
    date: "2025-01-10",
    type: "Panel Lipídico Completo",
    status: "normal",
    results: {
      "Colesterol Total": "180 mg/dL",
      "HDL": "45 mg/dL", 
      "LDL": "110 mg/dL",
      "Triglicéridos": "125 mg/dL"
    },
    pdfUrl: "/pdfs/laboratorio-lab-001.pdf"
  },
  {
    id: "LAB-002",
    date: "2024-12-05",
    type: "Hemograma Completo",
    status: "normal",
    results: {
      "Hemoglobina": "13.5 g/dL",
      "Glóbulos Blancos": "7,200/μL",
      "Plaquetas": "280,000/μL"
    },
    pdfUrl: "/pdfs/laboratorio-lab-002.pdf"
  }
];

export default function PatientPortalPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Mock authentication - In production use real auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.email && loginForm.password) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ email: "", password: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadPDF = (url: string, filename: string) => {
    // In production, this would handle secure PDF download
    alert(`Descargando: ${filename}`);
    console.log('Download PDF:', url);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">🩺</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal del Paciente</h1>
            <p className="text-slate-600">Dr. José Francisco Pichardo Pantaleón</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="su@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Demo: use cualquier email y contraseña para acceder
            </p>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg">🩺</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-900">Portal del Paciente</h1>
                <p className="text-sm text-slate-600">Dr. Pichardo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-700">Bienvenido, {mockPatientData.fullName}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-100 rounded-lg p-1">
          {[
            { id: 'dashboard', label: 'Panel Principal', icon: '📊' },
            { id: 'appointments', label: 'Mis Citas', icon: '📅' },
            { id: 'prescriptions', label: 'Recetas', icon: '💊' },
            { id: 'lab-results', label: 'Laboratorios', icon: '🔬' },
            { id: 'profile', label: 'Mi Perfil', icon: '👤' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Próxima Cita</p>
                    <p className="text-lg font-bold text-slate-900">Feb 20</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Recetas Activas</p>
                    <p className="text-lg font-bold text-slate-900">2</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔬</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Últimos Labs</p>
                    <p className="text-lg font-bold text-slate-900">Normal</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Consultas</p>
                    <p className="text-lg font-bold text-slate-900">12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Actividad Reciente</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Teleconsulta completada</p>
                      <p className="text-sm text-slate-600">15 enero, 2025 - Nueva receta disponible</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">🔬</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Resultados de laboratorio</p>
                      <p className="text-sm text-slate-600">10 enero, 2025 - Panel lipídico normal</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">📅</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Cita agendada</p>
                      <p className="text-sm text-slate-600">20 febrero, 2025 - Consulta presencial confirmada</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Mis Citas Médicas</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 text-lg">
                            {appointment.modalidad === 'teleconsulta' ? '💻' : '🏥'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{appointment.type}</h3>
                          <p className="text-sm text-slate-600">{appointment.doctor}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status === 'confirmed' ? 'Confirmada' :
                         appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Fecha</p>
                        <p className="font-medium text-slate-900">
                          {new Date(appointment.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Hora</p>
                        <p className="font-medium text-slate-900">{appointment.time}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Modalidad</p>
                        <p className="font-medium text-slate-900">
                          {appointment.modalidad === 'teleconsulta' ? 'Teleconsulta' : 'Presencial'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Estado</p>
                        <p className="font-medium text-slate-900">
                          {appointment.status === 'confirmed' ? 'Confirmada' :
                           appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </p>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                          <strong>Notas:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <div className="mt-4 flex space-x-2">
                        {appointment.modalidad === 'teleconsulta' && (
                          <Button variant="primary" size="sm" className="bg-green-600 hover:bg-green-700">
                            Unirse a Videollamada
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Reprogramar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Mis Recetas Médicas</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">Receta #{prescription.id}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(prescription.date).toLocaleDateString('es-ES')} - {prescription.appointment}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadPDF(prescription.pdfUrl, `Receta-${prescription.id}.pdf`)}
                      >
                        📄 Descargar PDF
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Medicamentos:</h4>
                        <ul className="space-y-1">
                          {prescription.medications.map((med, index) => (
                            <li key={index} className="text-sm text-slate-700 flex items-center">
                              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                              {med}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-2">Instrucciones:</h4>
                        <p className="text-sm text-slate-600">{prescription.instructions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Lab Results Tab */}
        {activeTab === 'lab-results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Resultados de Laboratorio</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockLabResults.map((result) => (
                  <div key={result.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{result.type}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(result.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                          {result.status === 'normal' ? 'Normal' : result.status}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPDF(result.pdfUrl, `Laboratorio-${result.id}.pdf`)}
                        >
                          📄 Descargar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(result.results).map(([test, value]) => (
                        <div key={test} className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">{test}</p>
                          <p className="font-bold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Mi Perfil Médico</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Información Personal</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Nombre Completo</p>
                      <p className="font-medium text-slate-900">{mockPatientData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{mockPatientData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Teléfono</p>
                      <p className="font-medium text-slate-900">{mockPatientData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Fecha de Nacimiento</p>
                      <p className="font-medium text-slate-900">
                        {new Date(mockPatientData.dateOfBirth).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Tipo de Sangre</p>
                      <p className="font-medium text-slate-900">{mockPatientData.bloodType}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Información Médica</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Alergias Conocidas</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {mockPatientData.allergies.map((allergy) => (
                          <span
                            key={allergy}
                            className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-md"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-500">Contacto de Emergencia</p>
                      <p className="font-medium text-slate-900">
                        {mockPatientData.emergencyContact.name} ({mockPatientData.emergencyContact.relationship})
                      </p>
                      <p className="text-sm text-slate-600">{mockPatientData.emergencyContact.phone}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      Actualizar Información
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}