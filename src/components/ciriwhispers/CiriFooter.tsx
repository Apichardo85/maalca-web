import Link from "next/link";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

export default function CiriFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      {/* Newsletter */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="font-serif text-2xl font-bold text-stone-100 mb-2">
            Susurros al oido
          </h3>
          <p className="text-slate-400 text-sm">
            Historias que no se publican. Fragmentos que no llegan a libro. Solo para ti.
          </p>
        </div>
        <NewsletterSignup source="ciriwhispers" className="max-w-md mx-auto" />
      </div>

      {/* Links + Credits */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-serif text-lg font-bold text-red-400 mb-3">Navegar</h4>
              <div className="space-y-2">
                <Link href="/ciriwhispers/biblioteca" className="block text-slate-400 hover:text-red-400 transition-colors text-sm">
                  Biblioteca
                </Link>
                <Link href="/ciriwhispers/obras" className="block text-slate-400 hover:text-red-400 transition-colors text-sm">
                  Obras
                </Link>
                <Link href="/hablando-mierda" className="block text-slate-400 hover:text-red-400 transition-colors text-sm">
                  Hablando Mierda (Podcast)
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-red-400 mb-3">Conectar</h4>
              <div className="space-y-2">
                <a href="https://www.instagram.com/ciriwhispers/" target="_blank" rel="noopener noreferrer" className="block text-slate-400 hover:text-red-400 transition-colors text-sm">
                  Instagram
                </a>
                <a href="https://www.amazon.com/stores/Ciriaco-Alejandro-Pichardo-Santana/author/B0DFH93HCJ" target="_blank" rel="noopener noreferrer" className="block text-slate-400 hover:text-red-400 transition-colors text-sm">
                  Amazon
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-red-400 mb-3">Ecosistema</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-slate-400 hover:text-red-400 transition-colors text-sm">
                  MaalCa
                </Link>
                <Link href="/editorial" className="block text-slate-400 hover:text-red-400 transition-colors text-sm">
                  Editorial
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-slate-800">
            <p className="font-serif italic text-slate-500 text-sm">
              "No escribo para gustarte. Escribo para que te reconozcas en lo que escondes."
            </p>
            <p className="text-slate-600 text-xs mt-2">
              &copy; {new Date().getFullYear()} CiriWhispers &mdash; Editorial MaalCa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
