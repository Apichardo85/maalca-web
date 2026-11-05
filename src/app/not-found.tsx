'use client';

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";

// Cliente a propósito: el idioma del visitante vive en localStorage, y un 404 en español duro
// delante de un cliente de un negocio en inglés es lo primero que ve cuando algo falla.
export default function NotFound() {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="mb-10">
        <Logo variant="full" size="md" />
      </Link>

      <p className="text-8xl font-black text-brand-primary leading-none tracking-tight mb-6 select-none">
        404
      </p>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        {getText('Página no encontrada', 'Page not found')}
      </h1>

      <p className="text-base text-text-muted mb-10 max-w-sm">
        {getText('Esta página no existe o fue movida.', "This page doesn't exist or has moved.")}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
        >
          {getText('Volver al inicio', 'Back to home')}
        </Link>
        <Link
          href="/ecosistema"
          className="px-6 py-3 rounded-xl border border-border text-text-primary text-sm font-semibold hover:bg-surface-elevated transition-colors"
        >
          {getText('Ver el ecosistema', 'See the ecosystem')}
        </Link>
      </div>
    </div>
  );
}
