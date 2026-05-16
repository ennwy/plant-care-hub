import swaggerJsdoc from 'swagger-jsdoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'plant-care-hub API',
      version: '1.0.0',
      description: 'REST API for plant-care-hub, university coursework (lab 6)',
    },
    servers: [{ url: 'http://localhost:3000', description: 'local dev' }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'plant.sid',
        },
      },
    },
  },
  apis: [path.join(__dirname, 'routes', '*.js')],
});
