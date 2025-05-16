import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const headerName = 'x-correlation-id';
  let correlationId = req.headers[headerName] as string;
  if (!correlationId) {
    correlationId = uuidv4();
    req.headers[headerName] = correlationId;
  }
  res.setHeader(headerName, correlationId);
  // Attach to request for logger
  (req as any).correlationId = correlationId;
  next();
}
