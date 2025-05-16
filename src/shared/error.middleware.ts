import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err.message, { correlationId: (req as any).correlationId });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
}
