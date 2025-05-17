import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { Order, OrderStatus, OrderItem } from './order.entity';
import { plainToInstance } from 'class-transformer';

describe('OrderService', () => {
  let orderRepo: jest.Mocked<OrderRepository>;
  let service: OrderService;
  let order: Order;

  beforeEach(() => {
    orderRepo = {
      createOrder: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      updateOrder: jest.fn(),
      softDelete: jest.fn(),
    } as any;
    service = new OrderService(orderRepo);
    order = plainToInstance(Order, {
      customerName: 'Test',
      deliveryAddress: '123 Test St',
      orderItems: plainToInstance(OrderItem, [
        { flowerId: 'f1', flowerName: 'Rose', price: 10, quantity: 2 },
      ]),
      totalAmount: 20,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  });

  it('should create a valid order', async () => {
    orderRepo.createOrder.mockResolvedValue(order);
    const result = await service.createOrder({
      customerName: 'Test',
      deliveryAddress: '123 Test St',
      orderItems: [
        { flowerId: 'f1', flowerName: 'Rose', price: 10, quantity: 2 },
      ],
    });
    expect(result).toEqual(order);
  });

  it('should throw on invalid order', async () => {
    await expect(service.createOrder({})).rejects.toThrow('Validation failed');
  });

  it('should throw on invalid order items', async () => {
    await expect(service.createOrder({
      customerName: 'Test',
      deliveryAddress: '123 Test St',
      orderItems: [
        { flowerId: '', flowerName: '', price: -1, quantity: 0 },
      ],
    })).rejects.toThrow('Validation failed');
  });

  it('should get all orders', async () => {
    orderRepo.findAll.mockResolvedValue([order]);
    const result = await service.getAllOrders();
    expect(result).toEqual([order]);
  });

  it('should get order by id', async () => {
    orderRepo.findById.mockResolvedValue(order);
    const result = await service.getOrderById('1');
    expect(result).toEqual(order);
  });

  it('should throw if order not found', async () => {
    orderRepo.findById.mockResolvedValue(null);
    await expect(service.getOrderById('x')).rejects.toThrow('Order not found');
  });

  it('should update order as admin with valid transition', async () => {
    orderRepo.findById.mockResolvedValue(order);
    orderRepo.updateOrder.mockResolvedValue({ ...order, status: OrderStatus.CONFIRMED });
    const result = await service.updateOrder('1', { status: OrderStatus.CONFIRMED }, true);
    expect(result.status).toBe(OrderStatus.CONFIRMED);
  });

  it('should throw on invalid admin transition', async () => {
    orderRepo.findById.mockResolvedValue({ ...order, status: OrderStatus.DELIVERED });
    await expect(service.updateOrder('1', { status: OrderStatus.PREPARING }, true)).rejects.toThrow();
  });

  it('should update order as app (not status)', async () => {
    orderRepo.findById.mockResolvedValue(order);
    orderRepo.updateOrder.mockResolvedValue({ ...order, deliveryAddress: 'New Addr' });
    const result = await service.updateOrder('1', { deliveryAddress: 'New Addr' }, false);
    expect(result.deliveryAddress).toBe('New Addr');
  });

  it('should throw if app tries to update status', async () => {
    orderRepo.findById.mockResolvedValue(order);
    await expect(service.updateOrder('1', { status: OrderStatus.CONFIRMED }, false)).rejects.toThrow();
  });

  it('should throw if updating delivered order', async () => {
    orderRepo.findById.mockResolvedValue({ ...order, status: OrderStatus.DELIVERED });
    await expect(service.updateOrder('1', { deliveryAddress: 'New Addr' }, false)).rejects.toThrow();
  });

  it('should throw if updating cancelled order', async () => {
    orderRepo.findById.mockResolvedValue({ ...order, status: OrderStatus.CANCELLED });
    await expect(service.updateOrder('1', { deliveryAddress: 'New Addr' }, false)).rejects.toThrow();
  });

  it('should soft delete cancelled order', async () => {
    orderRepo.findById.mockResolvedValue({ ...order, status: OrderStatus.CANCELLED });
    orderRepo.softDelete.mockResolvedValue();
    await expect(service.softDeleteOrder('1')).resolves.toBeUndefined();
  });

  it('should throw if not cancelled on delete', async () => {
    orderRepo.findById.mockResolvedValue(order);
    await expect(service.softDeleteOrder('1')).rejects.toThrow('Only cancelled orders can be deleted');
  });
}); 