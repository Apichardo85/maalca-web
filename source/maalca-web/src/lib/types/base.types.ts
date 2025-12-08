/**
 * Base Types - Interfaces compartidas en todo el sistema
 *
 * Estos tipos proveen estructura común para audit trails, metadatos, etc.
 */

/**
 * Entidad base con campos de auditoría
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // User ID o system
  updatedBy?: string;
  affiliateId: string; // Multi-tenant: a qué afiliado pertenece
}

/**
 * Metadata opcional para entidades
 */
export interface EntityMetadata {
  tags?: string[];
  notes?: string;
  customFields?: Record<string, unknown>;
}

/**
 * Información de contacto reutilizable
 */
export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  preferredContact?: 'email' | 'phone' | 'sms' | 'whatsapp';
}

/**
 * Dirección física
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Moneda y valores monetarios
 */
export interface Money {
  amount: number;
  currency: string; // USD, DOP, EUR, etc.
}

/**
 * Rango de tiempo
 */
export interface TimeRange {
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  estimatedDuration?: number; // En minutos
}

/**
 * Información de usuario que realizó una acción
 */
export interface Actor {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
}

/**
 * Historial de cambios de estado
 */
export interface StatusChange<T = string> {
  id: string;
  fromStatus: T;
  toStatus: T;
  timestamp: string;
  changedBy: Actor;
  reason?: string;
}

/**
 * Notificación/Comunicación enviada
 */
export interface NotificationRecord {
  id: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  recipient: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  template?: string;
}
