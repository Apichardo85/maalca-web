"use client";

import Link from "next/link";
import { books } from "@/data/ciriwhispers/books";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function ObrasPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in-up">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-100 mb-4">
          Obras
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Novelas, poemarios y colecciones. Algunas publicadas, otras en camino.
          Todas escritas con lo que no se dice en voz alta.
        </p>
      </div>

      {/* Books grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book, index) => {
          const isAvailable = book.statusKey === "ciriwhispers.works.status.available";
          const statusText = t(book.statusKey);

          return (
            <div
              key={book.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {isAvailable ? (
                <Link href={`/ciriwhispers/obras/${book.id}`} className="group block">
                  <BookCard book={book} statusText={statusText} t={t} />
                </Link>
              ) : (
                <div className="opacity-80">
                  <BookCard book={book} statusText={statusText} t={t} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookCard({
  book,
  statusText,
  t,
}: {
  book: (typeof books)[0];
  statusText: string;
  t: (key: string) => string;
}) {
  const isAvailable = book.statusKey === "ciriwhispers.works.status.available";

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden border border-red-800/20 hover:border-red-600/40 transition-all duration-300">
      {/* Cover */}
      <div className="aspect-[3/4] bg-gradient-to-br from-red-900/20 to-slate-800/50 flex items-center justify-center relative overflow-hidden">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) {
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 hidden items-center justify-center">
          <span className="text-6xl opacity-40">📖</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              isAvailable
                ? "bg-red-600/15 text-red-400 border border-red-600/30"
                : "bg-slate-600/20 text-slate-200 border border-slate-500/30"
            }`}
          >
            {statusText}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-red-400 font-medium">{book.year}</span>
          <span className="text-xs text-slate-400">{book.subtitle}</span>
        </div>
        <h3 className="font-serif text-xl font-bold text-stone-100 mb-3 group-hover:text-red-400 transition-colors">
          {t(book.titleKey)}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {t(book.synopsisKey)}
        </p>
      </div>
    </div>
  );
}
