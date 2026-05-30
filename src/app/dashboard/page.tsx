"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";
import { getAffiliateConfig } from "@/config/affiliates-config";

interface UserAffiliate {
  id: string;
  slug: string;
  name: string;
  businessType: string;
  plan: string;
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurante",
  barber: "Barbería",
  service: "Servicios",
  retail: "Tienda",
};

export default function DashboardSelector() {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<UserAffiliate[] | null>(null);

  useEffect(() => {
    apiFetch<UserAffiliate[]>("/api/me/affiliates")
      .then((data) => {
        if (data.length === 0) {
          router.replace("/onboarding");
        } else {
          setAffiliates(data);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/onboarding");
        } else {
          // maalca-api unreachable — show empty state so user isn't stuck
          setAffiliates([]);
        }
      });
  }, [router]);

  // Loading
  if (affiliates === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Dashboard MaalCa
          </h1>
          <p className="text-lg sm:text-xl text-gray-400">
            Selecciona tu negocio para continuar
          </p>
        </div>

        {affiliates.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="mb-4">No se pudieron cargar tus negocios.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {affiliates.map((affiliate, index) => (
              <div
                key={affiliate.id}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={getAffiliateConfig(affiliate.slug) ? `/dashboard/${affiliate.slug}` : `/space/${affiliate.slug}`}>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:p-8 hover:border-red-600 dark:hover:border-red-600 transition-all hover:shadow-2xl group cursor-pointer">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 bg-opacity-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-2xl sm:text-3xl">🏢</span>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                          {affiliate.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {BUSINESS_TYPE_LABELS[affiliate.businessType] ?? affiliate.businessType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">
                        {affiliate.plan}
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
        )}

        <div
          className="mt-8 sm:mt-12 text-center animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            ¿Necesitas ayuda?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              ← Volver al inicio
            </Link>
            <span className="hidden sm:block text-gray-700">|</span>
            <a href="/contacto" className="text-red-500 hover:text-red-400 transition-colors">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
