import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import type { TicketStatus, TicketPriority } from '@prisma/client';
import type {
  CreateTicketInput,
  UpdateTicketStatusInput,
  AssignTicketInput,
  ListTicketsQuery,
} from './ticket.schema.js';

export class TicketService {
  async create(data: CreateTicketInput) {
    return prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as TicketPriority,
        customerId: data.customerId,
        assignedAgentId: data.assignedAgentId,
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(query: ListTicketsQuery) {
    const { page, pageSize, status, priority, assignedAgentId, customerId, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause from filters
    const where: any = {};

    if (status) {
      const statuses = status.split(',').map(s => s.trim()) as TicketStatus[];
      where.status = { in: statuses };
    }

    if (priority) {
      const priorities = priority.split(',').map(p => p.trim()) as TicketPriority[];
      where.priority = { in: priorities };
    }

    if (assignedAgentId) {
      where.assignedAgentId = assignedAgentId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, email: true, company: true } },
          assignedAgent: { select: { id: true, name: true, email: true } },
          _count: {
            select: { comments: true, aiInsights: true },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return { tickets, total, page, pageSize };
  }

  async findById(id: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedAgent: { select: { id: true, name: true, email: true, role: true } },
        comments: {
          include: {
            agent: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          include: {
            changedByAgent: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        aiInsights: {
          where: { isStale: false },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            editedByAgent: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket', id);
    }

    return ticket;
  }

  async updateStatus(id: string, data: UpdateTicketStatusInput, agentId: string) {
    // Get current ticket to record old status
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket', id);
    }

    const resolvedAt =
      data.status === 'RESOLVED' || data.status === 'CLOSED'
        ? new Date()
        : undefined;

    // Update ticket status and create history record in a transaction
    const [updatedTicket] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id },
        data: {
          status: data.status as TicketStatus,
          ...(resolvedAt && { resolvedAt }),
        },
        include: {
          customer: { select: { id: true, name: true } },
          assignedAgent: { select: { id: true, name: true } },
        },
      }),
      prisma.ticketStatusHistory.create({
        data: {
          ticketId: id,
          oldStatus: ticket.status,
          newStatus: data.status as TicketStatus,
          changedByAgentId: agentId,
          reason: data.reason,
        },
      }),
    ]);

    return updatedTicket;
  }

  async assignAgent(id: string, data: AssignTicketInput) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      throw new NotFoundError('Ticket', id);
    }

    return prisma.ticket.update({
      where: { id },
      data: { assignedAgentId: data.agentId },
      include: {
        customer: { select: { id: true, name: true } },
        assignedAgent: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

export const ticketService = new TicketService();
