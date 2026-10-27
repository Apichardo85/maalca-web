"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";

// Los 3 pasos del flujo real: crear el espacio, encender módulos, gestionar desde el panel.
// Es una secuencia de verdad, por eso van numerados.
const STEPS = ["create", "turnOn", "run"] as const;

// Capacidades en lenguaje del dueño (no los tokens internos del catálogo de módulos).
const CAPABILITIES = [
  { key: "page", icon: "🌐" },
  { key: "orders", icon: "🧾" },
  { key: "screen", icon: "📺" },
  { key: "agenda", icon: "📅" },
  { key: "team", icon: "⏱️" },
  { key: "panel", icon: "📊" },
] as const;

export default function DocsPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero — qué es MaalCa, en palabras llanas */}
      <section className="px-6 pt-28 pb-16 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary mb-6">
            {t("docs.eyebrow")}
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-[1.1]">
            {t("docs.title")}
          </h1>
          <p className="mt-6 text-lg text-text-secondary leading-relaxed">{t("docs.description")}</p>
        </div>
      </section>

      {/* Cómo funciona — 3 pasos */}
      <section className="px-6 py-16 bg-surface">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary text-center mb-14">
            {t("docs.how.title")}
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {STEPS.map((step, i) => (
              <li key={step} className="relative">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-bold text-brand-primary/25 leading-none">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {t(`docs.how.${step}.title`)}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  {t(`docs.how.${step}.desc`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Qué puedes encender — capacidades en lenguaje del dueño */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
              {t("docs.caps.title")}
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">{t("docs.caps.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.key}
                className="rounded-2xl border border-border bg-surface-elevated p-6 transition-colors duration-200 hover:border-brand-primary/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-xl">
                  {cap.icon}
                </span>
                <h3 className="mt-4 font-semibold text-text-primary">
                  {t(`docs.cap.${cap.key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {t(`docs.cap.${cap.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface px-8 py-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
            {t("docs.cta.title")}
          </h2>
          <p className="mt-3 text-text-secondary leading-relaxed">{t("docs.cta.subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/servicios"
              className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover"
            >
              {t("docs.cta.plans")}
            </Link>
            <Link
              href="/casos"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-brand-primary"
            >
              {t("docs.cta.cases")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
