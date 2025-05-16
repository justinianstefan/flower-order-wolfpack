import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import logger from '../shared/logger';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (err) {
      logger.error('Controller error (createOrder)', { error: err });
      next(err);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let status = req.query.status as string | undefined;
      if (status) {
        status = status.toLowerCase();
      }
      const orders = await this.orderService.getAllOrders(status as any);
      res.json(orders);
    } catch (err) {
      logger.error('Controller error (getAllOrders)', { error: err });
      next(err);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      res.json(order);
    } catch (err) {
      logger.error('Controller error (getOrderById)', { error: err });
      next(err);
    }
  };

  updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Standardized admin check using x-client-type header
      const isAdmin = req.headers['x-client-type'] === 'admin';
      try {
        const order = await this.orderService.updateOrder(req.params.id, req.body, isAdmin);
        res.json(order);
      } catch (err: any) {
        // If error is about invalid status transition, return allowed transitions
        if (err.message && err.message.includes('status update not allowed')) {
          const allowedTransitions = isAdmin
            ? {
                PENDING: ['confirmed', 'cancelled'],
                CONFIRMED: ['preparing', 'cancelled'],
                PREPARING: ['ready', 'cancelled'],
                READY: ['delivered', 'cancelled'],
                DELIVERED: ['cancelled'],
                CANCELLED: [],
              }
            : {
                PENDING: ['cancelled'],
                CONFIRMED: [],
                PREPARING: [],
                READY: [],
                DELIVERED: [],
                CANCELLED: [],
              };
          return res.status(400).json({
            error: err.message,
            allowedTransitions,
          });
        }
        throw err;
      }
    } catch (err) {
      logger.error('Controller error (updateOrder)', { error: err });
      next(err);
      return;
    }
    return null;
  };

  softDeleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ignoreState = req.query.ignoreState === 'true';
      await this.orderService.softDeleteOrder(req.params.id, ignoreState);
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
      logger.error('Controller error (softDeleteOrder)', { error: err });
      next(err);
      return;
    }
    return null;
  };
}
