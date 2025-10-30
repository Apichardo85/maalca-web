"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { useAnalytics } from "@/hooks/useAnalytics";
import ProfessionalReader from "@/components/editorial/ProfessionalReader";
import { editorialArticles } from "@/data/editorialContent";

const articles = [
  {
    id: "filosofia-calle-2024",
    title: "Filosofía de la Calle: Reflexiones desde el Asfalto Dominicano",
    excerpt: "Una exploración profunda sobre cómo la sabiduría popular dominicana se convierte en filosofía práctica para la vida moderna.",
    category: "Filosofía",
    readTime: "12 min",
    publishDate: "2024-03-15",
    author: "MaalCa Editorial",
    featured: true,
    tags: ["Filosofía", "Cultura", "República Dominicana"]
  },
  {
    id: "creatividad-humana-ia",
    title: "Creatividad Humana en la Era de la IA: Mantener el Alma en el Arte",
    excerpt: "Análisis de cómo los creadores pueden mantener su esencia humana mientras abrazan las herramientas de inteligencia artificial.",
    category: "Tecnología",
    readTime: "8 min",
    publishDate: "2024-02-28",
    author: "MaalCa Editorial",
    featured: false,
    tags: ["IA", "Creatividad", "Tecnología"]
  },
  {
    id: "ecosistemas-creativos",
    title: "Construyendo Ecosistemas Creativos: Lecciones desde el Caribe",
    excerpt: "Cómo crear redes de colaboración auténticas que nutran tanto la creatividad individual como el crecimiento colectivo.",
    category: "Negocios",
    readTime: "15 min",
    publishDate: "2024-02-10",
    author: "MaalCa Editorial",
    featured: true,
    tags: ["Negocios", "Creatividad", "Colaboración"]
  },
  {
    id: "identidad-global-local",
    title: "Identidad Global con Corazón Local: El Dilema del Creador Moderno",
    excerpt: "Reflexiones sobre mantener las raíces culturales mientras se compite en un mercado global digitalizado.",
    category: "Cultura",
    readTime: "10 min",
    publishDate: "2024-01-22",
    author: "MaalCa Editorial",
    featured: false,
    tags: ["Cultura", "Globalización", "Identidad"]
  },
  {
    id: "futuro-trabajo-humano",
    title: "El Futuro del Trabajo Humano: Más Allá de la Productividad",
    excerpt: "Una visión alternativa del trabajo que prioriza el bienestar, la creatividad y la conexión humana por encima de la eficiencia pura.",
    category: "Sociedad",
    readTime: "14 min",
    publishDate: "2024-01-08",
    author: "MaalCa Editorial",
    featured: false,
    tags: ["Trabajo", "Sociedad", "Bienestar"]
  },
  {
    id: "arte-resistencia-digital",
    title: "Arte como Resistencia en la Era Digital",
    excerpt: "Cómo los artistas latinoamericanos utilizan medios digitales para preservar y transformar narrativas culturales.",
    category: "Arte",
    readTime: "11 min",
    publishDate: "2023-12-18",
    author: "MaalCa Editorial",
    featured: false,
    tags: ["Arte", "Digital", "Resistencia"]
  }
];

const categories = ["Todos", "Filosofía", "Tecnología", "Negocios", "Cultura", "Sociedad", "Arte"];

const books = [
  {
    title: "Filosofía Callejera: Sabiduría del Asfalto Dominicano",
    description: "Una colección de reflexiones filosóficas nacidas en las calles de República Dominicana",
    status: "Disponible en Amazon KDP",
    cover: "🏙️",
    link: "#"
  },
  {
    title: "Ecosistemas Creativos: Manual para Constructores de Cultura",
    description: "Guía práctica para crear y mantener comunidades creativas sostenibles",
    status: "Próximamente",
    cover: "🌱",
    link: "#"
  },
  {
    title: "Humanidad Digital: Preservando el Alma en Tiempos Tecnológicos",
    description: "Reflexiones sobre mantener nuestra esencia humana en un mundo cada vez más digital",
    status: "En desarrollo",
    cover: "🤖",
    link: "#"
  }
];

