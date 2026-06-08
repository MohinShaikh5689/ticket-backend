import type { FastifyRequest, FastifyReply } from 'fastify';
import { commentService } from './comment.service.js';
import { agentService } from '../agents/agent.service.js';
import { ticketService } from '../tickets/ticket.service.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import { ForbiddenError } from '../../utils/errors.js';
import type { CommentTicketParams, CreateCommentInput, ListCommentsQuery } from './comment.schema.js';

export async function createComment(
  request: FastifyRequest<{ Params: CommentTicketParams; Body: CreateCommentInput }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticket = await ticketService.findById(request.params.ticketId);
  if (agent.role !== 'ADMIN' && ticket.assignedAgentId !== agent.id) {
    throw new ForbiddenError('You do not have permission to comment on this ticket');
  }

  const comment = await commentService.create(
    request.params.ticketId,
    agent.id,
    request.body
  );
  sendSuccess(reply, comment, 201);
}

export async function listComments(
  request: FastifyRequest<{ Params: CommentTicketParams; Querystring: ListCommentsQuery }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticket = await ticketService.findById(request.params.ticketId);
  if (agent.role !== 'ADMIN' && ticket.assignedAgentId !== agent.id) {
    throw new ForbiddenError('You do not have permission to view comments on this ticket');
  }

  const result = await commentService.findAll(request.params.ticketId, request.query);
  const meta = buildPaginationMeta(result.page, result.pageSize, result.total);
  sendSuccess(reply, result.comments, 200, meta);
}
