"use client";
import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";
export default function ManifiestoPage() {
  const { t } = useTranslation();
  const values = [
    { title: t("ciriwhispers.manifiesto.value1.title"), desc: t("ciriwhispers.manifiesto.value1.desc") },
    { title: t("ciriwhispers.manifiesto.value2.title"), desc: t("ciriwhispers.manifiesto.value2.desc") },
    { title: t("ciriwhispers.manifiesto.value3.title"), desc: t("ciriwhispers.manifiesto.value3.desc") },
  ];
  return (
    <div className="min-h-screen">
      {/* Hero quote */}
      <section className="relative py-24 px-4 text-center">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--ciri-bg-subtle), var(--ciri-bg))' }} />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-sm font-semibold tracking-widest uppercase mb-8" style={{ color: 'var(--ciri-brand)' }}>
            {t("ciriwhispers.manifiesto.label")}
          </p>
          <blockquote className="font-serif text-3xl md:text-5xl leading-tight italic mb-8" style={{ color: 'var(--ciri-text)' }}>
            &ldquo;{t("ciriwhispers.manifiesto.quote")}&rdquo;
          </blockquote>
          <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: 'var(--ciri-brand)' }} />
        </div>
      </section>
      {/* About */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Author intro */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--ciri-brand), var(--ciri-brand-hover))' }}>
              <span className="font-serif text-5xl text-white italic">C</span>
            </div>
            <div>
              <h2 className="font-serif text-2xl mb-1" style={{ color: 'var(--ciri-text)' }}>
                {t("ciriwhispers.manifiesto.name")}
              </h2>
              <p className="text-sm font-medium mb-4" style={{ color: 'var(--ciri-brand)' }}>
                {t("ciriwhispers.manifiesto.role")}
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--ciri-text-secondary)' }}>
                {t("ciriwhispers.manifiesto.intro")}
              </p>
            </div>
          </div>
          {/* Manifesto body */}
          <div className="space-y-6 leading-relaxed" style={{ color: 'var(--ciri-text-secondary)' }}>
            <p>{t("ciriwhispers.manifiesto.p1")}</p>
            <p>{t("ciriwhispers.manifiesto.p2")}</p>
            <div className="pl-6 py-2" style={{ borderLeft: '2px solid var(--ciri-brand)' }}>
              <p className="font-serif text-xl italic" style={{ color: 'var(--ciri-text)' }}>
                {t("ciriwhispers.manifiesto.pullquote")}
              </p>
            </div>
            <p>{t("ciriwhispers.manifiesto.p3")}</p>
            <p>{t("ciriwhispers.manifiesto.p4")}</p>
          </div>
          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {values.map((item) => (
              <div key={item.title} className="rounded-xl p-5"
                style={{ border: '1px solid var(--ciri-border)', backgroundColor: 'var(--ciri-surface)' }}>
                <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--ciri-brand)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ciri-text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          {/* Links */}
          <div className="flex flex-wrap gap-4 pt-8">
            <a
              href="https://www.instagram.com/ciriwhispers/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-full text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--ciri-brand)' }}
            >
              Instagram
            </a>
            <a
              href="https://www.amazon.com/stores/Ciriaco-Alejandro-Pichardo-Santana/author/B0DFH93HCJ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors"
              style={{ border: '1px solid var(--ciri-border)', color: 'var(--ciri-text-secondary)' }}
            >
              Amazon
            </a>
            <Link
              href="/ciriwhispers/biblioteca"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors"
              style={{ border: '1px solid var(--ciri-border)', color: 'var(--ciri-text-secondary)' }}
            >
              {t("ciriwhispers.manifiesto.cta.read")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
