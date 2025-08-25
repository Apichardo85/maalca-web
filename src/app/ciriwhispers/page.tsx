"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import FirstChapter from "@/components/ui/FirstChapter";
import SensitiveNotice from "@/components/ui/SensitiveNotice";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";

const books = [
  {
    id: "amaranta",
    title: "Amaranta",
    subtitle: "Thriller psicológico",
    synopsis: "Una joven enfrenta el eco de una culpa heredada. Entre recuerdos prestados y voces que insisten en hablarle, descubre que amar también puede ser una forma de perdón.",
    cover: "/images/books/amaranta.jpg",
    status: "Disponible",
    amazonLink: "https://www.amazon.com/Amaranta-Ciriaco-Alejandro-Pichardo-Santana/dp/841915122X",
    excerpt: "En la penumbra de su memoria, Amaranta encontró las palabras que nunca pudo decir en vida...",
    year: "2024",
    tags: ["novela", "psicológico", "drama íntimo"],
    notes: "Edición bajo Editorial MaalCa. Primer capítulo legible en web."
  },
  {
    id: "luz-sombras",
    title: "Luces & Sombras",
    subtitle: "Poemario narrativo",
    synopsis: "106 poemas que rozan la piel y la contradicción: amor, pérdida y el resplandor que solo se ve cuando todo oscurece.",
    cover: "/images/books/luz-sombras.jpg",
    status: "Disponible",
    amazonLink: "https://www.amazon.com/Luces-Sombras-Spanish-ebook/dp/B084M8356R",
    excerpt: "Hay luces que solo brillan en la oscuridad más absoluta, como las estrellas que nacen del vacío...",
    year: "2023",
    tags: ["poesía", "amor", "intimidad"],
    notes: "Versión KDP confirmada."
  },
  {
    id: "cartas-hiedra",
    title: "Cartas a la Hiedra",
    subtitle: "Colección epistolar",
    synopsis: "Treinta cartas íntimas a una presencia viva: la hiedra. Deseo, frontera y lo que crece incluso en el muro más frío.",
    cover: "/images/books/cartas-hiedra.png",
    status: "En progreso",
    amazonLink: "#",
    excerpt: "Querida Hiedra, tus brazos abrazan muros como yo abrazo palabras: con la desesperación de quien sabe que todo es efímero...",
    year: "2024",
    tags: ["epistolar", "prosa poética"],
    notes: "Meta en web: 30 cartas visibles (muestras selectas, no newsletter masivo)."
  },
  {
    id: "cosas-no-contar",
    title: "Cosas que no hay que contar",
    subtitle: "Relatos de filo íntimo",
    synopsis: "Pequeñas heridas en voz baja: escenas que nadie confiesa, contadas con delicadeza y crudeza a la vez.",
    cover: "/images/books/cosas-no-contar.jpg",
    status: "En desarrollo",
    amazonLink: "#",
    excerpt: "Hay historias que se escriben con lágrimas en papel invisible, para que solo el alma las pueda leer...",
    year: "2025",
    tags: ["cuentos", "realismo crudo"],
    notes: "En progreso: 'Bloqueado', 'La nevera de las bebidas', 'El jardín y la pelirroja'."
  },
  {
    id: "elmira-ny",
    title: "Elmira, NY",
    subtitle: "Crónicas del exilio",
    synopsis: "Mapa emocional de Elmira: soledades, trabajos, vínculos y los fantasmas que se cuelan por las ventanas de invierno.",
    cover: "/images/books/elmira-ny.svg",
    status: "En desarrollo",
    amazonLink: "#",
    excerpt: "El exilio no es un lugar, es un estado del alma que se lleva a todas partes...",
    year: "2025",
    tags: ["crónica", "autoficción", "ensayo"],
    notes: "Vista separada Crónica/Ficción y mapa poético interactivo."
  },
  {
    id: "ramirito",
    title: "Ramirito",
    subtitle: "Novela — memoria y estigma",
    synopsis: "Regresar al barrio tras la prisión: el respeto ya no alcanza, los jóvenes no temen y el nombre pesa más que la carne.",
    cover: "/images/books/ramirito.svg",
    status: "En desarrollo",
    amazonLink: "#",
    excerpt: "—Ese es Ramirito, el que mató a su mamá.",
    year: "2025",
    tags: ["novela", "realismo social"],
    notes: "Incluye aviso breve de temas sensibles (opcional)."
  }
];

