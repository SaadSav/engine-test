# Error Handling and Logging Infrastructure

A production-ready Express.js application with comprehensive error handling, structured logging, and monitoring capabilities. This project demonstrates best practices for building resilient Node.js applications with centralized error management, distributed tracing, and performance monitoring.

## Features

- **Structured Logging**: Winston-based logging with multiple transports and formats
- **Error Handling**: Centralized error handling with custom error classes
- **Distributed Tracing**: Correlation ID middleware for tracking requests across services
- **Error Monitoring**: Sentry integration for real-time error tracking
- **Performance Monitoring**: Request timing and performance metrics
- **Health Checks**: Kubernetes-ready health, liveness, and readiness probes
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Quick Start

### Installation

```bash
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure environment variables:
```bash
# Application
NODE_ENV=development
PORT=3000

# Logging
LOGS_DIR=./logs
LOG_SILENT=false

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn-here
SENTRY_ENVIRONMENT=development
SENTRY_ENABLED=true
```

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`.

## Example Routes

### 1. Root Endpoint
```bash
curl http://localhost:3000/

# Response:
{
  "message": "Logging infrastructure is ready",
  "correlationId": "a1b2c3d4e5f67890a1b2c3d4e5f67890",
  "timestamp": "2025-11-11T14:00:00.000Z"
}
```

### 2. Health Checks

**Basic health:**
```bash
curl http://localhost:3000/health
```

**Detailed health with system metrics:**
```bash
curl http://localhost:3000/health/detailed

# Response:
{
  "status": "healthy",
  "timestamp": "2025-11-11T14:00:00.000Z",
  "uptime": 123.45,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "sentry": {
      "enabled": true,
      "status": "operational"
    },
    "memory": {
      "status": "healthy",
      "usage": {
        "heapUsed": "25.5 MB",
        "heapTotal": "50.0 MB",
        "external": "1.2 MB",
        "rss": "75.8 MB"
      },
      "percentage": 51.0
    }
  }
}
```

**Kubernetes probes:**
```bash
# Liveness probe
curl http://localhost:3000/health/live

# Readiness probe
curl http://localhost:3000/health/ready

# Sentry health
curl http://localhost:3000/health/sentry
```

### 3. Error Demonstration Routes

**Synchronous error:**
```bash
curl http://localhost:3000/error

# Response (500):
{
  "error": {
    "message": "This is a test synchronous error",
    "statusCode": 500,
    "correlationId": "..."
  }
}
```

**Asynchronous error:**
```bash
curl http://localhost:3000/async-error

# Response (400):
{
  "error": {
    "message": "This is a test async validation error",
    "statusCode": 400,
    "details": {
      "field": "example",
      "value": "invalid"
    },
    "correlationId": "..."
  }
}
```

**Validation error:**
```bash
# Missing email
curl -X POST http://localhost:3000/validate \
  -H "Content-Type: application/json" \
  -d '{}'

# Response (400):
{
  "error": {
    "message": "Email is required",
    "statusCode": 400,
    "details": {
      "field": "email",
      "provided": false
    },
    "correlationId": "..."
  }
}

# Invalid email format
curl -X POST http://localhost:3000/validate \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'

# Valid email
curl -X POST http://localhost:3000/validate \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Not found error:**
```bash
# User not found (ID 999)
curl http://localhost:3000/users/999

# Response (404):
{
  "error": {
    "message": "User with ID 999 not found",
    "statusCode": 404,
    "details": {
      "userId": "999"
    },
    "correlationId": "..."
  }
}

# User found
curl http://localhost:3000/users/123
```

**404 Not Found (undefined route):**
```bash
curl http://localhost:3000/nonexistent

# Response (404):
{
  "error": {
    "message": "Route not found: GET /nonexistent",
    "statusCode": 404,
    "correlationId": "..."
  }
}
```

## Using Custom Error Classes

The application provides custom error classes for different scenarios:

```typescript
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError
} from './errors';

// In your route handlers:
app.post('/api/users', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation error
  if (!email) {
    throw new ValidationError('Email is required', {
      field: 'email',
      provided: false
    });
  }

  // Check if user exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('User already exists', {
      email
    });
  }

  // Create user
  const user = await createUser({ email, password });
  res.status(201).json({ user });
}));
```

## Logging Examples

### Basic Logging

```typescript
import { defaultLogger } from './utils';

