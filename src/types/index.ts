import type { User } from '@supabase/supabase-js';

// Augment Fastify request with our custom properties
declare module 'fastify' {
  interface FastifyRequest {
    supabaseUser: User | null;
  }
}

// Standardized API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Re-export commonly used enums to keep in sync with Prisma
export type {
  TicketStatus,
  TicketPriority,
  AgentRole,
  Sentiment,
} from '@prisma/client';
