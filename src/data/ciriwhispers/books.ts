export interface Book {
  id: string;
  title: string;
  titleKey: string;
  subtitle: string;
  subtitleKey: string;
  synopsisKey: string;
  cover: string;
  statusKey: string;
  amazonLink: string;
  hasEpub: boolean;
  epubUrl?: string;
  hasSimpleReader: boolean;
  excerptKey: string;
  year: string;
  tagsKey: string;
  notes: string;
  sensitiveTopics?: string[];
}

export const books: Book[] = [
  {
    id: "amaranta",
    titleKey: "ciriwhispers.book.amaranta.title",
    title: "Amaranta",
    subtitle: "Thriller psicologico",
    subtitleKey: "ciriwhispers.book.amaranta.subtitle",
    synopsisKey: "ciriwhispers.book.amaranta.synopsis",
    cover: "/images/books/amaranta.jpg",
    statusKey: "ciriwhispers.works.status.available",
    amazonLink: "https://www.amazon.com/Amaranta-Ciriaco-Alejandro-Pichardo-Santana/dp/841915122X",
    hasEpub: true,
    epubUrl: "/books/amaranta.epub",
    hasSimpleReader: true,
    excerptKey: "ciriwhispers.book.amaranta.excerpt",
    year: "2024",
    tagsKey: "ciriwhispers.book.amaranta.tags",
    notes: "Lectura inmersiva disponible - Version demo del contenido original.",
    sensitiveTopics: ["traumaFamiliar", "duelo", "temasPsicologicos"],
  },
  {
    id: "luz-sombras",
    titleKey: "ciriwhispers.book.luzsombras.title",
    title: "Luces & Sombras",
    subtitle: "Poemario narrativo",
    subtitleKey: "ciriwhispers.book.luzsombras.subtitle",
    synopsisKey: "ciriwhispers.book.luzsombras.synopsis",
    cover: "/images/books/luz-sombras.jpg",
    statusKey: "ciriwhispers.works.status.available",
    amazonLink: "https://www.amazon.com/Luces-Sombras-Spanish-ebook/dp/B084M8356R",
    hasEpub: true,
    epubUrl: "/books/luces-sombras.epub",
    hasSimpleReader: true,
    excerptKey: "ciriwhispers.book.luzsombras.excerpt",
    year: "2023",
    tagsKey: "ciriwhispers.book.luzsombras.tags",
    notes: "Seleccion representativa de los 106 poemas originales.",
  },
  {
    id: "cartas-hiedra",
    titleKey: "ciriwhispers.book.cartashiedra.title",
    title: "Cartas a la Hiedra",
    subtitle: "Coleccion epistolar",
    subtitleKey: "ciriwhispers.book.cartashiedra.subtitle",
    synopsisKey: "ciriwhispers.book.cartashiedra.synopsis",
    cover: "/images/books/cartas-hiedra.png",
    statusKey: "ciriwhispers.works.status.inProgress",
    amazonLink: "#",
    hasEpub: false,
    hasSimpleReader: false,
    excerptKey: "ciriwhispers.book.cartashiedra.excerpt",
    year: "2024",
    tagsKey: "ciriwhispers.book.cartashiedra.tags",
    notes: "30 cartas visibles (muestras selectas).",
  },
  {
    id: "cosas-no-contar",
    titleKey: "ciriwhispers.book.cosasnocontar.title",
    title: "Cosas que no hay que contar",
    subtitle: "Relatos de filo intimo",
    subtitleKey: "ciriwhispers.book.cosasnocontar.subtitle",
    synopsisKey: "ciriwhispers.book.cosasnocontar.synopsis",
    cover: "/images/books/cosas-no-contar.jpg",
    statusKey: "ciriwhispers.works.status.development",
    amazonLink: "#",
    hasEpub: false,
    hasSimpleReader: false,
    excerptKey: "ciriwhispers.book.cosasnocontar.excerpt",
    year: "2025",
    tagsKey: "ciriwhispers.book.cosasnocontar.tags",
    notes: "En progreso: Bloqueado, La nevera de las bebidas, El jardin y la pelirroja.",
  },
  {
    id: "elmira-ny",
    titleKey: "ciriwhispers.book.elmirarny.title",
    title: "Elmira, NY",
    subtitle: "Cronicas del exilio",
    subtitleKey: "ciriwhispers.book.elmirarny.subtitle",
    synopsisKey: "ciriwhispers.book.elmirarny.synopsis",
    cover: "/images/books/elmira-ny.svg",
    statusKey: "ciriwhispers.works.status.development",
    amazonLink: "#",
    hasEpub: false,
    hasSimpleReader: false,
    excerptKey: "ciriwhispers.book.elmirarny.excerpt",
    year: "2025",
    tagsKey: "ciriwhispers.book.elmirarny.tags",
    notes: "Vista separada Cronica/Ficcion y mapa poetico interactivo.",
  },
  {
    id: "ramirito",
    titleKey: "ciriwhispers.book.ramirito.title",
    title: "Ramirito",
    subtitle: "Memoria y estigma",
    subtitleKey: "ciriwhispers.book.ramirito.subtitle",
    synopsisKey: "ciriwhispers.book.ramirito.synopsis",
    cover: "/images/books/ramirito.svg",
    statusKey: "ciriwhispers.works.status.development",
    amazonLink: "#",
    hasEpub: false,
    hasSimpleReader: false,
    excerptKey: "ciriwhispers.book.ramirito.excerpt",
    year: "2025",
    tagsKey: "ciriwhispers.book.ramirito.tags",
    notes: "Incluye aviso breve de temas sensibles.",
    sensitiveTopics: ["violencia", "prision", "estigmaSocial"],
  },
];

export function getBookById(id: string): Book | undefined {
  return books.find((b) => b.id === id);
}
