"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "@/hooks/useSimpleLanguage";

export interface FeaturedAffiliate {
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
}

interface Props {
  featuredAffiliates: FeaturedAffiliate[];
}

interface ShowcaseImage {
  src: string;
  altKey: string;
}

interface ShowcaseBusiness {
  id: string;
  pillLabelKey: string;
  categoryKey: string;
  name: string;
  logoSrc: string;
  descriptionKey: string;
  images: ShowcaseImage[];
}

// Negocios reales operando hoy en producción — nada de mockups. Cuando haya más afiliados
// destacados (ver featuredAffiliates, ya expuesto por page.tsx vía /api/public/affiliates/featured)
// esta lista puede volverse dinámica; por ahora son los dos casos con captura real aprobados.
// Cada negocio trae varias capturas — las que muestran los módulos que más le importan a ESE
// tipo de negocio (barbería: fila, agenda, pantalla pública / restaurante: cocina, POS, menú,
// pedidos) — en vej de una sola imagen genérica del dashboard. Los textos son claves de
// traducción (home.showcase.*, ver useSimpleLanguage.tsx) resueltas con t() al renderizar —
// este array vive fuera del componente y no puede llamar a t() directamente.
const SHOWCASE: ShowcaseBusiness[] = [
  {
    id: "pegote",
    pillLabelKey: "home.showcase.pegote.pill",
    categoryKey: "home.showcase.pegote.category",
    name: "Pegote",
    logoSrc: "/images/affiliates/pegote-logo.png",
    descriptionKey: "home.showcase.pegote.description",
    images: [
      { src: "/images/landing/pegote/waiting-queue.png", altKey: "home.showcase.pegote.img.waitingQueue" },
      { src: "/images/landing/pegote/screen-board.png", altKey: "home.showcase.pegote.img.screenBoard" },
      { src: "/images/landing/pegote/agenda.png", altKey: "home.showcase.pegote.img.agenda" },
      { src: "/images/landing/pegote/booking.png", altKey: "home.showcase.pegote.img.booking" },
      { src: "/images/landing/pegote/branding.png", altKey: "home.showcase.pegote.img.branding" },
    ],
  },
  {
    id: "little-dominicana",
    pillLabelKey: "home.showcase.littleDominican.pill",
    categoryKey: "home.showcase.littleDominican.category",
    name: "The Little Dominican",
    logoSrc: "/images/affiliates/little-dominican-logo-v2.png",
    descriptionKey: "home.showcase.littleDominican.description",
    images: [
      { src: "/images/landing/little-dominican/kitchen.png", altKey: "home.showcase.littleDominican.img.kitchen" },
      { src: "/images/landing/little-dominican/pos.png", altKey: "home.showcase.littleDominican.img.pos" },
      { src: "/images/landing/little-dominican/catalog.png", altKey: "home.showcase.littleDominican.img.catalog" },
      { src: "/images/landing/little-dominican/orders.png", altKey: "home.showcase.littleDominican.img.orders" },
      { src: "/images/landing/little-dominican/dashboard.png", altKey: "home.showcase.littleDominican.img.dashboard" },
      { src: "/images/landing/little-dominican/stats.png", altKey: "home.showcase.littleDominican.img.stats" },
      { src: "/images/landing/little-dominican/qr-card.png", altKey: "home.showcase.littleDominican.img.qrCard" },
    ],
  },
];

