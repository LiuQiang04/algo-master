import { Request, Response, NextFunction } from 'express';

// Simple Prometheus-compatible metrics endpoint
// In production, consider using prom-client library

interface Metrics {
  requestCount: number;
  requestDurationSum: number;
  requestDurationCount: number;
  statusCounts: Record<string, number>;
  startTime: number;
}

const metrics: Metrics = {
  requestCount: 0,
  requestDurationSum: 0,
  requestDurationCount: 0,
  statusCounts: {},
  startTime: Date.now(),
};

// Metrics middleware - tracks request count and duration
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metrics.requestCount++;
    metrics.requestDurationSum += duration;
    metrics.requestDurationCount++;

    const status = String(res.statusCode);
    metrics.statusCounts[status] = (metrics.statusCounts[status] || 0) + 1;
  });

  next();
}

// Prometheus metrics endpoint
export function metricsEndpoint(_req: Request, res: Response): void {
  const uptime = (Date.now() - metrics.startTime) / 1000;
  const avgDuration = metrics.requestDurationCount > 0
    ? metrics.requestDurationSum / metrics.requestDurationCount
    : 0;

  const lines = [
    '# HELP http_requests_total Total number of HTTP requests',
    '# TYPE http_requests_total counter',
    `http_requests_total ${metrics.requestCount}`,
    '',
    '# HELP http_request_duration_seconds Average HTTP request duration',
    '# TYPE http_request_duration_seconds gauge',
    `http_request_duration_seconds ${avgDuration.toFixed(4)}`,
    '',
    '# HELP process_uptime_seconds Process uptime in seconds',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${uptime.toFixed(0)}`,
    '',
    '# HELP http_requests_by_status_total HTTP requests by status code',
    '# TYPE http_requests_by_status_total counter',
    ...Object.entries(metrics.statusCounts).map(
      ([status, count]) => `http_requests_by_status_total{status="${status}"} ${count}`
    ),
    '',
    '# HELP nodejs_process_memory_bytes Process memory usage',
    '# TYPE nodejs_process_memory_bytes gauge',
    `nodejs_process_memory_bytes{type="rss"} ${process.memoryUsage().rss}`,
    `nodejs_process_memory_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}`,
    `nodejs_process_memory_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}`,
  ];

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(lines.join('\n') + '\n');
}
