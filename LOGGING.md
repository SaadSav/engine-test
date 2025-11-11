# Structured Logging Infrastructure

This document describes the structured logging infrastructure implemented in this project.

## Overview

The logging infrastructure provides:
- Environment-based log levels (debug for development, info/error for production)
- Winston logger with JSON formatting for production and pretty-print for development
- Log rotation and file transport for persistent logs
- Request ID generator for distributed tracing
- Correlation ID middleware for request tracking

## Architecture

### Core Components

1. **Logger Configuration** (`src/config/logger.config.ts`)
   - Environment-based log level configuration
   - Format configuration (JSON for production, pretty-print for development)
   - Log rotation settings

2. **Logger Implementation** (`src/utils/logger.ts`)
   - Winston-based logger with multiple transports
   - Context-aware logging with correlation IDs
   - Automatic log file management

3. **Request ID Generator** (`src/utils/requestId.ts`)
   - Cryptographically secure ID generation
   - Multiple ID formats (standard, short, timestamped)
   - ID validation utilities

4. **Correlation ID Middleware** (`src/middleware/correlationId.middleware.ts`)
   - Automatic correlation ID attachment
   - Request/response logging
   - Logger injection into Express requests

## Usage

### Basic Logging

```typescript
import { defaultLogger } from './utils';

// Simple logging
defaultLogger.info('User logged in', { userId: '123' });
defaultLogger.error('Authentication failed', { reason: 'Invalid credentials' });
defaultLogger.debug('Processing request', { step: 1 });
```

### Context-Aware Logging

```typescript
import { Logger } from './utils';

// Create a logger with context
const logger = new Logger({ userId: '123', service: 'auth' });

logger.info('Operation started');
// Logs: { userId: '123', service: 'auth', message: 'Operation started' }

// Create child logger with additional context
const childLogger = logger.child({ operation: 'login' });
childLogger.info('Validating credentials');
// Logs: { userId: '123', service: 'auth', operation: 'login', message: 'Validating credentials' }
```

### Express Integration

```typescript
import express from 'express';
import { correlationIdMiddleware, requestLoggingMiddleware } from './middleware';

const app = express();

// Attach correlation IDs to all requests
app.use(correlationIdMiddleware());

// Log all incoming requests
app.use(requestLoggingMiddleware());

// Use the logger in routes
app.get('/api/users', (req, res) => {
  // Logger with correlation ID is attached to req
  req.logger.info('Fetching users');

  // Correlation ID is available
  console.log(req.correlationId);

  res.json({ users: [] });
});
```

### Custom Correlation ID Options

```typescript
import { correlationIdMiddleware } from './middleware';

app.use(correlationIdMiddleware({
  header: 'x-request-id',           // Custom header name
  generateIfMissing: true,          // Generate if not provided
  echoInResponse: true,             // Echo in response headers
  validateFormat: true,             // Validate incoming IDs
  attachLogger: true                // Attach logger to request
}));
```

### Request ID Generation

```typescript
import {
  generateRequestId,
  generateShortRequestId,
  generateTimestampedRequestId,
  isValidRequestId
} from './utils';

// Standard 32-character ID
const id = generateRequestId();
// Example: "a1b2c3d4e5f67890a1b2c3d4e5f67890"

// Short 16-character ID
const shortId = generateShortRequestId();
// Example: "a1b2c3d4e5f67890"

// Timestamped ID
const timestampedId = generateTimestampedRequestId();
// Example: "1699876543210-a1b2c3d4e5f67890"

// Validate ID format
if (isValidRequestId(id)) {
  console.log('Valid ID');
}
```

## Log Levels

The logger supports the following levels (in order of severity):

1. `error` - Error messages that need immediate attention
2. `warn` - Warning messages for potentially harmful situations
3. `info` - Informational messages about application flow
4. `http` - HTTP request/response logs
5. `verbose` - Detailed information for debugging
6. `debug` - Debug messages for development
7. `silly` - Very detailed trace messages

### Environment-Based Levels

- **Development**: `debug` level and above (all logs)
- **Production**: `info` level and above (info, warn, error)
- **Test**: `error` level only

## Log Output

### Console Output

All logs are written to the console with appropriate formatting:

- **Development**: Colorized, pretty-printed format
- **Production**: JSON format for log aggregation systems

### File Output

