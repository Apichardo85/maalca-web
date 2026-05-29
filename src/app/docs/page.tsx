import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-4">
            Documentación
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Docs en construcción
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-10">
            La documentación técnica de la plataforma MaalCa está en proceso.
            Pronto encontrarás guías de integración, APIs y tutoriales de configuración.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
          >
            ¿Tienes preguntas? Escríbenos →
          </Link>
        </div>
      </section>
    </main>
  );
}
