"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const EXCLUDED_PATHS = ["/dashboard", "/ciriwhispers", "/login", "/onboarding", "/editorial"];

export default function Footer() {
  const pathname = usePathname();
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Producto */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
              Producto
            </p>
            <ul className="space-y-2.5">
              <li><Link href="/#plataforma" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Plataforma</Link></li>
              <li><Link href="/casos" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Casos</Link></li>
              <li><Link href="/servicios" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Precios</Link></li>
              <li><Link href="/docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Docs</Link></li>
              <li><Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Iniciar sesión</Link></li>
            </ul>
          </div>
          {/* Ecosistema */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
              Ecosistema
            </p>
            <ul className="space-y-2.5">
              <li><Link href="/editorial" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Editorial MaalCa</Link></li>
              <li><Link href="/ciriwhispers" className="text-sm text-text-secondary hover:text-text-primary transition-colors">CiriWhispers</Link></li>
            </ul>
          </div>
          {/* Empresa */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
              Empresa
            </p>
            <ul className="space-y-2.5">
              <li><Link href="/#about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Sobre MaalCa</Link></li>
              <li><Link href="/contacto" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contacto</Link></li>
              <li><Link href="/privacidad" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Privacidad</Link></li>
              <li><Link href="/terminos" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Términos</Link></li>
            </ul>
          </div>
          {/* Conecta */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
              Conecta
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:hello@maalca.com"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  hello@maalca.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/maalca_llc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {year} MaalCa LLC · Elmira, NY · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
