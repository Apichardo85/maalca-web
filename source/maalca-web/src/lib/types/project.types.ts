export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  features: string[];
  technologies: string[];
  images: ProjectImage[];
  startDate: Date;
  completionDate?: Date;
  client?: string;
  location?: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  team: TeamMember[];
  metrics?: ProjectMetrics;
  tags: string[];
}

export type ProjectCategory = 
  | "catering-premium"
  | "eventos-corporativos" 
  | "bodas-luxury"
  | "catering-masivo"
  | "consultoria-gastronomica"
  | "desarrollo-productos"
  | "franquicias"
  | "real-estate";

export type ProjectStatus = 
  | "planning" 
  | "in-progress" 
  | "completed" 
  | "on-hold" 
  | "cancelled";

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  type: "hero" | "gallery" | "process" | "result";
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface ProjectMetrics {
  guestsServed?: number;
  eventsCompleted?: number;
  satisfactionScore?: number;
  revenueGenerated?: number;
  mediaImpression?: number;
}

export interface ProjectFilter {
  category?: ProjectCategory;
  status?: ProjectStatus;
  startYear?: number;
  minBudget?: number;
  maxBudget?: number;
  tags?: string[];
}