const blogPosts = [
  {
    id: "perfil-autor",
    title: "Sobre Ciriaco A. Pichardo",
    date: "Actualizado 2025",
    excerpt: "Dominicano, amante de las palabras y de los mundos que nacen de ellas.",
    content: "Empecé a escribir como un acto reflexivo, inspirado por lecturas, canciones y esas preguntas que nos confrontan con la vida. Escritor empírico con cuentos, un poemario y una novela publicada (Amaranta), sigo explorando la narrativa romántica y la poesía como formas de entender y expresar el mundo. Admiro a García Márquez, Poe y Bukowski por su capacidad de transformar lo cotidiano en arte. Actualmente trabajo en mi próxima novela, Almas rotas. Si buscas poesía, historias con alma y un espacio donde las emociones toman forma, este es tu lugar. Elmira, NY."
  },
  {
    id: "invierno-elmira",
    title: "Invierno en Elmira",
    date: "Enero 2024",
    excerpt: "La nieve cubre los secretos...",
    content: "Este pueblo me enseñó a escuchar el crujido de la madera vieja y a llamar hogar a una silla en silencio."
  }
];

function CiriWhispersContent() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const { t, language } = useLanguage();
  
  // Helper function to get localized content
  const getLocalizedContent = (content: any) => {
    if (typeof content === 'object' && content[language]) {
      const key = content[language];
      return key.startsWith('books.') || key.startsWith('blog.') || key.startsWith('status.') ? t(key) : key;
    }
    return content;
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Mystical Labyrinth Background */}
        <div className="absolute inset-0 opacity-15">
          {/* Floating labyrinth elements */}
          <div className="absolute top-20 left-10 text-4xl text-red-700/40 animate-pulse">⚰️</div>
          <div className="absolute top-40 right-20 text-3xl text-stone-200/40 animate-pulse" style={{animationDelay: '1s'}}>🖋️</div>
          <div className="absolute bottom-20 left-20 text-4xl text-red-800/40 animate-pulse" style={{animationDelay: '2s'}}>📜</div>
          <div className="absolute bottom-40 right-10 text-2xl text-stone-300/40 animate-pulse" style={{animationDelay: '0.5s'}}>🕯️</div>
          <div className="absolute top-1/2 left-16 text-3xl text-red-600/30 animate-pulse" style={{animationDelay: '1.5s'}}>🐦‍⬛</div>
          <div className="absolute top-1/3 right-24 text-2xl text-stone-200/30 animate-pulse" style={{animationDelay: '3s'}}>📖</div>
          
          {/* Labyrinth lines */}
          <div className="absolute top-32 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-red-800/20 to-transparent"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-stone-200/20 to-transparent transform rotate-45"></div>
          <div className="absolute bottom-32 left-1/3 w-28 h-px bg-gradient-to-r from-transparent via-red-700/20 to-transparent transform -rotate-12"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            {/* CiriWhispers Logo */}
            <div className="w-48 h-48 mx-auto mb-8 relative group">
              <div className="w-full h-full relative overflow-hidden rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 border border-red-800/30 shadow-2xl">
                <img 
                  src="/images/projects/ciriwhispers.png" 
                  alt="CiriWhispers - Logo del Laberinto"
                  className="w-full h-full object-contain rounded-full group-hover:scale-105 transition-transform duration-500"
                />
                {/* Mystical glow effect */}
                <div className="absolute inset-0 rounded-full bg-red-900/10 group-hover:bg-red-800/20 transition-colors duration-500"></div>
              </div>
            </div>

            <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-800 via-red-600 to-red-800 bg-clip-text text-transparent">
              CiriWhispers
            </h1>
            
            <p className="text-2xl md:text-3xl font-light text-stone-200 mb-8 italic font-serif">
              "{t('hero.subtitle')}"
            </p>
            
            <div className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed space-y-4">
              <p className="border-l-2 border-red-800/30 pl-4">
                {t('hero.description')}
              </p>
              <p className="text-center text-red-400/80 font-serif italic text-sm">
                🐦‍⬛ {t('hero.quote')} 🐦‍⬛
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection('portafolio')}
                className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100 font-semibold border border-red-700/30 shadow-lg hover:shadow-red-900/20"
              >
                {t('hero.enterLabyrinth')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('cartas')}
                className="border-red-600/50 text-red-400 hover:bg-red-600/10"
              >
                {t('hero.soulWhispers')}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-1 h-12 bg-gradient-to-b from-transparent via-red-600 to-transparent rounded-full"></div>
        </motion.div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="font-serif text-xl font-bold text-red-400">CiriWhispers</span>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex space-x-6">
                {[
                  { id: 'home', label: t('nav.home') },
                  { id: 'sobre-mi', label: t('nav.about') },
                  { id: 'portafolio', label: t('nav.works') },
                  { id: 'cartas', label: t('nav.letters') },
                  { id: 'contacto', label: t('nav.contact') }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`transition-colors ${
                      activeSection === item.id 
                        ? 'text-red-400' 
                        : 'text-slate-300 hover:text-red-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Sobre Mí Section */}
      <section id="sobre-mi" className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-100 mb-8">
              El Susurro detrás de las Palabras
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-red-800/20">
                <h3 className="font-serif text-2xl font-bold text-red-600 mb-6">Sobre Ciriaco</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Dominicano, amante de las palabras y de los mundos que nacen de ellas. Empecé a escribir como un acto reflexivo, 
                  inspirado por lecturas, canciones y esas preguntas que nos confrontan con la vida.
                </p>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Escritor empírico con cuentos, un poemario y una novela publicada (<em>Amaranta</em>), sigo explorando la narrativa 
                  romántica y la poesía como formas de entender y expresar el mundo. Admiro a García Márquez, Poe y Bukowski 
                  por su capacidad de transformar lo cotidiano en arte.
                </p>
                <p className="text-slate-300 leading-relaxed italic">
                  Actualmente trabajo en <em>Almas rotas</em>. Si buscas poesía, historias con alma y un espacio donde las emociones 
                  toman forma, este es tu lugar. <span className="text-red-400">Elmira, NY.</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                <h4 className="font-serif text-xl font-bold text-red-600 mb-3">Inspiraciones</h4>
                <ul className="text-slate-300 space-y-2">
                  <li>📖 Edgar Allan Poe - El maestro de lo macabro poético</li>
                  <li>🍷 Charles Bukowski - La honestidad brutal</li>
                  <li>✨ Realismo Mágico - Donde lo cotidiano se vuelve extraordinario</li>
                  <li>🌙 La noche como musa y confidente</li>
                </ul>
              </div>

              <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                <h4 className="font-serif text-xl font-bold text-red-600 mb-3">Mi Proceso</h4>
                <p className="text-slate-300 leading-relaxed">
                  Escribo principalmente en las horas más silenciosas, cuando el mundo duerme y las palabras 
                  fluyen sin filtros. Cada texto nace de una emoción visceral, de un susurro del inconsciente 
                  que demanda ser escuchado.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portafolio Section */}
      <section id="portafolio" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-100 mb-8">
              📚 Los Manuscritos del Laberinto
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
              Cada libro es un fragmento de alma transformado en palabras, una invitación a explorar 
              los rincones más profundos de la experiencia humana.
            </p>
            <div className="bg-red-900/10 border border-red-800/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-red-400/80 text-sm font-serif italic">
                🔮 Próximamente: Lector EPUB integrado para sumergirte completamente en cada historia
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedBook(selectedBook === book.id ? null : book.id)}
              >
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden border border-red-800/20 hover:border-red-600/40 transition-all duration-300">
                  {/* Book Cover */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-red-900/20 to-slate-800/50 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={book.cover} 
                      alt={`Portada de ${book.title}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 hidden items-center justify-center">
                      <span className="text-6xl opacity-40">📖</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        getLocalizedContent(book.status) === t('works.status.available')
                          ? 'bg-red-600/15 text-red-400 border border-red-600/30'
                          : getLocalizedContent(book.status) === t('works.status.inProgress')
                          ? 'bg-red-800/15 text-red-300 border border-red-800/30'
                          : 'bg-slate-600/20 text-slate-200 border border-slate-500/30'
                      }`}>
                        {getLocalizedContent(book.status)}
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-red-400 font-medium">{book.year}</span>
                      <span className="text-xs text-slate-400">{book.subtitle}</span>
                    </div>
                    
                    <h3 className="font-serif text-xl font-bold text-stone-100 mb-3 group-hover:text-red-400 transition-colors">
                      {book.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                      {book.synopsis}
                    </p>

                    {selectedBook === book.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-700/50 pt-4"
                      >
                        <blockquote className="font-serif italic text-slate-300 text-sm leading-relaxed mb-4">
                          "{book.excerpt}"
                        </blockquote>
                        
                        {getLocalizedContent(book.status) === t('works.status.available') && (
                          <div className="space-y-2">
                            {book.id === 'amaranta' ? (
                              <FirstChapter 
                                title={getLocalizedContent(book.title)}
                                content={t('chapter.amaranta.content')}
                              />
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10"
                              >
                                📖 Leer Aquí (Próximamente)
                              </Button>
                            )}
                            <a 
                              href={book.amazonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-stone-600/50 text-stone-400 hover:bg-stone-600/10"
                              >
                                🛒 Comprar en Amazon
                              </Button>
                            </a>
                          </div>
                        )}
                        
                        {/* Aviso de contenido sensible para libros específicos */}
                        {(book.id === 'amaranta' || book.id === 'ramirito') && (
                          <SensitiveNotice 
                            topics={
                              book.id === 'amaranta' 
                                ? ["traumaFamiliar", "duelo", "temasPsicologicos"] 
                                : ["violencia", "prision", "estigmaSocial"]
                            }
                          />
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cartas/Blog Section */}
      <section id="cartas" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-100 mb-8">
              📜 Susurros desde el Laberinto
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Reflexiones íntimas, fragmentos de vida y susurros nocturnos compartidos 
              en la intimidad de estas páginas digitales.
            </p>
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-red-800/20 mb-12">
              <h3 className="font-serif text-xl font-bold text-stone-100 mb-4">
                Suscríbete a mis Cartas
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Recibe nuevas cartas y reflexiones directamente en tu correo, 
                como secretos susurrados entre amigos de alma.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-stone-100"
                />
                <Button
                  variant="primary"
                  className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100"
                >
                  Suscribirse
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-8 rounded-2xl border border-slate-700/50 hover:border-red-600/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-800/20 to-red-600/20 rounded-full flex items-center justify-center">
                    <span className="text-red-400">✍️</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-stone-100">{post.title}</h3>
                    <time className="text-sm text-slate-400">{post.date}</time>
                  </div>
                </div>
                
                <blockquote className="font-serif italic text-slate-300 text-lg leading-relaxed mb-4 pl-4 border-l-2 border-red-600/30">
                  {post.excerpt}
                </blockquote>
                
                <p className="text-slate-400 leading-relaxed mb-6">
                  {post.content}
                </p>
                
                <Button
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 p-0"
                >
                  Leer carta completa →
                </Button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-100 mb-8">
              Conectemos Almas
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Para colaboraciones, encargos literarios o simplemente para compartir 
              un susurro en la inmensidad digital.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Contact Form */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-red-800/20">
                <h3 className="font-serif text-2xl font-bold text-stone-100 mb-6">Envíame un Mensaje</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 text-stone-100"
                  />
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 text-stone-100"
                  />
                  <textarea
                    placeholder="Tu mensaje..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 text-stone-100 resize-vertical"
                  />
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100"
                  >
                    Enviar Susurro
                  </Button>
                </form>
              </div>

              {/* Social Links */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                  <h4 className="font-serif text-xl font-bold text-red-600 mb-4">Sígueme</h4>
                  <div className="space-y-3">
                    <a href="https://www.instagram.com/ciriwhispers/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">📷</span>
                      <span>Instagram @CiriWhispers</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">📺</span>
                      <span>YouTube - Lecturas (Próximamente)</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">🎵</span>
                      <span>Spotify - Audiolibros (Próximamente)</span>
                    </a>
                    <a href="/editorial" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">📚</span>
                      <span>Editorial MaalCa</span>
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                  <h4 className="font-serif text-xl font-bold text-red-600 mb-4">Servicios</h4>
                  <ul className="text-slate-300 space-y-2 text-sm mb-6">
                    <li>✍️ Textos personalizados</li>
                    <li>📖 Prólogos y reseñas</li>
                    <li>🎭 Talleres de escritura creativa</li>
                    <li>📝 Ghostwriting literario</li>
                  </ul>
                  <a href="/servicios" className="block">
                    <button className="inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 focus:ring-amber-500 hover:shadow-lg px-8 py-4 text-lg border-text-primary text-text-primary hover:bg-text-primary hover:text-background w-full">
                      Ver Todos los Servicios
                    </button>
                  </a>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="border-t border-red-800/20 pt-8">
              <p className="font-serif italic text-stone-100 text-lg">
                "Siempre tuyo, @CiriWhispers"
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default function CiriWhispersPage() {
  return (
    <LanguageProvider>
      <CiriWhispersContent />
    </LanguageProvider>
  );
}