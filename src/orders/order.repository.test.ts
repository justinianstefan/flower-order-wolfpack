import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderRepository } from './order.repository';

describe('OrderRepository', () => {
  let dataSource: DataSource;
  let repo: Repository<Order>;
  let orderRepo: OrderRepository;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Order],
      synchronize: true,
      logging: false,
    });
    await dataSource.initialize();
    repo = dataSource.getRepository(Order);
    orderRepo = new OrderRepository(repo);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create and find an order', async () => {
    const order = await orderRepo.createOrder({
      customerName: 'Test',
      deliveryAddress: '123 Test St',
      orderItems: [
        { flowerId: 'f1', flowerName: 'Rose', price: 10, quantity: 2 },
      ],
      totalAmount: 20,
      status: OrderStatus.PENDING,
    });
    expect(order.id).toBeDefined();
    const found = await orderRepo.findById(order.id);
    expect(found).not.toBeNull();
    expect(found?.customerName).toBe('Test');
  });

  it('should update an order', async () => {
    const order = await orderRepo.createOrder({
      customerName: 'Update',
      deliveryAddress: '456 Test St',
      orderItems: [
        { flowerId: 'f2', flowerName: 'Tulip', price: 5, quantity: 1 },
      ],
      totalAmount: 5,
      status: OrderStatus.PENDING,
    });
    const updated = await orderRepo.updateOrder(order.id, { status: OrderStatus.CONFIRMED });
    expect(updated?.status).toBe(OrderStatus.CONFIRMED);
  });

  it('should find all orders', async () => {
    const all = await orderRepo.findAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });

  it('should filter by status', async () => {
    const confirmed = await orderRepo.findAll(OrderStatus.CONFIRMED);
    expect(confirmed.every(o => o.status === OrderStatus.CONFIRMED)).toBe(true);
  });

  it('should soft delete an order', async () => {
    const order = await orderRepo.createOrder({
      customerName: 'Delete',
      deliveryAddress: '789 Test St',
      orderItems: [
        { flowerId: 'f3', flowerName: 'Lily', price: 8, quantity: 1 },
      ],
      totalAmount: 8,
      status: OrderStatus.CANCELLED,
    });
    await orderRepo.softDelete(order.id);
    const found = await orderRepo.findById(order.id);
    expect(found).toBeNull();
  });
}); 