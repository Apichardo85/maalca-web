/**
 * API client for Appointments module
 * Handles CRUD operations for appointment scheduling
 */

import { apiClient } from "./apiClient";
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryParams,
  AppointmentStats,
  AvailabilityResponse,
} from "../types/appointments";
import { PaginatedResponse } from "../types/common";

/**
 * Appointments API client
 * TODO: Wire these methods with UI components once backend is ready
 */
export const appointmentsApi = {
  /**
   * Get all appointments with optional filtering
   * @param params - Query parameters for filtering and pagination
   */
  async getAppointments(
    params?: AppointmentQueryParams
  ): Promise<PaginatedResponse<Appointment>> {
    return apiClient.get<PaginatedResponse<Appointment>>("/api/appointments", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
  },

  /**
   * Get a single appointment by ID
   * @param id - Appointment ID
   */
  async getAppointment(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/api/appointments/${id}`);
  },

  /**
   * Create a new appointment
   * @param payload - Appointment data
   */
  async createAppointment(payload: CreateAppointmentDto): Promise<Appointment> {
    return apiClient.post<Appointment, CreateAppointmentDto>(
      "/api/appointments",
      payload
    );
  },

  /**
   * Update an existing appointment
   * @param id - Appointment ID
   * @param payload - Updated appointment data
   */
  async updateAppointment(
    id: string,
    payload: UpdateAppointmentDto
  ): Promise<Appointment> {
    return apiClient.put<Appointment, UpdateAppointmentDto>(
      `/api/appointments/${id}`,
      payload
    );
  },

  /**
   * Cancel an appointment
   * @param id - Appointment ID
   * @param reason - Cancellation reason
   */
  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    return apiClient.patch<Appointment, { reason?: string }>(
      `/api/appointments/${id}/cancel`,
      { reason }
    );
  },

  /**
   * Mark appointment as completed
   * @param id - Appointment ID
   * @param actualPrice - Optional actual price charged
   */
  async completeAppointment(
    id: string,
    actualPrice?: number
  ): Promise<Appointment> {
    return apiClient.patch<Appointment, { actualPrice?: number }>(
      `/api/appointments/${id}/complete`,
      { actualPrice }
    );
  },

  /**
   * Mark appointment as no-show
   * @param id - Appointment ID
   */
  async markNoShow(id: string): Promise<Appointment> {
    return apiClient.patch<Appointment, Record<string, never>>(
      `/api/appointments/${id}/no-show`,
      {}
    );
  },

  /**
   * Delete an appointment
   * @param id - Appointment ID
   */
  async deleteAppointment(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/appointments/${id}`);
  },

  /**
   * Get appointment statistics for dashboard
   * @param tenantId - Tenant ID
   * @param dateFrom - Start date (ISO 8601)
   * @param dateTo - End date (ISO 8601)
   */
  async getStats(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<AppointmentStats> {
    return apiClient.get<AppointmentStats>("/api/appointments/stats", {
      params: { tenantId, dateFrom, dateTo },
    });
  },

  /**
   * Get available time slots for a specific date
   * @param date - Date to check (ISO 8601)
   * @param affiliateId - Affiliate ID (optional)
   * @param duration - Service duration in minutes (optional)
   */
  async getAvailability(
    date: string,
    affiliateId?: string,
    duration?: number
  ): Promise<AvailabilityResponse> {
    return apiClient.get<AvailabilityResponse>("/api/appointments/availability", {
      params: { date, affiliateId, duration },
    });
  },

  /**
   * Send reminder for an appointment
   * @param id - Appointment ID
   */
  async sendReminder(id: string): Promise<void> {
    return apiClient.post<void, Record<string, never>>(
      `/api/appointments/${id}/reminder`,
      {}
    );
  },
};
