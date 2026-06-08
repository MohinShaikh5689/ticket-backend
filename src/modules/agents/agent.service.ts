import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { CreateAgentInput, ListAgentsQuery } from './agent.schema.js';
import { supabase } from '../../lib/supabase.js';

export class AgentService {
  async create(data: CreateAgentInput) {
    // Check if agent with this email already exists in DB
    const existing = await prisma.agent.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('An agent with this email already exists');
    }

    // Provision user in Supabase Auth using Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new ConflictError(authError?.message || 'Failed to create user in Supabase Auth');
    }

    return prisma.agent.create({
      data: {
        id: authData.user.id,
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });
  }

  async findAll(query: ListAgentsQuery) {
    const { page, pageSize, role, isActive } = query;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.agent.count({ where }),
    ]);

    return { agents, total, page, pageSize };
  }

  async findById(id: string) {
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedTickets: true,
            comments: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundError('Agent', id);
    }

    return agent;
  }

  async findBySupabaseUserId(supabaseUserId: string) {
    return this.findById(supabaseUserId);
  }
}

export const agentService = new AgentService();
