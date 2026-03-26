/**
 * API client for Appointments module
 * Uses tenant-scoped URLs: /api/affiliates/{id}/appointments
 */

import { apiClient, affiliateUrl } from "./apiClient";
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryParams,
  AppointmentStats,
  AvailabilityResponse,
} from "../types/appointments";
import { PaginatedResponse } from "../types/common";

export const appointmentsApi = {
  async getAppointments(
    params?: AppointmentQueryParams
  ): Promise<PaginatedResponse<Appointment>> {
    return apiClient.get<PaginatedResponse<Appointment>>(
      affiliateUrl("/appointments"),
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  },

  async getAppointment(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(affiliateUrl(`/appointments/${id}`));
  },

  async createAppointment(payload: CreateAppointmentDto): Promise<Appointment> {
    return apiClient.post<Appointment, CreateAppointmentDto>(
      affiliateUrl("/appointments"),
      payload
    );
  },

  async updateAppointment(
    id: string,
    payload: UpdateAppointmentDto
  ): Promise<Appointment> {
    return apiClient.patch<Appointment, UpdateAppointmentDto>(
      affiliateUrl(`/appointments/${id}`),
      payload
    );
  },

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    return apiClient.patch<Appointment, { reason?: string; status: string }>(
      affiliateUrl(`/appointments/${id}`),
      { status: "cancelled", reason }
    );
  },

  async completeAppointment(
    id: string,
    actualPrice?: number
  ): Promise<Appointment> {
    return apiClient.patch<Appointment, { status: string; actualPrice?: number }>(
      affiliateUrl(`/appointments/${id}`),
      { status: "completed", actualPrice }
    );
  },

  async markNoShow(id: string): Promise<Appointment> {
    return apiClient.patch<Appointment, { status: string }>(
      affiliateUrl(`/appointments/${id}`),
      { status: "no-show" }
    );
  },

  async deleteAppointment(id: string): Promise<void> {
    return apiClient.delete<void>(affiliateUrl(`/appointments/${id}`));
  },

  async getStats(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<AppointmentStats> {
    return apiClient.get<AppointmentStats>(affiliateUrl("/metrics"), {
      params: { dateFrom, dateTo },
    });
  },

  async getAvailability(
    date: string,
    affiliateId?: string,
    duration?: number
  ): Promise<AvailabilityResponse> {
    return apiClient.get<AvailabilityResponse>(
      affiliateUrl("/appointments/availability", affiliateId),
      { params: { date, duration } }
    );
  },

  async sendReminder(id: string): Promise<void> {
    return apiClient.post<void, Record<string, never>>(
      affiliateUrl(`/appointments/${id}/reminder`),
      {}
    );
  },
};
