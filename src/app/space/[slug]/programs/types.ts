// "Programas" -- rediseno backlog 2026-09-26 (ver CommunityProgram.cs en maalca-api). Entidad
// propia, ya no la tabla Services del catalogo generico con Precio relabeled.
export interface CommunityProgram {
  id: string;
  title: string;
  titleEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  imageUrl?: string | null;
  goalAmount?: number | null;
  capacity?: number | null;
  schedule?: string | null;
  weekDays?: string | null;
  volunteersNeeded?: number | null;
  isActive: boolean;
  sortOrder: number;
}
