export interface CanalDto {
  id: string;
  tipo: string;
  metodo: string;
  valorCrudo: string;
  enlaceGenerado: string;
  nombreVisible: string | null;
  verificado: boolean;
  orden: number;
  activo: boolean;
}

export interface ProfileFormState {
  name: string;
  description: string;
  whatsapp: string;
  contactEmail: string;
  address: string;
  website: string;
  primaryColor: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
}

/** Fields only reachable via the public-profile fallback fetch — gated on load/touch before submit. */
export const GATED_FIELDS = ['description', 'logoUrl', 'coverImageUrl', 'contactEmail', 'address', 'website'] as const;
export type GatedField = typeof GATED_FIELDS[number];
