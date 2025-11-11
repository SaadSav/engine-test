/**
 * Request Logger Middleware
 * Logs incoming requests and outgoing responses with structured logging
 *
 * Security considerations:
 * - Sanitizes headers to prevent sensitive data leakage (Authorization, Cookie, etc.)
 * - Prevents log injection attacks by validating log data
 * - Rate limiting considerations for log volume
 * - Truncates large payloads to prevent DoS
 */

const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
  'x-session-id',
  'api-key',
  'apikey',
  'access-token',
  'refresh-token'
];

const MAX_LOG_LENGTH = 10000;
const MAX_HEADER_VALUE_LENGTH = 500;

/**
 * Sanitizes headers by removing sensitive information
 * @param {Object} headers - Request headers object
 * @returns {Object} - Sanitized headers object
 */
function sanitizeHeaders(headers) {
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    // Skip sensitive headers entirely
    if (SENSITIVE_HEADERS.includes(lowerKey)) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Truncate long header values to prevent log bloat
    if (typeof value === 'string' && value.length > MAX_HEADER_VALUE_LENGTH) {
      sanitized[key] = value.substring(0, MAX_HEADER_VALUE_LENGTH) + '...[TRUNCATED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitizes log data to prevent log injection attacks
 * Removes newlines and control characters that could break log parsing
 * @param {string} data - Data to sanitize
 * @returns {string} - Sanitized data
 */
function sanitizeLogData(data) {
  if (typeof data !== 'string') {
    return data;
  }

  // Remove newlines, carriage returns, and other control characters
  // This prevents log injection attacks where attacker could inject fake log entries
  return data
    .replace(/[\r\n]/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .substring(0, MAX_LOG_LENGTH);
}

/**
 * Extracts safe request information for logging
 * @param {Object} req - Express request object
 * @returns {Object} - Safe request data for logging
 */
function extractRequestInfo(req) {
  return {
    method: sanitizeLogData(req.method),
    path: sanitizeLogData(req.path),
    url: sanitizeLogData(req.originalUrl || req.url),
    correlationId: req.correlationId,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: sanitizeLogData(req.get('user-agent')),
    headers: sanitizeHeaders(req.headers),
    // Only log query params, not body (body may contain sensitive data)
    query: req.query ? sanitizeLogData(JSON.stringify(req.query)) : undefined
  };
}

/**
 * Request logger middleware
 * Logs incoming requests and outgoing responses with timing information
 *
 * @param {Object} logger - Winston logger instance (optional, defaults to console)
 * @returns {Function} - Express middleware function
 */
function requestLoggerMiddleware(logger = console) {
  return function (req, res, next) {
    const startTime = Date.now();

    // Log incoming request
    const requestInfo = extractRequestInfo(req);

    if (logger.info) {
      logger.info('Incoming request', {
        type: 'request',
        ...requestInfo,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('[REQUEST]', JSON.stringify({
        type: 'request',
        ...requestInfo,
        timestamp: new Date().toISOString()
      }));
    }

    // Capture original end function
    const originalEnd = res.end;
    const originalOn = res.on;

    // Flag to ensure we only log once
    let logged = false;

    /**
     * Logs the response with timing and status information
     */
    function logResponse() {
      if (logged) return;
      logged = true;

      const duration = Date.now() - startTime;
      const responseInfo = {
        type: 'response',
        method: sanitizeLogData(req.method),
        path: sanitizeLogData(req.path),
        correlationId: req.correlationId,
        statusCode: res.statusCode,
        duration: duration,
        timestamp: new Date().toISOString()
      };

      // Log at appropriate level based on status code
      if (res.statusCode >= 500) {
        if (logger.error) {
          logger.error('Server error response', responseInfo);
        } else {
          console.error('[RESPONSE ERROR]', JSON.stringify(responseInfo));
        }
      } else if (res.statusCode >= 400) {
        if (logger.warn) {
          logger.warn('Client error response', responseInfo);
        } else {
          console.warn('[RESPONSE WARN]', JSON.stringify(responseInfo));
        }
      } else {
        if (logger.info) {
          logger.info('Successful response', responseInfo);
        } else {
          console.log('[RESPONSE]', JSON.stringify(responseInfo));
        }
      }
    }

    // Override res.end to log when response completes
    res.end = function (chunk, encoding) {
      res.end = originalEnd;
      res.end(chunk, encoding);
      logResponse();
    };

    // Also handle 'finish' event as backup
    res.on('finish', function () {
      res.on = originalOn;
      logResponse();
    });

    // Handle errors in the request pipeline
    res.on('error', function (error) {
      if (logger.error) {
        logger.error('Response error', {
          type: 'response_error',
          method: sanitizeLogData(req.method),
          path: sanitizeLogData(req.path),
          correlationId: req.correlationId,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      } else {
        console.error('[RESPONSE ERROR]', JSON.stringify({
          type: 'response_error',
          method: sanitizeLogData(req.method),
          path: sanitizeLogData(req.path),
          correlationId: req.correlationId,
          error: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });

    next();
  };
}

module.exports = requestLoggerMiddleware;
module.exports.sanitizeHeaders = sanitizeHeaders;
module.exports.sanitizeLogData = sanitizeLogData;
module.exports.extractRequestInfo = extractRequestInfo;
module.exports.SENSITIVE_HEADERS = SENSITIVE_HEADERS;
