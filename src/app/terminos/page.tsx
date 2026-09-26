"use client";

import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";

interface Section {
  es: { h: string; body: string[] };
  en: { h: string; body: string[] };
}

const SECTIONS: Section[] = [
  {
    es: {
      h: "1. Qué es MaalCa",
      body: [
        "MaalCa es una plataforma SaaS operada por MaalCa LLC que permite a negocios crear su propio espacio digital: página pública, catálogo, reservas, pedidos y, según el tipo de negocio, herramientas de facturación, inventario o gestión de equipo.",
        "Al crear un espacio en MaalCa (maalca.com/{slug}) aceptas estos términos, tanto si eres el dueño del negocio como si administras el espacio en nombre de uno.",
      ],
    },
    en: {
      h: "1. What MaalCa is",
      body: [
        "MaalCa is a SaaS platform operated by MaalCa LLC that lets businesses create their own digital space: public page, catalog, bookings, orders, and, depending on business type, invoicing, inventory, or team management tools.",
        "By creating a space on MaalCa (maalca.com/{slug}) you accept these terms, whether you're the business owner or managing the space on their behalf.",
      ],
    },
  },
  {
    es: {
      h: "2. Cuenta y acceso",
      body: [
        "El acceso al panel de administración (/space) es mediante inicio de sesión con Google. Eres responsable de mantener el acceso a esa cuenta de Google seguro — MaalCa no puede recuperar tu espacio si pierdes acceso a ella sin contactarnos primero.",
        "Puedes invitar a miembros de tu equipo con distintos roles (Owner, Manager, Staff). El Owner es responsable de administrar quién tiene acceso al panel.",
      ],
    },
    en: {
      h: "2. Account and access",
      body: [
        "Access to the admin dashboard (/space) is via Google sign-in. You're responsible for keeping that Google account secure — MaalCa cannot recover your space if you lose access to it without contacting us first.",
        "You can invite team members with different roles (Owner, Manager, Staff). The Owner is responsible for managing who has dashboard access.",
      ],
    },
  },
  {
    es: {
      h: "3. Planes y facturación",
      body: [
        "MaalCa ofrece un Plan Gratis y un plan de pago (Emprendedor) con más módulos y capacidades. Los detalles y precios vigentes de cada plan están en maalca.com/servicios.",
        "Si tu negocio procesa pagos en línea (pedidos, reservas con depósito, donaciones) a través de Stripe, esos cobros están sujetos también a los términos de servicio de Stripe. MaalCa no es responsable de disputas de pago entre tu negocio y tus propios clientes — solo provee la infraestructura para procesarlos.",
      ],
    },
    en: {
      h: "3. Plans and billing",
      body: [
        "MaalCa offers a Free Plan and a paid plan (Entrepreneur) with more modules and capabilities. Current plan details and pricing are at maalca.com/servicios.",
        "If your business processes online payments (orders, deposit bookings, donations) through Stripe, those charges are also subject to Stripe's own terms of service. MaalCa is not responsible for payment disputes between your business and your own customers — we only provide the infrastructure to process them.",
      ],
    },
  },
  {
    es: {
      h: "4. Tu contenido",
      body: [
        "Todo lo que cargues a tu espacio (catálogo, fotos, descripciones, nombre del negocio) sigue siendo tuyo. Nos das permiso para mostrarlo públicamente en tu página maalca.com/{slug} y para almacenarlo, exclusivamente con el fin de operar la plataforma.",
        "No debes subir contenido que infrinja derechos de terceros, sea ilegal, o promueva actividades fraudulentas. MaalCa puede suspender espacios que incumplan esto.",
      ],
    },
    en: {
      h: "4. Your content",
      body: [
        "Everything you upload to your space (catalog, photos, descriptions, business name) remains yours. You grant us permission to display it publicly on your maalca.com/{slug} page and to store it, solely to operate the platform.",
        "You must not upload content that infringes third-party rights, is illegal, or promotes fraudulent activity. MaalCa may suspend spaces that violate this.",
      ],
    },
  },
  {
    es: {
      h: "5. Disponibilidad del servicio",
      body: [
        "Hacemos un esfuerzo razonable por mantener la plataforma disponible, pero no garantizamos un tiempo de actividad del 100% — dependemos de proveedores externos (Vercel, Railway, Supabase, Stripe) para operar. No somos responsables de pérdidas de ingresos por interrupciones fuera de nuestro control razonable.",
      ],
    },
    en: {
      h: "5. Service availability",
      body: [
        "We make a reasonable effort to keep the platform available, but do not guarantee 100% uptime — we depend on external providers (Vercel, Railway, Supabase, Stripe) to operate. We are not responsible for revenue loss from interruptions outside our reasonable control.",
      ],
    },
  },
  {
    es: {
      h: "6. Cancelación",
      body: [
        "Puedes dejar de usar MaalCa cuando quieras. Si quieres que eliminemos tu espacio y los datos asociados, escríbenos a hola@maalca.com. Podemos suspender o cerrar un espacio que incumpla estos términos, previo aviso salvo en casos de abuso grave.",
      ],
    },
    en: {
      h: "6. Cancellation",
      body: [
        "You can stop using MaalCa at any time. If you want us to delete your space and associated data, write to hola@maalca.com. We may suspend or close a space that violates these terms, with prior notice except in cases of serious abuse.",
      ],
    },
  },
  {
    es: {
      h: "7. Cambios a estos términos",
      body: [
        "Podemos actualizar estos términos a medida que la plataforma evoluciona. Publicaremos la fecha de la última actualización al pie de esta página. El uso continuado de MaalCa después de un cambio implica aceptación de los nuevos términos.",
      ],
    },
    en: {
      h: "7. Changes to these terms",
      body: [
        "We may update these terms as the platform evolves. We'll post the last-updated date at the bottom of this page. Continued use of MaalCa after a change implies acceptance of the new terms.",
      ],
    },
  },
];

const LAST_UPDATED = "2026-09-26";

export default function TerminosPage() {
  const { language } = useSimpleLanguage();
  const isEs = language === "es";

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      <section className="py-16 md:py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            {isEs ? "Términos de uso" : "Terms of use"}
          </h1>
          <p className="text-gray-300">
            {isEs
              ? "Las reglas para usar la plataforma MaalCa."
              : "The rules for using the MaalCa platform."}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {SECTIONS.map((section) => {
            const s = isEs ? section.es : section.en;
            return (
              <div key={s.h}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.h}</h2>
                <div className="space-y-3">
                  {s.body.map((p) => (
                    <p key={p} className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}

          <p className="text-sm text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
            {isEs ? "Última actualización: " : "Last updated: "}
            {LAST_UPDATED} ·{" "}
            <a href="mailto:hola@maalca.com" className="text-brand-primary hover:underline">
              hola@maalca.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
