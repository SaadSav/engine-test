import winston from 'winston';
import path from 'path';

/**
 * Logger configuration with environment-based log levels
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

export interface LoggerConfig {
  level: LogLevel;
  format: winston.Logform.Format;
  transports: winston.transport[];
  exitOnError: boolean;
}

/**
 * Get log level based on NODE_ENV
 */
export const getLogLevel = (): LogLevel => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return LogLevel.INFO;
    case 'test':
      return LogLevel.ERROR;
    case 'development':
    default:
      return LogLevel.DEBUG;
  }
};

/**
 * Determine if we're in production environment
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get the logs directory path
 */
export const getLogsDirectory = (): string => {
  return process.env.LOGS_DIR || path.join(process.cwd(), 'logs');
};

/**
 * Configure log format for different environments
 */
export const getLogFormat = (): winston.Logform.Format => {
  const timestamp = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });
  const errors = winston.format.errors({ stack: true });

  if (isProduction()) {
    // JSON format for production - easier to parse and index
    return winston.format.combine(
      timestamp,
      errors,
      winston.format.json()
    );
  } else {
    // Pretty-print format for development
    const colorize = winston.format.colorize({ all: true });
    const printf = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      let msg = `${timestamp} [${level}]: ${message}`;

      // Add metadata if present
      if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata, null, 2)}`;
      }

      return msg;
    });

    return winston.format.combine(
      timestamp,
      errors,
      colorize,
      printf
    );
  }
};

/**
 * Maximum log file size before rotation
 */
export const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Maximum number of log files to keep
 */
export const MAX_LOG_FILES = 14; // 2 weeks of daily logs
