import type { FastifyInstance } from 'fastify';
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicketStatus,
  assignTicket,
} from './ticket.controller.js';
import {
  createTicketSchema,
  ticketParamsSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  listTicketsQuerySchema,
} from './ticket.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export async function ticketRoutes(fastify: FastifyInstance) {
  // All ticket routes are protected
  fastify.addHook('preHandler', requireAuth);

  // POST /api/v1/tickets
  fastify.post('/', {
    schema: {
      body: createTicketSchema,
      tags: ['Tickets'],
      description: 'Create a new ticket',
    },
    handler: createTicket,
  });

  // GET /api/v1/tickets
  fastify.get('/', {
    schema: {
      querystring: listTicketsQuerySchema,
      tags: ['Tickets'],
      description: 'List tickets with filters and pagination',
    },
    handler: listTickets,
  });

  // GET /api/v1/tickets/:id
  fastify.get('/:id', {
    schema: {
      params: ticketParamsSchema,
      tags: ['Tickets'],
      description: 'Get ticket detail with comments, status history, and AI insights',
    },
    handler: getTicket,
  });

  // PATCH /api/v1/tickets/:id/status
  fastify.patch('/:id/status', {
    schema: {
      params: ticketParamsSchema,
      body: updateTicketStatusSchema,
      tags: ['Tickets'],
      description: 'Update ticket status (creates a status history record)',
    },
    handler: updateTicketStatus,
  });

  // PATCH /api/v1/tickets/:id/assign
  fastify.patch('/:id/assign', {
    schema: {
      params: ticketParamsSchema,
      body: assignTicketSchema,
      tags: ['Tickets'],
      description: 'Assign a ticket to an agent',
    },
    handler: assignTicket,
  });
}
