"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './buttons';

interface MedicalConsultationBookingProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: string;
  onSubmit?: (formData: MedicalConsultationFormData) => Promise<void>;
}

interface MedicalConsultationFormData {
  // Patient Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  idNumber: string;
  
  // Medical Information
  consultationType: string;
  preferredDate: string;
  preferredTime: string;
  symptoms: string;
  currentMedications: string;
  allergies: string;
  previousConditions: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Consultation Preferences
  modalidad: string; // presencial | teleconsulta
  donationAmount: string;
  
  // Legal Consents
  medicalConsent: boolean;
  dataConsent: boolean;
  teleconsultConsent: boolean;
}

const consultationTypes = [
  { value: 'consulta-general', label: 'Consulta General' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'segunda-opinion', label: 'Segunda Opinión' },
  { value: 'urgente', label: 'Consulta Urgente' },
  { value: 'preventiva', label: 'Chequeo Preventivo' }
];

const timeSlots = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' }
];

const donationOptions = [
  { value: '0', label: 'Sin donación (gratuito)' },
  { value: '300', label: 'RD$ 300 - Contribución básica' },
  { value: '500', label: 'RD$ 500 - Contribución estándar' },
  { value: '800', label: 'RD$ 800 - Contribución solidaria' },
  { value: '1000', label: 'RD$ 1,000 - Contribución de apoyo' },
  { value: 'custom', label: 'Otra cantidad' }
];

