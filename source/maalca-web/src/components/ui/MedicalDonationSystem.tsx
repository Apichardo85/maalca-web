"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './buttons';

interface MedicalDonationSystemProps {
  isOpen: boolean;
  onClose: () => void;
  consultationType?: string;
  patientName?: string;
  onDonationComplete?: (donationData: DonationData) => void;
}

interface DonationData {
  amount: number;
  frequency: 'one-time' | 'monthly' | 'quarterly';
  paymentMethod: 'card' | 'transfer' | 'cash';
  donorInfo: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  purpose: 'consultation' | 'operative' | 'general' | 'emergency';
  anonymous: boolean;
}

const donationOptions = [
  {
    amount: 0,
    label: "Sin Donación",
    description: "Atención completamente gratuita",
    impact: "Reciba atención médica sin costo",
    icon: "🤲"
  },
  {
    amount: 300,
    label: "Contribución Básica",
    description: "RD$ 300 - Apoyo mínimo",
    impact: "Ayuda a cubrir materiales básicos",
    icon: "💙"
  },
  {
    amount: 500,
    label: "Contribución Estándar",
    description: "RD$ 500 - Apoyo promedio",
    impact: "Contribuye al mantenimiento del servicio",
    icon: "💚"
  },
  {
    amount: 800,
    label: "Contribución Solidaria",
    description: "RD$ 800 - Apoyo generoso",
    impact: "Patrocina consulta gratuita para otra persona",
    icon: "💛"
  },
  {
    amount: 1000,
    label: "Contribución de Apoyo",
    description: "RD$ 1,000 - Apoyo sustancial",
    impact: "Patrocina consultas para 2 personas más",
    icon: "💜"
  },
  {
    amount: 1500,
    label: "Contribución Premium",
    description: "RD$ 1,500 - Apoyo excepcional",
    impact: "Patrocina operativo médico comunitario",
    icon: "🧡"
  }
];

const paymentMethods = [
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    description: 'Visa, Mastercard, American Express',
    icon: '💳',
    providers: ['AZUL', 'CardNET', 'Banesco']
  },
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    description: 'Transferencia directa a cuenta médica',
    icon: '🏦',
    providers: ['Banreservas', 'Popular', 'BHD León']
  },
  {
    id: 'cash',
    name: 'Efectivo',
    description: 'Pago en efectivo en consulta',
    icon: '💵',
    providers: []
  }
];

const purposes = [
  { id: 'consultation', name: 'Consulta Médica', icon: '🩺' },
  { id: 'operative', name: 'Operativo Comunitario', icon: '🏥' },
  { id: 'general', name: 'Donación General', icon: '💝' },
  { id: 'emergency', name: 'Fondo de Emergencias', icon: '🚨' }
];

const frequencies = [
  { id: 'one-time', name: 'Donación Única', icon: '1️⃣' },
  { id: 'monthly', name: 'Mensual', icon: '📅' },
  { id: 'quarterly', name: 'Trimestral', icon: '📆' }
];

