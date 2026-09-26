"use client";

import { useSimpleLanguage } from "@/hooks/useSimpleLanguage";

interface Section {
  es: { h: string; body: string[] };
  en: { h: string; body: string[] };
}

const SECTIONS: Section[] = [
  {
    es: {
      h: "1. Quiénes somos",
      body: [
        "MaalCa LLC opera la plataforma MaalCa (maalca.com), un SaaS que permite a negocios (restaurantes, barberías, servicios, tiendas y organizaciones comunitarias) crear su propio espacio digital: página pública, catálogo, reservas, pedidos y donaciones, según el tipo de negocio.",
        "Esta política aplica a maalca.com, a las páginas públicas de cada negocio bajo maalca.com/{slug}, y al panel de administración (/space, /ops).",
      ],
    },
    en: {
      h: "1. Who we are",
      body: [
        "MaalCa LLC operates the MaalCa platform (maalca.com), a SaaS that lets businesses (restaurants, barbershops, services, retail, and community organizations) create their own digital space: public page, catalog, bookings, orders, and donations, depending on business type.",
        "This policy applies to maalca.com, to each business's public page under maalca.com/{slug}, and to the admin dashboard (/space, /ops).",
      ],
    },
  },
  {
    es: {
      h: "2. Qué datos recogemos",
      body: [
        "Del dueño de un negocio (afiliado): nombre, correo y foto de perfil de Google al iniciar sesión; datos del negocio que carga voluntariamente (nombre, logo, catálogo, horario, dirección, WhatsApp).",
        "De un visitante o cliente de un negocio: si hace una reserva, pedido o donación, recogemos lo necesario para completar esa acción (nombre, correo o teléfono de contacto, detalles del pedido/cita). MaalCa no vende ni comparte estos datos con terceros ajenos al negocio que los recibió.",
        "Datos técnicos automáticos: páginas visitadas y métricas de uso (para las Estadísticas que ve el dueño del negocio), y preferencia de idioma/tema guardada localmente en tu navegador.",
      ],
    },
    en: {
      h: "2. What data we collect",
      body: [
        "From a business owner (affiliate): name, email, and profile photo from Google sign-in; business data they voluntarily upload (name, logo, catalog, hours, address, WhatsApp).",
        "From a visitor or customer of a business: if you make a booking, order, or donation, we collect what's needed to complete that action (name, contact email or phone, order/appointment details). MaalCa does not sell or share this data with third parties outside the business that received it.",
        "Automatic technical data: pages visited and usage metrics (for the Stats the business owner sees), and language/theme preference saved locally in your browser.",
      ],
    },
  },
  {
    es: {
      h: "3. Cómo usamos tus datos",
      body: [
        "Para operar el espacio del negocio: mostrar la página pública, procesar reservas/pedidos/donaciones, y enviar las confirmaciones o correos relacionados (por ejemplo, invitaciones de equipo).",
        "Para autenticación: el inicio de sesión con Google se usa únicamente para identificarte de forma segura, no para leer tu correo ni tus contactos.",
        "Para pagos: cuando un negocio activa cobros en línea, el procesamiento real de la tarjeta lo hace Stripe directamente — MaalCa no almacena números de tarjeta completos.",
        "No usamos tus datos para publicidad ni los vendemos a terceros.",
      ],
    },
    en: {
      h: "3. How we use your data",
      body: [
        "To operate the business space: showing the public page, processing bookings/orders/donations, and sending related confirmations or emails (e.g. team invitations).",
        "For authentication: Google sign-in is used only to identify you securely — not to read your email or contacts.",
        "For payments: when a business enables online checkout, the actual card processing is handled directly by Stripe — MaalCa never stores full card numbers.",
        "We do not use your data for advertising and do not sell it to third parties.",
      ],
    },
  },
  {
    es: {
      h: "4. Con quién compartimos datos (proveedores)",
      body: [
        "Supabase — autenticación (inicio de sesión con Google).",
        "Railway (PostgreSQL) — base de datos donde vive la información de cada negocio.",
        "Vercel — hospedaje de la aplicación web.",
        "Stripe — procesamiento de pagos, cuando el negocio lo activa.",
        "Resend — envío de correos transaccionales (confirmaciones, invitaciones).",
        "Cada uno de estos proveedores procesa datos únicamente para prestarnos su servicio, bajo sus propias políticas de seguridad.",
      ],
    },
    en: {
      h: "4. Who we share data with (providers)",
      body: [
        "Supabase — authentication (Google sign-in).",
        "Railway (PostgreSQL) — database where each business's information lives.",
        "Vercel — web application hosting.",
        "Stripe — payment processing, when a business enables it.",
        "Resend — transactional email delivery (confirmations, invitations).",
        "Each of these providers processes data only to provide their service to us, under their own security policies.",
      ],
    },
  },
  {
    es: {
      h: "5. Cuánto tiempo guardamos tus datos",
      body: [
        "Mientras el negocio mantenga su espacio activo en MaalCa. Si un negocio cierra su cuenta, sus datos y los de sus clientes asociados se eliminan de nuestra base de datos en un plazo razonable, salvo que la ley exija conservarlos (por ejemplo, registros de pagos para efectos fiscales).",
      ],
    },
    en: {
      h: "5. How long we keep your data",
      body: [
        "For as long as the business keeps its space active on MaalCa. If a business closes its account, its data and that of its associated customers is deleted from our database within a reasonable period, unless the law requires it to be kept (e.g. payment records for tax purposes).",
      ],
    },
  },
  {
    es: {
      h: "6. Tus derechos",
      body: [
        "Puedes pedir acceso, corrección o eliminación de tus datos escribiendo a hola@maalca.com. Si eres cliente de un negocio (no el dueño), primero contacta a ese negocio directamente — MaalCa procesa esos datos en su nombre.",
      ],
    },
    en: {
      h: "6. Your rights",
      body: [
        "You can request access, correction, or deletion of your data by writing to hola@maalca.com. If you're a customer of a business (not the owner), please contact that business directly first — MaalCa processes that data on their behalf.",
      ],
    },
  },
  {
    es: {
      h: "7. Cambios a esta política",
      body: [
        "Podemos actualizar esta política a medida que la plataforma evoluciona. Publicaremos la fecha de la última actualización al pie de esta página.",
      ],
    },
    en: {
      h: "7. Changes to this policy",
      body: [
        "We may update this policy as the platform evolves. We'll post the last-updated date at the bottom of this page.",
      ],
    },
  },
];

const LAST_UPDATED = "2026-09-26";

export default function PrivacidadPage() {
  const { language } = useSimpleLanguage();
  const isEs = language === "es";

  return (
    <main className="min-h-screen bg-background text-foreground pt-20">
      <section className="py-16 md:py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
            {isEs ? "Política de privacidad" : "Privacy Policy"}
          </h1>
          <p className="text-gray-300">
            {isEs
              ? "Cómo recogemos, usamos y protegemos tus datos en MaalCa."
              : "How we collect, use, and protect your data on MaalCa."}
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
