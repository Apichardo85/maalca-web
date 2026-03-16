"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import FirstChapter from "@/components/ui/FirstChapter";
import SensitiveNotice from "@/components/ui/SensitiveNotice";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import SocialShare from "@/components/ui/SocialShare";
import ProfessionalReader from "@/components/ui/ProfessionalReader";
import { amarantaContent, lucesSombrasContent } from "@/data/bookContent";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function CiriWhispersPage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentReaderBook, setCurrentReaderBook] = useState<any | null>(null);
  const { t, language } = useTranslation();
  const { trackBookInteraction } = useAnalytics('ciriwhispers');

  // Books data structure
  const books = [
    {
      id: "amaranta",
      title: t('ciriwhispers.book.amaranta.title'),
      subtitle: t('ciriwhispers.book.amaranta.subtitle'),
      synopsis: t('ciriwhispers.book.amaranta.synopsis'),
      cover: "/images/books/amaranta.jpg",
      status: t('ciriwhispers.works.status.available'),
      amazonLink: "https://www.amazon.com/Amaranta-Ciriaco-Alejandro-Pichardo-Santana/dp/841915122X",
      hasEpub: true,
      hasSimpleReader: true,
      excerpt: t('ciriwhispers.book.amaranta.excerpt'),
      year: "2024",
      tags: t('ciriwhispers.book.amaranta.tags'),
      notes: "Lectura inmersiva disponible - Versión demo del contenido original."
    },
    {
      id: "luz-sombras",
      title: t('ciriwhispers.book.luzsombras.title'),
      subtitle: t('ciriwhispers.book.luzsombras.subtitle'),
      synopsis: t('ciriwhispers.book.luzsombras.synopsis'),
      cover: "/images/books/luz-sombras.jpg",
      status: t('ciriwhispers.works.status.available'),
      amazonLink: "https://www.amazon.com/Luces-Sombras-Spanish-ebook/dp/B084M8356R",
      hasEpub: true,
      hasSimpleReader: true,
      excerpt: t('ciriwhispers.book.luzsombras.excerpt'),
      year: "2023",
      tags: t('ciriwhispers.book.luzsombras.tags'),
      notes: "Lectura inmersiva disponible - Selección representativa de los 106 poemas originales."
    },
    {
      id: "cartas-hiedra",
      title: t('ciriwhispers.book.cartashiedra.title'),
      subtitle: t('ciriwhispers.book.cartashiedra.subtitle'),
      synopsis: t('ciriwhispers.book.cartashiedra.synopsis'),
      cover: "/images/books/cartas-hiedra.png",
      status: t('ciriwhispers.works.status.inProgress'),
      amazonLink: "#",
      excerpt: t('ciriwhispers.book.cartashiedra.excerpt'),
      year: "2024",
      tags: t('ciriwhispers.book.cartashiedra.tags'),
      notes: "Meta en web: 30 cartas visibles (muestras selectas, no newsletter masivo)."
    },
    {
      id: "cosas-no-contar",
      title: t('ciriwhispers.book.cosasnocontar.title'),
      subtitle: t('ciriwhispers.book.cosasnocontar.subtitle'),
      synopsis: t('ciriwhispers.book.cosasnocontar.synopsis'),
      cover: "/images/books/cosas-no-contar.jpg",
      status: t('ciriwhispers.works.status.development'),
      amazonLink: "#",
      excerpt: t('ciriwhispers.book.cosasnocontar.excerpt'),
      year: "2025",
      tags: t('ciriwhispers.book.cosasnocontar.tags'),
      notes: "En progreso: 'Bloqueado', 'La nevera de las bebidas', 'El jardín y la pelirroja'."
    },
    {
      id: "elmira-ny",
      title: t('ciriwhispers.book.elmirarny.title'),
      subtitle: t('ciriwhispers.book.elmirarny.subtitle'),
      synopsis: t('ciriwhispers.book.elmirarny.synopsis'),
      cover: "/images/books/elmira-ny.svg",
      status: t('ciriwhispers.works.status.development'),
      amazonLink: "#",
      excerpt: t('ciriwhispers.book.elmirarny.excerpt'),
      year: "2025",
      tags: t('ciriwhispers.book.elmirarny.tags'),
      notes: "Vista separada Crónica/Ficción y mapa poético interactivo."
    },
    {
      id: "ramirito",
      title: t('ciriwhispers.book.ramirito.title'),
      subtitle: t('ciriwhispers.book.ramirito.subtitle'),
      synopsis: t('ciriwhispers.book.ramirito.synopsis'),
      cover: "/images/books/ramirito.svg",
      status: t('ciriwhispers.works.status.development'),
      amazonLink: "#",
      excerpt: t('ciriwhispers.book.ramirito.excerpt'),
      year: "2025",
      tags: t('ciriwhispers.book.ramirito.tags'),
      notes: "Incluye aviso breve de temas sensibles (opcional)."
    }
  ];

  const blogPosts = [
    {
      id: "perfil-autor",
      title: t('ciriwhispers.blog.perfilautor.title'),
      date: t('ciriwhispers.blog.perfilautor.date'),
      excerpt: t('ciriwhispers.blog.perfilautor.excerpt'),
      content: t('ciriwhispers.blog.perfilautor.content')
    },
    {
      id: "invierno-elmira",
      title: t('ciriwhispers.blog.invierno.title'),
      date: t('ciriwhispers.blog.invierno.date'),
      excerpt: t('ciriwhispers.blog.invierno.excerpt'),
      content: t('ciriwhispers.blog.invierno.content')
    }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openReader = (book: typeof books[0]) => {
    setCurrentReaderBook(book);
    setReaderOpen(true);
    trackBookInteraction(book.id, 'reader_open');
  };

  const closeReader = () => {
    if (currentReaderBook) {
      trackBookInteraction(currentReaderBook.id, 'reader_close');
    }
    setReaderOpen(false);
    setCurrentReaderBook(null);
  };

  const getBookContent = (bookId: string) => {
    switch (bookId) {
      case 'amaranta':
        return amarantaContent;
      case 'luz-sombras':
        return lucesSombrasContent;
      default:
        return '<p>Contenido no disponible</p>';
    }
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
              "{t('ciriwhispers.hero.subtitle')}"
            </p>

            <div className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed space-y-4">
              <p className="border-l-2 border-red-800/30 pl-4">
                {t('ciriwhispers.hero.description')}
              </p>
              <p className="text-center text-red-400/80 font-serif italic text-sm">
                🐦‍⬛ {t('ciriwhispers.hero.quote')} 🐦‍⬛
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection('portafolio')}
                className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100 font-semibold border border-red-700/30 shadow-lg hover:shadow-red-900/20"
              >
                {t('ciriwhispers.hero.enterLabyrinth')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection('cartas')}
                className="border-red-600/50 text-red-400 hover:bg-red-600/10"
              >
                {t('ciriwhispers.hero.soulWhispers')}
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
                  { id: 'sobre-mi', label: t('ciriwhispers.nav.about') },
                  { id: 'portafolio', label: t('ciriwhispers.nav.works') },
                  { id: 'cartas', label: t('ciriwhispers.nav.letters') },
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
              {t('ciriwhispers.about.title')}
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
                <h3 className="font-serif text-2xl font-bold text-red-600 mb-6">{t('ciriwhispers.about.heading')}</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  {t('ciriwhispers.about.p1')}
                </p>
                <p className="text-slate-400 leading-relaxed mb-4">
                  {t('ciriwhispers.about.p2')}
                </p>
                <p className="text-slate-300 leading-relaxed italic">
                  {t('ciriwhispers.about.p3')} <span className="text-red-400">{t('ciriwhispers.about.location')}</span>
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
                <h4 className="font-serif text-xl font-bold text-red-600 mb-3">{t('ciriwhispers.about.inspirations.title')}</h4>
                <ul className="text-slate-300 space-y-2">
                  <li>📖 {t('ciriwhispers.about.inspirations.poe')}</li>
                  <li>🍷 {t('ciriwhispers.about.inspirations.bukowski')}</li>
                  <li>✨ {t('ciriwhispers.about.inspirations.magical')}</li>
                  <li>🌙 {t('ciriwhispers.about.inspirations.night')}</li>
                </ul>
              </div>

              <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                <h4 className="font-serif text-xl font-bold text-red-600 mb-3">{t('ciriwhispers.about.process.title')}</h4>
                <p className="text-slate-300 leading-relaxed">
                  {t('ciriwhispers.about.process.description')}
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
              📚 {t('ciriwhispers.works.title')}
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
              {t('ciriwhispers.works.description')}
            </p>
            <div className="bg-red-900/10 border border-red-800/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-red-400/80 text-sm font-serif italic">
                📖 {t('ciriwhispers.works.readerNotice')}
              </p>
              <p className="text-red-300/60 text-xs mt-1">
                {t('ciriwhispers.works.readerSubnotice')}
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
                onClick={() => {
                  const newSelection = selectedBook === book.id ? null : book.id;
                  setSelectedBook(newSelection);
                  if (newSelection) {
                    trackBookInteraction(book.id, 'expand');
                  }
                }}
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
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 hidden items-center justify-center">
                      <span className="text-6xl opacity-40">📖</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        book.status === t('ciriwhispers.works.status.available')
                          ? 'bg-red-600/15 text-red-400 border border-red-600/30'
                          : book.status === t('ciriwhispers.works.status.inProgress')
                          ? 'bg-red-800/15 text-red-300 border border-red-800/30'
                          : 'bg-slate-600/20 text-slate-200 border border-slate-500/30'
                      }`}>
                        {book.status}
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

                        {book.status === t('ciriwhispers.works.status.available') && (
                          <div className="space-y-2">
                            {/* Digital Reader Button */}
                            {book.hasSimpleReader ? (
                              <Button
                                variant="primary"
                                size="sm"
                                className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100"
                                onClick={() => openReader(book)}
                              >
                                📖 {t('ciriwhispers.works.readButton')}
                              </Button>
                            ) : book.id === 'amaranta' ? (
                              <FirstChapter
                                title={book.title}
                                content={t('chapter.amaranta.content')}
                              />
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10"
                              >
                                📖 {t('ciriwhispers.works.readSoonButton')}
                              </Button>
                            )}

                            {/* Amazon Purchase Button */}
                            <a
                              href={book.amazonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                              onClick={() => trackBookInteraction(book.id, 'amazon_click')}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-stone-600/50 text-stone-400 hover:bg-stone-600/10"
                              >
                                🛒 {t('ciriwhispers.works.buyButton')}
                              </Button>
                            </a>

                            {/* Share Book */}
                            <div className="pt-3 border-t border-slate-700/30">
                              <SocialShare
                                title={`${book.title} - ${book.subtitle} | CiriWhispers`}
                                description={book.synopsis}
                                platforms={["twitter", "facebook", "whatsapp", "copy"]}
                                variant="minimal"
                                project="ciriwhispers"
                              />
                            </div>
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
              📜 {t('ciriwhispers.letters.title')}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              {t('ciriwhispers.letters.description')}
            </p>

            {/* Newsletter Signup */}
            <NewsletterSignup
              source="ciriwhispers"
              className="mb-8"
            />

            {/* Social Share */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6 rounded-xl border border-slate-700/50 mb-12">
              <SocialShare
                title={t('ciriwhispers.letters.shareTitle')}
                description={t('ciriwhispers.letters.shareDescription')}
                platforms={["twitter", "linkedin", "facebook", "whatsapp", "copy"]}
                variant="icons"
                className="justify-center"
                project="ciriwhispers"
              />
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
                  {t('ciriwhispers.works.fullLetterButton')}
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
              {t('ciriwhispers.contact.title')}
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
              {t('ciriwhispers.contact.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Contact Form */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-red-800/20">
                <h3 className="font-serif text-2xl font-bold text-stone-100 mb-6">{t('ciriwhispers.contact.form.title')}</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder={t('ciriwhispers.contact.form.name')}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 text-stone-100"
                  />
                  <input
                    type="email"
                    placeholder={t('ciriwhispers.contact.form.email')}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 text-stone-100"
                  />
                  <textarea
                    placeholder={t('ciriwhispers.contact.form.message')}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 text-stone-100 resize-vertical"
                  />
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-800 text-stone-100"
                  >
                    {t('ciriwhispers.contact.form.submit')}
                  </Button>
                </form>
              </div>

              {/* Social Links */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                  <h4 className="font-serif text-xl font-bold text-red-600 mb-4">{t('ciriwhispers.contact.social.title')}</h4>
                  <div className="space-y-3">
                    <a href="https://www.instagram.com/ciriwhispers/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">📷</span>
                      <span>{t('ciriwhispers.contact.social.instagram')}</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">📺</span>
                      <span>{t('ciriwhispers.contact.social.youtube')}</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">🎵</span>
                      <span>{t('ciriwhispers.contact.social.spotify')}</span>
                    </a>
                    <a href="/editorial" className="flex items-center gap-3 text-slate-300 hover:text-red-400 transition-colors">
                      <span className="text-xl">📚</span>
                      <span>{t('ciriwhispers.contact.social.editorial')}</span>
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                  <h4 className="font-serif text-xl font-bold text-red-600 mb-4">{t('ciriwhispers.contact.services.title')}</h4>
                  <ul className="text-slate-300 space-y-2 text-sm">
                    <li>✍️ {t('ciriwhispers.contact.services.texts')}</li>
                    <li>📖 {t('ciriwhispers.contact.services.prologues')}</li>
                    <li>🎭 {t('ciriwhispers.contact.services.workshops')}</li>
                    <li>📝 {t('ciriwhispers.contact.services.ghostwriting')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="border-t border-red-800/20 pt-8">
              <p className="font-serif italic text-stone-100 text-lg">
                {t('ciriwhispers.contact.signature')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Digital Reader Modal */}
      <AnimatePresence>
        {readerOpen && currentReaderBook && (
          <ProfessionalReader
            bookId={currentReaderBook.id}
            title={currentReaderBook.title}
            author="Ciriaco A. Pichardo (CiriWhispers)"
            content={getBookContent(currentReaderBook.id)}
            onClose={closeReader}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
