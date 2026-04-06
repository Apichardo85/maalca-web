"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

export default function CiriFooter() {
  const { t } = useTranslation();

  return (
    <footer style={{ backgroundColor: 'var(--ciri-footer-bg)', color: 'var(--ciri-footer-text)' }}>
      {/* Newsletter */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl font-bold text-white mb-2">
            {t("ciriwhispers.footer.newsletter.title")}
          </h3>
          <p className="text-sm" style={{ color: 'var(--ciri-footer-muted)' }}>
            {t("ciriwhispers.footer.newsletter.desc")}
          </p>
        </div>
        <NewsletterSignup source="ciriwhispers" className="max-w-md mx-auto" />
      </div>

      {/* Links + Credits */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-serif text-lg font-bold mb-3" style={{ color: 'var(--ciri-brand)' }}>{t("ciriwhispers.footer.nav")}</h4>
              <div className="space-y-2">
                <Link href="/ciriwhispers/biblioteca" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--ciri-footer-muted)' }}>
                  {t("ciriwhispers.footer.biblioteca")}
                </Link>
                <Link href="/ciriwhispers/obras" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--ciri-footer-muted)' }}>
                  {t("ciriwhispers.footer.obras")}
                </Link>
                <Link href="/hablando-mierda" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--ciri-footer-muted)' }}>
                  {t("ciriwhispers.footer.podcast")}
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold mb-3" style={{ color: 'var(--ciri-brand)' }}>{t("ciriwhispers.footer.connect")}</h4>
              <div className="space-y-2">
                <a href="https://www.instagram.com/ciriwhispers/" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--ciri-footer-muted)' }}>
                  Instagram
                </a>
                <a href="https://www.amazon.com/stores/Ciriaco-Alejandro-Pichardo-Santana/author/B0DFH93HCJ" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--ciri-footer-muted)' }}>
                  Amazon
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold mb-3" style={{ color: 'var(--ciri-brand)' }}>{t("ciriwhispers.footer.ecosystem")}</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--ciri-footer-muted)' }}>
                  MaalCa
                </Link>
                <Link href="/editorial" className="block text-sm transition-colors hover:text-white" style={{ color: 'var(--ciri-footer-muted)' }}>
                  {t("ciriwhispers.footer.editorial")}
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-serif italic text-sm" style={{ color: 'var(--ciri-footer-muted)' }}>
              &ldquo;{t("ciriwhispers.footer.quote")}&rdquo;
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--ciri-footer-muted)', opacity: 0.6 }}>
              &copy; {new Date().getFullYear()} CiriWhispers &mdash; Editorial MaalCa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
