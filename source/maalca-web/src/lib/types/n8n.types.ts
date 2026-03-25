// ── n8n Agent Board Integration Types ──

export type N8nEventType =
  | 'order.created'
  | 'order.updated'
  | 'reservation.created'
  | 'reservation.updated'
  | 'appointment.booked'
  | 'appointment.cancelled'
  | 'newsletter.subscribed'
  | 'contact.inquiry'
  | 'notification.push';

// Outbound: maalca-web → n8n
export interface N8nWebhookPayload<T = unknown> {
  event: N8nEventType;
  tenantId: string;
  timestamp: string;
  source: 'maalca-web';
  data: T;
  metadata?: {
    correlationId: string;
    userAgent?: string;
    ip?: string;
  };
}

// Inbound: n8n → maalca-web
export interface N8nInboundWebhook {
  event: string;
  tenantId: string;
  data: unknown;
  timestamp: string;
}

// ── Order payloads ──
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderPayload {
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  whatsappNumber: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  message?: string;
  estimatedTime?: number;
}

// ── Reservation payload ──
export interface ReservationPayload {
  customerName: string;
  customerPhone?: string;
  date: string;
  time: string;
  partySize: number;
  notes?: string;
}

// ── Newsletter payload ──
export interface NewsletterPayload {
  email: string;
  source: string;
}

// ── Appointment payload ──
export interface AppointmentPayload {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceType: string;
  date: string;
  time: string;
  duration?: number;
  notes?: string;
}

// ── Dashboard notification ──
export interface DashboardNotification {
  id: string;
  tenantId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// ── Service response ──
export interface N8nServiceResponse {
  success: boolean;
  correlationId: string;
  message?: string;
  error?: string;
}
