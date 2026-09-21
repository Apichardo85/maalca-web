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

interface ShowcaseBusiness {
  id: string;
  pillLabel: string;
  category: string;
  name: string;
  description: string;
  image: string;
  alt: string;
}

// Negocios reales operando hoy en producción — nada de mockups. Cuando haya más afiliados
// destacados (ver featuredAffiliates, ya expuesto por page.tsx vía /api/public/affiliates/featured)
// esta lista puede volverse dinámica; por ahora son los dos casos con captura real aprobados.
const SHOWCASE: ShowcaseBusiness[] = [
  {
    id: "pegote",
    pillLabel: "Barbería — Pegote",
    category: "BARBERÍA",
    name: "Pegote",
    description:
      "Template dinámico ya sirviendo en producción — reservas, catálogo de servicios y perfil del negocio, todo desde un mismo espacio.",
    image: "/images/landing/pegote-dashboard.png",
    alt: "Panel de Pegote Barbershop en MaalCa",
  },
  {
    id: "little-dominicana",
    pillLabel: "Restaurante — The Little Dominican",
    category: "RESTAURANTE",
    name: "The Little Dominican",
    description:
      "Menú, modificadores y pedidos gestionados desde el mismo panel — sin plantillas genéricas para un restaurante real.",
    image: "/images/landing/little-dominicana-dashboard.png",
    alt: "Panel de The Little Dominican en MaalCa",
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
  const business = SHOWCASE.find((b) => b.id === selectedId) ?? SHOWCASE[0];

  return (
    <main className="w-full bg-surface">
      {/* ============ HERO ============ */}
      <section className="w-full px-6 md:px-16 pt-20 pb-16 md:pt-24 md:pb-20 flex flex-col items-center text-center bg-gradient-to-b from-surface-elevated to-surface">
        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-semibold mb-6">
          Para negocios dominicanos y latinos
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
              onClick={() => setSelectedId(b.id)}
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
          {/* La captura se muestra completa (object-contain, sin recortar) dentro de un marco
              tipo ventana — cuando haya varias fotos por módulo (fila/agenda/pantalla en
              barbería, cocina/kiosko/menú en restaurante) esta caja se vuelve un carrusel que
              rota entre ellas para el negocio seleccionado. */}
          <div className="bg-surface-muted p-3 flex flex-col gap-3">
            <div className="flex gap-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
              <span className="w-2.5 h-2.5 rounded-full bg-black/15" />
            </div>
            <div className="w-full rounded-xl overflow-hidden border border-black/5 bg-white flex items-center justify-center">
              <img src={business.image} alt={business.alt} className="w-full h-auto object-contain" />
            </div>
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
