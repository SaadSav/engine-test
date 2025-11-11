import { AppError } from '../errors';

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    name: string;
    message: string;
    statusCode: number;
    timestamp: string;
    correlationId?: string;
    details?: any;
    stack?: string;
  };
}

/**
 * Format error for API response
 * Sanitizes error details based on environment
 */
export function formatErrorResponse(
  error: Error | AppError,
  correlationId?: string,
  includeStack: boolean = false
): ErrorResponse {
  const isProduction = process.env.NODE_ENV === 'production';

  // Build base error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      name: error.name,
      message: error.message,
      statusCode: error instanceof AppError ? error.statusCode : 500,
      timestamp: error instanceof AppError ? error.timestamp : new Date().toISOString(),
      ...(correlationId && { correlationId })
    }
  };

  // Include details if available
  if (error instanceof AppError && error.details) {
    errorResponse.error.details = error.details;
  }

  // Include stack trace only in development or if explicitly requested
  if (!isProduction && includeStack && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  return errorResponse;
}

/**
 * Sanitize error message for production
 * Hide sensitive information in production environments
 */
export function sanitizeErrorMessage(error: Error | AppError): string {
  const isProduction = process.env.NODE_ENV === 'production';

  // For operational errors, always show the message
  if (error instanceof AppError && error.isOperational) {
    return error.message;
  }

  // For non-operational errors in production, use generic message
  if (isProduction && !(error instanceof AppError)) {
    return 'An unexpected error occurred';
  }

  // In development, show all error messages
  return error.message;
}
