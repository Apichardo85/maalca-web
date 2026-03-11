"use client";

import Link from "next/link";
import { getAffiliatesWithDashboard } from "@/config/affiliates-config";

export default function DashboardSelector() {
  const affiliates = getAffiliatesWithDashboard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="fade-in-up text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Dashboard MaalCa
          </h1>
          <p className="text-xl text-gray-400">
            Selecciona tu negocio para continuar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {affiliates.map((affiliate, index) => (
            <div
              key={affiliate.id}
              className="scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link href={`/dashboard/${affiliate.id}`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 hover:border-red-600 dark:hover:border-red-600 transition-all hover:shadow-2xl group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 bg-${affiliate.branding.primaryColor} bg-opacity-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <img
                        src={affiliate.branding.logo}
                        alt={affiliate.branding.name}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className={`hidden text-3xl text-${affiliate.branding.primaryColor}`}>
                        🏢
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                        {affiliate.branding.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {affiliate.branding.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {affiliate.modules.metrics && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                        📈 Métricas
                      </span>
                    )}
                    {affiliate.modules.appointments && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                        📅 Citas
                      </span>
                    )}
                    {affiliate.modules.ecommerce && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                        🛍️ Tienda
                      </span>
                    )}
                    {affiliate.modules.queue && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-medium">
                        ⏳ Fila Virtual
                      </span>
                    )}
                    {affiliate.modules.salon && (
                      <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-full text-xs font-medium">
                        💈 Salón
                      </span>
                    )}
                    {affiliate.modules.giftcards && (
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
                        💳 Gift Cards
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {affiliate.settings.currency}
                    </span>
                    <span className="text-red-600 dark:text-red-500 font-semibold group-hover:translate-x-1 transition-transform">
                      Acceder →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="fade-in delay-500 mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            ¿Necesitas ayuda?
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </a>
            <span className="text-gray-700">|</span>
            <a
              href="/contacto"
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
