/**
 * Types for Appointments module
 * Manages scheduling and booking for services
 */

import { TenantEntity, ContactInfo, PaginationParams } from "./common";

/**
 * Appointment status lifecycle
 */
export type AppointmentStatus =
  | "scheduled"   // Appointment is scheduled and confirmed
  | "completed"   // Service was provided
  | "cancelled"   // Cancelled by customer or business
  | "no_show"     // Customer didn't show up
  | "rescheduled" // Appointment was rescheduled
  | "pending";    // Waiting for confirmation

/**
 * Service category for the appointment
 */
export type ServiceCategory =
  | "haircut"
  | "coloring"
  | "styling"
  | "treatment"
  | "consultation"
  | "other";

/**
 * Full appointment entity
 */
export interface Appointment extends TenantEntity {
  // Affiliate context (which business location)
  affiliateId?: string;

  // Customer information
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;

  // Appointment details
  serviceType: string;
  serviceCategory?: ServiceCategory;
  date: string; // ISO 8601 date-time
  duration?: number; // Duration in minutes
  status: AppointmentStatus;

  // Staff assignment
  assignedTo?: string; // Staff member ID or name

  // Additional information
  notes?: string;
  cancellationReason?: string;

  // Pricing
  estimatedPrice?: number;
  actualPrice?: number;

  // Reminders
  reminderSent?: boolean;
  reminderSentAt?: string;
}

/**
 * DTO for creating a new appointment
 */
export interface CreateAppointmentDto {
  tenantId: string;
  affiliateId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceType: string;
  serviceCategory?: ServiceCategory;
  date: string; // ISO 8601
  duration?: number;
  assignedTo?: string;
  notes?: string;
  estimatedPrice?: number;
}

/**
 * DTO for updating an existing appointment
 */
export interface UpdateAppointmentDto {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceType?: string;
  serviceCategory?: ServiceCategory;
  date?: string;
  duration?: number;
  status?: AppointmentStatus;
  assignedTo?: string;
  notes?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  cancellationReason?: string;
}

/**
 * Query parameters for filtering appointments
 */
export interface AppointmentQueryParams extends PaginationParams {
  tenantId?: string;
  affiliateId?: string;
  status?: AppointmentStatus;
  customerName?: string;
  dateFrom?: string; // ISO 8601 date
  dateTo?: string;   // ISO 8601 date
  assignedTo?: string;
  serviceCategory?: ServiceCategory;
}

/**
 * Appointment statistics for dashboard
 */
export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number; // Percentage
  noShowRate: number;     // Percentage
}

/**
 * Time slot availability
 */
export interface TimeSlot {
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  available: boolean;
  appointmentId?: string; // If slot is occupied
}

/**
 * Availability query result
 */
export interface AvailabilityResponse {
  date: string; // ISO 8601 date
  slots: TimeSlot[];
  businessHours: {
    open: string;  // Time format "HH:mm"
    close: string; // Time format "HH:mm"
  };
}
