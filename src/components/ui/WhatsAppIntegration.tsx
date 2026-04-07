"use client";

import { useState, useEffect } from "react";

interface WhatsAppIntegrationProps {
  phoneNumber: string;
  defaultMessage?: string;
  businessName?: string;
  businessType?: "barbershop" | "restaurant" | "medical" | "general";
  className?: string;
  floating?: boolean;
}

const quickMessagesByType = {
  barbershop: [
    {
      id: "appointment",
      title: "Agendar Cita",
      titleEn: "Book Appointment",
      message: "Hola, me gustaría agendar una cita. ¿Qué disponibilidad tienen?",
    },
    {
      id: "walk-in",
      title: "Disponibilidad Walk-in",
      titleEn: "Walk-in Availability",
      message: "Hola, ¿tienen disponibilidad para walk-in ahora mismo?",
    },
    {
      id: "services",
      title: "Precios y Servicios",
      titleEn: "Prices & Services",
      message: "Hola, me gustaría saber los precios y servicios disponibles.",
    },
    {
      id: "queue",
      title: "Verificar la Fila",
      titleEn: "Check the Queue",
      message: "Hola, ¿cuántas personas hay en fila? ¿Cuánto es la espera aproximada?",
    },
  ],
  restaurant: [
    {
      id: "reservation",
      title: "Hacer Reservación",
      titleEn: "Make Reservation",
      message: "Hola, me gustaría hacer una reservación. ¿Tienen disponibilidad?",
    },
    {
      id: "order",
      title: "Ordenar para Delivery/Pickup",
      titleEn: "Order Delivery/Pickup",
      message: "Hola, me gustaría hacer un pedido para recoger/delivery.",
    },
    {
      id: "menu",
      title: "Ver Menú del Día",
      titleEn: "Today's Menu",
      message: "Hola, ¿cuál es el menú/especial del día?",
    },
    {
      id: "catering",
      title: "Catering / Eventos",
      titleEn: "Catering / Events",
      message: "Hola, me gustaría información sobre catering o eventos privados.",
    },
  ],
  medical: [
    {
      id: "consultation",
      title: "Agendar Consulta",
      titleEn: "Book Consultation",
      message: "Hola Dr. Pichardo, me gustaría agendar una consulta médica. ¿Qué disponibilidad tiene?",
    },
    {
      id: "teleconsultation",
      title: "Teleconsulta",
      titleEn: "Teleconsultation",
      message: "Buenos días, estoy interesado en una teleconsulta. ¿Cómo puedo agendar una cita virtual?",
    },
    {
      id: "urgent",
      title: "Consulta Urgente",
      titleEn: "Urgent Consultation",
      message: "Doctor, necesito una consulta urgente. ¿Tiene disponibilidad para atenderme hoy?",
    },
    {
      id: "followup",
      title: "Seguimiento",
      titleEn: "Follow-up",
      message: "Hola Dr. Pichardo, necesito agendar una cita de seguimiento.",
    },
  ],
  general: [
    {
      id: "info",
      title: "Información General",
      titleEn: "General Info",
      message: "Hola, me gustaría más información sobre sus servicios.",
    },
    {
      id: "quote",
      title: "Solicitar Cotización",
      titleEn: "Request Quote",
      message: "Hola, me gustaría solicitar una cotización.",
    },
  ],
};

export default function WhatsAppIntegration({
  phoneNumber,
  defaultMessage = "Hola, me gustaría más información.",
  businessName = "MaalCa",
  businessType = "general",
  className = "",
  floating = true,
}: WhatsAppIntegrationProps) {
  const [showMessages, setShowMessages] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const waUrl = (msg: string) =>
    `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

  const messages = quickMessagesByType[businessType] || quickMessagesByType.general;

  // Close on Escape
  useEffect(() => {
    if (!showMessages) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMessages(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showMessages]);

  const send = (msg: string) => {
    window.open(waUrl(msg), "_blank", "noopener,noreferrer");
    setShowMessages(false);
  };

  if (floating) {
    return (
      <>
        <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition-all duration-300"
            aria-label={`Chat with ${businessName} on WhatsApp`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
        </div>

        {/* Quick message popup */}
        {showMessages && (
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowMessages(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-green-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{businessName}</h3>
                  <p className="text-green-100 text-sm">WhatsApp</p>
                </div>
                <button
                  onClick={() => setShowMessages(false)}
                  className="text-white/80 hover:text-white"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Quick messages */}
              <div className="p-4 space-y-2">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => send(msg.message)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {msg.title}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom message */}
              <div className="p-4 pt-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && customMessage.trim() && send(customMessage)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                  <button
                    onClick={() => customMessage.trim() && send(customMessage)}
                    disabled={!customMessage.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
                  >
                    Enviar
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4 text-center text-xs text-gray-400">
                {phoneNumber}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Non-floating inline button
  return (
    <div className={className}>
      <a
        href={waUrl(defaultMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </a>
    </div>
  );
}
