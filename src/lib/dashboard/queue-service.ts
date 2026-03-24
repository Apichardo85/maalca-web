// Virtual Queue Service (Real-time)
import { apiClient } from '@/lib/api/apiClient';

export type QueueEntryStatus = 'waiting' | 'in_service' | 'completed' | 'no_show' | 'cancelled';

export interface QueueEntry {
  id: string;
  displayName: string;
  phone: string;
  serviceId: string;
  service: string;
  preferredBarberId?: string;
  preferredBarberName?: string;
  createdAt: string;
  estimatedTimeMinutes: number;
  status: QueueEntryStatus;
  channel: 'walk_in' | 'phone' | 'online';
  position: number;
}

export interface QueueListResponse {
  data: QueueEntry[];
  total: number;
}

export interface CreateQueueEntryDto {
  displayName: string;
  phone: string;
  serviceId: string;
  preferredBarberId?: string;
  notes?: string;
  channel?: 'walk_in' | 'phone' | 'online';
}

export interface UpdateQueueEntryDto {
  status?: QueueEntryStatus;
  barberId?: string;
}

class QueueService {
  /**
   * Get current queue for affiliate
   * WEB-013: Fetch cola
   */
  async getQueue(affiliateId: string): Promise<QueueListResponse | null> {
    try {
      const response = await apiClient.get<QueueListResponse>(
        `/api/affiliates/${affiliateId}/queue`
      );
      return response;
    } catch (error) {
      console.error('Error fetching queue:', error);
      return null;
    }
  }

  /**
   * Add entry to queue
   * WEB-014: Agregar entrada a la cola
   */
  async addToQueue(affiliateId: string, data: CreateQueueEntryDto): Promise<QueueEntry | null> {
    try {
      const response = await apiClient.post<QueueEntry>(
        `/api/affiliates/${affiliateId}/queue`,
        data
      );
      return response;
    } catch (error) {
      console.error('Error adding to queue:', error);
      return null;
    }
  }

  /**
   * Update queue entry status
   * WEB-015: Actualizar estado de entrada en cola
   */
  async updateEntry(
    affiliateId: string,
    entryId: string,
    data: UpdateQueueEntryDto
  ): Promise<QueueEntry | null> {
    try {
      const response = await apiClient.patch<QueueEntry>(
        `/api/affiliates/${affiliateId}/queue/${entryId}`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error updating queue entry ${entryId}:`, error);
      return null;
    }
  }

  /**
   * Call next customer
   */
  async callNext(affiliateId: string, barberId: string): Promise<QueueEntry | null> {
    return this.updateEntry(affiliateId, '', { status: 'in_service', barberId });
  }
}

export const queueService = new QueueService();
