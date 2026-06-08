import type { FastifyInstance } from 'fastify';
import { generateInsight, getLatestInsight, editInsight } from './ai.controller.js';
import { aiTicketParamsSchema, aiInsightParamsSchema, editInsightSchema } from './ai.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export async function aiRoutes(fastify: FastifyInstance) {
  // All AI routes are protected
  fastify.addHook('preHandler', requireAuth);

  // POST /api/v1/tickets/:ticketId/ai/generate
  fastify.post('/generate', {
    schema: {
      params: aiTicketParamsSchema,
      tags: ['AI Insights'],
      description: 'Generate (or regenerate) an AI insight for a ticket',
    },
    handler: generateInsight,
  });

  // GET /api/v1/tickets/:ticketId/ai
  fastify.get('/', {
    schema: {
      params: aiTicketParamsSchema,
      tags: ['AI Insights'],
      description: 'Get the latest AI insight for a ticket',
    },
    handler: getLatestInsight,
  });

  // PATCH /api/v1/tickets/:ticketId/ai/:insightId
  fastify.patch('/:insightId', {
    schema: {
      params: aiInsightParamsSchema,
      body: editInsightSchema,
      tags: ['AI Insights'],
      description: 'Edit an AI insight (agent override)',
    },
    handler: editInsight,
  });
}
