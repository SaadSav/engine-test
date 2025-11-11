import { Request, Response, NextFunction } from 'express';
import { generateRequestId, isValidRequestId } from '../utils/requestId';
import { Logger } from '../utils/logger';

/**
 * Correlation ID middleware for distributed tracing
 *
 * Attaches a unique correlation ID to each request for tracking
 * requests across multiple services and log aggregation.
 */

// Standard header names for correlation IDs
export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

// Extend Express Request type to include correlation ID
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      logger?: Logger;
    }
  }
}

export interface CorrelationIdOptions {
  /**
   * Header name to use for correlation ID
   * @default 'x-correlation-id'
   */
  header?: string;

  /**
   * Whether to generate a new ID if none is provided
   * @default true
   */
  generateIfMissing?: boolean;

  /**
   * Whether to echo the correlation ID back in response headers
   * @default true
   */
  echoInResponse?: boolean;

  /**
   * Whether to validate incoming correlation IDs
   * @default false
   */
  validateFormat?: boolean;

  /**
   * Whether to attach a logger instance to the request
   * @default true
   */
  attachLogger?: boolean;
}

/**
 * Create correlation ID middleware
 *
 * @param {CorrelationIdOptions} options - Middleware configuration options
 * @returns {Function} Express middleware function
 */
export const correlationIdMiddleware = (
  options: CorrelationIdOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const {
    header = CORRELATION_ID_HEADER,
    generateIfMissing = true,
    echoInResponse = true,
    validateFormat = false,
    attachLogger = true
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Try to get correlation ID from headers
    let correlationId = req.get(header) || req.get(REQUEST_ID_HEADER);

    // Validate format if required
    if (correlationId && validateFormat && !isValidRequestId(correlationId)) {
      // Invalid format - generate a new one
      correlationId = undefined;
    }

    // Generate new ID if missing and generation is enabled
    if (!correlationId && generateIfMissing) {
      correlationId = generateRequestId();
    }

    // Attach correlation ID to request
    if (correlationId) {
      req.correlationId = correlationId;

      // Echo in response headers if enabled
      if (echoInResponse) {
        res.setHeader(header, correlationId);
      }

      // Attach a logger with correlation ID context
      if (attachLogger) {
        req.logger = new Logger({ correlationId });
      }
    }

    next();
  };
};

/**
 * Middleware to log incoming requests with correlation ID
 *
 * @returns {Function} Express middleware function
 */
export const requestLoggingMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const logger = req.logger || new Logger();
    const startTime = Date.now();

    // Log incoming request
    logger.http('Incoming request', {
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'warn' : 'http';

      logger[logLevel]('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('content-length')
      });
    });

    next();
  };
};

/**
 * Default export - ready-to-use middleware with default options
 */
export default correlationIdMiddleware();