Logs are written to two files in the `logs/` directory:

1. **combined.log** - All logs at the configured level
2. **error.log** - Error logs only

### Log Rotation

- **Maximum file size**: 10MB
- **Maximum files**: 14 (approximately 2 weeks of daily logs)
- **Rotation**: Automatic when size limit is reached
- **Format**: Tailable (new logs appended to end)

## Configuration

### Environment Variables

```bash
# Set log level
NODE_ENV=production          # 'development', 'production', or 'test'

# Custom logs directory
LOGS_DIR=/var/log/app

# Disable all logging (for tests)
LOG_SILENT=true
```

### Programmatic Configuration

```typescript
import { getLogLevel, getLogsDirectory } from './config';

console.log(getLogLevel());        // Current log level
console.log(getLogsDirectory());   // Logs directory path
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Good
logger.error('Database connection failed', { error: err.message });
logger.warn('API rate limit approaching', { usage: '90%' });
logger.info('User registered', { userId });
logger.debug('Cache hit', { key, value });

// Avoid
logger.info('Error occurred'); // Use error level
logger.debug('User registered'); // Use info level
```

### 2. Include Contextual Information

```typescript
// Good
logger.error('Payment failed', {
  userId: '123',
  orderId: 'ord_456',
  amount: 99.99,
  error: err.message
});

// Avoid
logger.error('Payment failed');
```

### 3. Use Correlation IDs

```typescript
// Good - correlation ID is automatically included
req.logger.info('Processing order', { orderId });

// Avoid - missing correlation context
defaultLogger.info('Processing order', { orderId });
```

### 4. Don't Log Sensitive Data

```typescript
// Good
logger.info('User authenticated', { userId: user.id });

// Avoid
logger.info('User authenticated', { password: user.password }); // Never log passwords
logger.info('Payment processed', { cardNumber: '1234-5678-9012-3456' }); // Never log card numbers
```

### 5. Structure Your Logs

```typescript
// Good - structured data
logger.info('Order completed', {
  orderId: 'ord_123',
  userId: 'usr_456',
  amount: 99.99,
  items: 3,
  duration: '1.2s'
});

// Avoid - unstructured string
logger.info(`Order ord_123 completed for user usr_456 with amount $99.99`);
```

## Integration with External Services

### Log Aggregation

The JSON format in production makes it easy to integrate with log aggregation services:

- **Elasticsearch + Kibana**: Parse JSON logs and index
- **Splunk**: Forward logs using HTTP Event Collector
- **Datadog**: Use Datadog agent to collect and forward logs
- **CloudWatch**: Use CloudWatch agent for AWS environments

### Example: Datadog Integration

```typescript
// Datadog will automatically parse JSON logs
logger.info('User action', {
  userId: '123',
  action: 'purchase',
  'dd.trace_id': req.correlationId // Datadog trace ID
});
```

## Troubleshooting

### Logs Not Appearing

1. Check `NODE_ENV` environment variable
2. Verify `LOGS_DIR` permissions
3. Check `LOG_SILENT` is not set to `true`

### Logs Directory Not Created

The logger automatically creates the logs directory. If this fails:

1. Check parent directory permissions
2. Verify disk space
3. Check file system read/write permissions

### Performance Issues

If logging impacts performance:

1. Reduce log level in production (use `info` or `warn`)
2. Disable file transport if not needed
3. Use asynchronous logging (enabled by default with Winston)

## Testing

When writing tests, you can silence logs:

```bash
LOG_SILENT=true npm test
```

Or programmatically:

```typescript
import { winstonLogger } from './utils';

// In test setup
winstonLogger.silent = true;

// In test teardown
winstonLogger.silent = false;
```

## Security Considerations

1. **Log Injection**: The logger automatically escapes special characters in JSON mode
2. **Sensitive Data**: Never log passwords, tokens, credit card numbers, or PII
3. **Log Files**: Ensure log files have appropriate permissions (600 or 640)
4. **Rotation**: Old logs are automatically cleaned up to prevent disk space issues

## Future Enhancements

Potential improvements to consider:

- [ ] OpenTelemetry integration for distributed tracing
- [ ] Log sampling for high-traffic endpoints
- [ ] Custom log formatters for specific services
- [ ] Integration with APM tools (New Relic, AppDynamics)
- [ ] Log anonymization for GDPR compliance
