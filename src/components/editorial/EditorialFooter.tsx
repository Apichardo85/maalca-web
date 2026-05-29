import Link from "next/link";

export default function EditorialFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-amber-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
              Editorial MaalCa
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-500 leading-relaxed max-w-xs">
              Un brand de MaalCa LLC. Publicamos historias que merecen existir,
              con precios que no excluyen a quienes las escriben.
            </p>
          </div>
          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 sm:justify-end sm:content-start">
            <Link href="/editorial/catalogo" className="text-sm text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors">
              Catálogo
            </Link>
            <Link href="/editorial/publica" className="text-sm text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors">
              Publica con nosotros
            </Link>
            <Link href="/editorial/manifiesto" className="text-sm text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors">
              Manifiesto
            </Link>
            <Link href="/contacto" className="text-sm text-stone-500 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors">
              Contacto
            </Link>
          </div>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-400 dark:text-stone-600">
            © {year} MaalCa LLC · Elmira, NY
          </p>
          <Link
            href="/"
            className="text-xs text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors font-medium"
          >
            ← Volver a maalca.com
          </Link>
        </div>
      </div>
    </footer>
  );
}
