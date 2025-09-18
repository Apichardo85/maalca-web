"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './buttons';

interface ConsultationBookingProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: ConsultationFormData) => Promise<void>;
  language?: 'en' | 'es';
}

interface ConsultationFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  propertyType: string;
  budget: string;
  timeline: string;
  preferredTime: string;
  message: string;
  consent: boolean;
}

const getPropertyTypes = (language: 'en' | 'es') => [
  {
    value: 'virgin-land',
    label: language === 'en' ? 'Virgin Land / Development' : 'Terreno Virgen / Desarrollo'
  },
  {
    value: 'villa',
    label: language === 'en' ? 'Luxury Villa (Future)' : 'Villa de Lujo (Futuro)'
  },
  {
    value: 'investment',
    label: language === 'en' ? 'Investment Opportunity' : 'Oportunidad de Inversión'
  },
  {
    value: 'other',
    label: language === 'en' ? 'Other' : 'Otro'
  }
];

const getBudgetRanges = (language: 'en' | 'es') => [
  { value: '400k-500k', label: '$400K - $500K USD' },
  { value: '500k-700k', label: '$500K - $700K USD' },
  { value: '700k-1m', label: '$700K - $1M USD' },
  { value: '1m+', label: '$1M+ USD' },
  {
    value: 'flexible',
    label: language === 'en' ? 'Flexible' : 'Flexible'
  }
];

const getTimelineOptions = (language: 'en' | 'es') => [
  {
    value: 'asap',
    label: language === 'en' ? 'As soon as possible' : 'Lo antes posible'
  },
  {
    value: '3months',
    label: language === 'en' ? 'Within 3 months' : 'Dentro de 3 meses'
  },
  {
    value: '6months',
    label: language === 'en' ? 'Within 6 months' : 'Dentro de 6 meses'
  },
  {
    value: '1year',
    label: language === 'en' ? 'Within 1 year' : 'Dentro de 1 año'
  },
  {
    value: 'exploring',
    label: language === 'en' ? 'Just exploring' : 'Solo explorando'
  }
];

const getTimeSlots = (language: 'en' | 'es') => [
  {
    value: 'morning',
    label: language === 'en' ? 'Morning (8:00 AM - 12:00 PM)' : 'Mañana (8:00 AM - 12:00 PM)'
  },
  {
    value: 'afternoon',
    label: language === 'en' ? 'Afternoon (12:00 PM - 6:00 PM)' : 'Tarde (12:00 PM - 6:00 PM)'
  },
  {
    value: 'evening',
    label: language === 'en' ? 'Evening (6:00 PM - 9:00 PM)' : 'Noche (6:00 PM - 9:00 PM)'
  },
  {
    value: 'flexible',
    label: language === 'en' ? 'Flexible' : 'Flexible'
  }
];

