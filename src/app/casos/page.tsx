"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { useTranslation } from "@/hooks/useSimpleLanguage";

const cases = [
  {
    id: "pegote-barbershop",
    name: "Pegote Barbershop",
    location: "Elmira, NY",
    type: "Barbería",
    logo: "/images/affiliates/pegote-logo.png",
    fallback: "PB",
    status: "Piloto activo",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    description:
      "Primer cliente piloto de MaalCa. Barbería dominicana con presencia en Elmira, NY.",
    modules: ["Presencia digital", "Catálogo de servicios", "Reservas online"],
    moduleStatus: "En configuración",
    href: "/pegote-barber",
  },
  {
    id: "the-little-dominican",
    name: "Little Dominicana Restaurant",
    location: "315 E Water St, Elmira NY 14901",
    type: "Restaurante",
    logo: "/images/affiliates/tld/Logo.png",
    fallback: "TLD",
    status: "En onboarding",
    statusColor: "text-amber-600 bg-amber-50 border-amber-200",
    description:
      "Restaurante dominicano en Elmira, NY. Cocina tradicional con toque moderno.",
    modules: ["Catálogo digital con QR", "Pedidos online", "Confirmaciones automáticas"],
    moduleStatus: "En proceso",
    href: "/the-little-dominicana",
  },
];

function CaseLogo({ logo, fallback }: { logo: string; fallback: string }) {
  return (
    <img
      src={logo}
      alt={fallback}
      className="max-h-14 max-w-full object-contain"
      onError={(e) => {
        const el = e.currentTarget;
        el.style.display = "none";
        el.parentElement!.querySelector(".fallback-initials")?.classList.remove("hidden");
      }}
    />
  );
}

export default function CasosPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-4">
              {t('casos.subtitle')}
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('casos.title')}
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Dos negocios de Elmira, NY que decidieron automatizar sus operaciones con MaalCa.
              Somos una startup local — nuestros primeros clientes son nuestros vecinos.
            </p>
          </div>
        </div>
      </section>

      {/* Cases grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {cases.map((c, index) => (
              <div
                key={c.id}
                className="bg-surface-elevated rounded-2xl border border-border overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Logo area */}
                <div className="h-32 bg-surface flex items-center justify-center px-8 border-b border-border">
                  <div className="relative flex items-center justify-center">
                    <CaseLogo logo={c.logo} fallback={c.fallback} />
                    <span className="fallback-initials hidden font-bold text-2xl text-text-primary">
                      {c.fallback}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary">{c.name}</h2>
                      <p className="text-sm text-text-muted mt-0.5">{c.location}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.statusColor}`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {c.description}
                  </p>

                  {/* Modules */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                      Módulos MaalCa — {c.moduleStatus}
                    </p>
                    <ul className="space-y-2">
                      {c.modules.map((mod) => (
                        <li key={mod} className="flex items-center gap-2 text-sm text-text-secondary">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                          {mod}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={c.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    Ver perfil del negocio →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {t('casos.coming')}
          </h2>
          <p className="text-text-secondary mb-8 leading-relaxed">
            {t('casos.coming.desc')}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white"
            onClick={() => router.push('/servicios')}
          >
            Empieza tu implementación →
          </Button>
        </div>
      </section>
    </main>
  );
}
