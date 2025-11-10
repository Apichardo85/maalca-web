import { useCallback } from 'react';
import type { CartItem } from './useCart';

const WHATSAPP_NUMBER = '5219982045881';

export type MessageType = 'order' | 'inquiry' | 'subscription' | 'event' | 'cart' | 'custom';

interface OrderMessage {
  type: 'order';
  productName: string;
  price: number;
  additionalInfo?: string;
}

interface InquiryMessage {
  type: 'inquiry';
  subject: string;
  message?: string;
}

interface SubscriptionMessage {
  type: 'subscription';
  planName: string;
  price: number;
}

interface EventMessage {
  type: 'event';
  eventName: string;
  date?: string;
}

interface CartMessage {
  type: 'cart';
  items: CartItem[];
  total: number;
}

interface CustomMessage {
  type: 'custom';
  message: string;
}

type WhatsAppMessage = OrderMessage | InquiryMessage | SubscriptionMessage | EventMessage | CartMessage | CustomMessage;

export function useWhatsAppContact() {
  const formatOrderMessage = (productName: string, price: number, additionalInfo?: string): string => {
    let message = `Hola Cocina Tina! 🍽️\n\n`;
    message += `Estoy interesado en: *${productName}*\n`;
    message += `Precio: $${price}\n`;
    if (additionalInfo) {
      message += `\nNotas: ${additionalInfo}`;
    }
    message += `\n\n¿Podrían ayudarme con más información?`;
    return message;
  };

  const formatInquiryMessage = (subject: string, message?: string): string => {
    let text = `Hola Cocina Tina! 👋\n\n`;
    text += `Tengo una consulta sobre: *${subject}*\n`;
    if (message) {
      text += `\n${message}`;
    }
    text += `\n\n¡Gracias!`;
    return text;
  };

  const formatSubscriptionMessage = (planName: string, price: number): string => {
    let message = `Hola Cocina Tina! 📦\n\n`;
    message += `Me interesa el *${planName}*\n`;
    message += `Precio: $${price}/semana\n`;
    message += `\n¿Cómo puedo suscribirme?`;
    return message;
  };

  const formatEventMessage = (eventName: string, date?: string): string => {
    let message = `Hola Cocina Tina! 🎉\n\n`;
    message += `Me gustaría participar en: *${eventName}*\n`;
    if (date) {
      message += `Fecha: ${date}\n`;
    }
    message += `\n¿Cómo puedo reservar mi lugar?`;
    return message;
  };

  const formatCartMessage = (items: CartItem[], total: number): string => {
    let message = `Hola Cocina Tina! 🛒\n\n`;
    message += `Me gustaría hacer el siguiente pedido:\n\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${item.price} c/u\n`;
      message += `   Subtotal: $${item.price * item.quantity}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL: $${total}*\n\n`;
    message += `¿Podrían confirmar la disponibilidad y tiempo de entrega?`;

    return message;
  };

  const openWhatsApp = useCallback((data: WhatsAppMessage) => {
    let message = '';

    switch (data.type) {
      case 'order':
        message = formatOrderMessage(data.productName, data.price, data.additionalInfo);
        break;
      case 'inquiry':
        message = formatInquiryMessage(data.subject, data.message);
        break;
      case 'subscription':
        message = formatSubscriptionMessage(data.planName, data.price);
        break;
      case 'event':
        message = formatEventMessage(data.eventName, data.date);
        break;
      case 'cart':
        message = formatCartMessage(data.items, data.total);
        break;
      case 'custom':
        message = data.message;
        break;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }, []);

  const sendOrderMessage = useCallback((productName: string, price: number, additionalInfo?: string) => {
    openWhatsApp({ type: 'order', productName, price, additionalInfo });
  }, [openWhatsApp]);

  const sendInquiry = useCallback((subject: string, message?: string) => {
    openWhatsApp({ type: 'inquiry', subject, message });
  }, [openWhatsApp]);

  const sendSubscriptionMessage = useCallback((planName: string, price: number) => {
    openWhatsApp({ type: 'subscription', planName, price });
  }, [openWhatsApp]);

  const sendEventMessage = useCallback((eventName: string, date?: string) => {
    openWhatsApp({ type: 'event', eventName, date });
  }, [openWhatsApp]);

  const sendCartMessage = useCallback((items: CartItem[], total: number) => {
    openWhatsApp({ type: 'cart', items, total });
  }, [openWhatsApp]);

  const sendCustomMessage = useCallback((message: string) => {
    openWhatsApp({ type: 'custom', message });
  }, [openWhatsApp]);

  return {
    sendOrderMessage,
    sendInquiry,
    sendSubscriptionMessage,
    sendEventMessage,
    sendCartMessage,
    sendCustomMessage,
    openWhatsApp,
  };
}
