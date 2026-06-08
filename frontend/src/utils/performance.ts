import { useEffect, useRef } from 'react';

// Performance entry types
interface PerformanceMetric {
  name: string;
  type: 'page-load' | 'component-render' | 'api-request' | 'custom';
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Performance reporter configuration
interface PerformanceConfig {
  enabled: boolean;
  reportUrl?: string;
  batchSize: number;
  flushInterval: number;
  sampleRate: number;
}

// Default configuration
const defaultConfig: PerformanceConfig = {
  enabled: import.meta.env.PROD,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  sampleRate: 0.1, // 10% sampling in production
};

// Performance metrics buffer
let metricsBuffer: PerformanceMetric[] = [];
let config: PerformanceConfig = { ...defaultConfig };

/**
 * Configure performance monitoring
 */
export function configurePerformance(userConfig: Partial<PerformanceConfig>) {
  config = { ...defaultConfig, ...userConfig };
}

/**
 * Check if performance monitoring should run
 */
function shouldTrack(): boolean {
  if (!config.enabled) return false;
  return Math.random() < config.sampleRate;
}

/**
 * Add metric to buffer and flush if needed
 */
function addMetric(metric: PerformanceMetric) {
  if (!shouldTrack()) return;

  metricsBuffer.push(metric);

  if (metricsBuffer.length >= config.batchSize) {
    flushMetrics();
  }
}

/**
 * Send metrics to server
 */
async function flushMetrics() {
  if (metricsBuffer.length === 0) return;

  const metricsToSend = [...metricsBuffer];
  metricsBuffer = [];

  if (!config.reportUrl) {
    // In development, log to console
    if (import.meta.env.DEV) {
      console.group('Performance Metrics');
      metricsToSend.forEach((m) => {
        console.log(`${m.name}: ${m.duration.toFixed(2)}ms`, m.metadata);
      });
      console.groupEnd();
    }
    return;
  }

  try {
    await fetch(config.reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics: metricsToSend }),
      keepalive: true,
    });
  } catch (error) {
    // Silently fail - don't impact user experience
    console.warn('Failed to report performance metrics:', error);
  }
}

// Set up periodic flush
if (typeof window !== 'undefined') {
  setInterval(flushMetrics, defaultConfig.flushInterval);

  // Flush on page unload
  window.addEventListener('beforeunload', () => {
    flushMetrics();
  });
}

/**
 * Measure the execution time of a function
 *
 * @example
 * const result = measurePerformance('data-fetching', () => {
 *   return fetchData();
 * });
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const startTime = performance.now();
  const result = fn();
  const duration = performance.now() - startTime;

  addMetric({
    name,
    type: 'custom',
    duration,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Measure the execution time of an async function
 *
 * @example
 * const data = await measureAsyncPerformance('api-call', async () => {
 *   return await fetchUsers();
 * });
 */
export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    addMetric({
      name,
      type: 'custom',
      duration,
      timestamp: Date.now(),
      metadata: { success: true },
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    addMetric({
      name,
      type: 'custom',
      duration,
      timestamp: Date.now(),
      metadata: { success: false, error: String(error) },
    });

    throw error;
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Use setTimeout to ensure all metrics are collected
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        addMetric({
          name: 'page-load',
          type: 'page-load',
          duration: navigation.loadEventEnd - navigation.startTime,
          timestamp: Date.now(),
          metadata: {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            domReady: navigation.domContentLoadedEventEnd - navigation.startTime,
            resources: performance.getEntriesByType('resource').length,
          },
        });
      }
    }, 0);
  });
}

/**
 * Hook to monitor component render time
 *
 * @example
 * function MyComponent() {
 *   usePerformanceMonitor('MyComponent');
 *   return <div>...</div>;
 * }
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    const duration = performance.now() - renderStartTime.current;
    renderCount.current++;

    addMetric({
      name: `component-render:${componentName}`,
      type: 'component-render',
      duration,
      timestamp: Date.now(),
      metadata: {
        renderCount: renderCount.current,
      },
    });
  });

  // Update start time for next render
  renderStartTime.current = performance.now();
}

/**
 * Create an API request interceptor for performance tracking
 *
 * @example
 * // In your API client setup
 * const api = axios.create();
 * api.interceptors.request.use(createPerformanceInterceptor());
 */
export function createPerformanceInterceptor() {
  return (config: { _startTime?: number; url?: string }) => {
    config._startTime = performance.now();
    return config;
  };
}

/**
 * Create an API response interceptor for performance tracking
 */
export function createPerformanceResponseInterceptor() {
  return (response: { config: { _startTime?: number; url?: string } }) => {
    if (response.config._startTime) {
      const duration = performance.now() - response.config._startTime;

      addMetric({
        name: `api-request:${response.config.url || 'unknown'}`,
        type: 'api-request',
        duration,
        timestamp: Date.now(),
        metadata: {
          url: response.config.url,
          status: response.status,
        },
      });
    }
    return response;
  };
}

/**
 * Get current performance metrics (for debugging)
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metricsBuffer];
}

/**
 * Clear performance metrics buffer
 */
export function clearPerformanceMetrics() {
  metricsBuffer = [];
}
