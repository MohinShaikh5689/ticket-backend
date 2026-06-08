import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Global error handler plugin.
 * Catches all errors and returns standardized JSON responses.
 */
export default fp(async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      request.log.error(error);

      // Our custom application errors
      if (error instanceof AppError) {
        return sendError(reply, error.message, error.statusCode);
      }

      // Fastify validation errors (from Zod type provider)
      if (error.validation) {
        return sendError(reply, error.message, 400);
      }

      // Prisma known request errors
      if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error as any;
        if (prismaError.code === 'P2002') {
          const target = prismaError.meta?.target;
          return sendError(
            reply,
            `A record with that ${Array.isArray(target) ? target.join(', ') : 'value'} already exists`,
            409
          );
        }
        if (prismaError.code === 'P2025') {
          return sendError(reply, 'Record not found', 404);
        }
      }

      // Default: internal server error
      const message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message || 'Internal server error';

      return sendError(reply, message, error.statusCode || 500);
    }
  );
});
