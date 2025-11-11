import { Logger } from 'winston';

/**
 * Extend Express Request interface with custom properties
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Correlation ID for tracking requests across services
       */
      correlationId?: string;

      /**
       * Winston logger instance with correlation ID
       */
      logger?: Logger;

      /**
       * User information for authentication context
       */
      user?: {
        id: string;
        username?: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
