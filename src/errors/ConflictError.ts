import { AppError } from './AppError';

/**
 * Conflict error class
 * Used when a request conflicts with existing data (e.g., duplicate resources)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, true, details);
  }
}
