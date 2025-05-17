import { AppDataSource } from './data-source';
import { Order, OrderStatus } from './orders/order.entity';
import logger from './shared/logger';

const sampleOrders = [
  {
    customerName: 'John Doe',
    deliveryAddress: '123 Main St, City',
    orderItems: [
      {
        flowerId: '1',
        flowerName: 'Red Rose',
        price: 2.99,
        quantity: 12,
      },
    ],
    totalAmount: 35.88,
    status: OrderStatus.PENDING,
  },
  {
    customerName: 'Jane Smith',
    deliveryAddress: '456 Oak Ave, Town',
    orderItems: [
      {
        flowerId: '2',
        flowerName: 'White Lily',
        price: 3.99,
        quantity: 6,
      },
      {
        flowerId: '3',
        flowerName: 'Yellow Tulip',
        price: 1.99,
        quantity: 8,
      },
    ],
    totalAmount: 41.86,
    status: OrderStatus.CONFIRMED,
  },
  {
    customerName: 'Bob Wilson',
    deliveryAddress: '789 Pine Rd, Village',
    orderItems: [
      {
        flowerId: '4',
        flowerName: 'Purple Orchid',
        price: 4.99,
        quantity: 3,
      },
    ],
    totalAmount: 14.97,
    status: OrderStatus.DELIVERED,
  },
];

async function seed() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized');

    // Clear existing data
    const orderRepository = AppDataSource.getRepository(Order);
    await orderRepository.clear();
    logger.info('Existing data cleared');

    // Insert sample orders
    for (const orderData of sampleOrders) {
      const order = orderRepository.create(orderData);
      await orderRepository.save(order);
    }
    logger.info('Sample orders inserted');

    // Close the connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');

    logger.info('Seeding completed successfully');
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seed();
}

export default seed; 