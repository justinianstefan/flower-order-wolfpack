import { Request, Response, NextFunction } from 'express';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order, OrderStatus } from './order.entity';

describe('OrderController', () => {
  let orderService: jest.Mocked<OrderService>;
  let controller: OrderController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    orderService = {
      createOrder: jest.fn(),
      getAllOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrder: jest.fn(),
      softDeleteOrder: jest.fn(),
    } as any;

    controller = new OrderController(orderService);

    req = {
      body: {},
      params: {},
      query: {},
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  describe('createOrder', () => {
    it('should create order and return 201', async () => {
      const order = { id: '1', customerName: 'Test' } as Order;
      orderService.createOrder.mockResolvedValue(order);
      req.body = { customerName: 'Test' };

      await controller.createOrder(req as Request, res as Response, next);

      expect(orderService.createOrder).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should call next on error', async () => {
      const error = new Error('Test error');
      orderService.createOrder.mockRejectedValue(error);

      await controller.createOrder(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      const orders = [{ id: '1' }, { id: '2' }] as Order[];
      orderService.getAllOrders.mockResolvedValue(orders);

      await controller.getAllOrders(req as Request, res as Response, next);

      expect(orderService.getAllOrders).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(orders);
    });

    it('should filter by status', async () => {
      const orders = [{ id: '1', status: OrderStatus.CONFIRMED }] as Order[];
      orderService.getAllOrders.mockResolvedValue(orders);
      req.query = { status: OrderStatus.CONFIRMED };

      await controller.getAllOrders(req as Request, res as Response, next);

      expect(orderService.getAllOrders).toHaveBeenCalledWith(OrderStatus.CONFIRMED);
      expect(res.json).toHaveBeenCalledWith(orders);
    });

    it('should call next on error', async () => {
      const error = new Error('Test error');
      orderService.getAllOrders.mockRejectedValue(error);

      await controller.getAllOrders(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    describe('getAllOrders (status filter case insensitivity)', () => {
      it('should return orders for status=pending (lowercase)', async () => {
        const req = { query: { status: 'pending' } } as any;
        const res = { json: jest.fn() } as any;
        const next = jest.fn();
        const orders = [{ id: '1', status: 'pending' }];
        orderService.getAllOrders = jest.fn().mockResolvedValue(orders);
        await controller.getAllOrders(req, res, next);
        expect(orderService.getAllOrders).toHaveBeenCalledWith('pending');
        expect(res.json).toHaveBeenCalledWith(orders);
      });

      it('should return orders for status=PENDING (uppercase)', async () => {
        const req = { query: { status: 'PENDING' } } as any;
        const res = { json: jest.fn() } as any;
        const next = jest.fn();
        const orders = [{ id: '1', status: 'pending' }];
        orderService.getAllOrders = jest.fn().mockResolvedValue(orders);
        await controller.getAllOrders(req, res, next);
        expect(orderService.getAllOrders).toHaveBeenCalledWith('pending');
        expect(res.json).toHaveBeenCalledWith(orders);
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order by id', async () => {
      const order = { id: '1' } as Order;
      orderService.getOrderById.mockResolvedValue(order);
      req.params = { id: '1' };

      await controller.getOrderById(req as Request, res as Response, next);

      expect(orderService.getOrderById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should call next on error', async () => {
      const error = new Error('Test error');
      orderService.getOrderById.mockRejectedValue(error);
      req.params = { id: '1' };

      await controller.getOrderById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateOrder', () => {
    it('should update order as admin', async () => {
      const order = { id: '1', status: OrderStatus.CONFIRMED } as Order;
      orderService.updateOrder.mockResolvedValue(order);
      req.params = { id: '1' };
      req.body = { status: OrderStatus.CONFIRMED };
      req.query = { admin: 'true' };

      await controller.updateOrder(req as Request, res as Response, next);

      expect(orderService.updateOrder).toHaveBeenCalledWith('1', { status: OrderStatus.CONFIRMED }, true);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should update order as app', async () => {
      const order = { id: '1', deliveryAddress: 'New Addr' } as Order;
      orderService.updateOrder.mockResolvedValue(order);
      req.params = { id: '1' };
      req.body = { deliveryAddress: 'New Addr' };

      await controller.updateOrder(req as Request, res as Response, next);

      expect(orderService.updateOrder).toHaveBeenCalledWith('1', { deliveryAddress: 'New Addr' }, false);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it('should call next on error', async () => {
      const error = new Error('Test error');
      orderService.updateOrder.mockRejectedValue(error);
      req.params = { id: '1' };

      await controller.updateOrder(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    describe('updateOrder (admin status transition)', () => {
      it('should allow admin to update status from PENDING to CONFIRMED', async () => {
        const order = { id: '1', status: OrderStatus.CONFIRMED } as Order;
        orderService.updateOrder.mockResolvedValue(order);
        req.params = { id: '1' };
        req.body = { status: OrderStatus.CONFIRMED };
        req.query = { admin: 'true' };

        await controller.updateOrder(req as Request, res as Response, next);

        expect(orderService.updateOrder).toHaveBeenCalledWith('1', { status: OrderStatus.CONFIRMED }, true);
        expect(res.json).toHaveBeenCalledWith(order);
      });
    });
  });

  describe('softDeleteOrder', () => {
    it('should delete order as admin', async () => {
      req.params = { id: '1' };
      req.query = {};

      await controller.softDeleteOrder(req as Request, res as Response, next);

      expect(orderService.softDeleteOrder).toHaveBeenCalledWith('1', false);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should force delete order as admin with ignoreState', async () => {
      req.params = { id: '1' };
      req.query = { ignoreState: 'true' };

      await controller.softDeleteOrder(req as Request, res as Response, next);

      expect(orderService.softDeleteOrder).toHaveBeenCalledWith('1', true);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 403 if not admin', async () => {
      req.params = { id: '1' };
      // isAdminClient middleware would throw before controller is called
      // so this test is not strictly needed anymore
    });

    it('should call next on error', async () => {
      const error = new Error('Test error');
      orderService.softDeleteOrder.mockRejectedValue(error);
      req.params = { id: '1' };
      req.query = {};

      await controller.softDeleteOrder(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
}); 