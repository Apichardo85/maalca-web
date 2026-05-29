"use client";
import Link from "next/link";
import { EDITORIAL_ASSISTED_PRICE_DISPLAY } from "@/config/editorial-pricing";

const assistedBullets = [
  "Formateo del manuscrito a estándares de impresión y eBook",
  "3 propuestas de portada (tú eliges la final)",
  "ISBN + metadatos optimizados para Amazon",
  "Setup de distribución en Amazon KDP",
  "Tu libro publicado en menos de 30 días",
  "Las regalías son 100% tuyas",
];

const curatedBullets = [
  "Lectura editorial completa del manuscrito",
  "Revisión y sugerencias literarias",
  "Publicación con difusión activa",
  "Compartimos regalías — te damos voz",
  "Selección por concurso o criterio editorial",
];

export default function PublicaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
            Publicación
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-6 leading-tight">
            Tu obra merece existir.
            <span className="block text-amber-600 dark:text-amber-400">Tú eliges cómo.</span>
          </h1>
          <p className="text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            Dos caminos. Ninguna trampa. Sin contratos leoninos.
          </p>
        </div>
      </section>

      {/* Tracks */}
      <section className="py-16 bg-white dark:bg-stone-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Track Asistido */}
            <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">
                  Track Asistido
                </p>
                <p className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  {EDITORIAL_ASSISTED_PRICE_DISPLAY}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
                  Pago único. Sin sorpresas.
                </p>
              </div>
              <p className="text-stone-700 dark:text-stone-300 mb-6 leading-relaxed">
                Para quien tiene la obra lista y quiere publicar sin gastar una fortuna.
                Pack completo: de manuscrito a Amazon en menos de 30 días.
              </p>
              <ul className="space-y-3 mb-8">
                {assistedBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">✓</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:editorial@maalca.com?subject=Track Asistido — quiero publicar"
                className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Empezar mi publicación →
              </a>
            </div>

            {/* Track Curado */}
            <div className="rounded-2xl border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2">
                  Track Curado
                </p>
                <p className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Gratis
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
                  Para obras que nos atraviesan.
                </p>
              </div>
              <p className="text-stone-700 dark:text-stone-300 mb-6 leading-relaxed">
                Si tu obra nos mueve, la publicamos sin que pagues nada.
                No es vanity press. Es curaduría real: leemos, decidimos, publicamos.
              </p>
              <ul className="space-y-3 mb-8">
                {curatedBullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                    <span className="text-stone-400 mt-0.5 flex-shrink-0">✓</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:editorial@maalca.com?subject=Track Curado — envío de manuscrito"
                className="block w-full text-center border-2 border-stone-800 dark:border-stone-300 text-stone-800 dark:text-stone-300 hover:bg-stone-800 dark:hover:bg-stone-300 hover:text-white dark:hover:text-stone-900 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Enviar mi manuscrito →
              </a>
            </div>
          </div>

          <p className="text-center text-sm text-stone-400 dark:text-stone-600 mt-8">
            Dudas: <a href="mailto:editorial@maalca.com" className="text-amber-600 hover:underline">editorial@maalca.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
