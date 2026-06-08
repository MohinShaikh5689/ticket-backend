import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import type { CreateCustomerInput, ListCustomersQuery } from './customer.schema.js';

export class CustomerService {
  async create(data: CreateCustomerInput) {
    return prisma.customer.create({ data });
  }

  async findAll(query: ListCustomersQuery) {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { company: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total, page, pageSize };
  }

  async findById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError('Customer', id);
    }

    return customer;
  }
}

export const customerService = new CustomerService();
