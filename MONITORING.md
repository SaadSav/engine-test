# Error Tracking and Monitoring

This document describes the error tracking and monitoring infrastructure integrated into this application.

## Sentry Integration

### Overview

The application integrates Sentry for comprehensive error tracking, performance monitoring, and application health insights.

### Configuration

Sentry is configured via environment variables in `.env`:

```bash
# Sentry DSN from your Sentry project
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Environment name (development, staging, production)
SENTRY_ENVIRONMENT=development

# Enable/disable Sentry
SENTRY_ENABLED=true

# Performance monitoring sample rates (0.0 to 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# Debug mode (logs Sentry activity)
SENTRY_DEBUG=false
```

### Features

#### 1. Automatic Error Tracking

All unhandled errors are automatically captured and sent to Sentry:

```typescript
// Server errors (5xx) are automatically tracked
throw new InternalServerError('Database connection failed');

// Client errors (4xx) are logged but not sent to Sentry by default
throw new ValidationError('Invalid email format');
```

#### 2. Error Context Enrichment

Every error captured includes:

- **Correlation ID**: Tracks requests across distributed systems
- **User Information**: User ID, username, email (when authenticated)
- **Request Data**: Method, URL, headers (sanitized), query parameters
- **Custom Context**: Additional application-specific data

Example:

```typescript
import { enrichSentryContext } from './middleware';

app.get('/api/users', (req, res) => {
  enrichSentryContext(req, {
    operation: 'fetch_users',
    filters: req.query
  });

  // Your route logic
});
```

#### 3. Performance Monitoring

The application tracks request performance and identifies slow requests:

```typescript
// Configured in index.ts
app.use(performanceMonitoring({
  slowRequestThreshold: 1000,    // Warn if request takes > 1s
  logAllRequests: false,          // Only log slow requests
  includeMemoryUsage: true,       // Track memory delta
  reportSlowRequests: true        // Send slow requests to Sentry
}));
```

Performance data includes:
- Response time (added as `X-Response-Time` header)
- Memory usage delta
- Automatic Sentry transaction tracking

#### 4. Breadcrumbs

Breadcrumbs help trace the sequence of events leading to an error:

```typescript
import { addBreadcrumb } from './middleware';

addBreadcrumb('database', 'User query executed', {
  userId: user.id,
  queryTime: 150
});

// Later if an error occurs, this breadcrumb will be included
```

#### 5. Manual Error Capture

Capture errors or messages manually:

```typescript
import { captureException, captureMessage } from './middleware';

try {
  await externalAPICall();
} catch (error) {
  captureException(error, {
    api: 'external-service',
    endpoint: '/users'
  });

  // Handle error gracefully
}

// Capture informational messages
captureMessage('Cache miss for user data', 'info', {
  userId: '123',
  cacheKey: 'user:123'
});
```

## Health Check Endpoints

### Basic Health Check

```bash
GET /health
```

Returns simple status for load balancers:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

### Detailed Health Check

```bash
GET /health/detailed
```

Returns comprehensive system status:

```json
{
  "status": "healthy",
  "timestamp": "2025-11-11T10:30:00.000Z",
  "uptime": 3600,
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
        "heapUsed": "45.32 MB",
        "heapTotal": "78.50 MB",
        "external": "2.15 MB",
        "rss": "98.45 MB"
      },
      "percentage": 57.73
    }
  }
}
```

### Liveness Probe

```bash
GET /health/live
```

Used by orchestrators (Kubernetes, Docker Swarm) to check if the service is alive:

```json
{
  "status": "alive",
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

### Readiness Probe

```bash
GET /health/ready
```

Used by orchestrators to check if the service is ready to accept traffic:

```json
{
  "status": "ready",
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

Returns `503` if the service is not ready (e.g., memory critical).

### Sentry Health Check

```bash
GET /health/sentry
```

Tests Sentry connectivity:

```json
{
  "status": "operational",
  "enabled": true,
  "eventId": "abc123def456",
  "timestamp": "2025-11-11T10:30:00.000Z"
}
```

## Response Headers

All responses include performance metrics:

```http
X-Response-Time: 145ms
```

## Best Practices

### 1. Error Severity

Only 5xx errors are sent to Sentry by default. This prevents noise from client errors:

```typescript
// Sent to Sentry (500)
throw new InternalServerError('Database error');

// Not sent to Sentry (400)
throw new ValidationError('Invalid input');
```

### 2. Sensitive Data

Sensitive data is automatically filtered:

- Authorization headers are redacted
- Passwords in breadcrumbs are filtered
- API keys are sanitized

### 3. Correlation IDs

Always use correlation IDs to trace requests:

```typescript
const correlationId = req.correlationId;
logger.info('Processing request', { correlationId });
```

### 4. Performance Thresholds

Monitor and optimize slow endpoints:

```typescript
// Requests taking > 1s generate warnings
// Adjust threshold based on your requirements
app.use(performanceMonitoring({
  slowRequestThreshold: 1000
}));
```

## Monitoring in Production

### Sentry Configuration

For production environments:

1. Set appropriate sample rates:
   ```bash
   SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
   SENTRY_PROFILES_SAMPLE_RATE=0.1 # 10% of profiles
   ```

2. Use production environment:
   ```bash
   SENTRY_ENVIRONMENT=production
   ```

3. Disable debug mode:
   ```bash
   SENTRY_DEBUG=false
   ```

### Health Check Integration

Integrate health checks with your monitoring tools:

- **Load Balancers**: Use `/health` endpoint
- **Kubernetes**: Use `/health/live` and `/health/ready` as liveness/readiness probes
- **Monitoring Services**: Use `/health/detailed` for comprehensive status
- **Sentry Monitoring**: Use `/health/sentry` to verify Sentry connectivity

### Alerts

Configure alerts in Sentry for:

- High error rates
- Slow transactions (> threshold)
- Memory usage warnings
- New error types

## Troubleshooting

### Sentry Not Initializing

Check:
1. `SENTRY_DSN` is set correctly
2. `SENTRY_ENABLED` is not set to `false`
3. Network connectivity to Sentry

### Performance Impact

If performance monitoring causes issues:

1. Reduce sample rates
2. Disable memory tracking:
   ```typescript
   performanceMonitoring({ includeMemoryUsage: false })
   ```
3. Increase slow request threshold

### Debug Mode

Enable debug mode to troubleshoot:

```bash
SENTRY_DEBUG=true
```

Check logs for Sentry initialization and event sending.
