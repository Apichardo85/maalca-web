"use client";
import Link from "next/link";
import { useAffiliate } from "@/contexts/AffiliateContext";
/**
 * Quick Stats específico para barberías
 */
export function BarbershopQuickStats() {
  const { config } = useAffiliate();
  const queueStats = {
    waiting: 7,
    averageWaitTime: 35,
    totalToday: 24
  };
  const salonStats = {
    totalChairs: 6,
    occupied: 4,
    available: 2,
    occupancyRate: 67
  };
  const giftCardStats = {
    active: 8,
    totalValue: 8500,
    expiringSoon: 2
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Estado del Salón
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">En vivo</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Queue Card */}
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.1s' }}>
          <Link href={`/dashboard/${config?.id}/queue`}>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <span className="text-3xl">⏳</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Fila</p>
                  <p className="text-4xl font-black text-yellow-600 dark:text-yellow-400">
                    {queueStats.waiting}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tiempo medio</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {queueStats.averageWaitTime} min
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Atendidos hoy</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {queueStats.totalToday}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between text-yellow-600 dark:text-yellow-400 font-semibold">
                  <span>Ver Fila Completa</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
        {/* Salon Card */}
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
          <Link href={`/dashboard/${config?.id}/salon`}>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <span className="text-3xl">💈</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ocupación</p>
                  <p className="text-4xl font-black text-blue-600 dark:text-blue-400">
                    {salonStats.occupancyRate}%
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sillas ocupadas</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {salonStats.occupied}/{salonStats.totalChairs}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Disponibles ahora</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {salonStats.available} sillas
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Ver Salón Virtual</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
        {/* Gift Cards Card */}
        <div className="animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
          <Link href={`/dashboard/${config?.id}/giftcards`}>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl border-2 border-purple-200 dark:border-purple-800 p-6 hover:shadow-xl hover:scale-105 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                  <span className="text-3xl">💳</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Activas</p>
                  <p className="text-4xl font-black text-purple-600 dark:text-purple-400">
                    {giftCardStats.active}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Valor total</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${giftCardStats.totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Por expirar</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {giftCardStats.expiringSoon} cards
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 font-semibold">
                  <span>Gestionar Gift Cards</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
      {/* Quick Actions Bar */}
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-6 animate-fade-in-up"
        style={{ animationDelay: '0.4s' }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href={`/dashboard/${config?.id}/queue`}>
            <button className="w-full px-4 py-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl font-semibold hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors">
              + Agregar a Fila
            </button>
          </Link>
          <Link href={`/dashboard/${config?.id}/appointments`}>
            <button className="w-full px-4 py-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-semibold hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
              + Nueva Cita
            </button>
          </Link>
          <Link href={`/dashboard/${config?.id}/giftcards`}>
            <button className="w-full px-4 py-3 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors">
              + Gift Card
            </button>
          </Link>
          <Link href={`/pegote/fila`} target="_blank">
            <button className="w-full px-4 py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
              🔗 Vista Pública
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