export default function MedicalConsultationBooking({ 
  isOpen, 
  onClose, 
  selectedService = '',
  onSubmit 
}: MedicalConsultationBookingProps) {
  const [formData, setFormData] = useState<MedicalConsultationFormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    idNumber: '',
    consultationType: selectedService || '',
    preferredDate: '',
    preferredTime: '',
    symptoms: '',
    currentMedications: '',
    allergies: '',
    previousConditions: '',
    emergencyContact: '',
    emergencyPhone: '',
    modalidad: 'presencial',
    donationAmount: '0',
    medicalConsent: false,
    dataConsent: false,
    teleconsultConsent: false
  });

  const [errors, setErrors] = useState<Partial<MedicalConsultationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (field: keyof MedicalConsultationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<MedicalConsultationFormData> = {};

    switch (step) {
      case 1: // Personal Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Nombre completo es requerido';
        if (!formData.email.trim()) newErrors.email = 'Email es requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Email inválido';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Fecha de nacimiento es requerida';
        if (!formData.idNumber.trim()) newErrors.idNumber = 'Cédula/ID es requerida';
        if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Contacto de emergencia es requerido';
        if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Teléfono de emergencia es requerido';
        break;

      case 2: // Medical Information
        if (!formData.consultationType) newErrors.consultationType = 'Tipo de consulta es requerido';
        if (!formData.preferredDate) newErrors.preferredDate = 'Fecha preferida es requerida';
        if (!formData.preferredTime) newErrors.preferredTime = 'Hora preferida es requerida';
        break;

      case 3: // Consents
        if (!formData.medicalConsent) newErrors.medicalConsent = 'Debe aceptar el consentimiento médico' as any;
        if (!formData.dataConsent) newErrors.dataConsent = 'Debe aceptar el tratamiento de datos' as any;
        if (formData.modalidad === 'teleconsulta' && !formData.teleconsultConsent) {
          newErrors.teleconsultConsent = 'Debe aceptar el consentimiento de teleconsulta' as any;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        console.log('Medical consultation booking submitted:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error submitting medical consultation booking:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      idNumber: '',
      consultationType: selectedService || '',
      preferredDate: '',
      preferredTime: '',
      symptoms: '',
      currentMedications: '',
      allergies: '',
      previousConditions: '',
      emergencyContact: '',
      emergencyPhone: '',
      modalidad: 'presencial',
      donationAmount: '0',
      medicalConsent: false,
      dataConsent: false,
      teleconsultConsent: false
    });
    setErrors({});
    setSubmitStatus('idle');
    setCurrentStep(1);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">🩺 Agendar Consulta Médica</h2>
                <p className="text-slate-600 mt-1">Dr. José Francisco Pichardo Pantaleón</p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center mt-6 space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step}
                  </div>
                  <div className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {step === 1 ? 'Datos Personales' : step === 2 ? 'Información Médica' : 'Confirmación'}
                  </div>
                  {step < 3 && <div className="ml-4 w-12 h-0.5 bg-slate-200"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Personal</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                        placeholder="Juan Pérez García"
                      />
                      {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cédula/ID *
                      </label>
                      <input
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => updateFormData('idNumber', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.idNumber ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                        placeholder="001-1234567-8"
                      />
                      {errors.idNumber && <p className="text-red-600 text-sm mt-1">{errors.idNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                        placeholder="juan@email.com"
                      />
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                        placeholder="(809) 555-1234"
                      />
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contacto de Emergencia *
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.emergencyContact ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                        placeholder="Nombre del contacto"
                      />
                      {errors.emergencyContact && <p className="text-red-600 text-sm mt-1">{errors.emergencyContact}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono de Emergencia *
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => updateFormData('emergencyPhone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.emergencyPhone ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                        placeholder="(809) 555-0000"
                      />
                      {errors.emergencyPhone && <p className="text-red-600 text-sm mt-1">{errors.emergencyPhone}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNext} variant="primary" className="bg-blue-600 hover:bg-blue-700">
                    Siguiente
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Medical Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Información de la Consulta</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipo de Consulta *
                      </label>
                      <select
                        value={formData.consultationType}
                        onChange={(e) => updateFormData('consultationType', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.consultationType ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      >
                        <option value="">Seleccionar tipo</option>
                        {consultationTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      {errors.consultationType && <p className="text-red-600 text-sm mt-1">{errors.consultationType}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Modalidad *
                      </label>
                      <select
                        value={formData.modalidad}
                        onChange={(e) => updateFormData('modalidad', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="presencial">Consulta Presencial</option>
                        <option value="teleconsulta">Teleconsulta (Virtual)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fecha Preferida *
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => updateFormData('preferredDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.preferredDate ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      />
                      {errors.preferredDate && <p className="text-red-600 text-sm mt-1">{errors.preferredDate}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hora Preferida *
                      </label>
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => updateFormData('preferredTime', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.preferredTime ? 'border-red-300 bg-red-50' : 'border-slate-300'
                        }`}
                      >
                        <option value="">Seleccionar hora</option>
                        {timeSlots.map(slot => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                      {errors.preferredTime && <p className="text-red-600 text-sm mt-1">{errors.preferredTime}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Síntomas o Motivo de Consulta
                      </label>
                      <textarea
                        value={formData.symptoms}
                        onChange={(e) => updateFormData('symptoms', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                        placeholder="Describa sus síntomas o el motivo de su consulta..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Medicamentos Actuales
                      </label>
                      <textarea
                        value={formData.currentMedications}
                        onChange={(e) => updateFormData('currentMedications', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                        placeholder="Liste los medicamentos que toma actualmente..."
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Alergias Conocidas
                        </label>
                        <textarea
                          value={formData.allergies}
                          onChange={(e) => updateFormData('allergies', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                          placeholder="Alergias a medicamentos, alimentos, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Condiciones Médicas Previas
                        </label>
                        <textarea
                          value={formData.previousConditions}
                          onChange={(e) => updateFormData('previousConditions', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                          placeholder="Diabetes, hipertensión, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Donation Section */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                    <h4 className="font-semibold text-slate-900 mb-4">💚 Contribución Voluntaria</h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Su donación es completamente voluntaria. Atendemos a todos independientemente de su capacidad económica.
                    </p>
                    
                    <div className="space-y-2">
                      {donationOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-white"
                        >
                          <input
                            type="radio"
                            name="donation"
                            value={option.value}
                            checked={formData.donationAmount === option.value}
                            onChange={(e) => updateFormData('donationAmount', e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    {formData.donationAmount === 'custom' && (
                      <div className="mt-4">
                        <input
                          type="number"
                          placeholder="Ingrese monto personalizado"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button onClick={handlePrevious} variant="outline">
                    Anterior
                  </Button>
                  <Button onClick={handleNext} variant="primary" className="bg-blue-600 hover:bg-blue-700">
                    Siguiente
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Consents */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Consentimientos</h3>
                  
                  <div className="space-y-6">
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="medicalConsent"
                          checked={formData.medicalConsent}
                          onChange={(e) => updateFormData('medicalConsent', e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <div>
                          <label htmlFor="medicalConsent" className="text-sm font-medium text-slate-900">
                            Consentimiento para Atención Médica *
                          </label>
                          <p className="text-sm text-slate-600 mt-1">
                            Acepto recibir atención médica del Dr. José Francisco Pichardo Pantaleón. 
                            Entiendo que en caso de emergencia debo acudir al centro de salud más cercano.
                          </p>
                        </div>
                      </div>
                      {errors.medicalConsent && <p className="text-red-600 text-sm mt-2">{errors.medicalConsent}</p>}
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="dataConsent"
                          checked={formData.dataConsent}
                          onChange={(e) => updateFormData('dataConsent', e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <div>
                          <label htmlFor="dataConsent" className="text-sm font-medium text-slate-900">
                            Consentimiento de Datos Personales *
                          </label>
                          <p className="text-sm text-slate-600 mt-1">
                            Autorizo el tratamiento de mis datos personales conforme a la Ley 172-13 
                            de República Dominicana para fines de atención médica y seguimiento.
                          </p>
                        </div>
                      </div>
                      {errors.dataConsent && <p className="text-red-600 text-sm mt-2">{errors.dataConsent}</p>}
                    </div>

                    {formData.modalidad === 'teleconsulta' && (
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="teleconsultConsent"
                            checked={formData.teleconsultConsent}
                            onChange={(e) => updateFormData('teleconsultConsent', e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <div>
                            <label htmlFor="teleconsultConsent" className="text-sm font-medium text-slate-900">
                              Consentimiento para Teleconsulta *
                            </label>
                            <p className="text-sm text-slate-600 mt-1">
                              Entiendo las limitaciones de la teleconsulta y acepto que ciertos diagnósticos 
                              pueden requerir evaluación presencial. Tengo conexión estable a internet y privacidad adecuada.
                            </p>
                          </div>
                        </div>
                        {errors.teleconsultConsent && <p className="text-red-600 text-sm mt-2">{errors.teleconsultConsent}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-green-600 mr-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">¡Consulta Agendada!</h4>
                        <p className="text-green-700 text-sm">Recibirá confirmación por email y SMS en las próximas horas.</p>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-red-600 mr-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-900">Error al Agendar</h4>
                        <p className="text-red-700 text-sm">Hubo un error al procesar su solicitud. Inténtelo nuevamente.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button onClick={handlePrevious} variant="outline">
                    Anterior
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    disabled={isSubmitting || submitStatus === 'success'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Agendando...
                      </>
                    ) : (
                      'Confirmar Consulta'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}