export default function ConsultationBooking({ isOpen, onClose, onSubmit, language = 'en' }: ConsultationBookingProps) {
  const [formData, setFormData] = useState<ConsultationFormData>({
    name: '',
    email: '',
    phone: '',
    country: '',
    propertyType: '',
    budget: '',
    timeline: '',
    preferredTime: '',
    message: '',
    consent: false
  });

  const [errors, setErrors] = useState<Partial<ConsultationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const propertyTypes = getPropertyTypes(language);
  const budgetRanges = getBudgetRanges(language);
  const timelineOptions = getTimelineOptions(language);
  const timeSlots = getTimeSlots(language);

  const translations = {
    en: {
      scheduleConsultation: 'Schedule Your Consultation',
      bookPersonalized: 'Book a personalized session with our Caribbean property experts',
      personalInfo: 'Personal Information',
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      country: 'Country',
      propertyPrefs: 'Property Preferences',
      propertyType: 'Property Type',
      budgetRange: 'Budget Range',
      timeline: 'Timeline',
      preferredTime: 'Preferred Time',
      additionalMessage: 'Additional Message',
      messagePlaceholder: 'Tell us about your specific needs, questions, or preferences...',
      consent: 'I agree to be contacted by MaalCa Properties regarding my consultation request and understand that this may include phone calls, emails, and text messages. I can opt out at any time.',
      consultationBooked: 'Consultation Booked!',
      contactWithin24: "We'll contact you within 24 hours to schedule your consultation.",
      bookingFailed: 'Booking Failed',
      errorTryAgain: 'There was an error booking your consultation. Please try again.',
      cancel: 'Cancel',
      bookConsultation: 'Book Consultation',
      booking: 'Booking...',
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      validEmail: 'Please enter a valid email address',
      phoneRequired: 'Phone number is required',
      countryRequired: 'Country is required',
      propertyTypeRequired: 'Property type is required',
      budgetRequired: 'Budget range is required',
      timelineRequired: 'Timeline is required',
      preferredTimeRequired: 'Preferred time is required',
      consentRequired: 'You must agree to be contacted',
      selectPropertyType: 'Select property type',
      selectBudgetRange: 'Select budget range',
      selectTimeline: 'Select timeline',
      selectPreferredTime: 'Select preferred time',
      enterFullName: 'Enter your full name',
      emailPlaceholder: 'your.email@example.com',
      phonePlaceholder: '+1 (555) 123-4567',
      countryPlaceholder: 'United States'
    },
    es: {
      scheduleConsultation: 'Programa tu Consulta',
      bookPersonalized: 'Reserva una sesión personalizada con nuestros expertos en propiedades del Caribe',
      personalInfo: 'Información Personal',
      fullName: 'Nombre Completo',
      emailAddress: 'Correo Electrónico',
      phoneNumber: 'Número de Teléfono',
      country: 'País',
      propertyPrefs: 'Preferencias de Propiedad',
      propertyType: 'Tipo de Propiedad',
      budgetRange: 'Rango de Presupuesto',
      timeline: 'Cronograma',
      preferredTime: 'Hora Preferida',
      additionalMessage: 'Mensaje Adicional',
      messagePlaceholder: 'Cuéntanos sobre tus necesidades específicas, preguntas o preferencias...',
      consent: 'Acepto ser contactado por MaalCa Properties con respecto a mi solicitud de consulta y entiendo que esto puede incluir llamadas telefónicas, correos electrónicos y mensajes de texto. Puedo optar por no participar en cualquier momento.',
      consultationBooked: '¡Consulta Reservada!',
      contactWithin24: 'Te contactaremos dentro de 24 horas para programar tu consulta.',
      bookingFailed: 'Reserva Fallida',
      errorTryAgain: 'Hubo un error al reservar tu consulta. Por favor, inténtalo de nuevo.',
      cancel: 'Cancelar',
      bookConsultation: 'Reservar Consulta',
      booking: 'Reservando...',
      nameRequired: 'El nombre es obligatorio',
      emailRequired: 'El correo electrónico es obligatorio',
      validEmail: 'Por favor ingresa una dirección de correo válida',
      phoneRequired: 'El número de teléfono es obligatorio',
      countryRequired: 'El país es obligatorio',
      propertyTypeRequired: 'El tipo de propiedad es obligatorio',
      budgetRequired: 'El rango de presupuesto es obligatorio',
      timelineRequired: 'El cronograma es obligatorio',
      preferredTimeRequired: 'La hora preferida es obligatoria',
      consentRequired: 'Debes aceptar ser contactado',
      selectPropertyType: 'Selecciona tipo de propiedad',
      selectBudgetRange: 'Selecciona rango de presupuesto',
      selectTimeline: 'Selecciona cronograma',
      selectPreferredTime: 'Selecciona hora preferida',
      enterFullName: 'Ingresa tu nombre completo',
      emailPlaceholder: 'tu.correo@ejemplo.com',
      phonePlaceholder: '+1 (555) 123-4567',
      countryPlaceholder: 'Estados Unidos'
    }
  };

  const t = translations[language];

  const updateFormData = (field: keyof ConsultationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ConsultationFormData> = {};

    if (!formData.name.trim()) newErrors.name = t.nameRequired;
    if (!formData.email.trim()) newErrors.email = t.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.validEmail;
    }
    if (!formData.phone.trim()) newErrors.phone = t.phoneRequired;
    if (!formData.country.trim()) newErrors.country = t.countryRequired;
    if (!formData.propertyType) newErrors.propertyType = t.propertyTypeRequired;
    if (!formData.budget) newErrors.budget = t.budgetRequired;
    if (!formData.timeline) newErrors.timeline = t.timelineRequired;
    if (!formData.preferredTime) newErrors.preferredTime = t.preferredTimeRequired;
    if (!formData.consent) newErrors.consent = t.consentRequired as any;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default behavior: log to console and show success
        console.log('Consultation booking submitted:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      }
      
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Error submitting consultation booking:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      propertyType: '',
      budget: '',
      timeline: '',
      preferredTime: '',
      message: '',
      consent: false
    });
    setErrors({});
    setSubmitStatus('idle');
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
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-2 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mt-2 sm:mt-0"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">📞 {t.scheduleConsultation}</h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1">{t.bookPersonalized}</p>
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
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.personalInfo}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder={t.enterFullName}
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.emailAddress} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder={t.emailPlaceholder}
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder={t.phonePlaceholder}
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.country} *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateFormData('country', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.country ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                    placeholder={t.countryPlaceholder}
                  />
                  {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>

            {/* Property Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{t.propertyPrefs}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.propertyType} *
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => updateFormData('propertyType', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.propertyType ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">{t.selectPropertyType}</option>
                    {propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.propertyType && <p className="text-red-600 text-sm mt-1">{errors.propertyType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.budgetRange} *
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => updateFormData('budget', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.budget ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">{t.selectBudgetRange}</option>
                    {budgetRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                  {errors.budget && <p className="text-red-600 text-sm mt-1">{errors.budget}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.timeline} *
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => updateFormData('timeline', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.timeline ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">{t.selectTimeline}</option>
                    {timelineOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.timeline && <p className="text-red-600 text-sm mt-1">{errors.timeline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t.preferredTime} *
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => updateFormData('preferredTime', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.preferredTime ? 'border-red-300 bg-red-50' : 'border-slate-300'
                    }`}
                  >
                    <option value="">{t.selectPreferredTime}</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                  {errors.preferredTime && <p className="text-red-600 text-sm mt-1">{errors.preferredTime}</p>}
                </div>
              </div>
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.additionalMessage}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                placeholder={t.messagePlaceholder}
              />
            </div>

            {/* Consent */}
            <div>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) => updateFormData('consent', e.target.checked)}
                  className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded ${
                    errors.consent ? 'border-red-300' : ''
                  }`}
                />
                <label htmlFor="consent" className="text-sm text-slate-700">
                  {t.consent}
                </label>
              </div>
              {errors.consent && <p className="text-red-600 text-sm mt-1">{errors.consent}</p>}
            </div>

            {/* Submit Status */}
            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-600 mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">{t.consultationBooked}</h4>
                    <p className="text-green-700 text-sm">{t.contactWithin24}</p>
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
                    <h4 className="font-medium text-red-900">{t.bookingFailed}</h4>
                    <p className="text-red-700 text-sm">{t.errorTryAgain}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || submitStatus === 'success'}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.booking}
                  </>
                ) : (
                  t.bookConsultation
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}