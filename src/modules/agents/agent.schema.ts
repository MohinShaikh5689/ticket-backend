import { z } from 'zod';

// ─── Request Schemas ───────────────────────────────────

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'AGENT']).optional().default('AGENT'),
});

export const agentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listAgentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  role: z.enum(['ADMIN', 'AGENT']).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ─── Types ─────────────────────────────────────────────

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type AgentParams = z.infer<typeof agentParamsSchema>;
export type ListAgentsQuery = z.infer<typeof listAgentsQuerySchema>;
