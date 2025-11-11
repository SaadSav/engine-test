import { AppError } from './AppError';

/**
 * Validation error class
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, true, details);
  }
}
