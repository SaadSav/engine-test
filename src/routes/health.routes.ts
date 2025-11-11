import { Router, Request, Response } from 'express';
import { isSentryEnabled } from '../config/sentry.config';
import { asyncHandler } from '../middleware';
import * as Sentry from '@sentry/node';

const router = Router();

/**
 * Health check response interface
 */
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    sentry: {
      enabled: boolean;
      status: 'operational' | 'disabled';
    };
    memory: {
      status: 'healthy' | 'warning' | 'critical';
      usage: {
        heapUsed: string;
        heapTotal: string;
        external: string;
        rss: string;
      };
      percentage: number;
    };
  };
}

/**
 * Basic health check endpoint
 * Returns simple status for load balancers and monitoring tools
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * Detailed health check endpoint
 * Returns comprehensive system status
 */
router.get('/health/detailed', asyncHandler(async (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  // Determine memory status
  let memoryStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (memoryPercentage > 90) {
    memoryStatus = 'critical';
  } else if (memoryPercentage > 75) {
    memoryStatus = 'warning';
  }

  // Determine overall status
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  if (memoryStatus === 'critical') {
    overallStatus = 'unhealthy';
  } else if (memoryStatus === 'warning') {
    overallStatus = 'degraded';
  }

  const healthResponse: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      sentry: {
        enabled: isSentryEnabled(),
        status: isSentryEnabled() ? 'operational' : 'disabled'
      },
      memory: {
        status: memoryStatus,
        usage: {
          heapUsed: formatBytes(memoryUsage.heapUsed),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          external: formatBytes(memoryUsage.external),
          rss: formatBytes(memoryUsage.rss)
        },
        percentage: Math.round(memoryPercentage * 100) / 100
      }
    }
  };

  // Set appropriate status code based on health
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  res.status(statusCode).json(healthResponse);
}));

/**
 * Liveness probe endpoint
 * Used by orchestrators to determine if the service is alive
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * Readiness probe endpoint
 * Used by orchestrators to determine if the service is ready to accept traffic
 */
router.get('/health/ready', asyncHandler(async (req: Request, res: Response) => {
  // Check if critical services are available
  const memoryUsage = process.memoryUsage();
  const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  // Service is not ready if memory is critical
  if (memoryPercentage > 95) {
    return res.status(503).json({
      status: 'not_ready',
      reason: 'Memory usage critical',
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
}));

/**
 * Sentry health check endpoint
 * Tests Sentry connectivity and configuration
 */
router.get('/health/sentry', asyncHandler(async (req: Request, res: Response) => {
  const sentryEnabled = isSentryEnabled();

  if (!sentryEnabled) {
    return res.status(200).json({
      status: 'disabled',
      message: 'Sentry is not configured or disabled',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Send a test event to Sentry (with low priority)
    const eventId = Sentry.captureMessage('Health check test', {
      level: 'debug',
      tags: {
        health_check: 'true',
        test: 'true'
      }
    });

    res.status(200).json({
      status: 'operational',
      enabled: true,
      eventId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      enabled: true,
      message: 'Failed to send test event to Sentry',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * Helper function to format bytes
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(2)} ${sizes[i]}`;
};

export default router;
