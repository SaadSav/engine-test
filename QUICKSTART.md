# Logging Infrastructure - Quick Start Guide

## Installation

Dependencies are already included in `package.json`. Install them:

```bash
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` as needed:
```bash
NODE_ENV=development
PORT=3000
LOGS_DIR=./logs
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Basic Usage

### 1. Simple Logging

```typescript
import { defaultLogger } from './utils';

defaultLogger.info('Application started');
defaultLogger.warn('Memory usage high', { usage: '85%' });
defaultLogger.error('Database error', { error: err.message });
```

### 2. Logging with Context

```typescript
import { Logger } from './utils';

// Create a logger with context
const logger = new Logger({
  service: 'payment',
  userId: '123'
});

logger.info('Processing payment');
// Output includes: service, userId, and message

// Create child logger with more context
const childLogger = logger.child({ transactionId: 'txn_456' });
childLogger.info('Payment authorized');
// Output includes: service, userId, transactionId, and message
```

### 3. Express Middleware

```typescript
import express from 'express';
import {
  correlationIdMiddleware,
  requestLoggingMiddleware
} from './middleware';

const app = express();

// Add correlation ID to all requests
app.use(correlationIdMiddleware());

// Log all requests automatically
app.use(requestLoggingMiddleware());

// Use the logger in your routes
app.get('/api/users', (req, res) => {
  // Logger with correlation ID is available
  req.logger.info('Fetching users list');

  // Correlation ID is available
  const correlationId = req.correlationId;

  res.json({
    users: [],
    correlationId
  });
});
```

### 4. Generate Request IDs

```typescript
import { generateRequestId } from './utils';

const requestId = generateRequestId();
console.log(requestId); // "a1b2c3d4e5f67890a1b2c3d4e5f67890"
```

## Testing the Implementation

### 1. Start the server
```bash
npm run dev
```

### 2. Test the endpoints

```bash
# Root endpoint
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health

# Error endpoint (test error logging)
curl http://localhost:3000/error
```

### 3. Check the logs

**Console**: Logs appear in pretty-print format with colors

**Files**: Check the `logs/` directory:
```bash
ls -la logs/
cat logs/combined.log    # All logs
cat logs/error.log       # Error logs only
```

## Log Output Examples

### Development Mode (Console)
```
2025-11-11 14:10:00 [info]: Server started { port: 3000, environment: "development" }
2025-11-11 14:10:05 [http]: Incoming request { method: "GET", url: "/", correlationId: "abc123..." }
2025-11-11 14:10:05 [http]: Request completed { method: "GET", statusCode: 200, duration: "5ms" }
```

### Production Mode (JSON in files)
```json
{"timestamp":"2025-11-11 14:10:00","level":"info","message":"Server started","port":3000,"environment":"production"}
{"timestamp":"2025-11-11 14:10:05","level":"http","message":"Incoming request","method":"GET","url":"/","correlationId":"abc123..."}
```

## Common Patterns

### Pattern 1: Service Logger
```typescript
// Create a service-specific logger
export class UserService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger({ service: 'UserService' });
  }

  async getUser(id: string) {
    this.logger.info('Fetching user', { userId: id });

    try {
      const user = await db.users.findById(id);
      this.logger.info('User fetched successfully', { userId: id });
      return user;
    } catch (error) {
      this.logger.error('Failed to fetch user', {
        userId: id,
        error: error.message
      });
      throw error;
    }
  }
}
```

### Pattern 2: Request-Scoped Logger
```typescript
app.post('/api/orders', async (req, res) => {
  const logger = req.logger.child({
    userId: req.user.id,
    orderId: req.body.orderId
  });

  logger.info('Creating order');

  try {
    const order = await createOrder(req.body);
    logger.info('Order created successfully');
    res.json({ success: true, order });
  } catch (error) {
    logger.error('Order creation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to create order' });
  }
});
```

### Pattern 3: Error Logging
```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', {
    operation: 'riskyOperation',
    error: error.message,
    stack: error.stack,
    context: { /* relevant context */ }
  });

  throw error; // Re-throw if needed
}
```

## Environment-Specific Behavior

| Environment | Log Level | Format | Output |
|-------------|-----------|--------|--------|
| Development | DEBUG | Pretty-print + Colors | Console + Files |
| Production | INFO | JSON | Console + Files |
| Test | ERROR | JSON | Console + Files |

## File Structure

```
src/
├── config/
│   ├── logger.config.ts      # Logger configuration
│   └── index.ts              # Config exports
├── middleware/
│   ├── correlationId.middleware.ts  # Correlation ID middleware
│   └── index.ts              # Middleware exports
├── utils/
│   ├── logger.ts             # Logger implementation
│   ├── requestId.ts          # Request ID generator
│   └── index.ts              # Utility exports
└── index.ts                  # Sample application
```

## Troubleshooting

### Logs not appearing?
1. Check `NODE_ENV` is set correctly
2. Verify `LOG_SILENT` is not `true`
3. Check logs directory permissions

### Can't find logs directory?
The directory is automatically created. Default location: `./logs/`
Check `LOGS_DIR` environment variable if using custom path.

### Want to disable logging in tests?
```bash
LOG_SILENT=true npm test
```

## Next Steps

- Read [LOGGING.md](LOGGING.md) for comprehensive documentation
- Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details
- Integrate with your error tracking service (e.g., Sentry)
- Set up log aggregation for production

## Support

For detailed documentation, see:
- [LOGGING.md](LOGGING.md) - Complete logging guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details
