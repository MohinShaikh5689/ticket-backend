import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';

import authPlugin from './plugins/auth.js';
import errorHandlerPlugin from './plugins/errorHandler.js';

import { agentRoutes } from './modules/agents/agent.routes.js';
import { customerRoutes } from './modules/customers/customer.routes.js';
import { ticketRoutes } from './modules/tickets/ticket.routes.js';
import { commentRoutes } from './modules/comments/comment.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // Set Zod as the validator/serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // ─── Plugins ───────────────────────────────────────

  // CORS
  await fastify.register(cors, {
    origin: [env.FRONTEND_URL],
    credentials: true,
  });

  // Swagger (OpenAPI spec) — jsonSchemaTransform converts Zod schemas to JSON Schema
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Ticket System API',
        description: 'AI-Powered Support Ticket Dashboard Backend',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Supabase Auth JWT token',
          },
        },
      },
      security: [{ BearerAuth: [] }],
    },
    transform: jsonSchemaTransform,
  });

  // Swagger UI
  await fastify.register(fastifySwaggerUI, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Auth plugin (extracts + verifies Supabase JWT on every request)
  await fastify.register(authPlugin);

  // Global error handler
  await fastify.register(errorHandlerPlugin);

  // ─── Health Check ──────────────────────────────────

  fastify.get('/health', async () => {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Ticket System Backend',
    };
  });

  // ─── API Routes ────────────────────────────────────

  fastify.register(agentRoutes, { prefix: '/api/v1/agents' });
  fastify.register(customerRoutes, { prefix: '/api/v1/customers' });
  fastify.register(ticketRoutes, { prefix: '/api/v1/tickets' });

  // Nested routes under /api/v1/tickets/:ticketId
  fastify.register(commentRoutes, { prefix: '/api/v1/tickets/:ticketId/comments' });
  fastify.register(aiRoutes, { prefix: '/api/v1/tickets/:ticketId/ai' });

  return fastify;
}

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await buildApp();
  }
  await app.ready();
  app.server.emit('request', req, res);
}
