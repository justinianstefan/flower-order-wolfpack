import { AppDataSource } from './data-source';
import logger from './shared/logger';

async function initializeDatabase() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    logger.info('Database connection initialized');

    // Run migrations
    if (process.env.NODE_ENV !== 'production') {
      await AppDataSource.runMigrations();
      logger.info('Migrations completed');
    }

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
      logger.info('Logs directory created');
    }

    logger.info('Database initialization completed');
  } catch (error) {
    logger.error('Error during database initialization:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase; 