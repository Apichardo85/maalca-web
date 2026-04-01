"use client";

import { Logo } from "@/components/ui/Logo";

export function LogoShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-maalca-black to-maalca-dark-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center mb-16 animate-fade-in-up"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-maalca-white mb-6">
            Identidad Visual de
            <span className="block text-maalca-red">MaalCa</span>
          </h2>
          <p className="text-xl text-maalca-light-gray max-w-3xl mx-auto">
            Nuestro logo representa la conexión humana y el sentido de pertenencia que impulsa nuestro ecosistema creativo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Full Logo Dark */}
          <div
            className="flex flex-col items-center p-8 bg-maalca-black border border-maalca-gray rounded-2xl animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="mb-6">
              <Logo variant="full" size="lg" />
            </div>
            <h3 className="text-lg font-semibold text-maalca-white mb-2">Logo Completo</h3>
            <p className="text-maalca-light-gray text-center text-sm">
              Versión principal para fondos oscuros
            </p>
          </div>

          {/* Icon Only */}
          <div
            className="flex flex-col items-center p-8 bg-maalca-dark-gray border border-maalca-gray rounded-2xl animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="mb-6">
              <Logo variant="icon" size="xl"  />
            </div>
            <h3 className="text-lg font-semibold text-maalca-white mb-2">Isotipo</h3>
            <p className="text-maalca-light-gray text-center text-sm">
              Símbolo independiente para aplicaciones compactas
            </p>
          </div>

          {/* Text Only */}
          <div
            className="flex flex-col items-center p-8 bg-maalca-gray border border-maalca-light-gray rounded-2xl animate-fade-in-up"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="mb-6">
              <Logo variant="text" size="lg"  />
            </div>
            <h3 className="text-lg font-semibold text-maalca-white mb-2">Logotipo</h3>
            <p className="text-maalca-light-gray text-center text-sm">
              Solo texto para usos específicos
            </p>
          </div>

          {/* Full Logo Light */}
          <div
            className="flex flex-col items-center p-8 bg-maalca-white rounded-2xl animate-fade-in-up"
            style={{ animationDelay: '0.9s' }}
          >
            <div className="mb-6">
              <Logo variant="full" size="lg"  />
            </div>
            <h3 className="text-lg font-semibold text-maalca-black mb-2">Versión Clara</h3>
            <p className="text-maalca-gray text-center text-sm">
              Para fondos claros y aplicaciones especiales
            </p>
          </div>

          {/* Icon Light */}
          <div
            className="flex flex-col items-center p-8 bg-gray-100 rounded-2xl animate-fade-in-up"
            style={{ animationDelay: '1.1s' }}
          >
            <div className="mb-6">
              <Logo variant="icon" size="xl"  />
            </div>
            <h3 className="text-lg font-semibold text-maalca-black mb-2">Isotipo Claro</h3>
            <p className="text-maalca-gray text-center text-sm">
              Símbolo para fondos claros
            </p>
          </div>

          {/* Different Sizes */}
          <div
            className="flex flex-col items-center p-8 bg-gradient-to-br from-maalca-red/20 to-maalca-red-dark/20 border border-maalca-red/30 rounded-2xl animate-fade-in-up"
            style={{ animationDelay: '1.3s' }}
          >
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Logo variant="full" size="sm"  />
              <Logo variant="full" size="md"  />
              <Logo variant="full" size="lg" />
            </div>
            <h3 className="text-lg font-semibold text-maalca-white mb-2">Escalabilidad</h3>
            <p className="text-maalca-light-gray text-center text-sm">
              Funciona en múltiples tamaños
            </p>
          </div>
        </div>

        {/* Design Philosophy */}
        <div
          className="mt-20 text-center animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-maalca-white mb-6">Filosofía del Diseño</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-maalca-dark-gray/50 rounded-xl border border-maalca-gray/30">
                <div className="w-12 h-12 bg-maalca-red rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-maalca-white mb-2">Humanidad</h4>
                <p className="text-maalca-light-gray text-sm">
                  La figura humana central representa nuestro enfoque centrado en las personas y las conexiones auténticas.
                </p>
              </div>

              <div className="p-6 bg-maalca-dark-gray/50 rounded-xl border border-maalca-gray/30">
                <div className="w-12 h-12 bg-maalca-red rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-maalca-white mb-2">Conexión</h4>
                <p className="text-maalca-light-gray text-sm">
                  Los puntos circundantes simbolizan las múltiples conexiones y colaboraciones dentro de nuestro ecosistema.
                </p>
              </div>

              <div className="p-6 bg-maalca-dark-gray/50 rounded-xl border border-maalca-gray/30">
                <div className="w-12 h-12 bg-maalca-red rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-maalca-white mb-2">Creatividad</h4>
                <p className="text-maalca-light-gray text-sm">
                  El gradiente rojo representa la pasión y energía creativa que impulsa todos nuestros proyectos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
