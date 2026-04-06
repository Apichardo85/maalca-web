"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export default function ContactoCiriWhispersPage() {
  const { t } = useTranslation();

  const collabs = [
    { title: t("ciriwhispers.contacto2.collab1.title"), desc: t("ciriwhispers.contacto2.collab1.desc") },
    { title: t("ciriwhispers.contacto2.collab2.title"), desc: t("ciriwhispers.contacto2.collab2.desc") },
    { title: t("ciriwhispers.contacto2.collab3.title"), desc: t("ciriwhispers.contacto2.collab3.desc") },
    { title: t("ciriwhispers.contacto2.collab4.title"), desc: t("ciriwhispers.contacto2.collab4.desc") },
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ciri-brand)' }}>
            {t("ciriwhispers.contacto2.label")}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl mb-4" style={{ color: 'var(--ciri-text)' }}>
            {t("ciriwhispers.contacto2.title")}
          </h1>
          <p className="max-w-lg mx-auto" style={{ color: 'var(--ciri-text-muted)' }}>
            {t("ciriwhispers.contacto2.desc")}
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            { icon: "\u2709", titleKey: "ciriwhispers.contacto2.email.title", descKey: "ciriwhispers.contacto2.email.desc", link: "mailto:ciriwhispers@maalca.com", linkText: "ciriwhispers@maalca.com" },
            { icon: "\uD83D\uDCF7", titleKey: "ciriwhispers.contacto2.instagram.title", descKey: "ciriwhispers.contacto2.instagram.desc", link: "https://www.instagram.com/ciriwhispers/", linkText: "@ciriwhispers", external: true },
            { icon: "\uD83D\uDCDA", titleKey: "ciriwhispers.contacto2.amazon.title", descKey: "ciriwhispers.contacto2.amazon.desc", link: "https://www.amazon.com/stores/Ciriaco-Alejandro-Pichardo-Santana/author/B0DFH93HCJ", linkText: t("ciriwhispers.contacto2.amazon.link"), external: true },
            { icon: "\uD83C\uDF99\uFE0F", titleKey: "ciriwhispers.contacto2.podcast.title", descKey: "ciriwhispers.contacto2.podcast.desc", link: "/hablando-mierda", linkText: "Hablando Mierda \u2192" },
          ].map((card) => (
            <div key={card.titleKey} className="rounded-xl p-6 transition-colors"
              style={{ border: '1px solid var(--ciri-border)', backgroundColor: 'var(--ciri-surface)' }}>
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="font-serif text-lg mb-1" style={{ color: 'var(--ciri-text)' }}>{t(card.titleKey)}</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--ciri-text-muted)' }}>{t(card.descKey)}</p>
              {card.external ? (
                <a href={card.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium transition-colors" style={{ color: 'var(--ciri-brand)' }}>
                  {card.linkText}
                </a>
              ) : card.link.startsWith("mailto") ? (
                <a href={card.link} className="text-sm font-medium transition-colors" style={{ color: 'var(--ciri-brand)' }}>
                  {card.linkText}
                </a>
              ) : (
                <Link href={card.link} className="text-sm font-medium transition-colors" style={{ color: 'var(--ciri-brand)' }}>
                  {card.linkText}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Collaboration types */}
        <div className="rounded-xl p-8 mb-12"
          style={{ border: '1px solid var(--ciri-border)', backgroundColor: 'var(--ciri-surface)' }}>
          <h2 className="font-serif text-xl mb-6" style={{ color: 'var(--ciri-text)' }}>
            {t("ciriwhispers.contacto2.collab.title")}
          </h2>
          <div className="space-y-4">
            {collabs.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--ciri-brand)' }} />
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--ciri-text)' }}>{item.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--ciri-text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to main contact */}
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--ciri-text-faint)' }}>
            {t("ciriwhispers.contacto2.maalca")}
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors"
            style={{ border: '1px solid var(--ciri-border)', color: 'var(--ciri-text-secondary)' }}
          >
            {t("ciriwhispers.contacto2.maalcaLink")} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
