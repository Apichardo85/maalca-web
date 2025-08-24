"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones
const translations = {
  es: {
    // Navegación
    'nav.home': 'Inicio',
    'nav.about': 'Sobre Mí', 
    'nav.works': 'Obras',
    'nav.letters': 'Cartas',
    'nav.contact': 'Contacto',
    
    // Hero
    'hero.title': 'CiriWhispers',
    'hero.subtitle': 'Bienvenido a mi laberinto de palabras',
    'hero.description': 'Autor de thriller psicológico y narrativa poética. Explorador de los rincones más íntimos del alma humana, donde la oscuridad y la luz danzan en perfecta armonía.',
    'hero.quote': 'Como el cuervo de Poe, cada historia es un "nunca más" que se convierte en "siempre"',
    'hero.enterLabyrinth': '🐦‍⬛ Entrar al Laberinto',
    'hero.soulWhispers': '📜 Susurros del Alma',
    
    // Sobre Mí
    'about.title': 'El Susurro detrás de las Palabras',
    'about.subtitle': 'Sobre Ciriaco',
    'about.bio1': 'Dominicano, amante de las palabras y de los mundos que nacen de ellas. Empecé a escribir como un acto reflexivo, inspirado por lecturas, canciones y esas preguntas que nos confrontan con la vida.',
    'about.bio2': 'Escritor empírico con cuentos, un poemario y una novela publicada (Amaranta), sigo explorando la narrativa romántica y la poesía como formas de entender y expresar el mundo. Admiro a García Márquez, Poe y Bukowski por su capacidad de transformar lo cotidiano en arte.',
    'about.bio3': 'Actualmente trabajo en Almas rotas. Si buscas poesía, historias con alma y un espacio donde las emociones toman forma, este es tu lugar.',
    'about.location': 'Elmira, NY.',
    'about.inspirations': 'Inspiraciones',
    'about.process': 'Mi Proceso',
    'about.processText': 'Escribo principalmente en las horas más silenciosas, cuando el mundo duerme y las palabras fluyen sin filtros. Cada texto nace de una emoción visceral, de un susurro del inconsciente que demanda ser escuchado.',
    
    // Obras
    'works.title': '📚 Los Manuscritos del Laberinto',
    'works.description': 'Cada libro es un fragmento de alma transformado en palabras, una invitación a explorar los rincones más profundos de la experiencia humana.',
    'works.epubNotice': '🔮 Próximamente: Lector EPUB integrado para sumergirte completamente en cada historia',
    'works.readChapter': '📖 Leer primer capítulo',
    'works.comingSoon': '📖 Leer Aquí (Próximamente)',
    'works.buyAmazon': '🛒 Comprar en Amazon',
    'works.status.available': 'Disponible',
    'works.status.inProgress': 'En progreso',
    'works.status.inDevelopment': 'En desarrollo',
    
    // Cartas
    'letters.title': '📜 Susurros desde el Laberinto',
    'letters.description': 'Reflexiones íntimas, fragmentos de vida y susurros nocturnos compartidos en la intimidad de estas páginas digitales.',
    'letters.subscribe': 'Suscríbete a mis Cartas',
    'letters.subscribeDesc': 'Recibe nuevas cartas y reflexiones directamente en tu correo, como secretos susurrados entre amigos de alma.',
    'letters.email': 'tu@email.com',
    'letters.subscribeBtn': 'Suscribirse',
    'letters.readComplete': 'Leer carta completa →',
    
    // Contacto
    'contact.title': 'Conectemos Almas',
    'contact.description': 'Para colaboraciones, encargos literarios o simplemente para compartir un susurro en la inmensidad digital.',
    'contact.sendMessage': 'Envíame un Mensaje',
    'contact.name': 'Tu nombre',
    'contact.email': 'Tu email', 
    'contact.message': 'Tu mensaje...',
    'contact.send': 'Enviar Susurro',
    'contact.followMe': 'Sígueme',
    'contact.services': 'Servicios',
    'contact.signature': '"Siempre tuyo, @CiriWhispers"',
    
    // Avisos
    'warning.sensitiveContent': 'Aviso de contenido sensible',
    'warning.contains': 'Contiene temas de: {topics}.',
    'warning.recommended': 'Recomendado para lectores +16.',
    
    // Temas
    'theme.paperCream': '📜 Papel crema',
    'theme.darkMode': '🌑 Modo oscuro',
    
    // Book Data
    'books.amaranta.synopsis': 'Una joven enfrenta el eco de una culpa heredada. Entre recuerdos prestados y voces que insisten en hablarle, descubre que amar también puede ser una forma de perdón.',
    'books.amaranta.excerpt': 'En la penumbra de su memoria, Amaranta encontró las palabras que nunca pudo decir en vida...',
    'books.luces-sombras.synopsis': '106 poemas que rozan la piel y la contradicción: amor, pérdida y el resplandor que solo se ve cuando todo oscurece.',
    'books.luces-sombras.excerpt': 'Hay luces que solo brillan en la oscuridad más absoluta, como las estrellas que nacen del vacío...',
    'books.cartas-hiedra.synopsis': 'Treinta cartas íntimas a una presencia viva: la hiedra. Deseo, frontera y lo que crece incluso en el muro más frío.',
    'books.cartas-hiedra.excerpt': 'Querida Hiedra, tus brazos abrazan muros como yo abrazo palabras: con la desesperación de quien sabe que todo es efímero...',
    'books.cosas-no-contar.synopsis': 'Pequeñas heridas en voz baja: escenas que nadie confiesa, contadas con delicadeza y crudeza a la vez.',
    'books.cosas-no-contar.excerpt': 'Hay historias que se escriben con lágrimas en papel invisible, para que solo el alma las pueda leer...',
    'books.elmira-ny.synopsis': 'Mapa emocional de Elmira: soledades, trabajos, vínculos y los fantasmas que se cuelan por las ventanas de invierno.',
    'books.elmira-ny.excerpt': 'El exilio no es un lugar, es un estado del alma que se lleva a todas partes...',
    'books.ramirito.synopsis': 'Regresar al barrio tras la prisión: el respeto ya no alcanza, los jóvenes no temen y el nombre pesa más que la carne.',
    'books.ramirito.excerpt': '—Ese es Ramirito, el que mató a su mamá.',
    
    // Blog Content
    'blog.perfil-autor.title': 'Sobre Ciriaco A. Pichardo',
    'blog.perfil-autor.excerpt': 'Dominicano, amante de las palabras y de los mundos que nacen de ellas.',
    'blog.perfil-autor.content': 'Empecé a escribir como un acto reflexivo, inspirado por lecturas, canciones y esas preguntas que nos confrontan con la vida. Escritor empírico con cuentos, un poemario y una novela publicada (Amaranta), sigo explorando la narrativa romántica y la poesía como formas de entender y expresar el mundo. Admiro a García Márquez, Poe y Bukowski por su capacidad de transformar lo cotidiano en arte. Actualmente trabajo en mi próxima novela, Almas rotas. Si buscas poesía, historias con alma y un espacio donde las emociones toman forma, este es tu lugar. Elmira, NY.',
    'blog.invierno-elmira.title': 'Invierno en Elmira',
    'blog.invierno-elmira.excerpt': 'La nieve cubre los secretos...',
    'blog.invierno-elmira.content': 'Este pueblo me enseñó a escuchar el crujido de la madera vieja y a llamar hogar a una silla en silencio.',
    
    // Status translations
    'status.available': 'Disponible',
    'status.inProgress': 'En progreso',
    'status.inDevelopment': 'En desarrollo',
    
    // Sensitive content warnings
    'warning.traumaFamiliar': 'trauma familiar',
    'warning.duelo': 'duelo',
    'warning.temasPsicologicos': 'temas psicológicos',
    'warning.violencia': 'violencia',
    'warning.prision': 'prisión',
    'warning.estigmaSocial': 'estigma social',
    
    // First Chapter Modal
    'chapter.preview': 'Primer capítulo - Vista previa',
    'chapter.liked': '¿Te gustó? Continúa la historia completa...',
    'chapter.close': 'Cerrar',
    'chapter.buyAmazon': '🛒 Comprar en Amazon',
    'chapter.amaranta.content': `En la penumbra de su memoria, Amaranta encontró las palabras que nunca pudo decir en vida. Las sombras del pasado se alzaban como fantasmas que susurraban secretos al oído, recordándole que algunas culpas se heredan como joyas malditas que pasan de madre a hija.

Había crecido con el peso de un nombre que no era suyo, con recuerdos que llegaban en oleadas nocturnas, despertándola con el sabor metálico del miedo en la boca. ¿Cómo se puede amar cuando el corazón lleva cicatrices ajenas? ¿Cómo se puede vivir cuando las voces del pasado insisten en hablar más alto que las del presente?

Pero esa mañana, frente al espejo empañado del baño, Amaranta decidió que era tiempo de enfrentar los ecos. Era tiempo de descubrir que, quizás, amar también podía ser una forma de perdón.

Las palabras que había guardado tanto tiempo comenzaron a tomar forma, como si hubieran estado esperando el momento exacto para salir a la luz. Y por primera vez en mucho tiempo, sintió que podía respirar...`
  },
  en: {
    // Navegación
    'nav.home': 'Home',
    'nav.about': 'About Me',
    'nav.works': 'Works', 
    'nav.letters': 'Letters',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.title': 'CiriWhispers',
    'hero.subtitle': 'Welcome to my labyrinth of words',
    'hero.description': 'Psychological thriller and poetic narrative author. Explorer of the most intimate corners of the human soul, where darkness and light dance in perfect harmony.',
    'hero.quote': 'Like Poe\'s raven, each story is a "nevermore" that becomes "forever"',
    'hero.enterLabyrinth': '🐦‍⬛ Enter the Labyrinth', 
    'hero.soulWhispers': '📜 Soul Whispers',
    
    // Sobre Mí
    'about.title': 'The Whisper Behind the Words',
    'about.subtitle': 'About Ciriaco',
    'about.bio1': 'Dominican, lover of words and the worlds born from them. I began writing as a reflective act, inspired by readings, songs, and those questions that confront us with life.',
    'about.bio2': 'Empirical writer with stories, a poetry collection, and a published novel (Amaranta), I continue exploring romantic narrative and poetry as ways to understand and express the world. I admire García Márquez, Poe, and Bukowski for their ability to transform the ordinary into art.',
    'about.bio3': 'Currently working on Broken Souls. If you seek poetry, stories with soul, and a space where emotions take form, this is your place.',
    'about.location': 'Elmira, NY.',
    'about.inspirations': 'Inspirations',
    'about.process': 'My Process',
    'about.processText': 'I write mainly in the quietest hours, when the world sleeps and words flow without filters. Each text is born from a visceral emotion, from an unconscious whisper that demands to be heard.',
    
    // Obras
    'works.title': '📚 The Labyrinth Manuscripts',
    'works.description': 'Each book is a fragment of soul transformed into words, an invitation to explore the deepest corners of human experience.',
    'works.epubNotice': '🔮 Coming Soon: Integrated EPUB reader to completely immerse yourself in each story',
    'works.readChapter': '📖 Read first chapter',
    'works.comingSoon': '📖 Read Here (Coming Soon)',
    'works.buyAmazon': '🛒 Buy on Amazon',
    'works.status.available': 'Available',
    'works.status.inProgress': 'In Progress',
    'works.status.inDevelopment': 'In Development',
    
    // Cartas
    'letters.title': '📜 Whispers from the Labyrinth',
    'letters.description': 'Intimate reflections, life fragments, and nocturnal whispers shared in the intimacy of these digital pages.',
    'letters.subscribe': 'Subscribe to my Letters',
    'letters.subscribeDesc': 'Receive new letters and reflections directly in your email, like secrets whispered between soul friends.',
    'letters.email': 'your@email.com',
    'letters.subscribeBtn': 'Subscribe',
    'letters.readComplete': 'Read complete letter →',
    
    // Contacto
    'contact.title': 'Let\'s Connect Souls',
    'contact.description': 'For collaborations, literary commissions, or simply to share a whisper in the digital immensity.',
    'contact.sendMessage': 'Send me a Message',
    'contact.name': 'Your name',
    'contact.email': 'Your email',
    'contact.message': 'Your message...',
    'contact.send': 'Send Whisper',
    'contact.followMe': 'Follow Me',
    'contact.services': 'Services',
    'contact.signature': '"Always yours, @CiriWhispers"',
    
    // Avisos
    'warning.sensitiveContent': 'Sensitive content warning',
    'warning.contains': 'Contains themes of: {topics}.',
    'warning.recommended': 'Recommended for readers 16+.',
    
    // Temas
    'theme.paperCream': '📜 Cream paper',
    'theme.darkMode': '🌑 Dark mode',
    
    // Book Data
    'books.amaranta.synopsis': 'A young woman faces the echo of inherited guilt. Between borrowed memories and voices that insist on speaking to her, she discovers that loving can also be a form of forgiveness.',
    'books.amaranta.excerpt': 'In the penumbra of her memory, Amaranta found the words she could never say in life...',
    'books.luces-sombras.synopsis': '106 poems that touch the skin and contradiction: love, loss, and the glow that can only be seen when everything darkens.',
    'books.luces-sombras.excerpt': 'There are lights that only shine in the most absolute darkness, like stars born from the void...',
    'books.cartas-hiedra.synopsis': 'Thirty intimate letters to a living presence: the ivy. Desire, boundary and what grows even on the coldest wall.',
    'books.cartas-hiedra.excerpt': 'Dear Ivy, your arms embrace walls as I embrace words: with the desperation of one who knows that everything is ephemeral...',
    'books.cosas-no-contar.synopsis': 'Small wounds in low voices: scenes that no one confesses, told with delicacy and crudeness at the same time.',
    'books.cosas-no-contar.excerpt': 'There are stories that are written with tears on invisible paper, so that only the soul can read them...',
    'books.elmira-ny.synopsis': 'Emotional map of Elmira: solitudes, jobs, bonds and the ghosts that sneak through winter windows.',
    'books.elmira-ny.excerpt': 'Exile is not a place, it is a state of the soul that is carried everywhere...',
    'books.ramirito.synopsis': 'Returning to the neighborhood after prison: respect is no longer enough, young people do not fear and the name weighs more than flesh.',
    'books.ramirito.excerpt': '—That\'s Ramirito, the one who killed his mother.',
    
    // Blog Content
    'blog.perfil-autor.title': 'About Ciriaco A. Pichardo',
    'blog.perfil-autor.excerpt': 'Dominican, lover of words and the worlds born from them.',
    'blog.perfil-autor.content': 'I began writing as a reflective act, inspired by readings, songs, and those questions that confront us with life. Empirical writer with stories, a poetry collection, and a published novel (Amaranta), I continue exploring romantic narrative and poetry as ways to understand and express the world. I admire García Márquez, Poe, and Bukowski for their ability to transform the ordinary into art. Currently working on my next novel, Broken Souls. If you seek poetry, stories with soul, and a space where emotions take form, this is your place. Elmira, NY.',
    'blog.invierno-elmira.title': 'Winter in Elmira',
    'blog.invierno-elmira.excerpt': 'Snow covers the secrets...',
    'blog.invierno-elmira.content': 'This town taught me to listen to the creak of old wood and to call home a chair in silence.',
    
    // Status translations
    'status.available': 'Available',
    'status.inProgress': 'In Progress',
    'status.inDevelopment': 'In Development',
    
    // Sensitive content warnings
    'warning.traumaFamiliar': 'family trauma',
    'warning.duelo': 'grief',
    'warning.temasPsicologicos': 'psychological themes',
    'warning.violencia': 'violence',
    'warning.prision': 'prison',
    'warning.estigmaSocial': 'social stigma',
    
    // First Chapter Modal
    'chapter.preview': 'First chapter - Preview',
    'chapter.liked': 'Did you like it? Continue the complete story...',
    'chapter.close': 'Close',
    'chapter.buyAmazon': '🛒 Buy on Amazon',
    'chapter.amaranta.content': `In the penumbra of her memory, Amaranta found the words she could never say in life. The shadows of the past rose like ghosts whispering secrets in her ear, reminding her that some guilt is inherited like cursed jewels passed from mother to daughter.

She had grown up with the weight of a name that was not hers, with memories that came in nocturnal waves, awakening her with the metallic taste of fear in her mouth. How can you love when your heart bears wounds that are not your own? How can you live when the voices of the past insist on speaking louder than those of the present?

But that morning, facing the fogged bathroom mirror, Amaranta decided it was time to face the echoes. It was time to discover that, perhaps, loving could also be a form of forgiveness.

The words she had kept for so long began to take shape, as if they had been waiting for the exact moment to come to light. And for the first time in a long time, she felt she could breathe...`
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  useEffect(() => {
    // Detectar idioma del navegador o localStorage
    const saved = localStorage.getItem('ciri-language') as Language;
    const browserLang = navigator.language.startsWith('en') ? 'en' : 'es';
    
    setLanguage(saved || browserLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('ciri-language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}