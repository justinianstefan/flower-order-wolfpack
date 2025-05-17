import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const correlationId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use existing correlation ID from header or generate new one
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  
  // Add correlation ID to request for internal use
  req.headers['x-correlation-id'] = correlationId;
  
  // Add correlation ID to response headers
  res.setHeader('x-correlation-id', correlationId);
  
  next();
}; 