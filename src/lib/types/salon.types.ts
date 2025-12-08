// Salon/Room View Types for Real-time Chair Status

import { Barber } from "./queue.types";

export type ChairStatus = "available" | "occupied" | "cleaning" | "paused";

export interface ChairClient {
  name: string;
  service: string;
  startTime: string;
  estimatedEndTime?: string;
}

export interface Chair {
  id: string;
  name: string; // "Silla 1", "Estación A"
  barber?: Barber;
  currentClient?: ChairClient;
  status: ChairStatus;
  lastUpdated: string;
}

export interface SalonStats {
  totalChairs: number;
  occupiedChairs: number;
  availableChairs: number;
  peopleInQueue: number;
  averageWaitTimeMinutes: number;
}
