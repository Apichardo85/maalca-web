// Modulo Eventos/Actividades (backlog 2026-09-25) -- ver Activity.cs en maalca-api.
export interface Activity {
  id: string;
  title: string;
  titleEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
}