const STEP_KEYS = ["home.steps.1", "home.steps.2", "home.steps.3", "home.steps.4"];

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
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState(SHOWCASE[0].id);
  const [imageIndex, setImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const baseBusiness = SHOWCASE.find((b) => b.id === selectedId) ?? SHOWCASE[0];
  // Las capturas del carrusel siguen curadas a mano (SHOWCASE) -- no hay (todavia) un
  // sistema para curar/ordenar screenshots por afiliado en el backend. Pero nombre, logo
  // y descripcion ya se pueden traer en vivo desde /api/public/affiliates/featured (ver
  // page.tsx) cuando el afiliado esta marcado is_featured y su slug coincide con el id
  // de SHOWCASE -- si no hay match (afiliado no featured todavia, slug distinto, etc.)
  // se usa el fallback hardcodeado de siempre, asi este merge nunca rompe el homepage.
  const live = featuredAffiliates.find((a) => a.slug === baseBusiness.id);
  const business = live
    ? { ...baseBusiness, name: live.name, logoSrc: live.logoUrl || baseBusiness.logoSrc }
    : baseBusiness;
  const liveDescription = live?.description || null;
  const image = business.images[imageIndex] ?? business.images[0];
  const imageAlt = t(image.altKey);

  const selectBusiness = (id: string) => {
    setSelectedId(id);
    setImageIndex(0);
  };
  const prevImage = () => setImageIndex((i) => (i - 1 + business.images.length) % business.images.length);
  const nextImage = () => setImageIndex((i) => (i + 1) % business.images.length);

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
            href="/servicios"
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
          <img
            src="/images/landing/modules-panel.png"
            alt={t("home.hero.mockupAlt")}
            className="w-full h-auto object-cover object-top"
          />
        </div>
      </section>

      {/* ============ NEGOCIOS REALES ============ */}
      <section id="plataforma" className="w-full px-6 md:px-16 py-20 md:py-24 bg-surface-muted flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary">{t("home.showcase.heading")}</h2>
        <p className="mt-2.5 text-text-secondary">{t("home.showcase.subtitle")}</p>

        <div className="mt-8 flex gap-2.5 flex-wrap justify-center">
          {SHOWCASE.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => selectBusiness(b.id)}
              aria-pressed={selectedId === b.id}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                selectedId === b.id
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-surface text-text-secondary border-black/10 hover:border-brand-primary/40"
              }`}
            >
              {t(b.pillLabelKey)}
            </button>
          ))}
        </div>

        <div className="mt-8 w-full max-w-4xl bg-surface border border-black/5 rounded-3xl overflow-hidden">
          {/* Cada negocio trae varias capturas de los módulos que más usa — la caja rota entre
              ellas (flechas + puntos) en vez de forzar una sola imagen genérica del dashboard.
              La captura se muestra completa (object-contain, sin recortar) dentro de un marco
              tipo ventana. */}
          <div className="bg-surface-muted p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
              </div>
              {business.images.length > 1 && (
                <span className="text-xs font-medium text-text-muted">
                  {imageIndex + 1} / {business.images.length}
                </span>
              )}
            </div>
            <div className="relative w-full rounded-xl overflow-hidden border border-black/5 bg-white flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                aria-label={t("home.showcase.zoomImage")}
                className="w-full cursor-zoom-in"
              >
                <img src={image.src} alt={imageAlt} className="w-full h-auto object-contain" />
              </button>
              {business.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label={t("home.showcase.prevImage")}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label={t("home.showcase.nextImage")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {business.images.length > 1 && (
              <div className="flex gap-1.5 justify-center pt-1">
                {business.images.map((img, i) => (
                  <button
                    key={img.src}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    aria-label={`${t("home.showcase.viewImage")} ${i + 1}`}
                    aria-current={i === imageIndex}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imageIndex ? "w-5 bg-brand-primary" : "w-1.5 bg-black/15"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="p-6 md:p-7 flex gap-4 items-start">
            <img
              src={business.logoSrc}
              alt={business.name}
              className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border border-black/5 shrink-0"
            />
            <div>
              <span className="text-xs font-bold tracking-wider text-brand-primary">{t(business.categoryKey)}</span>
              <h3 className="mt-1 text-2xl font-bold text-text-primary">{business.name}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{liveDescription ?? t(business.descriptionKey)}</p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs text-text-muted text-center max-w-lg">
          {t("home.showcase.footnote")}
        </p>
      </section>

      {/* Lightbox: en móvil la captura se ve pequeña dentro de la tarjeta — al hacer clic se
          amplía a pantalla completa, con las mismas flechas para seguir navegando ahí mismo. */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label={t("home.showcase.close")}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl"
          >
            ×
          </button>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={image.src} alt={imageAlt} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
            {business.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label={t("home.showcase.prevImage")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label={t("home.showcase.nextImage")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  ›
                </button>
                <p className="mt-3 text-center text-sm text-white/70">
                  {imageIndex + 1} / {business.images.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}

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

      {/* ============ CTA FINAL ============ */}
      <section id="about" className="w-full px-6 md:px-16 py-20 md:py-24 bg-[#0b1220] flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold text-white">{t("home.cta.heading")}</h2>
        <p className="mt-3 text-sm text-white/60">{t("home.cta.subtitle")}</p>
        <Link
          href="/servicios"
          className="mt-7 px-8 py-3.5 rounded-full text-base font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
        >
          {t("home.hero.ctaPrimary")}
        </Link>
      </section>
    </main>
  );
}
