import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';

export const isAdminClient = (req: Request, res: Response, next: NextFunction) => {
  const clientType = req.headers['x-client-type'];
  
  if (clientType !== 'admin') {
    throw new AppError(401, 'Unauthorized - Admin access required');
  }
  
  next();
};

export const isIOSClient = (req: Request, res: Response, next: NextFunction) => {
  const clientType = req.headers['x-client-type'];
  
  if (clientType !== 'ios') {
    throw new AppError(401, 'Unauthorized - iOS access required');
  }
  
  next();
}; 