// Appointment Scheduling Service
import { apiClient } from '@/lib/api/apiClient';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  barberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListResponse {
  data: Appointment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateAppointmentDto {
  customerId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  preferredBarberId?: string;
}

export interface UpdateAppointmentStatusDto {
  status: AppointmentStatus;
}

class AppointmentService {
  /**
   * List appointments with filters
   * WEB-008: Listar citas desde API
   */
  async list(
    affiliateId: string,
    options: { page?: number; date?: string; status?: string } = {}
  ): Promise<AppointmentListResponse | null> {
    try {
      const params = new URLSearchParams();
      if (options.page) params.set('page', String(options.page));
      if (options.date) params.set('date', options.date);
      if (options.status) params.set('status', options.status);

      const response = await apiClient.get<AppointmentListResponse>(
        `/api/affiliates/${affiliateId}/appointments?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return null;
    }
  }

  /**
   * Get a single appointment by ID
   */
  async get(affiliateId: string, appointmentId: string): Promise<Appointment | null> {
    try {
      const response = await apiClient.get<Appointment>(
        `/api/affiliates/${affiliateId}/appointments/${appointmentId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching appointment ${appointmentId}:`, error);
      return null;
    }
  }

  /**
   * Create a new appointment
   * WEB-009: Crear cita via API
   */
  async create(affiliateId: string, data: CreateAppointmentDto): Promise<Appointment | null> {
    try {
      const response = await apiClient.post<Appointment>(
        `/api/affiliates/${affiliateId}/appointments`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating appointment:', error);
      return null;
    }
  }

  /**
   * Update appointment status
   * WEB-010: Actualizar estado de cita
   */
  async updateStatus(
    affiliateId: string,
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<Appointment | null> {
    try {
      const response = await apiClient.patch<Appointment>(
        `/api/affiliates/${affiliateId}/appointments/${appointmentId}`,
        { status }
      );
      return response;
    } catch (error) {
      console.error(`Error updating appointment ${appointmentId} status:`, error);
      return null;
    }
  }

  /**
   * Cancel an appointment
   */
  async cancel(affiliateId: string, appointmentId: string): Promise<boolean> {
    return (await this.updateStatus(affiliateId, appointmentId, 'cancelled')) !== null;
  }
}

export const appointmentService = new AppointmentService();