// Log levels
defaultLogger.error('Critical error occurred', { error: err.message });
defaultLogger.warn('Warning: high memory usage', { usage: '85%' });
defaultLogger.info('User logged in', { userId: '123' });
defaultLogger.http('HTTP request', { method: 'GET', path: '/api/users' });
defaultLogger.debug('Debug information', { data: debugData });
```

### Request-Scoped Logging

```typescript
import { asyncHandler } from './middleware';

app.post('/api/orders', asyncHandler(async (req, res) => {
  // Logger with correlation ID is automatically attached
  req.logger.info('Processing order', {
    userId: req.body.userId,
    items: req.body.items.length
  });

  try {
    const order = await processOrder(req.body);
    req.logger.info('Order processed successfully', {
      orderId: order.id,
      total: order.total
    });

    res.json({ order });
  } catch (error) {
    req.logger.error('Order processing failed', {
      error: error.message,
      userId: req.body.userId
    });
    throw error; // Will be handled by error middleware
  }
}));
```

### Context-Aware Logging

```typescript
import { Logger } from './utils';

class PaymentService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger({ service: 'PaymentService' });
  }

  async processPayment(orderId: string, amount: number) {
    const logger = this.logger.child({ orderId, amount });

    logger.info('Processing payment');

    try {
      const result = await chargeCard(amount);
      logger.info('Payment successful', { transactionId: result.id });
      return result;
    } catch (error) {
      logger.error('Payment failed', {
        error: error.message,
        code: error.code
      });
      throw error;
    }
  }
}
```

## Middleware Stack

The application uses middleware in the following order (important for proper functionality):

1. **Body parsers** - Parse JSON and URL-encoded bodies
2. **Sentry request handler** - Start Sentry transaction
3. **Sentry tracing handler** - Performance monitoring
4. **Correlation ID** - Attach unique ID to request
5. **Sentry context enrichment** - Add request data to Sentry
6. **Performance monitoring** - Track request timing
7. **Request logging** - Log incoming requests
8. **Routes** - Application routes
9. **404 handler** - Handle undefined routes
10. **Sentry error handler** - Send errors to Sentry
11. **Global error handler** - Format and send error responses

## Log Output

### Development Mode (Console)
```
2025-11-11 14:00:00 [info]: Server started { port: 3000, environment: "development" }
2025-11-11 14:00:05 [http]: Incoming request { method: "GET", url: "/", correlationId: "abc123..." }
2025-11-11 14:00:05 [http]: Request completed { method: "GET", statusCode: 200, duration: "5ms" }
```

### Production Mode (JSON in files)
```json
{"timestamp":"2025-11-11 14:00:00","level":"info","message":"Server started","port":3000,"environment":"production"}
{"timestamp":"2025-11-11 14:00:05","level":"http","message":"Incoming request","method":"GET","url":"/","correlationId":"abc123..."}
{"timestamp":"2025-11-11 14:00:05","level":"http","message":"Request completed","method":"GET","statusCode":200,"duration":"5ms"}
```

### Log Files

Logs are written to the `logs/` directory:

- `combined.log` - All logs (info, warnings, errors)
- `error.log` - Error logs only

```bash
# View all logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log
```

## Correlation IDs

Every request is assigned a unique correlation ID for distributed tracing:

```bash
# Pass correlation ID from client
curl -H "X-Correlation-ID: my-custom-id-123" http://localhost:3000/

# Server generates one if not provided
curl http://localhost:3000/

# The correlation ID is returned in response headers
# X-Correlation-ID: a1b2c3d4e5f67890a1b2c3d4e5f67890
```

Correlation IDs are automatically:
- Attached to all log entries
- Included in error responses
- Sent to Sentry with errors
- Returned in response headers

## Sentry Integration

### Setup

1. Create a Sentry project at [sentry.io](https://sentry.io)
2. Copy your DSN from project settings
3. Add to `.env`:
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENABLED=true
SENTRY_ENVIRONMENT=production
```

### Features

- **Automatic error capture** - All errors are sent to Sentry
- **Performance monitoring** - Request timing and slow query detection
- **Context enrichment** - User, request, and correlation data
- **Breadcrumbs** - Track events leading to errors
- **Release tracking** - Track errors by deployment version

### Manual Sentry Usage

