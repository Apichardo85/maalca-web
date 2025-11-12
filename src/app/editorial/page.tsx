"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import ProfessionalReader from "@/components/editorial/ProfessionalReader";
import { editorialArticles } from "@/data/editorialContent";

// Article metadata (translation keys will be used for title/excerpt)
const articlesData = [
  {
    id: "filosofia-calle-2024",
    titleKey: "filosofia-calle",
    categoryKey: "philosophy",
    readTime: "12",
    publishDate: "2024-03-15",
    featured: true,
    tags: ["Filosofía", "Cultura", "República Dominicana"]
  },
  {
    id: "creatividad-humana-ia",
    titleKey: "creatividad-ia",
    categoryKey: "technology",
    readTime: "8",
    publishDate: "2024-02-28",
    featured: false,
    tags: ["IA", "Creatividad", "Tecnología"]
  },
  {
    id: "ecosistemas-creativos",
    titleKey: "ecosistemas-creativos",
    categoryKey: "business",
    readTime: "15",
    publishDate: "2024-02-10",
    featured: true,
    tags: ["Negocios", "Creatividad", "Colaboración"]
  },
  {
    id: "identidad-global-local",
    titleKey: "identidad-global",
    categoryKey: "culture",
    readTime: "10",
    publishDate: "2024-01-22",
    featured: false,
    tags: ["Cultura", "Globalización", "Identidad"]
  },
  {
    id: "futuro-trabajo-humano",
    titleKey: "futuro-trabajo",
    categoryKey: "society",
    readTime: "14",
    publishDate: "2024-01-08",
    featured: false,
    tags: ["Trabajo", "Sociedad", "Bienestar"]
  },
  {
    id: "arte-resistencia-digital",
    titleKey: "arte-resistencia",
    categoryKey: "art",
    readTime: "11",
    publishDate: "2023-12-18",
    featured: false,
    tags: ["Arte", "Digital", "Resistencia"]
  }
];

// Book metadata (translation keys will be used)
const booksData = [
  {
    key: "filosofia-callejera",
    cover: "🏙️",
    link: "#",
    statusType: "available"
  },
  {
    key: "ecosistemas",
    cover: "🌱",
    link: "#",
    statusType: "coming"
  },
  {
    key: "humanidad-digital",
    cover: "🤖",
    link: "#",
    statusType: "development"
  }
];

// Category keys
const categoryKeys = ["all", "philosophy", "technology", "business", "culture", "society", "art"];

export default function EditorialPage() {
  const { t, language } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { trackArticleClick } = useAnalytics('editorial');

  // Transform articles data with translations
  const articles = articlesData.map(article => ({
    ...article,
    title: t(`editorial.article.${article.titleKey}.title`),
    excerpt: t(`editorial.article.${article.titleKey}.excerpt`),
    category: t(`editorial.category.${article.categoryKey}`),
    author: t('editorial.author')
  }));

  // Filter articles
  const filteredArticles = selectedCategory === "all"
    ? articles
    : articles.filter(article => article.categoryKey === selectedCategory);

  const featuredArticles = articles.filter(article => article.featured);

  // Transform books data with translations
  const books = booksData.map(book => ({
    ...book,
    title: t(`editorial.book.${book.key}.title`),
    description: t(`editorial.book.${book.key}.description`),
    status: t(`editorial.book.${book.key}.status`)
  }));

  const getArticleContent = (articleId: string) => {
    return editorialArticles[articleId as keyof typeof editorialArticles] || t('editorial.contentNotAvailable');
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
        setMessage(t('editorial.newsletter.success'));
        setEmail('');
      } else {
        setMessage(data.error || t('editorial.newsletter.error'));
      }
    } catch (error) {
      setMessage(t('editorial.newsletter.errorConnection'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white pt-20">
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
                {t('editorial.hero.title')}
                <span className="block text-brand-primary">{t('editorial.hero.brand')}</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                {t('editorial.hero.description')}
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
              {t('editorial.featured.title')}
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
                      <span className="text-sm text-gray-400">{article.readTime} {t('editorial.readTime')}</span>
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
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{article.author}</span>
                      <time dateTime={article.publishDate}>
                        {new Date(article.publishDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
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
              {t('editorial.all.title')}
            </h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categoryKeys.map((categoryKey) => (
                <button
                  key={categoryKey}
                  onClick={() => setSelectedCategory(categoryKey)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === categoryKey
                      ? 'bg-brand-primary text-white'
                      : 'bg-surface-elevated text-text-secondary hover:bg-brand-primary/20 hover:text-brand-primary border border-border'
                  }`}
                >
                  {t(`editorial.category.${categoryKey}`)}
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
                        className="text-xs text-gray-400 bg-surface px-2 py-1 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-border">
                    <span>{article.readTime} {t('editorial.readTime')}</span>
                    <time dateTime={article.publishDate}>
                      {new Date(article.publishDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}
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
              {t('editorial.books.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('editorial.books.description')}
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
                      book.statusType === 'available'
                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                        : book.statusType === 'coming'
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
                        : 'bg-orange-900/30 text-orange-400 border border-orange-700'
                    }`}>
                      {book.status}
                    </span>
                  </div>

                  {/* CTA */}
                  <Button
                    variant={book.statusType === 'available' ? 'primary' : 'outline'}
                    className={book.statusType === 'available'
                      ? 'bg-brand-primary hover:bg-brand-primary-hover w-full text-white'
                      : 'w-full border-brand-primary/50 text-brand-primary hover:bg-brand-primary hover:text-white'
                    }
                    disabled={book.statusType !== 'available'}
                  >
                    {book.statusType === 'available' ? t('editorial.book.cta.buy') : t('editorial.book.cta.comingSoon')}
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
              {t('editorial.newsletter.title')}
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              {t('editorial.newsletter.description')}
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('editorial.newsletter.placeholder')}
                  required
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-surface-elevated border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-brand-primary transition-colors text-text-primary placeholder-gray-400 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary-hover px-6 text-white disabled:opacity-50"
                >
                  {isSubmitting ? t('editorial.newsletter.submitting') : t('editorial.newsletter.submit')}
                </Button>
              </div>

              {message && (
                <p className={`text-sm mt-2 ${
                  message.includes(t('editorial.newsletter.success')) || message.includes('exitosa') ? 'text-green-400' : 'text-brand-primary'
                }`}>
                  {message}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {t('editorial.newsletter.disclaimer')}
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
            title={articles.find(a => a.id === selectedArticle)?.title || t('editorial.hero.title')}
            author={t('editorial.author')}
            content={getArticleContent(selectedArticle)}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
