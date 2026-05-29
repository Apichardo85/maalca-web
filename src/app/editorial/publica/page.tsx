"use client";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { EDITORIAL_ASSISTED_PRICE_DISPLAY } from "@/config/editorial-pricing";

const assistedBulletKeys = [
  'publica.assisted.b1',
  'publica.assisted.b2',
  'publica.assisted.b3',
  'publica.assisted.b4',
  'publica.assisted.b5',
  'publica.assisted.b6',
];

const curatedBulletKeys = [
  'publica.curated.b1',
  'publica.curated.b2',
  'publica.curated.b3',
  'publica.curated.b4',
  'publica.curated.b5',
];

export default function PublicaPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
            {t('publica.eyebrow')}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-6 leading-tight">
            {t('publica.hero.title')}
            <span className="block text-amber-600 dark:text-amber-400">
              {t('editorial.tracks.title')}.
            </span>
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            {t('publica.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Tracks */}
      <section className="py-16 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Track Asistido */}
            <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">
                  {t('editorial.track.assisted.title')}
                </p>
                <p className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {EDITORIAL_ASSISTED_PRICE_DISPLAY}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
                  {t('publica.assisted.payment')}
                </p>
              </div>
              <p className="text-stone-700 dark:text-stone-300 mb-6 leading-relaxed">
                {t('publica.assisted.desc')}
              </p>
              <ul className="space-y-3 mb-8">
                {assistedBulletKeys.map((k) => (
                  <li key={k} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>
                    {t(k)}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:editorial@maalca.com?subject=Track Asistido — quiero publicar"
                className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {t('publica.assisted.cta')}
              </a>
            </div>

            {/* Track Curado */}
            <div className="rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">
                  {t('editorial.track.curated.title')}
                </p>
                <p className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {t('editorial.track.curated.price')}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
                  {t('publica.curated.payment')}
                </p>
              </div>
              <p className="text-stone-700 dark:text-stone-300 mb-6 leading-relaxed">
                {t('publica.curated.desc')}
              </p>
              <ul className="space-y-3 mb-8">
                {curatedBulletKeys.map((k) => (
                  <li key={k} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <span className="text-stone-400 mt-0.5 flex-shrink-0">✓</span>
                    {t(k)}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:editorial@maalca.com?subject=Track Curado — envío de manuscrito"
                className="block w-full text-center border-2 border-stone-800 dark:border-stone-300 text-stone-800 dark:text-stone-300 hover:bg-stone-800 dark:hover:bg-stone-300 hover:text-white dark:hover:text-stone-900 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {t('publica.curated.cta')}
              </a>
            </div>
          </div>

          <p className="text-center text-sm text-stone-400 dark:text-stone-600 mt-8">
            {t('publica.contact')}{' '}
            <a href="mailto:editorial@maalca.com" className="text-amber-600 hover:underline">
              editorial@maalca.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
