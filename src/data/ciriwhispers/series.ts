export interface Series {
  id: string;
  title: string;
  description: string;
  mood: string;
  storyIds: string[];
  status: 'active' | 'coming-soon';
}

export const series: Series[] = [
  {
    id: "amaranta",
    title: "Amaranta",
    description: "Una joven enfrenta el eco de una culpa heredada. Entre recuerdos prestados y voces que insisten en hablarle, descubre que amar tambien puede ser una forma de perdon.",
    mood: "dark",
    storyIds: ["amaranta-eco-culpa", "amaranta-voces-silencio"],
    status: "active",
  },
  {
    id: "luces-sombras",
    title: "Luces & Sombras",
    description: "106 poemas que rozan la piel y la contradiccion: amor, perdida y el resplandor que solo se ve cuando todo oscurece.",
    mood: "poetic",
    storyIds: ["poema-eclipse", "poema-herida-abierta"],
    status: "active",
  },
  {
    id: "cosas-no-contar",
    title: "Cosas que no hay que contar",
    description: "Relatos de filo intimo. Historias que todos tienen pero nadie cuenta. Hasta ahora.",
    mood: "intimate",
    storyIds: ["bloqueado", "nevera-bebidas", "jardin-pelirroja"],
    status: "active",
  },
  {
    id: "cartas-hiedra",
    title: "Cartas a la Hiedra",
    description: "Correspondencia con lo que crece sin permiso. Cartas que no espera respuesta pero la necesitan.",
    mood: "intimate",
    storyIds: ["carta-01-no-vuelvas", "carta-02-invierno"],
    status: "active",
  },
  {
    id: "elmira-ny",
    title: "Elmira, NY",
    description: "Cronicas del exilio. La vida entre dos mundos, contada desde una ciudad que no te conoce.",
    mood: "urban",
    storyIds: [],
    status: "coming-soon",
  },
];
