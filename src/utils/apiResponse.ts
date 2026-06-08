import type { FastifyReply } from 'fastify';
import type { ApiResponse, PaginationMeta } from '../types/index.js';

/**
 * Send a successful response with the standard envelope.
 */
export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode: number = 200,
  meta?: PaginationMeta
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };
  reply.status(statusCode).send(response);
}

/**
 * Send an error response with the standard envelope.
 */
export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode: number = 500
): void {
  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error: message,
  };
  reply.status(statusCode).send(response);
}

/**
 * Build pagination metadata from query params and total count.
 */
export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
