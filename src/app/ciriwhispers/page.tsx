"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";

const books = [
  {
    id: "amaranta",
    title: "Amaranta",
    subtitle: "Thriller Psicológico",
    synopsis: "Una exploración íntima del alma humana a través de los ojos de una mujer que navega entre la realidad y los fantasmas de su pasado.",
    cover: "/images/books/amaranta.jpg",
    status: "Disponible",
    amazonLink: "#",
    excerpt: "En la penumbra de su memoria, Amaranta encontró las palabras que nunca pudo decir en vida...",
    year: "2024"
  },
  {
    id: "luz-sombras",
    title: "Luz de sus Sombras",
    subtitle: "Narrativa Poética",
    synopsis: "Cartas de amor escritas en tinta de medianoche, donde cada palabra es un susurro entre lo sagrado y lo profano.",
    cover: "/images/books/luz-sombras.jpg",
    status: "Disponible",
    amazonLink: "#",
    excerpt: "Hay luces que solo brillan en la oscuridad más absoluta, como las estrellas que nacen del vacío...",
    year: "2023"
  },
  {
    id: "cartas-hiedra",
    title: "Cartas a la Hiedra",
    subtitle: "Colección Epistolar",
    synopsis: "Correspondencia íntima con la naturaleza, donde cada hoja es un verso y cada raíz una confesión.",
    cover: "/images/books/cartas-hiedra.jpg",
    status: "En progreso",
    amazonLink: "#",
    excerpt: "Querida Hiedra, tus brazos abrazan muros como yo abrazo palabras: con la desesperación del que sabe que todo es efímero...",
    year: "2024"
  },
  {
    id: "cosas-no-contar",
    title: "Cosas que no hay que contar",
    subtitle: "Reflexiones Íntimas",
    synopsis: "Los secretos que guardamos en el corazón, contados en susurros para que solo el viento los escuche.",
    cover: "/images/books/cosas-no-contar.jpg",
    status: "En desarrollo",
    amazonLink: "#",
    excerpt: "Hay historias que se escriben con lágrimas en papel invisible, para que solo el alma las pueda leer...",
    year: "2025"
  },
  {
    id: "elmira-ny",
    title: "Elmira, NY",
    subtitle: "Crónicas del Exilio",
    synopsis: "Reflexiones sobre la identidad y el arraigo desde una pequeña ciudad americana que guarda historias universales.",
    cover: "/images/books/elmira-ny.jpg",
    status: "En desarrollo",
    amazonLink: "#",
    excerpt: "En Elmira aprendí que el exilio no es un lugar, sino un estado del alma que se lleva a todas partes...",
    year: "2025"
  }
];

const blogPosts = [
  {
    id: "carta-1",
    title: "Primera Carta a la Hiedra",
    date: "Diciembre 2024",
    excerpt: "Querida compañera de muros silenciosos...",
    content: "Te escribo desde esta ventana que da al jardín abandonado, donde tus brazos verdes se extienden como los míos cuando busco palabras en el aire..."
  },
  {
    id: "medianoche",
    title: "Confesiones de Medianoche",
    date: "Noviembre 2024", 
    excerpt: "En la hora en que el mundo duerme...",
    content: "Hay algo sagrado en escribir cuando todos duermen. Las palabras fluyen diferentes, más honestas, como si la oscuridad las purificara..."
  },
  {
    id: "elmira-invierno",
    title: "Invierno en Elmira",
    date: "Enero 2024",
    excerpt: "La nieve cubre los secretos...",
    content: "Este pueblo americano me ha enseñado que la soledad puede ser un hogar cuando se abraza con palabras..."
  }
];

