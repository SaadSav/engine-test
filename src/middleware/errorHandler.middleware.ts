import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../errors';
import { formatErrorResponse, sanitizeErrorMessage } from '../utils/errorFormatter';
import { defaultLogger } from '../utils';

/**
 * Global error handler middleware
 * Catches all errors and formats them appropriately
 */
export const errorHandlerMiddleware: ErrorRequestHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = req.logger || defaultLogger;
  const correlationId = req.correlationId;

  // Determine status code
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  // Log error details
  const logContext = {
    correlationId,
    method: req.method,
    path: req.path,
    statusCode,
    errorName: error.name,
    errorMessage: error.message,
    ...(error instanceof AppError && error.details && { errorDetails: error.details }),
    ...(error.stack && { stack: error.stack })
  };

  // Log based on error severity
  if (statusCode >= 500) {
    logger.error('Server error occurred', logContext);
  } else if (statusCode >= 400) {
    logger.warn('Client error occurred', logContext);
  } else {
    logger.info('Error handled', logContext);
  }

  // Sanitize error message
  const sanitizedMessage = sanitizeErrorMessage(error);
  const sanitizedError = error instanceof AppError
    ? { ...error, message: sanitizedMessage }
    : { ...error, message: sanitizedMessage };

  // Format error response
  const includeStack = process.env.NODE_ENV !== 'production' && process.env.INCLUDE_STACK === 'true';
  const errorResponse = formatErrorResponse(sanitizedError, correlationId, includeStack);

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Handles requests to undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger = req.logger || defaultLogger;
  const correlationId = req.correlationId;

  logger.warn('Route not found', {
    correlationId,
    method: req.method,
    path: req.path,
    query: req.query
  });

  const errorResponse = {
    success: false,
    error: {
      name: 'NotFoundError',
      message: `Cannot ${req.method} ${req.path}`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      ...(correlationId && { correlationId })
    }
  };

  res.status(404).json(errorResponse);
};
