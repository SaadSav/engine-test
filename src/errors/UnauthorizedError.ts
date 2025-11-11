import { AppError } from './AppError';

/**
 * Unauthorized error class
 * Used for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: any) {
    super(message, 401, true, details);
  }
}
