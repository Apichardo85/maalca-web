"use client";
import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import LandingClip from "@/components/home/LandingClip";
import { BusinessBrandCard, type BusinessBrand } from "@/components/public/BusinessBrandCard";

// La marca viva de cada negocio destacado llega de /api/public/affiliates/featured (ver
// page.tsx) — mismo shape que consume BusinessBrandCard. Se cura desde /ops (IsFeatured).
export type FeaturedAffiliate = BusinessBrand;

interface Props {
  featuredAffiliates: FeaturedAffiliate[];
}

// Clips del comercial (public/media/landing/*-{es,en}.mp4). Cada uno existe en los dos
// idiomas: la ruta se arma con el idioma activo, así el toggle cambia también el video.
const FLOW_CLIPS = [
  { file: "flujo-pedido", titleKey: "home.flows.order.title", descKey: "home.flows.order.desc" },
  { file: "flujo-pantalla", titleKey: "home.flows.screen.title", descKey: "home.flows.screen.desc" },
  { file: "flujo-negocios", titleKey: "home.flows.spaces.title", descKey: "home.flows.spaces.desc" },
];

// Franja de precios de la home. Los montos son los mismos de /servicios (planes atados a los
// Price IDs de Stripe); el detalle completo vive allá.
const PRICING_STRIP = [
  { name: "Starter", priceKey: "home.pricing.starter.price", descKey: "home.pricing.starter.desc", featured: false },
  { name: "Growth", priceKey: "home.pricing.growth.price", descKey: "home.pricing.growth.desc", featured: true },
  { name: "Professional", priceKey: "home.pricing.professional.price", descKey: "home.pricing.professional.desc", featured: false },
];

const STEP_KEYS = ["home.steps.1", "home.steps.2", "home.steps.3", "home.steps.4"];
// Timeline real de "Sobre MaalCa" (ver seccion id="about") -- claves ya existian en
// useSimpleLanguage.tsx, nunca se habian consumido en ningun componente.
const ABOUT_TIMELINE_KEYS = [
  { title: "about.foundation", desc: "about.foundation.desc" },
  { title: "about.expansion", desc: "about.expansion.desc" },
  { title: "about.consolidation", desc: "about.consolidation.desc" },
  { title: "about.platform", desc: "about.platform.desc" },
];

