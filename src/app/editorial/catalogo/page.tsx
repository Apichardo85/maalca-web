"use client";
import Link from "next/link";
import { books } from "@/data/ciriwhispers/books";
import { EDITORIAL_ASSISTED_PRICE_DISPLAY } from "@/config/editorial-pricing";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function CatalogoPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
              {t('catalogo.eyebrow')}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              {t('catalogo.title')}
            </h1>
            <p className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              {t('catalogo.desc')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/ciriwhispers/obras/${book.id}`}
                className="group"
              >
                <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-lg bg-white dark:bg-stone-900">
                  <div className="aspect-[2/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/projects/ciriwhispers.png";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1 leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{book.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-16 p-8 rounded-2xl border border-dashed border-amber-200 dark:border-amber-800">
            <p className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
              {t('catalogo.callout.title')}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-500 mb-4">
              {EDITORIAL_ASSISTED_PRICE_DISPLAY} {t('catalogo.callout.desc')}
            </p>
            <Link
              href="/editorial/publica"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              {t('catalogo.callout.link')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
