import winston from 'winston';
import path from 'path';
import fs from 'fs';
import {
  getLogLevel,
  getLogFormat,
  getLogsDirectory,
  isProduction,
  MAX_LOG_FILE_SIZE,
  MAX_LOG_FILES
} from '../config/logger.config';

// Ensure logs directory exists
const logsDir = getLogsDirectory();
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Create Winston transports based on environment
 */
const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  // Console transport - always enabled
  transports.push(
    new winston.transports.Console({
      level: getLogLevel(),
      handleExceptions: true,
      handleRejections: true
    })
  );

  // File transports - enabled in all environments for persistence
  // Combined logs (all levels)
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      level: getLogLevel(),
      maxsize: MAX_LOG_FILE_SIZE,
      maxFiles: MAX_LOG_FILES,
      tailable: true,
      handleExceptions: true,
      handleRejections: true
    })
  );

  // Error logs (error level only)
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: MAX_LOG_FILE_SIZE,
      maxFiles: MAX_LOG_FILES,
      tailable: true,
      handleExceptions: true,
      handleRejections: true
    })
  );

  return transports;
};

/**
 * Create and configure the Winston logger instance
 */
const createLogger = (): winston.Logger => {
  return winston.createLogger({
    level: getLogLevel(),
    format: getLogFormat(),
    transports: createTransports(),
    exitOnError: false,
    // Silence logger errors to prevent crashes
    silent: process.env.LOG_SILENT === 'true'
  });
};

// Create the singleton logger instance
const logger = createLogger();

/**
 * Log with correlation ID context
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Enhanced logger with correlation ID support
 */
export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  private log(level: string, message: string, meta?: any): void {
    const logMeta = { ...this.context, ...meta };
    logger.log(level, message, logMeta);
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  http(message: string, meta?: any): void {
    this.log('http', message, meta);
  }

  verbose(message: string, meta?: any): void {
    this.log('verbose', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  silly(message: string, meta?: any): void {
    this.log('silly', message, meta);
  }
}

// Export default logger instance
export const defaultLogger = new Logger();

// Export Winston logger for advanced use cases
export { logger as winstonLogger };

// Convenience export
export default defaultLogger;
