import type { FastifyRequest, FastifyReply } from 'fastify';
import { ticketService } from './ticket.service.js';
import { agentService } from '../agents/agent.service.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import { ForbiddenError } from '../../utils/errors.js';
import type {
  CreateTicketInput,
  TicketParams,
  UpdateTicketStatusInput,
  AssignTicketInput,
  ListTicketsQuery,
} from './ticket.schema.js';

export async function createTicket(
  request: FastifyRequest<{ Body: CreateTicketInput }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticketData = { ...request.body };
  if (agent.role !== 'ADMIN') {
    ticketData.assignedAgentId = undefined;
  }

  const ticket = await ticketService.create(ticketData);
  sendSuccess(reply, ticket, 201);
}

export async function listTickets(
  request: FastifyRequest<{ Querystring: ListTicketsQuery }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const query = { ...request.query };
  if (agent.role !== 'ADMIN') {
    // Agents can only see tickets assigned to them
    query.assignedAgentId = agent.id;
  }

  const result = await ticketService.findAll(query);
  const meta = buildPaginationMeta(result.page, result.pageSize, result.total);
  sendSuccess(reply, result.tickets, 200, meta);
}

export async function getTicket(
  request: FastifyRequest<{ Params: TicketParams }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticket = await ticketService.findById(request.params.id);

  if (agent.role !== 'ADMIN' && ticket.assignedAgentId !== agent.id) {
    throw new ForbiddenError('You do not have permission to view this ticket');
  }

  sendSuccess(reply, ticket);
}

export async function updateTicketStatus(
  request: FastifyRequest<{ Params: TicketParams; Body: UpdateTicketStatusInput }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  const ticket = await ticketService.findById(request.params.id);

  if (agent.role !== 'ADMIN' && ticket.assignedAgentId !== agent.id) {
    throw new ForbiddenError('You do not have permission to update this ticket');
  }

  const updatedTicket = await ticketService.updateStatus(
    request.params.id,
    request.body,
    agent.id
  );
  sendSuccess(reply, updatedTicket);
}

export async function assignTicket(
  request: FastifyRequest<{ Params: TicketParams; Body: AssignTicketInput }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);

  if (agent.role !== 'ADMIN') {
    throw new ForbiddenError('Only administrators can assign tickets');
  }

  const ticket = await ticketService.assignAgent(request.params.id, request.body);
  sendSuccess(reply, ticket);
}