export default function MedicalDonationSystem({
  isOpen,
  onClose,
  consultationType = '',
  patientName = '',
  onDonationComplete
}: MedicalDonationSystemProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [donationData, setDonationData] = useState<DonationData>({
    amount: 0,
    frequency: 'one-time',
    paymentMethod: 'card',
    donorInfo: {
      name: '',
      email: '',
      phone: '',
      message: ''
    },
    purpose: 'consultation',
    anonymous: false
  });

  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleAmountSelect = (amount: number) => {
    setDonationData(prev => ({ ...prev, amount }));
    if (amount > 0) {
      setCurrentStep(2);
    }
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setDonationData(prev => ({ ...prev, amount: numValue }));
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return donationData.amount >= 0;
      case 2:
        if (donationData.amount === 0) return true;
        return donationData.donorInfo.name.trim() !== '' && 
               donationData.donorInfo.email.trim() !== '';
      case 3:
        return true;
      default:
        return false;
    }
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate payment success/failure
      const success = Math.random() > 0.1; // 90% success rate for demo

      if (success) {
        setPaymentStatus('success');
        if (onDonationComplete) {
          onDonationComplete(donationData);
        }
        
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setDonationData({
      amount: 0,
      frequency: 'one-time',
      paymentMethod: 'card',
      donorInfo: { name: '', email: '', phone: '', message: '' },
      purpose: 'consultation',
      anonymous: false
    });
    setCustomAmount('');
    setPaymentStatus('idle');
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
                <h2 className="text-2xl font-bold text-slate-900">💚 Sistema de Donaciones</h2>
                <p className="text-slate-600">Dr. José Francisco Pichardo Pantaleón - Medicina Solidaria</p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isProcessing}
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
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step}
                  </div>
                  <div className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? 'text-green-600' : 'text-slate-400'
                  }`}>
                    {step === 1 ? 'Monto' : step === 2 ? 'Información' : 'Pago'}
                  </div>
                  {step < 3 && <div className="ml-4 w-12 h-0.5 bg-slate-200"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Amount Selection */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Seleccione su Contribución</h3>
                  <p className="text-slate-600 text-lg">
                    Su donación es completamente voluntaria. Atendemos a todos independientemente de su capacidad económica.
                  </p>
                  {consultationType && (
                    <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mr-2">🩺</span>
                      <span className="text-blue-800 font-medium">Para: {consultationType}</span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {donationOptions.map((option) => (
                    <motion.button
                      key={option.amount}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAmountSelect(option.amount)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                        donationData.amount === option.amount
                          ? 'border-green-600 bg-green-50'
                          : 'border-slate-200 hover:border-green-300 hover:bg-green-25'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{option.icon}</div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          donationData.amount === option.amount
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {option.amount === 0 ? 'Gratuito' : `RD$ ${option.amount}`}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-2">{option.label}</h4>
                      <p className="text-slate-600 text-sm mb-2">{option.description}</p>
                      <p className="text-green-600 text-sm font-medium">{option.impact}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-bold text-slate-900 mb-4">💝 Monto Personalizado</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                          RD$
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={customAmount}
                          onChange={(e) => handleCustomAmount(e.target.value)}
                          placeholder="Ingrese monto personalizado"
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => customAmount && handleAmountSelect(parseFloat(customAmount))}
                      disabled={!customAmount || parseFloat(customAmount) <= 0}
                      variant="primary"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirmar
                    </Button>
                  </div>
                </div>

                {donationData.amount === 0 && (
                  <div className="text-center">
                    <Button
                      onClick={handleNext}
                      variant="primary"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continuar sin Donación
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Donor Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {donationData.amount === 0 ? 'Información Opcional' : 'Información del Donante'}
                  </h3>
                  <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-xl">
                    <span className="text-green-600 text-2xl mr-3">💚</span>
                    <div className="text-left">
                      <p className="font-bold text-green-800">
                        {donationData.amount === 0 ? 'Atención Gratuita' : `Contribución: RD$ ${donationData.amount}`}
                      </p>
                      <p className="text-sm text-green-600">
                        {donationData.amount === 0 ? 'Sin costo para usted' : 'Gracias por su generosidad'}
                      </p>
                    </div>
                  </div>
                </div>

                {donationData.amount > 0 && (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          value={donationData.donorInfo.name}
                          onChange={(e) => setDonationData(prev => ({
                            ...prev,
                            donorInfo: { ...prev.donorInfo, name: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Su nombre completo"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={donationData.donorInfo.email}
                          onChange={(e) => setDonationData(prev => ({
                            ...prev,
                            donorInfo: { ...prev.donorInfo, email: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="su@email.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Teléfono (Opcional)
                        </label>
                        <input
                          type="tel"
                          value={donationData.donorInfo.phone}
                          onChange={(e) => setDonationData(prev => ({
                            ...prev,
                            donorInfo: { ...prev.donorInfo, phone: e.target.value }
                          }))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="(809) 555-1234"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Propósito de la Donación
                        </label>
                        <select
                          value={donationData.purpose}
                          onChange={(e) => setDonationData(prev => ({ 
                            ...prev, 
                            purpose: e.target.value as DonationData['purpose'] 
                          }))}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {purposes.map(purpose => (
                            <option key={purpose.id} value={purpose.id}>
                              {purpose.icon} {purpose.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Frecuencia de Donación
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {frequencies.map(freq => (
                          <button
                            key={freq.id}
                            onClick={() => setDonationData(prev => ({ 
                              ...prev, 
                              frequency: freq.id as DonationData['frequency'] 
                            }))}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              donationData.frequency === freq.id
                                ? 'border-green-600 bg-green-50'
                                : 'border-slate-200 hover:border-green-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{freq.icon}</div>
                            <div className="text-sm font-medium">{freq.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mensaje Personal (Opcional)
                      </label>
                      <textarea
                        value={donationData.donorInfo.message}
                        onChange={(e) => setDonationData(prev => ({
                          ...prev,
                          donorInfo: { ...prev.donorInfo, message: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                        placeholder="Un mensaje opcional para el Dr. Pichardo o la comunidad..."
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={donationData.anonymous}
                        onChange={(e) => setDonationData(prev => ({ ...prev, anonymous: e.target.checked }))}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 rounded"
                      />
                      <label htmlFor="anonymous" className="text-sm text-slate-700">
                        Hacer esta donación de forma anónima
                      </label>
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <Button onClick={handlePrevious} variant="outline">
                    Anterior
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    variant="primary" 
                    disabled={donationData.amount > 0 && !validateStep(2)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {donationData.amount === 0 ? 'Finalizar' : 'Proceder al Pago'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && donationData.amount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Procesar Donación</h3>
                  <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-xl">
                    <span className="text-green-600 text-2xl mr-3">💳</span>
                    <div className="text-left">
                      <p className="font-bold text-green-800">Total: RD$ {donationData.amount}</p>
                      <p className="text-sm text-green-600">
                        {donationData.frequency === 'monthly' ? 'Donación mensual' : 
                         donationData.frequency === 'quarterly' ? 'Donación trimestral' : 
                         'Donación única'}
                      </p>
                    </div>
                  </div>
                </div>

                {paymentStatus === 'idle' && (
                  <>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-4">Método de Pago</h4>
                      <div className="grid gap-3">
                        {paymentMethods.map(method => (
                          <button
                            key={method.id}
                            onClick={() => setDonationData(prev => ({ 
                              ...prev, 
                              paymentMethod: method.id as DonationData['paymentMethod'] 
                            }))}
                            className={`p-4 rounded-lg border-2 text-left transition-all ${
                              donationData.paymentMethod === method.id
                                ? 'border-green-600 bg-green-50'
                                : 'border-slate-200 hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{method.icon}</span>
                                <div>
                                  <div className="font-medium text-slate-900">{method.name}</div>
                                  <div className="text-sm text-slate-600">{method.description}</div>
                                </div>
                              </div>
                              {method.providers.length > 0 && (
                                <div className="flex gap-1">
                                  {method.providers.map(provider => (
                                    <span
                                      key={provider}
                                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                                    >
                                      {provider}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-bold text-blue-900 mb-2">🔒 Pago Seguro</h4>
                      <p className="text-blue-800 text-sm">
                        Todos los pagos son procesados de forma segura. Su información financiera 
                        está protegida con encriptación de nivel bancario.
                      </p>
                    </div>
                  </>
                )}

                {paymentStatus === 'processing' && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <svg className="animate-spin w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Procesando Donación</h4>
                    <p className="text-slate-600">Por favor espere mientras procesamos su donación...</p>
                  </div>
                )}

                {paymentStatus === 'success' && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-green-900 mb-2">¡Donación Exitosa!</h4>
                    <p className="text-green-700">Gracias por su generosidad. Su donación ayudará a brindar atención médica a más personas.</p>
                  </div>
                )}

                {paymentStatus === 'error' && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                      <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-red-900 mb-2">Error en el Pago</h4>
                    <p className="text-red-700 mb-4">Hubo un problema procesando su donación. Por favor intente nuevamente.</p>
                    <Button 
                      onClick={() => setPaymentStatus('idle')}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      Intentar Nuevamente
                    </Button>
                  </div>
                )}

                {paymentStatus === 'idle' && (
                  <div className="flex justify-between">
                    <Button onClick={handlePrevious} variant="outline" disabled={isProcessing}>
                      Anterior
                    </Button>
                    <Button 
                      onClick={processPayment}
                      variant="primary"
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? 'Procesando...' : `Donar RD$ ${donationData.amount}`}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Complete Step for Free Consultation */}
            {currentStep === 3 && donationData.amount === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-blue-900 mb-2">¡Proceso Completado!</h4>
                <p className="text-blue-700 mb-6">
                  Su consulta ha sido registrada sin costo. Recibirá confirmación por email.
                </p>
                <Button 
                  onClick={handleClose}
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuar
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}