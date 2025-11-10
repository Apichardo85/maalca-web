export interface EcosystemProject {
  id: string;
  title: string;
  description: string;
  category: string;
  color: "red" | "gray";
  active: boolean;
}

export const ecosystemProjects: EcosystemProject[] = [
  {
    id: "editorial-maalca",
    title: "Editorial MaalCa",
    description: "Publicaciones que exploran cultura, creatividad y sociedad",
    category: "Editorial",
    color: "red",
    active: true
  },
  {
    id: "ciriwhispers",
    title: "CiriWhispers",
    description: "Proyecto de contenido íntimo y conversaciones profundas",
    category: "Contenido",
    color: "gray",
    active: true
  },
  {
    id: "cirisonic",
    title: "CiriSonic",
    description: "Fábrica de contenido IA con automatización inteligente",
    category: "Fábrica IA",
    color: "red",
    active: true
  },
  {
    id: "hbm-podcast",
    title: "Hablando Mierda (HBM)",
    description: "Podcast y plataforma de conversaciones sin filtros",
    category: "Podcast",
    color: "red",
    active: false
  },
  {
    id: "masa-tina",
    title: "Cocina Tina",
    description: "Experiencias gastronómicas y catering premium",
    category: "Gastronomía",
    color: "gray",
    active: true
  },
  {
    id: "verde-prive",
    title: "Verde Privé",
    description: "Wellness y productos de bienestar integral",
    category: "Wellness",
    color: "red",
    active: false
  },
  {
    id: "maalca-properties",
    title: "MaalCa Properties",
    description: "Desarrollos inmobiliarios con visión creativa",
    category: "Real Estate",
    color: "gray",
    active: true
  }
];

// Helper function to get only active projects
export const getActiveEcosystemProjects = () => {
  return ecosystemProjects.filter(project => project.active);
};
