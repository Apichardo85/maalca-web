"use client";
import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";
import { EDITORIAL_ASSISTED_PRICE_DISPLAY } from "@/config/editorial-pricing";

const content = {
  es: {
    eyebrow: 'Manifiesto',
    title: 'Por qué publicamos.',
    intro: 'Publicar un libro en 2025 sigue siendo, para la mayoría, una carrera de obstáculos diseñada para desanimar.',
    p1start: 'Las editoriales tradicionales responden después de meses, si responden. Las plataformas de autoedición te cobran por cada servicio que necesitas. Los servicios de "publicación asistida" cobran entre $2,000 y $8,000 por hacer lo mismo que nosotros hacemos por ',
    p1end: '.',
    p2: 'MaalCa es una empresa de tecnología. Tenemos las herramientas para hacer que publicar cueste menos. Mucho menos. Y decidimos usarlas para eso.',
    h1: 'Lo que automatizamos',
    p3: 'Formateo, portadas, metadatos, distribución técnica. Todo lo que puede hacer una máquina sin comprometer la integridad de la obra, lo hace una máquina. Eso baja el costo. No el valor.',
    h2: 'Lo que no automatizamos',
    p4: 'La lectura. La decisión editorial. La conversación contigo. Cuando elegimos publicar algo en el Track Curado, es porque alguien lo leyó y dijo: esto merece existir. Eso no lo hace ningún algoritmo.',
    h3: 'Qué tipo de obras buscamos',
    p5: 'Obras que tengan algo que decir. No importa el género, no importa el idioma. Importa que haya una voz real detrás del texto.',
    h4: 'Qué prometemos y qué no',
    p6: 'Prometemos: honestidad sobre el proceso, precios claros, y que si aceptamos tu obra en el Track Curado, ponemos esfuerzo real en ella.',
    p7: 'No prometemos: hacerte famoso, garantizar ventas, ni que tu libro llegará a las listas de bestsellers. Publicar es el primer paso. Lo demás depende de la obra y del tiempo.',
    signature: '— Ciriaco A. Pichardo, fundador de MaalCa LLC',
  },
  en: {
    eyebrow: 'Manifesto',
    title: 'Why we publish.',
    intro: 'Publishing a book in 2025 is still, for most people, an obstacle course designed to discourage.',
    p1start: 'Traditional publishers respond after months, if they respond at all. Self-publishing platforms charge for every service you need. "Assisted publishing" services charge between $2,000 and $8,000 to do the same thing we do for ',
    p1end: '.',
    p2: 'MaalCa is a technology company. We have the tools to make publishing cost less. A lot less. And we decided to use them for exactly that.',
    h1: 'What we automate',
    p3: 'Formatting, covers, metadata, technical distribution. Everything a machine can do without compromising the integrity of the work, a machine does. That reduces the cost. Not the value.',
    h2: 'What we do not automate',
    p4: 'The reading. The editorial decision. The conversation with you. When we choose to publish something on the Curated Track, it is because someone read it and said: this deserves to exist. No algorithm does that.',
    h3: 'What kind of works we seek',
    p5: 'Works that have something to say. Genre does not matter, language does not matter. What matters is that there is a real voice behind the text.',
    h4: 'What we promise and what we do not',
    p6: 'We promise: honesty about the process, clear pricing, and if we accept your work on the Curated Track, we put real effort into it.',
    p7: 'We do not promise: to make you famous, guarantee sales, or get your book onto bestseller lists. Publishing is the first step. The rest depends on the work and on time.',
    signature: '— Ciriaco A. Pichardo, founder of MaalCa LLC',
  },
} as const;

type Lang = keyof typeof content;

export default function ManifiestoPage() {
  const { language } = useSimpleLanguage();
  const c = content[(language as Lang) ?? 'es'] ?? content.es;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-20 md:py-32">
        <header className="mb-12">
          <p className="text-sm font-medium text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
            {c.eyebrow}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
            {c.title}
          </h1>
        </header>

        <div className="space-y-6 text-stone-600 dark:text-stone-400 leading-relaxed">
          <p className="font-serif text-xl text-stone-700 dark:text-stone-300">{c.intro}</p>

          <p>{c.p1start}<strong className="text-stone-800 dark:text-stone-200">{EDITORIAL_ASSISTED_PRICE_DISPLAY}</strong>{c.p1end}</p>

          <p>{c.p2}</p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">{c.h1}</h2>
          <p>{c.p3}</p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">{c.h2}</h2>
          <p>{c.p4}</p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">{c.h3}</h2>
          <p>{c.p5}</p>

          <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 pt-4">{c.h4}</h2>
          <p>{c.p6}</p>
          <p>{c.p7}</p>

          <div className="pt-8 border-t border-stone-200 dark:border-stone-700">
            <p className="text-sm text-stone-400 dark:text-stone-600 font-medium">{c.signature}</p>
          </div>
        </div>
      </article>
    </main>
  );
}
