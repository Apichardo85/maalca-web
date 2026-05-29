export default function ManifiestoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <header className="mb-12">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
            Manifiesto
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
            Por qué publicamos.
          </h1>
        </header>

        <div className="prose prose-stone dark:prose-invert prose-lg max-w-none space-y-8">
          <p className="font-serif text-xl text-stone-700 dark:text-stone-300 leading-relaxed">
            Publicar un libro en 2025 sigue siendo, para la mayoría,
            una carrera de obstáculos diseñada para desanimar.
          </p>

          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Las editoriales tradicionales responden después de meses, si responden.
            Las plataformas de autoedición te cobran por cada servicio que necesitas.
            Los servicios de "publicación asistida" cobran entre $2,000 y $8,000 por hacer
            lo mismo que nosotros hacemos por $100.
          </p>

          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            MaalCa es una empresa de tecnología. Tenemos las herramientas para hacer
            que publicar cueste menos. Mucho menos. Y decidimos usarlas para eso.
          </p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">
            Lo que automatizamos
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Formateo, portadas, metadatos, distribución técnica. Todo lo que puede hacer
            una máquina sin comprometer la integridad de la obra, lo hace una máquina.
            Eso baja el costo. No el valor.
          </p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">
            Lo que no automatizamos
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            La lectura. La decisión editorial. La conversación contigo.
            Cuando elegimos publicar algo en el Track Curado, es porque alguien lo leyó
            y dijo: esto merece existir. Eso no lo hace ningún algoritmo.
          </p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">
            Qué tipo de obras buscamos
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Obras que tengan algo que decir. No importa el género, no importa el idioma.
            Importa que haya una voz real detrás del texto.
          </p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">
            Qué prometemos y qué no
          </h2>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Prometemos: honestidad sobre el proceso, precios claros, y que si aceptamos
            tu obra en el Track Curado, ponemos esfuerzo real en ella.
          </p>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            No prometemos: hacerte famoso, garantizar ventas, ni que tu libro llegará
            a las listas de bestsellers. Publicar es el primer paso. Lo demás depende
            de la obra y del tiempo.
          </p>

          <div className="pt-8 border-t border-stone-200 dark:border-stone-700">
            <p className="text-sm text-stone-400 dark:text-stone-600 font-medium">
              — Ciriaco A. Pichardo, fundador de MaalCa LLC
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
