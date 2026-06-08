import { z } from 'zod';

// ─── Request Schemas ───────────────────────────────────

export const createTicketSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
  customerId: z.string().uuid(),
  assignedAgentId: z.string().uuid().optional(),
});

export const ticketParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED']),
  reason: z.string().max(500).optional(),
});

export const assignTicketSchema = z.object({
  agentId: z.string().uuid(),
});

export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.string().optional(), // Comma-separated: "OPEN,IN_PROGRESS"
  priority: z.string().optional(), // Comma-separated: "HIGH,CRITICAL"
  assignedAgentId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ─── Types ─────────────────────────────────────────────

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketParams = z.infer<typeof ticketParamsSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
