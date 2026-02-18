'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { measureWebVitals } from '@/lib/performance-utils';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  cls: number;
  bundleSize: number;
  memoryUsage: number;
  renderCount: number;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  trackRender: (componentName: string) => void;
  trackError: (error: Error, componentName: string) => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

// Performance Provider Component
export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    cls: 0,
    bundleSize: 0,
    memoryUsage: 0,
    renderCount: 0,
  });

  const [renderCounts, setRenderCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const webVitals = measureWebVitals();
    
    // Measure Core Web Vitals
    Promise.all([
      webVitals.getFCP(),
      webVitals.getLCP(),
      webVitals.getCLS()
    ]).then(([fcp, lcp, cls]) => {
      setMetrics(prev => ({
        ...prev,
        fcp: fcp as number,
        lcp: lcp as number,
        cls: cls as number,
      }));
    });

    // Estimate bundle size
    if (typeof window !== 'undefined') {
      const entries = performance.getEntriesByType('resource');
      const jsSize = entries
        .filter((entry) => entry.name.includes('.js'))
        .reduce((acc, entry: any) => acc + (entry.transferSize || 0), 0);
      
      setMetrics(prev => ({
        ...prev,
        bundleSize: Math.round(jsSize / 1024), // KB
      }));
    }

    // Memory usage (if available)
    const updateMemoryUsage = () => {
      if ((performance as any).memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024), // MB
        }));
      }
    };

    updateMemoryUsage();
    const memoryInterval = setInterval(updateMemoryUsage, 10000);

    return () => clearInterval(memoryInterval);
  }, []);

  const trackRender = (componentName: string) => {
    setRenderCounts(prev => {
      const newCount = (prev.get(componentName) || 0) + 1;
      const newMap = new Map(prev);
      newMap.set(componentName, newCount);
      
      // Update total render count
      const totalRenders = Array.from(newMap.values()).reduce((sum, count) => sum + count, 0);
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        renderCount: totalRenders,
      }));
      
      return newMap;
    });

    // Log excessive re-renders in development
    if (process.env.NODE_ENV === 'development') {
      const count = renderCounts.get(componentName) || 0;
      if (count > 10) {
        console.warn(`Component ${componentName} has re-rendered ${count} times. Consider optimization.`);
      }
    }
  };

  const trackError = (error: Error, componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Performance tracking error in ${componentName}:`, error);
    }
    
    // Could send to analytics service in production
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `${componentName}: ${error.message}`,
        fatal: false,
      });
    }
  };

  const contextValue: PerformanceContextType = {
    metrics,
    trackRender,
    trackError,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

// Hook to use performance context
export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// HOC for tracking component renders
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const { trackRender, trackError } = usePerformance();
    
    useEffect(() => {
      trackRender(componentName);
    });

    try {
      return <Component {...props} />;
    } catch (error) {
      trackError(error as Error, componentName);
      throw error;
    }
  };
}

// Performance monitoring component for debugging
export function PerformanceMonitor() {
  const { metrics } = usePerformance();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>FCP: {metrics.fcp.toFixed(0)}ms</div>
        <div>LCP: {metrics.lcp.toFixed(0)}ms</div>
        <div>CLS: {metrics.cls.toFixed(4)}</div>
        <div>Bundle: {metrics.bundleSize}KB</div>
        <div>Memory: {metrics.memoryUsage}MB</div>
        <div>Renders: {metrics.renderCount}</div>
      </div>
    </div>
  );
}