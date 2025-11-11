import { AppError } from './AppError';

/**
 * Forbidden error class
 * Used for authorization failures (authenticated but not authorized)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access', details?: any) {
    super(message, 403, true, details);
  }
}
