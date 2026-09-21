"use client";
import Link from "next/link";
import { useState } from "react";

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
  alt: string;
}

interface ShowcaseBusiness {
  id: string;
  pillLabel: string;
  category: string;
  name: string;
  description: string;
  images: ShowcaseImage[];
}

// Negocios reales operando hoy en producción — nada de mockups. Cuando haya más afiliados
// destacados (ver featuredAffiliates, ya expuesto por page.tsx vía /api/public/affiliates/featured)
// esta lista puede volverse dinámica; por ahora son los dos casos con captura real aprobados.
// Cada negocio trae varias capturas — las que muestran los módulos que más le importan a ESE
// tipo de negocio (barbería: fila, agenda, pantalla pública / restaurante: cocina, POS, menú,
// pedidos) — en vez de una sola imagen genérica del dashboard.
const SHOWCASE: ShowcaseBusiness[] = [
  {
    id: "pegote",
    pillLabel: "Barbería — Pegote",
    category: "BARBERÍA",
    name: "Pegote",
    description:
      "Template dinámico ya sirviendo en producción — reservas, catálogo de servicios y perfil del negocio, todo desde un mismo espacio.",
    images: [
      { src: "/images/landing/pegote/waiting-queue.png", alt: "Fila de espera en tiempo real de Pegote Barbershop en MaalCa" },
      { src: "/images/landing/pegote/screen-board.png", alt: "Pantalla pública con la fila y el menú de servicios de Pegote Barbershop en MaalCa" },
      { src: "/images/landing/pegote/agenda.png", alt: "Agenda de citas por barbero de Pegote Barbershop en MaalCa" },
      { src: "/images/landing/pegote/booking.png", alt: "Página pública de reservas con el equipo de barberos de Pegote Barbershop en MaalCa" },
      { src: "/images/landing/pegote/branding.png", alt: "Personalización de marca y espacio digital de Pegote Barbershop en MaalCa" },
    ],
  },
  {
    id: "little-dominicana",
    pillLabel: "Restaurante — The Little Dominican",
    category: "RESTAURANTE",
    name: "The Little Dominican",
    description:
      "Menú, modificadores y pedidos gestionados desde el mismo panel — sin plantillas genéricas para un restaurante real.",
    images: [
      { src: "/images/landing/little-dominican/kitchen.png", alt: "Pantalla de cocina (KDS) de The Little Dominican en MaalCa" },
      { src: "/images/landing/little-dominican/pos.png", alt: "Punto de venta de The Little Dominican en MaalCa" },
      { src: "/images/landing/little-dominican/catalog.png", alt: "Catálogo / menú de The Little Dominican en MaalCa" },
      { src: "/images/landing/little-dominican/orders.png", alt: "Pedidos de The Little Dominican en MaalCa" },
      { src: "/images/landing/little-dominican/dashboard.png", alt: "Panel principal de The Little Dominican en MaalCa" },
      { src: "/images/landing/little-dominican/stats.png", alt: "Estadísticas de The Little Dominican en MaalCa" },
      { src: "/images/landing/little-dominican/qr-card.png", alt: "Código QR y tarjeta de negocio de The Little Dominican en MaalCa" },
    ],
  },
];

const STEPS = ["Crea tu espacio", "Personaliza tu marca", "Publica en un clic", "Gestiona todo desde ahí"];

// Landing reordenada (sept. 2026): hero al tope, menos secciones, imágenes reales de negocios
// afiliados en vez de mockups genéricos. Reemplaza la versión anterior "ecosistema MaalCa"
// (secciones #plataforma/#como-funciona/#about con grid de 9 módulos + formulario propio) —
// aprobada primero como mockup, con fotos reales de Pegote y The Little Dominican ya en
// producción (develop) antes de escribirse aquí. featuredAffiliates queda disponible (ya
// vive en page.tsx) para cuando esta sección se vuelva data-driven.
export default function HomeClient({ featuredAffiliates: _featuredAffiliates }: Props) {
  const [selectedId, setSelectedId] = useState(SHOWCASE[0].id);
  const [imageIndex, setImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const business = SHOWCASE.find((b) => b.id === selectedId) ?? SHOWCASE[0];
  const image = business.images[imageIndex] ?? business.images[0];

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
          Para negocios independientes
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-[1.15] max-w-3xl text-text-primary">
          No necesitas una página web.
          <br />
          Necesitas tu <span className="text-brand-primary">espacio digital</span>.
        </h1>
        <p className="max-w-xl mt-6 text-lg leading-relaxed text-text-secondary">
          Crea, personaliza, publica y gestiona el espacio digital de tu negocio. Sin código. Sin plantillas
          genéricas.
        </p>
        <div className="mt-9 flex items-center gap-6 flex-wrap justify-center">
          <Link
            href="/servicios"
            className="px-7 py-3.5 rounded-full text-base font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-lg"
          >
            Crear mi espacio gratis
          </Link>
          <a href="#plataforma" className="text-base font-semibold text-text-primary hover:text-brand-primary transition-colors">
            Ver ejemplos reales →
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
            alt="Panel de módulos del espacio digital de un afiliado en MaalCa"
            className="w-full h-auto object-cover object-top"
          />
        </div>
      </section>

      {/* ============ NEGOCIOS REALES ============ */}
      <section id="plataforma" className="w-full px-6 md:px-16 py-20 md:py-24 bg-surface-muted flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary">Negocios reales, espacios reales</h2>
        <p className="mt-2.5 text-text-secondary">Nada de mockups — así lucen hoy en producción</p>

        <div className="mt-8 flex gap-2.5 flex-wrap justify-center">
          {SHOWCASE.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => selectBusiness(b.id)}
              aria-pressed={selectedId === b.id}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                selectedId === b.id
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-surface text-text-secondary border-black/10 hover:border-brand-primary/40"
              }`}
            >
              {b.pillLabel}
            </button>
          ))}
        </div>

        <div className="mt-8 w-full max-w-3xl bg-surface border border-black/5 rounded-3xl overflow-hidden">
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
                aria-label="Ampliar imagen"
                className="w-full cursor-zoom-in"
              >
                <img src={image.src} alt={image.alt} className="w-full h-auto object-contain" />
              </button>
              {business.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Imagen anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Imagen siguiente"
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
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-current={i === imageIndex}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imageIndex ? "w-5 bg-brand-primary" : "w-1.5 bg-black/15"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="p-6 md:p-7">
            <span className="text-xs font-bold tracking-wider text-brand-primary">{business.category}</span>
            <h3 className="mt-2 text-2xl font-bold text-text-primary">{business.name}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{business.description}</p>
          </div>
        </div>

        <p className="mt-5 text-xs text-text-muted text-center max-w-lg">
          Retail (BritoColor) se suma cuando el catálogo esté publicado — no mostramos mockups como si fueran reales.
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
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl"
          >
            ×
          </button>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={image.src} alt={image.alt} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
            {business.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Imagen anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Imagen siguiente"
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
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Así de simple</h2>
        <div className="mt-9 w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center text-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center">
                {i + 1}
              </div>
              <div className="text-sm font-semibold text-text-primary">{step}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section id="about" className="w-full px-6 md:px-16 py-20 md:py-24 bg-[#0b1220] flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold text-white">¿Listo para tener tu espacio digital?</h2>
        <p className="mt-3 text-sm text-white/60">Sin tarjeta de crédito. Publica hoy mismo.</p>
        <Link
          href="/servicios"
          className="mt-7 px-8 py-3.5 rounded-full text-base font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
        >
          Crear mi espacio gratis
        </Link>
      </section>
    </main>
  );
}
