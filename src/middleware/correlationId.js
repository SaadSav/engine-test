const { v4: uuidv4 } = require('uuid');

/**
 * Correlation ID middleware
 * Extracts or generates a correlation ID for request tracking
 *
 * Security considerations:
 * - Validates and sanitizes incoming correlation IDs
 * - Generates cryptographically secure UUIDs
 * - Prevents header injection attacks
 */

const CORRELATION_ID_HEADER = 'x-correlation-id';
const MAX_CORRELATION_ID_LENGTH = 128;

/**
 * Validates correlation ID to prevent injection attacks
 * @param {string} correlationId - The correlation ID to validate
 * @returns {boolean} - Whether the correlation ID is valid
 */
function isValidCorrelationId(correlationId) {
  if (!correlationId || typeof correlationId !== 'string') {
    return false;
  }

  // Limit length to prevent DOS attacks
  if (correlationId.length > MAX_CORRELATION_ID_LENGTH) {
    return false;
  }

  // Allow only alphanumeric characters, hyphens, and underscores
  // This prevents header injection and other attacks
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(correlationId);
}

/**
 * Sanitizes correlation ID by removing potentially dangerous characters
 * @param {string} correlationId - The correlation ID to sanitize
 * @returns {string} - Sanitized correlation ID
 */
function sanitizeCorrelationId(correlationId) {
  if (!correlationId) {
    return '';
  }

  // Remove any characters that aren't alphanumeric, hyphens, or underscores
  return correlationId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, MAX_CORRELATION_ID_LENGTH);
}

/**
 * Middleware function to handle correlation IDs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function correlationIdMiddleware(req, res, next) {
  let correlationId = req.get(CORRELATION_ID_HEADER);

  // If correlation ID is provided, validate and sanitize it
  if (correlationId) {
    if (isValidCorrelationId(correlationId)) {
      // Use the provided correlation ID
      correlationId = sanitizeCorrelationId(correlationId);
    } else {
      // Invalid correlation ID provided - generate a new one
      correlationId = uuidv4();
    }
  } else {
    // No correlation ID provided - generate a new one
    correlationId = uuidv4();
  }

  // Attach correlation ID to request object for use in application code
  req.correlationId = correlationId;

  // Add correlation ID to response headers for client tracking
  res.setHeader(CORRELATION_ID_HEADER, correlationId);

  next();
}

module.exports = correlationIdMiddleware;
module.exports.isValidCorrelationId = isValidCorrelationId;
module.exports.sanitizeCorrelationId = sanitizeCorrelationId;
module.exports.CORRELATION_ID_HEADER = CORRELATION_ID_HEADER;
