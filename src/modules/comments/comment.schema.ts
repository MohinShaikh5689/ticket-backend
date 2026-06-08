import { z } from 'zod';

export const commentTicketParamsSchema = z.object({
  ticketId: z.string().uuid(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().optional().default(true),
});

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type CommentTicketParams = z.infer<typeof commentTicketParamsSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
