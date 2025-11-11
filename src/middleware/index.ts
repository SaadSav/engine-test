/**
 * Middleware exports
 */

export {
  correlationIdMiddleware,
  requestLoggingMiddleware,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  CorrelationIdOptions
} from './correlationId.middleware';

export {
  errorHandlerMiddleware,
  notFoundHandler
} from './errorHandler.middleware';

export {
  asyncHandler,
  AsyncHandler,
  AsyncRequestHandler
} from './asyncHandler.middleware';

export {
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  enrichSentryContext,
  autoEnrichSentryContext,
  captureException,
  captureMessage,
  addBreadcrumb
} from './sentry.middleware';

export {
  performanceMonitoring,
  addPerformanceHeaders,
  getPerformanceMetrics,
  PerformanceMonitoringOptions
} from './performance.middleware';
