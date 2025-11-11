import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { defaultLogger } from '../utils';

export interface SentryConfig {
  dsn?: string;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  profilesSampleRate: number;
  debug: boolean;
}

/**
 * Get Sentry configuration from environment variables
 */
export const getSentryConfig = (): SentryConfig => {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
  const enabled = !!dsn && process.env.SENTRY_ENABLED !== 'false';

  return {
    dsn,
    environment,
    enabled,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
    debug: process.env.SENTRY_DEBUG === 'true'
  };
};

/**
 * Initialize Sentry SDK
 */
export const initializeSentry = (): void => {
  const config = getSentryConfig();

  if (!config.enabled) {
    defaultLogger.info('Sentry is disabled - no DSN provided or explicitly disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      debug: config.debug,

      // Performance monitoring
      tracesSampleRate: config.tracesSampleRate,
      profilesSampleRate: config.profilesSampleRate,

      // Integrations
      integrations: [
        new ProfilingIntegration(),
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined as any }),
      ],

      // Customize beforeSend to filter or modify events
      beforeSend(event, hint) {
        // Don't send events in test environment
        if (config.environment === 'test') {
          return null;
        }

        // Log that we're sending to Sentry
        if (config.debug) {
          defaultLogger.debug('Sending event to Sentry', {
            eventId: event.event_id,
            level: event.level,
            message: event.message
          });
        }

        return event;
      },

      // Customize beforeBreadcrumb to filter breadcrumbs
      beforeBreadcrumb(breadcrumb, hint) {
        // Filter out sensitive data from breadcrumbs
        if (breadcrumb.category === 'console' && breadcrumb.message) {
          // Remove potential sensitive data from console logs
          breadcrumb.message = breadcrumb.message.replace(/password=\S+/gi, 'password=[REDACTED]');
          breadcrumb.message = breadcrumb.message.replace(/token=\S+/gi, 'token=[REDACTED]');
        }

        return breadcrumb;
      }
    });

    defaultLogger.info('Sentry initialized successfully', {
      environment: config.environment,
      tracesSampleRate: config.tracesSampleRate,
      profilesSampleRate: config.profilesSampleRate
    });
  } catch (error) {
    defaultLogger.error('Failed to initialize Sentry', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Check if Sentry is enabled
 */
export const isSentryEnabled = (): boolean => {
  return getSentryConfig().enabled;
};
