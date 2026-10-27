"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { BusinessBrandCard, type BusinessBrand } from "@/components/public/BusinessBrandCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function CasosPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Negocios reales marcados como destacados desde /ops. La tarjeta refleja su marca viva
  // (logo, portada, colores) tal cual la configuró cada negocio — no capturas estáticas.
  const [brands, setBrands] = useState<BusinessBrand[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/public/affiliates/featured`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: BusinessBrand[]) => alive && setBrands(Array.isArray(data) ? data : []))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-brand-primary tracking-wide mb-4">
            {t("casos.subtitle")}
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            {t("casos.title")}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t("cases.hero.text")}
          </p>
        </div>
      </section>

      {/* Cases grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {brands === null && !failed && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl border border-border bg-surface-elevated animate-pulse"
                />
              ))}
            </div>
          )}

          {brands && brands.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brands.map((b) => (
                <BusinessBrandCard key={b.slug} brand={b} />
              ))}
            </div>
          )}

          {((brands && brands.length === 0) || failed) && (
            <div className="mx-auto max-w-md text-center py-10">
              <p className="text-text-secondary leading-relaxed">{t("cases.empty")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Coming soon / CTA */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {t("casos.coming")}
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">{t("casos.coming.desc")}</p>
          <Button
            variant="primary"
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white"
            onClick={() => router.push("/servicios")}
          >
            {t("cases.cta.start")}
          </Button>
        </div>
      </section>
    </main>
  );
}
