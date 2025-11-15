import { Affiliate, AffiliateCategory, AffiliateStatus } from "@/lib/types";

export const affiliates: Affiliate[] = [
  {
    id: "dr-pichardo",
    name: "Dr. Pichardo",
    description: "Médico internista comprometido con la atención médica humanizada y accesible. Medicina solidaria basada en donaciones según capacidad económica.",
    category: "comunicacion-visual-diseno",
    status: "active",
    logo: "/images/affiliates/dr-pichardo-logo.png",
    website: "/dr-pichardo",
    contact: {
      name: "Dr. José Francisco Pichardo Pantaleón",
      email: "consultas@drpichardo.com",
      phone: "+1 809 555 0123",
      address: "Av. Sarasota #45, Bella Vista",
      city: "Santo Domingo",
      country: "República Dominicana"
    },
    services: [
      "Consulta presencial de medicina interna",
      "Teleconsulta médica virtual",
      "Consultas de urgencia 24/7",
      "Jornadas de salud comunitaria",
      "Screening de diabetes e hipertensión"
    ],
    locations: ["Santo Domingo"],
    partnership: {
      type: "strategic",
      since: new Date("2024-01-01"),
      contractType: "non-exclusive",
      commissionRate: 0,
      paymentTerms: "Según proyecto"
    },
    metrics: {
      projectsCompleted: 0,
      averageRating: 0,
      responseTime: 24,
      reliabilityScore: 100,
      costEfficiency: 95
    },
    certifications: [
      "Médico internista certificado",
      "Medicina solidaria"
    ],
    socialMedia: {}
  },
  {
    id: "pegote-barbershop",
    name: "Pegote Barbershop",
    description: "Barbería dominicana en Elmira, NY. Cortes modernos con técnicas tradicionales, ambiente familiar y atención de primera clase.",
    category: "comunicacion-visual-diseno",
    status: "active",
    logo: "/images/affiliates/pegote-logo.png",
    website: "/pegote-barber",
    contact: {
      name: "Pegote Team",
      email: "contacto@pegotebarbershop.com",
      phone: "+1 607 000 0000",
      address: "Elmira, NY",
      city: "Elmira",
      country: "Estados Unidos"
    },
    services: [
      "Cortes de cabello modernos",
      "Afeitado tradicional",
      "Diseño de barba",
      "Tratamientos capilares",
      "Atención personalizada"
    ],
    locations: ["Elmira, NY"],
    partnership: {
      type: "strategic",
      since: new Date("2024-01-01"),
      contractType: "non-exclusive",
      commissionRate: 0,
      paymentTerms: "Según proyecto"
    },
    metrics: {
      projectsCompleted: 0,
      averageRating: 0,
      responseTime: 24,
      reliabilityScore: 100,
      costEfficiency: 95
    },
    certifications: [
      "Barbería profesional",
      "Técnicas tradicionales"
    ],
    socialMedia: {
      instagram: "https://www.instagram.com/pegotebarbershop"
    }
  },
  {
    id: "britocolor",
    name: "BritoColor",
    description: "Taller dominicano especializado en comunicación visual, impresión digital y pintura artesanal para madera. Transformamos espacios comerciales con color, diseño y acabados personalizados de alta calidad.",
    category: "comunicacion-visual-diseno",
    status: "active",
    logo: "/images/affiliates/britocolor-logo.png",
    website: "https://www.instagram.com/britocolor",
    contact: {
      name: "Edvan Brito (La Bola)",
      email: "contacto@britocolor.com",
      phone: "+1 829 996 8601",
      address: "Santo Domingo Este",
      city: "Santo Domingo",
      country: "República Dominicana"
    },
    services: [
      "Diseño e instalación de fachadas comerciales",
      "Fabricación de totems y señalética ACM",
      "Adhesivos corporativos y menús personalizados",
      "Impresión de banners y lonas publicitarias",
      "Rotulación profesional con plotter de corte",
      "Pintura artesanal y colores personalizados para madera"
    ],
    locations: ["Santo Domingo", "Distrito Nacional"],
    partnership: {
      type: "strategic",
      since: new Date("2025-01-12"),
      contractType: "non-exclusive",
      commissionRate: 0,
      paymentTerms: "Según proyecto",
      renewalDate: new Date("2026-01-12")
    },
    metrics: {
      projectsCompleted: 0,
      averageRating: 0,
      responseTime: 24,
      reliabilityScore: 100,
      costEfficiency: 95
    },
    certifications: [
      "Especialista en pintura para madera",
      "Rotulación profesional",
      "Diseño de comunicación visual"
    ],
    socialMedia: {
      instagram: "https://www.instagram.com/britocolor",
      website: "https://www.instagram.com/britocolor"
    }
  }
];

export const getAffiliatesByCategory = (category: AffiliateCategory): Affiliate[] => {
  return affiliates.filter(affiliate => affiliate.category === category);
};

export const getAffiliatesByStatus = (status: AffiliateStatus): Affiliate[] => {
  return affiliates.filter(affiliate => affiliate.status === status);
};

export const getPremiumAffiliates = (): Affiliate[] => {
  return affiliates.filter(affiliate => 
    affiliate.status === "premium" || affiliate.status === "preferred"
  );
};

export const getAffiliateById = (id: string): Affiliate | undefined => {
  return affiliates.find(affiliate => affiliate.id === id);
};

export const getTopRatedAffiliates = (limit: number = 5): Affiliate[] => {
  return affiliates
    .filter(affiliate => affiliate.metrics?.averageRating)
    .sort((a, b) => (b.metrics?.averageRating || 0) - (a.metrics?.averageRating || 0))
    .slice(0, limit);
};