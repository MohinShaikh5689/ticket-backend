import type { FastifyInstance } from 'fastify';
import { createComment, listComments } from './comment.controller.js';
import {
  commentTicketParamsSchema,
  createCommentSchema,
  listCommentsQuerySchema,
} from './comment.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export async function commentRoutes(fastify: FastifyInstance) {
  // All comment routes are protected
  fastify.addHook('preHandler', requireAuth);

  // POST /api/v1/tickets/:ticketId/comments
  fastify.post('/', {
    schema: {
      params: commentTicketParamsSchema,
      body: createCommentSchema,
      tags: ['Comments'],
      description: 'Add a comment to a ticket',
    },
    handler: createComment,
  });

  // GET /api/v1/tickets/:ticketId/comments
  fastify.get('/', {
    schema: {
      params: commentTicketParamsSchema,
      querystring: listCommentsQuerySchema,
      tags: ['Comments'],
      description: 'List comments for a ticket',
    },
    handler: listComments,
  });
}
