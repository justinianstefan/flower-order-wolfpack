import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { setupSwagger } from './swagger';
import { createOrderRouter } from './orders/order.routes';
import { orderController } from './orders/order.controller.instance';
import { errorHandler } from './middleware/error-handler';
import { correlationId } from './middleware/correlation-id';
import logger from './shared/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Request tracking
app.use(correlationId);

// Body parsing
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', createOrderRouter(orderController));

// Swagger documentation
setupSwagger(app);

// Error handling
app.use(errorHandler);

export default app;