export default function EditorialPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { trackArticleClick } = useAnalytics('editorial');

  const filteredArticles = selectedCategory === "Todos"
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  const featuredArticles = articles.filter(article => article.featured);

  const getArticleContent = (articleId: string) => {
    return editorialArticles[articleId as keyof typeof editorialArticles] || "Contenido no disponible";
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('¡Suscripción exitosa! Revisa tu email.');
        setEmail('');
      } else {
        setMessage(data.error || 'Error al suscribirse');
      }
    } catch (error) {
      setMessage('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-text-primary pt-20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6">
                Editorial
                <span className="block text-brand-primary">MaalCa</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                Exploramos la intersección entre filosofía, cultura y sociedad contemporánea.
                Pensamientos profundos con la autenticidad del Caribe y la perspectiva global.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Artículos Destacados
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {featuredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                onClick={() => {
                  trackArticleClick(article.id);
                  setSelectedArticle(article.id);
                }}
              >
                <div className="bg-surface rounded-2xl overflow-hidden border border-border hover:border-brand-primary transition-all duration-300 shadow-sm hover:shadow-xl h-full">
                  {/* Article Image Placeholder */}
                  <div className="aspect-[16/9] bg-gradient-to-br from-brand-primary/10 to-surface-elevated flex items-center justify-center">
                    <div className="text-6xl opacity-30">📖</div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Category and Meta */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                        {article.category}
                      </span>
                      <span className="text-sm text-text-muted">{article.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-text-primary mb-4 group-hover:text-brand-primary-hover transition-colors leading-tight">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-text-secondary leading-relaxed mb-6">
                      {article.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-text-muted">
                      <span>{article.author}</span>
                      <time dateTime={article.publishDate}>
                        {new Date(article.publishDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Filters */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-8">
              Todos los Artículos
            </h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-brand-primary text-text-primary'
                      : 'bg-surface-elevated text-text-secondary hover:bg-brand-primary/20 hover:text-brand-primary border border-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => {
                  trackArticleClick(article.id);
                  setSelectedArticle(article.id);
                }}
              >
                  <div className="bg-surface-elevated rounded-2xl p-6 h-full border border-border hover:border-brand-primary transition-all duration-300 hover:shadow-lg">
                  {/* Category */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-surface text-text-secondary border border-border">
                      {article.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-text-primary mb-3 group-hover:text-brand-primary-hover transition-colors leading-tight">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">
                    {article.excerpt.slice(0, 120)}...
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-text-muted bg-surface px-2 py-1 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
                    <span>{article.readTime}</span>
                    <time dateTime={article.publishDate}>
                      {new Date(article.publishDate).toLocaleDateString('es-ES')}
                    </time>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="py-16 md:py-24 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Nuestros Libros
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Pensamientos profundos compilados en formato libro, disponibles globalmente a través de Amazon KDP
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <motion.div
                key={book.title}
                className="group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="bg-surface rounded-2xl p-8 text-center border border-border hover:border-brand-primary transition-all duration-300 shadow-sm hover:shadow-xl h-full">
                  {/* Book Cover */}
                  <div className="text-6xl mb-6">{book.cover}</div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-4">
                    {book.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed mb-6">
                    {book.description}
                  </p>

                  {/* Status */}
                  <div className="mb-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      book.status === 'Disponible en Amazon KDP'
                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                        : book.status === 'Próximamente'
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
                        : 'bg-orange-900/30 text-orange-400 border border-orange-700'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  {/* CTA */}
                  <Button
                    variant={book.status === 'Disponible en Amazon KDP' ? 'primary' : 'outline'}
                    className={book.status === 'Disponible en Amazon KDP'
                      ? 'bg-brand-primary hover:bg-brand-primary-hover w-full text-text-primary'
                      : 'w-full border-brand-primary/50 text-brand-primary hover:bg-brand-primary hover:text-text-primary'
                    }
                    disabled={book.status !== 'Disponible en Amazon KDP'}
                  >
                    {book.status === 'Disponible en Amazon KDP' ? 'Comprar en Amazon' : 'Próximamente'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Mantente Conectado
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Recibe nuestros artículos más profundos directamente en tu correo.
              Filosofía, cultura y reflexiones auténticas desde el Caribe.
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-surface-elevated border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-brand-primary transition-colors text-text-primary placeholder-gray-400 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary-hover px-6 text-text-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Suscribirse'}
                </Button>
              </div>

              {message && (
                <p className={`text-sm mt-2 ${
                  message.includes('exitosa') ? 'text-green-400' : 'text-brand-primary'
                }`}>
                  {message}
                </p>
              )}

              <p className="text-xs text-text-muted mt-2">
                Sin spam. Solo reflexiones profundas cada semana.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <ProfessionalReader
            articleId={selectedArticle}
            title={articles.find(a => a.id === selectedArticle)?.title || "Artículo"}
            author="Editorial MaalCa"
            content={getArticleContent(selectedArticle)}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
