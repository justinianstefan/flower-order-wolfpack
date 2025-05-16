import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flower Order API',
      version: '1.0.0',
      description: 'API for managing flower orders with separate endpoints for admin and iOS clients',
      contact: {
        name: 'API Support',
        email: 'support@flowerorder.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        clientType: {
          type: 'apiKey',
          in: 'header',
          name: 'x-client-type',
          description: 'Client type header (admin or ios)',
        },
      },
    },
    security: [
      {
        clientType: [],
      },
    ],
  },
  apis: ['./src/orders/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI setup
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Flower Order API Documentation',
  }));

  // Swagger JSON endpoint
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}; 