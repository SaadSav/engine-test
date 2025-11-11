import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../errors';
import { isSentryEnabled } from '../config/sentry.config';

/**
 * Sentry request handler middleware
 * Attaches Sentry tracing to all requests
 */
export const sentryRequestHandler = (): RequestHandler => {
  if (!isSentryEnabled()) {
    // Return no-op middleware if Sentry is disabled
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return Sentry.Handlers.requestHandler({
    ip: true,
    user: ['id', 'username', 'email'],
    request: true,
    transaction: 'path'
  });
};

/**
 * Sentry tracing handler middleware
 * Enables performance monitoring
 */
export const sentryTracingHandler = (): RequestHandler => {
  if (!isSentryEnabled()) {
    // Return no-op middleware if Sentry is disabled
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return Sentry.Handlers.tracingHandler();
};

/**
 * Sentry error handler middleware
 * Must be placed after all other middleware and routes
 */
export const sentryErrorHandler = () => {
  if (!isSentryEnabled()) {
    // Return no-op middleware if Sentry is disabled
    return (error: Error, req: Request, res: Response, next: NextFunction) => next(error);
  }

  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only send 500 errors to Sentry by default
      // 4xx errors are typically client errors and don't need tracking
      if (error instanceof AppError) {
        return error.statusCode >= 500;
      }
      // Unknown errors should be tracked
      return true;
    }
  });
};

/**
 * Enrich Sentry context with custom data
 */
export const enrichSentryContext = (
  req: Request,
  additionalData?: Record<string, any>
): void => {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.configureScope((scope) => {
    // Add correlation ID
    if (req.correlationId) {
      scope.setTag('correlationId', req.correlationId);
      scope.setContext('correlation', {
        correlationId: req.correlationId
      });
    }

    // Add request information
    scope.setContext('request', {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      headers: sanitizeHeaders(req.headers),
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Add user information if available
    if (req.user) {
      scope.setUser({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        ip_address: req.ip
      });
    }

    // Add any additional custom data
    if (additionalData) {
      scope.setContext('custom', additionalData);
    }

    // Add breadcrumb
    Sentry.addBreadcrumb({
      category: 'request',
      message: `${req.method} ${req.path}`,
      level: 'info',
      data: {
        method: req.method,
        url: req.url,
        correlationId: req.correlationId
      }
    });
  });
};

/**
 * Middleware to automatically enrich Sentry context for each request
 */
export const autoEnrichSentryContext = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isSentryEnabled()) {
      enrichSentryContext(req);
    }
    next();
  };
};

/**
 * Helper to sanitize headers (remove sensitive data)
 */
const sanitizeHeaders = (headers: any): any => {
  const sanitized = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token'
  ];

  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Manually capture an exception in Sentry
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>
): string | undefined => {
  if (!isSentryEnabled()) {
    return undefined;
  }

  return Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined
  });
};

/**
 * Manually capture a message in Sentry
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): string | undefined => {
  if (!isSentryEnabled()) {
    return undefined;
  }

  return Sentry.captureMessage(message, {
    level,
    contexts: context ? { custom: context } : undefined
  });
};

/**
 * Add a breadcrumb to Sentry
 */
export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, any>,
  level: Sentry.SeverityLevel = 'info'
): void => {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data
  });
};
