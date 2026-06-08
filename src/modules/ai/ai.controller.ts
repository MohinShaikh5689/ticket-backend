import type { FastifyRequest, FastifyReply } from 'fastify';
import { aiService } from './ai.service.js';
import { agentService } from '../agents/agent.service.js';
import { ticketService } from '../tickets/ticket.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { ForbiddenError } from '../../utils/errors.js';
import type { AITicketParams, AIInsightParams, EditInsightInput } from './ai.schema.js';

export async function generateInsight(
  request: FastifyRequest<{ Params: AITicketParams }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticket = await ticketService.findById(request.params.ticketId);
  if (agent.role !== 'ADMIN' && ticket.assignedAgentId !== agent.id) {
    throw new ForbiddenError('You do not have permission to generate AI insights for this ticket');
  }

  const insight = await aiService.generateInsight(request.params.ticketId);
  sendSuccess(reply, insight, 201);
}

export async function getLatestInsight(
  request: FastifyRequest<{ Params: AITicketParams }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticket = await ticketService.findById(request.params.ticketId);
  if (agent.role !== 'ADMIN' && ticket.assignedAgentId !== agent.id) {
    throw new ForbiddenError('You do not have permission to view AI insights for this ticket');
  }

  const insight = await aiService.getLatestInsight(request.params.ticketId);
  sendSuccess(reply, insight);
}

export async function editInsight(
  request: FastifyRequest<{ Params: AIInsightParams; Body: EditInsightInput }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticket = await ticketService.findById(request.params.ticketId);
  if (agent.role !== 'ADMIN' && ticket.assignedAgentId !== agent.id) {
    throw new ForbiddenError('You do not have permission to edit AI insights for this ticket');
  }

  const insight = await aiService.editInsight(
    request.params.insightId,
    agent.id,
    request.body
  );
  sendSuccess(reply, insight);
}
