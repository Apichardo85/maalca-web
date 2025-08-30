"use client";

import { useState, useEffect } from 'react';
import { performanceMonitor, logPerformanceReport } from '@/lib/performance';

// Only render in development
const PerformanceDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const interval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        ⚡ Performance ({metrics.length})
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl w-96 max-h-80 overflow-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900">Performance Metrics</h3>
              <div className="flex gap-2">
                <button
                  onClick={logPerformanceReport}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                >
                  Log Report
                </button>
                <button
                  onClick={() => performanceMonitor.clearMetrics()}
                  className="text-xs bg-red-100 px-2 py-1 rounded hover:bg-red-200"
                >
                  Clear
                </button>
              </div>
            </div>

            {metrics.length === 0 ? (
              <p className="text-gray-500 text-sm">No metrics recorded yet</p>
            ) : (
              <div className="space-y-2">
                {metrics.slice(-10).map((metric, index) => (
                  <div key={index} className="text-xs border-b border-gray-100 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{metric.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        metric.type === 'component' ? 'bg-blue-100 text-blue-800' :
                        metric.type === 'api' ? 'bg-green-100 text-green-800' :
                        metric.type === 'image' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {metric.type}
                      </span>
                    </div>
                    {metric.duration && (
                      <div className="text-gray-600 mt-1">
                        Duration: {metric.duration}ms
                      </div>
                    )}
                    {metric.metadata && Object.keys(metric.metadata).length > 0 && (
                      <div className="text-gray-500 mt-1">
                        {JSON.stringify(metric.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                Summary: {performanceMonitor.getPerformanceSummary().totalMetrics} metrics, 
                Avg: {Math.round(performanceMonitor.getPerformanceSummary().avgDuration)}ms
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceDebugger;