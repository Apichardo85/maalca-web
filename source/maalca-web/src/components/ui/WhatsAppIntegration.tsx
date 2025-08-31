"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './buttons';

interface WhatsAppIntegrationProps {
  phoneNumber?: string;
  defaultMessage?: string;
  businessName?: string;
  className?: string;
}

interface WhatsAppMessageOptions {
  type: 'quick' | 'custom';
  message: string;
}

const getQuickMessages = (businessName?: string) => {
  const isMedical = businessName?.toLowerCase().includes('dr.') || businessName?.toLowerCase().includes('pichardo');
  
  if (isMedical) {
    return [
      {
        id: 'medical-consultation',
        title: 'Agendar Consulta Médica',
        message: 'Hola Dr. Pichardo, me gustaría agendar una consulta médica. ¿Qué disponibilidad tiene?'
      },
      {
        id: 'teleconsultation',
        title: 'Solicitar Teleconsulta',
        message: 'Buenos días, estoy interesado en una teleconsulta. ¿Cómo puedo agendar una cita virtual?'
      },
      {
        id: 'medical-emergency',
        title: 'Consulta Urgente',
        message: 'Doctor, necesito una consulta urgente. ¿Tiene disponibilidad para atenderme hoy?'
      },
      {
        id: 'follow-up',
        title: 'Seguimiento Médico',
        message: 'Hola Dr. Pichardo, necesito agendar una cita de seguimiento. ¿Cuándo sería posible?'
      },
      {
        id: 'operative-inquiry',
        title: 'Operativo Médico',
        message: 'Buenos días, quisiera información sobre los próximos operativos médicos comunitarios.'
      },
      {
        id: 'donation-info',
        title: 'Información de Donaciones',
        message: 'Hola, me gustaría conocer más sobre el sistema de donaciones para apoyar la medicina solidaria.'
      },
      {
        id: 'general-health',
        title: 'Consulta General',
        message: 'Buenos días Dr. Pichardo, tengo algunas preguntas sobre salud y me gustaría conversar.'
      }
    ];
  }
  
  return [
    {
      id: 'property-inquiry',
      title: 'Property Inquiry',
      message: 'Hi! I\'m interested in learning more about your Caribbean properties. Could you please share available listings?'
    },
    {
      id: 'investment-info',
      title: 'Investment Information',
      message: 'Hello! I\'d like to know more about investment opportunities in Caribbean real estate. What are the current market trends?'
    },
    {
      id: 'villa-rentals',
      title: 'Villa Rentals',
      message: 'Hi there! I\'m looking for luxury villa rentals in the Caribbean. Do you have availability for upcoming dates?'
    },
    {
      id: 'consultation',
      title: 'Schedule Consultation',
      message: 'Hello! I would like to schedule a consultation to discuss Caribbean property investments. When would be a good time?'
    },
    {
      id: 'financing',
      title: 'Financing Options',
      message: 'Hi! I\'m interested in learning about financing options for Caribbean property purchases. Can you provide information?'
    },
    {
      id: 'general',
      title: 'General Question',
      message: 'Hello! I have some questions about Caribbean real estate and would love to chat.'
    }
  ];
};

export default function WhatsAppIntegration({ 
  phoneNumber = "+18491234567", // Dominican Republic number
  defaultMessage = "Hi! I'm interested in your Caribbean properties.",
  businessName = "MaalCa Properties",
  className = ""
}: WhatsAppIntegrationProps) {
  const [showMessageSelector, setShowMessageSelector] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedMessageType, setSelectedMessageType] = useState<'quick' | 'custom'>('quick');
  
  const quickMessages = getQuickMessages(businessName);

  const formatWhatsAppUrl = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    // Remove any non-digits from phone number for WhatsApp URL
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const handleQuickChat = () => {
    const url = formatWhatsAppUrl(defaultMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCustomMessage = (message: string) => {
    const url = formatWhatsAppUrl(message);
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowMessageSelector(false);
  };

  const handleSendCustomMessage = () => {
    if (customMessage.trim()) {
      handleCustomMessage(customMessage);
      setCustomMessage('');
    }
  };

  return (
    <>
      {/* Main Chat Button */}
      <div className={className}>
        {/* Floating button style for fixed positioning */}
        {className.includes('w-16 h-16') ? (
          <button
            onClick={() => setShowMessageSelector(true)}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300"
            title="Chat on WhatsApp"
          >
            💬
          </button>
        ) : (
          /* Regular button layout */
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="bg-green-500 hover:bg-green-600 text-white flex-1"
              onClick={handleQuickChat}
            >
              💬 Chat Now
            </Button>
            <Button
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 px-3"
              onClick={() => setShowMessageSelector(true)}
              title="Choose message"
            >
              ⚙️
            </Button>
          </div>
        )}
      </div>

      {/* Message Selector Modal */}
      <AnimatePresence>
        {showMessageSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowMessageSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">💬 Start WhatsApp Chat</h3>
                    <p className="text-slate-600 text-sm mt-1">Choose a message to send to {businessName}</p>
                  </div>
                  <button
                    onClick={() => setShowMessageSelector(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Message Type Selector */}
              <div className="p-6">
                <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedMessageType('quick')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      selectedMessageType === 'quick'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quick Messages
                  </button>
                  <button
                    onClick={() => setSelectedMessageType('custom')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      selectedMessageType === 'custom'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Custom Message
                  </button>
                </div>

                {/* Quick Messages */}
                {selectedMessageType === 'quick' && (
                  <div className="space-y-3">
                    {quickMessages.map((msg) => (
                      <motion.button
                        key={msg.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCustomMessage(msg.message)}
                        className="w-full text-left p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
                      >
                        <div className="font-medium text-slate-900 mb-1 group-hover:text-green-700">
                          {msg.title}
                        </div>
                        <div className="text-sm text-slate-600 line-clamp-2">
                          {msg.message}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Custom Message */}
                {selectedMessageType === 'custom' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Your Message
                      </label>
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Type your custom message here..."
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">💡</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">Tips for effective messaging:</h4>
                          <ul className="text-xs text-slate-600 mt-1 space-y-1">
                            {businessName?.toLowerCase().includes('dr.') || businessName?.toLowerCase().includes('pichardo') ? (
                              <>
                                <li>• Indique sus síntomas o motivo de consulta</li>
                                <li>• Mencione si es urgente o puede esperar</li>
                                <li>• Incluya su ubicación para consultas presenciales</li>
                                <li>• Sea específico con fechas y horarios preferidos</li>
                              </>
                            ) : (
                              <>
                                <li>• Be specific about your property interests</li>
                                <li>• Mention your budget range if comfortable</li>
                                <li>• Include your preferred timeline</li>
                                <li>• Ask specific questions to get better responses</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSendCustomMessage}
                      disabled={!customMessage.trim()}
                      className="w-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Message via WhatsApp
                    </Button>
                  </div>
                )}

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <div className="text-sm text-slate-600">
                      You'll be redirected to WhatsApp to chat with
                    </div>
                    <div className="font-medium text-slate-900 mt-1">{businessName}</div>
                    <div className="text-sm text-slate-500 mt-1">{phoneNumber}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}