import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Type for async route handlers
 */
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Async handler wrapper
 * Wraps async route handlers to catch promise rejections
 * and forward them to the error handling middleware
 *
 * Usage:
 * app.get('/route', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative syntax using a class-based approach
 */
export class AsyncHandler {
  /**
   * Wrap an async function to handle promise rejections
   */
  static wrap(fn: AsyncRequestHandler): RequestHandler {
    return asyncHandler(fn);
  }

  /**
   * Wrap multiple handlers
   */
  static wrapAll(...handlers: AsyncRequestHandler[]): RequestHandler[] {
    return handlers.map(handler => asyncHandler(handler));
  }
}
