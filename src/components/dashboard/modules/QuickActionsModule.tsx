"use client";
import Link from "next/link";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { DashboardCard } from "../DashboardCard";
interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}
/**
 * Módulo de acciones rápidas
 */
export function QuickActionsModule() {
  const { config, hasModule } = useAffiliate();
  const quickActions: QuickAction[] = [
    hasModule('customers') && {
      name: "Nuevo Cliente",
      description: "Registrar un cliente nuevo",
      href: `/dashboard/${config?.id}/customers/new`,
      icon: "👤",
      color: "blue"
    },
    hasModule('appointments') && {
      name: "Nueva Cita",
      description: "Agendar una cita",
      href: `/dashboard/${config?.id}/appointments/new`,
      icon: "📅",
      color: "green"
    },
    hasModule('ecommerce') && {
      name: "Nuevo Pedido",
      description: "Crear un pedido manual",
      href: `/dashboard/${config?.id}/store/orders/new`,
      icon: "🛒",
      color: "purple"
    },
    hasModule('campaigns') && {
      name: "Nueva Campaña",
      description: "Lanzar campaña de marketing",
      href: `/dashboard/${config?.id}/campaigns/new`,
      icon: "📢",
      color: "orange"
    },
    hasModule('invoicing') && {
      name: "Nueva Factura",
      description: "Generar factura",
      href: `/dashboard/${config?.id}/invoicing/new`,
      icon: "💰",
      color: "red"
    },
    hasModule('inventory') && {
      name: "Actualizar Inventario",
      description: "Registrar entrada/salida",
      href: `/dashboard/${config?.id}/inventory/update`,
      icon: "📦",
      color: "yellow"
    }
  ].filter(Boolean) as QuickAction[];
  if (quickActions.length === 0) {
    return null;
  }
  return (
    <DashboardCard
      title="Acciones Rápidas"
      subtitle="Accesos directos a las tareas más comunes"
      icon="⚡"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <div
            key={action.href}
            className="animate-fade-in-scale"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Link href={action.href}>
              <div className="group p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all cursor-pointer hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <span className="text-xl">{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                      {action.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
