import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {
  correlationIdMiddleware,
  requestLoggingMiddleware
} from './middleware';
import { defaultLogger } from './utils';

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

// Example route with error
app.get('/error', (req: Request, res: Response) => {
  const logger = req.logger || defaultLogger;
  logger.error('Intentional error for testing', {
    route: '/error',
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: 'This is a test error',
    correlationId: req.correlationId
  });
});

// Start server
app.listen(port, () => {
  defaultLogger.info(`Server started`, {
    port,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

export default app;
