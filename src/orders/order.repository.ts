import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';

export class OrderRepository {
  constructor(private readonly repo: Repository<Order>) {}

  async createOrder(order: Partial<Order>): Promise<Order> {
    const newOrder = this.repo.create(order);
    return this.repo.save(newOrder);
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    if (status) {
      return this.repo.find({ where: { status } });
    }
    return this.repo.find();
  }

  async findById(id: string): Promise<Order | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateOrder(id: string, update: Partial<Order>): Promise<Order | null> {
    await this.repo.update(id, update);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
