// Inscripciones de Comunidad (voluntarios y eventos) -- ver CommunitySignup.cs en maalca-api.
export interface Signup {
  id: string;
  kind: 'volunteer' | 'event';
  causaId?: string | null;
  activityId?: string | null;
  targetTitle: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  partySize: number;
  notes?: string | null;
  language: 'es' | 'en';
  status: 'New' | 'Confirmed' | 'Cancelled';
  createdAt: string;
}

export interface EventSummary {
  id: string;
  title: string;
  startsAt: string;
  capacity?: number | null;
}
