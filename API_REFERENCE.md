# Logging Infrastructure - API Reference

## Table of Contents

1. [Logger Configuration](#logger-configuration)
2. [Logger Class](#logger-class)
3. [Request ID Utilities](#request-id-utilities)
4. [Middleware](#middleware)
5. [Types & Interfaces](#types--interfaces)

---

## Logger Configuration

### Module: `src/config/logger.config.ts`

#### `LogLevel` Enum

Available log levels in order of severity:

```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}
```

#### `getLogLevel(): LogLevel`

Returns the appropriate log level based on `NODE_ENV`.

**Returns**: `LogLevel`
- `DEBUG` for development
- `INFO` for production
- `ERROR` for test

**Example**:
```typescript
import { getLogLevel } from './config';

const level = getLogLevel();
console.log(level); // 'debug', 'info', or 'error'
```

#### `isProduction(): boolean`

Checks if the application is running in production mode.

**Returns**: `boolean` - `true` if `NODE_ENV === 'production'`

**Example**:
```typescript
import { isProduction } from './config';

if (isProduction()) {
  console.log('Running in production mode');
}
```

#### `getLogsDirectory(): string`

Returns the logs directory path.

**Returns**: `string` - Path from `LOGS_DIR` env var or `./logs` default

**Example**:
```typescript
import { getLogsDirectory } from './config';

const logsDir = getLogsDirectory();
console.log(logsDir); // '/path/to/logs'
```

#### `getLogFormat(): winston.Logform.Format`

Returns Winston format configuration based on environment.

**Returns**: `winston.Logform.Format`
- JSON format for production
- Pretty-print with colors for development

---

## Logger Class

### Module: `src/utils/logger.ts`

#### `Logger` Class

Context-aware logger with correlation ID support.

**Constructor**:
```typescript
constructor(context?: LogContext)
```

**Parameters**:
- `context` (optional): Initial context object

**Methods**:

##### `child(additionalContext: LogContext): Logger`

Creates a child logger with merged context.

**Parameters**:
- `additionalContext`: Additional context to merge

**Returns**: New `Logger` instance with merged context

**Example**:
```typescript
const logger = new Logger({ service: 'api' });
const childLogger = logger.child({ operation: 'login' });
childLogger.info('User logged in'); // Includes both service and operation
```

##### `error(message: string, meta?: any): void`

Logs an error message.

**Parameters**:
- `message`: Error message
- `meta` (optional): Additional metadata

**Example**:
```typescript
logger.error('Database connection failed', {
  host: 'localhost',
  port: 5432,
  error: err.message
});
```

##### `warn(message: string, meta?: any): void`

Logs a warning message.

##### `info(message: string, meta?: any): void`

Logs an info message.

##### `http(message: string, meta?: any): void`

Logs an HTTP-related message.

##### `verbose(message: string, meta?: any): void`

Logs a verbose message.

##### `debug(message: string, meta?: any): void`

Logs a debug message.

##### `silly(message: string, meta?: any): void`

Logs a silly (very detailed) message.

#### `defaultLogger: Logger`

Default logger instance with no context.

**Example**:
```typescript
import { defaultLogger } from './utils';

defaultLogger.info('Application started');
```

#### `winstonLogger: winston.Logger`

Raw Winston logger for advanced use cases.

**Example**:
```typescript
import { winstonLogger } from './utils';

winstonLogger.log('info', 'Custom log', { customField: 'value' });
```

---

## Request ID Utilities

### Module: `src/utils/requestId.ts`

#### `generateRequestId(): string`

Generates a standard 32-character hexadecimal request ID.

**Returns**: `string` - 32 hex characters (128 bits entropy)

**Example**:
```typescript
import { generateRequestId } from './utils';

const id = generateRequestId();
// "a1b2c3d4e5f67890a1b2c3d4e5f67890"
```

#### `generateShortRequestId(): string`

Generates a shorter 16-character hexadecimal request ID.

**Returns**: `string` - 16 hex characters (64 bits entropy)

**Example**:
```typescript
import { generateShortRequestId } from './utils';

const id = generateShortRequestId();
// "a1b2c3d4e5f67890"
```

#### `generateTimestampedRequestId(): string`

Generates a timestamp-prefixed request ID.

**Returns**: `string` - Format: `{timestamp}-{16-hex-chars}`

**Example**:
```typescript
import { generateTimestampedRequestId } from './utils';

const id = generateTimestampedRequestId();
// "1699876543210-a1b2c3d4e5f67890"
```

#### `isValidRequestId(id: string): boolean`

Validates if a string matches valid request ID formats.

**Parameters**:
- `id`: String to validate

**Returns**: `boolean` - `true` if valid

**Example**:
```typescript
import { isValidRequestId } from './utils';

isValidRequestId('a1b2c3d4e5f67890a1b2c3d4e5f67890'); // true
isValidRequestId('invalid'); // false
```

#### `extractTimestamp(id: string): Date | null`

Extracts timestamp from a timestamped request ID.

**Parameters**:
- `id`: Timestamped request ID

**Returns**: `Date | null` - Extracted date or `null` if invalid

**Example**:
```typescript
import { extractTimestamp } from './utils';

const date = extractTimestamp('1699876543210-a1b2c3d4e5f67890');
console.log(date); // Date object
```

---

## Middleware

### Module: `src/middleware/correlationId.middleware.ts`

#### `correlationIdMiddleware(options?: CorrelationIdOptions): RequestHandler`

Creates Express middleware for correlation ID management.

**Parameters**:
- `options` (optional): Configuration options

**Returns**: Express middleware function

**Example**:
```typescript
import { correlationIdMiddleware } from './middleware';

app.use(correlationIdMiddleware({
  header: 'x-request-id',
  generateIfMissing: true,
  echoInResponse: true
}));
```

#### `requestLoggingMiddleware(): RequestHandler`

Creates Express middleware for automatic request/response logging.

**Returns**: Express middleware function

**Example**:
```typescript
import { requestLoggingMiddleware } from './middleware';

app.use(requestLoggingMiddleware());
```

#### Constants

##### `CORRELATION_ID_HEADER: string`

Default correlation ID header name: `'x-correlation-id'`

##### `REQUEST_ID_HEADER: string`

Alternative request ID header name: `'x-request-id'`

---

## Types & Interfaces

### `LogContext`

Context object for logger instances.

```typescript
interface LogContext {
  correlationId?: string;
  userId?: string;
  [key: string]: any;
}
```

**Properties**:
- `correlationId` (optional): Correlation/request ID
- `userId` (optional): User identifier
- Additional properties allowed

**Example**:
```typescript
const context: LogContext = {
  correlationId: 'abc123',
  userId: '456',
  service: 'api',
  environment: 'production'
};
```

### `CorrelationIdOptions`

Configuration options for correlation ID middleware.

```typescript
interface CorrelationIdOptions {
  header?: string;              // Default: 'x-correlation-id'
  generateIfMissing?: boolean;  // Default: true
  echoInResponse?: boolean;     // Default: true
  validateFormat?: boolean;     // Default: false
  attachLogger?: boolean;       // Default: true
}
```

**Properties**:
- `header`: Header name for correlation ID
- `generateIfMissing`: Generate ID if not provided in request
- `echoInResponse`: Include ID in response headers
- `validateFormat`: Validate incoming ID format
- `attachLogger`: Attach logger instance to request

**Example**:
```typescript
const options: CorrelationIdOptions = {
  header: 'x-request-id',
  generateIfMissing: true,
  echoInResponse: true,
  validateFormat: true,
  attachLogger: true
};
```

### `LoggerConfig`

Winston logger configuration interface.

```typescript
interface LoggerConfig {
  level: LogLevel;
  format: winston.Logform.Format;
  transports: winston.transport[];
  exitOnError: boolean;
}
```

### Express Request Extensions

The middleware extends Express Request type:

```typescript
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      logger?: Logger;
    }
  }
}
```

**Usage**:
```typescript
app.get('/api/data', (req, res) => {
  // TypeScript knows about these properties
  const id = req.correlationId;
  req.logger?.info('Processing request');
});
```

---

## Constants

### `MAX_LOG_FILE_SIZE: number`

Maximum log file size before rotation: `10485760` (10MB)

### `MAX_LOG_FILES: number`

Maximum number of log files to keep: `14`

---

## Usage Patterns

### Pattern 1: Basic Import

```typescript
// Import specific utilities
import { defaultLogger } from './utils';
import { generateRequestId } from './utils';
import { correlationIdMiddleware } from './middleware';

// Or import from index files
import { Logger, generateRequestId } from './utils';
import { correlationIdMiddleware, requestLoggingMiddleware } from './middleware';
```

### Pattern 2: Creating Typed Loggers

```typescript
import { Logger, LogContext } from './utils';

class ServiceLogger extends Logger {
  constructor(serviceName: string, additionalContext?: LogContext) {
    super({ service: serviceName, ...additionalContext });
  }

  logOperation(operation: string, meta?: any): void {
    this.info(`Operation: ${operation}`, meta);
  }
}

const logger = new ServiceLogger('UserService', { version: '1.0.0' });
logger.logOperation('getUserById', { userId: '123' });
```

### Pattern 3: Middleware Composition

```typescript
import express from 'express';
import {
  correlationIdMiddleware,
  requestLoggingMiddleware,
  CorrelationIdOptions
} from './middleware';

const app = express();

const options: CorrelationIdOptions = {
  header: 'x-request-id',
  validateFormat: true
};

app.use(correlationIdMiddleware(options));
app.use(requestLoggingMiddleware());
```

---

## Error Handling

All logging operations are designed to be non-throwing:

```typescript
try {
  // Your code
} catch (error) {
  // Logger will not throw, even if logging fails
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack
  });

  // Safe to continue
  throw error;
}
```

---

## Performance Notes

- **Async Logging**: Winston writes logs asynchronously
- **ID Generation**: Uses `crypto.randomBytes` (fast and secure)
- **Middleware Overhead**: ~0.1-0.5ms per request
- **Memory**: Log messages are buffered before writing to disk

---

## Migration Guide

### From console.log

```typescript
// Before
console.log('User logged in:', userId);

// After
logger.info('User logged in', { userId });
```

### From Other Loggers

```typescript
// From Bunyan
bunyan.info({ userId: '123' }, 'User logged in');

// To Winston
logger.info('User logged in', { userId: '123' });
```

---

## Version Compatibility

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0
- **Express**: >= 4.0.0
- **Winston**: >= 3.0.0

---

## See Also

- [QUICKSTART.md](QUICKSTART.md) - Getting started guide
- [LOGGING.md](LOGGING.md) - Comprehensive documentation
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details
