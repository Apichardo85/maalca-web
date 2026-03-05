/**
 * Loading state para el dashboard
 * Se muestra mientras Next.js carga la página del dashboard
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Spinner animado */}
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-red-600 rounded-full animate-spin mx-auto"></div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Cargando dashboard...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Preparando tu espacio de trabajo
          </p>
        </div>

        {/* Skeleton de cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 h-32 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
