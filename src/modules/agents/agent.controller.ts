import type { FastifyRequest, FastifyReply } from 'fastify';
import { agentService } from './agent.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { buildPaginationMeta } from '../../utils/apiResponse.js';
import { ForbiddenError } from '../../utils/errors.js';
import type { CreateAgentInput, AgentParams, ListAgentsQuery } from './agent.schema.js';

export async function createAgent(
  request: FastifyRequest<{ Body: CreateAgentInput }>,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const currentAgent = await agentService.findById(supabaseUser.id);

  if (currentAgent.role !== 'ADMIN') {
    throw new ForbiddenError('Only administrators can create agents');
  }

  const agent = await agentService.create(request.body);
  sendSuccess(reply, agent, 201);
}

export async function listAgents(
  request: FastifyRequest<{ Querystring: ListAgentsQuery }>,
  reply: FastifyReply
) {
  const result = await agentService.findAll(request.query);
  const meta = buildPaginationMeta(result.page, result.pageSize, result.total);
  sendSuccess(reply, result.agents, 200, meta);
}

export async function getAgent(
  request: FastifyRequest<{ Params: AgentParams }>,
  reply: FastifyReply
) {
  const agent = await agentService.findById(request.params.id);
  sendSuccess(reply, agent);
}

export async function getMe(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const supabaseUser = request.supabaseUser!;
  const agent = await agentService.findById(supabaseUser.id);
  sendSuccess(reply, agent);
}
