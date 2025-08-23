// Projects
export { 
  projects, 
  getProjectsByCategory, 
  getProjectsByStatus, 
  getFeaturedProjects, 
  getProjectById 
} from "./projects";

// Affiliates
export { 
  affiliates, 
  getAffiliatesByCategory, 
  getAffiliatesByStatus, 
  getPremiumAffiliates, 
  getAffiliateById, 
  getTopRatedAffiliates 
} from "./affiliates";

// Services
export { 
  servicePackages, 
  getServicesByCategory, 
  getPopularServices, 
  getPremiumServices, 
  getServiceById 
} from "./services";

export type { ServicePackage, ServiceAddOn } from "./services";