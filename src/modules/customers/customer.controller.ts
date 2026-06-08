import type { FastifyRequest, FastifyReply } from 'fastify';
import { customerService } from './customer.service.js';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse.js';
import type { CreateCustomerInput, CustomerParams, ListCustomersQuery } from './customer.schema.js';

export async function createCustomer(
  request: FastifyRequest<{ Body: CreateCustomerInput }>,
  reply: FastifyReply
) {
  const customer = await customerService.create(request.body);
  sendSuccess(reply, customer, 201);
}

export async function listCustomers(
  request: FastifyRequest<{ Querystring: ListCustomersQuery }>,
  reply: FastifyReply
) {
  const result = await customerService.findAll(request.query);
  const meta = buildPaginationMeta(result.page, result.pageSize, result.total);
  sendSuccess(reply, result.customers, 200, meta);
}

export async function getCustomer(
  request: FastifyRequest<{ Params: CustomerParams }>,
  reply: FastifyReply
) {
  const customer = await customerService.findById(request.params.id);
  sendSuccess(reply, customer);
}
