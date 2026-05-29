"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Catálogo", href: "/editorial/catalogo" },
  { label: "Publica con nosotros", href: "/editorial/publica" },
  { label: "Manifiesto", href: "/editorial/manifiesto" },
  { label: "Contacto", href: "/contacto" },
];

export default function EditorialNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useSimpleLanguage();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-amber-100 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/editorial" className="flex items-center gap-2 group">
              <span className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                Editorial MaalCa
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Language toggle */}
              <button
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
                aria-label="Cambiar idioma"
              >
                {language === "es" ? "🇺🇸 EN" : "🇩🇴 ES"}
              </button>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                <span className={cn("w-5 h-0.5 bg-current rounded transition-all", open && "rotate-45 translate-y-2")} />
                <span className={cn("w-5 h-0.5 bg-current rounded transition-all", open && "opacity-0")} />
                <span className={cn("w-5 h-0.5 bg-current rounded transition-all", open && "-rotate-45 -translate-y-2")} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-stone-950 border-b border-amber-100 dark:border-stone-800 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block py-2 text-base font-medium transition-colors",
                    isActive(item.href)
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => { setLanguage(language === "es" ? "en" : "es"); setOpen(false); }}
                className="text-sm text-stone-500 dark:text-stone-500 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded"
              >
                {language === "es" ? "🇺🇸 Switch to English" : "🇩🇴 Cambiar a Español"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
