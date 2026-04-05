export type StoryType = 'microcuento' | 'fragmento' | 'carta' | 'poema' | 'capitulo';

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  type: StoryType;
  series?: string;
  tags: string[];
  readTime: number;
  isFree: boolean;
  publishedAt: string;
}

export const stories: Story[] = [
  // --- Fragmentos de Amaranta ---
  {
    id: "amaranta-eco-culpa",
    title: "El Eco de una Culpa",
    excerpt: "En la penumbra de su memoria, Amaranta encontro las palabras que nunca pudo decir en vida. La casa respiraba con el peso de los secretos...",
    content: `<p>En la penumbra de su memoria, Amaranta encontro las palabras que nunca pudo decir en vida. La casa respiraba con el peso de los secretos, y cada rincon guardaba el eco de una culpa que se transmitia como herencia maldita.</p>
<p>Era una tarde de octubre cuando todo cambio. El viento arrastraba las hojas secas por el patio, creando una sinfonia melancolica que parecia narrar su propia historia. Amaranta, de apenas diecisiete anos, no sabia que ese dia marcaria el inicio de su descenso hacia el laberinto de su propia consciencia.</p>
<p>La carta llego esa manana, sellada con cera roja y con una caligrafia que le resultaba familiar pero que no lograba ubicar. Sus manos temblaron al abrirla, y las palabras que leyo la trasladaron a un pasado que creia enterrado.</p>
<blockquote>"Las deudas del alma se pagan con lagrimas, y las tuyas, querida Amaranta, apenas han comenzado a caer."</blockquote>
<p>No habia firma, pero no la necesitaba. Sabia exactamente de quien venian esas palabras. La voz de su abuela resonaba en cada linea, como si desde el mas alla le recordara que algunos fantasmas nunca descansan.</p>`,
    type: "fragmento",
    series: "amaranta",
    tags: ["thriller", "familia", "secretos", "herencia"],
    readTime: 3,
    isFree: true,
    publishedAt: "2024-06-15",
  },
  {
    id: "amaranta-voces-silencio",
    title: "Voces en el Silencio",
    excerpt: "Las noches se habian vuelto territorio de voces que nadie mas podia escuchar. Amaranta despertaba sobresaltada, creyendo haber oido su nombre...",
    content: `<p>Las noches se habian vuelto territorio de voces que nadie mas podia escuchar. Amaranta despertaba sobresaltada, creyendo haber oido su nombre susurrado entre las sombras de su habitacion.</p>
<p>Era siempre la misma voz: grave, melancolica, cargada de una tristeza que parecia habitar en los rincones mas oscuros de la casa. Una voz que conocia desde la infancia, pero que ahora la llamaba con una urgencia nueva, desesperada.</p>
<p>Se levantaba de la cama y recorria los pasillos descalza, siguiendo el eco que la guiaba hacia el desvan. Alli, entre cajas de recuerdos y muebles cubiertos por sabanas, encontraba siempre el mismo diario abierto en paginas diferentes.</p>
<blockquote>"Hay amores que son condena, y yo he sido condenada a amar a quien no debia. Mi hija pagara por mis pecados, como yo pague por los de mi madre."</blockquote>
<p>Amaranta cerro el diario con manos temblorosas. Ahora entendia por que las cartas, por que las voces, por que esa sensacion constante de estar pagando una deuda que no habia contraido.</p>`,
    type: "fragmento",
    series: "amaranta",
    tags: ["thriller", "voces", "misterio", "diario"],
    readTime: 3,
    isFree: true,
    publishedAt: "2024-07-01",
  },

  // --- Poemas de Luces & Sombras ---
  {
    id: "poema-eclipse",
    title: "Eclipse",
    excerpt: "Hay luces que solo brillan en la oscuridad mas absoluta, como las estrellas que nacen del vacio...",
    content: `<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Hay luces que solo brillan<br/>en la oscuridad mas absoluta,<br/>como las estrellas que nacen del vacio<br/>y los besos que nacen del llanto.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Tu fuiste mi eclipse:<br/>la sombra que me ensenno<br/>a buscar la luz<br/>en los rincones<br/>donde nadie mira.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Y ahora que te has ido,<br/>brillo con la fuerza<br/>de quien aprendio<br/>que la oscuridad<br/>no es ausencia de luz...<br/>es su origen.</p>`,
    type: "poema",
    series: "luces-sombras",
    tags: ["amor", "perdida", "luz", "oscuridad"],
    readTime: 1,
    isFree: true,
    publishedAt: "2023-03-10",
  },
  {
    id: "poema-herida-abierta",
    title: "Herida Abierta",
    excerpt: "No me pidas que cierre esta herida. Es lo unico que me queda de ti...",
    content: `<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">No me pidas que cierre esta herida.<br/>Es lo unico que me queda de ti.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Cada noche la abro un poco mas,<br/>como quien abre un libro viejo<br/>buscando la pagina<br/>donde todo tenia sentido.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Me dijeron que el tiempo cura.<br/>Mintieron.<br/>El tiempo solo te ensena<br/>a sangrar en silencio.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Pero esta herida es mia,<br/>y mientras duela,<br/>se que sigo vivo.</p>`,
    type: "poema",
    series: "luces-sombras",
    tags: ["dolor", "memoria", "resistencia"],
    readTime: 1,
    isFree: true,
    publishedAt: "2023-05-22",
  },

  // --- Microcuentos de Cosas que no hay que contar ---
  {
    id: "bloqueado",
    title: "Bloqueado",
    excerpt: "Le bloquee el numero. No porque no lo quisiera, sino porque cada vez que sonaba el telefono...",
    content: `<p>Le bloquee el numero. No porque no lo quisiera, sino porque cada vez que sonaba el telefono, mi corazon se detenia un segundo antes de responder. Y ese segundo me estaba matando mas que su silencio.</p>
<p>El ultimo mensaje decia: "Perdoname". Dos palabras. Siete letras. Una vida entera comprimida en un rectangulo azul de luz.</p>
<p>Lo lei diecisiete veces. Lo se porque conte. Diecisiete veces busque entre esas dos palabras algo que no estaba: una explicacion, una promesa, un futuro.</p>
<p>Despues lo bloquee.</p>
<p>No porque no lo quisiera. Sino porque quererlo se habia convertido en un habito mas peligroso que cualquier vicio. Y yo necesitaba dejar de intoxicarme con alguien que solo sabia pedir perdon despues de romperme.</p>`,
    type: "microcuento",
    tags: ["relaciones", "ruptura", "decision", "autoproteccion"],
    readTime: 2,
    isFree: true,
    publishedAt: "2025-01-10",
  },
  {
    id: "nevera-bebidas",
    title: "La Nevera de las Bebidas",
    excerpt: "En casa de abuela habia una nevera vieja que solo servia para las bebidas. Nadie la limpiaba...",
    content: `<p>En casa de abuela habia una nevera vieja que solo servia para las bebidas. Nadie la limpiaba. Nadie la movia. Estaba ahi desde antes de que yo naciera, zumbando en la esquina de la cocina como un animal dormido.</p>
<p>Los adultos la abrian para sacar cerveza, jugo de chinola, agua fria. Nosotros los ninos la abriamos para robar malta cuando nadie miraba.</p>
<p>Abuela murio un martes. La casa se lleno de gente, de llantos, de comida que nadie habia pedido. Y yo, con doce anos y un vacio que no sabia nombrar, fui a la cocina.</p>
<p>Abri la nevera.</p>
<p>Estaba llena. Como siempre. Como si ella siguiera ahi, asegurandose de que nadie pasara sed en su casa. Habia una malta India al fondo, detras de las Presidente. La agarre. Estaba helada.</p>
<p>Me la tome sentado en el piso de la cocina, con la espalda contra la nevera, sintiendo su vibracion en los huesos. Y llore. No por abuela. Por la nevera. Porque sabia que alguien la desenchufaria pronto, y entonces si seria verdad que ella se habia ido.</p>`,
    type: "microcuento",
    tags: ["familia", "duelo", "infancia", "nostalgia", "dominicano"],
    readTime: 2,
    isFree: true,
    publishedAt: "2025-02-14",
  },
  {
    id: "jardin-pelirroja",
    title: "El Jardin y la Pelirroja",
    excerpt: "La vi por primera vez en el jardin de la biblioteca publica. Leia un libro que no tenia titulo en el lomo...",
    content: `<p>La vi por primera vez en el jardin de la biblioteca publica. Leia un libro que no tenia titulo en el lomo. El pelo le caia como fuego sobre los hombros.</p>
<p>Me sente en el banco de enfrente. Abri mi cuaderno. Fingi escribir. En realidad la estaba dibujando con palabras que nunca usaria.</p>
<p>Volvio el jueves. Y el siguiente. Siempre a las tres. Siempre el mismo libro sin titulo. Siempre sola.</p>
<p>Un dia me miro. No sonrio. Solo me miro, como quien reconoce a alguien que ha visto en un sueno. Despues volvio a su libro.</p>
<p>Escribi: "La pelirroja del jardin me miro hoy. Creo que me reconocio de una vida que aun no hemos vivido."</p>
<p>No volvio.</p>
<p>Espere tres jueves. Cuatro. El quinto me sente en su banco. Habia un papel doblado debajo de una piedra. Decia, con letra pequena y torcida:</p>
<blockquote>"Deja de buscarme. Nos encontraremos cuando el jardin florezca otra vez."</blockquote>
<p>Mire alrededor. Las rosas estaban muertas. Era noviembre.</p>
<p>Llevo cinco primaveras volviendo a ese banco.</p>`,
    type: "microcuento",
    tags: ["amor", "misterio", "obsesion", "espera"],
    readTime: 2,
    isFree: true,
    publishedAt: "2025-03-01",
  },

  // --- Cartas a la Hiedra ---
  {
    id: "carta-01-no-vuelvas",
    title: "Carta I: No Vuelvas",
    excerpt: "Querida hiedra: no vuelvas a crecer por mi pared. Ya no tengo fuerza para arrancarte...",
    content: `<p>Querida hiedra:</p>
<p>No vuelvas a crecer por mi pared. Ya no tengo fuerza para arrancarte, y cada vez que lo intento, te llevas un pedazo de ladrillo. Un pedazo de mi.</p>
<p>Se que no es tu culpa. Tu naturaleza es aferrarte. La mia es dejar que me cubran cosas que deberia haber cortado a tiempo.</p>
<p>Pero esta carta no es un reclamo. Es una confesion: me gusta que estes ahi. Me gusta que cada manana, cuando abro la ventana, seas lo primero que veo. Verde. Insistente. Viva.</p>
<p>Eres todo lo que yo no soy en este momento.</p>
<p>Asi que quédate. Pero no vuelvas a tocar la ventana. Ese es mi limite. Detras de ese cristal esta todo lo que no quiero que veas.</p>
<p style="text-align:right;font-style:italic;">Con algo parecido al carino,<br/>C.</p>`,
    type: "carta",
    series: "cartas-hiedra",
    tags: ["intimidad", "limites", "naturaleza", "confesion"],
    readTime: 2,
    isFree: true,
    publishedAt: "2024-09-01",
  },
  {
    id: "carta-02-invierno",
    title: "Carta II: Invierno",
    excerpt: "Hiedra: hoy nevó por primera vez desde que llegue a esta ciudad. Todo esta blanco, menos tu...",
    content: `<p>Hiedra:</p>
<p>Hoy nevo por primera vez desde que llegue a esta ciudad. Todo esta blanco, menos tu. Tu sigues ahi, seca, marron, aferrada a la pared como si supiera que la primavera va a volver.</p>
<p>Yo no estoy tan seguro.</p>
<p>El frio de Elmira no se parece a nada que haya sentido antes. No es el frio del aire acondicionado en Santo Domingo, ni el fresco de la montana en Jarabacoa. Este frio entra por los huesos y se queda. Como la nostalgia. Como el arrepentimiento.</p>
<p>Hoy camine hasta la biblioteca. No habia nadie. Solo yo y el silencio de una ciudad que no me conoce. Pense en ti, hiedra. Pense en que los dos estamos lejos de donde nacimos, aguantando un invierno que no elegimos.</p>
<p>Pero tu no te quejas. Tu solo esperas.</p>
<p>Quizas deberia aprender eso de ti.</p>
<p style="text-align:right;font-style:italic;">Desde el frio,<br/>C.</p>`,
    type: "carta",
    series: "cartas-hiedra",
    tags: ["exilio", "invierno", "soledad", "elmira", "nostalgia"],
    readTime: 2,
    isFree: true,
    publishedAt: "2024-11-15",
  },
];

export const storyTypes: { key: StoryType; label: string; emoji: string }[] = [
  { key: "microcuento", label: "Microcuentos", emoji: "flash" },
  { key: "fragmento", label: "Fragmentos", emoji: "book" },
  { key: "poema", label: "Poemas", emoji: "feather" },
  { key: "carta", label: "Cartas", emoji: "envelope" },
  { key: "capitulo", label: "Capitulos", emoji: "bookmark" },
];

export function getStoriesByType(type?: StoryType): Story[] {
  if (!type) return stories;
  return stories.filter((s) => s.type === type);
}

export function getStoryById(id: string): Story | undefined {
  return stories.find((s) => s.id === id);
}
