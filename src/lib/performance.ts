// Performance monitoring utilities
import React, { useEffect } from 'react';

export interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type: 'navigation' | 'component' | 'api' | 'image' | 'custom';
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupObservers();
    }
  }

  private setupObservers() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        this.recordMetric('LCP', Date.now(), Date.now(), 'navigation', {
          value: lastEntry.startTime,
          element: lastEntry.element?.tagName
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          this.recordMetric('FID', Date.now(), Date.now(), 'navigation', {
            value: entry.processingStart - entry.startTime
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
        this.recordMetric('CLS', Date.now(), Date.now(), 'navigation', {
          value: clsValue
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log('Navigation:', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            firstByte: entry.responseStart - entry.requestStart
          });
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }
  }

  // Start timing a performance metric
  startTiming(name: string, type: PerformanceMetrics['type'] = 'custom', metadata?: Record<string, unknown>) {
    const startTime = Date.now();
    this.metrics.set(name, {
      name,
      startTime,
      type,
      metadata
    });
    return startTime;
  }

  // End timing and calculate duration
  endTiming(name: string, additionalMetadata?: Record<string, unknown>) {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    const finalMetric: PerformanceMetrics = {
      ...metric,
      endTime,
      duration,
      metadata: {
        ...metric.metadata,
        ...additionalMetadata
      }
    };

    this.metrics.set(name, finalMetric);
    
    // Log performance metric in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}:`, `${duration}ms`, finalMetric.metadata);
    }

    return finalMetric;
  }

  // Record a complete metric
  recordMetric(
    name: string, 
    startTime: number, 
    endTime: number, 
    type: PerformanceMetrics['type'], 
    metadata?: Record<string, unknown>
  ) {
    const metric: PerformanceMetrics = {
      name,
      startTime,
      endTime,
      duration: endTime - startTime,
      type,
      metadata
    };
    this.metrics.set(name, metric);
    return metric;
  }

  // Get all metrics
  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Get metrics by type
  getMetricsByType(type: PerformanceMetrics['type']): PerformanceMetrics[] {
    return this.getMetrics().filter(metric => metric.type === type);
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
  }

  // Get performance summary
  getPerformanceSummary() {
    const metrics = this.getMetrics();
    const summary = {
      totalMetrics: metrics.length,
      avgDuration: metrics
        .filter(m => m.duration)
        .reduce((sum, m) => sum + m.duration!, 0) / metrics.filter(m => m.duration).length || 0,
      byType: {} as Record<string, { count: number; avgDuration: number }>
    };

    // Group by type
    metrics.forEach(metric => {
      if (!summary.byType[metric.type]) {
        summary.byType[metric.type] = { count: 0, avgDuration: 0 };
      }
      summary.byType[metric.type].count++;
      if (metric.duration) {
        summary.byType[metric.type].avgDuration += metric.duration;
      }
    });

    // Calculate averages
    Object.keys(summary.byType).forEach(type => {
      const typeData = summary.byType[type];
      typeData.avgDuration = typeData.avgDuration / typeData.count;
    });

    return summary;
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.clearMetrics();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string, dependencies: unknown[] = []) {
  useEffect(() => {
    const startTime = performanceMonitor.startTiming(`${componentName}-render`, 'component');
    
    return () => {
      performanceMonitor.endTiming(`${componentName}-render`);
    };
  }, dependencies);
}

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => {
    useEffect(() => {
      performanceMonitor.startTiming(`${displayName}-mount`, 'component');
      
      return () => {
        performanceMonitor.endTiming(`${displayName}-mount`);
      };
    }, []);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return WrappedComponent;
}

// Utility functions for common performance measurements
export const measureImageLoad = (src: string) => {
  const name = `image-load-${src.split('/').pop()}`;
  performanceMonitor.startTiming(name, 'image', { src });
  
  return {
    onLoad: () => performanceMonitor.endTiming(name, { status: 'success' }),
    onError: () => performanceMonitor.endTiming(name, { status: 'error' })
  };
};

export const measureApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  performanceMonitor.startTiming(`api-${name}`, 'api', metadata);
  
  try {
    const result = await apiCall();
    performanceMonitor.endTiming(`api-${name}`, { status: 'success' });
    return result;
  } catch (error) {
    performanceMonitor.endTiming(`api-${name}`, { status: 'error', error: error.message });
    throw error;
  }
};

// Performance debugging utilities (development only)
export const logPerformanceReport = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚀 Performance Report');
    console.table(performanceMonitor.getMetrics());
    console.log('Summary:', performanceMonitor.getPerformanceSummary());
    console.groupEnd();
  }
};

