import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {
  correlationIdMiddleware,
  requestLoggingMiddleware,
  errorHandlerMiddleware,
  notFoundHandler,
  asyncHandler
} from './middleware';
import { defaultLogger } from './utils';
import {
  ValidationError,
  NotFoundError,
  BadRequestError,
  InternalServerError
} from './errors';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach correlation ID to all requests
app.use(correlationIdMiddleware());

// Log all incoming requests
app.use(requestLoggingMiddleware());

// Sample routes
app.get('/', (req: Request, res: Response) => {
  const logger = req.logger || defaultLogger;
  logger.info('Root endpoint accessed');

  res.json({
    message: 'Logging infrastructure is ready',
    correlationId: req.correlationId,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Example route with synchronous error
app.get('/error', (req: Request, res: Response) => {
  throw new InternalServerError('This is a test synchronous error');
});

// Example route with async error
app.get('/async-error', asyncHandler(async (req: Request, res: Response) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  throw new ValidationError('This is a test async validation error', {
    field: 'example',
    value: 'invalid'
  });
}));

// Example route with validation error
app.post('/validate', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Email is required', {
      field: 'email',
      provided: false
    });
  }

  if (!email.includes('@')) {
    throw new ValidationError('Invalid email format', {
      field: 'email',
      value: email
    });
  }

  res.json({ success: true, message: 'Validation passed' });
}));

// Example route with not found error
app.get('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Simulate database lookup
  await new Promise(resolve => setTimeout(resolve, 50));

  // Simulate user not found
  if (id === '999') {
    throw new NotFoundError(`User with ID ${id} not found`, { userId: id });
  }

  res.json({ id, name: 'Test User' });
}));

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandlerMiddleware);

// Start server
app.listen(port, () => {
  defaultLogger.info(`Server started`, {
    port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

export default app;
