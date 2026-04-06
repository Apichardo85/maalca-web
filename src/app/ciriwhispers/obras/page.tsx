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
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2D1B11] mb-4">
          {t("ciriwhispers.obras2.title")}
        </h1>
        <p className="text-[#8B7355] text-lg max-w-2xl mx-auto">
          {t("ciriwhispers.obras2.desc")}
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
                <div className="opacity-70">
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
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E8DED1] hover:border-[#8B1A1A]/30 transition-all duration-300 shadow-sm">
      {/* Cover */}
      <div className="aspect-[3/4] bg-gradient-to-br from-[#F5F0E8] to-[#E8DED1] flex items-center justify-center relative overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#2D1B11]/30 hidden items-center justify-center">
          <span className="text-6xl opacity-40">&#128214;</span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              isAvailable
                ? "bg-[#8B1A1A]/90 text-white"
                : "bg-[#5C3D2E]/80 text-[#E8DED1]"
            }`}
          >
            {statusText}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#8B1A1A] font-medium">{book.year}</span>
          <span className="text-xs text-[#A89580]">{book.subtitle}</span>
        </div>
        <h3 className="font-serif text-xl font-bold text-[#2D1B11] mb-3 group-hover:text-[#8B1A1A] transition-colors">
          {t(book.titleKey)}
        </h3>
        <p className="text-[#8B7355] text-sm leading-relaxed line-clamp-3">
          {t(book.synopsisKey)}
        </p>
      </div>
    </div>
  );
}
