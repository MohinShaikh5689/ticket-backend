import type { FastifyInstance } from 'fastify';
import { createAgent, listAgents, getAgent, getMe } from './agent.controller.js';
import { createAgentSchema, agentParamsSchema, listAgentsQuerySchema } from './agent.schema.js';
import { requireAuth } from '../../middleware/requireAuth.js';

export async function agentRoutes(fastify: FastifyInstance) {
  // POST /api/v1/agents — Create/register an agent (protected)
  fastify.post('/', {
    preHandler: [requireAuth],
    schema: {
      body: createAgentSchema,
      tags: ['Agents'],
      description: 'Create a new agent (links a Supabase user to an Agent record)',
    },
    handler: createAgent,
  });

  // GET /api/v1/agents/me — Get current agent profile (protected)
  fastify.get('/me', {
    preHandler: [requireAuth],
    schema: {
      tags: ['Agents'],
      description: 'Get the current authenticated agent profile',
    },
    handler: getMe,
  });

  // GET /api/v1/agents — List all agents (protected)
  fastify.get('/', {
    preHandler: [requireAuth],
    schema: {
      querystring: listAgentsQuerySchema,
      tags: ['Agents'],
      description: 'List all agents with optional filters',
    },
    handler: listAgents,
  });

  // GET /api/v1/agents/:id — Get agent by ID (protected)
  fastify.get('/:id', {
    preHandler: [requireAuth],
    schema: {
      params: agentParamsSchema,
      tags: ['Agents'],
      description: 'Get agent details by ID',
    },
    handler: getAgent,
  });
}
