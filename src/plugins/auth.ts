import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { supabase } from '../lib/supabase.js';

/**
 * Auth plugin: extracts the Bearer token from Authorization header,
 * verifies it via Supabase, and decorates the request with `supabaseUser`.
 *
 * This runs on EVERY request. Public routes simply proceed with
 * `supabaseUser = null`. Protected routes add the `requireAuth` preHandler.
 */
export default fp(async function authPlugin(fastify: FastifyInstance) {
  // Decorate request with supabaseUser (null by default)
  fastify.decorateRequest('supabaseUser', null);

  // On every request, attempt to extract and verify the token
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token — leave supabaseUser as null
      return;
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        // Invalid token — leave supabaseUser as null
        // The requireAuth preHandler will reject if auth is required
        return;
      }

      request.supabaseUser = data.user;
    } catch {
      // Supabase call failed — leave supabaseUser as null
      request.log.warn('Failed to verify auth token with Supabase');
    }
  });
});
