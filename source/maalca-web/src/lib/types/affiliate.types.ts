export interface Affiliate {
  id: string;
  name: string;
  description: string;
  category: AffiliateCategory;
  status: AffiliateStatus;
  logo: string;
  website?: string;
  contact: AffiliateContact;
  services: string[];
  locations: string[];
  partnership: PartnershipDetails;
  metrics?: AffiliateMetrics;
  certifications?: string[];
  socialMedia?: SocialMediaLinks;
}

export type AffiliateCategory =
  | "proveedor-ingredientes"
  | "equipamiento-cocina"
  | "decoracion-eventos"
  | "logistica-transporte"
  | "venues-espacios"
  | "fotografia-video"
  | "mobiliario-eventos"
  | "floreria-plantas"
  | "vinos-bebidas"
  | "tecnologia-eventos"
  | "limpieza-mantenimiento"
  | "seguros-eventos"
  | "comunicacion-visual-diseno";

export type AffiliateStatus = 
  | "active" 
  | "preferred" 
  | "premium" 
  | "inactive" 
  | "pending";

export interface AffiliateContact {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city: string;
  country: string;
}

export interface PartnershipDetails {
  type: "supplier" | "vendor" | "strategic" | "franchise";
  since: Date;
  contractType: "exclusive" | "non-exclusive" | "preferred";
  commissionRate?: number;
  minimumOrder?: number;
  paymentTerms: string;
  renewalDate?: Date;
}

export interface AffiliateMetrics {
  projectsCompleted: number;
  averageRating: number;
  responseTime: number; // hours
  reliabilityScore: number; // 0-100
  costEfficiency: number; // 0-100
  lastProjectDate?: Date;
}

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  website?: string;
}

export interface AffiliateFilter {
  category?: AffiliateCategory;
  status?: AffiliateStatus;
  location?: string;
  rating?: number;
  services?: string[];
}