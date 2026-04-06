export type StoryType = 'microcuento' | 'fragmento' | 'carta' | 'poema' | 'capitulo';

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: { es: string; en: string };
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
    content: {
      es: `<p>En la penumbra de su memoria, Amaranta encontro las palabras que nunca pudo decir en vida. La casa respiraba con el peso de los secretos, y cada rincon guardaba el eco de una culpa que se transmitia como herencia maldita.</p>
<p>Era una tarde de octubre cuando todo cambio. El viento arrastraba las hojas secas por el patio, creando una sinfonia melancolica que parecia narrar su propia historia. Amaranta, de apenas diecisiete anos, no sabia que ese dia marcaria el inicio de su descenso hacia el laberinto de su propia consciencia.</p>
<p>La carta llego esa manana, sellada con cera roja y con una caligrafia que le resultaba familiar pero que no lograba ubicar. Sus manos temblaron al abrirla, y las palabras que leyo la trasladaron a un pasado que creia enterrado.</p>
<blockquote>"Las deudas del alma se pagan con lagrimas, y las tuyas, querida Amaranta, apenas han comenzado a caer."</blockquote>
<p>No habia firma, pero no la necesitaba. Sabia exactamente de quien venian esas palabras. La voz de su abuela resonaba en cada linea, como si desde el mas alla le recordara que algunos fantasmas nunca descansan.</p>`,
      en: `<p>In the shadows of her memory, Amaranta found the words she could never say in life. The house breathed with the weight of secrets, and every corner held the echo of a guilt passed down like a cursed inheritance.</p>
<p>It was an October afternoon when everything changed. The wind dragged dry leaves across the patio, creating a melancholic symphony that seemed to narrate her own story. Amaranta, barely seventeen, didn't know that day would mark the beginning of her descent into the labyrinth of her own consciousness.</p>
<p>The letter arrived that morning, sealed with red wax and written in handwriting that seemed familiar but she couldn't quite place. Her hands trembled as she opened it, and the words she read transported her to a past she thought was buried.</p>
<blockquote>"The debts of the soul are paid with tears, and yours, dear Amaranta, have only just begun to fall."</blockquote>
<p>There was no signature, but she didn't need one. She knew exactly whose words those were. Her grandmother's voice resonated in every line, as if from beyond the grave she was reminding her that some ghosts never rest.</p>`,
    },
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
    content: {
      es: `<p>Las noches se habian vuelto territorio de voces que nadie mas podia escuchar. Amaranta despertaba sobresaltada, creyendo haber oido su nombre susurrado entre las sombras de su habitacion.</p>
<p>Era siempre la misma voz: grave, melancolica, cargada de una tristeza que parecia habitar en los rincones mas oscuros de la casa. Una voz que conocia desde la infancia, pero que ahora la llamaba con una urgencia nueva, desesperada.</p>
<p>Se levantaba de la cama y recorria los pasillos descalza, siguiendo el eco que la guiaba hacia el desvan. Alli, entre cajas de recuerdos y muebles cubiertos por sabanas, encontraba siempre el mismo diario abierto en paginas diferentes.</p>
<blockquote>"Hay amores que son condena, y yo he sido condenada a amar a quien no debia. Mi hija pagara por mis pecados, como yo pague por los de mi madre."</blockquote>
<p>Amaranta cerro el diario con manos temblorosas. Ahora entendia por que las cartas, por que las voces, por que esa sensacion constante de estar pagando una deuda que no habia contraido.</p>`,
      en: `<p>Nights had become territory for voices no one else could hear. Amaranta woke startled, believing she'd heard her name whispered among the shadows of her room.</p>
<p>It was always the same voice: deep, melancholic, laden with a sadness that seemed to inhabit the darkest corners of the house. A voice she'd known since childhood, but that now called to her with a new, desperate urgency.</p>
<p>She would rise from bed and walk the hallways barefoot, following the echo that guided her to the attic. There, among boxes of memories and furniture draped in sheets, she always found the same diary open to different pages.</p>
<blockquote>"There are loves that are condemnation, and I have been condemned to love someone I shouldn't. My daughter will pay for my sins, as I paid for my mother's."</blockquote>
<p>Amaranta closed the diary with trembling hands. Now she understood the letters, the voices, that constant feeling of paying a debt she had never incurred.</p>`,
    },
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
    content: {
      es: `<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Hay luces que solo brillan<br/>en la oscuridad mas absoluta,<br/>como las estrellas que nacen del vacio<br/>y los besos que nacen del llanto.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Tu fuiste mi eclipse:<br/>la sombra que me ensenno<br/>a buscar la luz<br/>en los rincones<br/>donde nadie mira.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Y ahora que te has ido,<br/>brillo con la fuerza<br/>de quien aprendio<br/>que la oscuridad<br/>no es ausencia de luz...<br/>es su origen.</p>`,
      en: `<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">There are lights that only shine<br/>in the deepest darkness,<br/>like stars born from the void<br/>and kisses born from weeping.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">You were my eclipse:<br/>the shadow that taught me<br/>to seek the light<br/>in the corners<br/>where no one looks.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">And now that you're gone,<br/>I shine with the strength<br/>of one who learned<br/>that darkness<br/>is not the absence of light...<br/>it is its origin.</p>`,
    },
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
    content: {
      es: `<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">No me pidas que cierre esta herida.<br/>Es lo unico que me queda de ti.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Cada noche la abro un poco mas,<br/>como quien abre un libro viejo<br/>buscando la pagina<br/>donde todo tenia sentido.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Me dijeron que el tiempo cura.<br/>Mintieron.<br/>El tiempo solo te ensena<br/>a sangrar en silencio.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Pero esta herida es mia,<br/>y mientras duela,<br/>se que sigo vivo.</p>`,
      en: `<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Don't ask me to close this wound.<br/>It's the only thing I have left of you.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">Every night I open it a little more,<br/>like someone opening an old book<br/>searching for the page<br/>where everything made sense.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">They told me time heals.<br/>They lied.<br/>Time only teaches you<br/>to bleed in silence.</p>
<p style="text-align:center;font-style:italic;font-size:1.2em;line-height:1.8;">But this wound is mine,<br/>and as long as it hurts,<br/>I know I'm still alive.</p>`,
    },
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
    content: {
      es: `<p>Le bloquee el numero. No porque no lo quisiera, sino porque cada vez que sonaba el telefono, mi corazon se detenia un segundo antes de responder. Y ese segundo me estaba matando mas que su silencio.</p>
<p>El ultimo mensaje decia: "Perdoname". Dos palabras. Siete letras. Una vida entera comprimida en un rectangulo azul de luz.</p>
<p>Lo lei diecisiete veces. Lo se porque conte. Diecisiete veces busque entre esas dos palabras algo que no estaba: una explicacion, una promesa, un futuro.</p>
<p>Despues lo bloquee.</p>
<p>No porque no lo quisiera. Sino porque quererlo se habia convertido en un habito mas peligroso que cualquier vicio. Y yo necesitaba dejar de intoxicarme con alguien que solo sabia pedir perdon despues de romperme.</p>`,
      en: `<p>I blocked his number. Not because I didn't love him, but because every time the phone rang, my heart stopped for a second before answering. And that second was killing me more than his silence.</p>
<p>The last message said: "Forgive me." Two words. Nine letters. An entire life compressed into a blue rectangle of light.</p>
<p>I read it seventeen times. I know because I counted. Seventeen times I searched between those two words for something that wasn't there: an explanation, a promise, a future.</p>
<p>Then I blocked him.</p>
<p>Not because I didn't love him. But because loving him had become a habit more dangerous than any vice. And I needed to stop intoxicating myself with someone who only knew how to ask for forgiveness after breaking me.</p>`,
    },
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
    content: {
      es: `<p>En casa de abuela habia una nevera vieja que solo servia para las bebidas. Nadie la limpiaba. Nadie la movia. Estaba ahi desde antes de que yo naciera, zumbando en la esquina de la cocina como un animal dormido.</p>
<p>Los adultos la abrian para sacar cerveza, jugo de chinola, agua fria. Nosotros los ninos la abriamos para robar malta cuando nadie miraba.</p>
<p>Abuela murio un martes. La casa se lleno de gente, de llantos, de comida que nadie habia pedido. Y yo, con doce anos y un vacio que no sabia nombrar, fui a la cocina.</p>
<p>Abri la nevera.</p>
<p>Estaba llena. Como siempre. Como si ella siguiera ahi, asegurandose de que nadie pasara sed en su casa. Habia una malta India al fondo, detras de las Presidente. La agarre. Estaba helada.</p>
<p>Me la tome sentado en el piso de la cocina, con la espalda contra la nevera, sintiendo su vibracion en los huesos. Y llore. No por abuela. Por la nevera. Porque sabia que alguien la desenchufaria pronto, y entonces si seria verdad que ella se habia ido.</p>`,
      en: `<p>At grandma's house there was an old fridge that was only for drinks. Nobody cleaned it. Nobody moved it. It had been there since before I was born, humming in the corner of the kitchen like a sleeping animal.</p>
<p>The adults opened it for beer, passion fruit juice, cold water. We kids opened it to steal malta when no one was looking.</p>
<p>Grandma died on a Tuesday. The house filled with people, with crying, with food nobody had asked for. And me, twelve years old with a void I couldn't name, I went to the kitchen.</p>
<p>I opened the fridge.</p>
<p>It was full. Like always. As if she were still there, making sure nobody went thirsty in her house. There was a Malta India in the back, behind the Presidentes. I grabbed it. It was ice cold.</p>
<p>I drank it sitting on the kitchen floor, my back against the fridge, feeling its vibration in my bones. And I cried. Not for grandma. For the fridge. Because I knew someone would unplug it soon, and then it would really be true that she was gone.</p>`,
    },
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
    content: {
      es: `<p>La vi por primera vez en el jardin de la biblioteca publica. Leia un libro que no tenia titulo en el lomo. El pelo le caia como fuego sobre los hombros.</p>
<p>Me sente en el banco de enfrente. Abri mi cuaderno. Fingi escribir. En realidad la estaba dibujando con palabras que nunca usaria.</p>
<p>Volvio el jueves. Y el siguiente. Siempre a las tres. Siempre el mismo libro sin titulo. Siempre sola.</p>
<p>Un dia me miro. No sonrio. Solo me miro, como quien reconoce a alguien que ha visto en un sueno. Despues volvio a su libro.</p>
<p>Escribi: "La pelirroja del jardin me miro hoy. Creo que me reconocio de una vida que aun no hemos vivido."</p>
<p>No volvio.</p>
<p>Espere tres jueves. Cuatro. El quinto me sente en su banco. Habia un papel doblado debajo de una piedra. Decia, con letra pequena y torcida:</p>
<blockquote>"Deja de buscarme. Nos encontraremos cuando el jardin florezca otra vez."</blockquote>
<p>Mire alrededor. Las rosas estaban muertas. Era noviembre.</p>
<p>Llevo cinco primaveras volviendo a ese banco.</p>`,
      en: `<p>I saw her for the first time in the public library garden. She was reading a book with no title on the spine. Her hair fell like fire over her shoulders.</p>
<p>I sat on the bench across from her. I opened my notebook. Pretended to write. In reality, I was drawing her with words I'd never use.</p>
<p>She came back on Thursday. And the next. Always at three. Always the same untitled book. Always alone.</p>
<p>One day she looked at me. She didn't smile. She just looked at me, like someone recognizing a person they've seen in a dream. Then she went back to her book.</p>
<p>I wrote: "The redhead from the garden looked at me today. I think she recognized me from a life we haven't lived yet."</p>
<p>She didn't come back.</p>
<p>I waited three Thursdays. Four. On the fifth, I sat on her bench. There was a folded paper under a stone. It said, in small, crooked handwriting:</p>
<blockquote>"Stop looking for me. We'll find each other when the garden blooms again."</blockquote>
<p>I looked around. The roses were dead. It was November.</p>
<p>I've been coming back to that bench for five springs.</p>`,
    },
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
    content: {
      es: `<p>Querida hiedra:</p>
<p>No vuelvas a crecer por mi pared. Ya no tengo fuerza para arrancarte, y cada vez que lo intento, te llevas un pedazo de ladrillo. Un pedazo de mi.</p>
<p>Se que no es tu culpa. Tu naturaleza es aferrarte. La mia es dejar que me cubran cosas que deberia haber cortado a tiempo.</p>
<p>Pero esta carta no es un reclamo. Es una confesion: me gusta que estes ahi. Me gusta que cada manana, cuando abro la ventana, seas lo primero que veo. Verde. Insistente. Viva.</p>
<p>Eres todo lo que yo no soy en este momento.</p>
<p>Asi que quédate. Pero no vuelvas a tocar la ventana. Ese es mi limite. Detras de ese cristal esta todo lo que no quiero que veas.</p>
<p style="text-align:right;font-style:italic;">Con algo parecido al carino,<br/>C.</p>`,
      en: `<p>Dear ivy:</p>
<p>Don't grow on my wall again. I no longer have the strength to tear you out, and every time I try, you take a piece of brick with you. A piece of me.</p>
<p>I know it's not your fault. Your nature is to cling. Mine is to let myself be covered by things I should have cut away in time.</p>
<p>But this letter isn't a complaint. It's a confession: I like that you're there. I like that every morning, when I open the window, you're the first thing I see. Green. Insistent. Alive.</p>
<p>You are everything I am not right now.</p>
<p>So stay. But don't touch the window again. That's my limit. Behind that glass is everything I don't want you to see.</p>
<p style="text-align:right;font-style:italic;">With something resembling affection,<br/>C.</p>`,
    },
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
    content: {
      es: `<p>Hiedra:</p>
<p>Hoy nevo por primera vez desde que llegue a esta ciudad. Todo esta blanco, menos tu. Tu sigues ahi, seca, marron, aferrada a la pared como si supiera que la primavera va a volver.</p>
<p>Yo no estoy tan seguro.</p>
<p>El frio de Elmira no se parece a nada que haya sentido antes. No es el frio del aire acondicionado en Santo Domingo, ni el fresco de la montana en Jarabacoa. Este frio entra por los huesos y se queda. Como la nostalgia. Como el arrepentimiento.</p>
<p>Hoy camine hasta la biblioteca. No habia nadie. Solo yo y el silencio de una ciudad que no me conoce. Pense en ti, hiedra. Pense en que los dos estamos lejos de donde nacimos, aguantando un invierno que no elegimos.</p>
<p>Pero tu no te quejas. Tu solo esperas.</p>
<p>Quizas deberia aprender eso de ti.</p>
<p style="text-align:right;font-style:italic;">Desde el frio,<br/>C.</p>`,
      en: `<p>Ivy:</p>
<p>It snowed for the first time today since I arrived in this city. Everything is white, except you. You're still there, dry, brown, clinging to the wall as if you knew spring would come back.</p>
<p>I'm not so sure.</p>
<p>The cold in Elmira is unlike anything I've felt before. It's not the cold of air conditioning in Santo Domingo, nor the coolness of the mountains in Jarabacoa. This cold enters through your bones and stays. Like nostalgia. Like regret.</p>
<p>Today I walked to the library. There was no one. Just me and the silence of a city that doesn't know me. I thought of you, ivy. I thought about how we're both far from where we were born, enduring a winter we didn't choose.</p>
<p>But you don't complain. You just wait.</p>
<p>Maybe I should learn that from you.</p>
<p style="text-align:right;font-style:italic;">From the cold,<br/>C.</p>`,
    },
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
