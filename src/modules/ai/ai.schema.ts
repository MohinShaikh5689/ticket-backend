import { z } from 'zod';

export const aiTicketParamsSchema = z.object({
  ticketId: z.string().uuid(),
});

export const aiInsightParamsSchema = z.object({
  ticketId: z.string().uuid(),
  insightId: z.string().uuid(),
});

export const editInsightSchema = z.object({
  editedSummary: z.string().min(1),
});

export type AITicketParams = z.infer<typeof aiTicketParamsSchema>;
export type AIInsightParams = z.infer<typeof aiInsightParamsSchema>;
export type EditInsightInput = z.infer<typeof editInsightSchema>;
