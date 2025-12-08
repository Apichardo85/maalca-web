// Queue Management Types for Barbershop Virtual Queue System

export type QueueStatus = "waiting" | "called" | "in_service" | "done" | "no_show";
export type QueueChannel = "walk_in" | "web" | "qr";

export interface QueueEntry {
  id: string;
  displayName: string;
  phone?: string;
  service: string;
  preferredBarberId?: string;
  preferredBarberName?: string;
  createdAt: string;
  estimatedTimeMinutes?: number;
  status: QueueStatus;
  channel: QueueChannel;
  notes?: string;
  position: number;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  specialty?: string;
  isAvailable: boolean;
  currentClient?: string;
}

export interface QueueStats {
  totalInQueue: number;
  averageWaitTimeMinutes: number;
  noShowsToday: number;
  servedToday: number;
}
