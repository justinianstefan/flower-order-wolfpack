import { validate } from 'class-validator';
import { Order, OrderStatus, OrderItem } from './order.entity';
import { plainToInstance } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

describe('OrderItem Entity', () => {
  it('should validate a correct order item', async () => {
    const item = plainToInstance(OrderItem, {
      flowerId: 'f1',
      flowerName: 'Rose',
      price: 10,
      quantity: 2,
    });
    const errors = await validate(item);
    expect(errors.length).toBe(0);
  });

  it('should fail on empty flowerId', async () => {
    const item = plainToInstance(OrderItem, {
      flowerId: '',
      flowerName: 'Rose',
      price: 10,
      quantity: 2,
    });
    const errors = await validate(item);
    expect(errors.some(e => e.property === 'flowerId')).toBe(true);
  });

  it('should fail on empty flowerName', async () => {
    const item = plainToInstance(OrderItem, {
      flowerId: 'f1',
      flowerName: '',
      price: 10,
      quantity: 2,
    });
    const errors = await validate(item);
    expect(errors.some(e => e.property === 'flowerName')).toBe(true);
  });

  it('should fail on negative price', async () => {
    const item = plainToInstance(OrderItem, {
      flowerId: 'f1',
      flowerName: 'Rose',
      price: -10,
      quantity: 2,
    });
    const errors = await validate(item);
    expect(errors.some(e => e.property === 'price')).toBe(true);
  });

  it('should fail on zero quantity', async () => {
    const item = plainToInstance(OrderItem, {
      flowerId: 'f1',
      flowerName: 'Rose',
      price: 10,
      quantity: 0,
    });
    const errors = await validate(item);
    expect(errors.some(e => e.property === 'quantity')).toBe(true);
  });
});

describe('Order Entity', () => {
  it('should validate a correct order', async () => {
    const order = new Order();
    order.id = uuidv4();
    order.customerName = 'Alice';
    order.deliveryAddress = '123 Flower St';
    order.orderItems = plainToInstance(OrderItem, [
      { flowerId: 'f1', flowerName: 'Rose', price: 10, quantity: 2 },
      { flowerId: 'f2', flowerName: 'Tulip', price: 5, quantity: 3 },
    ]);
    order.totalAmount = 35;
    order.status = OrderStatus.PENDING;
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.deletedAt = null;
    const errors = await validate(order);
    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(errors, null, 2));
    }
    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing', async () => {
    const order = new Order();
    const errors = await validate(order);
    expect(errors.length).toBeGreaterThan(0);
    const fields = errors.map(e => e.property);
    expect(fields).toEqual(
      expect.arrayContaining([
        'customerName',
        'deliveryAddress',
        'orderItems',
        'totalAmount',
        'status',
      ])
    );
  });

  it('should fail for negative totalAmount', async () => {
    const order = new Order();
    order.customerName = 'Bob';
    order.deliveryAddress = '456 Flower Ave';
    order.orderItems = plainToInstance(OrderItem, [
      { flowerId: 'f1', flowerName: 'Rose', price: 10, quantity: 2 },
    ]);
    order.totalAmount = -10;
    order.status = OrderStatus.PENDING;
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.deletedAt = null;
    const errors = await validate(order);
    expect(errors.some(e => e.property === 'totalAmount')).toBe(true);
  });

  it('should allow empty orderItems (no validation error)', async () => {
    const order = new Order();
    order.customerName = 'Bob';
    order.deliveryAddress = '456 Flower Ave';
    order.orderItems = plainToInstance(OrderItem, []);
    order.totalAmount = 10;
    order.status = OrderStatus.PENDING;
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.deletedAt = null;
    const errors = await validate(order);
    expect(errors.some(e => e.property === 'orderItems')).toBe(false);
  });

  it('should fail for invalid status', async () => {
    const order = new Order();
    order.customerName = 'Bob';
    order.deliveryAddress = '456 Flower Ave';
    order.orderItems = plainToInstance(OrderItem, [
      { flowerId: 'f1', flowerName: 'Rose', price: 10, quantity: 2 },
    ]);
    order.totalAmount = 10;
    order.status = 'INVALID' as OrderStatus;
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.deletedAt = null;
    const errors = await validate(order);
    expect(errors.some(e => e.property === 'status')).toBe(true);
  });

  it('should allow null deletedAt for soft delete', async () => {
    const order = new Order();
    order.id = uuidv4();
    order.customerName = 'Alice';
    order.deliveryAddress = '123 Flower St';
    order.orderItems = plainToInstance(OrderItem, [
      { flowerId: 'f1', flowerName: 'Rose', price: 10, quantity: 2 },
    ]);
    order.totalAmount = 20;
    order.status = OrderStatus.CANCELLED;
    order.createdAt = new Date();
    order.updatedAt = new Date();
    order.deletedAt = null;
    const errors = await validate(order);
    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(errors, null, 2));
    }
    expect(errors.length).toBe(0);
  });
}); 