import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'class-validator';
import logger from '../shared/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = req.headers['x-correlation-id'] as string;

  // Log error with correlation ID
  logger.error({
    message: err.message,
    stack: err.stack,
    correlationId,
    path: req.path,
    method: req.method,
  });

  // Handle validation errors
  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.map(e => ({
        property: e.property,
        constraints: e.constraints,
      })),
    });
  }

  // Handle known operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}; 