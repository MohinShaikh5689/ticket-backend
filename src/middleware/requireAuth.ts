import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * preHandler hook that rejects unauthenticated requests.
 * Use on protected routes: `{ preHandler: [requireAuth] }`
 */
export async function requireAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  if (!request.supabaseUser) {
    throw new UnauthorizedError('Valid authentication token required');
  }
}
