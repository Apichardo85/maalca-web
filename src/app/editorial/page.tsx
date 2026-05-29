"use client";
import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { books } from "@/data/ciriwhispers/books";
import { EDITORIAL_ASSISTED_PRICE_DISPLAY } from "@/config/editorial-pricing";

const assistedFeatures = [
  "Pack completo: formateo, ISBN, portada, distribución",
  "Tu libro en Amazon KDP en menos de 30 días",
  "Las regalías son 100% tuyas",
  "Sin upsells. Sin trampas. Un precio claro.",
];

const curatedFeatures = [
  "Lectura editorial real del manuscrito",
  "Revisión y sugerencias literarias",
  "Publicación con difusión activa",
  "Compartimos regalías — te damos voz",
];

const aiItems = [
  "Formateo del manuscrito a estándares de impresión y eBook",
  "Generación de propuestas de portada (tú eliges la final)",
  "Optimización de metadatos para descubrimiento en Amazon",
  "Setup de ISBN y distribución técnica",
];

const humanItems = [
  "Lectura editorial del manuscrito",
  "Decisión sobre obras del Track Curado",
  "Comunicación contigo durante el proceso",
  "Críticas y sugerencias literarias (Track Curado)",
];

export default function EditorialPage() {
  const { t } = useTranslation();

  return (
    <div>
      {/* ─── HERO ───────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-6">
            {t('editorial.hero.eyebrow')}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 dark:text-stone-100 leading-tight mb-8">
            {t('editorial.hero.title')}
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed mb-12 max-w-2xl mx-auto">
            {t('editorial.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/editorial/publica"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-base"
            >
              {t('editorial.hero.cta.primary')} — {EDITORIAL_ASSISTED_PRICE_DISPLAY}
            </Link>
            <Link
              href="/editorial/catalogo"
              className="border-2 border-stone-800 dark:border-stone-300 text-stone-800 dark:text-stone-300 hover:bg-stone-800 dark:hover:bg-stone-300 hover:text-white dark:hover:text-stone-900 font-semibold px-8 py-3.5 rounded-full transition-colors text-base"
            >
              {t('editorial.hero.cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TWO TRACKS ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 text-center mb-12">
            {t('editorial.tracks.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Track Asistido */}
            <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">
                  {t('editorial.track.assisted.title')}
                </p>
                <p className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-100">
                  {EDITORIAL_ASSISTED_PRICE_DISPLAY}
                </p>
                <p className="text-stone-500 dark:text-stone-500 text-sm mt-1">
                  {t('editorial.track.assisted.subtitle')}
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {assistedFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/editorial/publica"
                className="block text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Empezar mi publicación →
              </Link>
            </div>

            {/* Track Curado */}
            <div className="rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">
                  {t('editorial.track.curated.title')}
                </p>
                <p className="font-serif text-4xl font-bold text-stone-900 dark:text-stone-100">
                  {t('editorial.track.curated.price')}
                </p>
                <p className="text-stone-500 dark:text-stone-500 text-sm mt-1">
                  {t('editorial.track.curated.subtitle')}
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {curatedFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <span className="text-stone-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:editorial@maalca.com?subject=Track Curado — envío de manuscrito"
                className="block text-center border-2 border-stone-800 dark:border-stone-300 text-stone-800 dark:text-stone-300 hover:bg-stone-800 dark:hover:bg-stone-300 hover:text-white dark:hover:text-stone-900 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Enviar mi manuscrito →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECH vs HUMANS ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 text-center mb-12">
            {t('editorial.tech.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  {t('editorial.tech.ai.title')}
                </h3>
              </div>
              <ul className="space-y-3">
                {aiItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600 dark:text-stone-400">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Humans */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border-2 border-stone-800 dark:border-stone-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                  {t('editorial.tech.human.title')}
                </h3>
              </div>
              <ul className="space-y-3">
                {humanItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600 dark:text-stone-400">
                    <span className="text-stone-800 dark:text-stone-300 font-bold mt-0.5 flex-shrink-0">✱</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATALOG PREVIEW ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100">
              Obras publicadas
            </h2>
            <Link
              href="/editorial/catalogo"
              className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {books.slice(0, 4).map((book) => (
              <Link
                key={book.id}
                href={`/ciriwhispers/obras/${book.id}`}
                className="group"
              >
                <div className="rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all bg-stone-50 dark:bg-stone-800">
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/projects/ciriwhispers.png";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-serif text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {book.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARTICLES LINK ──────────────────────────────────────────────────── */}
      <section className="py-12 bg-stone-50 dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-stone-500 dark:text-stone-500 text-sm mb-3">
            También publicamos ensayos y reflexiones.
          </p>
          <Link
            href="/editorial/articulos"
            className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            Ver artículos →
          </Link>
        </div>
      </section>
    </div>
  );
}
