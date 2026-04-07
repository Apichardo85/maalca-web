"use client";
import { Button } from "@/components/ui/buttons";
export default function CTASection() {
  return (
    <section
      id="contact"
      className="relative py-20 overflow-hidden"
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      {/* Static background elements (were animated blobs) */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-3xl"
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-full blur-3xl"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <h2
            className="font-display text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            ¿Listo Para Crear
            <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Una Experiencia Única?
            </span>
          </h2>
          <p
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Permítenos ser parte de tu próximo evento. Contacta con nuestro equipo de expertos
            y descubre cómo podemos hacer realidad la experiencia gastronómica de tus sueños.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <Button
              variant="primary"
              size="lg"
              className="min-w-[200px] text-lg"
              onClick={() => window.location.href = '/contacto'}
            >
              Solicitar Cotización
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-[200px] text-lg border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => window.location.href = '/galeria'}
            >
              Ver Portafolio
            </Button>
          </div>
          {/* Contact Information */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            {[
              {
                icon: "📞",
                title: "Teléfono",
                content: "+56 9 1234 5678",
                subtitle: "Lun - Vie: 9:00 - 18:00"
              },
              {
                icon: "✉️",
                title: "Email",
                content: "hola@maalca.cl",
                subtitle: "Respuesta en 24hrs"
              },
              {
                icon: "📍",
                title: "Ubicación",
                content: "Santiago, Chile",
                subtitle: "Servicio nacional"
              }
            ].map((contact, index) => (
              <div
                key={contact.title}
                className="group hover:scale-105 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {contact.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {contact.title}
                  </h3>
                  <p className="text-amber-300 font-medium mb-1">
                    {contact.content}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {contact.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Social Proof */}
          <div
            className="mt-16 pt-8 border-t border-white/20 animate-fade-in"
            style={{ animationDelay: '1.2s' }}
          >
            <p className="text-gray-400 mb-4">Confían en nosotros:</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              {["Hotel Boutique", "Innovatech", "Momentos Únicos"].map((client, index) => (
                <span
                  key={client}
                  className="text-white font-medium opacity-60 hover:opacity-100 hover:scale-105 transition-all duration-300 animate-fade-in-scale"
                  style={{ animationDelay: `${1.3 + index * 0.1}s` }}
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
    </section>
  );
}
