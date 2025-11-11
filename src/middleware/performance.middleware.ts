import { Request, Response, NextFunction, RequestHandler } from 'express';
import * as Sentry from '@sentry/node';
import { defaultLogger } from '../utils';
import { isSentryEnabled } from '../config/sentry.config';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

/**
 * Extend Request type to include performance metrics
 */
declare global {
  namespace Express {
    interface Request {
      performanceMetrics?: PerformanceMetrics;
    }
  }
}

/**
 * Performance monitoring middleware options
 */
export interface PerformanceMonitoringOptions {
  /**
   * Log requests that take longer than this threshold (in ms)
   * Default: 1000ms (1 second)
   */
  slowRequestThreshold?: number;

  /**
   * Log all requests regardless of duration
   * Default: false
   */
  logAllRequests?: boolean;

  /**
   * Include memory usage in performance logs
   * Default: true
   */
  includeMemoryUsage?: boolean;

  /**
   * Send slow requests to Sentry
   * Default: true
   */
  reportSlowRequests?: boolean;
}

/**
 * Performance monitoring middleware
 * Tracks response times and logs slow requests
 */
export const performanceMonitoring = (
  options: PerformanceMonitoringOptions = {}
): RequestHandler => {
  const {
    slowRequestThreshold = 1000,
    logAllRequests = false,
    includeMemoryUsage = true,
    reportSlowRequests = true
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Record start time
    const startTime = Date.now();
    const startMemory = includeMemoryUsage ? process.memoryUsage() : undefined;

    // Store metrics on request object
    req.performanceMetrics = {
      startTime,
      memoryUsage: startMemory
    };

    // Create a Sentry transaction for this request if enabled
    let transaction: ReturnType<typeof Sentry.startTransaction> | undefined;
    if (isSentryEnabled()) {
      transaction = Sentry.startTransaction({
        op: 'http.server',
        name: `${req.method} ${req.route?.path || req.path}`,
        data: {
          method: req.method,
          url: req.url,
          correlationId: req.correlationId
        }
      });

      // Set transaction on the scope
      Sentry.getCurrentHub().configureScope(scope => {
        scope.setSpan(transaction);
      });
    }

    // Capture the original end function
    const originalEnd = res.end;

    // Override res.end to measure response time
    res.end = function(this: Response, ...args: any[]): Response {
      // Calculate duration
      const endTime = Date.now();
      const duration = endTime - startTime;
      const endMemory = includeMemoryUsage ? process.memoryUsage() : undefined;

      // Update performance metrics
      if (req.performanceMetrics) {
        req.performanceMetrics.endTime = endTime;
        req.performanceMetrics.duration = duration;
      }

      // Prepare log data
      const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        correlationId: req.correlationId,
        ...(includeMemoryUsage && startMemory && endMemory && {
          memoryDelta: {
            heapUsed: formatBytes(endMemory.heapUsed - startMemory.heapUsed),
            external: formatBytes(endMemory.external - startMemory.external)
          }
        })
      };

      // Get logger
      const logger = req.logger || defaultLogger;

      // Determine if this is a slow request
      const isSlowRequest = duration >= slowRequestThreshold;

      // Log based on conditions
      if (logAllRequests || isSlowRequest) {
        if (isSlowRequest) {
          logger.warn('Slow request detected', {
            ...logData,
            threshold: slowRequestThreshold
          });

          // Report to Sentry if enabled
          if (reportSlowRequests && isSentryEnabled()) {
            Sentry.captureMessage(`Slow request: ${req.method} ${req.path}`, {
              level: 'warning',
              tags: {
                slow_request: 'true',
                method: req.method,
                path: req.path
              },
              contexts: {
                performance: {
                  duration,
                  threshold: slowRequestThreshold,
                  statusCode: res.statusCode
                }
              }
            });
          }
        } else {
          logger.debug('Request completed', logData);
        }
      }

      // Finish Sentry transaction
      if (transaction) {
        transaction.setHttpStatus(res.statusCode);
        transaction.setData('duration', duration);
        transaction.finish();
      }

      // Add response time header
      res.setHeader('X-Response-Time', `${duration}ms`);

      // Call original end function
      return originalEnd.apply(this, args);
    };

    next();
  };
};

/**
 * Helper function to format bytes to human-readable format
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} ${sizes[i]}`;
};

/**
 * Middleware to add performance metrics to response
 */
export const addPerformanceHeaders = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture original json method
    const originalJson = res.json;

    // Override json method to add timing
    res.json = function(this: Response, body: any): Response {
      const duration = Date.now() - startTime;
      this.setHeader('X-Response-Time', `${duration}ms`);
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Get current request performance metrics
 */
export const getPerformanceMetrics = (req: Request): PerformanceMetrics | undefined => {
  return req.performanceMetrics;
};