```typescript
import { captureException, captureMessage, addBreadcrumb } from './middleware';

// Capture exception
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    level: 'error',
    tags: { operation: 'risky' },
    extra: { context: 'additional info' }
  });
  throw error;
}

// Capture message
captureMessage('Important event occurred', {
  level: 'info',
  tags: { feature: 'payments' }
});

// Add breadcrumb
addBreadcrumb({
  message: 'User clicked button',
  category: 'ui',
  level: 'info'
});
```

## Performance Monitoring

The application includes built-in performance monitoring:

```typescript
// Configured in src/index.ts
app.use(performanceMonitoring({
  slowRequestThreshold: 1000,  // Log requests slower than 1s
  logAllRequests: false,        // Only log slow requests
  includeMemoryUsage: true,     // Include memory stats
  reportSlowRequests: true      // Send to Sentry
}));
```

Performance data is:
- Logged for slow requests
- Included in response headers (`X-Response-Time`)
- Sent to Sentry for analysis

## Project Structure

```
.
├── src/
│   ├── config/              # Configuration files
│   │   ├── logger.config.ts # Winston logger configuration
│   │   └── sentry.config.ts # Sentry configuration
│   ├── errors/              # Custom error classes
│   │   ├── AppError.ts      # Base error class
│   │   ├── BadRequestError.ts
│   │   ├── ValidationError.ts
│   │   ├── NotFoundError.ts
│   │   └── ...
│   ├── middleware/          # Express middleware
│   │   ├── correlationId.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── asyncHandler.middleware.ts
│   │   ├── sentry.middleware.ts
│   │   └── performance.middleware.ts
│   ├── routes/              # Route handlers
│   │   └── health.routes.ts
│   ├── types/               # TypeScript definitions
│   │   └── express.d.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts        # Logger implementation
│   │   └── requestId.ts     # Request ID generator
│   └── index.ts             # Application entry point
├── logs/                    # Log files (auto-generated)
├── .env.example             # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide with examples
- **[LOGGING.md](LOGGING.md)** - Comprehensive logging documentation
- **[MONITORING.md](MONITORING.md)** - Monitoring and Sentry guide
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API reference
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## Testing

```bash
# Run tests
npm test

# Disable logging during tests
LOG_SILENT=true npm test
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment |
| `PORT` | `3000` | Server port |
| `LOGS_DIR` | `./logs` | Log files directory |
| `LOG_SILENT` | `false` | Disable all logging |
| `SENTRY_DSN` | - | Sentry project DSN |
| `SENTRY_ENVIRONMENT` | `development` | Sentry environment name |
| `SENTRY_ENABLED` | `true` | Enable/disable Sentry |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.1` | Performance monitoring sample rate (0-1) |
| `SENTRY_PROFILES_SAMPLE_RATE` | `0.1` | Profiling sample rate (0-1) |
| `SENTRY_DEBUG` | `false` | Enable Sentry debug logging |

## Best Practices

### 1. Always Use AsyncHandler

```typescript
// Good
app.get('/users', asyncHandler(async (req, res) => {
  const users = await getUsers();
  res.json({ users });
}));

// Bad - unhandled promise rejection
app.get('/users', async (req, res) => {
  const users = await getUsers();
  res.json({ users });
});
```

### 2. Use Custom Error Classes

```typescript
// Good
throw new NotFoundError('User not found', { userId });

// Bad
throw new Error('User not found');
```

### 3. Include Context in Logs

```typescript
// Good
logger.error('Database query failed', {
  query: 'SELECT * FROM users',
  error: err.message,
  duration: 1234
});

// Bad
logger.error('Database query failed');
```

### 4. Use Request-Scoped Loggers

```typescript
// Good - correlation ID included automatically
req.logger.info('Processing request');

// Bad - no correlation ID
defaultLogger.info('Processing request');
```

## Troubleshooting

### Logs not appearing?
1. Check `NODE_ENV` is set correctly
2. Verify `LOG_SILENT` is not `true`
3. Check logs directory permissions
4. Ensure Winston is configured properly

### Sentry not working?
1. Verify `SENTRY_DSN` is set
2. Check `SENTRY_ENABLED=true`
3. Test with `/health/sentry` endpoint
4. Review Sentry project settings

### Performance issues?
1. Check memory usage: `/health/detailed`
2. Review slow request logs
3. Analyze Sentry performance data
4. Adjust `slowRequestThreshold` if needed

## License

ISC

## Support

For issues or questions, please refer to the documentation files in this repository.