export default function CiriWhispersPage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl">🪶</div>
          <div className="absolute top-40 right-20 text-4xl">🖋️</div>
          <div className="absolute bottom-20 left-20 text-5xl">📜</div>
          <div className="absolute bottom-40 right-10 text-3xl">🕯️</div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            {/* Author Photo Placeholder */}
            <div className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-900/30 to-slate-700/50 border border-amber-600/20 flex items-center justify-center">
              <span className="text-6xl opacity-60">👤</span>
            </div>

            <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              CiriWhispers
            </h1>
            
            <p className="text-2xl md:text-3xl font-light text-slate-300 mb-8 italic font-serif">
              "En cada palabra susurrada vive un universo"
            </p>
            
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Autor de thriller psicológico y narrativa poética. Explorador de los rincones más íntimos del alma humana, 
              donde la oscuridad y la luz danzan en perfecta armonía.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection('portafolio')}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-900 font-semibold"
              >
                Explorar mi Obra
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('cartas')}
                className="border-amber-600/50 text-amber-400 hover:bg-amber-600/10"
              >
                Leer mis Cartas
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
          <div className="w-1 h-12 bg-gradient-to-b from-transparent via-amber-400 to-transparent rounded-full"></div>
        </motion.div>
      </section>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="font-serif text-xl font-bold text-amber-400">CiriWhispers</span>
            
            <div className="hidden md:flex space-x-8">
              {[
                { id: 'home', label: 'Inicio' },
                { id: 'sobre-mi', label: 'Sobre Mí' },
                { id: 'portafolio', label: 'Obras' },
                { id: 'cartas', label: 'Cartas' },
                { id: 'contacto', label: 'Contacto' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`transition-colors ${
                    activeSection === item.id 
                      ? 'text-amber-400' 
                      : 'text-slate-300 hover:text-amber-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
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
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-amber-400 mb-8">
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
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-amber-600/20">
                <h3 className="font-serif text-2xl font-bold text-amber-400 mb-6">Mi Filosofía</h3>
                <blockquote className="text-slate-300 italic text-lg leading-relaxed mb-6 font-serif">
                  "Escribo porque en el silencio encuentro las voces más auténticas. 
                  Cada historia nace de la necesidad de dar luz a las sombras que todos llevamos dentro."
                </blockquote>
                <p className="text-slate-400 leading-relaxed">
                  Desde Elmira, NY, exploro los laberintos del alma humana a través de thrillers psicológicos y narrativa poética. 
                  Influenciado por Poe, Bukowski y el realismo mágico, busco esa delgada línea entre lo tangible y lo etéreo.
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
                <h4 className="font-serif text-xl font-bold text-amber-400 mb-3">Inspiraciones</h4>
                <ul className="text-slate-300 space-y-2">
                  <li>📖 Edgar Allan Poe - El maestro de lo macabro poético</li>
                  <li>🍷 Charles Bukowski - La honestidad brutal</li>
                  <li>✨ Realismo Mágico - Donde lo cotidiano se vuelve extraordinario</li>
                  <li>🌙 La noche como musa y confidente</li>
                </ul>
              </div>

              <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                <h4 className="font-serif text-xl font-bold text-amber-400 mb-3">Mi Proceso</h4>
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
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-amber-400 mb-8">
              Obras Publicadas
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Cada libro es un fragmento de alma transformado en palabras, una invitación a explorar 
              los rincones más profundos de la experiencia humana.
            </p>
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
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden border border-amber-600/20 hover:border-amber-500/40 transition-all duration-300">
                  {/* Book Cover */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-amber-900/20 to-slate-800/50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50"></div>
                    <span className="text-6xl opacity-40">📖</span>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        book.status === 'Disponible' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                          : book.status === 'En progreso'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        {book.status}
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-400 font-medium">{book.year}</span>
                      <span className="text-xs text-slate-400">{book.subtitle}</span>
                    </div>
                    
                    <h3 className="font-serif text-xl font-bold text-amber-300 mb-3 group-hover:text-amber-400 transition-colors">
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
                        
                        {book.status === 'Disponible' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-amber-600/50 text-amber-400 hover:bg-amber-600/10"
                          >
                            Comprar en Amazon
                          </Button>
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
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-amber-400 mb-8">
              Cartas desde el Alma
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Reflexiones íntimas, fragmentos de vida y susurros nocturnos compartidos 
              en la intimidad de estas páginas digitales.
            </p>
            
            {/* Newsletter Signup */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-amber-600/20 mb-12">
              <h3 className="font-serif text-xl font-bold text-amber-300 mb-4">
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
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-slate-300"
                />
                <Button
                  variant="primary"
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-900"
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
                className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-8 rounded-2xl border border-slate-700/50 hover:border-amber-600/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600/20 to-amber-700/20 rounded-full flex items-center justify-center">
                    <span className="text-amber-400">✍️</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-amber-300">{post.title}</h3>
                    <time className="text-sm text-slate-400">{post.date}</time>
                  </div>
                </div>
                
                <blockquote className="font-serif italic text-slate-300 text-lg leading-relaxed mb-4 pl-4 border-l-2 border-amber-600/30">
                  {post.excerpt}
                </blockquote>
                
                <p className="text-slate-400 leading-relaxed mb-6">
                  {post.content}
                </p>
                
                <Button
                  variant="ghost"
                  className="text-amber-400 hover:text-amber-300 p-0"
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
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-amber-400 mb-8">
              Conectemos Almas
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              Para colaboraciones, encargos literarios o simplemente para compartir 
              un susurro en la inmensidad digital.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Contact Form */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-amber-600/20">
                <h3 className="font-serif text-2xl font-bold text-amber-300 mb-6">Envíame un Mensaje</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-300"
                  />
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-300"
                  />
                  <textarea
                    placeholder="Tu mensaje..."
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-300 resize-vertical"
                  />
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-slate-900"
                  >
                    Enviar Susurro
                  </Button>
                </form>
              </div>

              {/* Social Links */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                  <h4 className="font-serif text-xl font-bold text-amber-400 mb-4">Sígueme</h4>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                      <span className="text-xl">📷</span>
                      <span>Instagram @CiriWhispers</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                      <span className="text-xl">📺</span>
                      <span>YouTube - Lecturas</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                      <span className="text-xl">🎵</span>
                      <span>Spotify - Audiolibros</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-amber-400 transition-colors">
                      <span className="text-xl">📚</span>
                      <span>Editorial MaalCa</span>
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                  <h4 className="font-serif text-xl font-bold text-amber-400 mb-4">Servicios</h4>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>✍️ Textos personalizados</li>
                    <li>📖 Prólogos y reseñas</li>
                    <li>🎭 Talleres de escritura creativa</li>
                    <li>📝 Ghostwriting literario</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="border-t border-amber-600/20 pt-8">
              <p className="font-serif italic text-amber-400 text-lg">
                "Siempre tuyo, @CiriWhispers"
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}