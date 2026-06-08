import type { FastifyInstance } from 'fastify';
import { createCustomer, listCustomers, getCustomer } from './customer.controller.js';
import { createCustomerSchema, customerParamsSchema, listCustomersQuerySchema } from './customer.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export async function customerRoutes(fastify: FastifyInstance) {
  // All customer routes are protected
  fastify.addHook('preHandler', requireAuth);

  // POST /api/v1/customers
  fastify.post('/', {
    schema: {
      body: createCustomerSchema,
      tags: ['Customers'],
      description: 'Create a new customer',
    },
    handler: createCustomer,
  });

  // GET /api/v1/customers
  fastify.get('/', {
    schema: {
      querystring: listCustomersQuerySchema,
      tags: ['Customers'],
      description: 'List all customers with optional search',
    },
    handler: listCustomers,
  });

  // GET /api/v1/customers/:id
  fastify.get('/:id', {
    schema: {
      params: customerParamsSchema,
      tags: ['Customers'],
      description: 'Get customer details by ID',
    },
    handler: getCustomer,
  });
}