// Landing reordenada (sept. 2026): hero al tope, menos secciones, imágenes reales de negocios
// afiliados en vez de mockups genéricos. Reemplaza la versión anterior "ecosistema MaalCa"
// (secciones #plataforma/#como-funciona/#about con grid de 9 módulos + formulario propio) —
// aprobada primero como mockup, con fotos reales de Pegote y The Little Dominican ya en
// producción (develop) antes de escribirse aquí. featuredAffiliates queda disponible (ya
// vive en page.tsx) para cuando esta sección se vuelva data-driven.
//
// Todo el copy pasa por t() (home.* en useSimpleLanguage.tsx) — la primera versión de esta
// landing tenía el texto escrito directo en español y el toggle de idioma solo cambiaba el
// Header/Footer, no el cuerpo de la página. Corregido sept. 2026.
export default function HomeClient({ featuredAffiliates }: Props) {
  const { t, language } = useTranslation();
  const lang = language === "en" ? "en" : "es";

  return (
    <main className="w-full bg-surface">
      {/* ============ HERO ============ */}
      <section className="w-full px-6 md:px-16 pt-20 pb-16 md:pt-24 md:pb-20 flex flex-col items-center text-center bg-gradient-to-b from-surface-elevated to-surface">
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-semibold mb-6">
          {t("home.hero.pill")}
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-[1.15] max-w-3xl text-text-primary">
          {t("home.hero.title1")}
          <br />
          {t("home.hero.title2")} <span className="text-brand-primary">{t("home.hero.titleHighlight")}</span>.
        </h1>
        <p className="max-w-xl mt-6 text-lg leading-relaxed text-text-secondary">
          {t("home.hero.subtitle")}
        </p>
        <div className="mt-9 flex items-center gap-6 flex-wrap justify-center">
          <Link
            href="/onboarding"
            className="px-7 py-3.5 rounded-full text-base font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-lg"
          >
            {t("home.hero.ctaPrimary")}
          </Link>
          <a href="#plataforma" className="text-base font-semibold text-text-primary hover:text-brand-primary transition-colors">
            {t("home.hero.ctaSecondary")}
          </a>
        </div>

        <div className="mt-14 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-black/5">
          <div className="bg-surface-muted px-4 py-2.5 flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
          </div>
          {/* Comercial de 56 s en loop, mudo, en el idioma activo (key = recarga al cambiar). */}
          <LandingClip
            key={`hero-${lang}`}
            eager
            src={`/media/landing/hero-comercial-${lang}.mp4`}
            poster={`/media/landing/hero-comercial-${lang}-poster.jpg`}
            label={t("home.hero.videoAlt")}
            className="w-full h-auto block"
          />
        </div>
      </section>

      {/* ============ NEGOCIOS REALES ============
          Tarjetas de marca viva (mismo componente que /casos), alimentadas por los destacados
          del API. Si todavía no hay ninguno marcado, la sección se oculta para no dejar un hueco. */}
      {featuredAffiliates.length > 0 && (
        <section id="plataforma" className="w-full px-6 md:px-16 py-20 md:py-24 bg-surface-muted flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary">{t("home.showcase.heading")}</h2>
          <p className="mt-2.5 text-text-secondary text-center max-w-xl">{t("home.showcase.subtitle")}</p>

          <div className="mt-12 w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAffiliates.map((b) => (
              <BusinessBrandCard key={b.slug} brand={b} />
            ))}
          </div>

          <Link
            href="/casos"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            {t("home.showcase.cta")}
          </Link>
        </section>
      )}


      {/* ============ ASÍ FUNCIONA ============
          Tres cortes del comercial — pedido, pantalla y espacios — cada uno arranca solo al
          entrar en pantalla (LandingClip). */}
      <section className="w-full px-6 md:px-16 py-20 md:py-24 bg-surface flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary">{t("home.flows.heading")}</h2>
        <p className="mt-2.5 text-text-secondary text-center">{t("home.flows.subtitle")}</p>
        <div className="mt-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {FLOW_CLIPS.map((clip) => (
            <div key={clip.file} className="bg-surface-elevated border border-border rounded-2xl overflow-hidden flex flex-col">
              <LandingClip
                key={`${clip.file}-${lang}`}
                src={`/media/landing/${clip.file}-${lang}.mp4`}
                poster={`/media/landing/${clip.file}-${lang}-poster.jpg`}
                label={t(clip.titleKey)}
                className="w-full aspect-video object-cover bg-black"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold text-text-primary">{t(clip.titleKey)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{t(clip.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ ASÍ DE SIMPLE ============ */}
      <section className="w-full px-6 md:px-16 py-16 md:py-20 bg-surface flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary">{t("home.steps.heading")}</h2>
        <div className="mt-9 w-full max-w-3xl relative">
          {/* Línea de tiempo conectando los 4 pasos. En móvil la grilla es una sola columna
              con los pasos apilados, así que la línea es vertical a la izquierda de los
              círculos; en desktop (md+) pasa a 4 columnas y la línea es horizontal por
              arriba de los círculos. */}
          <div
            className="md:hidden absolute top-5 bottom-5 left-5 w-0.5 bg-brand-primary/20"
            aria-hidden="true"
          />
          <div
            className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-brand-primary/20"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 md:grid md:grid-cols-4">
            {STEP_KEYS.map((stepKey, i) => (
              <div
                key={stepKey}
                className="flex items-center gap-3 text-left md:flex-col md:items-center md:text-center md:gap-2.5"
              >
                <div className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="text-sm font-semibold text-text-primary">{t(stepKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SOBRE MAALCA ============
          El footer enlaza "Sobre MaalCa" a /#about desde 2026-08 (Footer.tsx), pero esta
          seccion nunca existio -- el id="about" estaba puesto en el CTA final de abajo, asi
          que el link llevaba al mismo boton generico de "empieza ya" que ya se ve en el hero,
          sin ningun contenido real sobre la empresa. Las claves de traduccion about.* (titulo,
          descripcion, timeline de 4 pasos) ya estaban escritas en useSimpleLanguage.tsx desde
          antes pero nunca se consumian en ningun componente -- se usan aca por primera vez. */}
      <section id="about" className="w-full px-6 md:px-16 py-20 md:py-24 bg-surface flex flex-col items-center">
        <div className="max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">{t("about.title")}</h2>
          <p className="mt-4 text-base text-text-secondary leading-relaxed">{t("about.description")}</p>
        </div>
        <div className="mt-12 w-full max-w-3xl relative">
          {/* Mismo patron de linea de tiempo que "ASÍ DE SIMPLE" arriba -- vertical en movil,
              horizontal en desktop. */}
          <div
            className="md:hidden absolute top-5 bottom-5 left-5 w-0.5 bg-brand-primary/20"
            aria-hidden="true"
          />
          <div
            className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-0.5 bg-brand-primary/20"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 md:grid md:grid-cols-4">
            {ABOUT_TIMELINE_KEYS.map((stepKey, i) => (
              <div
                key={stepKey.title}
                className="flex items-start gap-3 text-left md:flex-col md:items-center md:text-center md:gap-2.5"
              >
                <div className="relative z-10 shrink-0 w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">{t(stepKey.title)}</div>
                  <div className="mt-1 text-xs text-text-secondary leading-relaxed">{t(stepKey.desc)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRECIOS (franja) ============ */}
      <section className="w-full px-6 md:px-16 py-16 md:py-20 bg-surface-muted flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-text-primary">{t("home.pricing.heading")}</h2>
        <div className="mt-8 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PRICING_STRIP.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border bg-surface ${
                plan.featured ? "border-brand-primary shadow-lg" : "border-border"
              }`}
            >
              <div className="text-xs font-bold tracking-wider text-brand-primary">{plan.name.toUpperCase()}</div>
              <div className="mt-2 text-3xl font-bold text-text-primary">{t(plan.priceKey)}</div>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{t(plan.descKey)}</p>
            </div>
          ))}
        </div>
        <Link
          href="/servicios"
          className="mt-8 px-6 py-3 rounded-full text-sm font-semibold border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        >
          {t("home.pricing.cta")}
        </Link>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="w-full px-6 md:px-16 py-20 md:py-24 bg-[#0b1220] flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold text-white">{t("home.cta.heading")}</h2>
        <p className="mt-3 text-sm text-white/60">{t("home.cta.subtitle")}</p>
        <Link
          href="/onboarding"
          className="mt-7 px-8 py-3.5 rounded-full text-base font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
        >
          {t("home.hero.ctaPrimary")}
        </Link>
      </section>
    </main>
  );
}
