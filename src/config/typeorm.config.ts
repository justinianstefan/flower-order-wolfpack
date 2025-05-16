import { DataSource } from 'typeorm';
import { Order } from '../orders/order.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH || 'data/database.sqlite',
  entities: [Order],
  migrations: ['migration/*.ts'],
  synchronize: false,
  logging: false,
});
