import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import type { CreateCommentInput, ListCommentsQuery } from './comment.schema.js';

export class CommentService {
  async create(ticketId: string, agentId: string, data: CreateCommentInput) {
    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    return prisma.comment.create({
      data: {
        content: data.content,
        isInternal: data.isInternal,
        ticketId,
        agentId,
      },
      include: {
        agent: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(ticketId: string, query: ListCommentsQuery) {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { ticketId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' },
        include: {
          agent: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.comment.count({ where: { ticketId } }),
    ]);

    return { comments, total, page, pageSize };
  }
}

export const commentService = new CommentService();
