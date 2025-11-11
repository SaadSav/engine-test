import { AppError } from './AppError';

/**
 * Internal server error class
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, false, details);
  }
}
