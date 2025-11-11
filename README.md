# engine-test

## Overview

A Node.js application with enterprise-grade structured logging, request tracing, and security-hardened middleware.

## Features

### Structured Logging
- JSON-formatted logs for easy parsing and analysis
- Multiple log levels (debug, info, warn, error)
- Automatic timestamping and metadata
- File-based logging with rotation support
- Console output for development

### Request Correlation & Tracing
- Automatic correlation ID generation and tracking
- Request/response logging with timing information
- Distributed tracing support via `x-correlation-id` header
- Security-hardened ID validation and sanitization

### Security Features
- Automatic redaction of sensitive headers (Authorization, Cookie, API keys)
- Log injection attack prevention
- Header injection attack prevention
- DoS protection via length limits and truncation
- Input validation and sanitization

## Usage

### Using the Logger

The Winston logger can be used throughout your application for structured logging:

```javascript
const logger = require('./src/config/logger');

// Basic logging at different levels
logger.debug('Debug information', { userId: 123, action: 'fetch' });
logger.info('User logged in', { userId: 123, timestamp: new Date() });
logger.warn('Rate limit approaching', { userId: 123, requestCount: 95 });
logger.error('Database connection failed', { error: err.message, stack: err.stack });

// Logging with correlation ID
logger.info('Processing payment', {
  correlationId: req.correlationId,
  amount: 100.00,
  currency: 'USD'
});
```

### Using Middleware

Add the middleware to your Express application:

```javascript
const express = require('express');
const correlationIdMiddleware = require('./src/middleware/correlationId');
const requestLoggerMiddleware = require('./src/middleware/requestLogger');
const logger = require('./src/config/logger');

const app = express();

// Apply correlation ID middleware first
app.use(correlationIdMiddleware);

// Apply request logger middleware
app.use(requestLoggerMiddleware(logger));

// Your routes here
app.get('/api/users', (req, res) => {
  // Access correlation ID in your routes
  logger.info('Fetching users', { correlationId: req.correlationId });
  res.json({ users: [] });
});
```

## Log Levels

Use the appropriate log level based on the severity and nature of the event:

| Level | When to Use | Examples |
|-------|-------------|----------|
| **debug** | Detailed diagnostic information useful during development | Variable values, function entry/exit, detailed flow tracking |
| **info** | General informational messages about application operations | User actions, request/response details, business events |
| **warn** | Potentially harmful situations that don't prevent operation | Deprecated API usage, rate limit warnings, fallback behavior |
| **error** | Error events that might still allow the app to continue | Failed API calls, database errors, validation failures, exceptions |

**Best Practices:**
- Use `debug` for development-only information
- Use `info` for normal operational events
- Use `warn` for issues that should be investigated but don't require immediate action
- Use `error` for failures that require attention

## Correlation ID Header

### Format
- **Header name:** `x-correlation-id`
- **Format:** UUID v4 or alphanumeric string with hyphens/underscores
- **Max length:** 128 characters
- **Pattern:** `^[a-zA-Z0-9_-]+$`

### Behavior
1. **Client provides valid ID:** The provided ID is used throughout the request lifecycle
2. **Client provides invalid ID:** A new UUID is generated and used instead
3. **No ID provided:** A new UUID is automatically generated

### Example
```bash
# Request with correlation ID
curl -H "x-correlation-id: abc-123-def" http://localhost:3000/api/users

# Response includes the same correlation ID
HTTP/1.1 200 OK
x-correlation-id: abc-123-def
```

### Security Notes
- Invalid characters are automatically stripped
- Excessively long IDs are truncated to prevent DoS
- Invalid IDs are rejected and replaced with secure UUIDs

## Example Log Output

### Request Log
```json
{
  "level": "info",
  "message": "Incoming request",
  "type": "request",
  "method": "GET",
  "path": "/api/users",
  "url": "/api/users?role=admin",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "headers": {
    "host": "localhost:3000",
    "user-agent": "Mozilla/5.0",
    "authorization": "[REDACTED]",
    "cookie": "[REDACTED]"
  },
  "timestamp": "2025-11-11T08:54:32.123Z"
}
```

### Response Log
```json
{
  "level": "info",
  "message": "Successful response",
  "type": "response",
  "method": "GET",
  "path": "/api/users",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "statusCode": 200,
  "duration": 145,
  "timestamp": "2025-11-11T08:54:32.268Z"
}
```

### Error Log
```json
{
  "level": "error",
  "message": "Database connection failed",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "error": "Connection timeout after 5000ms",
  "stack": "Error: Connection timeout...\n    at Database.connect...",
  "timestamp": "2025-11-11T08:54:32.500Z"
}
```

## Security Considerations

### Sensitive Data Protection
The following headers are automatically redacted:
- `authorization`
- `cookie` / `set-cookie`
- `x-api-key` / `api-key` / `apikey`
- `x-auth-token`
- `x-csrf-token`
- `x-session-id`
- `access-token` / `refresh-token`

### Attack Prevention
- **Log Injection:** Control characters and newlines are stripped from log data
- **Header Injection:** Correlation IDs are validated against strict patterns
- **DoS Protection:** Long values are truncated (headers: 500 chars, logs: 10,000 chars)
- **Request Body:** Not logged by default to prevent sensitive data leakage

### Compliance & Privacy
- Do not log personally identifiable information (PII) without proper controls
- Do not log request bodies that may contain sensitive data
- Consider GDPR, HIPAA, or other regulatory requirements for your jurisdiction
- Implement log retention and deletion policies

## Architecture

### Components
- `src/config/logger.js` - Winston logger configuration (planned)
- `src/middleware/correlationId.js` - Correlation ID middleware
- `src/middleware/requestLogger.js` - Request/response logging middleware

### Flow
```
Request → correlationIdMiddleware → requestLoggerMiddleware → Your Routes → Response
            ↓                          ↓                                       ↓
      Attach ID                 Log Request                            Log Response
```