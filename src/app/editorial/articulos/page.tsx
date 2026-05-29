"use client";
import { useState } from "react";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import ProfessionalReader from "@/components/editorial/ProfessionalReader";
import ShareButton from "@/components/editorial/ShareButton";
import { editorialArticles } from "@/data/editorialContent";

const articlesData = [
  { id: "filosofia-calle-2024", titleKey: "filosofia-calle", author: "Ciriaco A. Pichardo", categoryKey: "philosophy", readTime: "12", publishDate: "2024-03-15" },
  { id: "creatividad-humana-ia", titleKey: "creatividad-ia", author: "Ciriaco A. Pichardo", categoryKey: "technology", readTime: "8", publishDate: "2024-02-28" },
  { id: "ecosistemas-creativos", titleKey: "ecosistemas-creativos", author: "Ciriaco A. Pichardo", categoryKey: "business", readTime: "15", publishDate: "2024-02-10" },
  { id: "identidad-global-local", titleKey: "identidad-global", author: "Ciriaco A. Pichardo", categoryKey: "culture", readTime: "10", publishDate: "2024-01-22" },
  { id: "futuro-trabajo-humano", titleKey: "futuro-trabajo", author: "Ciriaco A. Pichardo", categoryKey: "society", readTime: "14", publishDate: "2024-01-08" },
  { id: "arte-resistencia-digital", titleKey: "arte-resistencia", author: "Ciriaco A. Pichardo", categoryKey: "art", readTime: "11", publishDate: "2023-12-20" },
];

const categoryKeys: Record<string, string> = {
  philosophy: 'articulos.cat.philosophy',
  technology: 'articulos.cat.technology',
  business: 'articulos.cat.business',
  culture: 'articulos.cat.culture',
  society: 'articulos.cat.society',
  art: 'articulos.cat.art',
};

const articleMap = editorialArticles as Record<string, string>;

export default function ArticulosPage() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", ...Object.keys(categoryKeys)];
  const filtered = activeCategory === "all" ? articlesData : articlesData.filter((a) => a.categoryKey === activeCategory);
  const selected = selectedId ? articlesData.find((a) => a.id === selectedId) : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="py-16 md:py-20 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
              {t('articulos.eyebrow')}
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              {t('articulos.title')}
            </h1>
            <p className="text-stone-500 dark:text-stone-500 max-w-xl mx-auto">
              {t('articulos.desc')}
            </p>
          </header>

          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-amber-600 text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {cat === "all" ? t('articulos.filter.all') : t(categoryKeys[cat])}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => {
              const title = t(`article.${article.titleKey}.title`);
              const excerpt = t(`article.${article.titleKey}.excerpt`);
              return (
                <div
                  key={article.id}
                  className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedId(article.id)}
                >
                  <div className="p-6">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-3">
                      {t(categoryKeys[article.categoryKey])}
                    </span>
                    <h3 className="font-serif text-base font-semibold text-stone-900 dark:text-stone-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-500 line-clamp-2 mb-4">{excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400 dark:text-stone-600">
                        {article.readTime} min · {article.publishDate}
                      </span>
                      <ShareButton articleId={article.id} title={title} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selected && articleMap[selected.id] && (
        <ProfessionalReader
          articleId={selected.id}
          title={t(`article.${selected.titleKey}.title`)}
          author={selected.author}
          content={articleMap[selected.id]}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  );
}
