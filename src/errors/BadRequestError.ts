import { AppError } from './AppError';

/**
 * Bad request error class
 * Used for invalid request parameters or malformed requests
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, true, details);
  }
}
