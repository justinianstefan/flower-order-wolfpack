import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { AppDataSource } from '../data-source';
import { Order } from './order.entity';

const orderRepository = new OrderRepository(AppDataSource.getRepository(Order));
const orderService = new OrderService(orderRepository);
export const orderController = new OrderController(orderService); 