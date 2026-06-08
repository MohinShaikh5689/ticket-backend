import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
});

export const customerParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listCustomersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CustomerParams = z.infer<typeof customerParamsSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
