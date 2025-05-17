import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './data-source';
import logger from './shared/logger';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    await AppDataSource.initialize();
    logger.info('Database connection initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API documentation available at http://localhost:${PORT}/docs`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
