import { Order, OrderStatus, OrderItem } from './order.entity';
import { OrderRepository } from './order.repository';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import logger from '../shared/logger';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [], // locked
  [OrderStatus.CANCELLED]: [], // deletable (soft delete)
};

export class OrderService {
  constructor(private readonly orderRepo: OrderRepository) {}

  async createOrder(data: Partial<Order>): Promise<Order> {
    try {
      // Sanitize and validate input
      const orderItems = plainToInstance(OrderItem, data.orderItems || []);
      const order = plainToInstance(Order, {
        ...data,
        orderItems,
        status: OrderStatus.PENDING,
        totalAmount: this.calculateTotal(orderItems),
      });
      const errors = await validate(order);
      if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.log('VALIDATION ERRORS:', JSON.stringify(errors, null, 2));
        logger.error('Validation failed', { errors });
        throw new Error('Validation failed');
      }
      return this.orderRepo.createOrder(order);
    } catch (err) {
      logger.error('Error creating order', { error: err });
      throw err;
    }
  }

  async getAllOrders(status?: OrderStatus): Promise<Order[]> {
    try {
      return this.orderRepo.findAll(status);
    } catch (err) {
      logger.error('Error fetching orders', { error: err });
      throw err;
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const order = await this.orderRepo.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (err) {
      logger.error('Error fetching order by id', { error: err, id });
      throw err;
    }
  }

  async updateOrder(id: string, data: Partial<Order>, isAdmin = false): Promise<Order> {
    try {
      const order = await this.getOrderById(id);
      if (order.status === OrderStatus.DELIVERED) {
        throw new Error('Cannot update a delivered order');
      }
      if (order.status === OrderStatus.CANCELLED) {
        throw new Error('Cannot update a cancelled order');
      }
      // Admin can only update status
      if (isAdmin) {
        if (!data.status) throw new Error('Status is required for admin update');
        if (!allowedTransitions[order.status].includes(data.status)) {
          throw new Error(`Invalid status transition: ${order.status} -> ${data.status}`);
        }
        const updated = await this.orderRepo.updateOrder(id, { status: data.status });
        if (!updated) throw new Error('Order not found after update');
        return updated;
      } else {
        // iOS App: can update any field except status
        if (data.status && data.status !== order.status) {
          throw new Error('Status update not allowed from app');
        }
        let orderItems = order.orderItems;
        if (data.orderItems) {
          orderItems = plainToInstance(OrderItem, data.orderItems);
        }
        const update: Partial<Order> = {
          ...data,
          orderItems,
          totalAmount: this.calculateTotal(orderItems),
        };
        delete update.status;
        const updated = await this.orderRepo.updateOrder(id, update);
        if (!updated) throw new Error('Order not found after update');
        return updated;
      }
    } catch (err) {
      logger.error('Error updating order', { error: err, id, data });
      throw err;
    }
  }

  async softDeleteOrder(id: string, ignoreState = false): Promise<void> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }
    if (!ignoreState && order.status !== 'cancelled') {
      throw new Error('Only cancelled orders can be deleted');
    }
    await this.orderRepo.softDelete(id);
  }

  private calculateTotal(orderItems: OrderItem[]): number {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
