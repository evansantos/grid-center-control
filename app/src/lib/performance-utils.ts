import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

/**
 * Performance monitoring utilities
 */

// Web Vitals measurement
export const measureWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Measure Core Web Vitals
    const getCLS = () => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            let cls = 0;
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            });
            resolve(cls);
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        }
      });
    };

    const getFCP = () => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.name === 'first-contentful-paint') {
                resolve(entry.startTime);
                observer.disconnect();
              }
            });
          });
          observer.observe({ entryTypes: ['paint'] });
        }
      });
    };

    const getLCP = () => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry?.startTime || 0);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
      });
    };

    return { getCLS, getFCP, getLCP };
  }
  
  return { getCLS: () => 0, getFCP: () => 0, getLCP: () => 0 };
};

// Bundle size estimation
export const estimateBundleSize = async (componentName: string) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const entries = performance.getEntriesByType('resource');
    const jsEntries = entries.filter((entry) => 
      entry.name.includes('.js') && !entry.name.includes('node_modules')
    );
    
    const totalSize = jsEntries.reduce((acc, entry: any) => {
      return acc + (entry.transferSize || entry.decodedBodySize || 0);
    }, 0);
    
    return {
      totalJS: Math.round(totalSize / 1024), // KB
      resources: jsEntries.length,
      component: componentName
    };
  }
  
  return { totalJS: 0, resources: 0, component: componentName };
};

/**
 * React performance hooks
 */

// Debounced value hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized callback with dependencies
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Intersection observer for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  { threshold = 0, rootMargin = '0px' }: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, rootMargin]);

  return isVisible;
}

// Performance measurement hook
export function usePerformanceMark(name: string) {
  useEffect(() => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
      
      return () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      };
    }
  }, [name]);
}

// Memory usage tracking (development only)
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && (performance as any).memory) {
      const updateMemoryInfo = () => {
        setMemoryInfo({
          usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024), // MB
          totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024), // MB
          jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024), // MB
        });
      };

      updateMemoryInfo();
      const interval = setInterval(updateMemoryInfo, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfo;
}

// Dependencies imported above